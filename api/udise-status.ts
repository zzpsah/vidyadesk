const UDISE_STATUS_PATH = "/rc/v1/integrations/vidyadesk/udise-status";
const UDISE_STATUS_HOST = "oracle-server.tail2b7fe2.ts.net";
const UDISE_SCOPE = {
  schoolKey: "umv-tetahali",
  schoolName: "UMV Tetahali",
  udiseCode: "10160203806",
} as const;
const STATUSES = [
  "queued", "running", "awaiting_input", "awaiting_confirmation",
  "completed", "failed", "cancelled",
] as const;
const STAGES = ["students", "snapshot", "completion", "gp", "ep", "facility", "finalize"] as const;
const UPSTREAM_TIMEOUT_MS = 6_000;

type ProxyEnv = Record<string, string | undefined>;
type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isCount(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) >= 0;
}
function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
}
function validCounts(value: unknown, keys: readonly string[]): value is Record<string, number> {
  return isRecord(value) && hasExactKeys(value, keys) && keys.every(key => isCount(value[key]));
}
function isUdiseStatus(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value) || !hasExactKeys(value, [
    "contractVersion", "ok", "service", "scope", "totalJobs", "byStatus", "byStage",
    "unknownStatusCount", "unknownStageCount", "staleQueued", "staleRunning",
    "latestJobAt", "retrievedAt",
  ])) return false;
  if (value.contractVersion !== "1.0.0" || value.service !== "udise-control" || typeof value.ok !== "boolean") return false;
  if (!isRecord(value.scope) || !hasExactKeys(value.scope, ["schoolKey", "schoolName", "udiseCode"])
    || value.scope.schoolKey !== UDISE_SCOPE.schoolKey || value.scope.schoolName !== UDISE_SCOPE.schoolName
    || value.scope.udiseCode !== UDISE_SCOPE.udiseCode) return false;
  if (!isCount(value.totalJobs) || !isCount(value.unknownStatusCount) || !isCount(value.unknownStageCount)
    || !isCount(value.staleQueued) || !isCount(value.staleRunning) || !isCount(value.retrievedAt)) return false;
  if (value.latestJobAt !== null && !isCount(value.latestJobAt)) return false;
  if (!validCounts(value.byStatus, STATUSES) || !validCounts(value.byStage, STAGES)) return false;
  const statusTotal = Object.values(value.byStatus).reduce((sum, count) => sum + count, 0);
  const stageTotal = Object.values(value.byStage).reduce((sum, count) => sum + count, 0);
  const healthy = value.unknownStatusCount === 0 && value.unknownStageCount === 0
    && value.staleQueued === 0 && value.staleRunning === 0;
  return statusTotal + value.unknownStatusCount === value.totalJobs
    && stageTotal + value.unknownStageCount === value.totalJobs
    && value.ok === healthy;
}

function json(status: number, payload: Record<string, unknown>): Response {
  return Response.json(payload, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}

/** Server-only proxy through the existing /rc Funnel path; disabled by default. */
export async function handleUdiseStatusRequest(
  request: Request,
  env: ProxyEnv = process.env,
  fetcher: Fetcher = fetch,
): Promise<Response> {
  if (request.method !== "GET") {
    return new Response(null, {
      status: 405,
      headers: { Allow: "GET", "Cache-Control": "no-store" },
    });
  }
  if (env.VIDYADESK_UDISE_STATUS_ENABLED !== "true") {
    return json(503, { ok: false, error: "integration_not_activated" });
  }
  const endpoint = env.REPORT_CENTRAL_UDISE_STATUS_URL || "";
  const token = env.REPORT_CENTRAL_VIDYADESK_UDISE_STATUS_READ_TOKEN || "";
  if (!endpoint || !token) return json(503, { ok: false, error: "integration_not_configured" });

  let upstreamUrl: URL;
  try {
    upstreamUrl = new URL(endpoint);
  } catch {
    return json(503, { ok: false, error: "integration_not_configured" });
  }
  if (upstreamUrl.protocol !== "https:" || upstreamUrl.hostname !== UDISE_STATUS_HOST
    || upstreamUrl.port || upstreamUrl.username || upstreamUrl.password
    || upstreamUrl.search || upstreamUrl.hash || upstreamUrl.pathname !== UDISE_STATUS_PATH) {
    return json(503, { ok: false, error: "integration_not_configured" });
  }

  try {
    const upstream = await fetcher(upstreamUrl, {
      method: "GET",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    if (!upstream.ok) return json(502, { ok: false, error: "provider_unavailable" });
    let payload: unknown;
    try {
      payload = await upstream.json();
    } catch {
      return json(502, { ok: false, error: "provider_response_invalid" });
    }
    if (!isUdiseStatus(payload)) return json(502, { ok: false, error: "provider_contract_mismatch" });
    return json(200, payload);
  } catch {
    return json(502, { ok: false, error: "provider_unavailable" });
  }
}

export const config = { runtime: "edge" };

export default function handler(request: Request): Promise<Response> {
  return handleUdiseStatusRequest(request);
}

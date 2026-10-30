const REPORT_CENTRAL_CONTRACT_VERSION = '1.0.0';
const REPORT_CENTRAL_SCOPE = {
  schoolKey: 'umv-tetahali',
  schoolName: 'UCHCH MADHYAMIK VIDYALAY, TETAHALI',
  academicSession: '2026-2027',
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).every(key => keys.includes(key)) && keys.every(key => Object.hasOwn(value, key));
}
function isTimestamp(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && Number.isFinite(Date.parse(value));
}
function isNullableTimestamp(value: unknown): value is string | null {
  return value === null || isTimestamp(value);
}
function isCount(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) >= 0;
}
function isReportCentralAggregate(value: unknown): boolean {
  if (!isRecord(value) || !hasOnlyKeys(value, ['overview', 'sourceComparison', 'conflictSummary', 'importAudit'])) return false;
  const overview = value.overview;
  if (!isRecord(overview) || !hasOnlyKeys(overview, ['currentSnapshots', 'failedSnapshots', 'openConflicts', 'lastSuccessfulSnapshotAt'])
    || !isCount(overview.currentSnapshots) || !isCount(overview.failedSnapshots) || !isCount(overview.openConflicts)
    || !isNullableTimestamp(overview.lastSuccessfulSnapshotAt)) return false;

  const comparison = value.sourceComparison;
  if (!isRecord(comparison) || !hasOnlyKeys(comparison, ['sources']) || !Array.isArray(comparison.sources)
    || comparison.sources.length !== 2) return false;
  const seen = new Set<string>();
  for (const source of comparison.sources) {
    if (!isRecord(source) || !hasOnlyKeys(source, ['sourceId', 'currentSnapshotCount', 'lastSnapshotAt', 'academicSession'])
      || (source.sourceId !== 'udise' && source.sourceId !== 'eshikshakosh')
      || seen.has(String(source.sourceId)) || !isCount(source.currentSnapshotCount)
      || !isNullableTimestamp(source.lastSnapshotAt) || source.academicSession !== REPORT_CENTRAL_SCOPE.academicSession) return false;
    seen.add(String(source.sourceId));
  }
  if (!seen.has('udise') || !seen.has('eshikshakosh')) return false;

  const conflicts = value.conflictSummary;
  if (!isRecord(conflicts) || !hasOnlyKeys(conflicts, ['openTotal', 'bySeverity']) || !isRecord(conflicts.bySeverity)
    || !hasOnlyKeys(conflicts.bySeverity, ['error', 'warning', 'info']) || !isCount(conflicts.openTotal)
    || !isCount(conflicts.bySeverity.error) || !isCount(conflicts.bySeverity.warning) || !isCount(conflicts.bySeverity.info)
    || conflicts.openTotal !== Number(conflicts.bySeverity.error) + Number(conflicts.bySeverity.warning) + Number(conflicts.bySeverity.info)) return false;

  const audit = value.importAudit;
  return isRecord(audit) && hasOnlyKeys(audit, ['attempts', 'succeeded', 'failed', 'ignoredDuplicates', 'latestAttemptAt', 'historyCoverage'])
    && isCount(audit.attempts) && isCount(audit.succeeded) && isCount(audit.failed) && isCount(audit.ignoredDuplicates)
    && Number(audit.succeeded) + Number(audit.failed) <= Number(audit.attempts)
    && isNullableTimestamp(audit.latestAttemptAt) && audit.historyCoverage === 'school_scoped_records_only';
}
function isReportCentralEnvelope(value: unknown): value is Record<string, unknown> & { scope: typeof REPORT_CENTRAL_SCOPE } {
  if (!isRecord(value) || !hasOnlyKeys(value, ['contractVersion', 'sourceSystem', 'scope', 'retrievedAt', 'snapshot', 'data'])
    || !isRecord(value.scope) || !hasOnlyKeys(value.scope, ['schoolKey', 'schoolName', 'academicSession'])
    || !isRecord(value.snapshot) || !hasOnlyKeys(value.snapshot, ['id', 'version', 'createdAt'])) return false;
  return value.contractVersion === REPORT_CENTRAL_CONTRACT_VERSION && value.sourceSystem === 'report-central'
    && value.scope.schoolKey === REPORT_CENTRAL_SCOPE.schoolKey && value.scope.schoolName === REPORT_CENTRAL_SCOPE.schoolName
    && value.scope.academicSession === REPORT_CENTRAL_SCOPE.academicSession && isTimestamp(value.retrievedAt)
    && typeof value.snapshot.id === 'string' && value.snapshot.id.trim().length > 0
    && isCount(value.snapshot.version) && value.snapshot.version > 0
    && isTimestamp(value.snapshot.createdAt) && isReportCentralAggregate(value.data);
}

const AGGREGATE_PATH = "/v1/integrations/vidyadesk/aggregate";
const ALLOWED_AGGREGATE_PATHS = new Set([AGGREGATE_PATH, `/rc${AGGREGATE_PATH}`]);
const DEFAULT_ALLOWED_ORIGIN = "https://shikshakosh.vercel.app";
const UPSTREAM_TIMEOUT_MS = 8_000;

type ProxyEnv = Record<string, string | undefined>;
type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

function response(
  status: number,
  payload: Record<string, unknown>,
  headers: HeadersInit,
): Response {
  return Response.json(payload, { status, headers });
}

/**
 * Public, read-only proxy for the fixed UMV Tetahali aggregate endpoint.
 *
 * The upstream service token is server-only. The public feature flag is off
 * unless explicitly enabled after the provider and data-publication reviews.
 * CORS limits browser origins but is not treated as authentication.
 */
export async function handleReportCentralRequest(
  request: Request,
  env: ProxyEnv = process.env,
  fetcher: Fetcher = fetch,
): Promise<Response> {
  const origin = request.headers.get("origin");
  const allowedOrigin = env.VIDYADESK_ALLOWED_ORIGIN || DEFAULT_ALLOWED_ORIGIN;
  const originAllowed = !origin || origin === allowedOrigin;
  const headers = new Headers({
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Vary": "Origin",
  });
  if (origin && originAllowed) {
    headers.set("Access-Control-Allow-Origin", allowedOrigin);
    headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Accept, Content-Type");
  }

  if (!originAllowed) {
    return response(403, { ok: false, error: "origin_not_allowed" }, headers);
  }
  if (request.method === "OPTIONS") {
    headers.set("Access-Control-Max-Age", "600");
    return new Response(null, { status: 204, headers });
  }
  if (request.method !== "GET") {
    headers.set("Allow", "GET, OPTIONS");
    return response(405, { ok: false, error: "method_not_allowed" }, headers);
  }

  if (env.VIDYADESK_REPORT_CENTRAL_ENABLED !== "true") {
    return response(503, {
      ok: false,
      error: "integration_not_activated",
      message: "The Report Central aggregate connection is not enabled.",
    }, headers);
  }

  const endpoint = env.REPORT_CENTRAL_AGGREGATE_URL || "";
  const token = env.REPORT_CENTRAL_VIDYADESK_READ_TOKEN || "";
  if (!endpoint || !token) {
    return response(503, { ok: false, error: "integration_not_configured" }, headers);
  }

  let upstreamUrl: URL;
  try {
    upstreamUrl = new URL(endpoint);
  } catch {
    return response(503, { ok: false, error: "integration_not_configured" }, headers);
  }
  if (upstreamUrl.protocol !== "https:" || upstreamUrl.username || upstreamUrl.password
    || upstreamUrl.search || upstreamUrl.hash || !ALLOWED_AGGREGATE_PATHS.has(upstreamUrl.pathname)) {
    return response(503, { ok: false, error: "integration_not_configured" }, headers);
  }

  try {
    const upstream = await fetcher(upstreamUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });

    if (upstream.status === 409) {
      return response(503, { ok: false, error: "provider_scope_pending" }, headers);
    }
    if (!upstream.ok) {
      return response(502, { ok: false, error: "provider_unavailable" }, headers);
    }

    let payload: unknown;
    try {
      payload = await upstream.json();
    } catch {
      return response(502, { ok: false, error: "provider_response_invalid" }, headers);
    }

    if (!isReportCentralEnvelope(payload)
      || payload.scope.schoolKey !== REPORT_CENTRAL_SCOPE.schoolKey
      || payload.scope.academicSession !== REPORT_CENTRAL_SCOPE.academicSession) {
      return response(502, { ok: false, error: "provider_contract_mismatch" }, headers);
    }

    headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
    return response(200, payload as Record<string, unknown>, headers);
  } catch {
    return response(502, { ok: false, error: "provider_unavailable" }, headers);
  }
}

export const config = { runtime: "edge" };

export default function handler(request: Request): Promise<Response> {
  return handleReportCentralRequest(request);
}

import {
  REPORT_CENTRAL_SCOPE,
  isReportCentralAggregate,
  isReportCentralEnvelope,
} from "../core/report-central-contract.ts";

const AGGREGATE_PATH = "/v1/integrations/vidyadesk/aggregate";
const ALLOWED_AGGREGATE_PATHS = new Set([AGGREGATE_PATH, `/rc${AGGREGATE_PATH}`]);
const DEFAULT_ALLOWED_ORIGIN = "https://zzpsah.github.io";
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

    if (!isReportCentralEnvelope(payload, isReportCentralAggregate)
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

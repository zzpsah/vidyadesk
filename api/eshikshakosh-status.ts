function isEshikshakoshStatusPayload(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const v = value as Record<string, any>;
  const keys = ['contractVersion','ok','service','scope','totalJobs','byStatus','staleQueued','staleRunning','latestJobAt','retrievedAt'];
  const statuses = ['queued','running','done','failed','other'];
  const count = (n: unknown) => Number.isSafeInteger(n) && Number(n) >= 0;
  if (Object.keys(v).length !== keys.length || keys.some(k => !(k in v))) return false;
  if (v.contractVersion !== '1.0.0' || v.service !== 'eshikshakosh-jobserver' || typeof v.ok !== 'boolean') return false;
  if (!v.scope || Object.keys(v.scope).length !== 2 || v.scope.schoolKey !== 'umv-tetahali' || v.scope.udiseCode !== '10160203806') return false;
  if (![v.totalJobs,v.staleQueued,v.staleRunning,v.retrievedAt].every(count) || (v.latestJobAt !== null && !count(v.latestJobAt))) return false;
  if (!v.byStatus || typeof v.byStatus !== 'object' || Array.isArray(v.byStatus) || Object.keys(v.byStatus).length !== statuses.length || statuses.some(k => !count(v.byStatus[k]))) return false;
  return statuses.reduce((sum,k) => sum + v.byStatus[k],0) === v.totalJobs && v.ok === (v.staleQueued === 0 && v.staleRunning === 0 && v.byStatus.other === 0);
}
const STATUS_PATH = "/rc/v1/integrations/vidyadesk/eshikshakosh-status";
const STATUS_HOST = "oracle-server.tail2b7fe2.ts.net";
const TIMEOUT_MS = 6_000;
type Env = Record<string, string | undefined>;
type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
function json(status: number, payload: Record<string, unknown>): Response {
  return Response.json(payload, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}
/** Server-only proxy; disabled until both sides have dedicated machine credentials. */
export async function handleEshikshakoshStatusRequest(request: Request, env: Env = process.env, fetcher: Fetcher = fetch): Promise<Response> {
  if (request.method !== 'GET') return new Response(null, { status: 405, headers: { Allow: 'GET', 'Cache-Control': 'no-store' } });
  if (env.VIDYADESK_ESHK_STATUS_ENABLED !== 'true') return json(503, { ok: false, error: 'integration_not_activated' });
  const endpoint = env.REPORT_CENTRAL_ESHK_STATUS_URL || '';
  const token = env.REPORT_CENTRAL_VIDYADESK_ESHK_STATUS_READ_TOKEN || '';
  if (!endpoint || !token) return json(503, { ok: false, error: 'integration_not_configured' });
  let url: URL;
  try { url = new URL(endpoint); } catch { return json(503, { ok: false, error: 'integration_not_configured' }); }
  if (url.protocol !== 'https:' || url.hostname !== STATUS_HOST || url.port || url.username || url.password || url.search || url.hash || url.pathname !== STATUS_PATH) {
    return json(503, { ok: false, error: 'integration_not_configured' });
  }
  try {
    const upstream = await fetcher(url, { method: 'GET', headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }, cache: 'no-store', signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!upstream.ok) return json(502, { ok: false, error: 'provider_unavailable' });
    let payload: unknown;
    try { payload = await upstream.json(); } catch { return json(502, { ok: false, error: 'provider_response_invalid' }); }
    if (!isEshikshakoshStatusPayload(payload)) return json(502, { ok: false, error: 'provider_contract_mismatch' });
    return json(200, payload as unknown as Record<string, unknown>);
  } catch { return json(502, { ok: false, error: 'provider_unavailable' }); }
}
export const config = { runtime: 'edge' };
export default function handler(request: Request): Promise<Response> { return handleEshikshakoshStatusRequest(request); }

function isDlrSummaryPayload(value: unknown): boolean {
  const timestamp = (v: unknown, nullable = false): boolean => {
    if (v === null) return nullable;
    return typeof v === 'string' && v.length <= 40 && Number.isFinite(Date.parse(v)) && /(?:Z|[+-]\d{2}:?\d{2})$/.test(v);
  };
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const v = value as Record<string, any>;
  if (Object.keys(v).length !== 6 || !['contractVersion','sourceSystem','scope','retrievedAt','snapshot','data'].every(k => k in v)) return false;
  if (v.contractVersion !== '1.0.0' || v.sourceSystem !== 'digital-letter-registry') return false;
  if (!v.scope || Object.keys(v.scope).length !== 2 || v.scope.schoolKey !== 'umv-tetahali' || v.scope.schoolName !== 'UCHCH MADHYAMIK VIDYALAY, TETAHALI') return false;
  if (!timestamp(v.retrievedAt)) return false;
  if (!v.snapshot || Object.keys(v.snapshot).length !== 3 || typeof v.snapshot.id !== 'string' || !/^dlr-vd-[0-9a-f]{16}$/.test(v.snapshot.id) || v.snapshot.version !== 1 || !timestamp(v.snapshot.createdAt)) return false;
  if (!v.data || Object.keys(v.data).length !== 2 || !Number.isSafeInteger(v.data.publicDocumentCount) || v.data.publicDocumentCount < 0 || !timestamp(v.data.latestPublicDocumentAt, true)) return false;
  return true;
}
const PATH = '/rc/v1/integrations/vidyadesk/dlr-summary';
const HOST = 'oracle-server.tail2b7fe2.ts.net';
type Env = Record<string, string | undefined>;
type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
function json(status: number, payload: Record<string, unknown>): Response { return Response.json(payload, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } }); }
export async function handleDlrSummaryRequest(request: Request, env: Env = process.env, fetcher: Fetcher = fetch): Promise<Response> {
  if (request.method !== 'GET') return new Response(null, { status: 405, headers: { Allow: 'GET', 'Cache-Control': 'no-store' } });
  if (env.VIDYADESK_DLR_SUMMARY_ENABLED !== 'true') return json(503, { ok: false, error: 'integration_not_activated' });
  const endpoint = env.REPORT_CENTRAL_DLR_SUMMARY_URL || '';
  const token = env.REPORT_CENTRAL_VIDYADESK_DLR_SUMMARY_READ_TOKEN || '';
  if (!endpoint || !token) return json(503, { ok: false, error: 'integration_not_configured' });
  let url: URL;
  try { url = new URL(endpoint); } catch { return json(503, { ok: false, error: 'integration_not_configured' }); }
  if (url.protocol !== 'https:' || url.hostname !== HOST || url.port || url.username || url.password || url.search || url.hash || url.pathname !== PATH) return json(503, { ok: false, error: 'integration_not_configured' });
  try {
    const upstream = await fetcher(url, { method: 'GET', headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }, cache: 'no-store', signal: AbortSignal.timeout(6000) });
    if (!upstream.ok) return json(502, { ok: false, error: 'provider_unavailable' });
    let payload: unknown; try { payload = await upstream.json(); } catch { return json(502, { ok: false, error: 'provider_response_invalid' }); }
    if (!isDlrSummaryPayload(payload)) return json(502, { ok: false, error: 'provider_contract_mismatch' });
    return json(200, payload as unknown as Record<string, unknown>);
  } catch { return json(502, { ok: false, error: 'provider_unavailable' }); }
}
export const config = { runtime: 'edge' };
export default function handler(request: Request): Promise<Response> { return handleDlrSummaryRequest(request); }

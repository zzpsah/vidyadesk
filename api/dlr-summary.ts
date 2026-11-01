import { isDlrSummaryPayload } from '../core/dlr-summary-contract.ts';
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

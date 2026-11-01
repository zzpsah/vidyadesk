import test from 'node:test';
import assert from 'node:assert/strict';
import { handleEshikshakoshStatusRequest } from '../api/eshikshakosh-status.ts';

const URL = 'https://oracle-server.tail2b7fe2.ts.net/rc/v1/integrations/vidyadesk/eshikshakosh-status';
const TOKEN = 'test-bridge-token';
const env = { VIDYADESK_ESHK_STATUS_ENABLED: 'true', REPORT_CENTRAL_ESHK_STATUS_URL: URL, REPORT_CENTRAL_VIDYADESK_ESHK_STATUS_READ_TOKEN: TOKEN };
const payload = () => ({
  contractVersion: '1.0.0', ok: true, service: 'eshikshakosh-jobserver',
  scope: { schoolKey: 'umv-tetahali', udiseCode: '10160203806' },
  totalJobs: 3, byStatus: { queued: 1, running: 0, done: 2, failed: 0, other: 0 },
  staleQueued: 0, staleRunning: 0, latestJobAt: 1793520000, retrievedAt: 1793520100,
});
const request = (method = 'GET') => new Request('https://vidyadesk.example.test/api/eshikshakosh-status', { method });

test('eShikshaKosh proxy is disabled by default', async () => {
  const response = await handleEshikshakoshStatusRequest(request(), {});
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error, 'integration_not_activated');
});
test('eShikshaKosh proxy accepts GET only', async () => {
  const response = await handleEshikshakoshStatusRequest(request('POST'), env);
  assert.equal(response.status, 405);
});
test('requires exact approved HTTPS endpoint and server token', async () => {
  for (const endpoint of ['http://oracle-server.tail2b7fe2.ts.net/rc/v1/integrations/vidyadesk/eshikshakosh-status', 'https://attacker.example/rc/v1/integrations/vidyadesk/eshikshakosh-status', URL + '?school=other']) {
    const response = await handleEshikshakoshStatusRequest(request(), { ...env, REPORT_CENTRAL_ESHK_STATUS_URL: endpoint });
    assert.equal(response.status, 503);
  }
});
test('forwards only server-side bearer and accepts a valid fixed-school aggregate', async () => {
  let call: any;
  const response = await handleEshikshakoshStatusRequest(request(), env, async (input, init) => {
    call = { url: String(input), init };
    return Response.json(payload());
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), payload());
  assert.equal(call.url, URL);
  assert.equal(call.init.headers.Authorization, `Bearer ${TOKEN}`);
});
test('rejects wrong scope, unexpected fields and inconsistent counts', async () => {
  for (const mutate of [
    (p: any) => { p.scope.udiseCode = '00000000000'; },
    (p: any) => { p.studentNames = ['private']; },
    (p: any) => { p.totalJobs = 8; },
    (p: any) => { p.ok = false; },
  ]) {
    const bad = payload(); mutate(bad);
    const response = await handleEshikshakoshStatusRequest(request(), env, async () => Response.json(bad));
    assert.equal(response.status, 502);
    assert.equal((await response.json()).error, 'provider_contract_mismatch');
  }
});
test('maps provider failures to generic no-store response', async () => {
  const response = await handleEshikshakoshStatusRequest(request(), env, async () => new Response('private details', { status: 500 }));
  assert.equal(response.status, 502);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), { ok: false, error: 'provider_unavailable' });
});

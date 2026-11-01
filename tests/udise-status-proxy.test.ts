import test from "node:test";
import assert from "node:assert/strict";
import { handleUdiseStatusRequest } from "../api/udise-status.ts";

const TOKEN = "server-only-bridge-token";
const URL = "https://oracle-server.tail2b7fe2.ts.net/rc/v1/integrations/vidyadesk/udise-status";
const env = {
  VIDYADESK_UDISE_STATUS_ENABLED: "true",
  REPORT_CENTRAL_UDISE_STATUS_URL: URL,
  REPORT_CENTRAL_VIDYADESK_UDISE_STATUS_READ_TOKEN: TOKEN,
};

function payload() {
  return {
    contractVersion: "1.0.0",
    ok: true,
    service: "udise-control",
    scope: { schoolKey: "umv-tetahali", schoolName: "UMV Tetahali", udiseCode: "10160203806" },
    totalJobs: 4,
    byStatus: {
      queued: 0, running: 0, awaiting_input: 0, awaiting_confirmation: 0,
      completed: 3, failed: 1, cancelled: 0,
    },
    byStage: { students: 0, snapshot: 1, completion: 0, gp: 1, ep: 1, facility: 1, finalize: 0 },
    unknownStatusCount: 0,
    unknownStageCount: 0,
    staleQueued: 0,
    staleRunning: 0,
    latestJobAt: 1793500000,
    retrievedAt: 1793500100,
  };
}

function request(method = "GET") {
  return new Request("https://vidyadesk.example.test/api/udise-status", { method });
}

test("UDISE status proxy is disabled by default", async () => {
  const result = await handleUdiseStatusRequest(request(), {});
  assert.equal(result.status, 503);
  assert.equal((await result.json()).error, "integration_not_activated");
});

test("UDISE status proxy rejects methods other than GET", async () => {
  const result = await handleUdiseStatusRequest(request("POST"), env);
  assert.equal(result.status, 405);
  assert.equal(result.headers.get("allow"), "GET");
});

test("UDISE status proxy requires a fixed HTTPS Report Central endpoint and token", async () => {
  for (const badUrl of [
    "http://oracle-server.tail2b7fe2.ts.net/rc/v1/integrations/vidyadesk/udise-status",
    "https://attacker.example/rc/v1/integrations/vidyadesk/udise-status",
    URL + "?school=other",
    URL.replace("/rc/v1/", "/v1/"),
  ]) {
    const result = await handleUdiseStatusRequest(request(), {
      ...env, REPORT_CENTRAL_UDISE_STATUS_URL: badUrl,
    });
    assert.equal(result.status, 503);
    assert.equal((await result.json()).error, "integration_not_configured");
  }
});

test("UDISE status proxy forwards the dedicated server token and returns aggregate-only data", async () => {
  let captured: { url: string; init?: RequestInit } | undefined;
  const result = await handleUdiseStatusRequest(request(), env, async (input, init) => {
    captured = { url: String(input), init };
    return Response.json(payload());
  });
  assert.equal(result.status, 200);
  assert.equal(result.headers.get("cache-control"), "no-store");
  assert.equal(captured?.url, URL);
  assert.equal(new Headers(captured?.init?.headers).get("authorization"), `Bearer ${TOKEN}`);
  assert.deepEqual(await result.json(), payload());
});

test("UDISE status proxy rejects wrong school scope, extra fields and inconsistent counts", async () => {
  const mutations = [
    (value: ReturnType<typeof payload>) => { value.scope.udiseCode = "99999999999"; },
    (value: ReturnType<typeof payload>) => { (value as Record<string, unknown>).studentNames = ["private"]; },
    (value: ReturnType<typeof payload>) => { value.totalJobs = 99; },
  ];
  for (const mutate of mutations) {
    const value = payload();
    mutate(value);
    const result = await handleUdiseStatusRequest(request(), env, async () => Response.json(value));
    assert.equal(result.status, 502);
    assert.equal((await result.json()).error, "provider_contract_mismatch");
  }
});

test("UDISE status proxy maps upstream errors to generic no-store responses", async () => {
  const result = await handleUdiseStatusRequest(request(), env, async () =>
    Response.json({ detail: "private credentials" }, { status: 503 }));
  assert.equal(result.status, 502);
  assert.deepEqual(await result.json(), { ok: false, error: "provider_unavailable" });
  assert.equal(result.headers.get("cache-control"), "no-store");
});

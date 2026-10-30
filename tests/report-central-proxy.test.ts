import assert from "node:assert/strict";
import test from "node:test";
import { handleReportCentralRequest } from "../api/report-central.ts";
import {
  REPORT_CENTRAL_CONTRACT_VERSION,
  REPORT_CENTRAL_SCOPE,
} from "../core/report-central-contract.ts";

const timestamp = "2026-10-30T10:00:00.000Z";
const data = {
  overview: {
    currentSnapshots: 2,
    failedSnapshots: 0,
    openConflicts: 1,
    lastSuccessfulSnapshotAt: timestamp,
  },
  sourceComparison: {
    sources: [
      { sourceId: "udise", currentSnapshotCount: 1, lastSnapshotAt: timestamp, academicSession: "2026-2027" },
      { sourceId: "eshikshakosh", currentSnapshotCount: 1, lastSnapshotAt: timestamp, academicSession: "2026-2027" },
    ],
  },
  conflictSummary: {
    openTotal: 1,
    bySeverity: { error: 1, warning: 0, info: 0 },
  },
  importAudit: {
    attempts: 2,
    succeeded: 2,
    failed: 0,
    ignoredDuplicates: 0,
    latestAttemptAt: timestamp,
    historyCoverage: "school_scoped_records_only",
  },
};
const validEnvelope = () => ({
  contractVersion: REPORT_CENTRAL_CONTRACT_VERSION,
  sourceSystem: "report-central",
  scope: { ...REPORT_CENTRAL_SCOPE },
  retrievedAt: timestamp,
  snapshot: { id: "read-model-test", version: 1, createdAt: timestamp },
  data,
});
const env = {
  VIDYADESK_REPORT_CENTRAL_ENABLED: "true",
  REPORT_CENTRAL_AGGREGATE_URL: "https://oracle-server.tail2b7fe2.ts.net/rc/v1/integrations/vidyadesk/aggregate",
  REPORT_CENTRAL_VIDYADESK_READ_TOKEN: "server-only-test-token",
  VIDYADESK_ALLOWED_ORIGIN: "https://zzpsah.github.io",
};
const request = (method = "GET", origin = "https://zzpsah.github.io") =>
  new Request("https://vidyadesk.example.test/api/report-central", {
    method,
    headers: origin ? { Origin: origin } : {},
  });

test("uses the ShikshaKosh monitoring domain as the default CORS origin", async () => {
  const result = await handleReportCentralRequest(
    request("OPTIONS", "https://shikshakosh.vercel.app"),
    { ...env, VIDYADESK_ALLOWED_ORIGIN: undefined },
  );
  assert.equal(result.status, 204);
  assert.equal(result.headers.get("Access-Control-Allow-Origin"), "https://shikshakosh.vercel.app");

  const rejected = await handleReportCentralRequest(
    request("GET", "https://zzpsah.github.io"),
    { ...env, VIDYADESK_ALLOWED_ORIGIN: undefined, VIDYADESK_REPORT_CENTRAL_ENABLED: "false" },
  );
  assert.equal(rejected.status, 403);
});

test("does not call Report Central while the public integration flag is off", async () => {
  let calls = 0;
  const result = await handleReportCentralRequest(
    request(),
    { ...env, VIDYADESK_REPORT_CENTRAL_ENABLED: "false" },
    async () => { calls += 1; return Response.json(validEnvelope()); },
  );
  assert.equal(result.status, 503);
  assert.equal((await result.json()).error, "integration_not_activated");
  assert.equal(calls, 0);
});

test("requires GET and rejects unapproved browser origins", async () => {
  const method = await handleReportCentralRequest(request("POST"), env);
  assert.equal(method.status, 405);
  const origin = await handleReportCentralRequest(request("GET", "https://attacker.example"), env);
  assert.equal(origin.status, 403);
  assert.equal((await origin.json()).error, "origin_not_allowed");
});

test("handles CORS preflight without contacting the provider", async () => {
  let calls = 0;
  const result = await handleReportCentralRequest(
    request("OPTIONS"),
    env,
    async () => { calls += 1; return Response.json(validEnvelope()); },
  );
  assert.equal(result.status, 204);
  assert.equal(result.headers.get("Access-Control-Allow-Origin"), "https://zzpsah.github.io");
  assert.equal(calls, 0);
});

test("forwards a fixed server-side bearer and returns only a valid aggregate envelope", async () => {
  let capturedUrl = "";
  let capturedAuthorization = "";
  const result = await handleReportCentralRequest(request(), env, async (url, init) => {
    capturedUrl = String(url);
    capturedAuthorization = new Headers(init?.headers).get("Authorization") || "";
    return Response.json(validEnvelope());
  });

  assert.equal(result.status, 200);
  assert.equal(capturedUrl, env.REPORT_CENTRAL_AGGREGATE_URL);
  assert.equal(capturedAuthorization, "Bearer server-only-test-token");
  assert.equal(result.headers.get("Cache-Control"), "public, s-maxage=30, stale-while-revalidate=60");
  const body = await result.json();
  assert.equal(body.scope.schoolKey, "umv-tetahali");
  assert.equal(body.data.importAudit.historyCoverage, "school_scoped_records_only");
  assert.equal(JSON.stringify(body).includes("server-only-test-token"), false);
});

test("rejects wrong-school, extra-field and unscoped audit payloads", async () => {
  const wrongSchool = validEnvelope() as unknown as Record<string, any>;
  wrongSchool.scope.schoolKey = "another-school";
  const resultA = await handleReportCentralRequest(
    request(), env, async () => Response.json(wrongSchool),
  );
  assert.equal(resultA.status, 502);
  assert.equal((await resultA.json()).error, "provider_contract_mismatch");

  const privateField = validEnvelope() as unknown as Record<string, any>;
  privateField.data.overview.studentName = "must-not-leak";
  const resultB = await handleReportCentralRequest(
    request(), env, async () => Response.json(privateField),
  );
  assert.equal(resultB.status, 502);

  const legacyAudit = validEnvelope() as unknown as Record<string, any>;
  legacyAudit.data.importAudit.historyCoverage = "complete";
  const resultC = await handleReportCentralRequest(
    request(), env, async () => Response.json(legacyAudit),
  );
  assert.equal(resultC.status, 502);
});

test("does not disclose provider errors or mapping details", async () => {
  const result = await handleReportCentralRequest(
    request(), env, async () => Response.json({ error: "database details and private IDs" }, { status: 409 }),
  );
  assert.equal(result.status, 503);
  assert.deepEqual(await result.json(), { ok: false, error: "provider_scope_pending" });
});

test("requires HTTPS and a server-only token before making upstream calls", async () => {
  let calls = 0;
  const badUrl = await handleReportCentralRequest(
    request(),
    { ...env, REPORT_CENTRAL_AGGREGATE_URL: "http://reports.example.test/v1/integrations/vidyadesk/aggregate" },
    async () => { calls += 1; return Response.json(validEnvelope()); },
  );
  assert.equal(badUrl.status, 503);

  const noToken = await handleReportCentralRequest(
    request(),
    { ...env, REPORT_CENTRAL_VIDYADESK_READ_TOKEN: "" },
    async () => { calls += 1; return Response.json(validEnvelope()); },
  );
  assert.equal(noToken.status, 503);

  const wrongPath = await handleReportCentralRequest(
    request(),
    { ...env, REPORT_CENTRAL_AGGREGATE_URL: "https://reports.example.test/other/v1/integrations/vidyadesk/aggregate" },
    async () => { calls += 1; return Response.json(validEnvelope()); },
  );
  assert.equal(wrongPath.status, 503);
  assert.equal(calls, 0);
});

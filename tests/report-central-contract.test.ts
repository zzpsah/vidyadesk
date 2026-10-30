import assert from 'node:assert/strict';
import test from 'node:test';
import {
  REPORT_CENTRAL_CONTRACT_VERSION, REPORT_CENTRAL_SCOPE,
  isReportCentralConflictSummary, isReportCentralEnvelope, isReportCentralImportAudit,
  isReportCentralOverview, isReportCentralSourceComparison,
} from '../core/report-central-contract.ts';
type TestEnvelope = {
  contractVersion: string; sourceSystem: string;
  scope: { schoolKey: string; schoolName: string; academicSession: string };
  retrievedAt: string; snapshot: { id: string; version: number; createdAt: string }; data: unknown;
};
const timestamp = '2026-10-30T10:00:00.000Z';
const envelope = (data: unknown): TestEnvelope => ({
  contractVersion: REPORT_CENTRAL_CONTRACT_VERSION, sourceSystem: 'report-central',
  scope: { ...REPORT_CENTRAL_SCOPE }, retrievedAt: timestamp,
  snapshot: { id: 'snapshot-demo', version: 1, createdAt: timestamp }, data,
});
test('accepts correctly scoped aggregate overview envelope', () => {
  assert.equal(isReportCentralEnvelope(envelope({
    currentSnapshots: 4, failedSnapshots: 0, openConflicts: 2, lastSuccessfulSnapshotAt: timestamp,
  }), isReportCentralOverview), true);
});
test('rejects another school, session and contract version', () => {
  const data = { currentSnapshots: 0, failedSnapshots: 0, openConflicts: 0, lastSuccessfulSnapshotAt: null };
  const school = envelope(data); school.scope.schoolKey = 'another-school';
  const session = envelope(data); session.scope.academicSession = '2025-2026';
  const version = envelope(data); version.contractVersion = '2.0.0';
  for (const candidate of [school, session, version]) {
    assert.equal(isReportCentralEnvelope(candidate, isReportCentralOverview), false);
  }
});
test('rejects unexpected fields that could carry personal data', () => {
  assert.equal(isReportCentralEnvelope(envelope({
    currentSnapshots: 1, failedSnapshots: 0, openConflicts: 0, lastSuccessfulSnapshotAt: null,
    studentName: 'must-not-enter-contract',
  }), isReportCentralOverview), false);
});
test('rejects negative counts and malformed timestamps', () => {
  assert.equal(isReportCentralOverview({
    currentSnapshots: -1, failedSnapshots: 0, openConflicts: 0, lastSuccessfulSnapshotAt: null,
  }), false);
  assert.equal(isReportCentralOverview({
    currentSnapshots: 1, failedSnapshots: 0, openConflicts: 0, lastSuccessfulSnapshotAt: 'not-a-date',
  }), false);
});
test('requires UDISE and e-ShikshaKosh as distinct source evidence', () => {
  assert.equal(isReportCentralSourceComparison({ sources: [
    { sourceId: 'udise', currentSnapshotCount: 1, lastSnapshotAt: timestamp, academicSession: REPORT_CENTRAL_SCOPE.academicSession },
    { sourceId: 'eshikshakosh', currentSnapshotCount: 2, lastSnapshotAt: null, academicSession: REPORT_CENTRAL_SCOPE.academicSession },
  ] }), true);
  assert.equal(isReportCentralSourceComparison({ sources: [
    { sourceId: 'udise', currentSnapshotCount: 1, lastSnapshotAt: timestamp, academicSession: REPORT_CENTRAL_SCOPE.academicSession },
    { sourceId: 'udise', currentSnapshotCount: 2, lastSnapshotAt: null, academicSession: REPORT_CENTRAL_SCOPE.academicSession },
  ] }), false);
});
test('checks conflict totals and import audit arithmetic', () => {
  assert.equal(isReportCentralConflictSummary({ openTotal: 3, bySeverity: { error: 1, warning: 1, info: 1 } }), true);
  assert.equal(isReportCentralConflictSummary({ openTotal: 4, bySeverity: { error: 1, warning: 1, info: 1 } }), false);
  assert.equal(isReportCentralImportAudit({ attempts: 5, succeeded: 3, failed: 1, ignoredDuplicates: 1, latestAttemptAt: timestamp, historyCoverage: 'school_scoped_records_only' }), true);
  assert.equal(isReportCentralImportAudit({ attempts: 2, succeeded: 3, failed: 0, ignoredDuplicates: 0, latestAttemptAt: timestamp, historyCoverage: 'school_scoped_records_only' }), false);
  assert.equal(isReportCentralImportAudit({ attempts: 1, succeeded: 1, failed: 0, ignoredDuplicates: 0, latestAttemptAt: timestamp, historyCoverage: 'complete' }), false);
});
import test from 'node:test';
import assert from 'node:assert/strict';
import { isUdiseStatusPayload } from '../core/udise-status-contract.ts';

const payload = () => ({
  contractVersion: '1.0.0', ok: true, service: 'udise-control',
  scope: { schoolKey: 'umv-tetahali', schoolName: 'UMV Tetahali', udiseCode: '10160203806' },
  totalJobs: 2,
  byStatus: { queued: 0, running: 0, awaiting_input: 0, awaiting_confirmation: 0, completed: 2, failed: 0, cancelled: 0 },
  byStage: { students: 0, snapshot: 2, completion: 0, gp: 0, ep: 0, facility: 0, finalize: 0 },
  unknownStatusCount: 0, unknownStageCount: 0, staleQueued: 0, staleRunning: 0,
  latestJobAt: 1793520000, retrievedAt: 1793520100,
});

test('accepts only the fixed UMV Tetahali aggregate contract', () => {
  assert.equal(isUdiseStatusPayload(payload()), true);
});
test('rejects another school, extra fields and personal-data-shaped additions', () => {
  const wrongSchool = payload(); wrongSchool.scope.udiseCode = '00000000000';
  assert.equal(isUdiseStatusPayload(wrongSchool), false);
  assert.equal(isUdiseStatusPayload({ ...payload(), studentNames: ['not allowed'] }), false);
});
test('rejects inconsistent totals, negative counts and malformed timestamps', () => {
  const wrongTotal = payload(); wrongTotal.totalJobs = 4;
  assert.equal(isUdiseStatusPayload(wrongTotal), false);
  const negative = payload(); negative.byStatus.failed = -1;
  assert.equal(isUdiseStatusPayload(negative), false);
  const badTime = payload(); badTime.retrievedAt = 'now' as unknown as number;
  assert.equal(isUdiseStatusPayload(badTime), false);
});
test('rejects a false healthy flag when stale jobs exist', () => {
  const stale = payload(); stale.staleRunning = 1;
  assert.equal(isUdiseStatusPayload(stale), false);
});

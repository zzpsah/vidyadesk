/**
 * Versioned, aggregate-only contract for a future Report Central connection.
 * Transport-free: no requests, credentials, or provider state live here.
 */
export const REPORT_CENTRAL_CONTRACT_VERSION = '1.0.0' as const;
export const REPORT_CENTRAL_SCOPE = {
  schoolKey: 'umv-tetahali',
  schoolName: 'UCHCH MADHYAMIK VIDYALAY, TETAHALI',
  academicSession: '2026-2027',
} as const;
export type ReportCentralScope = typeof REPORT_CENTRAL_SCOPE;
export type ConflictSeverity = 'error' | 'warning' | 'info';
export type ReadModelSnapshot = { id: string; version: number; createdAt: string };
export type ReportCentralEnvelope<T> = {
  contractVersion: typeof REPORT_CENTRAL_CONTRACT_VERSION;
  sourceSystem: 'report-central';
  scope: ReportCentralScope;
  retrievedAt: string;
  snapshot: ReadModelSnapshot;
  data: T;
};
export type ReportCentralOverview = {
  currentSnapshots: number; failedSnapshots: number; openConflicts: number;
  lastSuccessfulSnapshotAt: string | null;
};
export type ReportCentralSourceComparison = { sources: Array<{
  sourceId: 'udise' | 'eshikshakosh'; currentSnapshotCount: number;
  lastSnapshotAt: string | null; academicSession: string;
}> };
export type ReportCentralConflictSummary = {
  openTotal: number; bySeverity: Record<ConflictSeverity, number>;
};
export type ReportCentralImportAudit = {
  attempts: number; succeeded: number; failed: number;
  ignoredDuplicates: number; latestAttemptAt: string | null;
};
export type ReportCentralConnectionState =
  | { status: 'unconfigured'; reason: string }
  | { status: 'configured'; reason: string }
  | { status: 'reachable'; checkedAt: string }
  | { status: 'verified'; checkedAt: string; contractVersion: typeof REPORT_CENTRAL_CONTRACT_VERSION };

/** Future server-side adapter; intentionally has no write methods. */
export interface ReportCentralReadAdapter {
  getOverview(scope: ReportCentralScope): Promise<ReportCentralEnvelope<ReportCentralOverview>>;
  getSourceComparison(scope: ReportCentralScope): Promise<ReportCentralEnvelope<ReportCentralSourceComparison>>;
  getConflictSummary(scope: ReportCentralScope): Promise<ReportCentralEnvelope<ReportCentralConflictSummary>>;
  getImportAudit(scope: ReportCentralScope): Promise<ReportCentralEnvelope<ReportCentralImportAudit>>;
}
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
const ENVELOPE_KEYS = ['contractVersion', 'sourceSystem', 'scope', 'retrievedAt', 'snapshot', 'data'] as const;
const SCOPE_KEYS = ['schoolKey', 'schoolName', 'academicSession'] as const;
const SNAPSHOT_KEYS = ['id', 'version', 'createdAt'] as const;

export function isReportCentralEnvelope<T>(
  value: unknown, isData: (data: unknown) => data is T,
): value is ReportCentralEnvelope<T> {
  if (!isRecord(value) || !hasOnlyKeys(value, ENVELOPE_KEYS)
    || !isRecord(value.scope) || !hasOnlyKeys(value.scope, SCOPE_KEYS)
    || !isRecord(value.snapshot) || !hasOnlyKeys(value.snapshot, SNAPSHOT_KEYS)) return false;
  return value.contractVersion === REPORT_CENTRAL_CONTRACT_VERSION
    && value.sourceSystem === 'report-central'
    && value.scope.schoolKey === REPORT_CENTRAL_SCOPE.schoolKey
    && value.scope.schoolName === REPORT_CENTRAL_SCOPE.schoolName
    && value.scope.academicSession === REPORT_CENTRAL_SCOPE.academicSession
    && isTimestamp(value.retrievedAt)
    && typeof value.snapshot.id === 'string' && value.snapshot.id.trim().length > 0
    && isCount(value.snapshot.version) && value.snapshot.version > 0
    && isTimestamp(value.snapshot.createdAt) && isData(value.data);
}
export function isReportCentralOverview(value: unknown): value is ReportCentralOverview {
  if (!isRecord(value) || !hasOnlyKeys(value, [
    'currentSnapshots', 'failedSnapshots', 'openConflicts', 'lastSuccessfulSnapshotAt',
  ])) return false;
  return isCount(value.currentSnapshots) && isCount(value.failedSnapshots)
    && isCount(value.openConflicts) && isNullableTimestamp(value.lastSuccessfulSnapshotAt);
}
export function isReportCentralSourceComparison(value: unknown): value is ReportCentralSourceComparison {
  if (!isRecord(value) || !hasOnlyKeys(value, ['sources']) || !Array.isArray(value.sources)
    || value.sources.length !== 2) return false;
  const seen = new Set<string>();
  for (const source of value.sources) {
    if (!isRecord(source) || !hasOnlyKeys(source, [
      'sourceId', 'currentSnapshotCount', 'lastSnapshotAt', 'academicSession',
    ])) return false;
    if (source.sourceId !== 'udise' && source.sourceId !== 'eshikshakosh') return false;
    if (seen.has(source.sourceId) || !isCount(source.currentSnapshotCount)
      || !isNullableTimestamp(source.lastSnapshotAt)
      || source.academicSession !== REPORT_CENTRAL_SCOPE.academicSession) return false;
    seen.add(source.sourceId);
  }
  return seen.has('udise') && seen.has('eshikshakosh');
}
export function isReportCentralConflictSummary(value: unknown): value is ReportCentralConflictSummary {
  if (!isRecord(value) || !hasOnlyKeys(value, ['openTotal', 'bySeverity'])
    || !isRecord(value.bySeverity) || !hasOnlyKeys(value.bySeverity, ['error', 'warning', 'info'])) return false;
  return isCount(value.openTotal) && isCount(value.bySeverity.error)
    && isCount(value.bySeverity.warning) && isCount(value.bySeverity.info)
    && value.openTotal === value.bySeverity.error + value.bySeverity.warning + value.bySeverity.info;
}
export function isReportCentralImportAudit(value: unknown): value is ReportCentralImportAudit {
  if (!isRecord(value) || !hasOnlyKeys(value, [
    'attempts', 'succeeded', 'failed', 'ignoredDuplicates', 'latestAttemptAt',
  ])) return false;
  return isCount(value.attempts) && isCount(value.succeeded) && isCount(value.failed)
    && isCount(value.ignoredDuplicates) && value.succeeded + value.failed <= value.attempts
    && isNullableTimestamp(value.latestAttemptAt);
}
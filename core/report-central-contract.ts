/**
 * Versioned, aggregate-only contract for a future Report Central connection.
 *
 * This file defines the boundary; it does not perform HTTP requests, hold
 * credentials, or expose student-level records to the static browser app.
 */

export const REPORT_CENTRAL_CONTRACT_VERSION = '1.0.0' as const;

export const REPORT_CENTRAL_SCOPE = {
  schoolKey: 'umv-tetahali',
  schoolName: 'UCHCH MADHYAMIK VIDYALAY, TETAHALI',
  academicSession: '2026-2027',
} as const;

export type ReportCentralScope = typeof REPORT_CENTRAL_SCOPE;
export type ConflictSeverity = 'error' | 'warning' | 'info';

export type ReadModelSnapshot = {
  id: string;
  version: number;
  createdAt: string;
};

export type ReportCentralEnvelope<T> = {
  contractVersion: typeof REPORT_CENTRAL_CONTRACT_VERSION;
  sourceSystem: 'report-central';
  scope: ReportCentralScope;
  retrievedAt: string;
  snapshot: ReadModelSnapshot;
  data: T;
};

/** Counts only; deliberately contains no student names, PENs or source values. */
export type ReportCentralOverview = {
  currentSnapshots: number;
  failedSnapshots: number;
  openConflicts: number;
  lastSuccessfulSnapshotAt: string | null;
};

export type ReportCentralSourceComparison = {
  sources: Array<{
    sourceId: 'udise' | 'eshikshakosh';
    currentSnapshotCount: number;
    lastSnapshotAt: string | null;
    academicSession: string;
  }>;
};

export type ReportCentralConflictSummary = {
  openTotal: number;
  bySeverity: Record<ConflictSeverity, number>;
};

export type ReportCentralImportAudit = {
  attempts: number;
  succeeded: number;
  failed: number;
  ignoredDuplicates: number;
  latestAttemptAt: string | null;
};

export type ReportCentralConnectionState =
  | { status: 'unconfigured'; reason: string }
  | { status: 'configured'; reason: string }
  | { status: 'reachable'; checkedAt: string }
  | { status: 'verified'; checkedAt: string; contractVersion: typeof REPORT_CENTRAL_CONTRACT_VERSION };

/**
 * Future server-side adapter contract. Implementations must use an approved
 * authenticated proxy; never instantiate this interface with browser secrets.
 * No write methods are intentionally defined.
 */
export interface ReportCentralReadAdapter {
  getOverview(scope: ReportCentralScope): Promise<ReportCentralEnvelope<ReportCentralOverview>>;
  getSourceComparison(scope: ReportCentralScope): Promise<ReportCentralEnvelope<ReportCentralSourceComparison>>;
  getConflictSummary(scope: ReportCentralScope): Promise<ReportCentralEnvelope<ReportCentralConflictSummary>>;
  getImportAudit(scope: ReportCentralScope): Promise<ReportCentralEnvelope<ReportCentralImportAudit>>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTimestamp(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

/** Validate envelope metadata before a future consumer accepts its payload. */
export function isReportCentralEnvelope<T>(
  value: unknown,
  isData: (data: unknown) => data is T,
): value is ReportCentralEnvelope<T> {
  if (!isRecord(value) || !isRecord(value.scope) || !isRecord(value.snapshot)) return false;
  return value.contractVersion === REPORT_CENTRAL_CONTRACT_VERSION
    && value.sourceSystem === 'report-central'
    && value.scope.schoolKey === REPORT_CENTRAL_SCOPE.schoolKey
    && value.scope.schoolName === REPORT_CENTRAL_SCOPE.schoolName
    && value.scope.academicSession === REPORT_CENTRAL_SCOPE.academicSession
    && isTimestamp(value.retrievedAt)
    && typeof value.snapshot.id === 'string'
    && value.snapshot.id.length > 0
    && Number.isSafeInteger(value.snapshot.version)
    && Number(value.snapshot.version) > 0
    && isTimestamp(value.snapshot.createdAt)
    && isData(value.data);
}

export function isReportCentralOverview(value: unknown): value is ReportCentralOverview {
  if (!isRecord(value)) return false;
  const counts = [value.currentSnapshots, value.failedSnapshots, value.openConflicts];
  return counts.every(item => Number.isSafeInteger(item) && Number(item) >= 0)
    && (value.lastSuccessfulSnapshotAt === null || isTimestamp(value.lastSuccessfulSnapshotAt));
}

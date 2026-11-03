/** Strict allowlist for the fixed UMV Tetahali eShikshaKosh jobserver summary. */
export type EshikshaKoshStatusPayload = {
  contractVersion: '1.0.0'; ok: boolean; service: 'eshikshakosh-jobserver';
  scope: { schoolKey: 'umv-tetahali'; udiseCode: '10160203806' };
  totalJobs: number;
  byStatus: { queued: number; running: number; done: number; failed: number; other: number };
  staleQueued: number; staleRunning: number; latestJobAt: number | null; retrievedAt: number;
};
const STATUS_KEYS = ['queued', 'running', 'done', 'failed', 'other'] as const;
const isCount = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) >= 0;
export function isEshikshakoshStatusPayload(value: unknown): value is EshikshaKoshStatusPayload {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const v = value as Record<string, any>;
  const keys = ['contractVersion','ok','service','scope','totalJobs','byStatus','staleQueued','staleRunning','latestJobAt','retrievedAt'];
  if (Object.keys(v).length !== keys.length || keys.some(key => !(key in v))) return false;
  if (v.contractVersion !== '1.0.0' || v.service !== 'eshikshakosh-jobserver' || typeof v.ok !== 'boolean') return false;
  if (!v.scope || Object.keys(v.scope).length !== 2 || v.scope.schoolKey !== 'umv-tetahali' || v.scope.udiseCode !== '10160203806') return false;
  if (![v.totalJobs,v.staleQueued,v.staleRunning,v.retrievedAt].every(isCount) || (v.latestJobAt !== null && !isCount(v.latestJobAt))) return false;
  if (!v.byStatus || typeof v.byStatus !== 'object' || Array.isArray(v.byStatus) || Object.keys(v.byStatus).length !== STATUS_KEYS.length || STATUS_KEYS.some(key => !isCount(v.byStatus[key]))) return false;
  const healthy = v.staleQueued === 0 && v.staleRunning === 0 && v.byStatus.other === 0;
  return STATUS_KEYS.reduce((sum,key) => sum + v.byStatus[key],0) === v.totalJobs && v.ok === healthy;
}

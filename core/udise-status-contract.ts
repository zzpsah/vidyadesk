export type StatusPayload = {
  contractVersion: '1.0.0'; ok: boolean; service: 'udise-control';
  scope: { schoolKey: 'umv-tetahali'; schoolName: 'UMV Tetahali'; udiseCode: '10160203806' };
  totalJobs: number;
  byStatus: Record<'queued' | 'running' | 'awaiting_input' | 'awaiting_confirmation' | 'completed' | 'failed' | 'cancelled', number>;
  byStage: Record<'students' | 'snapshot' | 'completion' | 'gp' | 'ep' | 'facility' | 'finalize', number>;
  unknownStatusCount: number; unknownStageCount: number; staleQueued: number; staleRunning: number;
  latestJobAt: number | null; retrievedAt: number;
};
type State = { kind: 'loading' } | { kind: 'ready'; data: StatusPayload } | { kind: 'unavailable'; message: string };

const statusKeys = ['queued', 'running', 'awaiting_input', 'awaiting_confirmation', 'completed', 'failed', 'cancelled'] as const;
const stageKeys = ['students', 'snapshot', 'completion', 'gp', 'ep', 'facility', 'finalize'] as const;
const isCount = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) >= 0;
export function isUdiseStatusPayload(value: unknown): value is StatusPayload {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const v = value as Record<string, any>;
  const keys = ['contractVersion','ok','service','scope','totalJobs','byStatus','byStage','unknownStatusCount','unknownStageCount','staleQueued','staleRunning','latestJobAt','retrievedAt'];
  if (Object.keys(v).length !== keys.length || keys.some(key => !(key in v))) return false;
  if (v.contractVersion !== '1.0.0' || v.service !== 'udise-control' || typeof v.ok !== 'boolean') return false;
  if (!v.scope || Object.keys(v.scope).length !== 3 || v.scope.schoolKey !== 'umv-tetahali' || v.scope.schoolName !== 'UMV Tetahali' || v.scope.udiseCode !== '10160203806') return false;
  if (![v.totalJobs,v.unknownStatusCount,v.unknownStageCount,v.staleQueued,v.staleRunning,v.retrievedAt].every(isCount) || (v.latestJobAt !== null && !isCount(v.latestJobAt))) return false;
  for (const [obj, expected] of [[v.byStatus,statusKeys],[v.byStage,stageKeys]] as const) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj) || Object.keys(obj).length !== expected.length || expected.some(key => !isCount(obj[key]))) return false;
  }
  const statusTotal = statusKeys.reduce((sum,key) => sum + v.byStatus[key],0);
  const stageTotal = stageKeys.reduce((sum,key) => sum + v.byStage[key],0);
  const healthy = v.unknownStatusCount === 0 && v.unknownStageCount === 0 && v.staleQueued === 0 && v.staleRunning === 0;
  return statusTotal + v.unknownStatusCount === v.totalJobs && stageTotal + v.unknownStageCount === v.totalJobs && v.ok === healthy;
}

/** Strict aggregate-only contract for the fixed UMV Tetahali DLR archive. */
export type DlrSummaryPayload = {
  contractVersion: '1.0.0'; sourceSystem: 'digital-letter-registry';
  scope: { schoolKey: 'umv-tetahali'; schoolName: 'UCHCH MADHYAMIK VIDYALAY, TETAHALI' };
  retrievedAt: string;
  snapshot: { id: string; version: 1; createdAt: string };
  data: { publicDocumentCount: number; latestPublicDocumentAt: string | null };
};
const timestamp = (value: unknown, nullable = false): value is string | null => {
  if (value === null) return nullable;
  if (typeof value !== 'string' || value.length > 40) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && /(?:Z|[+-]\d{2}:?\d{2})$/.test(value);
};
export function isDlrSummaryPayload(value: unknown): value is DlrSummaryPayload {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const v = value as Record<string, any>;
  if (Object.keys(v).length !== 6 || !['contractVersion','sourceSystem','scope','retrievedAt','snapshot','data'].every(k => k in v)) return false;
  if (v.contractVersion !== '1.0.0' || v.sourceSystem !== 'digital-letter-registry') return false;
  if (!v.scope || Object.keys(v.scope).length !== 2 || v.scope.schoolKey !== 'umv-tetahali' || v.scope.schoolName !== 'UCHCH MADHYAMIK VIDYALAY, TETAHALI') return false;
  if (!timestamp(v.retrievedAt)) return false;
  if (!v.snapshot || Object.keys(v.snapshot).length !== 3 || typeof v.snapshot.id !== 'string' || !/^dlr-vd-[0-9a-f]{16}$/.test(v.snapshot.id) || v.snapshot.version !== 1 || !timestamp(v.snapshot.createdAt)) return false;
  if (!v.data || Object.keys(v.data).length !== 2 || !Number.isSafeInteger(v.data.publicDocumentCount) || v.data.publicDocumentCount < 0 || !timestamp(v.data.latestPublicDocumentAt, true)) return false;
  return true;
}

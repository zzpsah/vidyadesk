import { useEffect, useState } from 'react';
import { Activity, RefreshCw, ShieldAlert } from 'lucide-react';
import { Panel, Pill } from '@/components/common';
import { Button } from '@/components/ui/button';

type StatusPayload = {
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
function validPayload(value: unknown): value is StatusPayload {
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
const fmt = (n: number) => new Intl.NumberFormat('en-IN').format(n);
const when = (n: number | null) => n === null ? '—' : new Date(n * 1000).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

export function UdiseStatusPanel() {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); let active = true;
    setState({ kind: 'loading' });
    fetch('/api/udise-status', { headers: { Accept: 'application/json' }, cache: 'no-store', signal: controller.signal })
      .then(async response => {
        let payload: unknown = null; try { payload = await response.json(); } catch { /* generic failure */ }
        if (!active) return;
        if (!response.ok) {
          const code = payload && typeof payload === 'object' && 'error' in payload ? String((payload as {error:unknown}).error) : '';
          setState({ kind: 'unavailable', message: code === 'integration_not_activated' ? 'The status feed is deliberately disabled until its private tokens and publication approval are in place.' : code === 'integration_not_configured' ? 'The server-side bridge is missing its required configuration.' : 'The UDISE+ status provider is unavailable. No sample figures are substituted.' });
          return;
        }
        if (!validPayload(payload)) { setState({ kind: 'unavailable', message: 'The provider response failed fixed-school and aggregate-only validation.' }); return; }
        setState({ kind: 'ready', data: payload });
      }).catch(() => { if (active) setState({ kind: 'unavailable', message: 'Could not reach the UDISE+ status bridge. No local or cached sample data is shown.' }); });
    return () => { active = false; controller.abort(); };
  }, [refresh]);
  const data = state.kind === 'ready' ? state.data : null;
  const metrics = data ? [
    ['Queued', data.byStatus.queued], ['Running', data.byStatus.running],
    ['Awaiting input', data.byStatus.awaiting_input], ['Awaiting confirmation', data.byStatus.awaiting_confirmation],
    ['Completed', data.byStatus.completed], ['Failed', data.byStatus.failed],
  ] as const : [];
  return <Panel title="UDISE+ automation status" meta="Fixed-school · aggregate-only feed">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2"><Pill tone={data ? (data.ok ? 'ok' : 'warn') : 'mute'}>{data ? (data.ok ? 'Healthy' : 'Attention required') : state.kind === 'loading' ? 'Checking' : 'Not connected'}</Pill><span className="text-xs text-muted-foreground">UDISE 10160203806</span></div>
      <Button variant="outline" size="sm" disabled={state.kind === 'loading'} onClick={() => setRefresh(value => value + 1)}><RefreshCw size={13} /> Refresh</Button>
    </div>
    {data ? <>
      <div className="insights mt-4"><div className="insight"><h3>Total jobs</h3><strong>{fmt(data.totalJobs)}</strong><em>All reported stages</em></div><div className="insight"><h3>Stale queued</h3><strong>{fmt(data.staleQueued)}</strong><em>Requires attention</em></div><div className="insight"><h3>Stale running</h3><strong>{fmt(data.staleRunning)}</strong><em>Requires attention</em></div><div className="insight"><h3>Last activity</h3><strong className="text-base">{when(data.latestJobAt)}</strong><em>Provider timestamp</em></div></div>
      <div className="card-rows mt-3">{metrics.map(([label,value]) => <div key={label}><span>{label}</span><strong>{fmt(value)}</strong></div>)}</div>
      <p className="foot-line">Summary retrieved {when(data.retrievedAt)}. No job IDs, student details, messages, files or portal credentials are returned.</p>
    </> : <div className="scope-note mt-3"><ShieldAlert size={15} className="mr-2 inline" />{state.kind === 'loading' ? 'Checking the private server-side bridge…' : state.kind === 'unavailable' ? state.message : 'Status unavailable.'}</div>}
    <p className="foot-line"><Activity size={13} className="mr-1 inline" />Portal previews, approvals and writes remain in the UDISE+ owner application.</p>
  </Panel>;
}

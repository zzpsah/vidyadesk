import { useEffect, useState } from 'react';
import { Activity, RefreshCw, ShieldAlert } from 'lucide-react';
import { Panel, Pill } from '@/components/common';
import { Button } from '@/components/ui/button';
import { isEshikshakoshStatusPayload, type EshikshaKoshStatusPayload } from '@/core/eshikshakosh-status-contract';

type State = { kind: 'loading' } | { kind: 'ready'; data: EshikshaKoshStatusPayload } | { kind: 'unavailable'; message: string };
const fmt = (n: number) => new Intl.NumberFormat('en-IN').format(n);
const when = (n: number | null) => n === null ? '—' : new Date(n * 1000).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

export function EshikshakoshStatusPanel() {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); let active = true;
    setState({ kind: 'loading' });
    fetch('/api/eshikshakosh-status', { headers: { Accept: 'application/json' }, cache: 'no-store', signal: controller.signal })
      .then(async response => {
        let payload: unknown = null; try { payload = await response.json(); } catch { /* generic response error */ }
        if (!active) return;
        if (!response.ok) {
          const code = payload && typeof payload === 'object' && 'error' in payload ? String((payload as {error:unknown}).error) : '';
          setState({ kind: 'unavailable', message: code === 'integration_not_activated' ? 'The status feed is deliberately disabled until the private bridge and both dedicated tokens are ready.' : code === 'integration_not_configured' ? 'The server-side bridge is missing its required configuration.' : 'The eShikshaKosh status provider is unavailable. No sample figures are substituted.' });
          return;
        }
        if (!isEshikshakoshStatusPayload(payload)) { setState({ kind: 'unavailable', message: 'The provider response failed fixed-school and aggregate-only validation.' }); return; }
        setState({ kind: 'ready', data: payload });
      }).catch(() => { if (active) setState({ kind: 'unavailable', message: 'Could not reach the eShikshaKosh status bridge. No local or cached sample data is shown.' }); });
    return () => { active = false; controller.abort(); };
  }, [refresh]);
  const data = state.kind === 'ready' ? state.data : null;
  return <Panel title="eShikshaKosh automation status" meta="Fixed-school · aggregate-only feed">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2"><Pill tone={data ? (data.ok ? 'ok' : 'warn') : 'mute'}>{data ? (data.ok ? 'Healthy' : 'Attention required') : state.kind === 'loading' ? 'Checking' : 'Not connected'}</Pill><span className="text-xs text-muted-foreground">UDISE 10160203806</span></div>
      <Button variant="outline" size="sm" disabled={state.kind === 'loading'} onClick={() => setRefresh(value => value + 1)}><RefreshCw size={13} /> Refresh</Button>
    </div>
    {data ? <>
      <div className="insights mt-4"><div className="insight"><h3>Total jobs</h3><strong>{fmt(data.totalJobs)}</strong><em>All reported workflows</em></div><div className="insight"><h3>Stale queued</h3><strong>{fmt(data.staleQueued)}</strong><em>Requires attention</em></div><div className="insight"><h3>Stale running</h3><strong>{fmt(data.staleRunning)}</strong><em>Requires attention</em></div><div className="insight"><h3>Last activity</h3><strong className="text-base">{when(data.latestJobAt)}</strong><em>Provider timestamp</em></div></div>
      <div className="card-rows mt-3">{(['queued','running','done','failed','other'] as const).map(key => <div key={key}><span>{key === 'done' ? 'Completed' : key[0].toUpperCase() + key.slice(1)}</span><strong>{fmt(data.byStatus[key])}</strong></div>)}</div>
      <p className="foot-line">Summary retrieved {when(data.retrievedAt)}. No job IDs, student or teacher details, messages, files or credentials are returned.</p>
    </> : <div className="scope-note mt-3"><ShieldAlert size={15} className="mr-2 inline" />{state.kind === 'loading' ? 'Checking the private server-side bridge…' : state.kind === 'unavailable' ? state.message : 'Status unavailable.'}</div>}
    <p className="foot-line"><Activity size={13} className="mr-1 inline" />Student OTR and teacher-report submissions remain in the eShikshaKosh owner workbench.</p>
  </Panel>;
}

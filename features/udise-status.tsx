import { useEffect, useState } from 'react';
import { Activity, RefreshCw, ShieldAlert } from 'lucide-react';
import { Panel, Pill } from '@/components/common';
import { isUdiseStatusPayload, type StatusPayload } from '@/core/udise-status-contract';
type State = { kind: 'loading' } | { kind: 'ready'; data: StatusPayload } | { kind: 'unavailable'; message: string };
import { Button } from '@/components/ui/button';

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
        if (!isUdiseStatusPayload(payload)) { setState({ kind: 'unavailable', message: 'The provider response failed fixed-school and aggregate-only validation.' }); return; }
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

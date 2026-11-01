import { useEffect, useState } from 'react';
import { FileText, RefreshCw, ShieldAlert } from 'lucide-react';
import { Panel, Pill } from '@/components/common';
import { Button } from '@/components/ui/button';
import { isDlrSummaryPayload, type DlrSummaryPayload } from '@/core/dlr-summary-contract';
type State = { kind: 'loading' } | { kind: 'ready'; data: DlrSummaryPayload } | { kind: 'unavailable'; message: string };
const when = (value: string | null) => value ? new Date(value).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'}) : '—';
export function DlrSummaryPanel() {
  const [state,setState]=useState<State>({kind:'loading'}); const [refresh,setRefresh]=useState(0);
  useEffect(()=>{ const controller=new AbortController(); let active=true; setState({kind:'loading'}); fetch('/api/dlr-summary',{headers:{Accept:'application/json'},cache:'no-store',signal:controller.signal}).then(async response=>{let payload:unknown=null;try{payload=await response.json()}catch{/* generic failure */} if(!active)return; if(!response.ok){const code=payload&&typeof payload==='object'&&'error'in payload?String((payload as {error:unknown}).error):'';setState({kind:'unavailable',message:code==='integration_not_activated'?'The DLR summary is disabled until the viewer-only archive identity, migration and machine credentials are verified.':code==='integration_not_configured'?'The server-side bridge is missing its required configuration.':'The Digital Letter Registry summary is unavailable. No sample figures are substituted.'});return;} if(!isDlrSummaryPayload(payload)){setState({kind:'unavailable',message:'The provider response failed fixed-school and aggregate-only validation.'});return;}setState({kind:'ready',data:payload});}).catch(()=>{if(active)setState({kind:'unavailable',message:'Could not reach the DLR summary bridge. No cached or sample data is shown.'})});return()=>{active=false;controller.abort()}},[refresh]);
  const data=state.kind==='ready'?state.data:null;
  return <Panel title="Digital Letter Registry summary" meta="Public archive · aggregate-only feed">
    <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><Pill tone={data?'ok':'mute'}>{data?'Verified summary':state.kind==='loading'?'Checking':'Not connected'}</Pill><span className="text-xs text-muted-foreground">UMV Tetahali</span></div><Button variant="outline" size="sm" disabled={state.kind==='loading'} onClick={()=>setRefresh(v=>v+1)}><RefreshCw size={13}/> Refresh</Button></div>
    {data?<div className="insights mt-4"><div className="insight"><h3>Public letters</h3><strong>{new Intl.NumberFormat('en-IN').format(data.data.publicDocumentCount)}</strong><em>Non-archived public documents</em></div><div className="insight"><h3>Latest upload</h3><strong className="text-base">{when(data.data.latestPublicDocumentAt)}</strong><em>Provider timestamp</em></div></div>:<div className="scope-note mt-3"><ShieldAlert size={15} className="mr-2 inline"/>{state.kind==='loading'?'Checking the private server-side bridge…':state.kind==='unavailable'?state.message:'Summary unavailable.'}</div>}
    {data&&<p className="foot-line">Summary retrieved {when(data.retrievedAt)}. No letter IDs, titles, subjects, references, filenames, extracted text or private letters are returned.</p>}
    <p className="foot-line"><FileText size={13} className="mr-1 inline"/>Full letter intake, search, editing and archive operations remain in the Digital Letter Registry owner application.</p>
  </Panel>;
}

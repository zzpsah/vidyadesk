import { useEffect, useState } from 'react';
import {
  ArrowRight, Clock3, Database, ExternalLink, FileBarChart, FileCheck2,
  GitCompareArrows, RefreshCw, ShieldAlert,
} from 'lucide-react';
import { PageHead, Panel, Pill } from '@/components/common';
import { Button } from '@/components/ui/button';
import {
  REPORT_CENTRAL_CONTRACT_VERSION,
  REPORT_CENTRAL_SCOPE,
  isReportCentralAggregate,
  isReportCentralEnvelope,
  type ReportCentralAggregate,
  type ReportCentralEnvelope,
} from '@/core/report-central-contract';
import { moduleById } from '@/core/modules';
import type { Nav } from '@/core/nav';

type AggregateEnvelope = ReportCentralEnvelope<ReportCentralAggregate>;
type ViewState =
  | { status: 'loading' }
  | { status: 'ready'; envelope: AggregateEnvelope }
  | { status: 'not-deployed' | 'disabled' | 'scope-pending' | 'not-configured' | 'unavailable' | 'invalid'; message: string };

const sourceRows = [
  { id: 'udise', label: 'UDISE+', owner: 'UDISE+ source snapshot' },
  { id: 'eshikshakosh', label: 'e-ShikshaKosh', owner: 'e-ShikshaKosh source snapshot' },
] as const;

const count = (value: number | undefined) =>
  value === undefined ? '—' : new Intl.NumberFormat('en-IN').format(value);

function timestamp(value: string | null | undefined) {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime())
    ? parsed.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : '—';
}

function Metric({ label, value, description }: { label: string; value: number | undefined; description: string }) {
  return <div className="insight">
    <h3>{label}</h3>
    <strong aria-label={value === undefined ? 'Not available' : String(value)}>{count(value)}</strong>
    <em>{description}</em>
  </div>;
}

function errorState(payload: unknown, status: number): ViewState {
  const code = typeof payload === 'object' && payload !== null && 'error' in payload
    ? String((payload as { error: unknown }).error)
    : '';
  if (code === 'integration_not_activated') {
    return { status: 'disabled', message: 'The public aggregate connection is deliberately disabled until school mapping and publication checks are complete.' };
  }
  if (code === 'provider_scope_pending') {
    return { status: 'scope-pending', message: 'Report Central has not verified the canonical school and both source mappings yet. No aggregate figures are shown.' };
  }
  if (code === 'integration_not_configured') {
    return { status: 'not-configured', message: 'The server-side proxy is not fully configured. No browser credentials are required or accepted.' };
  }
  if (code === 'provider_contract_mismatch') {
    return { status: 'invalid', message: 'The provider response did not match the approved school, session and aggregate contract. The response was rejected.' };
  }
  return {
    status: 'unavailable',
    message: status === 404
      ? 'The server-side proxy is not deployed on this host yet.'
      : 'The read-only aggregate is temporarily unavailable. Local demo figures are never substituted.',
  };
}

export function ReportCentralView({ nav }: { nav: Nav }) {
  const module = moduleById.get('report-central')!;
  const [state, setState] = useState<ViewState>({ status: 'loading' });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    if (window.location.hostname === 'zzpsah.github.io') {
      setState({
        status: 'not-deployed',
        message: 'The current GitHub Pages site is static and cannot run the server-side proxy. The Vercel API host has not been deployed yet.',
      });
      return () => { cancelled = true; controller.abort(); };
    }

    setState({ status: 'loading' });
    fetch('/api/report-central', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: controller.signal,
    }).then(async result => {
      let payload: unknown = null;
      try { payload = await result.json(); } catch { /* mapped to a generic unavailable state */ }
      if (cancelled) return;
      if (!result.ok) {
        setState(errorState(payload, result.status));
        return;
      }
      if (!isReportCentralEnvelope(payload, isReportCentralAggregate)) {
        setState({
          status: 'invalid',
          message: 'The provider response failed the school/session/field validation checks and was rejected.',
        });
        return;
      }
      setState({ status: 'ready', envelope: payload });
    }).catch(() => {
      if (!cancelled) {
        setState({
          status: 'unavailable',
          message: 'The read-only aggregate could not be reached. No local demo figures are substituted.',
        });
      }
    });

    return () => { cancelled = true; controller.abort(); };
  }, [refreshKey]);

  const envelope = state.status === 'ready' ? state.envelope : null;
  const aggregate = envelope?.data;
  const statusLabel = state.status === 'ready'
    ? 'Connected · read only'
    : state.status === 'loading' ? 'Checking' : 'Not connected';
  const statusTone = state.status === 'ready' ? 'ok' : state.status === 'loading' ? 'mute' : 'warn';
  const heroTitle = state.status === 'ready'
    ? 'Verified aggregate data is available'
    : state.status === 'loading' ? 'Checking the read-only connection' : 'Live data is not available yet';
  const heroPill = state.status === 'ready' ? 'Verified contract' : state.status === 'loading' ? 'Checking' : 'Unavailable';

  return <>
    <PageHead module={module} crumb="Operations · aggregate read-only workspace">
      <Pill tone={statusTone}>{statusLabel}</Pill>
      <Button variant="outline" disabled={state.status === 'loading'} onClick={() => setRefreshKey(value => value + 1)}>
        <RefreshCw size={14} /> Refresh
      </Button>
      <Button variant="outline" onClick={() => nav.go('integrations')}>Connection details <ArrowRight size={14} /></Button>
      <Button onClick={() => window.open('https://reportcentral.vercel.app', '_blank', 'noopener,noreferrer')}>Open secure portal <ExternalLink size={14} /></Button>
    </PageHead>

    <section className="blueprint-hero" aria-labelledby="rc-status-title">
      <span className="tile-icon">{state.status === 'ready' ? <FileCheck2 aria-hidden="true" /> : <ShieldAlert aria-hidden="true" />}</span>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="rc-status-title">{heroTitle}</h2>
          <Pill tone={state.status === 'ready' ? 'ok' : 'warn'}>{heroPill}</Pill>
        </div>
        <p>{state.status === 'ready'
          ? 'This public dashboard is displaying only the approved aggregate sections from Report Central. It has no student-level or write capability.'
          : state.status === 'loading'
            ? 'The dashboard is checking the server-side proxy. No browser token or user login is used.'
            : state.message}</p>
      </div>
    </section>

    <div className="insights" aria-label="Report Central aggregate summary">
      <Metric label="Current snapshots" value={aggregate?.overview.currentSnapshots} description="Current successful snapshots" />
      <Metric label="Failed snapshots" value={aggregate?.overview.failedSnapshots} description="Recorded failed snapshots" />
      <Metric label="Open conflicts" value={aggregate?.overview.openConflicts} description="Open cross-source conflicts" />
      <Metric label="Import attempts" value={aggregate?.importAudit.attempts} description="School-scoped audit records only" />
    </div>

    <div className="blueprint-grid">
      <Panel title="Source comparison" meta="Sources remain independent">
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Source</th><th>Snapshot count</th><th>Last snapshot</th><th>Connection</th></tr></thead>
            <tbody>{sourceRows.map(source => {
              const record = aggregate?.sourceComparison.sources.find(item => item.sourceId === source.id);
              return <tr key={source.id}>
                <td><strong>{source.label}</strong><small className="block text-muted-foreground">{source.owner}</small></td>
                <td>{count(record?.currentSnapshotCount)}</td>
                <td>{timestamp(record?.lastSnapshotAt)}</td>
                <td><Pill tone={record ? 'ok' : 'mute'}>{record ? 'Verified' : 'Not connected'}</Pill></td>
              </tr>;
            })}</tbody>
          </table>
        </div>
        <p className="foot-line">No source is treated as a fallback for the other. Each count and timestamp comes from its own verified source mapping.</p>
      </Panel>

      <Panel title="Conflict summary" meta="Severity totals only">
        <div className="card-rows">
          <div><span><ShieldAlert size={14} className="inline mr-2" />Errors</span><strong>{count(aggregate?.conflictSummary.bySeverity.error)}</strong></div>
          <div><span>Warnings</span><strong>{count(aggregate?.conflictSummary.bySeverity.warning)}</strong></div>
          <div><span>Information</span><strong>{count(aggregate?.conflictSummary.bySeverity.info)}</strong></div>
          <div><span>Open total</span><strong>{count(aggregate?.conflictSummary.openTotal)}</strong></div>
        </div>
        <p className="foot-line">No student-level conflict rows or source values are displayed in this dashboard.</p>
      </Panel>
    </div>

    <div className="blueprint-grid">
      <Panel title="Import audit" meta="Aggregate execution totals">
        <div className="card-rows">
          <div><span>Attempts</span><strong>{count(aggregate?.importAudit.attempts)}</strong></div>
          <div><span>Succeeded</span><strong>{count(aggregate?.importAudit.succeeded)}</strong></div>
          <div><span>Failed</span><strong>{count(aggregate?.importAudit.failed)}</strong></div>
          <div><span>Ignored duplicates</span><strong>{count(aggregate?.importAudit.ignoredDuplicates)}</strong></div>
          <div><span>Latest attempt</span><strong>{timestamp(aggregate?.importAudit.latestAttemptAt)}</strong></div>
        </div>
        <p className="foot-line">Only imports with verified school scope are counted. Historical attempts without a school mapping are excluded, not guessed.</p>
      </Panel>
      <Panel title="Snapshot and freshness" meta="Provider timestamps only">
        <div className="card-rows">
          <div><span><Database size={14} className="inline mr-2" />Read-model id</span><strong>{envelope?.snapshot.id ?? '—'}</strong></div>
          <div><span>Read-model version</span><strong>{envelope?.snapshot.version ?? '—'}</strong></div>
          <div><span><Clock3 size={14} className="inline mr-2" />Retrieved at</span><strong>{timestamp(envelope?.retrievedAt)}</strong></div>
          <div><span>Last successful snapshot</span><strong>{timestamp(aggregate?.overview.lastSuccessfulSnapshotAt)}</strong></div>
        </div>
      </Panel>
    </div>

    <Panel title="Connection acceptance gates" meta={`Contract v${REPORT_CENTRAL_CONTRACT_VERSION} · public read-only · no write capability`}>
      <ul className="check-list">
        <li><FileCheck2 size={14} aria-hidden="true" />Verify the canonical Tetahali school and both source mappings in Report Central</li>
        <li><GitCompareArrows size={14} aria-hidden="true" />Apply and verify school-scoped import audit migration 022</li>
        <li><ShieldAlert size={14} aria-hidden="true" />Store the dedicated machine token only in server environments, never in the browser</li>
        <li><FileBarChart size={14} aria-hidden="true" />Approve public aggregate publication and validate every response against the contract</li>
      </ul>
      <p className="scope-note">{state.status === 'ready' ? 'Accepted provider scope: ' : 'Expected contract scope only — not yet provider-verified: '}
        <strong>{REPORT_CENTRAL_SCOPE.schoolName}</strong> · school key <code>{REPORT_CENTRAL_SCOPE.schoolKey}</code> · session <code>{REPORT_CENTRAL_SCOPE.academicSession}</code>.
      </p>
    </Panel>

    <p className="foot-line">This screen is read-only. Snapshot creation, source fetches, imports, conflict resolution and portal writes remain in their owning systems. No VidyaDesk login is required.</p>
  </>;
}

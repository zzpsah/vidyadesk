import { ArrowRight, Clock3, Database, FileBarChart, FileCheck2, GitCompareArrows, ShieldAlert } from 'lucide-react';
import { PageHead, Panel, Pill } from '@/components/common';
import { Button } from '@/components/ui/button';
import { REPORT_CENTRAL_CONTRACT_VERSION, REPORT_CENTRAL_SCOPE } from '@/core/report-central-contract';
import { moduleById } from '@/core/modules';
import type { Nav } from '@/core/nav';

const sourceRows = [
  { id: 'udise', label: 'UDISE+', owner: 'UDISE+ source snapshot' },
  { id: 'eshikshakosh', label: 'e-ShikshaKosh', owner: 'e-ShikshaKosh source snapshot' },
] as const;

function WaitingMetric({ label, description }: { label: string; description: string }) {
  return <div className="insight">
    <h3>{label}</h3>
    <strong aria-label="Not available">—</strong>
    <em>{description}</em>
  </div>;
}

export function ReportCentralView({ nav }: { nav: Nav }) {
  const module = moduleById.get('report-central')!;
  return <>
    <PageHead module={module} crumb="Operations · aggregate read-only workspace">
      <Pill tone="warn">Not connected</Pill>
      <Button variant="outline" onClick={() => nav.go('integrations')}>Connection details <ArrowRight size={14} /></Button>
    </PageHead>

    <section className="blueprint-hero" aria-labelledby="rc-status-title">
      <span className="tile-icon"><ShieldAlert aria-hidden="true" /></span>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="rc-status-title">Live data is not available yet</h2>
          <Pill tone="warn">Unconfigured</Pill>
        </div>
        <p>No provider request has been made. The panels below are deliberately empty; VidyaDesk will not substitute fictional figures, old checkpoints or local demo records for Report Central data.</p>
      </div>
    </section>

    <div className="insights" aria-label="Report Central aggregate summary">
      <WaitingMetric label="Current snapshots" description="Awaiting verified provider read" />
      <WaitingMetric label="Failed snapshots" description="Awaiting verified provider read" />
      <WaitingMetric label="Open conflicts" description="Awaiting verified provider read" />
      <WaitingMetric label="Import attempts" description="Awaiting verified provider read" />
    </div>

    <div className="blueprint-grid">
      <Panel title="Source comparison" meta="Sources remain independent">
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Source</th><th>Snapshot count</th><th>Last snapshot</th><th>Connection</th></tr></thead>
            <tbody>{sourceRows.map(source => <tr key={source.id}>
              <td><strong>{source.label}</strong><small className="block text-muted-foreground">{source.owner}</small></td>
              <td>—</td><td>—</td><td><Pill tone="mute">Not connected</Pill></td>
            </tr>)}</tbody>
          </table>
        </div>
        <p className="foot-line">No source is treated as a fallback for the other. Each count and timestamp will come from its own verified snapshot.</p>
      </Panel>

      <Panel title="Conflict summary" meta="Severity totals only">
        <div className="card-rows">
          <div><span><ShieldAlert size={14} className="inline mr-2" />Errors</span><strong>—</strong></div>
          <div><span>Warnings</span><strong>—</strong></div>
          <div><span>Information</span><strong>—</strong></div>
          <div><span>Open total</span><strong>—</strong></div>
        </div>
        <p className="foot-line">No student-level conflict rows or source values are displayed in this dashboard.</p>
      </Panel>
    </div>

    <div className="blueprint-grid">
      <Panel title="Import audit" meta="Aggregate execution totals">
        <div className="card-rows">
          <div><span>Attempts</span><strong>—</strong></div>
          <div><span>Succeeded</span><strong>—</strong></div>
          <div><span>Failed</span><strong>—</strong></div>
          <div><span>Ignored duplicates</span><strong>—</strong></div>
          <div><span>Latest attempt</span><strong>—</strong></div>
        </div>
      </Panel>
      <Panel title="Snapshot and freshness" meta="Provider timestamps only">
        <div className="card-rows">
          <div><span><Database size={14} className="inline mr-2" />Snapshot id</span><strong>—</strong></div>
          <div><span>Snapshot version</span><strong>—</strong></div>
          <div><span><Clock3 size={14} className="inline mr-2" />Retrieved at</span><strong>—</strong></div>
          <div><span>Last successful snapshot</span><strong>—</strong></div>
        </div>
      </Panel>
    </div>

    <Panel title="Connection acceptance gates" meta={`Contract v${REPORT_CENTRAL_CONTRACT_VERSION} · no write capability`}>
      <ul className="check-list">
        <li><FileCheck2 size={14} aria-hidden="true" />Confirm the actual school key and active session with Report Central</li>
        <li><GitCompareArrows size={14} aria-hidden="true" />Agree separate UDISE+ and e-ShikshaKosh aggregate read endpoints</li>
        <li><ShieldAlert size={14} aria-hidden="true" />Implement server-side authentication, role checks and field redaction</li>
        <li><FileBarChart size={14} aria-hidden="true" />Validate every response against the versioned aggregate contract</li>
      </ul>
      <p className="scope-note">Expected contract scope only — not yet provider-verified: <strong>{REPORT_CENTRAL_SCOPE.schoolName}</strong> · school key <code>{REPORT_CENTRAL_SCOPE.schoolKey}</code> · session <code>{REPORT_CENTRAL_SCOPE.academicSession}</code>. Confirm all three against the provider before enabling reads.</p>
    </Panel>

    <p className="foot-line">This screen is a read-only presentation layer. Snapshot creation, source fetches, imports, conflict resolution and portal writes remain in their owning systems.</p>
  </>;
}

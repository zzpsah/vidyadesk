import { ExternalLink, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHead, Panel, Pill } from '@/components/common';
import { dataSources, integrations } from '@/core/integrations';
import { REPORT_CENTRAL_CONTRACT_VERSION, REPORT_CENTRAL_SCOPE } from '@/core/report-central-contract';
import type { Nav } from '@/core/nav';

export function IntegrationsView({ nav }: { nav: Nav }) {
  return <>
    <PageHead module={{ id: 'integrations', name: 'Integrations', nav: 'Integrations', blurb: '', group: 'Operations', status: 'integration', icon: ExternalLink }} crumb="Operations · read-only registry">
      <Pill tone="mute">No live data connections</Pill>
    </PageHead>

    <div className="blueprint-hero">
      <span className="tile-icon"><LockKeyhole aria-hidden="true" /></span>
      <div>
        <h2>One dashboard, clear system boundaries</h2>
        <p>VidyaDesk records which external systems may contribute to the future workspace. It does not log in, fetch, submit, or copy sensitive records.</p>
      </div>
    </div>

    <div className="blueprint-grid">
      {integrations.map(integration => <Panel key={integration.id} title={integration.name} meta={integration.status === 'external-system' ? 'External system' : 'Read-only planned'}>
        <p>{integration.purpose}</p>
        <p className="foot-line"><strong>Owner:</strong> {integration.owner}</p>
        <p className="foot-line"><strong>Data domains:</strong> {integration.dataDomains.join(' · ')}</p>
        <p className="scope-note">{integration.boundary}</p>
      </Panel>)}
    </div>

    <Panel title="Report Central · integration contract" meta={`Contract v${REPORT_CENTRAL_CONTRACT_VERSION}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Pill tone="warn">Unconfigured · no requests sent</Pill>
        <Pill tone="mute">Aggregate read models only</Pill>
      </div>
      <p className="foot-line">School scope: <strong>{REPORT_CENTRAL_SCOPE.schoolName}</strong></p>
      <p className="foot-line">Academic session: <strong>2026–27</strong></p>
      <p className="foot-line">Planned views: overview counts, UDISE/e-ShikshaKosh source comparison, conflict totals and import-audit totals.</p>
      <p className="scope-note">The server-side proxy is implemented but remains disabled. The Report Central provider endpoint is in PR #3; migration 022 and evidence-backed school mappings are still pending. No requests are sent. No student-level rows, names, PENs, Aadhaar values, source values or credentials are accepted by this UI contract.</p>
      <Button variant="outline" onClick={() => nav.go('report-central')}>Open Report Central dashboard <ExternalLink size={14} /></Button>
    </Panel>

    <Panel title="Integration activation gates" meta="Checked 1 Nov 2026">
      <ul className="list-disc space-y-2 pl-5 text-sm">
        <li><strong>Report Central:</strong> verify both school-source mappings, apply migration 022 and provision a dedicated server token.</li>
        <li><strong>Digital Letter Registry:</strong> provision a dedicated viewer account, verify the exact archive name and approve a read-only network path.</li>
        <li><strong>eShikshaKosh:</strong> review the fixed-school aggregate status endpoint in PR #1, provision its dedicated server-only token and approve the private network path.</li>
        <li><strong>UDISE+:</strong> review the fixed-school aggregate status endpoint in PR #11, provision its dedicated server-only token and approve the private network path.</li>
        <li><strong>School Data Records:</strong> verify the primary Postgres schema and canonical school mapping before exposing any student data.</li>
      </ul>
      <p className="scope-note">These are activation blockers, not failed services. Local HTTP health checks are not proof of record-level correctness or successful portal sessions.</p>
    </Panel>

    <Panel title="UMV data source map" meta="Checkpoint-aware">
      <div className="table-scroll"><table className="data-table"><thead><tr><th>Source</th><th>Role</th><th>Domains</th><th>Freshness</th><th>Handling</th></tr></thead><tbody>
        {dataSources.map(source => <tr key={source.id}><td><strong>{source.name}</strong></td><td>{source.role}</td><td>{source.domains.join(' · ')}</td><td>{source.freshness}</td><td><Pill tone={source.sensitivity === 'restricted' ? 'warn' : 'accent'}>{source.sensitivity}</Pill></td></tr>)}
      </tbody></table></div>
    </Panel>

    <p className="foot-line">The next step is to complete the Report Central scope review, then activate the DLR viewer-scoped summary when its service identity and network path are approved. Credentials, portal actions and production records remain outside this browser-only workspace.</p>
  </>;
}

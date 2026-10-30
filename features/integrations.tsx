import { ExternalLink, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHead, Panel, Pill } from '@/components/common';
import { dataSources, integrations } from '@/core/integrations';
import { REPORT_CENTRAL_CONTRACT_VERSION, REPORT_CENTRAL_SCOPE } from '@/core/report-central-contract';
import type { Nav } from '@/core/nav';

export function IntegrationsView({ nav }: { nav: Nav }) {
  return <>
    <PageHead module={{ id: 'integrations', name: 'Integrations', nav: 'Integrations', blurb: '', group: 'Operations', status: 'live', icon: ExternalLink }} crumb="Operations · read-only registry">
      <Pill tone="mute">No live connections</Pill>
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
      <p className="scope-note">The contract is defined in code, but no adapter or authenticated server proxy is configured. No student-level rows, names, PENs, Aadhaar values, source values or credentials are accepted by this UI contract.</p>
      <Button variant="outline" onClick={() => nav.go('report-central')}>Open Report Central dashboard <ExternalLink size={14} /></Button>
    </Panel>

    <Panel title="UMV data source map" meta="Checkpoint-aware">
      <div className="table-scroll"><table className="data-table"><thead><tr><th>Source</th><th>Role</th><th>Domains</th><th>Freshness</th><th>Handling</th></tr></thead><tbody>
        {dataSources.map(source => <tr key={source.id}><td><strong>{source.name}</strong></td><td>{source.role}</td><td>{source.domains.join(' · ')}</td><td>{source.freshness}</td><td><Pill tone={source.sensitivity === 'restricted' ? 'warn' : source.sensitivity === 'local-fixture' ? 'mute' : 'accent'}>{source.sensitivity}</Pill></td></tr>)}
      </tbody></table></div>
    </Panel>

    <p className="foot-line">The next integration step is a separately verified read-only adapter, beginning with Report Central. Credentials, portal actions and production data remain outside this browser-only workspace.</p>
  </>;
}

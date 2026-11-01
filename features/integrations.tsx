import { ExternalLink, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHead, Panel, Pill } from '@/components/common';
import { dataSources, integrations } from '@/core/integrations';
import { REPORT_CENTRAL_CONTRACT_VERSION, REPORT_CENTRAL_SCOPE } from '@/core/report-central-contract';
import type { Nav } from '@/core/nav';
import { UdiseStatusPanel } from '@/features/udise-status';
import { EshikshakoshStatusPanel } from '@/features/eshikshakosh-status';

export function IntegrationsView({ nav }: { nav: Nav }) {
  return <>
    <PageHead module={{ id: 'integrations', name: 'Integrations', nav: 'Integrations', blurb: '', group: 'Operations', status: 'integration', icon: ExternalLink }} crumb="Operations · system connections">
      <Pill tone="mute">Owner applications remain active</Pill>
      <Button variant="outline" onClick={() => nav.go('workspaces')}>Open operational workspaces <ExternalLink size={14} /></Button>
    </PageHead>

    <div className="blueprint-hero">
      <span className="tile-icon"><LockKeyhole aria-hidden="true" /></span>
      <div>
        <h2>One dashboard, real operations in the owner applications</h2>
        <p>Use the Operational Workspaces page to launch the existing systems and carry out their full workflows. VidyaDesk is being connected to their APIs without replacing their databases or weakening their permissions.</p>
      </div>
    </div>

    <div className="blueprint-grid">
      {integrations.map(integration => <Panel key={integration.id} title={integration.name} meta={integration.status === 'operational-app' ? 'Operational owner application' : integration.status === 'external-system' ? 'External data owner' : 'In-page integration pending'}>
        <p>{integration.purpose}</p>
        <p className="foot-line"><strong>Owner:</strong> {integration.owner}</p>
        <p className="foot-line"><strong>Data domains:</strong> {integration.dataDomains.join(' · ')}</p>
        <p className="scope-note">{integration.boundary}</p>
      </Panel>)}
    </div>

    <UdiseStatusPanel />
    <EshikshakoshStatusPanel />

    <Panel title="Report Central · integration contract" meta={`Contract v${REPORT_CENTRAL_CONTRACT_VERSION}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Pill tone="warn">Unconfigured · no requests sent</Pill>
        <Pill tone="mute">Aggregate read models only</Pill>
      </div>
      <p className="foot-line">School scope: <strong>{REPORT_CENTRAL_SCOPE.schoolName}</strong></p>
      <p className="foot-line">Academic session: <strong>2026–27</strong></p>
      <p className="foot-line">Planned views: overview counts, UDISE/e-ShikshaKosh source comparison, conflict totals and import-audit totals.</p>
      <p className="scope-note">The full Report Central application supports source imports, student reconciliation, conflict resolution and audit history. The VidyaDesk public summary feed is a separate aggregate-only endpoint and remains disabled until school mapping, migration 022 and dedicated server credentials are verified. Use the full owner application for record-level work.</p>
      <Button variant="outline" onClick={() => nav.go('report-central')}>Open Report Central dashboard <ExternalLink size={14} /></Button>
    </Panel>

    <Panel title="Integration activation gates" meta="Checked 1 Nov 2026">
      <ul className="list-disc space-y-2 pl-5 text-sm">
        <li><strong>Report Central:</strong> PR #3 is merged. Verify both school-source mappings, apply migration 022 and provision a dedicated server token before activating the public summary feed.</li>
        <li><strong>Digital Letter Registry:</strong> PR #5 is merged. The full letter intake, review, search and archive workflows remain in the owner application; the VidyaDesk summary identity is still unconfigured.</li>
        <li><strong>eShikshaKosh:</strong> PR #1 is merged. Student OTR and teacher-report jobs remain executable in the owner workbench; the VidyaDesk status feed needs its dedicated token and private bridge.</li>
        <li><strong>UDISE+:</strong> PR #11 and the Report Central bridge in PR #3 are merged. GP/EP/FP previews and approved writes remain available in the owner application; the separate status feed needs dedicated tokens and approval.</li>
        <li><strong>School Data Records:</strong> verify the primary Postgres schema and canonical school mapping before exposing any student data.</li>
      </ul>
      <p className="scope-note">These are blockers for in-page API connections, not for using the owner applications. HTTP health checks do not prove record-level correctness or successful portal sessions.</p>
    </Panel>

    <Panel title="UMV data source map" meta="Checkpoint-aware">
      <div className="table-scroll"><table className="data-table"><thead><tr><th>Source</th><th>Role</th><th>Domains</th><th>Freshness</th><th>Handling</th></tr></thead><tbody>
        {dataSources.map(source => <tr key={source.id}><td><strong>{source.name}</strong></td><td>{source.role}</td><td>{source.domains.join(' · ')}</td><td>{source.freshness}</td><td><Pill tone={source.sensitivity === 'restricted' ? 'warn' : 'accent'}>{source.sensitivity}</Pill></td></tr>)}
      </tbody></table></div>
    </Panel>

    <p className="foot-line">Use Operational Workspaces for live actions today. In-page actions will be enabled incrementally after each owner API, session and permission boundary is verified.</p>
  </>;
}

import { ArrowUpRight, BookOpenCheck, Boxes, ExternalLink, FileBarChart, FileText, GitBranch, IndianRupee, Network, ShieldCheck, Workflow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHead, Panel, Pill } from '@/components/common';
import { operationalWorkspaces, workspaceGroups } from '@/core/workspaces';
import type { Nav } from '@/core/nav';

const icons = {
  udise: Network,
  eshikshakosh: BookOpenCheck,
  letters: FileText,
  'report-central': FileBarChart,
  payroll: IndianRupee,
  'school-data-records': ShieldCheck,
  n8n: Workflow,
} as const;

const accessLabel = {
  application: 'Open operational app',
  protected: 'Protected app',
  'repository-only': 'Data model · no web console',
  'private-service': 'Private service',
} as const;

export function WorkspacesView({ nav }: { nav: Nav }) {
  return <>
    <PageHead module={{ id: 'workspaces', name: 'Operational workspaces', nav: 'Workspaces', blurb: 'Run school operations in the applications that own each workflow and its records.', group: 'Operations', status: 'integration', icon: Boxes }} crumb="VidyaDesk · Workbench">
      <Pill tone="mute">7 registered workspaces</Pill>
    </PageHead>

    <section className="blueprint-hero" aria-labelledby="workspaces-intro">
      <span className="tile-icon"><Boxes aria-hidden="true" /></span>
      <div>
        <h2 id="workspaces-intro">One starting point. Real operations in the owning systems.</h2>
        <p>Choose the work you need to perform. UDISE+, eShikshaKosh, Report Central, Digital Letter Registry and Vetan-Vipatra keep their own operational records; VidyaDesk brings their workflows together without creating duplicate databases.</p>
      </div>
    </section>

    {workspaceGroups.map(group => {
      const items = operationalWorkspaces.filter(item => item.group === group);
      if (!items.length) return null;
      return <section className="workspace-group" key={group} aria-label={group}>
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <h2 className="text-lg font-semibold">{group}</h2>
          <Pill tone="mute">{items.length} workspace{items.length === 1 ? '' : 's'}</Pill>
        </div>
        <div className="blueprint-grid">
          {items.map(item => {
            const Icon = icons[item.id as keyof typeof icons];
            return <Panel key={item.id} title={item.name} meta={item.owner}>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Pill tone={item.access === 'application' ? 'ok' : item.access === 'protected' ? 'warn' : 'mute'}>{accessLabel[item.access]}</Pill>
              </div>
              <p>{item.purpose}</p>
              <div className="workspace-actions mt-3">
                {item.actions.map(action => <div className="workspace-action" key={action.label}>
                  <strong><Icon size={14} aria-hidden="true" />{action.label}</strong>
                  <p>{action.detail}</p>
                </div>)}
              </div>
              <p className="scope-note">{item.note}</p>
              {item.applicationUrl && <div className="workspace-action-links mt-4" aria-label={`${item.name} actions`}>
                {item.actions.map(action => <Button asChild key={action.label} size="sm" variant="outline">
                  <a href={item.applicationUrl} target="_blank" rel="noopener noreferrer" title={action.detail}>{action.label} <ExternalLink size={13} /></a>
                </Button>)}
              </div>}
              <div className="flex flex-wrap gap-2 mt-3">
                <Button asChild size="sm" variant="ghost"><a href={item.repositoryUrl} target="_blank" rel="noopener noreferrer">Source project <ArrowUpRight size={14} /></a></Button>
              </div>
            </Panel>;
          })}
        </div>
      </section>;
    })}

    <Panel title="How actions work" meta="Operational boundary">
      <ul className="check-list">
        <li><ShieldCheck size={14} /> Create, edit, submit, approve and export actions run in the owning application.</li>
        <li><ShieldCheck size={14} /> UDISE+ portal writes remain preview-first and require explicit approval and read-back.</li>
        <li><ShieldCheck size={14} /> Student and staff records are not copied into browser storage or duplicated in a second database.</li>
        <li><ShieldCheck size={14} /> VidyaDesk will progressively add authenticated in-page actions where a stable owner API and session boundary exist.</li>
      </ul>
      <div className="flex flex-wrap gap-2 mt-4">
        <Button variant="outline" onClick={() => nav.go('report-central')}>Open source reconciliation <FileBarChart size={14} /></Button>
        <Button variant="outline" onClick={() => nav.go('integrations')}>Integration status <GitBranch size={14} /></Button>
      </div>
    </Panel>
  </>;
}

import { ArrowUpRight, Boxes, ExternalLink, FileText, GitBranch, Network, ShieldCheck } from 'lucide-react';
import { PageHead, Panel, Pill } from '@/components/common';
import { SCHOOL_PROFILE } from '@/core/school-profile';
import { infrastructureProjects, projects } from '@/core/projects';

const icons = { records: ShieldCheck, reports: Boxes, letters: FileText, udise: Network, eshikshakosh: Network, automation: GitBranch } as const;

export function OverviewView() {
  return <>
    <PageHead module={{ id: 'overview', name: 'VidyaDesk', nav: 'Overview', blurb: 'One control centre for the school’s existing systems.', group: 'Operations', status: 'integration', icon: Boxes }} crumb={SCHOOL_PROFILE.shortName}>
      <Pill tone="warn">Integrations pending</Pill>
    </PageHead>

    <section className="blueprint-hero" aria-labelledby="workspace-intro">
      <span className="tile-icon"><ShieldCheck aria-hidden="true" /></span>
      <div>
        <h2 id="workspace-intro">{SCHOOL_PROFILE.fullName}</h2>
        <p>{SCHOOL_PROFILE.location} · Academic session {SCHOOL_PROFILE.session}. VidyaDesk is the unified launch and integration layer; each connected system remains the source of truth for its own records.</p>
      </div>
    </section>

    <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
      <div><h2 className="text-lg font-semibold">Existing school projects</h2><p className="text-sm text-muted-foreground">Only verified project repositories and known application entry points are listed.</p></div>
      <Pill tone="mute">{projects.length} registered projects</Pill>
    </div>

    <div className="blueprint-grid">
      {projects.map(project => {
        const Icon = icons[project.icon];
        return <Panel key={project.id} title={project.name} meta={project.owner}>
          <div className="flex flex-wrap gap-2 mb-3">
            <Pill tone="warn">Not connected to VidyaDesk</Pill>
            <Pill tone="mute">{project.kind}</Pill>
          </div>
          <p>{project.purpose}</p>
          <p className="foot-line"><strong>Owns:</strong> {project.ownership}</p>
          <p className="scope-note">{project.boundary}</p>
          <div className="flex flex-wrap gap-3 mt-3">
            {project.applicationUrl && <a className="inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4" href={project.applicationUrl} target="_blank" rel="noreferrer">Open application <ExternalLink size={14} /></a>}
            <a className="inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4" href={project.repositoryUrl} target="_blank" rel="noreferrer">Repository <ArrowUpRight size={14} /></a>
          </div>
        </Panel>;
      })}
    </div>

    <Panel title="Platform infrastructure" meta="Infrastructure dependencies · not school modules">
      <div className="card-rows">
        {infrastructureProjects.map(item => <div key={item.id} className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-3"><strong>{item.name}</strong><a className="inline-flex items-center gap-1 text-sm underline underline-offset-4" href={item.repositoryUrl} target="_blank" rel="noreferrer">Repository <ExternalLink size={13} /></a></div>
          <p>{item.purpose}</p>
          <p className="scope-note">{item.boundary}</p>
        </div>)}
      </div>
    </Panel>

    <div className="blueprint-grid mt-4">
      <Panel title="Data integrity" meta="Current operating rule">
        <ul className="check-list">
          <li><ShieldCheck size={14} /> No generated student, staff, attendance, fee or examination records</li>
          <li><ShieldCheck size={14} /> No source-system credentials or writes in the browser</li>
          <li><ShieldCheck size={14} /> Source projects remain authoritative until an approved integration is verified</li>
        </ul>
      </Panel>
      <Panel title="Connection readiness" meta="Honest status">
        <p>Project links are registered, but a repository or application URL does not prove that its API is connected. Connection status will change only after a real health check and a source-backed read test succeed.</p>
        <p className="scope-note">Private student and staff records remain unavailable here until the school-scoped authentication and read-only data gateway pass their security checks.</p>
      </Panel>
    </div>
  </>;
}

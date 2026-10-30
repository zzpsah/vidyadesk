import { Menu, Settings, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { modules, portalModuleGroups, portalModules } from '@/core/modules';
import { metric } from '@/core/metrics';
import { todayISO, useWorkspace } from '@/core/workspace';
import { dateLabel } from '@/core/format';
import type { Nav } from '@/core/nav';
import { SCHOOL_PROFILE } from '@/core/school-profile';

export function Sidebar({ route, nav, onClose }: { route: string; nav: Nav; onClose: () => void }) {
  const { school } = useWorkspace();

  const item = (moduleId: string, label: string, live: boolean) => (
    <button key={moduleId || 'overview'} className={`nav-item${route === moduleId ? ' active' : ''}`} onClick={() => nav.go(moduleId)}>
      <span className="nav-dot" aria-hidden="true" />
      <span className="nav-label">{label}</span>
      {moduleId !== 'overview' && <span className="nav-metric">{metric(school, moduleId)}</span>}
    </button>
  );

  return <div className="sidebar">
    <header className="side-brand">
      <span className="brand-mark" aria-hidden="true">{SCHOOL_PROFILE.initials}</span>
      <div><strong>{SCHOOL_PROFILE.shortName}</strong><span>VidyaDesk school desk</span></div>
      <Button variant="ghost" size="icon" className="side-close" aria-label="Close navigation" onClick={onClose}><X size={18} /></Button>
    </header>

    <nav className="side-nav" aria-label="Modules">
      {item('overview', 'Overview', true)}
      {portalModuleGroups.map(group => <div className="nav-group" key={group}>
        <p>{group}</p>
        {portalModules.filter(m => m.group === group).map(m => item(m.id, m.nav, false))}
      </div>)}
    </nav>

    <footer className="side-foot"><ShieldCheck size={15} aria-hidden="true" /><p>Offline workspace · fictional sample records only · {portalModules.length} modules available.</p></footer>
  </div>;
}

export function Topbar({ route, nav, onOpenMenu }: { route: string; nav: Nav; onOpenMenu: () => void }) {
  const { school } = useWorkspace();
  const module = modules.find(m => m.id === route);
  const crumbs = route === 'overview' ? ['Workspace', 'Overview'] : [module?.group ?? 'Module', module?.name ?? 'Module'];

  return <header className="topbar">
    <Button variant="ghost" size="icon" className="menu-button" aria-label="Open navigation" onClick={onOpenMenu}><Menu size={19} /></Button>
    <p className="crumbs"><span>{crumbs[0]}</span>{crumbs[1] && <><em>/</em><strong>{crumbs[1]}</strong></>}</p>
    <div className="topbar-right">
      <span className="date-chip">{dateLabel(todayISO())}</span>
      <span className="school-chip" title="Active school">{school.name}</span>
      <Button variant="ghost" size="icon" aria-label="School profile" onClick={() => nav.open({ kind: 'settings' })}><Settings size={18} /></Button>
      <span className="avatar" aria-label="School administrator">UM</span>
    </div>
  </header>;
}

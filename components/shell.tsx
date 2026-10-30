import { Menu, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { modules, portalModuleGroups, portalModules } from '@/core/modules';
import type { Nav } from '@/core/nav';
import { SCHOOL_PROFILE } from '@/core/school-profile';

export function Sidebar({ route, nav, onClose }: { route: string; nav: Nav; onClose: () => void }) {
  const item = (moduleId: string, label: string) => (
    <button key={moduleId || 'overview'} className={`nav-item${route === moduleId ? ' active' : ''}`} onClick={() => nav.go(moduleId)}>
      <span className="nav-dot" aria-hidden="true" />
      <span className="nav-label">{label}</span>

    </button>
  );

  return <div className="sidebar">
    <header className="side-brand">
      <span className="brand-mark" aria-hidden="true">{SCHOOL_PROFILE.initials}</span>
      <div><strong>{SCHOOL_PROFILE.shortName}</strong><span>VidyaDesk school desk</span></div>
      <Button variant="ghost" size="icon" className="side-close" aria-label="Close navigation" onClick={onClose}><X size={18} /></Button>
    </header>

    <nav className="side-nav" aria-label="Modules">
      {item('overview', 'Project overview')}
      {portalModuleGroups.map(group => <div className="nav-group" key={group}>
        <p>{group}</p>
        {portalModules.filter(m => m.group === group).map(m => item(m.id, m.nav))}
      </div>)}
    </nav>

    <footer className="side-foot"><p>Project hub · source systems retain ownership of school records.</p></footer>
  </div>;
}

export function Topbar({ route, nav, onOpenMenu }: { route: string; nav: Nav; onOpenMenu: () => void }) {
  const module = modules.find(m => m.id === route);
  const crumbs = route === 'overview' ? ['VidyaDesk', 'Project overview'] : [module?.group ?? 'Module', module?.name ?? 'Module'];

  return <header className="topbar">
    <Button variant="ghost" size="icon" className="menu-button" aria-label="Open navigation" onClick={onOpenMenu}><Menu size={19} /></Button>
    <p className="crumbs"><span>{crumbs[0]}</span>{crumbs[1] && <><em>/</em><strong>{crumbs[1]}</strong></>}</p>
    <div className="topbar-right">
      <span className="school-chip" title="School workspace">UMV Tethali</span>
      <Button variant="ghost" size="icon" aria-label="School profile" onClick={() => nav.open({ kind: 'settings' })}><Settings size={18} /></Button>
      <span className="avatar" aria-label="School administrator">UM</span>
    </div>
  </header>;
}

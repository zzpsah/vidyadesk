import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    </nav>

    <footer className="side-foot"><p>Project hub · source systems retain ownership of school records.</p></footer>
  </div>;
}

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const crumbs = ['VidyaDesk', 'Project overview'];

  return <header className="topbar">
    <Button variant="ghost" size="icon" className="menu-button" aria-label="Open navigation" onClick={onOpenMenu}><Menu size={19} /></Button>
    <p className="crumbs"><span>{crumbs[0]}</span>{crumbs[1] && <><em>/</em><strong>{crumbs[1]}</strong></>}</p>
    <div className="topbar-right">
      <span className="school-chip" title="School workspace">UMV Tethali</span>
      <span className="avatar" aria-label="School administrator">UM</span>
    </div>
  </header>;
}

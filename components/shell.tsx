import { Menu, Plus, Settings, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { moduleGroups, modules } from '@/core/modules';
import { metric } from '@/core/metrics';
import { todayISO, useWorkspace } from '@/core/workspace';
import { dateLabel } from '@/core/format';
import type { Nav } from '@/core/nav';

export function Sidebar({ route, nav, onAddSchool, onClose }: { route: string; nav: Nav; onAddSchool: () => void; onClose: () => void }) {
  const { school, state, dispatch } = useWorkspace();

  const item = (moduleId: string, label: string, live: boolean) => (
    <button key={moduleId || 'overview'} className={`nav-item${route === moduleId ? ' active' : ''}`} onClick={() => nav.go(moduleId)}>
      <span className={`nav-dot${live ? ' live' : ''}`} aria-hidden="true" />
      <span className="nav-label">{label}</span>
      {live && moduleId !== 'overview' && <span className="nav-metric">{metric(school, moduleId)}</span>}
    </button>
  );

  return <div className="sidebar">
    <header className="side-brand">
      <span className="brand-mark" aria-hidden="true">V</span>
      <div><strong>VidyaDesk</strong><span>Multi-school workspace</span></div>
      <Button variant="ghost" size="icon" className="side-close" aria-label="Close navigation" onClick={onClose}><X size={18} /></Button>
    </header>

    <div className="school-picker">
      <label htmlFor="school-switch">Active school</label>
      <select id="school-switch" value={school.id} onChange={e => dispatch({ type: 'switch-school', id: e.target.value })}>
        {state.schools.map(entry => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
      </select>
      <p className="school-sub">{school.category} · {school.block}</p>
      <Button variant="outline" size="sm" className="add-school" onClick={onAddSchool}><Plus size={14} /> Add school</Button>
    </div>

    <nav className="side-nav" aria-label="Modules">
      {item('overview', 'Overview', true)}
      {moduleGroups.map(group => <div className="nav-group" key={group}>
        <p>{group}</p>
        {modules.filter(m => m.group === group).map(m => item(m.id, m.nav, m.status === 'live'))}
      </div>)}
    </nav>

    <footer className="side-foot"><ShieldCheck size={15} aria-hidden="true" /><p>Fictional records, stored in this browser only. {state.schools.length} schools · {modules.length} modules registered.</p></footer>
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
      <span className="avatar" aria-label="Demo administrator">HO</span>
    </div>
  </header>;
}

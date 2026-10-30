import { useCallback, useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Sidebar, Topbar } from '@/components/shell';
import { DialogHost, type DialogState } from '@/components/dialogs';
import { ClassesView, AttendanceView, ExamsView, FeesView, StudentsView, TimetableView } from '@/features/academics';
import { LeaveView, StaffView, TransfersView } from '@/features/people';
import { MdmView, NoticesView, TicketsView } from '@/features/services';
import { ReportsView } from '@/features/reports';
import { BlueprintView } from '@/features/blueprint';
import { OverviewView } from '@/features/overview';
import { IntegrationsView } from '@/features/integrations';
import { WorkspaceProvider, useWorkspace } from '@/core/workspace';
import type { Nav } from '@/core/nav';

const ACADEMIC = ['students', 'attendance', 'classes', 'timetable', 'exams', 'fees'];
const TRANSFER = ['transfer-special', 'transfer-district', 'transfer-teacher', 'transfer-mutual'];

function renderView(route: string, nav: Nav) {
  if (route === 'overview') return <OverviewView nav={nav} />;
  if (ACADEMIC.includes(route)) {
    if (route === 'students') return <StudentsView nav={nav} />;
    if (route === 'attendance') return <AttendanceView nav={nav} />;
    if (route === 'classes') return <ClassesView nav={nav} />;
    if (route === 'timetable') return <TimetableView nav={nav} />;
    if (route === 'exams') return <ExamsView nav={nav} />;
    return <FeesView nav={nav} />;
  }
  if (route === 'staff') return <StaffView nav={nav} />;
  if (route === 'leave') return <LeaveView nav={nav} />;
  if (TRANSFER.includes(route)) return <TransfersView moduleId={route} nav={nav} />;
  if (route === 'notices') return <NoticesView nav={nav} />;
  if (route === 'tickets') return <TicketsView nav={nav} />;
  if (route === 'mdm') return <MdmView nav={nav} />;
  if (route === 'reports') return <ReportsView nav={nav} />;
  if (route === 'integrations') return <IntegrationsView nav={nav} />;
  return <BlueprintView moduleId={route} nav={nav} />;
}

function Workspace() {
  const { school } = useWorkspace();
  const [route, setRoute] = useState('overview');
  const [dialog, setDialog] = useState<DialogState>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const go = useCallback((moduleId: string) => {
    setRoute(moduleId);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  const nav: Nav = { go, open: setDialog };

  return <div className="app-shell">
    <a className="skip-link" href="#main">Skip to content</a>
    <aside className={`side-drawer${menuOpen ? ' open' : ''}`}>
      <Sidebar route={route} nav={nav} onClose={() => setMenuOpen(false)} onAddSchool={() => setDialog({ kind: 'add-school' })} />
    </aside>
    {menuOpen && <button className="scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}

    <div className="main-col">
      <Topbar route={route} nav={nav} onOpenMenu={() => setMenuOpen(true)} />
      <p className="data-note">Design workspace · fictional records · saved only in this browser. Nothing here logs in, syncs or files anything with a department.</p>
      <main id="main" className="workspace" key={`${route}-${school.id}`}>{renderView(route, nav)}</main>
      <footer className="app-foot">
        <span>VidyaDesk · school-agnostic workspace</span>
        <span>Not affiliated with, or an interface to, any government portal.</span>
      </footer>
    </div>

    <DialogHost dialog={dialog} onClose={() => setDialog(null)} />
    <Toaster richColors position="bottom-right" theme="light" />
  </div>;
}

export default function App() {
  return <WorkspaceProvider><Workspace /></WorkspaceProvider>;
}

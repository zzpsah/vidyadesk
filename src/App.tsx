import { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Sidebar, Topbar } from '@/components/shell';
import { OverviewView } from '@/features/overview';
import { IntegrationsView } from '@/features/integrations';
import { ReportCentralView } from '@/features/report-central';
import { WorkspacesView } from '@/features/workspaces';
import { resolveWorkspaceRoute } from '@/core/route-registry';
import { ModuleErrorBoundary } from '@/components/module-error-boundary';
import { SCHOOL_PROFILE } from '@/core/school-profile';
import type { Nav } from '@/core/nav';

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [route, setRoute] = useState('overview');
  const nav: Nav = { go: (next) => { setRoute(resolveWorkspaceRoute(next)); setMenuOpen(false); }, open: () => undefined };

  return <div className="app-shell">
    <a className="skip-link" href="#main">Skip to content</a>
    <aside className={'side-drawer' + (menuOpen ? ' open' : '')}>
      <Sidebar route={route} nav={nav} onClose={() => setMenuOpen(false)} />
    </aside>
    {menuOpen && <button className="scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}

    <div className="main-col">
      <Topbar route={route} onOpenMenu={() => setMenuOpen(true)} />
      <p className="data-note">{SCHOOL_PROFILE.shortName} · {SCHOOL_PROFILE.location} · {SCHOOL_PROFILE.session} · Project links are registered; source-data integrations are not yet connected.</p>
      <main id="main" className="workspace">
        <ModuleErrorBoundary moduleName={route}>
          {route === 'workspaces' ? <WorkspacesView nav={nav} />
          : route === 'report-central' ? <ReportCentralView nav={nav} />
            : route === 'integrations' ? <IntegrationsView nav={nav} />
              : <OverviewView nav={nav} />}
        </ModuleErrorBoundary>
      </main>
      <footer className="app-foot">
        <span>VidyaDesk · {SCHOOL_PROFILE.fullName}</span>
        <span>Source projects retain their own data and operational boundaries.</span>
      </footer>
    </div>
    <Toaster richColors position="bottom-right" theme="light" />
  </div>;
}

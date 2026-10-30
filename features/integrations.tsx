import { ExternalLink, LockKeyhole } from 'lucide-react';
import { PageHead, Panel, Pill } from '@/components/common';
import { integrations } from '@/core/integrations';
import type { Nav } from '@/core/nav';

export function IntegrationsView(_props: { nav: Nav }) {
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

    <p className="foot-line">The next integration step is a separately verified read-only adapter, beginning with Report Central. Credentials, portal actions and production data remain outside this browser-only workspace.</p>
  </>;
}

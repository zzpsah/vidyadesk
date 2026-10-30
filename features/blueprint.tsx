import { Check, Layers3, ListChecks, Boxes, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHead, Panel, Pill } from '@/components/common';
import { liveModules, moduleById, modules } from '@/core/modules';
import { useWorkspace } from '@/core/workspace';
import type { Nav } from '@/core/nav';

export function BlueprintView({ moduleId, nav }: { moduleId: string; nav: Nav }) {
  const { state, dispatch } = useWorkspace();
  const module = moduleById.get(moduleId);
  if (!module) return null;
  const isFocus = state.focusModuleId === moduleId;
  const siblings = modules.filter(m => m.status === 'blueprint');

  return <>
    <PageHead module={module} crumb={`${module.group} · blueprint`}>
      <Pill tone="warn">Not built yet</Pill>
      <Button variant={isFocus ? 'outline' : 'default'} onClick={() => dispatch({ type: 'set-focus', moduleId: isFocus ? null : moduleId })}>{isFocus ? 'Unpin from overview' : 'Pin as next build'}</Button>
    </PageHead>

    <div className="blueprint-hero">
      <span className="tile-icon"><module.icon aria-hidden="true" /></span>
      <div>
        <h2>Scope agreed, code not written</h2>
        <p>The registry already reserves this module id and its navigation slot, so building it means a view component plus the entities below — the shell does not change. Nothing on this page writes data.</p>
      </div>
    </div>

    <div className="blueprint-grid">
      <Panel title="Data it must hold" meta={`${module.entities?.length ?? 0} entities`} caption={<span><Boxes size={13} aria-hidden="true" /> Each entity becomes a table scoped by school id in the backend.</span>}>
        <ul className="spec-list">{(module.entities ?? []).map(entity => <li key={entity}><strong>{entity}</strong><span>scoped to one school</span></li>)}</ul>
      </Panel>
      <Panel title="Order of work" meta={`${module.workflow?.length ?? 0} steps`} caption={<span><Route size={13} aria-hidden="true" /> Each step ships behind the module id in the registry.</span>}>
        <ol className="step-list">{(module.workflow ?? []).map((step, index) => <li key={step}><span>{index + 1}</span>{step}</li>)}</ol>
      </Panel>
    </div>

    <Panel title="Build checklist" meta="What has to be true before this module can go live" caption={<span><ListChecks size={13} aria-hidden="true" /> Checks are product decisions, not code comments.</span>}>
      <ul className="check-list">{(module.checks ?? []).map(check => <li key={check}><Check size={14} aria-hidden="true" />{check}</li>)}</ul>
    </Panel>

    <section className="panel switch-plan">
      <Layers3 size={17} aria-hidden="true" />
      <div><strong>{siblings.length} blueprints in the queue</strong><span>Pin one to the overview and it becomes the tracked next module.</span></div>
      <div className="plan-chips">{siblings.map(sibling => <Button key={sibling.id} size="sm" variant={sibling.id === moduleId ? 'outline' : 'ghost'} onClick={() => nav.go(sibling.id)}>{sibling.nav}</Button>)}</div>
    </section>

    <p className="foot-line">{liveModules.length} modules already run against the same registry. Adding this one means a view component, entities in the data layer and a navigation entry — the shell does not change.</p>
  </>;
}

import assert from 'node:assert/strict';
import test from 'node:test';
import { modules, moduleGroups, portalModules, portalModuleGroups } from '../core/modules.ts';
import { isWorkspaceRoute, resolveWorkspaceRoute, validateModuleRegistry, workspaceRoutes } from '../core/route-registry.ts';

test('the school portal exposes no unbacked CRUD module routes', () => {
  assert.deepEqual(portalModules, []);
  assert.deepEqual(portalModuleGroups, []);
  assert.deepEqual(workspaceRoutes.filter(route => route.kind === 'module'), []);
  assert.deepEqual(workspaceRoutes.filter(route => route.kind === 'integration').map(route => route.id), ['report-central', 'integrations']);
});
test('unknown, retired and empty route input safely resolves to overview', () => {
  for (const candidate of ['', 'not-a-module', '__proto__', 'students', 'staff', 'fees', null, undefined]) {
    assert.equal(resolveWorkspaceRoute(candidate), 'overview');
    assert.equal(isWorkspaceRoute(candidate), false);
  }
});
test('only the overview and read-only integration workspaces are exposed', () => {
  for (const route of ['overview', 'report-central', 'integrations']) {
    assert.equal(resolveWorkspaceRoute(route), route);
    assert.equal(isWorkspaceRoute(route), true);
  }
});
test('legacy module registry is structurally valid and all old CRUD modules are retired', () => {
  assert.ok(modules.every(module => moduleGroups.includes(module.group)));
  assert.ok(modules.every(module => module.status === 'retired' || module.status === 'blueprint' || module.status === 'integration'));
  assert.deepEqual(validateModuleRegistry(), []);
});
test('every retained blueprint declares entities, workflow and acceptance checks', () => {
  for (const module of modules.filter(entry => entry.status === 'blueprint')) {
    assert.ok(module.entities?.length, module.id);
    assert.ok(module.workflow?.length, module.id);
    assert.ok(module.checks?.length, module.id);
  }
});

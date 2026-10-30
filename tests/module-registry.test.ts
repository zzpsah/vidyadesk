import assert from 'node:assert/strict';
import test from 'node:test';
import { modules, moduleGroups } from '../core/modules.ts';
import { isWorkspaceRoute, resolveWorkspaceRoute, validateModuleRegistry, workspaceRoutes } from '../core/route-registry.ts';

test('every registered module has exactly one workspace route', () => {
  const moduleRoutes = workspaceRoutes.filter(route => route.kind === 'module');
  assert.equal(moduleRoutes.length, modules.length);
  assert.deepEqual(moduleRoutes.map(route => route.id), modules.map(module => module.id));
});
test('unknown and empty route input safely resolves to overview', () => {
  for (const candidate of ['', 'not-a-module', '__proto__', null, undefined]) {
    assert.equal(resolveWorkspaceRoute(candidate), 'overview');
    assert.equal(isWorkspaceRoute(candidate), false);
  }
});
test('overview and every registered module resolve unchanged', () => {
  assert.equal(resolveWorkspaceRoute('overview'), 'overview');
  for (const module of modules) {
    assert.equal(resolveWorkspaceRoute(module.id), module.id);
    assert.equal(isWorkspaceRoute(module.id), true);
  }
});
test('all modules belong to a known navigation group and pass registry validation', () => {
  assert.ok(modules.every(module => moduleGroups.includes(module.group)));
  assert.deepEqual(validateModuleRegistry(), []);
});
test('every blueprint declares entities, workflow and acceptance checks', () => {
  for (const module of modules.filter(entry => entry.status === 'blueprint')) {
    assert.ok(module.entities?.length, module.id);
    assert.ok(module.workflow?.length, module.id);
    assert.ok(module.checks?.length, module.id);
  }
});

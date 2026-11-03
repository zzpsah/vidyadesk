import assert from 'node:assert/strict';
import test from 'node:test';
import { operationalWorkspaces, validateOperationalWorkspaces, workspaceGroups } from '../core/workspaces.ts';

test('every registered workspace has verified operational metadata', () => {
  assert.deepEqual(validateOperationalWorkspaces(), []);
  assert.equal(operationalWorkspaces.length, 7);
});

test('every public owner application is linked without embedding or duplicating its data', () => {
  const publicApps = operationalWorkspaces.filter(item => item.applicationUrl);
  assert.deepEqual(publicApps.map(item => item.id).sort(), ['eshikshakosh', 'letters', 'payroll', 'report-central', 'udise']);
  assert.ok(publicApps.every(item => item.applicationUrl?.startsWith('https://')));
  assert.ok(operationalWorkspaces.every(item => item.actions.length > 0));
});

test('private and repository-only services do not advertise public application endpoints', () => {
  for (const item of operationalWorkspaces.filter(item => item.access === 'private-service' || item.access === 'repository-only')) {
    assert.equal(item.applicationUrl, undefined);
  }
  assert.ok(workspaceGroups.includes('Student data'));
});


test('Vetan-Vipatra remains a protected owner application with one honest launch target', () => {
  const payroll = operationalWorkspaces.find(item => item.id === 'payroll');
  assert.ok(payroll);
  assert.equal(payroll.access, 'protected');
  assert.equal(payroll.applicationUrl, 'https://vetan-vipatra.vercel.app/');
  assert.ok(payroll.actions.every(action => action.href === undefined), 'capability descriptions must not masquerade as deep links');
  assert.match(payroll.note, /Vercel protection enabled/i);
});

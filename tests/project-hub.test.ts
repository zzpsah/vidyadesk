import assert from 'node:assert/strict';
import test from 'node:test';
import { defaultSchools, createSchool, SCHOOL_CATEGORIES, MEDIUMS } from '../core/seed.ts';
import { infrastructureProjects, projects } from '../core/projects.ts';

test('default school workspace contains one fixed school and no generated records', () => {
  const schools = defaultSchools('2026-10-30');
  assert.equal(schools.length, 1);
  const school = schools[0];
  assert.equal(school.name, 'UCHCH MADHYAMIK VIDYALAY, TETAHALI');
  assert.equal(school.session, '2026-2027');
  for (const [key, value] of Object.entries(school)) {
    if (Array.isArray(value)) assert.equal(value.length, 0, key);
  }
  assert.deepEqual(school.attendance, {});
});

test('school creation is metadata-only even if a caller requests sample records', () => {
  const school = createSchool({
    name: 'Test school', category: SCHOOL_CATEGORIES[3], block: 'Test block',
    district: 'Test district', medium: MEDIUMS[0], session: '2026-2027', seedRecords: true,
  }, '2026-10-30');
  assert.deepEqual(school.students, []);
  assert.deepEqual(school.staff, []);
  assert.deepEqual(school.classes, []);
  assert.deepEqual(school.notices, []);
  assert.deepEqual(school.fees, []);
  assert.deepEqual(school.attendance, {});
  assert.deepEqual(school.assessments, []);
  assert.deepEqual(school.marks, []);
  assert.deepEqual(school.timetable, []);
});

test('project hub contains the known, repository-backed school projects', () => {
  assert.deepEqual(projects.map(project => project.id), [
    'school-data-records', 'report-central', 'digital-letter-registry',
    'udise-automation-suite', 'eshikshakosh-automation', 'vetan-vipatra', 'n8n-operations',
  ]);
  for (const project of projects) {
    assert.ok(project.repositoryUrl.startsWith('https://github.com/zzpsah/'));
    assert.ok(project.boundary.length > 20);
  }
  assert.equal(projects.filter(project => project.applicationUrl).length, 5);
  const payroll = projects.find(project => project.id === 'vetan-vipatra');
  assert.equal(payroll?.applicationUrl, 'https://vetan-vipatra.vercel.app');
  assert.match(payroll?.boundary ?? '', /do not copy teacher payroll data/i);
});

test('platform dependencies are registered separately from school applications', () => {
  assert.deepEqual(infrastructureProjects.map(item => item.id), ['oracle-server', 'postgresql-services']);
  assert.ok(infrastructureProjects.every(item => item.repositoryUrl.startsWith('https://github.com/zzpsah/')));
});

test('UDISE+ and eShikshaKosh remain separate integration owners', async () => {
  const { integrations, dataSources } = await import('../core/integrations.ts');
  const udise = integrations.find(item => item.id === 'udise-automation-suite');
  const eshiksha = integrations.find(item => item.id === 'eshikshakosh-automation');
  assert.ok(udise);
  assert.ok(eshiksha);
  assert.notEqual(udise.owner, eshiksha.owner);
  assert.match(udise.name, /UDISE\+/);
  assert.match(eshiksha.name, /eShikshaKosh/);
  assert.ok(dataSources.some(source => source.id === 'udise'));
  assert.ok(dataSources.some(source => source.id === 'eshiksha'));
  assert.ok(!dataSources.some(source => source.id === 'vidyadesk-fixtures'));
  assert.ok(!integrations.some(item => /udise.*eshiksha|eshiksha.*udise/i.test(item.name)));
});

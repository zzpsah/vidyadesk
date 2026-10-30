import assert from 'node:assert/strict';
import test from 'node:test';
import { defaultSchools } from '../core/seed.ts';
import { filterStaff, staffWorkload, workforceSummary } from '../core/workforce.ts';

const school = defaultSchools('2026-10-30')[0];

test('staff directory search matches names, roles, subjects and assigned sections', () => {
  const first = school.staff[0];
  assert.ok(filterStaff(school, { query: first.name.toLocaleUpperCase() }).some(row => row.id === first.id));
  assert.ok(filterStaff(school, { query: first.subject }).some(row => row.id === first.id));
  assert.ok(filterStaff(school, { query: first.role }).some(row => row.id === first.id));
  const section = school.classes.find(item => item.teacherId === first.id);
  if (section) assert.ok(filterStaff(school, { query: section.id }).some(row => row.id === first.id));
});

test('staff directory filters combine role, subject and timetable assignment', () => {
  const member = school.staff[0];
  const byRole = filterStaff(school, { role: member.role });
  assert.ok(byRole.length > 0);
  assert.ok(byRole.every(row => row.role === member.role));
  const bySubject = filterStaff(school, { subject: member.subject });
  assert.ok(bySubject.length > 0);
  assert.ok(bySubject.every(row => row.subject === member.subject));
  const assigned = filterStaff(school, { timetable: 'assigned' });
  const unassigned = filterStaff(school, { timetable: 'unassigned' });
  assert.ok(assigned.every(row => school.timetable.some(period => period.staffId === row.id)));
  assert.ok(unassigned.every(row => !school.timetable.some(period => period.staffId === row.id)));
  assert.equal(assigned.length + unassigned.length, school.staff.length);
});

test('workforce rollup reconciles staff, timetable periods and pending leave', () => {
  const summary = workforceSummary(school);
  assert.equal(summary.total, school.staff.length);
  assert.equal(summary.withoutTimetable + summary.withTimetable, summary.total);
  assert.equal(summary.totalPeriods, school.timetable.length);
  assert.equal(summary.pendingLeave, school.leaveRequests.filter(row => row.status === 'Pending review').length);
  assert.ok(summary.averagePeriods >= 0);
});

test('individual workload uses approved leave days without mutating the staff master', () => {
  const member = school.staff[0];
  const before = member.leaveBalance;
  const workload = staffWorkload(school, member);
  const approved = school.leaveRequests
    .filter(row => row.staffId === member.id && row.status === 'Approved')
    .reduce((sum, row) => sum + row.days, 0);
  assert.equal(workload.approvedLeaveDays, approved);
  assert.equal(workload.leaveBalance, before - approved);
  assert.equal(member.leaveBalance, before);
});

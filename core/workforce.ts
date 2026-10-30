import type { School, StaffMember } from './types';

export type WorkforceFilters = {
  query?: string;
  role?: string;
  subject?: string;
  timetable?: 'all' | 'assigned' | 'unassigned';
};

/** Derive staff-directory rows from the canonical local school collections. */
export function filterStaff(school: School, filters: WorkforceFilters = {}) {
  const query = (filters.query ?? '').trim().toLocaleLowerCase();
  return school.staff.filter(member => {
    const summary = school.timetable.filter(period => period.staffId === member.id);
    const classes = school.classes.filter(section => section.teacherId === member.id);
    const haystack = [member.name, member.subject, member.assignedClass, member.role, ...classes.map(section => section.id)]
      .join(' ').toLocaleLowerCase();
    if (query && !haystack.includes(query)) return false;
    if (filters.role && filters.role !== 'All roles' && member.role !== filters.role) return false;
    if (filters.subject && filters.subject !== 'All subjects' && member.subject !== filters.subject) return false;
    if (filters.timetable === 'assigned' && summary.length === 0) return false;
    if (filters.timetable === 'unassigned' && summary.length > 0) return false;
    return true;
  });
}

export function workforceSummary(school: School) {
  const periodCounts = school.staff.map(member =>
    school.timetable.filter(period => period.staffId === member.id).length,
  );
  const assigned = periodCounts.filter(count => count > 0).length;
  const totalPeriods = periodCounts.reduce((sum, count) => sum + count, 0);
  const pendingLeave = school.leaveRequests.filter(request => request.status === 'Pending review').length;
  return {
    total: school.staff.length,
    withTimetable: assigned,
    withoutTimetable: school.staff.length - assigned,
    totalPeriods,
    averagePeriods: assigned ? Math.round((totalPeriods / assigned) * 10) / 10 : 0,
    pendingLeave,
    classTeacherAssignments: school.classes.filter(section =>
      school.staff.some(member => member.id === section.teacherId),
    ).length,
  };
}

export function staffWorkload(school: School, member: StaffMember) {
  const periods = school.timetable.filter(period => period.staffId === member.id);
  const classTeacherOf = school.classes.filter(section => section.teacherId === member.id).map(section => section.id);
  const taughtClasses = [...new Set(periods.map(period => period.classId))];
  const approvedLeaveDays = school.leaveRequests
    .filter(request => request.staffId === member.id && request.status === 'Approved')
    .reduce((sum, request) => sum + request.days, 0);
  return {
    periodsPerWeek: periods.length,
    taughtClasses,
    classTeacherOf,
    pendingLeave: school.leaveRequests.filter(request => request.staffId === member.id && request.status === 'Pending review').length,
    approvedLeaveDays,
    leaveBalance: member.leaveBalance - approvedLeaveDays,
  };
}

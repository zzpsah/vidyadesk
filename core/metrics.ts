import { pct, rupees } from './format';
import { todayISO } from './workspace';
import type { School } from './types';

/** One line of live context per module, used by the sidebar and the overview tiles. */
export function metric(school: School, moduleId: string): string {
  const book = school.attendance[todayISO()] ?? {};
  const count = (value: number, singular: string) => `${value} ${value === 1 ? singular : `${singular}s`}`;
  const drafts = (kind: string) => count(school.transferApplications.filter(a => a.kind === kind).length, 'draft');
  switch (moduleId) {
    case 'students': return count(school.students.length, 'student');
    case 'attendance': return `${pct(Object.values(book).filter(s => s === 'Present').length, school.students.length)}% present`;
    case 'exams': return `${new Set(school.staff.filter(s => s.role !== 'Head teacher').map(s => s.subject)).size} subjects`;
    case 'fees': return `${rupees(school.fees.filter(f => !f.paid).reduce((sum, f) => sum + f.amount, 0))} due`;
    case 'mdm': return `${school.mdmEntries.length} ${school.mdmEntries.length === 1 ? 'entry' : 'entries'}`;
    case 'staff': return `${school.staff.length} teachers`;
    case 'leave': return `${school.leaveRequests.filter(r => r.status === 'Pending review').length} pending`;
    case 'transfer-special': return drafts('transfer-special');
    case 'transfer-district': return drafts('transfer-district');
    case 'transfer-teacher': return drafts('transfer-teacher');
    case 'transfer-mutual': return drafts('transfer-mutual');
    case 'classes': return `${school.classes.length} sections`;
    case 'timetable': return 'Weekly grid';
    case 'notices': return `${school.notices.length} posted`;
    case 'tickets': return `${school.tickets.filter(t => t.status !== 'Resolved').length} open`;
    default: return 'Spec ready';
  }
}

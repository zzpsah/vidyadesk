import { pct } from './format';
import { BREAK_SLOTS, SLOT_TIMES } from './seed';
import { todayISO } from './workspace';
import type { AttendanceStatus, School, Student } from './types';

/**
 * Cross-module derivation. A school's collections are stored separately, so every
 * number that needs more than one of them is computed here — the views and the
 * reports read the same figures and can never disagree with each other.
 */

export const PASS_MARK = 35;

export function gradeFor(percent: number) {
  if (percent >= 80) return 'A';
  if (percent >= 60) return 'B';
  if (percent >= 45) return 'C';
  if (percent >= PASS_MARK) return 'D';
  return 'E';
}

export function attendanceDates(school: School) {
  return Object.keys(school.attendance).sort();
}

function statusOf(book: Record<string, AttendanceStatus>, id: string) {
  return book[id];
}

/** Attendance for one student across the stored books. */
export function studentAttendance(school: School, studentId: string, dates?: string[]) {
  const days = dates ?? attendanceDates(school);
  let present = 0; let absent = 0; let leave = 0;
  days.forEach(date => {
    const status = statusOf(school.attendance[date] ?? {}, studentId);
    if (status === 'Present') present += 1;
    else if (status === 'Absent') absent += 1;
    else if (status === 'Leave') leave += 1;
  });
  const marked = present + absent + leave;
  return { days: days.length, marked, present, absent, leave, unmarked: days.length - marked, percent: pct(present + leave, marked) };
}

export function classAttendance(school: School, classId: string, dates?: string[]) {
  const roster = school.students.filter(s => s.className === classId && s.status === 'Enrolled');
  const days = dates ?? attendanceDates(school);
  let present = 0; let marked = 0;
  roster.forEach(student => {
    const record = studentAttendance(school, student.id, days);
    present += record.present; marked += record.marked;
  });
  return { roster: roster.length, days: days.length, present, marked, percent: pct(present, marked) };
}

/** Every student a class teacher is responsible for, with the numbers they would check. */
export function studentProfile(school: School, student: Student) {
  const attendance = studentAttendance(school, student.id);
  const fees = school.fees.filter(f => f.studentId === student.id);
  const paid = fees.filter(f => f.paid).reduce((sum, f) => sum + f.amount, 0);
  const due = fees.filter(f => !f.paid).reduce((sum, f) => sum + f.amount, 0);
  const rows = school.assessments
    .filter(a => a.className === student.className)
    .map(assessment => ({ assessment, score: school.marks.find(m => m.assessmentId === assessment.id && m.studentId === student.id)?.score ?? null }))
    .filter(row => row.score !== null);
  const total = rows.reduce((sum, row) => sum + (row.score ?? 0), 0);
  const max = rows.reduce((sum, row) => sum + row.assessment.max, 0);
  const percent = max ? Math.round((total / max) * 100) : 0;
  const section = school.classes.find(c => c.id === student.className);
  const teacher = section && school.staff.find(s => s.id === section.teacherId);
  return { student, attendance, fees, paid, due, rows, total, max, percent, grade: gradeFor(percent), section, teacher };
}

export function staffSummary(school: School, staffId: string) {
  const staff = school.staff.find(s => s.id === staffId);
  if (!staff) return null;
  const periods = school.timetable.filter(p => p.staffId === staffId);
  const classTeacherOf = school.classes.filter(c => c.teacherId === staffId).map(c => c.id);
  const taughtClasses = [...new Set(periods.map(p => p.classId))];
  const leaves = school.leaveRequests.filter(r => r.staffId === staffId);
  const approvedDays = leaves.filter(r => r.status === 'Approved').reduce((sum, r) => sum + r.days, 0);
  const transfers = school.transferApplications.filter(a => a.staffId === staffId);
  return {
    staff,
    periodsPerWeek: periods.length,
    subjects: [...new Set(periods.map(p => p.subject))],
    classTeacherOf,
    taughtClasses,
    pendingLeave: leaves.filter(r => r.status === 'Pending review').length,
    approvedDays,
    leaveBalanceAfter: staff.leaveBalance - approvedDays,
    transfers,
  };
}

/** Periods per weekday for one class, including the break slots the grid shows. */
export function classGrid(school: School, classId: string, day: string) {
  const periods = school.timetable.filter(p => p.classId === classId && p.day === day);
  return SLOT_TIMES.map((time, slot) => ({
    slot,
    time,
    break: BREAK_SLOTS[slot] ?? null,
    period: periods.find(p => p.slot === slot) ?? null,
  }));
}

export function feeSummary(school: School, classId?: string) {
  const students = classId ? school.students.filter(s => s.className === classId) : school.students;
  const ids = new Set(students.map(s => s.id));
  const fees = school.fees.filter(f => ids.has(f.studentId));
  const paidRows = fees.filter(f => f.paid);
  const dueRows = fees.filter(f => !f.paid);
  return {
    students: students.length,
    records: fees.length,
    paid: paidRows.length,
    due: dueRows.length,
    collected: paidRows.reduce((sum, f) => sum + f.amount, 0),
    outstanding: dueRows.reduce((sum, f) => sum + f.amount, 0),
    rate: pct(paidRows.length, fees.length),
    defaulters: dueRows.map(f => students.find(s => s.id === f.studentId)).filter(Boolean) as Student[],
  };
}

/** Meals a date should have served, read from that date's attendance register. */
export function mealsExpected(school: School, date: string) {
  const book = school.attendance[date];
  if (!book) return null;
  return Object.values(book).filter(status => status !== 'Absent').length;
}

/** Every date either register touched, reconciled against the other one. */
export function mdmAudit(school: School) {
  const dates = [...new Set([...attendanceDates(school), ...school.mdmEntries.map(e => e.date)])];
  return dates.map(date => {
    const expected = mealsExpected(school, date);
    const entry = school.mdmEntries.find(e => e.date === date);
    return { date, menu: entry?.menu ?? 'Not recorded', expected, served: entry?.meals ?? null, delta: expected === null || !entry ? null : entry.meals - expected };
  }).sort((a, b) => b.date.localeCompare(a.date));
}

export function ticketBoard(school: School) {
  const open = school.tickets.filter(t => t.status !== 'Resolved');
  const byCategory = new Map<string, number>();
  open.forEach(t => byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + 1));
  return { open: open.length, resolved: school.tickets.length - open.length, byCategory: [...byCategory.entries()].sort((a, b) => b[1] - a[1]) };
}

export function transferPipeline(school: School) {
  const drafts = school.transferApplications.filter(a => a.status === 'Draft').length;
  const ready = school.transferApplications.filter(a => a.status === 'Ready to file').length;
  const filed = school.transferApplications.filter(a => a.status === 'Filed elsewhere').length;
  return { drafts, ready, filed, total: school.transferApplications.length };
}

export function schoolSummary(school: School) {
  const today = todayISO();
  const book = school.attendance[today] ?? {};
  const present = Object.values(book).filter(s => s === 'Present').length;
  const fees = feeSummary(school);
  return {
    students: school.students.length,
    classes: school.classes.length,
    staff: school.staff.length,
    teachers: school.staff.filter(s => s.role !== 'Head teacher').length,
    markedToday: Object.keys(book).length,
    presentToday: present,
    presentTodayPct: pct(present, school.students.length),
    fees,
    attendanceDays: attendanceDates(school).length,
    attendancePercent: school.students.length ? Math.round(school.students.reduce((sum, s) => sum + studentAttendance(school, s.id).percent, 0) / school.students.length) : 0,
    exams: school.assessments.length,
    marksRecorded: school.marks.length,
    leavePending: school.leaveRequests.filter(r => r.status === 'Pending review').length,
    transfers: transferPipeline(school),
    tickets: ticketBoard(school),
    notices: school.notices.length,
    mdmEntries: school.mdmEntries.length,
  };
}

/** The rollup that only exists because the workspace holds several schools. */
export function portfolioSummary(schools: School[]) {
  const rows = schools.map(school => ({ school, summary: schoolSummary(school) }));
  return {
    rows,
    students: rows.reduce((sum, r) => sum + r.summary.students, 0),
    staff: rows.reduce((sum, r) => sum + r.summary.staff, 0),
    collected: rows.reduce((sum, r) => sum + r.summary.fees.collected, 0),
    outstanding: rows.reduce((sum, r) => sum + r.summary.fees.outstanding, 0),
    attendance: rows.length ? Math.round(rows.reduce((sum, r) => sum + r.summary.attendancePercent, 0) / rows.length) : 0,
  };
}

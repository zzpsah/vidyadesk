import type { Assessment, ClassSection, Mark, NewSchoolInput, Period, School, SchoolData, StaffMember, Student } from './types';

export const MENUS = ['Rice & dal', 'Roti & seasonal sabji', 'Rice & vegetable curry', 'Khichdi with curd', 'Roti & paneer bhurji'];
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const SCHOOL_CATEGORIES = ['Primary (I–V)', 'Upper primary (I–VIII)', 'Secondary (VI–X)', 'Senior secondary (VI–XII)'];
export const MEDIUMS = ['Hindi', 'English', 'Urdu', 'Hindi & English'];

const CLASS_LABELS: Record<string, string[]> = {
  [SCHOOL_CATEGORIES[0]]: ['I', 'II', 'III', 'IV', 'V'],
  [SCHOOL_CATEGORIES[1]]: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'],
  [SCHOOL_CATEGORIES[2]]: ['VI', 'VII', 'VIII', 'IX', 'X'],
  [SCHOOL_CATEGORIES[3]]: ['VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'],
};

function hash(value: string) { let h = 2166136261; for (let i = 0; i < value.length; i++) { h ^= value.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

export function classLabelsFor(category: string) { return CLASS_LABELS[category] ?? CLASS_LABELS[SCHOOL_CATEGORIES[1]]; }

export function sectionsFor(category: string): ClassSection[] {
  const out: ClassSection[] = [];
  classLabelsFor(category).forEach((label, classIndex) => {
    const count = label === 'I' || label === 'II' ? 1 : classIndex > 4 ? 2 : 1;
    for (let s = 0; s < count; s++) out.push({ id: `${label} ${'AB'[s]}`, teacherId: '' });
  });
  return out;
}

export function emptyData(): SchoolData {
  return { students: [], staff: [], classes: [], notices: [], fees: [], attendance: {}, leaveRequests: [], transferApplications: [], tickets: [], mdmEntries: [], assessments: [], marks: [], timetable: [] };
}

/** Create metadata only. VidyaDesk must never generate fictional school records. */
export function createSchool(input: NewSchoolInput, today: string): School {
  return {
    id: `sch-${hash(`${input.name}${Date.now()}`).toString(36)}`,
    name: input.name,
    category: input.category,
    block: input.block,
    district: input.district,
    medium: input.medium,
    session: input.session,
    createdAt: today,
    ...emptyData(),
  };
}

/** One fixed school context, with no assumed classes, staff or student records. */
export const defaultSchools = (today: string): School[] => [createSchool({
  name: 'UCHCH MADHYAMIK VIDYALAY, TETAHALI',
  category: SCHOOL_CATEGORIES[3],
  block: 'Tetahali',
  district: 'Siwan',
  medium: MEDIUMS[0],
  session: '2026-2027',
  seedRecords: false,
}, today)];

export const SLOT_TIMES = ['08:30–09:15', '09:15–10:00', '10:00–10:20', '10:20–11:05', '11:05–11:50', '11:50–12:30', '12:30–13:15', '13:15–14:00'];
/** Slot index → break label. These slots hold no teaching period, so no teacher is free or busy in them. */
export const BREAK_SLOTS: Record<number, string> = { 2: 'Morning break', 5: 'Lunch break' };
export const EXAM_MAX = 50;
export const EXAM_NAME = 'First unit test';

const iso = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export function isoAdd(date: string, days: number) { const value = new Date(`${date}T00:00:00`); value.setDate(value.getDate() + days); return iso(value); }
/** The next assessment cycle always opens on the 5th of the coming month. */
export function examStart(today: string) { const now = new Date(`${today}T00:00:00`); return iso(new Date(now.getFullYear(), now.getMonth() + 1, 5)); }

/** Subjects actually taught, in staff order. Kept to four so a marks board fits one screen. */
export function examSubjectsOf(staff: StaffMember[]) { return [...new Set(staff.filter(s => s.role !== 'Head teacher').map(s => s.subject))].slice(0, 4); }

export function buildTimetable(schoolId: string, classes: ClassSection[], staff: StaffMember[]): Period[] {
  const teachers = staff.filter(s => s.role !== 'Head teacher');
  if (!teachers.length) return [];
  const out: Period[] = [];
  classes.forEach(section => DAYS.forEach(day => SLOT_TIMES.forEach((_, slot) => {
    if (BREAK_SLOTS[slot]) return;
    const teacher = teachers[(hash(`${schoolId}${section.id}${day}`) + slot * 3) % teachers.length];
    out.push({ classId: section.id, day, slot, subject: teacher.subject, staffId: teacher.id });
  })));
  return out;
}

/** One assessment per section per subject, with a score for every student in that section. */
export function buildAssessments(schoolId: string, classes: ClassSection[], students: Student[], subjects: string[], today: string) {
  const start = examStart(today);
  const assessments: Assessment[] = [];
  const marks: Mark[] = [];
  subjects.forEach((subject, subjectIndex) => classes.forEach(section => {
    const id = `${schoolId}-asm-${subjectIndex}-${section.id.replace(/\W+/g, '')}`;
    assessments.push({ id, name: EXAM_NAME, subject, className: section.id, date: isoAdd(start, subjectIndex * 2), max: EXAM_MAX });
    students.filter(s => s.className === section.id).forEach(s => marks.push({ assessmentId: id, studentId: s.id, score: 24 + hash(`${schoolId}${s.id}${subject}`) % 26 }));
  }));
  return { assessments, marks };
}

/** Reads stored periods; a slot with no period is genuinely free, not generated on the fly. */
export function timetableFor(school: School, classId: string, day: string) {
  const bySlot = new Map(school.timetable.filter(p => p.classId === classId && p.day === day).map(p => [p.slot, p]));
  return SLOT_TIMES.map((time, slot) => {
    const period = bySlot.get(slot);
    const teacher = period ? school.staff.find(member => member.id === period.staffId) : undefined;
    return {
      time,
      subject: BREAK_SLOTS[slot] ?? period?.subject ?? 'Free period',
      teacher: BREAK_SLOTS[slot] ? '—' : teacher?.name ?? 'Unassigned',
      period: BREAK_SLOTS[slot] ? '—' : String(slot + 1),
    };
  });
}

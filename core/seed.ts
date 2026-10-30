import type { Assessment, AttendanceStatus, ClassSection, Mark, MdmEntry, NewSchoolInput, Period, School, SchoolData, StaffMember, Student } from './types';

const FIRST = ['Aarav', 'Ananya', 'Kabir', 'Meera', 'Vivaan', 'Diya', 'Ishaan', 'Sana', 'Rohan', 'Avni', 'Arjun', 'Nisha', 'Yuvan', 'Aarohi', 'Ved', 'Myra', 'Kiaan', 'Ira', 'Reyansh', 'Anika', 'Dev', 'Sara', 'Naitik', 'Pari', 'Ayan', 'Zoya'];
const LAST = ['Kumar', 'Singh', 'Sharma', 'Das', 'Roy', 'Patel', 'Gupta', 'Ali', 'Verma', 'Sinha', 'Mishra', 'Rao', 'Yadav', 'Pandey', 'Thakur', 'Chandra'];
const SUBJECTS = ['Mathematics', 'Science', 'English', 'Social studies', 'Hindi', 'Sanskrit', 'Computer', 'Physical education'];
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
function pick<T>(list: T[], salt: string) { return list[hash(salt) % list.length]; }
const initials = (name: string) => name.split(' ').map(word => word[0]).slice(0, 2).join('').toUpperCase();

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

function buildStudents(schoolId: string, classes: ClassSection[], seeded: boolean): Student[] {
  if (!seeded) return [];
  const out: Student[] = [];
  classes.forEach((section, sectionIndex) => {
    const strength = 6 + (hash(`${schoolId}${section.id}`) % 5);
    for (let i = 1; i <= strength; i++) {
      const salt = `${schoolId}-${section.id}-${i}`;
      const given = pick(FIRST, `${salt}-g`);
      const family = pick(LAST, `${salt}-f`);
      out.push({ id: `${schoolId}-stu-${sectionIndex}-${i}`, roll: i, name: `${given} ${family}`, className: section.id, guardian: `${pick(FIRST, `${salt}-p`)} ${family}`, gender: hash(`${salt}-x`) % 2 ? 'Girl' : 'Boy', joined: `2026-04-${String(1 + (hash(salt) % 27)).padStart(2, '0')}`, status: 'Enrolled' });
    }
  });
  return out;
}

function buildStaff(schoolId: string, classes: ClassSection[], seeded: boolean): StaffMember[] {
  if (!seeded) return [];
  const team: StaffMember[] = [{ id: `${schoolId}-stf-0`, name: `${pick(FIRST, `${schoolId}-h`)} ${pick(LAST, `${schoolId}-h2`)}`, initials: '', subject: 'School administration', role: 'Head teacher', assignedClass: '—', schedule: '08:00–15:00', leaveBalance: 12 }];
  classes.forEach((section, index) => {
    const subject = SUBJECTS[index % SUBJECTS.length];
    const name = `${pick(FIRST, `${schoolId}-t${index}`)} ${pick(LAST, `${schoolId}-t${index}x`)}`;
    team.push({ id: `${schoolId}-stf-${index + 1}`, name, initials: initials(name), subject, role: 'Teacher & class teacher', assignedClass: section.id, schedule: '08:30–14:00', leaveBalance: 20 - (hash(`${schoolId}${index}`) % 9) });
  });
  return team.map(member => ({ ...member, initials: member.initials || initials(member.name) }));
}

function seedAttendance(schoolId: string, students: Student[], date: string): Record<string, AttendanceStatus> {
  const book: Record<string, AttendanceStatus> = {};
  students.forEach(s => { const r = hash(`${schoolId}${s.id}${date}`) % 100; book[s.id] = r < 82 ? 'Present' : r < 92 ? 'Absent' : 'Leave'; });
  return book;
}

function seedMdm(schoolId: string, date: string, students: Student[], book: Record<string, AttendanceStatus>): MdmEntry[] {
  if (!students.length) return [];
  const meals = Object.values(book).filter(status => status !== 'Absent').length;
  return [{ id: `${schoolId}-mdm-1`, date, menu: pick(MENUS, `${schoolId}${date}`), meals, classCount: new Set(students.map(s => s.className)).size, note: 'Cooking cost shown at the sample rate; nothing is reported to a government portal.' }];
}

export function createSchool(input: NewSchoolInput, today: string): School {
  const id = `sch-${hash(`${input.name}${Date.now()}`).toString(36)}`;
  const classes = sectionsFor(input.category).map(section => ({ ...section }));
  const staff = buildStaff(id, classes, input.seedRecords);
  classes.forEach((section, index) => { if (staff[index + 1]) section.teacherId = staff[index + 1].id; });
  const students = buildStudents(id, classes, input.seedRecords);
  const book = seedAttendance(id, students, today);
  const feeAmount = input.category.startsWith('Primary') ? 300 : input.category.startsWith('Upper') ? 400 : 600;
  const subjects = examSubjectsOf(staff);
  const { assessments, marks } = buildAssessments(id, classes, students, subjects, today);
  return {
    id, name: input.name, category: input.category, block: input.block, district: input.district, medium: input.medium, session: input.session, createdAt: today,
    students, staff, classes,
    notices: input.seedRecords ? [
      { id: `${id}-not-1`, title: 'Parent meeting on the first Saturday', body: 'Class teachers will share term progress with parents between 10:00 and 12:30. Students carry their portfolio folder.', audience: 'Parents', category: 'Academic', date: today },
      { id: `${id}-not-2`, title: 'Monthly register audit', body: 'Attendance, mid-day meal and inventory registers for the previous month are due with the head teacher.', audience: 'Staff', category: 'Admin', date: today },
    ] : [],
    fees: students.map(s => ({ id: `${id}-fee-${s.id}`, studentId: s.id, term: 'October', amount: feeAmount, paid: hash(`${id}${s.id}`) % 10 < 7 })),
    leaveRequests: staff.length > 2 ? [{ id: `${id}-lv-1`, staffId: staff[2].id, type: 'Casual', from: today, to: today, days: 1, reason: 'Personal work at home district.', status: 'Pending review' }] : [],
    transferApplications: staff.length > 1 ? [{ id: `${id}-tr-1`, kind: 'transfer-special', applicant: staff[1].name, staffId: staff[1].id, fromSchool: input.name, to: pick(['District A', 'District B', 'District C', 'District D'], id), ground: 'Spouse posted in another district', reason: 'Family stays together in one district.', ref: `${id.slice(4, 10).toUpperCase()}-SPL-001`, status: 'Draft', createdAt: today }] : [],
    tickets: input.seedRecords ? [{ id: `${id}-tk-1`, subject: 'Classroom light fixture', category: 'Infrastructure', detail: 'Two tube lights in the upper-primary block are flickering.', classId: classes[0]?.id, status: 'Open', createdAt: today }] : [],
    attendance: input.seedRecords && students.length ? { [today]: book } : {},
    mdmEntries: input.seedRecords && students.length ? seedMdm(id, today, students, book) : [],
    assessments, marks,
    timetable: buildTimetable(id, classes, staff),
  };
}

export const defaultSchools = (today: string): School[] => [
  createSchool({ name: 'Demo North Secondary School', category: SCHOOL_CATEGORIES[2], block: 'Demo Block North', district: 'Demo District', medium: MEDIUMS[0], session: '2026–27', seedRecords: true }, today),
  createSchool({ name: 'Demo Village Upper Primary School', category: SCHOOL_CATEGORIES[1], block: 'Demo Block East', district: 'Demo District', medium: MEDIUMS[2], session: '2026–27', seedRecords: true }, today),
  createSchool({ name: 'Demo Blank Primary School', category: SCHOOL_CATEGORIES[0], block: 'Demo Block West', district: 'Demo District', medium: MEDIUMS[1], session: '2026–27', seedRecords: false }, today),
];

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

import type { LucideIcon } from 'lucide-react';

export type ModuleStatus = 'live' | 'blueprint';
export type ModuleGroup = 'Students' | 'People & transfers' | 'Academics' | 'Communication' | 'Operations';

export type ModuleDef = {
  id: string;
  name: string;
  nav: string;
  blurb: string;
  group: ModuleGroup;
  status: ModuleStatus;
  icon: LucideIcon;
  /** Only meaningful for blueprint modules: what the build needs before it can go live. */
  entities?: string[];
  workflow?: string[];
  checks?: string[];
};

export type AttendanceStatus = 'Present' | 'Absent' | 'Leave';
export type Student = { id: string; roll: number; name: string; className: string; guardian: string; gender: 'Boy' | 'Girl'; joined: string; status: 'Enrolled' | 'Withdrawn' };
export type StaffMember = { id: string; name: string; initials: string; subject: string; role: string; assignedClass: string; schedule: string; leaveBalance: number };
export type ClassSection = { id: string; teacherId: string };
export type Notice = { id: string; title: string; body: string; audience: string; category: string; date: string };
export type Fee = { id: string; studentId: string; term: string; amount: number; paid: boolean };
export type LeaveRequest = { id: string; staffId: string; type: string; from: string; to: string; days: number; reason: string; status: 'Pending review' | 'Approved' | 'Declined' };
export type TransferApplication = { id: string; kind: string; applicant: string; fromSchool: string; to: string; ground: string; reason: string; ref: string; status: 'Draft' | 'Ready to file' | 'Filed elsewhere'; createdAt: string };
export type Ticket = { id: string; subject: string; category: string; detail: string; status: 'Open' | 'In progress' | 'Resolved'; createdAt: string };
export type MdmEntry = { id: string; date: string; menu: string; meals: number; classCount: number; note: string };

/** attendance[date][studentId] */
export type AttendanceBook = Record<string, Record<string, AttendanceStatus>>;

export type SchoolMeta = { id: string; name: string; category: string; block: string; district: string; medium: string; session: string; createdAt: string };
export type SchoolData = {
  students: Student[];
  staff: StaffMember[];
  classes: ClassSection[];
  notices: Notice[];
  fees: Fee[];
  attendance: AttendanceBook;
  leaveRequests: LeaveRequest[];
  transferApplications: TransferApplication[];
  tickets: Ticket[];
  mdmEntries: MdmEntry[];
};
export type School = SchoolMeta & SchoolData;

export type NewSchoolInput = { name: string; category: string; block: string; district: string; medium: string; session: string; seedRecords: boolean };

import { createContext, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react';
import { defaultSchools, emptyData } from './seed';
import type { AttendanceStatus, Fee, LeaveRequest, Mark, Notice, School, SchoolMeta, Student, Ticket, TransferApplication, MdmEntry } from './types';

export const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

export type State = { schools: School[]; activeSchoolId: string; focusModuleId: string | null };

export type Action =
  | { type: 'add-school'; school: School }
  | { type: 'switch-school'; id: string }
  | { type: 'update-school'; id: string; patch: Partial<SchoolMeta> }
  | { type: 'remove-school'; id: string }
  | { type: 'add-student'; student: Student; fee: Fee }
  | { type: 'add-notice'; notice: Notice }
  | { type: 'set-attendance'; date: string; studentId: string; status: AttendanceStatus }
  | { type: 'bulk-attendance'; date: string; studentIds: string[]; status: AttendanceStatus }
  | { type: 'pay-fee'; feeId: string }
  | { type: 'add-leave'; request: LeaveRequest }
  | { type: 'set-leave-status'; id: string; status: LeaveRequest['status'] }
  | { type: 'add-transfer'; application: TransferApplication }
  | { type: 'set-transfer-status'; id: string; status: TransferApplication['status'] }
  | { type: 'add-ticket'; ticket: Ticket }
  | { type: 'set-ticket-status'; id: string; status: Ticket['status'] }
  | { type: 'add-mdm'; entry: MdmEntry }
  | { type: 'set-mark'; assessmentId: string; studentId: string; score: number }
  | { type: 'assign-period'; classId: string; day: string; slot: number; staffId: string }
  | { type: 'set-focus'; moduleId: string | null }
  | { type: 'reset' };

// v2 intentionally starts from a clean, empty school context. Legacy demo data is left untouched in v1 and is never loaded into the school portal.\nconst STORAGE_KEY = 'vidyadesk.workspace.v2';

function onSchool(state: State, fn: (school: School) => School): State {
  return { ...state, schools: state.schools.map(s => (s.id === state.activeSchoolId ? fn(s) : s)) };
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add-school': return { ...state, schools: [...state.schools, action.school], activeSchoolId: action.school.id };
    case 'switch-school': return { ...state, activeSchoolId: action.id };
    case 'update-school': return { ...state, schools: state.schools.map(s => (s.id === action.id ? { ...s, ...action.patch } : s)) };
    case 'remove-school': {
      const remaining = state.schools.filter(s => s.id !== action.id);
      if (!remaining.length) return state;
      return { ...state, schools: remaining, activeSchoolId: state.activeSchoolId === action.id ? remaining[0].id : state.activeSchoolId };
    }
    case 'add-student': return onSchool(state, s => ({ ...s, students: [...s.students, action.student], fees: [...s.fees, action.fee] }));
    case 'add-notice': return onSchool(state, s => ({ ...s, notices: [action.notice, ...s.notices] }));
    case 'set-attendance': return onSchool(state, s => ({ ...s, attendance: { ...s.attendance, [action.date]: { ...(s.attendance[action.date] ?? {}), [action.studentId]: action.status } } }));
    case 'bulk-attendance': return onSchool(state, s => {
      const book = { ...(s.attendance[action.date] ?? {}) };
      action.studentIds.forEach(id => { book[id] = action.status; });
      return { ...s, attendance: { ...s.attendance, [action.date]: book } };
    });
    case 'pay-fee': return onSchool(state, s => ({ ...s, fees: s.fees.map(f => (f.id === action.feeId ? { ...f, paid: true } : f)) }));
    case 'add-leave': return onSchool(state, s => ({ ...s, leaveRequests: [action.request, ...s.leaveRequests] }));
    case 'set-leave-status': return onSchool(state, s => ({ ...s, leaveRequests: s.leaveRequests.map(r => (r.id === action.id ? { ...r, status: action.status } : r)) }));
    case 'add-transfer': return onSchool(state, s => ({ ...s, transferApplications: [action.application, ...s.transferApplications] }));
    case 'set-transfer-status': return onSchool(state, s => ({ ...s, transferApplications: s.transferApplications.map(a => (a.id === action.id ? { ...a, status: action.status } : a)) }));
    case 'add-ticket': return onSchool(state, s => ({ ...s, tickets: [action.ticket, ...s.tickets] }));
    case 'set-ticket-status': return onSchool(state, s => ({ ...s, tickets: s.tickets.map(t => (t.id === action.id ? { ...t, status: action.status } : t)) }));
    case 'add-mdm': return onSchool(state, s => ({ ...s, mdmEntries: [action.entry, ...s.mdmEntries] }));
    case 'set-mark': return onSchool(state, s => {
      const rest = s.marks.filter(m => !(m.assessmentId === action.assessmentId && m.studentId === action.studentId));
      return { ...s, marks: [...rest, { assessmentId: action.assessmentId, studentId: action.studentId, score: action.score } satisfies Mark] };
    });
    case 'assign-period': return onSchool(state, s => ({
      ...s,
      timetable: s.timetable.map(p => {
        if (p.classId !== action.classId || p.day !== action.day || p.slot !== action.slot) return p;
        const teacher = s.staff.find(member => member.id === action.staffId);
        return { ...p, staffId: action.staffId, subject: teacher?.subject ?? p.subject };
      }),
    }));
    case 'set-focus': return { ...state, focusModuleId: action.moduleId };
    case 'reset': return initialState();
  }
}

export function initialState(): State {
  const today = todayISO();
  const schools = defaultSchools(today);
  return { schools, activeSchoolId: schools[0].id, focusModuleId: null };
}

/** Fill absent collections only. Never derive synthetic marks or timetable rows from imported people. */
function upgrade(school: School): School {
  return { ...emptyData(), ...school };
}

function loadState(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as State;
    if (!Array.isArray(parsed.schools) || !parsed.schools.length || !parsed.schools.every(s => typeof s?.id === 'string' && Array.isArray(s.students))) return initialState();
    const schools = parsed.schools.map(upgrade);
    return { ...parsed, schools, activeSchoolId: schools.some(s => s.id === parsed.activeSchoolId) ? parsed.activeSchoolId : schools[0].id };
  } catch { return initialState(); }
}

type Workspace = { state: State; school: School; dispatch: (action: Action) => void; savedAt: string | null };
const Context = createContext<Workspace | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setSavedAt(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    } catch { /* storage may be full or blocked; the session still works in memory */ }
  }, [state]);

  const value = useMemo<Workspace>(() => {
    const school = state.schools.find(s => s.id === state.activeSchoolId) ?? state.schools[0];
    return { state, school, dispatch, savedAt };
  }, [state, savedAt]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('useWorkspace must run inside WorkspaceProvider');
  return ctx;
}

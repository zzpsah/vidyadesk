import { useState, type FormEvent, type ReactNode } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MEDIUMS, MENUS, SCHOOL_CATEGORIES, createSchool } from '@/core/seed';
import { moduleById } from '@/core/modules';
import { todayISO, useWorkspace } from '@/core/workspace';
import { dateLabel, rupees } from '@/core/format';
import type { AttendanceStatus, Fee, Student } from '@/core/types';

export type DialogState =
  | { kind: 'add-school' }
  | { kind: 'settings' }
  | { kind: 'student' }
  | { kind: 'notice' }
  | { kind: 'leave' }
  | { kind: 'ticket' }
  | { kind: 'mdm' }
  | { kind: 'transfer'; moduleId: string }
  | { kind: 'profile'; student: Student }
  | { kind: 'payment'; fee: Fee }
  | null;

const note = (text: string) => <p className="form-note">{text}</p>;
const id = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
const daysBetween = (from: string, to: string) => Math.max(1, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000) + 1);

function Row({ children }: { children: ReactNode }) { return <div className="form-row">{children}</div>; }

export function DialogHost({ dialog, onClose }: { dialog: DialogState; onClose: () => void }) {
  const { school, state, dispatch } = useWorkspace();
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [seedSamples, setSeedSamples] = useState(true);

  function close() { setError(''); setConfirmDelete(false); onClose(); }
  function fail(message: string) { setError(message); return false; }

  function addSchool(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '').trim();
    const block = String(form.get('block') || '').trim();
    const district = String(form.get('district') || '').trim();
    if (!name) return fail('Enter the school name.');
    if (!block || !district) return fail('Enter the block and district so the school can be located.');
    if (state.schools.some(s => s.name.toLowerCase() === name.toLowerCase())) return fail('That school is already in the workspace.');
    const next = createSchool({ name, category: String(form.get('category')), block, district, medium: String(form.get('medium')), session: String(form.get('session')), seedRecords: seedSamples }, todayISO());
    dispatch({ type: 'add-school', school: next });
    toast.success(`${name} added to the workspace.`, { description: 'Every module now scopes to it. Switch from the sidebar.' });
    close();
  }

  function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '').trim();
    if (!name) return fail('Enter the school name.');
    dispatch({ type: 'update-school', id: school.id, patch: { name, category: String(form.get('category')), block: String(form.get('block')), district: String(form.get('district')), medium: String(form.get('medium')), session: String(form.get('session')) } });
    toast.success('School profile updated.');
    close();
  }

  function addStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '').trim();
    const guardian = String(form.get('guardian') || '').trim();
    if (!name || !guardian) return fail('Enter the student name and the guardian name.');
    const className = String(form.get('class'));
    const roll = school.students.filter(s => s.className === className).length + 1;
    const student: Student = { id: id(`${school.id}-stu`), roll, name, className, guardian, gender: String(form.get('gender')) === 'Boy' ? 'Boy' : 'Girl', joined: todayISO(), status: 'Enrolled' };
    dispatch({ type: 'add-student', student, fee: { id: id(`${school.id}-fee`), studentId: student.id, term: 'October', amount: className === 'I' || className === 'II' || className === 'III' || className === 'IV' || className === 'V' ? 300 : 400, paid: false } });
    toast.success(`${name} enrolled in ${className}.`, { description: 'Stored in this browser only.' });
    close();
  }

  function addNotice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get('title') || '').trim();
    const body = String(form.get('body') || '').trim();
    if (!title || !body) return fail('Enter a notice title and message.');
    dispatch({ type: 'add-notice', notice: { id: id(`${school.id}-not`), title, body, audience: String(form.get('audience')), category: String(form.get('category')), date: todayISO() } });
    toast.success('Notice published to the local board.', { description: 'No message was sent to anyone.' });
    close();
  }

  function addLeave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const staffId = String(form.get('staff'));
    const from = String(form.get('from'));
    const to = String(form.get('to'));
    const reason = String(form.get('reason') || '').trim();
    if (!staffId || !from || !to) return fail('Choose the teacher and both dates.');
    if (to < from) return fail('The return date cannot be earlier than the first day of leave.');
    if (!reason) return fail('Enter the reason for the record.');
    const member = school.staff.find(s => s.id === staffId)!;
    dispatch({ type: 'add-leave', request: { id: id(`${school.id}-lv`), staffId, type: String(form.get('type')), from, to, days: daysBetween(from, to), reason, status: 'Pending review' } });
    toast.success(`Leave recorded for ${member.name}.`, { description: 'Approval stays local until an accounts and HR backend exists.' });
    close();
  }

  function addTransfer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dialog || dialog.kind !== 'transfer') return;
    const form = new FormData(event.currentTarget);
    const applicant = String(form.get('applicant') || '').trim();
    const to = String(form.get('to') || '').trim();
    const ground = String(form.get('ground') || '').trim();
    if (!applicant || !to || !ground) return fail('Fill in the teacher, the destination and the ground.');
    const kind = moduleById.get(dialog.moduleId);
    dispatch({ type: 'add-transfer', application: { id: id(`${school.id}-tr`), kind: dialog.moduleId, applicant, fromSchool: school.name, to, ground, reason: String(form.get('reason') || '').trim(), ref: `${school.id.slice(-4).toUpperCase()}-${(kind?.nav.slice(0, 3) || 'TRF').toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`, status: 'Draft', createdAt: todayISO() } });
    toast.success('Draft application created.', { description: 'It is not submitted to any department from here.' });
    close();
  }

  function addTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const subject = String(form.get('subject') || '').trim();
    const detail = String(form.get('detail') || '').trim();
    if (!subject || !detail) return fail('Enter a subject and the detail.');
    dispatch({ type: 'add-ticket', ticket: { id: id(`${school.id}-tk`), subject, category: String(form.get('category')), detail, status: 'Open', createdAt: todayISO() } });
    toast.success('Ticket opened locally.', { description: 'Assign an owner once the support backend exists.' });
    close();
  }

  function addMdm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const date = String(form.get('date'));
    const meals = Number(form.get('meals'));
    if (!date) return fail('Choose the serving date.');
    if (!Number.isFinite(meals) || meals < 0) return fail('Enter the number of meals served.');
    const book = school.attendance[date] ?? {};
    dispatch({ type: 'add-mdm', entry: { id: id(`${school.id}-mdm`), date, menu: String(form.get('menu')), meals, classCount: new Set(school.students.filter(s => book[s.id] !== 'Absent').map(s => s.className)).size || new Set(school.students.map(s => s.className)).size, note: String(form.get('note') || '').trim() } });
    toast.success('Serving register updated for the preview.');
    close();
  }

  const moduleDef = dialog?.kind === 'transfer' ? moduleById.get(dialog.moduleId) : undefined;

  return <Dialog open={dialog !== null} onOpenChange={open => { if (!open) close(); }}>
    <DialogContent className="app-dialog">
      {dialog && <>
        <DialogHeader>
          <DialogTitle>{dialog.kind === 'add-school' ? 'Add a school' : dialog.kind === 'settings' ? 'School profile' : dialog.kind === 'student' ? 'Enroll a student' : dialog.kind === 'notice' ? 'New notice' : dialog.kind === 'leave' ? 'Record staff leave' : dialog.kind === 'ticket' ? 'Raise a ticket' : dialog.kind === 'mdm' ? 'Log a meal day' : dialog.kind === 'transfer' ? `${moduleDef?.name ?? 'Transfer'} draft` : dialog.kind === 'profile' ? dialog.student.name : 'Record a demo payment'}</DialogTitle>
          <DialogDescription>{dialog.kind === 'add-school' ? 'A new school gets the complete module board with its own records.' : dialog.kind === 'profile' ? `Roll ${dialog.student.roll} · ${dialog.student.className}` : 'Everything you type stays in this browser. No login, database or department is contacted.'}</DialogDescription>
        </DialogHeader>
        {error && <p role="alert" className="form-error">{error}</p>}

        {dialog.kind === 'add-school' && <form className="preview-form" onSubmit={addSchool}>
          <Row><Label htmlFor="school-name">School name</Label><Input id="school-name" name="name" maxLength={90} placeholder="e.g. GHS Rampur Demo School" /></Row>
          <Row><Label htmlFor="school-category">Category</Label><select id="school-category" name="category" defaultValue={SCHOOL_CATEGORIES[2]}>{SCHOOL_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></Row>
          <div className="form-grid">
            <Row><Label htmlFor="school-block">Block</Label><Input id="school-block" name="block" maxLength={60} placeholder="Demo Block North" /></Row>
            <Row><Label htmlFor="school-district">District</Label><Input id="school-district" name="district" maxLength={60} placeholder="Demo District" /></Row>
          </div>
          <div className="form-grid">
            <Row><Label htmlFor="school-medium">Medium</Label><select id="school-medium" name="medium" defaultValue={MEDIUMS[0]}>{MEDIUMS.map(m => <option key={m}>{m}</option>)}</select></Row>
            <Row><Label htmlFor="school-session">Session</Label><Input id="school-session" name="session" defaultValue="2026–27" maxLength={12} /></Row>
          </div>
          <div className="check-row"><Checkbox id="school-seed" checked={seedSamples} onCheckedChange={value => setSeedSamples(value === true)} /><div><strong>Add fictional sample records</strong><small>Classes, teachers and enrollment for the new school. Turn this off to start empty.</small></div></div>
          <div className="form-actions"><Button type="button" variant="outline" onClick={close}>Cancel</Button><Button type="submit">Add school</Button></div>
        </form>}

        {dialog.kind === 'settings' && <form className="preview-form" onSubmit={saveSettings}>
          <Row><Label htmlFor="profile-name">School name</Label><Input id="profile-name" name="name" defaultValue={school.name} maxLength={90} /></Row>
          <Row><Label htmlFor="profile-category">Category</Label><select id="profile-category" name="category" defaultValue={school.category}>{SCHOOL_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></Row>
          <div className="form-grid">
            <Row><Label htmlFor="profile-block">Block</Label><Input id="profile-block" name="block" defaultValue={school.block} maxLength={60} /></Row>
            <Row><Label htmlFor="profile-district">District</Label><Input id="profile-district" name="district" defaultValue={school.district} maxLength={60} /></Row>
          </div>
          <div className="form-grid">
            <Row><Label htmlFor="profile-medium">Medium</Label><select id="profile-medium" name="medium" defaultValue={school.medium}>{MEDIUMS.map(m => <option key={m}>{m}</option>)}</select></Row>
            <Row><Label htmlFor="profile-session">Session</Label><Input id="profile-session" name="session" defaultValue={school.session} maxLength={12} /></Row>
          </div>
          {note('Classes are derived from the category. Changing the category does not delete existing records.')}
          <div className="form-actions"><Button variant="outline" type="button" onClick={() => dispatch({ type: 'reset' })}>Reset workspace</Button><Button type="submit">Save profile</Button></div>
          <div className="danger-row">
            <Button type="button" variant="outline" size="sm" disabled={state.schools.length < 2 || confirmDelete} onClick={() => { dispatch({ type: 'remove-school', id: school.id }); toast.success(`${school.name} removed from this browser.`); close(); }}>{confirmDelete ? 'Confirm removal' : `Remove ${school.name}`}</Button>
            {!confirmDelete && <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDelete(true)}>Ask me to confirm</Button>}
          </div>
        </form>}

        {dialog.kind === 'student' && <form className="preview-form" onSubmit={addStudent}>
          <Row><Label htmlFor="student-name">Student name</Label><Input id="student-name" name="name" maxLength={80} placeholder="Use fictional names only" /></Row>
          <Row><Label htmlFor="student-guardian">Guardian name</Label><Input id="student-guardian" name="guardian" maxLength={80} placeholder="Use fictional names only" /></Row>
          <div className="form-grid">
            <Row><Label htmlFor="student-class">Class & section</Label><select id="student-class" name="class">{school.classes.map(c => <option key={c.id}>{c.id}</option>)}</select></Row>
            <Row><Label htmlFor="student-gender">Gender</Label><select id="student-gender" name="gender"><option>Girl</option><option>Boy</option></select></Row>
          </div>
          {!school.classes.length && note('This school has no sections yet, so enrollment is disabled until the category produces at least one.')}
          <div className="form-actions"><Button type="button" variant="outline" onClick={close}>Cancel</Button><Button type="submit" disabled={!school.classes.length}>Enroll student</Button></div>
        </form>}

        {dialog.kind === 'notice' && <form className="preview-form" onSubmit={addNotice}>
          <Row><Label htmlFor="notice-title">Title</Label><Input id="notice-title" name="title" maxLength={120} placeholder="e.g. Science exhibition" /></Row>
          <Row><Label htmlFor="notice-body">Message</Label><Textarea id="notice-body" name="body" rows={4} maxLength={2000} placeholder="What should the school community know?" /></Row>
          <div className="form-grid">
            <Row><Label htmlFor="notice-audience">Audience</Label><select id="notice-audience" name="audience">{['Everyone', 'Students', 'Parents', 'Staff'].map(a => <option key={a}>{a}</option>)}</select></Row>
            <Row><Label htmlFor="notice-category">Category</Label><select id="notice-category" name="category">{['Academic', 'Admin', 'Welfare', 'Exam'].map(c => <option key={c}>{c}</option>)}</select></Row>
          </div>
          <div className="form-actions"><Button variant="outline" type="button" onClick={close}>Cancel</Button><Button type="submit">Publish locally</Button></div>
        </form>}

        {dialog.kind === 'leave' && <form className="preview-form" onSubmit={addLeave}>
          <Row><Label htmlFor="leave-staff">Teacher or staff member</Label><select id="leave-staff" name="staff">{school.staff.map(s => <option key={s.id} value={s.id}>{s.name} · {s.assignedClass}</option>)}</select></Row>
          <Row><Label htmlFor="leave-type">Leave type</Label><select id="leave-type" name="type">{['Casual', 'Medical', 'Duty', 'Other'].map(t => <option key={t}>{t}</option>)}</select></Row>
          <div className="form-grid">
            <Row><Label htmlFor="leave-from">First day</Label><Input id="leave-from" name="from" type="date" defaultValue={todayISO()} /></Row>
            <Row><Label htmlFor="leave-to">Last day</Label><Input id="leave-to" name="to" type="date" defaultValue={todayISO()} /></Row>
          </div>
          <Row><Label htmlFor="leave-reason">Reason</Label><Textarea id="leave-reason" name="reason" rows={3} maxLength={400} /></Row>
          <div className="form-actions"><Button variant="outline" type="button" onClick={close}>Cancel</Button><Button type="submit" disabled={!school.staff.length}>Record leave</Button></div>
        </form>}

        {dialog.kind === 'transfer' && <form className="preview-form" onSubmit={addTransfer}>
          <Row><Label htmlFor="transfer-applicant">Teacher on transfer</Label><Input id="transfer-applicant" name="applicant" maxLength={80} defaultValue={school.staff[1]?.name} placeholder="Fictional name" /></Row>
          <Row><Label htmlFor="transfer-to">Destination</Label><Input id="transfer-to" name="to" maxLength={80} placeholder={dialog.moduleId === 'transfer-district' ? 'Target district or block' : 'School, block or district office'} /></Row>
          <Row><Label htmlFor="transfer-ground">{dialog.moduleId === 'transfer-mutual' ? 'Counterpart teacher' : dialog.moduleId === 'transfer-teacher' ? 'Preference note' : 'Ground'}</Label><Input id="transfer-ground" name="ground" maxLength={120} placeholder={dialog.moduleId === 'transfer-special' ? 'Spouse posted elsewhere · medical · disability' : 'Short statement'} /></Row>
          <Row><Label htmlFor="transfer-reason">Supporting note</Label><Textarea id="transfer-reason" name="reason" rows={3} maxLength={600} /></Row>
          {note('The draft carries the school name, a local reference number and a status. Submitting to a department needs an authorized API and an authenticated officer account.')}
          <div className="form-actions"><Button variant="outline" type="button" onClick={close}>Cancel</Button><Button type="submit">Create draft</Button></div>
        </form>}

        {dialog.kind === 'ticket' && <form className="preview-form" onSubmit={addTicket}>
          <Row><Label htmlFor="ticket-subject">Subject</Label><Input id="ticket-subject" name="subject" maxLength={120} placeholder="e.g. Drinking water pump" /></Row>
          <Row><Label htmlFor="ticket-category">Category</Label><select id="ticket-category" name="category">{['Infrastructure', 'Academic', 'Payroll', 'Mid-day meal', 'Transport', 'Other'].map(c => <option key={c}>{c}</option>)}</select></Row>
          <Row><Label htmlFor="ticket-detail">Detail</Label><Textarea id="ticket-detail" name="detail" rows={4} maxLength={1200} /></Row>
          <div className="form-actions"><Button variant="outline" type="button" onClick={close}>Cancel</Button><Button type="submit">Open ticket</Button></div>
        </form>}

        {dialog.kind === 'mdm' && <form className="preview-form" onSubmit={addMdm}>
          <div className="form-grid">
            <Row><Label htmlFor="mdm-date">Serving date</Label><Input id="mdm-date" name="date" type="date" defaultValue={todayISO()} /></Row>
            <Row><Label htmlFor="mdm-menu">Menu</Label><select id="mdm-menu" name="menu">{MENUS.map(m => <option key={m}>{m}</option>)}</select></Row>
          </div>
          <Row><Label htmlFor="mdm-meals">Meals served</Label><Input id="mdm-meals" name="meals" type="number" min={0} max={9999} defaultValue={Object.values(school.attendance[todayISO()] ?? {}).filter(s => s !== 'Absent').length} /></Row>
          <Row><Label htmlFor="mdm-note">Note</Label><Input id="mdm-note" name="note" maxLength={160} placeholder="Optional, e.g. rice stock for 12 days" /></Row>
          <div className="form-actions"><Button variant="outline" type="button" onClick={close}>Cancel</Button><Button type="submit" disabled={!school.students.length}>Save entry</Button></div>
        </form>}

        {dialog.kind === 'profile' && <>
          <dl className="detail-list">
            <div><dt>Roll & class</dt><dd>{dialog.student.roll} · {dialog.student.className}</dd></div>
            <div><dt>Guardian</dt><dd>{dialog.student.guardian}</dd></div>
            <div><dt>Gender</dt><dd>{dialog.student.gender}</dd></div>
            <div><dt>Enrolled on</dt><dd>{dateLabel(dialog.student.joined)}</dd></div>
            <div><dt>Today</dt><dd>{(school.attendance[todayISO()] ?? {})[dialog.student.id] ?? 'Not marked'}</dd></div>
            <div><dt>Fee status</dt><dd>{rupees(school.fees.find(f => f.studentId === dialog.student.id)?.amount ?? 0)} · {school.fees.find(f => f.studentId === dialog.student.id)?.paid ? 'Paid' : 'Due'}</dd></div>
          </dl>
          <div className="form-actions"><Button variant="outline" onClick={close}>Close</Button></div>
        </>}

        {dialog.kind === 'payment' && <>
          <div className="payment-box"><strong>{school.students.find(s => s.id === dialog.fee.studentId)?.name}</strong><span>{rupees(dialog.fee.amount)} · {dialog.fee.term} term</span></div>
          {note('No gateway, no receipt number and no money movement. The register only tracks a demo flag.')}
          <div className="form-actions"><Button variant="outline" onClick={close}>Cancel</Button><Button onClick={() => { dispatch({ type: 'pay-fee', feeId: dialog.fee.id }); toast.success('Demo payment marked paid.'); close(); }}>Mark as paid</Button></div>
        </>}
      </>}
    </DialogContent>
  </Dialog>;
}

export function attendanceTone(status?: AttendanceStatus): 'ok' | 'bad' | 'warn' | 'mute' { return status === 'Present' ? 'ok' : status === 'Absent' ? 'bad' : status === 'Leave' ? 'warn' : 'mute'; }

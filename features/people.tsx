import { useMemo, useState } from 'react';
import { Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { DataTable, EmptyState, FilterField, Kpi, NoResults, PageHead, Panel, Pill, SearchField, Toolbar } from '@/components/common';
import { moduleById, modules } from '@/core/modules';
import { staffWorkload, workforceSummary, filterStaff } from '@/core/workforce';
import { dateLabel, downloadCsv, initialsOf, shortDate } from '@/core/format';
import { useWorkspace } from '@/core/workspace';
import type { LeaveRequest, TransferApplication } from '@/core/types';
import type { Nav } from '@/core/nav';

const def = (id: string) => modules.find(m => m.id === id)!;

export function StaffView({ nav }: { nav: Nav }) {
  const { school } = useWorkspace();
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('All roles');
  const [subject, setSubject] = useState('All subjects');
  const [timetable, setTimetable] = useState('all');
  const summary = workforceSummary(school);
  const rows = filterStaff(school, { query, role, subject, timetable: timetable as 'all' | 'assigned' | 'unassigned' });
  const roles = ['All roles', ...new Set(school.staff.map(member => member.role).filter(Boolean).sort())];
  const subjects = ['All subjects', ...new Set(school.staff.map(member => member.subject).filter(Boolean).sort())];

  return <>
    <PageHead module={def('staff')} crumb="People & transfers">
      <Button variant="outline" disabled={!rows.length} onClick={() => downloadCsv(`${school.name.toLowerCase().replace(/\\W+/g, '-')}-staff.csv`, [
        ['Name', 'Role', 'Subject', 'Assigned class', 'Class teacher of', 'Periods per week', 'Sections taught', 'Approved leave days', 'Leave balance'],
        ...rows.map(member => {
          const record = staffWorkload(school, member);
          return [member.name, member.role, member.subject, member.assignedClass, record.classTeacherOf.join(', ') || '—', record.periodsPerWeek, record.taughtClasses.length, record.approvedLeaveDays, record.leaveBalance];
        }),
      ])}><Download size={15} /> Export filtered</Button>
      <Button onClick={() => nav.open({ kind: 'leave' })}><Plus size={15} /> Record leave</Button>
    </PageHead>
    <div className="kpi-row">
      <Kpi label="Staff on register" value={String(summary.total)} note="Local staff directory" />
      <Kpi label="Timetable assigned" value={String(summary.withTimetable)} note={`${summary.totalPeriods} periods across the week`} />
      <Kpi label="Not timetabled" value={String(summary.withoutTimetable)} note="Includes non-teaching roles" />
      <Kpi label="Leave pending" value={String(summary.pendingLeave)} note="Awaiting a decision" tone={summary.pendingLeave ? 'warn' : 'ok'} />
    </div>
    {!school.staff.length ? <EmptyState title="No staff records" text={`${school.name} has no staff records in this browser. Add a verified staff master only after the authenticated school-data gateway is ready.`} /> : <>
      <Toolbar>
        <SearchField label="Search staff" value={query} onChange={setQuery} placeholder="Name, role, subject or section…" />
        <FilterField label="Role" value={role} options={roles} onChange={setRole} />
        <FilterField label="Subject" value={subject} options={subjects} onChange={setSubject} />
        <FilterField label="Timetable" value={timetable} options={['all', 'assigned', 'unassigned']} onChange={setTimetable} />
        <span className="toolbar-count">{rows.length} of {school.staff.length}</span>
      </Toolbar>
      {!rows.length ? <NoResults text="No staff match these filters. Clear the search or choose All roles, All subjects and all timetable states." /> : <div className="card-grid">
        {rows.map(member => {
          const record = staffWorkload(school, member);
          const transfers = school.transferApplications.filter(application => application.staffId === member.id).length;
          return <article className="panel compact-card" key={member.id}>
            <header><span className="person"><span className="avatar">{initialsOf(member.name)}</span><div><strong>{member.name}</strong><span className="muted small">{member.subject}</span></div></span><Pill tone={record.leaveBalance > 10 ? 'ok' : 'warn'}>{record.leaveBalance} days left</Pill></header>
            <div className="card-rows">
              <div><span>Role</span><strong>{member.role}</strong></div>
              <div><span>Assigned class</span><strong>{member.assignedClass || '—'}</strong></div>
              <div><span>Class teacher of</span><strong>{record.classTeacherOf.join(', ') || '—'}</strong></div>
              <div><span>Periods this week</span><strong>{record.periodsPerWeek} across {record.taughtClasses.length} sections</strong></div>
              <div><span>Approved leave used</span><strong>{record.approvedLeaveDays} days</strong></div>
              {record.pendingLeave > 0 && <div><span>Leave awaiting review</span><strong>{record.pendingLeave}</strong></div>}
              {transfers > 0 && <div><span>Transfer records</span><strong>{transfers}</strong></div>}
            </div>
            <div className="card-actions"><Button variant="outline" size="sm" onClick={() => nav.open({ kind: 'leave' })}>Record leave</Button><Button variant="outline" size="sm" onClick={() => nav.go('timetable')}>Timetable</Button>{member.assignedClass !== '—' && <Button variant="ghost" size="sm" onClick={() => nav.go('classes')}>View section</Button>}</div>
          </article>;
        })}
      </div>}
    </>}
  </>;
}

const leaveStatuses: LeaveRequest['status'][] = ['Pending review', 'Approved', 'Declined'];

export function LeaveView({ nav }: { nav: Nav }) {
  const { school, dispatch } = useWorkspace();
  const [status, setStatus] = useState('All statuses');
  const rows = school.leaveRequests.filter(r => status === 'All statuses' || r.status === status);
  const daysByType = useMemo(() => {
    const map = new Map<string, number>();
    school.leaveRequests.forEach(r => map.set(r.type, (map.get(r.type) ?? 0) + r.days));
    return [...map.entries()];
  }, [school.leaveRequests]);

  return <>
    <PageHead module={def('leave')} crumb="People & transfers">
      <Button onClick={() => nav.open({ kind: 'leave' })}><Plus size={15} /> Record leave</Button>
    </PageHead>
    <div className="kpi-row">
      {daysByType.length ? daysByType.map(([type, days]) => <Kpi key={type} label={`${type} leave`} value={`${days} days`} note={`${school.leaveRequests.filter(r => r.type === type).length} entries`} />)
        : <><Kpi label="Entries" value="0" note="No leave recorded for this school" /><Kpi label="Balance pool" value={`${school.staff.reduce((sum, s) => sum + s.leaveBalance, 0)} days`} note="Across the staff master" /></>}
    </div>
    <Panel title="Leave ledger" meta={`${school.name} · decisions stay in this browser`}
      caption={<span>An approved entry only changes the local ledger. Linking it to pay and to the district HR record needs an authenticated backend.</span>}
      actions={<FilterField label="Status" value={status} options={['All statuses', ...leaveStatuses]} onChange={setStatus} />}>
      {!rows.length ? <EmptyState title="No leave entries" text={school.leaveRequests.length ? 'No entry has this status.' : 'Record leave to start the ledger for this school.'} action={<Button variant="outline" onClick={() => nav.open({ kind: 'leave' })}>Record leave</Button>} /> : <DataTable headings={['Teacher', 'Type', 'First day', 'Last day', 'Days', 'Reason', 'Status', '']}
        rows={rows.map(request => {
          const member = school.staff.find(s => s.id === request.staffId);
          return <TableRow key={request.id}>
            <TableCell>{member?.name ?? 'Removed teacher'}</TableCell>
            <TableCell>{request.type}</TableCell>
            <TableCell className="mono">{shortDate(request.from)}</TableCell>
            <TableCell className="mono">{shortDate(request.to)}</TableCell>
            <TableCell className="mono">{request.days}</TableCell>
            <TableCell className="muted wrap">{request.reason}</TableCell>
            <TableCell><Pill tone={request.status === 'Approved' ? 'ok' : request.status === 'Declined' ? 'bad' : 'warn'}>{request.status}</Pill></TableCell>
            <TableCell><div className="row-actions">{request.status !== 'Approved' && <Button size="sm" variant="outline" onClick={() => dispatch({ type: 'set-leave-status', id: request.id, status: 'Approved' })}>Approve</Button>}{request.status !== 'Declined' && <Button size="sm" variant="ghost" onClick={() => dispatch({ type: 'set-leave-status', id: request.id, status: 'Declined' })}>Decline</Button>}</div></TableCell>
          </TableRow>;
        })} />}
    </Panel>
  </>;
}

const transferCycle: TransferApplication['status'][] = ['Draft', 'Ready to file', 'Filed elsewhere'];

export function TransfersView({ moduleId, nav }: { moduleId: string; nav: Nav }) {
  const { school, dispatch } = useWorkspace();
  const module = def(moduleId);
  const [query, setQuery] = useState('');
  const rows = school.transferApplications.filter(a => a.kind === moduleId && `${a.applicant} ${a.to} ${a.ground} ${a.ref}`.toLowerCase().includes(query.toLowerCase()));
  const allForKind = school.transferApplications.filter(a => a.kind === moduleId);

  return <>
    <PageHead module={module} crumb="People & transfers">
      <Button variant="outline" disabled={!allForKind.length} onClick={() => downloadCsv(`${moduleId}-drafts.csv`, [['Reference', 'Teacher', 'From', 'To', 'Ground', 'Status', 'Created'], ...allForKind.map(a => [a.ref, a.applicant, a.fromSchool, a.to, a.ground, a.status, a.createdAt])])}><Download size={15} /> Export drafts</Button>
      <Button onClick={() => nav.open({ kind: 'transfer', moduleId })}><Plus size={15} /> New draft</Button>
    </PageHead>
    <p className="scope-note">{module.blurb} This screen prepares and tracks the paperwork only. The real file moves through the department's own system once an authorized officer account and API exist.</p>
    <div className="kpi-row">
      <Kpi label="Drafts" value={String(allForKind.filter(a => a.status === 'Draft').length)} note="Not yet complete" />
      <Kpi label="Ready to file" value={String(allForKind.filter(a => a.status === 'Ready to file').length)} note="Papers assembled" tone="ok" />
      <Kpi label="Filed" value={String(allForKind.filter(a => a.status === 'Filed elsewhere').length)} note="Tracked outside this app" />
    </div>
    <Toolbar>
      <SearchField label="Search applications" value={query} onChange={setQuery} placeholder="Teacher, destination or reference…" />
      <span className="toolbar-count">{rows.length} of {allForKind.length} {module.nav.toLowerCase()} drafts</span>
    </Toolbar>
    <Panel title="Application register" meta={`${school.name} · ${module.name}`}>
      {!rows.length ? <EmptyState title={allForKind.length ? 'No draft matches the search' : 'No drafts yet'} text={allForKind.length ? 'Clear the search to see every application in this module.' : `Create the first ${module.nav.toLowerCase()} draft for ${school.name}.`} action={<Button variant="outline" onClick={() => nav.open({ kind: 'transfer', moduleId })}>New draft</Button>} /> : <DataTable headings={['Reference', 'Teacher', 'From', 'To', 'Ground', 'Status', 'Created', '']}
        rows={rows.map(application => <TableRow key={application.id}>
          <TableCell className="mono">{application.ref}</TableCell>
          <TableCell>{application.applicant}</TableCell>
          <TableCell className="muted">{application.fromSchool}</TableCell>
          <TableCell>{application.to}</TableCell>
          <TableCell className="muted wrap">{application.ground}</TableCell>
          <TableCell><Pill tone={application.status === 'Ready to file' ? 'ok' : application.status === 'Filed elsewhere' ? 'mute' : 'warn'}>{application.status}</Pill></TableCell>
          <TableCell className="mono muted">{dateLabel(application.createdAt)}</TableCell>
          <TableCell><div className="row-actions">
            {application.status !== 'Ready to file' && <Button size="sm" variant="outline" onClick={() => dispatch({ type: 'set-transfer-status', id: application.id, status: 'Ready to file' })}>Mark ready</Button>}
            {application.status !== 'Filed elsewhere' && <Button size="sm" variant="ghost" onClick={() => dispatch({ type: 'set-transfer-status', id: application.id, status: 'Filed elsewhere' })}>Mark filed</Button>}
          </div></TableCell>
        </TableRow>)} />}
    </Panel>
    <div className="related-links">
      <Button variant="ghost" size="sm" onClick={() => nav.go('transfer-special')}>Special ground</Button>
      <Button variant="ghost" size="sm" onClick={() => nav.go('transfer-district')}>Inter-district</Button>
      <Button variant="ghost" size="sm" onClick={() => nav.go('transfer-teacher')}>Transfer 2.0</Button>
      <Button variant="ghost" size="sm" onClick={() => nav.go('transfer-mutual')}>Mutual</Button>
    </div>
  </>;
}

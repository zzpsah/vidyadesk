import { useMemo, useState } from 'react';
import { Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { DataTable, EmptyState, FilterField, Kpi, NoResults, PageHead, Panel, Pill, SearchField, Toolbar } from '@/components/common';
import { moduleById, modules } from '@/core/modules';
import { staffSummary } from '@/core/graph';
import { dateLabel, downloadCsv, initialsOf, shortDate } from '@/core/format';
import { useWorkspace } from '@/core/workspace';
import type { LeaveRequest, TransferApplication } from '@/core/types';
import type { Nav } from '@/core/nav';

const def = (id: string) => modules.find(m => m.id === id)!;

export function StaffView({ nav }: { nav: Nav }) {
  const { school } = useWorkspace();
  const [query, setQuery] = useState('');
  const rows = school.staff.filter(s => `${s.name} ${s.subject} ${s.assignedClass} ${s.role}`.toLowerCase().includes(query.toLowerCase()));
  return <>
    <PageHead module={def('staff')} crumb="People & transfers">
      <Button variant="outline" disabled={!rows.length} onClick={() => downloadCsv(`${school.name.toLowerCase().replace(/\W+/g, '-')}-staff.csv`, [['Name', 'Subject', 'Role', 'Class teacher of', 'Periods per week', 'Sections taught', 'Hours', 'Leave balance'], ...rows.map(s => { const r = staffSummary(school, s.id); return [s.name, s.subject, s.role, r?.classTeacherOf.join(', ') || '—', r?.periodsPerWeek ?? 0, r?.taughtClasses.length ?? 0, s.schedule, s.leaveBalance]; })])}><Download size={15} /> Export</Button>
      <Button onClick={() => nav.open({ kind: 'leave' })}><Plus size={15} /> Record leave</Button>
    </PageHead>
    {!school.staff.length
      ? <EmptyState title="No teaching staff yet" text={`${school.name} has no staff records. The payroll and HR module needs a staff master before leave or transfers can work.`} action={<Button variant="outline" onClick={() => nav.go('transfer-teacher')}>Open transfer drafts</Button>} />
      : <>
        <div className="kpi-row">
          <Kpi label="On the rolls" value={String(school.staff.length)} note="Sample staff master" />
          <Kpi label="Class teachers" value={String(school.staff.filter(s => s.role !== 'Head teacher').length)} note={`${school.classes.length} sections to cover`} />
          <Kpi label="Leave pending" value={String(school.leaveRequests.filter(r => r.status === 'Pending review').length)} note="Awaiting a decision" tone="warn" />
        </div>
        <Toolbar>
          <SearchField label="Search staff" value={query} onChange={setQuery} placeholder="Name, subject or section…" />
          <span className="toolbar-count">{rows.length} of {school.staff.length}</span>
        </Toolbar>
        {!rows.length ? <NoResults text="Try another name, subject or section." /> : <div className="card-grid">
          {rows.map(member => {
            const record = staffSummary(school, member.id);
            const transfers = record?.transfers.length ?? 0;
            return <article className="panel compact-card" key={member.id}>
              <header><span className="person"><span className="avatar">{initialsOf(member.name)}</span><div><strong>{member.name}</strong><span className="muted small">{member.subject}</span></div></span><Pill tone={member.leaveBalance > 10 ? 'ok' : 'warn'}>{member.leaveBalance} days left</Pill></header>
              <div className="card-rows">
                <div><span>Role</span><strong>{member.role}</strong></div>
                <div><span>Class teacher of</span><strong>{record?.classTeacherOf.join(', ') || '—'}</strong></div>
                <div><span>Periods this week</span><strong>{record?.periodsPerWeek ?? 0} across {record?.taughtClasses.length ?? 0} sections</strong></div>
                <div><span>Students taught</span><strong>{school.students.filter(s => record?.taughtClasses.includes(s.className)).length}</strong></div>
                {transfers > 0 && <div><span>Transfer drafts</span><strong>{transfers} open in {moduleById.get(school.transferApplications.find(a => a.staffId === member.id)?.kind ?? '')?.nav ?? 'transfers'}</strong></div>}
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

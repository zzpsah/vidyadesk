import { useMemo, useState } from 'react';
import { Download, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { DataTable, EmptyState, Kpi, PageHead, Panel, Pill } from '@/components/common';
import { moduleById } from '@/core/modules';
import { classAttendance, feeSummary, mdmAudit, schoolSummary, staffSummary, studentProfile, ticketBoard, transferPipeline, portfolioSummary, attendanceDates } from '@/core/graph';
import { dateLabel, downloadCsv, rupees } from '@/core/format';
import { useWorkspace, todayISO } from '@/core/workspace';
import type { Nav } from '@/core/nav';
import type { School } from '@/core/types';

export type Cell = string | number;
export type Report = { headings: Cell[]; rows: Cell[][]; note: string };

type ReportDef = {
  id: string;
  name: string;
  blurb: string;
  /** Module ids whose data this report composes — the point of the whole exercise. */
  needs: string[];
  build: (school: School, schools: School[]) => Report;
};

const REPORTS: ReportDef[] = [
  {
    id: 'class-register', name: 'Attendance by class', blurb: 'Section-wise attendance across every register day.', needs: ['attendance', 'students', 'classes'],
    build: school => {
      const days = attendanceDates(school).length;
      return {
        headings: ['Class', 'Class teacher', 'On roll', 'Days marked', 'Present', 'Attendance %'],
        rows: school.classes.map(section => {
          const record = classAttendance(school, section.id);
          const teacher = school.staff.find(s => s.id === section.teacherId)?.name ?? 'Unassigned';
          return [section.id, teacher, record.roster, days, record.present, `${record.percent}%`];
        }),
        note: `${days} register day${days === 1 ? '' : 's'} stored for ${school.name}.`,
      };
    },
  },
  {
    id: 'fee-dues', name: 'Fee dues', blurb: 'Outstanding amounts with the guardian to contact.', needs: ['fees', 'students', 'classes'],
    build: school => ({
      headings: ['Student', 'Class', 'Guardian', 'Term', 'Amount', 'Status'],
      rows: school.fees.filter(fee => !fee.paid).map(fee => {
        const student = school.students.find(s => s.id === fee.studentId);
        return [student?.name ?? 'Removed student', student?.className ?? '—', student?.guardian ?? '—', fee.term, rupees(fee.amount), 'Due'];
      }),
      note: `${rupees(feeSummary(school).outstanding)} outstanding across ${feeSummary(school).due} students.`,
    }),
  },
  {
    id: 'progress', name: 'Student progress cards', blurb: 'Attendance, marks and dues for every student in one row.', needs: ['students', 'attendance', 'exams', 'fees'],
    build: school => ({
      headings: ['Student', 'Class', 'Attendance %', 'Assessments', 'Total', 'Percent', 'Grade', 'Fee due'],
      rows: school.students.map(student => {
        const profile = studentProfile(school, student);
        return [student.name, student.className, `${profile.attendance.percent}%`, profile.rows.length, profile.total, `${profile.percent}%`, profile.grade, rupees(profile.due)];
      }),
      note: 'One row per student, assembled from four modules. Nothing is averaged across students.',
    }),
  },
  {
    id: 'staff-load', name: 'Staff workload', blurb: 'Periods taught, class responsibility and approved leave.', needs: ['timetable', 'staff', 'classes', 'leave'],
    build: school => ({
      headings: ['Teacher', 'Subject', 'Periods / week', 'Class teacher of', 'Leave pending', 'Balance after approved'],
      rows: school.staff.map(member => {
        const record = staffSummary(school, member.id);
        if (!record) return [member.name, member.subject, 0, '—', 0, member.leaveBalance];
        return [member.name, member.subject, record.periodsPerWeek, record.classTeacherOf.join(', ') || '—', record.pendingLeave, record.leaveBalanceAfter];
      }),
      note: 'Periods come from the stored timetable, so reassigning a slot changes this report immediately.',
    }),
  },
  {
    id: 'meal-audit', name: 'Meal register vs attendance', blurb: 'Meals served against the head-count the register implies.', needs: ['mdm', 'attendance'],
    build: school => ({
      headings: ['Date', 'Menu', 'Expected from register', 'Recorded', 'Difference'],
      rows: mdmAudit(school).map(entry => [entry.date, entry.menu, entry.expected ?? 'No register', entry.served ?? 'Not logged', entry.delta === null ? '—' : entry.delta]),
      note: `${school.mdmEntries.length} meal entries and ${attendanceDates(school).length} register days reconciled. A non-zero difference means the two registers disagree; '—' means one side has no entry for that date.`,
    }),
  },
  {
    id: 'transfer-pipeline', name: 'Transfer pipeline', blurb: 'Every draft with the staff record it belongs to.', needs: ['transfer-special', 'transfer-district', 'transfer-teacher', 'transfer-mutual', 'staff'],
    build: school => ({
      headings: ['Reference', 'Module', 'Applicant', 'Subject', 'Ground', 'To', 'Status'],
      rows: school.transferApplications.map(application => {
        const member = school.staff.find(s => s.id === application.staffId);
        return [application.ref, moduleById.get(application.kind)?.nav ?? application.kind, application.applicant, member?.subject ?? '—', application.ground, application.to, application.status];
      }),
      note: `${transferPipeline(school).drafts} drafts still need paperwork before they can be filed.`,
    }),
  },
  {
    id: 'ticket-backlog', name: 'Facility backlog', blurb: 'Unresolved tickets with the class they affect.', needs: ['tickets', 'classes'],
    build: school => ({
      headings: ['Subject', 'Category', 'Affects', 'Status', 'Raised'],
      rows: school.tickets.filter(ticket => ticket.status !== 'Resolved').map(ticket => [ticket.subject, ticket.category, ticket.classId ?? 'Whole campus', ticket.status, dateLabel(ticket.createdAt)]),
      note: `${ticketBoard(school).open} open, ${ticketBoard(school).resolved} resolved.`,
    }),
  },
  {
    id: 'portfolio', name: 'All schools compared', blurb: 'The rollup that only exists because this workspace holds several schools.', needs: ['students', 'attendance', 'fees', 'staff'],
    build: (_school, schools) => {
      const portfolio = portfolioSummary(schools);
      return {
        headings: ['School', 'Block', 'On roll', 'Staff', 'Attendance %', 'Collected', 'Outstanding'],
        rows: portfolio.rows.map(row => [row.school.name, row.school.block, row.summary.students, row.summary.staff, `${row.summary.attendancePercent}%`, rupees(row.summary.fees.collected), rupees(row.summary.fees.outstanding)]),
        note: `${portfolio.students} students and ${portfolio.staff} staff across ${schools.length} schools in this browser.`,
      };
    },
  },
];

export function ReportsView({ nav }: { moduleId?: string; nav: Nav }) {
  const { school, state } = useWorkspace();
  const [reportId, setReportId] = useState('progress');
  const report = useMemo(() => REPORTS.find(r => r.id === reportId) ?? REPORTS[0], [reportId]);
  const built = useMemo(() => report.build(school, state.schools), [report, school, state.schools]);
  const summary = useMemo(() => schoolSummary(school), [school]);
  const module = moduleById.get('reports');
  if (!module) return null;

  const exportCsv = () => {
    const slug = school.name.toLowerCase().replace(/\W+/g, '-');
    downloadCsv(`${slug}-${report.id}.csv`, [built.headings, ...built.rows]);
  };

  return <>
    <PageHead module={module} crumb="Academics">
      <Pill tone="accent">{todayISO()} snapshot</Pill>
    </PageHead>

    <div className="kpi-row">
      <Kpi label="Attendance recorded" value={`${summary.attendancePercent}%`} note={`${summary.attendanceDays} register days`} onClick={() => nav.go('attendance')} />
      <Kpi label="Fees collected" value={rupees(summary.fees.collected)} note={`${summary.fees.rate}% of ${summary.fees.records} records`} onClick={() => nav.go('fees')} />
      <Kpi label="Marks entered" value={String(summary.marksRecorded)} note={`${summary.exams} assessments scheduled`} onClick={() => nav.go('exams')} />
      <Kpi label="Open items" value={String(summary.tickets.open + summary.leavePending + summary.transfers.drafts)} note="Tickets, leave and drafts" onClick={() => nav.go('tickets')} />
    </div>

    <Panel title="Choose a report" meta={`${REPORTS.length} available`} caption={<span><Link2 size={13} aria-hidden="true" /> Each report reads more than one module; the chips show which ones it joins.</span>}>
      <div className="report-picker">
        {REPORTS.map(entry => <button key={entry.id} type="button" className={`report-chip${entry.id === report.id ? ' on' : ''}`} onClick={() => setReportId(entry.id)}>
          <strong>{entry.name}</strong><span>{entry.blurb}</span>
          <em>{entry.needs.map(id => moduleById.get(id)?.nav ?? id).join(' · ')}</em>
        </button>)}
      </div>
    </Panel>

    <Panel title={report.name} meta={`${built.rows.length} rows`} caption={<span>{built.note}</span>}
      actions={<div className="panel-actions"><Button size="sm" variant="outline" disabled={!built.rows.length} onClick={exportCsv}><Download size={15} /> Export CSV</Button></div>}>
      {!built.rows.length
        ? <EmptyState title="Nothing to report yet" text="This report reads live records — add data in the modules it joins and it fills itself." />
        : <DataTable headings={built.headings.map(String)} rows={built.rows.map((row, index) => <TableRow key={index}>{row.map((cell, cellIndex) => <TableCell key={cellIndex} className={typeof cell === 'number' ? 'mono' : undefined}>{cell}</TableCell>)}</TableRow>)} />}
    </Panel>

    <p className="foot-line">Reports are derived, never stored: change a register entry, a mark or a payment and the numbers here move with it. Exporting writes a CSV to your downloads folder only.</p>
  </>;
}

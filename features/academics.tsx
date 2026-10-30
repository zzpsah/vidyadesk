import { useMemo, useState } from 'react';
import { CalendarDays, Check, Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TableCell, TableRow } from '@/components/ui/table';
import { DataTable, EmptyState, FilterField, Kpi, NoResults, PageHead, Panel, Pill, SearchField, Toolbar } from '@/components/common';
import { DAYS, subjectScores, timetableFor } from '@/core/seed';
import { todayISO, useWorkspace } from '@/core/workspace';
import { dateLabel, downloadCsv, initialsOf, pct, rupees } from '@/core/format';
import { modules } from '@/core/modules';
import type { AttendanceStatus, Student } from '@/core/types';
import type { Nav } from '@/core/nav';

const def = (id: string) => modules.find(m => m.id === id)!;
const ALL = 'All sections';

function sectionOptions(classes: string[]) { return [ALL, ...classes]; }
function matches(section: string, value: string) { return section === ALL || value === section; }

function isoAdd(base: string, days: number) {
  const d = new Date(`${base}T12:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function StudentsView({ nav }: { nav: Nav }) {
  const { school } = useWorkspace();
  const [query, setQuery] = useState('');
  const [section, setSection] = useState(ALL);
  const rows = school.students.filter(s => matches(section, s.className) && `${s.roll} ${s.name} ${s.guardian}`.toLowerCase().includes(query.toLowerCase()));

  return <>
    <PageHead module={def('students')} crumb="Students">
      <Button variant="outline" disabled={!rows.length} onClick={() => downloadCsv(`${school.name.toLowerCase().replace(/\W+/g, '-')}-enrollment.csv`, [['Roll', 'Student', 'Class', 'Guardian', 'Gender', 'Enrolled'], ...rows.map(s => [s.roll, s.name, s.className, s.guardian, s.gender, s.joined])])}><Download size={15} /> Export CSV</Button>
      <Button onClick={() => nav.open({ kind: 'student' })}><Plus size={15} /> Enroll student</Button>
    </PageHead>
    <Toolbar>
      <SearchField label="Search students" value={query} onChange={setQuery} placeholder="Name, roll or guardian…" />
      <FilterField label="Section" value={section} options={sectionOptions(school.classes.map(c => c.id))} onChange={setSection} />
      <span className="toolbar-count">{rows.length} of {school.students.length} records</span>
    </Toolbar>
    {!school.students.length
      ? <EmptyState title="No students yet" text={`${school.name} has an empty register. Enroll the first student to unlock attendance, fees and results.`} action={<Button onClick={() => nav.open({ kind: 'student' })}><Plus size={15} /> Enroll student</Button>} />
      : <Panel title="Enrollment register" meta={`${school.classes.length} sections · session ${school.session}`}>
        <DataTable headings={['Roll', 'Student', 'Class', 'Guardian', 'Gender', 'Enrolled', '']} empty={<NoResults text="Clear the search or pick another section." />}
          rows={rows.map(s => <TableRow key={s.id}>
            <TableCell className="mono">{s.roll}</TableCell>
            <TableCell><span className="person"><span className="avatar">{initialsOf(s.name)}</span>{s.name}</span></TableCell>
            <TableCell>{s.className}</TableCell>
            <TableCell className="muted">{s.guardian}</TableCell>
            <TableCell>{s.gender}</TableCell>
            <TableCell className="muted">{dateLabel(s.joined)}</TableCell>
            <TableCell><Button variant="ghost" size="sm" onClick={() => nav.open({ kind: 'profile', student: s })}>Profile</Button></TableCell>
          </TableRow>)} />
      </Panel>}
  </>;
}

export function AttendanceView({ nav }: { nav: Nav }) {
  const { school, dispatch, savedAt } = useWorkspace();
  const [date, setDate] = useState(todayISO());
  const [section, setSection] = useState(ALL);
  const book = school.attendance[date] ?? {};
  const rows = school.students.filter(s => matches(section, s.className));
  const counts = useMemo(() => {
    const inScope = school.students.filter(s => matches(section, s.className));
    return {
      present: inScope.filter(s => book[s.id] === 'Present').length,
      absent: inScope.filter(s => book[s.id] === 'Absent').length,
      leave: inScope.filter(s => book[s.id] === 'Leave').length,
      unmarked: inScope.filter(s => !book[s.id]).length,
    };
  }, [school.students, book, section]);

  const markAll = (status: AttendanceStatus) => dispatch({ type: 'bulk-attendance', date, studentIds: rows.map(s => s.id), status });

  return <>
    <PageHead module={def('attendance')} crumb="Students">
      <span className="saved-flag">{savedAt ? `Saved locally at ${savedAt}` : 'Saving…'}</span>
    </PageHead>
    <div className="kpi-row">
      <Kpi label="Present" value={String(counts.present)} note={`${pct(counts.present, rows.length)}% of the section`} tone="ok" />
      <Kpi label="Absent" value={String(counts.absent)} note="Needs follow-up call" tone="warn" />
      <Kpi label="On leave" value={String(counts.leave)} note="Approved absence" />
      <Kpi label="Unmarked" value={String(counts.unmarked)} note={counts.unmarked ? 'Finish the register' : 'Register complete'} />
    </div>
    <Panel title="Daily register" meta={`${dateLabel(date)} · ${school.name}`}
      caption={<span>Pick a date to keep separate books per day. Marking one section does not touch the others.</span>}
      actions={<div className="panel-actions">
        <input aria-label="Register date" type="date" value={date} max={todayISO()} onChange={e => setDate(e.target.value)} className="date-input" />
        <FilterField label="Section" value={section} options={sectionOptions(school.classes.map(c => c.id))} onChange={setSection} />
        <Button size="sm" variant="outline" disabled={!rows.length} onClick={() => markAll('Present')}>Mark shown present</Button>
        <Button size="sm" variant="outline" disabled={!rows.length} onClick={() => nav.open({ kind: 'mdm' })}>Meal register</Button>
      </div>}>
      {!school.students.length
        ? <EmptyState title="Nothing to mark" text="Enroll students first — the register lists the class strength automatically." />
        : <DataTable headings={['Student', 'Class', 'Status', 'Mark']} empty={<NoResults text="No student in this section yet." />}
          rows={rows.map(s => <TableRow key={s.id}>
            <TableCell>{s.name}</TableCell>
            <TableCell>{s.className}</TableCell>
            <TableCell><Pill tone={book[s.id] === 'Present' ? 'ok' : book[s.id] === 'Absent' ? 'bad' : book[s.id] === 'Leave' ? 'warn' : 'mute'}>{book[s.id] ?? 'Unmarked'}</Pill></TableCell>
            <TableCell><div className="seg" role="group" aria-label={`Mark attendance for ${s.name}`}>{(['Present', 'Absent', 'Leave'] as AttendanceStatus[]).map(status => <button key={status} type="button" aria-pressed={book[s.id] === status} className={`seg-btn ${status.toLowerCase()}${book[s.id] === status ? ' on' : ''}`} onClick={() => dispatch({ type: 'set-attendance', date, studentId: s.id, status })}>{book[s.id] === status && <Check size={12} />}{status}</button>)}</div></TableCell>
          </TableRow>)} />
      }
    </Panel>
  </>;
}

export function ClassesView({ nav }: { nav: Nav }) {
  const { school } = useWorkspace();
  return <>
    <PageHead module={def('classes')} crumb="Academics" />
    {!school.classes.length ? <EmptyState title="No sections" text="This category produced no sections." /> : <div className="card-grid">
      {school.classes.map(section => {
        const teacher = school.staff.find(s => s.id === section.teacherId);
        const strength = school.students.filter(s => s.className === section.id).length;
        return <article className="panel compact-card" key={section.id}>
          <header><span className="class-chip">{section.id}</span><Pill tone={strength ? 'ok' : 'mute'}>{strength} enrolled</Pill></header>
          <div className="card-rows">
            <div><span>Class teacher</span><strong>{teacher ? teacher.name : 'Unassigned'}</strong></div>
            <div><span>Subject</span><strong>{teacher?.subject ?? '—'}</strong></div>
            <div><span>Timetable</span><strong>{DAYS.length} days · 8 periods</strong></div>
          </div>
          <Button variant="outline" size="sm" onClick={() => nav.go('timetable')}>Open timetable</Button>
        </article>;
      })}
    </div>}
  </>;
}

export function TimetableView({ nav }: { nav: Nav }) {
  const { school } = useWorkspace();
  const [section, setSection] = useState(school.classes[0]?.id ?? '');
  const [day, setDay] = useState(DAYS[0]);
  const rows = timetableFor(school, section, day);
  return <>
    <PageHead module={def('timetable')} crumb="Academics" />
    <Panel title="Weekly grid" meta={`${school.name} · ${section || 'no section'} · ${day}`}
      actions={<div className="panel-actions"><FilterField label="Section" value={section} options={school.classes.map(c => c.id)} onChange={setSection} /><FilterField label="Day" value={day} options={DAYS} onChange={setDay} /></div>}>
      {!school.classes.length ? <EmptyState title="No sections" text="Add classes for this school to build a timetable." /> : <DataTable headings={['Period', 'Time', 'Subject', 'Teacher']}
        rows={rows.map(row => <TableRow key={row.time}>
          <TableCell className="mono">{row.period}</TableCell>
          <TableCell className="mono muted">{row.time}</TableCell>
          <TableCell className={row.subject.includes('break') ? 'muted' : ''}>{row.subject}</TableCell>
          <TableCell className="muted">{row.teacher}</TableCell>
        </TableRow>)} />}
    </Panel>
    <p className="foot-line">Periods repeat per section with different subject order. Wire this to a real allocation engine when the timetable module stores its own rows.</p>
    <Button variant="ghost" size="sm" className="link-button" onClick={() => nav.go('staff')}>Teacher workload lives in Teachers &amp; staff</Button>
  </>;
}

function gradeFor(percent: number) { return percent >= 85 ? 'A' : percent >= 70 ? 'B' : percent >= 55 ? 'C' : percent >= 35 ? 'D' : 'E'; }

export function ExamsView({ nav }: { nav: Nav }) {
  const { school } = useWorkspace();
  const subjects = useMemo(() => [...new Set(school.staff.filter(s => s.role !== 'Head teacher').map(s => s.subject))].slice(0, 4), [school.staff]);
  const start = useMemo(() => { const now = new Date(); const next = new Date(now.getFullYear(), now.getMonth() + 1, 5); return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-05`; }, []);
  const rows = school.students;
  return <>
    <PageHead module={def('exams')} crumb="Students">
      <Pill>Session {school.session}</Pill>
    </PageHead>
    {!subjects.length ? <EmptyState title="No subjects yet" text="Add teachers with subjects and the assessment grid builds itself." action={<Button variant="outline" onClick={() => nav.go('staff')}>Open teachers</Button>} /> : <>
      <Tabs defaultValue="schedule">
        <TabsList className="inner-tabs" aria-label="Assessment views"><TabsTrigger value="schedule">Schedule</TabsTrigger><TabsTrigger value="results">Marks entry</TabsTrigger></TabsList>
        <TabsContent value="schedule">
          <Panel title="Assessment schedule" meta={`${subjects.length} subjects · from ${dateLabel(start)}`} caption={<span><CalendarDays size={13} aria-hidden="true" /> Dates shift with the current month so the schedule always shows an upcoming cycle.</span>}>
            <DataTable headings={['Date', 'Subject', 'Sections', 'Time', 'Max marks']}
              rows={subjects.map((subject, index) => <TableRow key={subject}>
                <TableCell>{dateLabel(isoAdd(start, index * 2))}</TableCell>
                <TableCell>{subject}</TableCell>
                <TableCell>{school.classes.length} sections</TableCell>
                <TableCell className="mono">09:00–11:00</TableCell>
                <TableCell className="mono">50</TableCell>
              </TableRow>)} />
          </Panel>
        </TabsContent>
        <TabsContent value="results">
          <Panel title="Marks board" meta="Sample scoring · nothing is submitted anywhere">
            {!rows.length ? <EmptyState title="No students" text="Enroll students to see a marks board." /> : <DataTable headings={['Student', 'Class', ...subjects, 'Total', 'Percent', 'Grade']}
              rows={rows.map(student => {
                const marks = subjects.map(subject => subjectScores(school, student, subject));
                const total = marks.reduce((sum, mark) => sum + mark, 0);
                const percent = pct(total, subjects.length * 50);
                return <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.className}</TableCell>
                  {marks.map((mark, index) => <TableCell className="mono" key={index}>{mark}</TableCell>)}
                  <TableCell className="mono"><strong>{total}</strong></TableCell>
                  <TableCell className="mono">{percent}%</TableCell>
                  <TableCell><Pill tone={percent >= 70 ? 'ok' : percent >= 35 ? 'warn' : 'bad'}>{gradeFor(percent)}</Pill></TableCell>
                </TableRow>;
              })} />}
          </Panel>
        </TabsContent>
      </Tabs>
      <p className="foot-line">Replace the derived marks with an assessments table when the exam module stores entries per student, subject and cycle.</p>
    </>}
  </>;
}

export function FeesView({ nav }: { nav: Nav }) {
  const { school } = useWorkspace();
  const [section, setSection] = useState(ALL);
  const dues = school.fees.filter(f => matches(section, school.students.find(s => s.id === f.studentId)?.className ?? ''));
  const collected = dues.filter(f => f.paid).reduce((sum, f) => sum + f.amount, 0);
  const outstanding = dues.filter(f => !f.paid).reduce((sum, f) => sum + f.amount, 0);

  return <>
    <PageHead module={def('fees')} crumb="Students" />
    <div className="kpi-row">
      <Kpi label="Collected" value={rupees(collected)} note={`${dues.filter(f => f.paid).length} records marked paid`} tone="ok" />
      <Kpi label="Outstanding" value={rupees(outstanding)} note={`${dues.filter(f => !f.paid).length} students to follow up`} tone="warn" />
      <Kpi label="Collection rate" value={`${pct(dues.filter(f => f.paid).length, dues.length)}%`} note="Sample term register" />
    </div>
    <Panel title="Fee register" meta={`${school.name} · October term`}
      actions={<div className="panel-actions"><FilterField label="Section" value={section} options={sectionOptions(school.classes.map(c => c.id))} onChange={setSection} /><Button size="sm" variant="outline" disabled={!dues.length} onClick={() => downloadCsv(`${school.name.toLowerCase().replace(/\W+/g, '-')}-fees.csv`, [['Student', 'Class', 'Amount', 'Status'], ...dues.map(f => [school.students.find(s => s.id === f.studentId)?.name ?? f.studentId, school.students.find(s => s.id === f.studentId)?.className ?? '', f.amount, f.paid ? 'Paid' : 'Due'])])}><Download size={15} /> Export</Button></div>}>
      {!dues.length ? <EmptyState title="No fee records" text="Enroll students and a term dues row is created for each of them." action={<Button variant="outline" onClick={() => nav.go('students')}>Open enrollment</Button>} /> : <DataTable headings={['Student', 'Class', 'Term', 'Amount', 'Status', '']}
        rows={dues.map(fee => {
          const student = school.students.find(s => s.id === fee.studentId) as Student;
          return <TableRow key={fee.id}>
            <TableCell>{student?.name ?? 'Removed student'}</TableCell>
            <TableCell>{student?.className ?? '—'}</TableCell>
            <TableCell>{fee.term}</TableCell>
            <TableCell className="mono">{rupees(fee.amount)}</TableCell>
            <TableCell><Pill tone={fee.paid ? 'ok' : 'warn'}>{fee.paid ? 'Paid' : 'Due'}</Pill></TableCell>
            <TableCell>{fee.paid ? <span className="muted small">Demo payment</span> : <Button size="sm" variant="outline" onClick={() => nav.open({ kind: 'payment', fee })}>Mark paid</Button>}</TableCell>
          </TableRow>;
        })} />}
    </Panel>
  </>;
}

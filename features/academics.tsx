import { useMemo, useState } from 'react';
import { CalendarDays, Check, Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TableCell, TableRow } from '@/components/ui/table';
import { DataTable, EmptyState, FilterField, Kpi, NoResults, PageHead, Panel, Pill, SearchField, Toolbar } from '@/components/common';
import { DAYS, examStart } from '@/core/seed';
import { classAttendance, classGrid, feeSummary, gradeFor, studentProfile } from '@/core/graph';
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
        const attendance = classAttendance(school, section.id);
        const dues = feeSummary(school, section.id);
        const subjects = [...new Set(school.timetable.filter(p => p.classId === section.id).map(p => p.subject))];
        return <article className="panel compact-card" key={section.id}>
          <header><span className="class-chip">{section.id}</span><Pill tone={strength ? 'ok' : 'mute'}>{strength} enrolled</Pill></header>
          <div className="card-rows">
            <div><span>Class teacher</span><strong>{teacher ? teacher.name : 'Unassigned'}</strong></div>
            <div><span>Subjects taught</span><strong>{subjects.length ? `${subjects.length} · ${subjects.slice(0, 2).join(', ')}` : 'No timetable yet'}</strong></div>
            <div><span>Attendance</span><strong>{attendance.roster ? `${attendance.percent}% over ${attendance.days} day${attendance.days === 1 ? '' : 's'}` : 'Nothing marked'}</strong></div>
            <div><span>Fee position</span><strong>{dues.due ? `${rupees(dues.outstanding)} due from ${dues.due}` : dues.records ? 'Fully collected' : 'No dues raised'}</strong></div>
          </div>
          <div className="card-actions">
            <Button variant="outline" size="sm" onClick={() => nav.go('timetable')}>Timetable</Button>
            <Button variant="outline" size="sm" onClick={() => nav.go('attendance')}>Register</Button>
          </div>
        </article>;
      })}
    </div>}
  </>;
}

export function TimetableView({ nav }: { nav: Nav }) {
  const { school, dispatch } = useWorkspace();
  const [section, setSection] = useState(school.classes[0]?.id ?? '');
  const [day, setDay] = useState(DAYS[0]);
  const grid = classGrid(school, section, day);
  const teachers = school.staff.filter(s => s.role !== 'Head teacher');
  const week = school.timetable.filter(p => p.classId === section).length;
  const unassigned = school.timetable.filter(p => p.classId === section && !teachers.some(t => t.id === p.staffId)).length;
  return <>
    <PageHead module={def('timetable')} crumb="Academics" />
    <Panel title="Weekly grid" meta={`${school.name} · ${section || 'no section'} · ${day}`}
      caption={<span>These are stored periods, not generated ones — reassigning a slot is a real edit and the staff workload report follows it.</span>}
      actions={<div className="panel-actions"><FilterField label="Section" value={section} options={school.classes.map(c => c.id)} onChange={setSection} /><FilterField label="Day" value={day} options={DAYS} onChange={setDay} /></div>}>
      {!school.classes.length ? <EmptyState title="No sections" text="Add classes for this school to build a timetable." /> : <DataTable headings={['Period', 'Time', 'Subject', 'Teacher']}
        rows={grid.map(row => <TableRow key={`${row.slot}-${row.time}`}>
          <TableCell className="mono">{row.break ? '—' : row.slot + 1}</TableCell>
          <TableCell className="mono muted">{row.time}</TableCell>
          {row.break ? <TableCell className="muted" colSpan={2}>{row.break}</TableCell> : <>
            <TableCell>{row.period?.subject ?? 'Free period'}</TableCell>
            <TableCell>{row.period ? <select className="row-select" aria-label={`Teacher for ${section} ${day} period ${row.slot + 1}`} value={row.period.staffId} onChange={e => dispatch({ type: 'assign-period', classId: section, day, slot: row.slot, staffId: e.target.value })}>
              {teachers.some(t => t.id === row.period?.staffId) ? null : <option value={row.period.staffId}>Unassigned</option>}
              {teachers.map(teacher => <option key={teacher.id} value={teacher.id}>{teacher.name} · {teacher.subject}</option>)}
            </select> : <span className="muted">No period stored</span>}</TableCell>
          </>}
        </TableRow>)} />}
    </Panel>
    <p className="foot-line">{week} periods stored for {section || 'this section'} across {DAYS.length} days{unassigned ? ` · ${unassigned} point at a teacher who is no longer on staff` : ''}.</p>
    <Button variant="ghost" size="sm" className="link-button" onClick={() => nav.go('staff')}>Teacher workload lives in Teachers &amp; staff</Button>
  </>;
}

export function ExamsView({ nav }: { nav: Nav }) {
  const { school, dispatch } = useWorkspace();
  const [section, setSection] = useState(school.classes[0]?.id ?? '');
  const cycle = useMemo(() => examStart(todayISO()), []);
  const assessments = school.assessments.filter(a => a.className === section);
  const roster = school.students.filter(s => s.className === section && s.status === 'Enrolled');
  const scoreOf = (assessmentId: string, studentId: string) => school.marks.find(m => m.assessmentId === assessmentId && m.studentId === studentId)?.score ?? null;

  return <>
    <PageHead module={def('exams')} crumb="Students">
      <Pill>Session {school.session}</Pill>
    </PageHead>
    {!school.assessments.length ? <EmptyState title="No assessments scheduled" text="Enroll students and staff with subjects, then the cycle for this school is created." action={<Button variant="outline" onClick={() => nav.go('staff')}>Open teachers</Button>} /> : <>
      <Tabs defaultValue="schedule">
        <TabsList className="inner-tabs" aria-label="Assessment views"><TabsTrigger value="schedule">Schedule</TabsTrigger><TabsTrigger value="results">Marks board</TabsTrigger></TabsList>
        <TabsContent value="schedule">
          <Panel title="Assessment schedule" meta={`${assessments.length} papers for ${section || 'this section'} · cycle opens ${dateLabel(cycle)}`}
            caption={<span><CalendarDays size={13} aria-hidden="true" /> One stored paper per subject and section. Editing a mark below writes to that paper.</span>}>
            <DataTable headings={['Date', 'Subject', 'Paper', 'Section', 'Max marks', 'Marks entered']}
              rows={assessments.map(assessment => <TableRow key={assessment.id}>
                <TableCell>{dateLabel(assessment.date)}</TableCell>
                <TableCell>{assessment.subject}</TableCell>
                <TableCell className="muted">{assessment.name}</TableCell>
                <TableCell className="mono">{assessment.className}</TableCell>
                <TableCell className="mono">{assessment.max}</TableCell>
                <TableCell className="mono">{school.marks.filter(m => m.assessmentId === assessment.id).length} / {school.students.filter(s => s.className === assessment.className).length}</TableCell>
              </TableRow>)} />
          </Panel>
        </TabsContent>
        <TabsContent value="results">
          <Panel title="Marks board" meta={`${section} · ${roster.length} students × ${assessments.length} papers`}
            caption={<span>Type a score and it is stored against that student and paper. Blank means not yet entered — it is never counted as zero.</span>}
            actions={<div className="panel-actions"><FilterField label="Section" value={section} options={school.classes.map(c => c.id)} onChange={setSection} /></div>}>
            {!roster.length ? <EmptyState title="No students in this section" text="Pick another section or enroll students first." /> : <DataTable headings={['Roll', 'Student', ...assessments.map(a => a.subject), 'Total', 'Percent', 'Grade']}
              rows={roster.map(student => {
                const entered = assessments.map(assessment => scoreOf(assessment.id, student.id));
                const scored = entered.filter((value): value is number => value !== null);
                const total = scored.reduce((sum, value) => sum + value, 0);
                const max = assessments.filter((_, index) => entered[index] !== null).reduce((sum, assessment) => sum + assessment.max, 0);
                const percent = pct(total, max);
                return <TableRow key={student.id}>
                  <TableCell className="mono muted">{student.roll}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  {assessments.map((assessment, index) => <TableCell key={assessment.id}>
                    <input className="mark-input" type="number" min={0} max={assessment.max} aria-label={`${assessment.subject} mark for ${student.name}`}
                      value={entered[index] ?? ''} placeholder="—"
                      onChange={e => {
                        const raw = e.target.value;
                        if (raw === '') return;
                        const next = Math.max(0, Math.min(assessment.max, Number(raw)));
                        dispatch({ type: 'set-mark', assessmentId: assessment.id, studentId: student.id, score: next });
                      }} />
                  </TableCell>)}
                  <TableCell className="mono"><strong>{scored.length ? total : '—'}</strong></TableCell>
                  <TableCell className="mono">{scored.length ? `${percent}%` : '—'}</TableCell>
                  <TableCell>{scored.length ? <Pill tone={percent >= 70 ? 'ok' : percent >= 35 ? 'warn' : 'bad'}>{gradeFor(percent)}</Pill> : <span className="muted small">Not graded</span>}</TableCell>
                </TableRow>;
              })} />}
          </Panel>
        </TabsContent>
      </Tabs>
      <p className="foot-line">The same {assessments.length} papers feed the student progress-card report, so a mark entered here appears there without a second entry.</p>
      <Button variant="ghost" size="sm" className="link-button" onClick={() => nav.go('reports')}>Open the progress-card report</Button>
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

import { ArrowUpRight, Building2, Check, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState, Kpi, PageHead, Panel } from '@/components/common';
import { portalModules, portalModuleGroups } from '@/core/modules';
import { dateLabel, pct, rupees } from '@/core/format';
import { todayISO, useWorkspace } from '@/core/workspace';
import { metric } from '@/core/metrics';
import type { Nav } from '@/core/nav';

export function OverviewView({ nav }: { nav: Nav }) {
  const { school } = useWorkspace();
  const today = todayISO();
  const book = school.attendance[today] ?? {};
  const present = Object.values(book).filter(s => s === 'Present').length;
  const outstanding = school.fees.filter(f => !f.paid).reduce((sum, f) => sum + f.amount, 0);

  return <>
    <PageHead module={{ id: 'overview', name: `${school.name}`, nav: 'Overview', blurb: `${school.category} · ${school.block}, ${school.district} · ${school.medium} medium · session ${school.session}`, group: 'Students', status: 'live', icon: Building2 }} crumb="UMV Tethali · School workspace">
      <Button variant="outline" onClick={() => nav.open({ kind: 'settings' })}>School profile</Button>
    </PageHead>

    <div className="kpi-row">
      <Kpi label="Students on roll" value={String(school.students.length)} note={`${school.classes.length} sections`} onClick={() => nav.go('students')} />
      <Kpi label="Attendance today" value={school.students.length ? `${pct(present, school.students.length)}%` : '—'} note={school.students.length ? `${present} of ${school.students.length} marked present` : 'No register yet'} tone="ok" onClick={() => nav.go('attendance')} />
      <Kpi label="Fees outstanding" value={rupees(outstanding)} note={`${school.fees.filter(f => !f.paid).length} students to follow up`} tone="warn" onClick={() => nav.go('fees')} />
      <Kpi label="Teaching staff" value={String(school.staff.length)} note={`${school.leaveRequests.filter(r => r.status === 'Pending review').length} leave pending`} onClick={() => nav.go('staff')} />
      <Kpi label="Open tickets" value={String(school.tickets.filter(t => t.status !== 'Resolved').length)} note="Support queue" onClick={() => nav.go('tickets')} />
    </div>

    <div className="overview-grid">
      <div className="module-board">
        {portalModuleGroups.map(group => <section className="board-group" key={group} aria-label={group}>
          <h2>{group}<span>{portalModules.filter(item => item.group === group).length} active</span></h2>
          <div className="tile-grid">
            {portalModules.filter(item => item.group === group).map(item => <button className="tile" key={item.id} onClick={() => nav.go(item.id)}>
              <span className="tile-top"><span className={`tile-icon${item.status === 'live' ? ' live' : ''}`}><item.icon aria-hidden="true" /></span><span className="status-dot live">Active</span></span>
              <strong>{item.name}</strong>
              <span className="tile-metric">{metric(school, item.id)}</span>
              <span className="tile-arrow"><ArrowUpRight size={15} aria-hidden="true" /></span>
            </button>)}
          </div>
        </section>)}
      </div>

      <aside className="side-col">
        <Panel title="Latest notices" meta={`${school.notices.length} on the board`} actions={<Button size="sm" variant="ghost" onClick={() => nav.go('notices')}>All</Button>}>
          {!school.notices.length ? <p className="side-empty">Nothing posted for this school yet.</p> : school.notices.slice(0, 3).map(notice => <button className="side-row" key={notice.id} onClick={() => nav.go('notices')}><span className="dot" /><div><strong>{notice.title}</strong><span>{dateLabel(notice.date)} · {notice.audience}</span></div></button>)}
        </Panel>
        <Panel title="Today at a glance" meta={dateLabel(today)}>
          <ul className="side-list">
            <li><span>Register marked</span><strong>{Object.keys(book).length} / {school.students.length}</strong></li>
            <li><span>Absent, needs a call</span><strong>{Object.values(book).filter(s => s === 'Absent').length}</strong></li>
            <li><span>Meals logged</span><strong>{school.mdmEntries.filter(e => e.date === today).length ? 'Yes' : 'Not yet'}</strong></li>
            <li><span>Leave awaiting decision</span><strong>{school.leaveRequests.filter(r => r.status === 'Pending review').length}</strong></li>
            <li><span>Transfer drafts ready</span><strong>{school.transferApplications.filter(a => a.status === 'Ready to file').length}</strong></li>
          </ul>
        </Panel>
        <div className="panel trust-card">
          <ShieldCheck size={18} aria-hidden="true" />
          <h2>Built to be extended</h2>
          <p>Every record below is fictional and stays in this browser. The data layer is scoped by school id, so a real backend only has to add authentication, row-level permissions and an audit trail.</p>
          <ul>{['One school workspace', 'Shared records across active modules', 'No live portal sync is enabled'].map(line => <li key={line}><Check size={13} aria-hidden="true" />{line}</li>)}</ul>
        </div>
      </aside>
    </div>
    {!school.students.length && !school.staff.length && <EmptyState title={`${school.name} is empty`} text="Add students and staff to begin using the offline school registers." action={<Button variant="outline" onClick={() => nav.open({ kind: 'student' })}>Enroll a student</Button>} />}
  </>;
}

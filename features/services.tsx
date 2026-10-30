import { useState } from 'react';
import { Bell, Plus, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { DataTable, EmptyState, FilterField, Kpi, NoResults, PageHead, Panel, Pill, SearchField, Toolbar } from '@/components/common';
import { modules } from '@/core/modules';
import { MENUS } from '@/core/seed';
import { dateLabel, initialsOf, pct } from '@/core/format';
import { attendanceDates, mealsExpected } from '@/core/graph';
import { todayISO, useWorkspace } from '@/core/workspace';
import type { Ticket } from '@/core/types';
import type { Nav } from '@/core/nav';

const def = (id: string) => modules.find(m => m.id === id)!;

export function NoticesView({ nav }: { nav: Nav }) {
  const { school } = useWorkspace();
  const [audience, setAudience] = useState('Everyone');
  const [query, setQuery] = useState('');
  const rows = school.notices.filter(n => (audience === 'Everyone' || n.audience === audience || n.audience === 'Everyone') && `${n.title} ${n.body} ${n.category}`.toLowerCase().includes(query.toLowerCase()));

  return <>
    <PageHead module={def('notices')} crumb="Communication">
      <Button onClick={() => nav.open({ kind: 'notice' })}><Plus size={15} /> New notice</Button>
    </PageHead>
    <Toolbar>
      <SearchField label="Search notices" value={query} onChange={setQuery} placeholder="Title, message or category…" />
      <FilterField label="Audience" value={audience} options={['Everyone', 'Students', 'Parents', 'Staff']} onChange={setAudience} />
      <span className="toolbar-count">{rows.length} of {school.notices.length} on the board</span>
    </Toolbar>
    {!school.notices.length
      ? <EmptyState title="Board is empty" text={`Nothing has been posted for ${school.name} yet.`} action={<Button variant="outline" onClick={() => nav.open({ kind: 'notice' })}>Post the first notice</Button>} />
      : !rows.length ? <NoResults text="No notice matches. Try another audience or word." />
        : <div className="notice-grid">{rows.map(notice => <article className="panel notice-card" key={notice.id}>
          <header><Pill tone="accent">{notice.category}</Pill><span className="muted small">{dateLabel(notice.date)}</span></header>
          <h3>{notice.title}</h3>
          <p>{notice.body}</p>
          <footer>
            <span className="avatar tiny">{initialsOf(school.name)}</span>
            <span className="muted small">Head office · visible to {notice.audience}</span>
            {notice.classId && <Button variant="ghost" size="sm" className="link-button" onClick={() => nav.go('classes')}>Affects {notice.classId} only</Button>}
          </footer>
        </article>)}</div>}
    <p className="foot-line">Push delivery — SMS, WhatsApp or app notifications — needs a consent record per parent and a messaging backend. The board only proves the authoring flow.</p>
  </>;
}

const ticketCycle: Ticket['status'][] = ['Open', 'In progress', 'Resolved'];

export function TicketsView({ nav }: { nav: Nav }) {
  const { school, dispatch } = useWorkspace();
  const [status, setStatus] = useState('All statuses');
  const rows = school.tickets.filter(t => status === 'All statuses' || t.status === status);

  return <>
    <PageHead module={def('tickets')} crumb="Communication">
      <Button onClick={() => nav.open({ kind: 'ticket' })}><Plus size={15} /> Raise ticket</Button>
    </PageHead>
    <div className="kpi-row">
      <Kpi label="Open" value={String(school.tickets.filter(t => t.status === 'Open').length)} note="Waiting for an owner" tone="warn" />
      <Kpi label="In progress" value={String(school.tickets.filter(t => t.status === 'In progress').length)} note="Someone is on it" />
      <Kpi label="Resolved" value={String(school.tickets.filter(t => t.status === 'Resolved').length)} note="Closed locally" tone="ok" />
    </div>
    <Panel title="Ticket queue" meta={`${school.name} · no helpdesk is contacted`}
      caption={<span>Routing to a block or district officer needs an authenticated support API. Until then the queue is your own tracker.</span>}
      actions={<FilterField label="Status" value={status} options={['All statuses', ...ticketCycle]} onChange={setStatus} />}>
      {!rows.length ? <EmptyState title={school.tickets.length ? 'Nothing with this status' : 'No tickets raised'} text={school.tickets.length ? 'Switch the status filter to see the rest of the queue.' : `Raise the first ${school.name} ticket.`} action={<Button variant="outline" onClick={() => nav.open({ kind: 'ticket' })}>Raise ticket</Button>} /> : <DataTable headings={['Subject', 'Category', 'Detail', 'Status', 'Raised', '']}
        rows={rows.map(ticket => <TableRow key={ticket.id}>
          <TableCell>{ticket.subject}</TableCell>
          <TableCell><div className="pill-stack"><Pill tone="mute">{ticket.category}</Pill>{ticket.classId && <Button variant="ghost" size="sm" className="link-button" onClick={() => nav.go('classes')}>{ticket.classId}</Button>}</div></TableCell>
          <TableCell className="muted wrap">{ticket.detail}</TableCell>
          <TableCell><Pill tone={ticket.status === 'Resolved' ? 'ok' : ticket.status === 'In progress' ? 'accent' : 'warn'}>{ticket.status}</Pill></TableCell>
          <TableCell className="mono muted">{dateLabel(ticket.createdAt)}</TableCell>
          <TableCell><div className="row-actions">{ticketCycle.filter(next => next !== ticket.status).map(next => <Button key={next} size="sm" variant={next === 'Resolved' ? 'ghost' : 'outline'} onClick={() => dispatch({ type: 'set-ticket-status', id: ticket.id, status: next })}>{next}</Button>)}</div></TableCell>
        </TableRow>)} />}
    </Panel>
  </>;
}

export function MdmView({ nav }: { nav: Nav }) {
  const { school } = useWorkspace();
  const today = todayISO();
  const book = school.attendance[today] ?? {};
  const eligible = school.students.filter(s => book[s.id] !== 'Absent').length;
  const served = school.mdmEntries.reduce((sum, e) => sum + e.meals, 0);
  const rate = pct(school.mdmEntries.filter(e => e.date === today).length ? eligible : 0, school.students.length);
  const unlogged = attendanceDates(school).filter(date => !school.mdmEntries.some(e => e.date === date));

  return <>
    <PageHead module={def('mdm')} crumb="Students">
      <Button onClick={() => nav.open({ kind: 'mdm' })}><Plus size={15} /> Log a meal day</Button>
    </PageHead>
    <div className="kpi-row">
      <Kpi label="Meals today" value={String(eligible)} note="Attendance minus absentees" tone="ok" />
      <Kpi label="Logged this month" value={String(served)} note={`${school.mdmEntries.length} register entries`} />
      <Kpi label="Coverage" value={`${rate}%`} note={school.students.length ? 'Of enrolled students' : 'No enrollment yet'} />
    </div>
    <div className="menu-strip"><UtensilsCrossed size={16} aria-hidden="true" /><strong>Weekly menu template</strong>{MENUS.map((menu, index) => <span key={menu}>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][index]} · {menu}</span>)}</div>
    <Panel title="Serving register" meta={`${school.name} · PM Poshan sample entries`}
      caption={<span>Cook-cum-helper duty, grain stock and muster roll belong to the next build step; this register only records what was served.</span>}>
      {!school.mdmEntries.length ? <EmptyState title="No serving entries" text={school.students.length ? 'Log the first meal day for this school.' : 'Enroll students before keeping a meal register.'} action={<Button variant="outline" onClick={() => nav.open({ kind: 'mdm' })}>Log a meal day</Button>} /> : <DataTable headings={['Date', 'Menu', 'Classes served', 'Meals', 'Vs register', 'Note']}
        rows={school.mdmEntries.map(entry => {
          const expected = mealsExpected(school, entry.date);
          const delta = expected === null ? null : entry.meals - expected;
          return <TableRow key={entry.id}>
            <TableCell className="mono">{dateLabel(entry.date)}</TableCell>
            <TableCell>{entry.menu}</TableCell>
            <TableCell className="mono">{entry.classCount}</TableCell>
            <TableCell className="mono"><strong>{entry.meals}</strong></TableCell>
            <TableCell>{delta === null
              ? <span className="muted small">No register for this date</span>
              : <span className="pill-stack"><span className="muted small">{expected} expected</span><Pill tone={delta === 0 ? 'ok' : delta > 0 ? 'warn' : 'bad'}>{delta === 0 ? 'matches' : `${delta > 0 ? '+' : ''}${delta}`}</Pill></span>}</TableCell>
            <TableCell className="muted wrap">{entry.note || '—'}</TableCell>
          </TableRow>;
        })} />}
    </Panel>
    {unlogged.length > 0 && <p className="foot-line">{unlogged.length} register {unlogged.length === 1 ? 'day has' : 'days have'} no meal entry yet — the mid-day meal audit report lists the same {unlogged.length === 1 ? 'gap' : 'gaps'}.</p>}
  </>;
}

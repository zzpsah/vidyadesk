import type { ReactNode } from 'react';
import { AlertCircle, Inbox, LoaderCircle, Search, X } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { ModuleDef } from '@/core/types';

export function Pill({ children, tone = 'accent' }: { children: ReactNode; tone?: 'accent' | 'ok' | 'warn' | 'bad' | 'mute' }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

export function Panel({ title, meta, actions, children, caption }: { title: string; meta?: ReactNode; actions?: ReactNode; children: ReactNode; caption?: ReactNode }) {
  return <section className="panel">
    <header className="panel-head"><div className="panel-titles"><h2>{title}</h2>{meta && <p>{meta}</p>}</div>{actions}</header>
    {caption && <div className="panel-caption">{caption}</div>}
    {children}
  </section>;
}

export function DataTable({ headings, rows, empty }: { headings: string[]; rows: ReactNode[]; empty?: ReactNode }) {
  if (!rows.length) return <>{empty}</>;
  return <div className="table-scroll"><Table className="data-table"><TableHeader><TableRow>{headings.map(h => <TableHead scope="col" key={h}>{h}</TableHead>)}</TableRow></TableHeader><TableBody>{rows}</TableBody></Table></div>;
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return <div className="empty-state"><Inbox aria-hidden="true" /><h3>{title}</h3><p>{text}</p>{action}</div>;
}


export function LoadingState({ text = 'Loading data…' }: { text?: string }) {
  return <div className="empty-state" role="status" aria-live="polite">
    <LoaderCircle className="animate-spin" aria-hidden="true" />
    <p>{text}</p>
  </div>;
}

export function UnavailableState({ title = 'Data unavailable', text, onRetry }: { title?: string; text: string; onRetry?: () => void }) {
  return <div className="empty-state" role="alert" aria-live="assertive">
    <AlertCircle aria-hidden="true" />
    <h3>{title}</h3>
    <p>{text}</p>
    {onRetry && <Button variant="outline" size="sm" onClick={onRetry}>Try again</Button>}
  </div>;
}

export function NoResults({ text }: { text: string }) {
  return <div className="empty-state"><Search aria-hidden="true" /><h3>No matches</h3><p>{text}</p></div>;
}

export function PageHead({ module, crumb, children }: { module: ModuleDef; crumb: string; children?: ReactNode }) {
  const Icon = module.icon;
  return <div className="page-head">
    <div className="page-head-text">
      <p className="crumb">{crumb}</p>
      <h1><span className="page-icon"><Icon aria-hidden="true" /></span>{module.name}</h1>
      <p className="page-blurb">{module.blurb}</p>
    </div>
    <div className="page-actions">{children}</div>
  </div>;
}

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="toolbar">{children}</div>;
}

export function SearchField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (next: string) => void; placeholder: string }) {
  return <div className="search-field"><Search size={16} aria-hidden="true" /><label className="sr-only" htmlFor={`search-${label}`}>{label}</label><input id={`search-${label}`} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />{value && <button type="button" aria-label={`Clear ${label.toLowerCase()}`} onClick={() => onChange('')}><X size={14} /></button>}</div>;
}

export function FilterField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (next: string) => void }) {
  return <div className="filter-field"><label htmlFor={`filter-${label}`}>{label}</label><select id={`filter-${label}`} value={value} onChange={e => onChange(e.target.value)}>{options.map(o => <option key={o}>{o}</option>)}</select></div>;
}

export function Kpi({ label, value, note, tone, onClick }: { label: string; value: string; note: string; tone?: 'ok' | 'warn'; onClick?: () => void }) {
  return <button className="kpi" onClick={onClick} type="button"><span className={`kpi-label${tone ? ` kpi-${tone}` : ''}`}>{label}</span><strong>{value}</strong><small>{note}</small></button>;
}

export function LinkButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return <Button variant="ghost" size="sm" className="link-button" onClick={onClick}>{children}</Button>;
}

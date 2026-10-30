export const rupees = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const dateLabel = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const shortDate = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

export const initialsOf = (name: string) => name.split(' ').filter(Boolean).map(word => word[0]).slice(0, 2).join('').toUpperCase();

export const pct = (part: number, total: number) => (total ? Math.round((part / total) * 100) : 0);

/** Prefixes spreadsheet-active strings so an exported cell cannot execute a formula. */
export function csvCell(value: string | number) {
  const text = String(value);
  const guarded = /^\s*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${guarded.replaceAll('"', '""')}"`;
}

export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map(row => row.map(csvCell).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([String.fromCharCode(0xFEFF) + csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

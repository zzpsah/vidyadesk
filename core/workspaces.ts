export type WorkspaceAction = { label: string; detail: string };
export type OperationalWorkspace = {
  id: string;
  name: string;
  group: 'Student data' | 'Government workflows' | 'Official records' | 'Administration' | 'Automation';
  purpose: string;
  owner: string;
  applicationUrl?: string;
  repositoryUrl: string;
  access: 'application' | 'protected' | 'repository-only' | 'private-service';
  actions: WorkspaceAction[];
  note: string;
};

/**
 * VidyaDesk is the common workbench and navigation layer. Each application
 * remains authoritative for its own records, credentials and write workflow.
 * Links point to real owning applications; no localStorage demo data is used.
 */
export const operationalWorkspaces: OperationalWorkspace[] = [
  {
    id: 'udise', name: 'UDISE+ Automation', group: 'Government workflows',
    purpose: 'Run school and student workflows against the authenticated UDISE+ portal.',
    owner: 'udise-automation-suite', applicationUrl: 'https://udise-auto.vercel.app/',
    repositoryUrl: 'https://github.com/zzpsah/udise-automation-suite', access: 'application',
    actions: [
      { label: 'Portal session', detail: 'Start a login request, solve CAPTCHA and verify the selected school.' },
      { label: 'Student workflows', detail: 'Run GP, EP and facility previews; inspect validation and read-back.' },
      { label: 'Approved submissions', detail: 'Approve eligible previews and monitor the resulting job.' },
    ],
    note: 'Portal credentials, CAPTCHA/OTP and final submission approval stay inside the UDISE+ application.',
  },
  {
    id: 'eshikshakosh', name: 'eShikshaKosh Workbench', group: 'Government workflows',
    purpose: 'Generate student OTR and teacher reports through the existing protected job service.',
    owner: 'eshikshakosh-automation', applicationUrl: 'https://eshikshakosh-coral.vercel.app/',
    repositoryUrl: 'https://github.com/zzpsah/eshikshakosh-automation', access: 'application',
    actions: [
      { label: 'Student OTR', detail: 'Prepare and run the school-scoped student OTR report.' },
      { label: 'Teacher reports', detail: 'Generate teacher report workbooks using the existing job workflow.' },
      { label: 'Job results', detail: 'Review job progress and retrieve protected report outputs.' },
    ],
    note: 'Credentials and workbook files remain in the protected eShikshaKosh service; VidyaDesk does not copy them.',
  },
  {
    id: 'letters', name: 'Digital Letter Registry', group: 'Official records',
    purpose: 'Capture, search, review and manage official school correspondence.',
    owner: 'digital-letter-registry', applicationUrl: 'https://eletters.vercel.app/app',
    repositoryUrl: 'https://github.com/zzpsah/digital-letter-registry', access: 'application',
    actions: [
      { label: 'New letter intake', detail: 'Add an incoming or outgoing letter and process its document.' },
      { label: 'Search archive', detail: 'Search letter references, subjects, authorities and extracted content.' },
      { label: 'Review queue', detail: 'Review, correct, archive and manage letter records.' },
    ],
    note: 'The registry remains the owner of letter originals, metadata, permissions and delivery history.',
  },
  {
    id: 'report-central', name: 'Report Central', group: 'Student data',
    purpose: 'Import source snapshots, reconcile records and review data-quality conflicts.',
    owner: 'report-central', applicationUrl: 'https://reportcentral.vercel.app/',
    repositoryUrl: 'https://github.com/zzpsah/report-central', access: 'application',
    actions: [
      { label: 'Import snapshots', detail: 'Fetch and version approved UDISE+ and eShikshaKosh source data.' },
      { label: 'Reconcile students', detail: 'Compare source records and review ambiguous identity matches.' },
      { label: 'Resolve conflicts', detail: 'Record reviewed conflict decisions with an audit trail.' },
    ],
    note: 'Imports, corrections and reconciliation decisions are written to Report Central under its own permissions and audit trail.',
  },
  {
    id: 'payroll', name: 'Vetan-Vipatra', group: 'Administration',
    purpose: 'Manage teacher absence statements, salary calculations and print-ready monthly outputs.',
    owner: 'Vetan-Vipatra', applicationUrl: 'https://vetan-vipatra.vercel.app/',
    repositoryUrl: 'https://github.com/zzpsah/Vetan-Vipatra', access: 'protected',
    actions: [
      { label: 'Teacher absence', detail: 'Maintain attendance and absence entries for the salary period.' },
      { label: 'Salary statement', detail: 'Calculate the monthly statement and inspect salary components.' },
      { label: 'Print / export', detail: 'Generate the A4 salary and absentee outputs.' },
    ],
    note: 'This deployment currently has Vercel protection enabled. Payroll and staff identifiers remain in the owning application.',
  },
  {
    id: 'school-data-records', name: 'School Data Records', group: 'Student data',
    purpose: 'Canonical source-data model for UDISE+, eShikshaKosh, OFSS and cross-source student identity.',
    owner: 'school-data-records', repositoryUrl: 'https://github.com/zzpsah/school-data-records',
    access: 'repository-only',
    actions: [
      { label: 'Data model', detail: 'Review canonical student, source-link and snapshot structures.' },
      { label: 'Import rules', detail: 'Review versioned import and duplicate-control procedures.' },
      { label: 'Source verification', detail: 'Review provenance, identity-link and data-quality evidence.' },
    ],
    note: 'No standalone web console is currently deployed. The existing umv-db Supabase project reports INACTIVE; do not treat historical counts as live data.',
  },
  {
    id: 'n8n', name: 'n8n Operations', group: 'Automation',
    purpose: 'Maintain event-driven notifications, DLR intake and infrastructure monitoring.',
    owner: 'n8n-operations', repositoryUrl: 'https://github.com/zzpsah/n8n-operations',
    access: 'private-service',
    actions: [
      { label: 'Workflow definitions', detail: 'Review version-controlled automation workflows.' },
      { label: 'Execution health', detail: 'Monitor scheduled and event-driven workflow status.' },
      { label: 'Alerts', detail: 'Review delivery and infrastructure notifications.' },
    ],
    note: 'The n8n editor and execution endpoints remain private; no public workflow trigger is exposed.',
  },
];

export const workspaceGroups = [
  'Student data', 'Government workflows', 'Official records', 'Administration', 'Automation',
] as const;

export function validateOperationalWorkspaces(): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const item of operationalWorkspaces) {
    if (ids.has(item.id)) errors.push(`Duplicate workspace id: ${item.id}`);
    ids.add(item.id);
    if (!item.name.trim() || !item.purpose.trim() || !item.owner.trim()) errors.push(`Workspace ${item.id} has incomplete metadata.`);
    if (!item.repositoryUrl.startsWith('https://github.com/zzpsah/')) errors.push(`Workspace ${item.id} has an unverified repository URL.`);
    if (item.access === 'repository-only' || item.access === 'private-service') {
      if (item.applicationUrl) errors.push(`Workspace ${item.id} must not advertise a public application URL.`);
    } else if (!item.applicationUrl?.startsWith('https://')) {
      errors.push(`Workspace ${item.id} has no HTTPS application URL.`);
    }
    if (!item.actions.length) errors.push(`Workspace ${item.id} has no operational actions.`);
  }
  return errors;
}

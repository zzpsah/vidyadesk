export type ProjectIcon = 'records' | 'reports' | 'letters' | 'udise' | 'eshikshakosh' | 'automation';
export type SchoolProject = {
  id: string;
  name: string;
  owner: string;
  kind: 'Source of truth' | 'Reporting' | 'Documents' | 'Government workflow' | 'Automation';
  purpose: string;
  ownership: string;
  boundary: string;
  repositoryUrl: string;
  applicationUrl?: string;
  icon: ProjectIcon;
};

/** Verified repository locations; application URLs are known entry points, not proof of integration health. */
export const projects: SchoolProject[] = [
  {
    id: 'school-data-records', name: 'School Data Records', owner: 'school-data-records',
    kind: 'Source of truth', purpose: 'Central school datasets and source-record ownership.',
    ownership: 'Canonical school records and controlled data access.',
    boundary: 'Restricted student and staff records are not copied into VidyaDesk until authenticated school scope is implemented.',
    repositoryUrl: 'https://github.com/zzpsah/school-data-records', icon: 'records',
  },
  {
    id: 'report-central', name: 'Report Central', owner: 'report-central',
    kind: 'Reporting', purpose: 'Versioned snapshots, source reconciliation, conflicts and import audit.',
    ownership: 'Snapshots, reconciliation decisions and audit history.',
    boundary: 'VidyaDesk may consume only an approved, school-scoped read model. The existing aggregate token must not be widened.',
    repositoryUrl: 'https://github.com/zzpsah/report-central', applicationUrl: 'https://reportcentral.vercel.app', icon: 'reports',
  },
  {
    id: 'digital-letter-registry', name: 'Digital Letter Registry', owner: 'digital-letter-registry',
    kind: 'Documents', purpose: 'Official letter registry, document archive and workflow history.',
    ownership: 'Letter originals, references, status and document delivery workflows.',
    boundary: 'Letter storage and delivery stay in DLR; VidyaDesk integration is pending and must use a documented read-only contract first.',
    repositoryUrl: 'https://github.com/zzpsah/digital-letter-registry', applicationUrl: 'https://eletters.vercel.app', icon: 'letters',
  },
  {
    id: 'udise-automation-suite', name: 'UDISE+ Automation', owner: 'udise-automation-suite',
    kind: 'Government workflow', purpose: 'UDISE+ school, student and reporting automation.',
    ownership: 'UDISE+ automation, validation and submission workflow.',
    boundary: 'Portal authentication, OTP/CAPTCHA and any write operation remain in the owning automation project.',
    repositoryUrl: 'https://github.com/zzpsah/udise-automation-suite', icon: 'udise',
  },
  {
    id: 'eshikshakosh-automation', name: 'eShikshaKosh Automation', owner: 'eshikshakosh-automation',
    kind: 'Government workflow', purpose: 'eShikshaKosh reporting and student/teacher automation.',
    ownership: 'eShikshaKosh source reports, validation and automation runs.',
    boundary: 'This is separate from UDISE+. VidyaDesk will show verified run summaries only after a scoped service contract exists.',
    repositoryUrl: 'https://github.com/zzpsah/eshikshakosh-automation', icon: 'eshikshakosh',
  },
  {
    id: 'n8n-operations', name: 'n8n Operations', owner: 'n8n-operations',
    kind: 'Automation', purpose: 'Scheduled monitoring, operational workflows and notifications.',
    ownership: 'Workflow definitions, executions, operational health and delivery events.',
    boundary: 'VidyaDesk must use authenticated, allow-listed read APIs; no public webhook trigger is enabled by this project directory.',
    repositoryUrl: 'https://github.com/zzpsah/n8n-operations', icon: 'automation',
  },
];

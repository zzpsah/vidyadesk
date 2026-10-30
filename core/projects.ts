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

/** Repository URLs were verified against GitHub. App URLs come from each project's own deployment/handoff documentation. */
export const projects: SchoolProject[] = [
  {
    id: 'school-data-records', name: 'School Data Records', owner: 'school-data-records',
    kind: 'Source of truth', purpose: 'Central school datasets and source-record ownership across UDISE+, eShikshaKosh and OFSS.',
    ownership: 'Canonical school/student data, source snapshots, stream assignments and controlled data access.',
    boundary: 'Restricted student and staff records are not copied into VidyaDesk until authenticated school scope and a least-privilege data contract are implemented.',
    repositoryUrl: 'https://github.com/zzpsah/school-data-records', icon: 'records',
  },
  {
    id: 'report-central', name: 'Report Central', owner: 'report-central',
    kind: 'Reporting', purpose: 'Versioned snapshots, source reconciliation, conflicts, field audits and import history.',
    ownership: 'Snapshots, reconciliation decisions, canonical identity links and audit history.',
    boundary: 'VidyaDesk may consume only an approved, school-scoped read model. The existing aggregate token must not be widened.',
    repositoryUrl: 'https://github.com/zzpsah/report-central', applicationUrl: 'https://reportcentral.vercel.app', icon: 'reports',
  },
  {
    id: 'digital-letter-registry', name: 'Digital Letter Registry', owner: 'digital-letter-registry',
    kind: 'Documents', purpose: 'Official letter archive with Hindi/English search, original-file access and workflow history.',
    ownership: 'Immutable letter originals, derived metadata, search, delivery and archive workflows.',
    boundary: 'Letter storage and delivery stay in DLR. VidyaDesk integration is pending and must use a documented read-only contract first.',
    repositoryUrl: 'https://github.com/zzpsah/digital-letter-registry', applicationUrl: 'https://eletters.vercel.app/app', icon: 'letters',
  },
  {
    id: 'udise-automation-suite', name: 'UDISE+ Automation', owner: 'udise-automation-suite',
    kind: 'Government workflow', purpose: 'UDISE+ school/student workflows with Oracle control API and a production Vercel interface.',
    ownership: 'UDISE+ login/session, roster reads, approved GP/EP/FP workflows, write verification and job history.',
    boundary: 'Portal credentials, CAPTCHA/OTP and write approvals remain in the UDISE automation boundary; VidyaDesk will not proxy arbitrary portal actions.',
    repositoryUrl: 'https://github.com/zzpsah/udise-automation-suite', applicationUrl: 'https://udise-auto.vercel.app/', icon: 'udise',
  },
  {
    id: 'eshikshakosh-automation', name: 'eShikshaKosh Automation', owner: 'eshikshakosh-automation',
    kind: 'Government workflow', purpose: 'Read-only eShikshaKosh student OTR and teacher reports through the Oracle gateway/job service.',
    ownership: 'Student/teacher report generation, protected runners, job status and private workbook delivery.',
    boundary: 'eShikshaKosh is separate from UDISE+. Credentials and workbook bytes remain on the protected VPS; VidyaDesk must consume only scoped job/status summaries.',
    repositoryUrl: 'https://github.com/zzpsah/eshikshakosh-automation', applicationUrl: 'https://eshikshakosh-coral.vercel.app/', icon: 'eshikshakosh',
  },
  {
    id: 'n8n-operations', name: 'n8n Operations', owner: 'n8n-operations',
    kind: 'Automation', purpose: 'Event-driven DLR operations, infrastructure monitoring and notification workflows.',
    ownership: 'Workflow definitions, executions, health checks, operational events and delivery notifications.',
    boundary: 'n8n editor and bridges remain private. VidyaDesk must use an authenticated, allow-listed read API; no public workflow trigger is exposed.',
    repositoryUrl: 'https://github.com/zzpsah/n8n-operations', icon: 'automation',
  },
];

import type { LucideIcon } from 'lucide-react';
import { FileBarChart, FileText, GitBranch, Network, ShieldCheck } from 'lucide-react';

export type IntegrationStatus = 'read-only-planned' | 'external-system';

export type IntegrationDef = {
  id: string;
  name: string;
  purpose: string;
  owner: string;
  status: IntegrationStatus;
  icon: LucideIcon;
  boundary: string;
  dataDomains: string[];
};

/**
 * External systems stay explicit and read-only until a separately authorised
 * adapter, account and acceptance check exist. This registry contains no URLs,
 * credentials or live calls.
 */
export const integrations: IntegrationDef[] = [
  { id: 'report-central', name: 'Report Central', purpose: 'Versioned reports and cross-portal reconciliation.', owner: 'report-central', status: 'read-only-planned', icon: FileBarChart, boundary: 'Aggregate-only provider code is in PR #3. Activation awaits migration 022, evidence-backed UDISE/eShikshaKosh school mappings and a dedicated machine token; no requests are sent yet.', dataDomains: ['Snapshots', 'Unified students', 'Conflicts', 'Import audit'] },
  { id: 'digital-letter-registry', name: 'Digital Letter Registry', purpose: 'Official letter originals, references and workflow history.', owner: 'digital-letter-registry', status: 'read-only-planned', icon: FileText, boundary: 'Viewer-scoped public-letter summary code is in PR #5. Activation awaits a dedicated viewer identity, exact archive verification, machine token and approved network path; no letter-level data is returned.', dataDomains: ['Letter references', 'Subjects', 'Authorities', 'Deadlines'] },
  { id: 'school-data-records', name: 'School Data Records', purpose: 'Restricted school and student source-of-truth data.', owner: 'school-data-records', status: 'external-system', icon: ShieldCheck, boundary: 'No student-level records are copied into this browser workspace.', dataDomains: ['UDISE snapshots', 'e-Shiksha Kosh snapshots', 'OFSS admissions', 'Staff records'] },
  { id: 'udise-automation-suite', name: 'UDISE+ Automation', purpose: 'UDISE+ school and student workflows, approvals and verified job results.', owner: 'udise-automation-suite', status: 'external-system', icon: Network, boundary: 'Control API is live on the VPS, but its route remains tailnet-only. Credentials, CAPTCHA/OTP, approvals and portal writes remain in the UDISE+ owner project.', dataDomains: ['UDISE+ roster', 'GP / EP / FP workflow', 'Job status and read-back'] },
  { id: 'eshikshakosh-automation', name: 'eShikshaKosh Automation', purpose: 'Separate state-portal student OTR and teacher-report workflows.', owner: 'eshikshakosh-automation', status: 'external-system', icon: Network, boundary: 'Gateway and job service are live on the VPS, but the /gw route is not exposed to VidyaDesk. Credentials, protected runners and private workbook delivery remain in the owner project.', dataDomains: ['Student OTR', 'Teacher reports', 'Protected job status'] },
  { id: 'n8n-operations', name: 'n8n Operations', purpose: 'Controlled automation workflows.', owner: 'n8n-operations', status: 'read-only-planned', icon: GitBranch, boundary: 'No workflow trigger is enabled until an authenticated webhook contract is approved.', dataDomains: ['Workflow definitions', 'Run status', 'Delivery events'] },
];

export type DataSourceDef = {
  id: string;
  name: string;
  role: string;
  domains: string[];
  freshness: string;
  sensitivity: 'restricted' | 'external';
};

/** The source map is descriptive; checkpoint figures are never treated as live truth. */
export const dataSources: DataSourceDef[] = [
  { id: 'udise', name: 'UDISE+', role: 'Active enrolment and school-status source.', domains: ['Active students', 'Class views', 'Historical snapshots'], freshness: 'Checkpoint documented 2026-10-02', sensitivity: 'restricted' },
  { id: 'eshiksha', name: 'e-Shiksha Kosh', role: 'State student-master source.', domains: ['Student master', 'Class XI streams', 'Versioned imports'], freshness: 'Checkpoint documented 2026-10-02', sensitivity: 'restricted' },
  { id: 'ofss', name: 'OFSS', role: 'Class XI admission and stream evidence.', domains: ['Science admissions', 'Arts admissions', 'Commerce admissions'], freshness: 'Cycle 2026–28', sensitivity: 'restricted' },
  { id: 'report-central-store', name: 'Report Central store', role: 'Versioned snapshots and reviewed cross-source reconciliation.', domains: ['Unified students', 'Conflicts', 'Import audit'], freshness: 'External system · not connected', sensitivity: 'restricted' },
];

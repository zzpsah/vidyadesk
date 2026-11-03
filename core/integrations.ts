import type { LucideIcon } from 'lucide-react';
import { FileBarChart, FileText, GitBranch, Network, ShieldCheck } from 'lucide-react';

export type IntegrationStatus = 'operational-app' | 'integration-pending' | 'external-system';

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
  { id: 'report-central', name: 'Report Central', purpose: 'Versioned reports and cross-portal reconciliation.', owner: 'report-central', status: 'operational-app', icon: FileBarChart, boundary: 'Full source import, reconciliation and conflict-resolution workflows are available in the owner application. The separate VidyaDesk aggregate feed awaits migration 022, verified source mappings and its dedicated machine token.', dataDomains: ['Snapshots', 'Unified students', 'Conflicts', 'Import audit'] },
  { id: 'digital-letter-registry', name: 'Digital Letter Registry', purpose: 'Official letter originals, references and workflow history.', owner: 'digital-letter-registry', status: 'operational-app', icon: FileText, boundary: 'Full letter intake, search, review, editing and archive workflows are available in the owner application. The optional VidyaDesk summary feed awaits a dedicated viewer identity and verified archive scope.', dataDomains: ['Letter references', 'Subjects', 'Authorities', 'Deadlines'] },
  { id: 'school-data-records', name: 'School Data Records', purpose: 'Restricted school and student source-of-truth data.', owner: 'school-data-records', status: 'external-system', icon: ShieldCheck, boundary: 'No student-level records are copied into this browser workspace.', dataDomains: ['UDISE snapshots', 'e-Shiksha Kosh snapshots', 'OFSS admissions', 'Staff records'] },
  { id: 'udise-automation-suite', name: 'UDISE+ Automation', purpose: 'UDISE+ school and student workflows, approvals and verified job results.', owner: 'udise-automation-suite', status: 'operational-app', icon: Network, boundary: 'Fixed-school status endpoint and private VPS bridge are merged. Full GP/EP/FP preview and approved write workflows remain in the owner application; the optional VidyaDesk status feed awaits dedicated tokens and activation.', dataDomains: ['UDISE+ roster', 'GP / EP / FP workflow', 'Job status and read-back'] },
  { id: 'eshikshakosh-automation', name: 'eShikshaKosh Automation', purpose: 'Separate state-portal student OTR and teacher-report workflows.', owner: 'eshikshakosh-automation', status: 'operational-app', icon: Network, boundary: 'Fixed-school aggregate job-status endpoint is merged. Student OTR and teacher-report jobs remain executable in the owner workbench; the optional VidyaDesk status feed awaits a dedicated token and private bridge.', dataDomains: ['Student OTR', 'Teacher reports', 'Protected job status'] },
  { id: 'n8n-operations', name: 'n8n Operations', purpose: 'Controlled automation workflows.', owner: 'n8n-operations', status: 'integration-pending', icon: GitBranch, boundary: 'No workflow trigger is enabled until an authenticated webhook contract is approved.', dataDomains: ['Workflow definitions', 'Run status', 'Delivery events'] },
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

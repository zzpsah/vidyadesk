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
  { id: 'report-central', name: 'Report Central', purpose: 'Versioned reports and cross-portal reconciliation.', owner: 'report-central', status: 'read-only-planned', icon: FileBarChart, boundary: 'Read-only summaries only; source fetches and reconciliation remain in Report Central.', dataDomains: ['Snapshots', 'Unified students', 'Conflicts', 'Import audit'] },
  { id: 'digital-letter-registry', name: 'Digital Letter Registry', purpose: 'Official letter originals, references and workflow history.', owner: 'digital-letter-registry', status: 'read-only-planned', icon: FileText, boundary: 'No letter upload, delivery or OAuth flow from VidyaDesk.', dataDomains: ['Letter references', 'Subjects', 'Authorities', 'Deadlines'] },
  { id: 'school-data-records', name: 'School Data Records', purpose: 'Restricted school and student source-of-truth data.', owner: 'school-data-records', status: 'external-system', icon: ShieldCheck, boundary: 'No student-level records are copied into this browser workspace.', dataDomains: ['UDISE snapshots', 'e-Shiksha Kosh snapshots', 'OFSS admissions', 'Staff records'] },
  { id: 'udise-eshikshakosh', name: 'UDISE / eShikshaKosh', purpose: 'Government portal workflows and exports.', owner: 'udise-automation-suite · eshikshakosh-automation', status: 'external-system', icon: Network, boundary: 'Login, CAPTCHA, OTP and portal writes remain outside VidyaDesk.', dataDomains: ['Active enrolment', 'Student master exports', 'Portal workflow state'] },
  { id: 'n8n-operations', name: 'n8n Operations', purpose: 'Controlled automation workflows.', owner: 'n8n-operations', status: 'read-only-planned', icon: GitBranch, boundary: 'No workflow trigger is enabled until an authenticated webhook contract is approved.', dataDomains: ['Workflow definitions', 'Run status', 'Delivery events'] },
];

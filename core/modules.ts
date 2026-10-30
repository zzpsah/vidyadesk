import { ArrowLeftRight, Award, BarChart3, Bell, BookOpen, Building2, CalendarDays, CalendarX2, ClipboardCheck, ExternalLink, FileBarChart, GraduationCap, Handshake, HeartHandshake, IndianRupee, Landmark, LifeBuoy, MapPinned, MonitorSmartphone, Package, Repeat, School as SchoolIcon, ShieldCheck, Truck, Users, UtensilsCrossed } from 'lucide-react';
import type { ModuleDef, ModuleGroup } from './types';

/**
 * The module board mirrors the functional areas a government school dashboard
 * works with. `live` modules run against this browser only; `blueprint`
 * modules publish the data, workflow and build checks they need first.
 */
export const modules: ModuleDef[] = [
  // Students
  { id: 'students', name: 'Student enrollment', nav: 'Enrollment', blurb: 'Admission register, profiles and class records.', group: 'Students', status: 'live', icon: BookOpen },
  { id: 'attendance', name: 'Attendance', blurb: 'Daily register per class with monthly summaries.', nav: 'Attendance', group: 'Students', status: 'live', icon: ClipboardCheck },
  { id: 'exams', name: 'Exams & results', nav: 'Exams', blurb: 'Assessment schedule, marks and grade cards.', group: 'Students', status: 'live', icon: GraduationCap },
  { id: 'fees', name: 'Fees & payments', nav: 'Fees', blurb: 'Term dues, collection register and receipts.', group: 'Students', status: 'live', icon: IndianRupee },
  { id: 'mdm', name: 'PM Poshan (mid-day meal)', nav: 'Mid-day meal', blurb: 'Daily serving register and weekly menu.', group: 'Students', status: 'live', icon: UtensilsCrossed },
  { id: 'sports', name: 'Sports assessment', nav: 'Sports assessment', blurb: 'Fitness and athletic measurements per student.', group: 'Students', status: 'blueprint', icon: Award,
    entities: ['Student', 'Assessment cycle', 'Event', 'Measurement', 'Verifier'],
    workflow: ['Publish the assessment cycle', 'Record measurements per event', 'Flag incomplete rows', 'Export the school summary'],
    checks: ['Define event catalogue and units', 'Validation for measurement ranges', 'Offline entry for field use', 'Summary export'] },

  // People & transfers
  { id: 'staff', name: 'Teachers & staff', nav: 'Teachers & staff', blurb: 'Designations, subjects and class assignments.', group: 'People & transfers', status: 'live', icon: Users },
  { id: 'leave', name: 'Staff leave', nav: 'Leave', blurb: 'Leave ledger, balances and approval trail.', group: 'People & transfers', status: 'live', icon: CalendarX2 },
  { id: 'transfer-special', name: 'Transfer on special ground', nav: 'Special ground transfer', blurb: 'Dossier for spouse, medical and disability grounds.', group: 'People & transfers', status: 'live', icon: HeartHandshake },
  { id: 'transfer-district', name: 'Inter-district transfer', nav: 'Inter-district transfer', blurb: 'Movement requests between districts with routing.', group: 'People & transfers', status: 'live', icon: MapPinned },
  { id: 'transfer-teacher', name: 'Teacher transfer 2.0', nav: 'Teacher transfer 2.0', blurb: 'Pool-based transfer with preference ranking.', group: 'People & transfers', status: 'live', icon: ArrowLeftRight },
  { id: 'transfer-mutual', name: 'Mutual transfer', nav: 'Mutual transfer', blurb: 'Paired exchange proposals and consent status.', group: 'People & transfers', status: 'live', icon: Repeat },

  // Academics
  { id: 'classes', name: 'Classes & sections', nav: 'Classes', blurb: 'Sections, strength and class teacher mapping.', group: 'Academics', status: 'live', icon: SchoolIcon },
  { id: 'timetable', name: 'Timetable', nav: 'Timetable', blurb: 'Weekly period grid per section.', group: 'Academics', status: 'live', icon: CalendarDays },
  { id: 'model-school', name: 'Model school', nav: 'Model school', blurb: 'Model-school compliance checklist and evidence.', group: 'Academics', status: 'blueprint', icon: Landmark,
    entities: ['School', 'Compliance area', 'Evidence item', 'Review visit'],
    workflow: ['Load the checklist template', 'Attach evidence per area', 'Score each area', 'Publish the school profile'],
    checks: ['Checklist source of truth', 'Photo/document evidence storage', 'Area scoring rules', 'District review view'] },
  { id: 'reports', name: 'Reports', nav: 'Reports', blurb: 'Cross-module reports assembled from attendance, marks, fees, timetable and registers.', group: 'Academics', status: 'live', icon: BarChart3 },

  // Communication
  { id: 'notices', name: 'Notification board', nav: 'Notifications', blurb: 'Notices with audience, category and archive.', group: 'Communication', status: 'live', icon: Bell },
  { id: 'tickets', name: 'Raise ticket', nav: 'Raise ticket', blurb: 'Support requests with owner and status trail.', group: 'Communication', status: 'live', icon: LifeBuoy },
  { id: 'safe-saturday', name: 'Safe Saturday', nav: 'Safe Saturday', blurb: 'Weekly safety and wellness session log.', group: 'Communication', status: 'blueprint', icon: ShieldCheck,
    entities: ['Session', 'Topic', 'Class', 'Facilitator', 'Photo evidence'],
    workflow: ['Publish the monthly topic list', 'Log each session per class', 'Record participation', 'Summarise the month'],
    checks: ['Topic library', 'Facilitator role mapping', 'Consent rules for imagery', 'Monthly summary export'] },
  { id: 'committee', name: 'Committee', nav: 'Committee', blurb: 'School management committee members and meetings.', group: 'Communication', status: 'blueprint', icon: Handshake,
    entities: ['Member', 'Role', 'Meeting', 'Resolution', 'Attendance'],
    workflow: ['Register members', 'Schedule the meeting', 'Record resolutions', 'Track action items to closure'],
    checks: ['Member verification flow', 'Minutes template', 'Action item ownership', 'Annual report export'] },

  // Operations
  { id: 'library', name: 'Library', nav: 'Library', blurb: 'Catalogue, issue and return register.', group: 'Operations', status: 'blueprint', icon: Building2,
    entities: ['Book', 'Copy', 'Member', 'Issue record', 'Fine'],
    workflow: ['Import the catalogue', 'Issue and return books', 'Calculate fines', 'Report reading activity'],
    checks: ['Barcode or ISBN entry', 'Member linking to students', 'Fine rules', 'Lost copy handling'] },
  { id: 'transport', name: 'Transport', nav: 'Transport', blurb: 'Routes, vehicles, seats and daily boarding.', group: 'Operations', status: 'blueprint', icon: Truck,
    entities: ['Vehicle', 'Route', 'Stop', 'Student seat', 'Trip log'],
    workflow: ['Define routes and stops', 'Assign seats', 'Log daily boarding', 'Bill terms'],
    checks: ['Route capacity rules', 'Attendance-linked boarding', 'Driver and conductor roles', 'Term fee linkage'] },
  { id: 'inventory', name: 'Inventory', nav: 'Inventory', blurb: 'Stock items, grants and issuance register.', group: 'Operations', status: 'blueprint', icon: Package,
    entities: ['Item', 'Stock batch', 'Grant', 'Issue record', 'Vendor'],
    workflow: ['Record opening stock', 'Add grants and purchases', 'Issue to departments', 'Reconcile the balance'],
    checks: ['Item master', 'Grant source tagging', 'Reorder thresholds', 'Year-end statement'] },
  { id: 'parent-portal', name: 'Parent portal', nav: 'Parent portal', blurb: 'Read-only parent view of attendance, fees and notices.', group: 'Operations', status: 'blueprint', icon: MonitorSmartphone,
    entities: ['Parent account', 'Student link', 'Attendance view', 'Fee view', 'Notice'],
    workflow: ['Verify parent identity', 'Link to students', 'Expose read-only views', 'Send reviewable notices'],
    checks: ['OTP-based verification', 'Data scoping rules', 'Language coverage', 'Privacy review sign-off'] },
  { id: 'report-central', name: 'Report Central', nav: 'Report Central', blurb: 'Aggregate-only source comparison, conflict totals and import audit.', group: 'Operations', status: 'live', icon: FileBarChart },
  { id: 'integrations', name: 'Integrations', nav: 'Integrations', blurb: 'Read-only registry of the systems that may connect to this workspace.', group: 'Operations', status: 'live', icon: ExternalLink },
];

export const moduleGroups: ModuleGroup[] = ['Students', 'People & transfers', 'Academics', 'Communication', 'Operations'];
export const moduleById = new Map(modules.map(m => [m.id, m]));
export const liveModules = modules.filter(m => m.status === 'live');
export const blueprintModules = modules.filter(m => m.status === 'blueprint');

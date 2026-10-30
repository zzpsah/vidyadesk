import { moduleById, modules, moduleGroups, portalModules } from './modules.ts';

export type WorkspaceRoute = 'overview' | string;
export type RouteDefinition = { id: WorkspaceRoute; label: string; group: string; kind: 'overview' | 'module' };

/** Route catalogue derived from the same registry used by navigation. */
export const workspaceRoutes: RouteDefinition[] = [
  { id: 'overview', label: 'Overview', group: 'Workspace', kind: 'overview' },
  ...portalModules.map(module => ({ id: module.id, label: module.name, group: module.group, kind: 'module' as const })),
];
const routeIds = new Set(workspaceRoutes.map(route => route.id));

/** Resolve untrusted route input to a registered destination; unknown ids fail closed. */
export function resolveWorkspaceRoute(candidate: string | null | undefined): WorkspaceRoute {
  return candidate && routeIds.has(candidate) ? candidate : 'overview';
}
export function isWorkspaceRoute(candidate: string | null | undefined): candidate is WorkspaceRoute {
  return typeof candidate === 'string' && routeIds.has(candidate);
}

/** Validate registry metadata in CI without silently repairing incomplete modules. */
export function validateModuleRegistry(): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const module of modules) {
    if (!module.id.trim()) errors.push('A module has an empty id.');
    if (seen.has(module.id)) errors.push(`Duplicate module id: ${module.id}`);
    seen.add(module.id);
    if (!module.name.trim() || !module.nav.trim() || !module.blurb.trim()) errors.push(`Module ${module.id} is missing display metadata.`);
    if (!moduleGroups.includes(module.group)) errors.push(`Module ${module.id} uses an unregistered group: ${module.group}`);
    if (module.status === 'blueprint') {
      if (!module.entities?.length) errors.push(`Blueprint ${module.id} has no entity list.`);
      if (!module.workflow?.length) errors.push(`Blueprint ${module.id} has no workflow.`);
      if (!module.checks?.length) errors.push(`Blueprint ${module.id} has no acceptance checks.`);
    }
  }
  if (moduleById.size !== modules.length) errors.push('Module lookup index does not match the module registry.');
  return errors;
}

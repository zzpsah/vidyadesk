---
name: vidyadesk-feature
description: Plan and implement a VidyaDesk feature while preserving its project-hub scope, owner-repository boundaries, existing React/Vite architecture, and release rules. Use when changing VidyaDesk UI, routes, project registry, or application behavior.
---

# VidyaDesk Feature Workflow

## Before changing code
1. Read AGENTS.md, .ai/STATE-INDEX.md, .ai/CURRENT-STATE.md, .ai/ARCHITECTURE.md and the relevant brain enhancement record.
2. Inspect Git status, current branch, relevant source, tests, package scripts and CI.
3. Identify the owning project for the requested workflow. VidyaDesk is a hub, not a duplicate system of record.
4. State unknowns and blockers; do not invent API contracts, school identifiers, provider state or data.

## Implementation rules
- Preserve React 19, Vite and Tailwind 4 unless a documented decision authorizes a change.
- Keep components small, types explicit and business rules outside presentation components.
- Prefer read-only, aggregate contracts until authentication and fixed-school scope gates are accepted.
- Do not add generic student/staff/attendance/fees/exam CRUD without an owner project and verified contract.
- Keep UDISE+ and eShikshaKosh separate; treat OFSS as admissions evidence.
- Add contract tests for scope guards, malformed responses, provenance and failure states.

## Completion
Run npm run check:devos, npm run test:contract and npm run build. Review the full diff for secrets, personal/student data, unrelated formatting and scope widening. Never merge or deploy without separate approval.

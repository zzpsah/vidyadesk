# VidyaDesk — Product Implementation Roadmap

**Product:** VidyaDesk  
**Repository:** https://github.com/zzpsah/vidyadesk  
**Primary school:** UMV Tethali  
**Status source:** docs/roadmap/STATUS.md

## Delivery rules

1. VidyaDesk is the single user-facing school workspace. Connected services remain integrations behind VidyaDesk.
2. Work is delivered in small, reviewable phases and pull requests. No phase is complete because a document or UI mockup exists.
3. Every phase has code, tests, evidence, documentation and a recorded acceptance decision.
4. Production data is read-only until a separately reviewed write workflow is explicitly approved.
5. Private student/staff data is never served from a static public site or exposed through browser-side provider credentials.
6. Use real source values where authorized. Do not fabricate, infer, unmask, or reconstruct values absent from the source.
7. Do not merge or deploy production as part of ordinary feature work. Preview deployments must be protected before they can reach real records.
8. Every change updates the status tracker with commit/PR, test evidence, blockers and next action.

## Phase gates

| Phase | Name | Scope and deliverables | Acceptance criteria |
|---|---|---|---|
| 0 | Baseline audit | Repository and branch map; current UI/module inventory; build/test baseline; deployment and hosting audit; API/provider inventory; data-source and security gap register | Current implementation and blockers are verified from code/config, not assumptions; baseline checks recorded |
| 1 | Platform foundation | Stable app shell, route registry, module contracts, shared design system, config validation, loading/error/empty states, responsive layout | All modules load through one shell; no broken routes; build and contract tests pass |
| 2 | Internal access and security | PIN bootstrap exchange, server-issued sessions, secure cookies, durable rate limiting, expiry/revocation, CSRF/origin controls, role/permission model, audit events | No private API works anonymously; PIN is not a bearer token; security tests pass; no secrets in client bundle |
| 3 | Data gateway and school scope | Server-side integration gateway, provider authentication, canonical school mapping, field dictionary, provenance, freshness, read-only policy, no-store responses | Provider identity and school mapping verified; only approved school scope returned; no browser-to-provider secrets |
| 4 | Student information system | Student list/search/filter; complete available student profile; enrolment and class history; source records; record provenance; controlled exports | Authorized profile fields match source records; missing values remain missing; search/filter/export tests pass |
| 5 | Staff and school administration | Staff directory/profiles; service details; leave; transfers; school profile and administrative registers | Staff records are source-backed; permissions and audit events verified |
| 6 | Academic operations | Classes/sections, subjects, attendance, timetable, exams, marks/results, practicals, fees and academic registers | Each workflow has defined ownership, validation, permissions and automated tests |
| 7 | Documents and communication | Official letters, certificates, notices, templates, A4 print/PDF, downloads, WhatsApp/email integrations and delivery status | Generated documents render correctly; delivery outcomes are traceable; no silent failures |
| 8 | Reports and reconciliation | Overview dashboards, source comparisons, conflict queues, import history, reports, exports and audit views | Dashboard totals reconcile to source; exports enforce role/school scope |
| 9 | Unified integrations | Integrate existing school tools/services as VidyaDesk modules using stable contracts, health checks and documented ownership | Each integration has a working user journey, health state, failure behavior and tests |
| 10 | Release hardening and UAT | End-to-end tests, security review, accessibility, performance, backup/restore, observability, operational runbooks and user acceptance | Critical/high defects closed or explicitly accepted; recovery and rollback tested |
| 11 | Production release and handover | Protected production environment, domain, secrets, CI/CD approvals, monitoring, rollback, admin guide and maintenance guide | Production URL verified; release commit and rollback target recorded; handover checklist signed off |

## Workstream mapping

- Core workspace: Phases 1–2
- Data integration and student/staff records: Phases 3–5
- Academic and administrative modules: Phase 6
- Letters, certificates, notices and messaging: Phase 7
- Reports and reconciliation: Phase 8
- Existing project consolidation: Phase 9
- Quality and production operations: Phases 10–11

## Definition of done for every phase

- Implementation is committed on a named branch and linked to a PR.
- Automated tests cover the changed behavior and relevant failure paths.
- Build, type-check and contract tests pass, or the exact failure is recorded.
- Security and privacy implications are reviewed, especially for student/staff data.
- Documentation and operator instructions match the implementation.
- The status tracker records evidence, remaining defects and the next phase gate.
- Preview URL and tested commit are recorded when a protected preview exists.
- No production change is made without an explicit release decision.

## Dependency and release policy

- Phases 0–3 are foundational and must be completed before real private student data is exposed.
- Student and staff modules may proceed in parallel only after the authenticated gateway and school scope are stable.
- Academic modules must use the same data contracts, permissions and audit conventions.
- Existing services must not be copied wholesale into the browser. VidyaDesk owns the UX; source systems own their records until a migration is explicitly designed and approved.
- GitHub Pages is static hosting and is not a suitable host for authenticated private APIs. Use a server-capable deployment for the integrated product.
- Preview environments must contain synthetic/test data unless deployment protection and application authorization have both been verified.

## Change control

A scope change that affects data access, permissions, writes, hosting, secrets, migrations or production behavior must be recorded in the relevant phase and reviewed before implementation.
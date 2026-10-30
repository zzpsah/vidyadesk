# VidyaDesk — Live Development Status

**Last updated:** 2026-10-30  
**Repository:** https://github.com/zzpsah/vidyadesk  
**Active PR:** https://github.com/zzpsah/vidyadesk/pull/5 (draft; not merged)  
**Branch:** feat/internal-access-student-records  
**Latest branch commit:** 8382be745fcc1d405f95433cb73ca26e051b654f  
**Protected Vercel preview:** https://vidyadesk-git-feat-internal-access-student-records-zzpsah.vercel.app  
**Latest verified code deployment:** READY, commit b3143092681cb3599526776b379551c050168bd3 (deployment dpl_3NcWbXFqDFEFaWG6iotojK46fNZG)

## Product definition

VidyaDesk is the unified project hub for UMV Tethali. It will connect existing school systems without replacing their ownership or creating a competing copy of their data.

The six school projects currently registered are:

1. School Data Records
2. Report Central
3. Digital Letter Registry / eLetters
4. UDISE+ Automation
5. eShikshaKosh Automation
6. n8n Operations

Oracle Server and PostgreSQL Services are shown separately as infrastructure dependencies, not school modules. UDISE+ and eShikshaKosh remain separate. OFSS is an admissions/stream evidence source, not a standalone application.

## Current lifecycle position

**Phase 0 — Baseline audit: in progress**  
**Phase 1 — Project-hub foundation: in progress**  
**Overall: 0 of 12 phases accepted.**

| Phase | Status | Acceptance evidence still required |
|---|---|---|
| 0. Baseline audit | In progress | Reconcile live database ownership and school mapping when Oracle runtime is reachable |
| 1. Platform foundation | In progress | Latest branch CI contract tests, browser acceptance, accessibility and release review |
| 2. Internal access and security | Not started | PIN exchange, server-issued sessions, durable rate limits, role checks and security tests |
| 3. Data gateway and school scope | Blocked | Reachable canonical data source, verified UMV school mapping and least-privilege API contract |
| 4. Student information system | Blocked | Source-backed student list and complete available profiles |
| 5. Staff and school administration | Blocked | Source-backed staff data and explicit administrative requirements |
| 6. Academic operations | Not started | Approved source-backed workflows and acceptance rules |
| 7. Documents and communication | Not started | DLR read-only integration, print/PDF and delivery status |
| 8. Reports and reconciliation | Not started | Verified Report Central contract, freshness, provenance and audit views |
| 9. Unified integrations | Not started | Separate tested adapters for each owner project |
| 10. Release hardening and UAT | Not started | Security, E2E, accessibility, performance, recovery and school UAT |
| 11. Production release and handover | Not started | Approved production release, runbooks, backup/recovery evidence and handover |

## Implemented in the current branch

- Replaced the generic offline school dashboard with a project hub for six real, repository-backed school projects.
- Added four documented application shortcuts: Report Central, eLetters, UDISE Automation and eShikshaKosh workbench.
- Added separate infrastructure links for Oracle Server and PostgreSQL Services.
- Removed the previous default school sample records and fixture generators; the new app does not load or display fictional student, staff, attendance, fee, class, mark or timetable data.
- Bumped the legacy browser workspace key to v2 during the cleanup; the old v1 demo key is left untouched and is not migrated.
- Removed old CRUD navigation and retired the unsupported module catalogue from the school-facing app.
- Removed the unbacked offline workforce/HR prototype, its calculations, tests and documentation. Teacher report ownership remains with eShikshaKosh Automation.
- Rewrote the overview as an ownership-aware project directory with explicit "Not connected to VidyaDesk" status.
- Added project ownership/API integration plan and updated README, contributor, DevOps, security and roadmap documentation.
- Kept the Report Central aggregate-only credential boundary unchanged.
- No production database writes, migrations, VPS changes, source-system writes or production deployment were performed.

## Verified infrastructure blockers

- Supabase project inventory reports historical projects umv-db and official-letter-intelligence-archive as **INACTIVE**. No table or personal-record query was made.
- PostgreSQL Services documentation currently registers the DLR primary database. It describes School Data Records as a future workload requiring separate onboarding; no active student-data database was verified through this owner repository.
- The registered Oracle VPS Desktop Commander device is **OFFLINE**, last seen 410 hours before this audit. The laptop device is also offline.
- The School Data Records automation data contract explicitly describes its consumer API as a design contract, not an implemented connector.
- Therefore Oracle service health, live PostgreSQL state, current student data and a source-backed VidyaDesk gateway cannot be verified from this session.
- No school ID, credentials, API payloads or database state have been guessed.

## Validation evidence

- Vercel protected preview reached **READY** for code commit b3143092681cb3599526776b379551c050168bd3. Its branch alias is the protected preview URL above.
- The Vercel build executes TypeScript checking and production bundle generation.
- GitHub Actions contract-test runs for the latest branch commits are **QUEUED**; no passing contract-test result is claimed for the latest head.
- The latest deployment has not had authenticated browser/UI acceptance or a live provider read test.
- The public GitHub Pages site and production configuration have not been changed.

## Next work

1. Complete final code/test review and obtain a passing GitHub Actions contract-test run.
2. Perform browser acceptance on the protected preview once available through the owner's SSO session.
3. When Oracle runtime access returns, inspect only service health and documented API health first; do not mutate data or restart services.
4. Reconcile the School Data Records source database with PostgreSQL Services and document the authoritative primary store.
5. Design and implement a dedicated read-only, fixed-school source contract before adding student/staff UI.
6. Implement session security only after durable persistence and the source identity are verified.
7. Add owner-project modules one by one with contract tests, error states, provenance and audit.

## Release rules

- Do not merge PR #5 or promote production without passing CI, browser acceptance and release review.
- Do not expose private records before the session and fixed-school gateway gates pass.
- Do not claim an integration is live from a URL, old README count, repository existence or HTTP 200 alone.
- A phase is accepted only with implementation, tests, deployment evidence, documentation and the relevant owner/project approval.

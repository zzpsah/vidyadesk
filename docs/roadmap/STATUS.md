# VidyaDesk — Live Development Status

**Last updated:** 2026-10-31  
**Repository:** https://github.com/zzpsah/vidyadesk  
**Production branch:** `main`  
**Release commit:** `3ebe3caf2b6da159a037740b580396009584ebec`  
**Current main head:** `75acf50cc4d56571478c8a74192a0a42872ae496`  
**Production URL:** https://shikshakosh.vercel.app — Vercel deployment READY; live page returned HTTP 200  
**Alternate production alias:** https://sikshakosh.vercel.app  
**Production deployment:** `dpl_7NknGzCuyaCVuRznqGzHFS1nmeH3`  
**Merged change:** PR #5, https://github.com/zzpsah/vidyadesk/pull/5  
**Superseded PR:** #4 closed; its older direction is replaced by the current project-hub architecture.  
**Integration blocker tracker:** https://github.com/zzpsah/vidyadesk/issues/6

## Product definition

VidyaDesk is the unified project hub for UMV Tethali. It connects the school's existing systems through a single user-facing workspace without replacing source ownership or creating an unverified copy of school data.

The seven school projects registered are:

1. School Data Records
2. Report Central
3. Digital Letter Registry / eLetters
4. UDISE+ Automation
5. eShikshaKosh Automation
6. Vetan-Vipatra (teacher absence and monthly salary statement)\n7. n8n Operations

Oracle Server and PostgreSQL Services are infrastructure dependencies, not school modules. UDISE+ and eShikshaKosh remain separate. OFSS is an admissions/stream evidence source, not a standalone application.

## Current lifecycle position

**Project-hub foundation:** deployed to production; acceptance and hardening continue.  
**Production release:** public domain and deployment verified.  
**Overall phase acceptance:** 0 of 12 phases formally accepted; the remaining acceptance gates require browser, security, integration and school UAT evidence.

| Phase | Status | Remaining acceptance evidence |
|---|---|---|
| 0. Baseline audit | Partial | Reconcile live database ownership, canonical school mapping and VPS service health when Oracle runtime is reachable |
| 1. Platform foundation | Deployed | Complete browser acceptance, accessibility review and regression coverage |
| 2. Internal access and security | Not started | PIN exchange, server-issued sessions, durable rate limits, expiry/revocation, role checks and security tests |
| 3. Data gateway and school scope | Blocked | Reachable canonical data source, verified UMV school mapping and least-privilege API contract |
| 4. Student information system | Blocked | Source-backed student list and complete available profiles |
| 5. Staff and school administration | Blocked | Source-backed staff data and explicit administrative requirements |
| 6. Academic operations | Not started | Approved source-backed workflows and acceptance rules |
| 7. Documents and communication | Not started | DLR read-only integration, print/PDF and delivery status |
| 8. Reports and reconciliation | Not started | Verified Report Central contract, freshness, provenance and audit views |
| 9. Unified integrations | Not started | Separate tested adapters for each owner project |
| 10. Release hardening and UAT | In progress | Security, E2E, accessibility, performance, recovery and school UAT |
| 11. Production release and handover | Deployed; handover pending | Operational runbooks, monitoring, rollback evidence and handover |

## Implemented

- Replaced the generic offline school dashboard with a project hub for six real, repository-backed school projects.
- Added documented application shortcuts for Report Central, eLetters, UDISE Automation and eShikshaKosh workbench.
- Added separate infrastructure links for Oracle Server and PostgreSQL Services.\n- Registered the existing Vetan-Vipatra application (`https://vetan-vipatra.vercel.app`, private repository `zzpsah/Vetan-Vipatra`) as a separate payroll project with a launch link; no duplicate payroll module or teacher-data copy was created.
- Removed default sample records and fixture generators; the active app does not load fictional student, staff, attendance, fee, class, mark or timetable data.
- Removed old CRUD navigation and retired the unsupported module catalogue from the school-facing app.
- Removed the unbacked offline workforce/HR prototype. Teacher report ownership remains with eShikshaKosh Automation.
- Added explicit project ownership, integration boundaries, route contracts, loading/error states and aggregate-only Report Central proxy validation.
- Merged PR #5 into `main` using squash merge. The release commit is `3ebe3caf2b6da159a037740b580396009584ebec`.
- Published the production Vercel deployment and attached both verified ShikshaKosh aliases.
- Corrected the project metadata and deployment documentation in `main` after the production release. These follow-up source changes are awaiting a new Vercel production build because the Vercel team reached its daily deployment API limit (retry after 24 hours); the currently deployed release remains READY and serves HTTP 200.

## Verified blockers

- The connected Supabase inventory reported historical projects `umv-db` and `official-letter-intelligence-archive` as **INACTIVE** during the baseline audit. No table or personal-record query was made.
- PostgreSQL Services documentation currently registers the DLR primary database. A School Data Records database has not been onboarded there.
- The registered Oracle VPS Desktop Commander device was **OFFLINE** at the time of the baseline audit; live PostgreSQL and Oracle service health were not verified.
- The School Data Records automation data contract describes its consumer API as a design contract, not an implemented connector.
- Therefore current student records, canonical school ID, Oracle API availability and a source-backed VidyaDesk gateway remain unverified.
- No school ID, credentials, API payloads or database state have been guessed.

## Validation evidence

- Vercel production deployment `dpl_7NknGzCuyaCVuRznqGzHFS1nmeH3` reached **READY** for commit `3ebe3caf2b6da159a037740b580396009584ebec`.
- The production deployment build completed TypeScript checking and Vite production bundle generation.
- A live scrape of https://shikshakosh.vercel.app returned **HTTP 200** and rendered the expected VidyaDesk project hub.
- GitHub Actions contract CI passed for the pre-merge head `7bc8a5a0f16a5204f7a2cd80a8c2b7889289aee7`. Post-merge main workflow run #8 also completed successfully: https://github.com/zzpsah/vidyadesk/actions/runs/41115514707.
- No authenticated private-data journey or live provider read has been accepted because the source APIs and school-scoped security gateway are not ready.

## Next work

1. Complete visual, responsive, accessibility and route-level acceptance of the deployed dashboard.
2. After the Vercel daily deployment limit resets, publish the latest `main` metadata/documentation updates and verify the resulting production deployment.
3. When Oracle runtime access returns, inspect documented health endpoints and service state first; do not mutate data or restart services.
4. Reconcile School Data Records with PostgreSQL Services and document the authoritative primary store and verified school mapping.
5. Implement dedicated read-only source adapters only after owner contracts, authentication and fixed-school scope are verified.
6. Complete internal access and session security before enabling private student/staff screens.
7. Add project-backed workflows one by one with contract tests, provenance, failure states and audit coverage.

## Release and data rules

- Do not expose private records before the session and fixed-school gateway gates pass.
- Do not widen the Report Central aggregate-only token to student/staff endpoints.
- Do not claim an integration is live from a URL, repository existence or HTTP 200 alone.
- Keep government portal credentials, OTP/CAPTCHA, cookies, private workbooks and source-system writes inside their owning systems.
- A phase is accepted only with implementation, tests, deployment evidence, documentation and the relevant owner/project approval.

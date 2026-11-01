# VidyaDesk — Live Development Status

**Last updated:** 2026-11-01
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

## 2026-11-01 access update

- Oracle VPS oracle-server is reachable through Desktop Commander again (agent v0.3.0, device last seen within one minute during this check).
- This restores administrative shell access only. It does not verify PostgreSQL, the School Data Records database, DLR, Report Central, UDISE/eShikshaKosh gateways or any application health endpoint.
- The VidyaDesk repository was cloned to /home/prashant/vidyadesk at main commit 88d9b02 for continued development. The existing main branch was left unchanged; current work is isolated on fix/project-registry-accuracy.
- No production services or source records were changed. Database access was read-only and limited to schema metadata plus the count of school-source mapping rows; no student/staff rows, credentials or workbook contents were queried.
- Dependency review found three high-severity npm advisories. Vite was updated to 8.3.5 and Zod to 4.6.7; the contract suite and production build pass, and npm audit now reports zero vulnerabilities.
- The workspace now exposes three safe routes: Project overview, Report Central (aggregate-only) and Integrations (read-only). Student/staff CRUD routes remain unavailable. UDISE+ and eShikshaKosh have distinct integration-owner entries; the fictional sample-source row was removed.
- Read-only host snapshot: 145 GB root disk with 55 GB free; 11 GiB RAM with 2 GiB swap fully used; no failed systemd units. Listener ports include 9135–9137, 8790, 8787, 5432 and 5678 on loopback. Listening sockets are not proof of service health.
- Docker inspection is blocked for the current prashant account because /var/run/docker.sock is owned by root:docker and the account is not in the docker group. No permission changes were made.
- Read-only local health probes returned HTTP 200 for UDISE+ Control API (9135), eShikshaKosh Gateway (8790), eShikshaKosh Job Service (8787), DLR FastAPI (8877) and Report Central API (8795). Systemd user units for these services are running. This confirms liveness only, not data correctness or portal sessions.
- Network boundary check: Tailscale Serve currently exposes UDISE+ (10000) and DLR (10001) as tailnet-only; the eShikshaKosh /gw path is not present in the current Serve configuration. Report Central /rc/health is publicly reachable, but its data routes require authentication. No private API was exposed.
- The Vercel project vidyadesk is linked to this repository and the verified public alias is https://shikshakosh.vercel.app. Its SSO protection was disabled to meet the no-login requirement; no project environment variables are configured; the public alias returns HTTP 200 without a login wall and continues serving the last successful main-branch production release. The current PR preview is separate and has not been promoted. The server-side Report Central proxy remains disabled.
- Latest VidyaDesk PR preview (commit 9050e7e) is publicly reachable at https://vidyadesk-bu35cjv77-zzpsah.vercel.app with HTTP 200 and no login wall. Its /api/report-central route returns HTTP 503 integration_not_activated, as intended while server variables and provider approval are absent.
- The live Report Central Funnel still returns HTTP 404 for the new aggregate route because PR #3 has not been merged/deployed. The endpoint implementation is in the PR only; its 233-test GitHub suite passes, while the Vercel check fails because GitHub could not verify a Vercel account for the commit (Report Central is a VPS API, not a Vercel deployment).
- Report Central owner work is isolated in /home/prashant/worktrees/report-central-vidyadesk on branch feat/vidyadesk-aggregate-readonly. It adds a dedicated token-only fixed-scope aggregate endpoint, school-scoped import-audit migration 022, and tests. Full Report Central suite: 233 tests passing. It has not been deployed.
- DLR owner work is isolated in /home/prashant/worktrees/digital-letter-registry-vidyadesk on branch feat/vidyadesk-public-summary. PR #5 adds a dedicated-token, viewer-membership-checked aggregate endpoint and authenticated-only SQL RPC; 420 tests pass and Vercel preview deployment completed. No viewer account, token, migration or public network path has been configured.
- The current owner-by-owner integration state and activation gates are recorded in docs/integrations/STATUS-MATRIX.md.
- Live database metadata check: app.school_source_mappings exists but has zero rows; snapshot_import_runs.school_id is not yet present. Therefore the aggregate provider must remain fail-closed. Migration 022 was not applied, no school mappings were written, no token was generated, and no student data was exposed.

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

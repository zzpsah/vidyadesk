# VidyaDesk — Live Development Status

**Last updated:** 2026-10-30  
**Repository:** https://github.com/zzpsah/vidyadesk  
**Active implementation PR:** https://github.com/zzpsah/vidyadesk/pull/5  
**Active branch:** feat/internal-access-student-records  
**Vercel project:** vidyadesk (team SSO protection enabled)  
**Protected development preview:** https://vidyadesk-git-feat-internal-access-student-records-zzpsah.vercel.app (READY; SSO protection enabled; latest code deployment verified at commit b314309)

## Current lifecycle position

**Phase 0 — Baseline audit in progress; Phase 1 project-hub foundation in progress**

**Overall:** 0 of 12 phases accepted. The misleading offline demo has been replaced by a real-project hub and the protected Vercel preview builds successfully. GitHub Actions contract-test runs are currently queued; browser acceptance and live provider checks remain outstanding.

| Phase | Status | Evidence / exit condition |
|---|---|---|
| 0. Baseline audit | In progress | Repository and six project owners audited. Supabase projects are inactive; Oracle VPS Desktop Commander is offline; no student-data consumer API is implemented. Live service/database verification remains blocked. |
| 1. Platform foundation | In progress | Project hub, fixed school identity, empty data state, retired CRUD routes, project/infrastructure registry and ownership docs implemented. Vercel protected preview READY at b314309; GitHub Actions contract tests queued; browser acceptance pending. |
| 2. Internal access and security | Not started | Server-side session, PIN exchange, rate limiting, authorization and security tests |
| 3. Data gateway and school scope | Not started | Verified provider contract and canonical school mapping |
| 4. Student information system | Not started | Source-backed student list and complete available profiles |
| 5. Staff and school administration | Not started | Source-backed staff and administrative registers |
| 6. Academic operations | Not started | Tested academic workflows |
| 7. Documents and communication | Not started | Letters, certificates, notices, print/PDF and delivery status |
| 8. Reports and reconciliation | Not started | Reconciled dashboards, exports and audit views |
| 9. Unified integrations | Not started | Existing school tools integrated as VidyaDesk modules |
| 10. Release hardening and UAT | Not started | Security, E2E, accessibility, performance and recovery checks |
| 11. Production release and handover | Not started | Protected production deployment and verified operational handover |

## Verified baseline facts

- The current frontend is React 19 + Vite + TypeScript.
- Existing navigation includes overview, students, attendance, classes, timetable, exams, fees, staff, leave, transfers, notices, tickets, MDM, reports, integrations and Report Central.
- The current app shell explicitly describes its records as fictional and browser-local; it does not currently authenticate or synchronize with a department.
- The current Report Central client is an aggregate integration, not a full student-record integration.
- The currently known live static URL is https://zzpsah.github.io/vidyadesk/.
- GitHub Pages cannot host the required secure server-side session and private-record API.
- PR #5 is a draft implementation branch. It is not merged and is not a production deployment.

## Active blockers

1. A protected Vercel preview is connected to this repository. It currently hosts the existing SPA and aggregate proxy only; authenticated full-record API is not implemented.
2. No complete authenticated VidyaDesk-to-provider student-record contract has been implemented and tested.
3. The 2244 bootstrap PIN/session exchange is specified but not implemented.
4. Source field availability, school identity mapping and full-record provenance must be verified against actual provider data before exposing records.
5. The branch preview is READY at https://vidyadesk-git-feat-internal-access-student-records-zzpsah.vercel.app (deployment dpl_EL9efP2Gz7XY9VUDrLhEZfsCVx55; commit 1e534c8; SSO protection enabled).

## Next actions — Phase 0 exit

- [x] Inventory all app routes and major module/data-store structure from the current app shell and source tree.
- [x] Inventory provider student/staff/unified routes, role permissions, session contract and source-field limitations.
- [x] Record CI baseline: VidyaDesk CI passed on commit 678e658 (contract tests and production build); Vercel preview build also completed successfully.
- [x] Verify Vercel team/project linkage and preview protection for this repo (project prj_YAkSd2ZFjyHDcI70rRyqty9zn7No; SSO protection enabled).
- [ ] Confirm canonical UMV Tethali school mapping to provider numeric school_id and source ownership (not yet verified against live DB).
- [ ] Publish audit findings and move Phase 0 to accepted only when evidence is complete.

## Progress update format

Every implementation update must add:
- Date and phase
- Branch, commit and PR
- Files/modules changed
- Tests run and exact results
- Preview URL and tested commit, if available
- Blockers and next acceptance criteria

**Rule:** Do not mark a phase complete on the basis of a plan, mockup, documentation-only commit, or unverified deployment.


## 2026-10-30 implementation activity

- Roadmap and tracker added in commits 3b8dd10 and b862da7.
- Preview project linked to the GitHub repository under the user's Vercel team; deployment protection reports SSO enabled for all non-custom domains.
- First deployment attempt targeting production was immediately canceled before completion; no production release was made.
- Preview deployment of commit b862da7 failed because the Edge function imported the contract from outside its function bundle. The handler's validation was made self-contained in commit 43e8798.
- Follow-up self-contained validation fix in 43e8798 exposed and fixed a TypeScript call-site mismatch in 678e658. CI and Vercel build then passed.
- Latest branch commit 9fb0da6 reached Vercel READY at deployment dpl_2eCKWUk94GXSX9PFYWUxDZtnawJQ; the protected branch alias is active.


## Phase 1 — Platform foundation activity

- Added a route catalogue derived from the central module registry; navigation and route validity now share one source of truth.
- Added fail-closed route resolution: unknown route ids return to Overview rather than rendering an arbitrary blueprint page.
- Added module registry validation for duplicate ids, missing display metadata, unknown groups and incomplete blueprint specifications.
- Added a module-level React error boundary so one module rendering failure does not take down the entire workspace. Error details are not logged or shown because they may contain school data.
- Added contract tests for route coverage, invalid-route fallback, module group membership and blueprint completeness.
- Added reusable accessible LoadingState and UnavailableState components for future server-backed modules; both expose clear assistive-technology status and optional retry.

## Verified provider integration findings

- Report Central has existing role-based user sessions with a 12-hour default TTL; session tokens are stored as SHA-256 hashes and permissions are checked per route.
- The current provider service bearer token is explicitly denied access to protected data routes. It cannot be reused as a student-record token.
- Existing authenticated user routes include /v1/students, /v1/teachers and /v1/unified/students; they require a real user session and the corresponding role permission.
- The central student read model returns aadhaar_masked, not a reconstructable full Aadhaar value. The canonical unified student view includes source-specific names, class/section and contact fields, but not a complete raw source profile.
- Source workbook download is separately gated by files.download and exposes raw source data; it must not be used as an unscoped general-purpose student API.
- The VidyaDesk integration therefore needs a dedicated, read-only, fixed-school provider identity/contract or a securely delegated per-user session. It must not widen the existing aggregate token or trust a browser-supplied school_id.
- Provider school_id mapping for UMV Tethali is still unverified; no live record has been exposed.

## Preview deployment evidence

- Vercel project: prj_YAkSd2ZFjyHDcI70rRyqty9zn7No
- Deployment: dpl_4V6Biiro2X9ocVVg4RvJaZR7bQcM
- Deployment URL: https://vidyadesk-2b0f4zb0f-zzpsah.vercel.app
- Branch alias: https://vidyadesk-git-feat-internal-access-student-records-zzpsah.vercel.app
- Commit: 678e6584a10472ad7a0c76e9210f96a23229dce6
- Result: Vercel READY; build completed; project SSO protection enabled.
- GitHub Actions: VidyaDesk CI run 41092365955 completed successfully (contract tests and build).
- The first incorrectly targeted deployment was canceled before completion; no production release or production domain change was made.


## Latest Phase 1 validation — 2026-10-30

- Branch head tested: 1e534c8d787984738c496750033d086bced821f7.
- GitHub Actions run #122 (41095715249): **success**.
- `npm ci`: passed.
- `npm run test:contract`: **18 tests passed, 0 failed**.
- `npm run build`: passed, including `tsc --noEmit` and Vite production bundle.
- Initial test run #117 exposed Node ESM resolution failure for an extensionless TypeScript import in the new route registry. Fixed by using an explicit `.ts` import; the subsequent run passed.
- Vercel deployment dpl_EL9efP2Gz7XY9VUDrLhEZfsCVx55 reached **READY** for the same commit; protected branch alias remains active.
- Dependency audit during `npm ci` reported **3 high-severity advisories**. No automatic dependency upgrade was applied; dependency impact and safe remediation need a separate reviewed task.

## Phase 1 remaining acceptance work

- [ ] Browser-check all module navigation and responsive layouts against the new route registry.
- [x] Add reusable loading and unavailable state components; existing EmptyState remains the standard no-records view.
- [ ] Complete keyboard/focus checks for navigation and error recovery.
- [ ] Review and triage the 3 high-severity dependency advisories.
- [ ] Confirm no existing module behavior or local multi-school isolation regressed.


## Phase 1 follow-up — shared async states

- Added `LoadingState` with an accessible status announcement and loading indicator.
- Added `UnavailableState` with an alert announcement and optional retry action.
- Existing `EmptyState` remains distinct: it represents a successful request with no records, not a failed request.
- Change committed in 3cd00a6; CI and preview checks are pending.


## Latest Phase 1 build — 2026-10-30

- Latest implementation/tracker commit: 7b951ce667178e74ca539e6551c3529138ce196f.
- GitHub Actions run #128 (41095943817): **success**; `npm ci`, `npm run test:contract` and `npm run build` all passed.
- Contract suite: 18 passed, 0 failed.
- Vercel deployment dpl_4VSbPTA2gD5akHqEUCabVAP5qTjq reached **READY** for commit 7b951ce.
- Preview alias https://vidyadesk-git-feat-internal-access-student-records-zzpsah.vercel.app now points to the latest successful branch deployment.
- Phase 1 remains in progress pending visual/browser acceptance and dependency advisory triage. The current ChatGPT browser context is not available for an authenticated visual pass; the preview remains available to the user under Vercel team SSO.


## 2026-10-30 — Phase 2 security preparation

- Added docs/security/session-architecture.md defining the required PIN-exchange/session lifecycle, durable session and rate-limit persistence, cookie controls, CSRF/origin checks, server-side authorization, audit requirements and acceptance tests.
- The design explicitly rejects browser storage, process-memory-only rate limits, stateless-only sessions, browser-supplied school ids and reuse/widening of the aggregate Report Central token.
- Corrected the package-lock root project metadata from the old starter-template name to vidyadesk. Dependency versions were not changed; this is not a remediation of the previously reported 3 high-severity npm advisories.
- Provider numeric school_id remains unverified. The Oracle Desktop Commander device is currently offline (last seen approximately 409 hours ago), so no authorized live read-only database check could be performed in this session.
- No session endpoint was enabled, no private student/staff records were exposed, and no provider database was read or modified.
- Phase 2 implementation remains blocked until durable database connectivity, the verified provider school mapping and the fixed-school read-only provider contract are available.
- Next: restore the authorized Oracle connection, verify the school mapping with a read-only query, inspect the exact npm advisory paths and then implement the session persistence/API layer with automated security tests.


## 2026-10-30 — School portal cleanup (offline-safe)

- School-facing navigation and overview now show only modules classified as implemented locally. Planned blueprints and disconnected integrations remain in the internal module registry but are hidden from the portal.
- Route resolution now fails closed for hidden blueprint/integration routes, so they cannot be opened by passing a module id to the navigation API.
- Removed the school picker and Add school controls from the sidebar and overview to present the requested single-school UMV Tethali workspace. The underlying multi-school data model is retained internally; no records were deleted.
- Reclassified the Integrations registry as disconnected/integration status. Report Central remains disconnected. Neither appears as a school-facing module.
- No Oracle VPS, provider database, private records or external government portal is required for this cleanup. No live data was read or changed.
- Validation for this change is pending GitHub Actions. The portal still uses fictional browser-local data; offline module availability must not be described as live government-portal integration.


## Portal cleanup validation — 2026-10-30

- Branch commit: `63cea4cae46b82606315bc2197bd44559c6f06e5` on `feat/internal-access-student-records`; PR #5 remains draft.
- Changed files: `core/modules.ts`, `core/route-registry.ts`, `components/shell.tsx`, `src/App.tsx`, `features/overview.tsx`, `tests/module-registry.test.ts`, and this tracker/README.
- GitHub Actions run #163 (`41098555719`): **success**. `npm ci` passed; contract suite **19 passed, 0 failed**; TypeScript check and Vite production build passed.
- Vercel preview deployment `dpl_2XaerFDTnRp3MwecJP3Q5eVu8ZAi` reached **READY** for the same commit. Protected branch alias: https://vidyadesk-git-feat-internal-access-student-records-zzpsah.vercel.app.
- No visual/browser acceptance was performed in this session. No production deployment, provider calls or real-record operations occurred.



## 2026-10-30 — Superseded workforce prototype removed

- The offline workforce directory and its synthetic staff/leave calculations were removed. eShikshaKosh Automation owns teacher roster and full-profile exports; no standalone HR/leave application is registered for this school.
- The generic people feature, workforce derivation code, its tests and its offline-workforce documentation were deleted from the active branch.
- The feature is not replaced with fake teacher data. VidyaDesk remains a project hub until a verified source-backed teacher data contract is available.


## 2026-10-30 — Integration-source and runtime verification

- Verified the current project list in GitHub: School Data Records, Report Central, Digital Letter Registry, UDISE+ Automation, eShikshaKosh Automation and n8n Operations. Added Oracle Server and PostgreSQL Services as separate infrastructure dependencies.
- Read each owning project's README and relevant handoff/API docs. Confirmed the School Data Records automation consumer API is documented but not implemented; UDISE and eShikshaKosh have separate Oracle-backed application interfaces; DLR owns private originals and its own auth/data plane; n8n editor and bridges are private.
- Read-only Supabase project inventory reports both historical projects (umv-db and official-letter-intelligence-archive) as INACTIVE. No table or personal-record query was made.
- Desktop Commander device inventory reports oracle-server OFFLINE (last seen 410 hours before this check); LAPTOP-P156ON74 also offline. No VPS command, database query, service restart or migration was attempted.
- PostgreSQL Services README documents only the DLR primary database in its current project database registry; School Data Records is a future database workload pending onboarding. This means no reachable canonical student-data database/API is currently verified.
- Removed the offline workforce prototype and its tests/docs because teacher records belong to eShikshaKosh Automation and no separate HR product is registered.
- Vercel deployment dpl_3NcWbXFqDFEFaWG6iotojK46fNZG reached READY for code commit b3143092681cb3599526776b379551c050168bd3. Protected branch alias remains https://vidyadesk-git-feat-internal-access-student-records-zzpsah.vercel.app.
- Vercel build includes TypeScript checking and production bundle generation. GitHub Actions contract-test runs are still queued; no test pass is claimed for the latest head. No authenticated browser/UI acceptance has been performed.
- PR #5 remains draft and has been retitled to reflect the actual project-hub scope. It is not merged. Production GitHub Pages and production Vercel configuration remain unchanged.
- Phase 0 and Phase 1 remain open. Real data integration is blocked on restored Oracle access and a verified School Data Records data gateway.

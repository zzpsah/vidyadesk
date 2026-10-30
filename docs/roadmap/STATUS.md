# VidyaDesk — Live Development Status

**Last updated:** 2026-10-30  
**Repository:** https://github.com/zzpsah/vidyadesk  
**Active implementation PR:** https://github.com/zzpsah/vidyadesk/pull/5  
**Active branch:** feat/internal-access-student-records

## Current lifecycle position

**Phase 0 — Baseline audit in progress**

**Overall:** 0 of 12 phases accepted. Phase 0 audit is partially evidenced; implementation work has not yet passed a phase gate.

| Phase | Status | Evidence / exit condition |
|---|---|---|
| 0. Baseline audit | In progress | App and package inspected. Current app is a Vite/React SPA; it identifies records as fictional and browser-local. GitHub Pages is static. Provider currently has an aggregate-only VidyaDesk contract. Complete inventory and baseline CI evidence still required. |
| 1. Platform foundation | Not started | Shared module and route contracts; build/test gate |
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

1. No verified server-capable VidyaDesk deployment is connected to this repository yet.
2. No complete authenticated VidyaDesk-to-provider student-record contract has been implemented and tested.
3. The 2244 bootstrap PIN/session exchange is specified but not implemented.
4. Source field availability, school identity mapping and full-record provenance must be verified against actual provider data before exposing records.
5. No protected preview URL has been verified for this branch.

## Next actions — Phase 0 exit

- [ ] Inventory all app routes, module files and current data stores.
- [ ] Inventory all provider endpoints and auth/session contracts relevant to VidyaDesk.
- [ ] Record build, type-check and contract-test baseline.
- [ ] Verify Vercel team/project linkage and preview protection for this repo.
- [ ] Confirm canonical UMV Tethali school mapping and source ownership.
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

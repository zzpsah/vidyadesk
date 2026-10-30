# Existing project ownership and VidyaDesk integration plan

**School:** UCHCH MADHYAMIK VIDYALAY, TETAHALI  
**Academic session:** 2026-2027  
**Audit date:** 2026-10-30  
**Status:** repository/documentation audit completed; live connectivity not verified from this change.

This document defines what belongs in VidyaDesk and what must remain in the existing source project. It is based on the owning repositories' current READMEs and handoff/API documents. It does not claim that any source service is currently reachable.

## Project inventory

| VidyaDesk entry | Owning repository | Current application / interface | Source of truth and responsibility | Integration state |
|---|---|---|---|---|
| School Data Records | [school-data-records](https://github.com/zzpsah/school-data-records) | No consumer API documented as implemented | Canonical school/student source snapshots, UDISE/eShiksha/OFSS provenance, stream assignments and controlled data access | Contract documented; connector not implemented |
| Report Central | [report-central](https://github.com/zzpsah/report-central) | [Report Central](https://reportcentral.vercel.app) | Versioned snapshots, canonical identity, conflicts, field audit, import audit and reporting | Existing VidyaDesk aggregate contract is separate; no student/staff data contract approved |
| Digital Letter Registry | [digital-letter-registry](https://github.com/zzpsah/digital-letter-registry) | [eLetters application](https://eletters.vercel.app/app) | Immutable official letter originals, derived OCR/metadata, search, archive membership and delivery workflow | Separate live application; VidyaDesk adapter not implemented |
| UDISE+ Automation | [udise-automation-suite](https://github.com/zzpsah/udise-automation-suite) | [UDISE Automation](https://udise-auto.vercel.app) | UDISE portal session, roster, GP/EP/FP workflow, bounded writes, read-back verification and job results | Separate live application and Oracle control API; no VidyaDesk job/status adapter |
| eShikshaKosh Automation | [eshikshakosh-automation](https://github.com/zzpsah/eshikshakosh-automation) | [eShikshaKosh workbench](https://eshikshakosh-coral.vercel.app) | Student OTR and teacher reports, protected runners, job status and private workbook delivery | Separate live application and Oracle gateway/job service; no VidyaDesk job/status adapter |
| Vetan-Vipatra | [Vetan-Vipatra](https://github.com/zzpsah/Vetan-Vipatra) | [Vetan-Vipatra salary app](https://vetan-vipatra.vercel.app) | Teacher roster import, absence statement, salary components, fitment preview, monthly statement and print/PDF/CSV output | Existing standalone app; VidyaDesk launch link only; no payroll data sync |\n| n8n Operations | [n8n-operations](https://github.com/zzpsah/n8n-operations) | Private Oracle-hosted n8n; no public editor link | Workflow definitions, execution, event dispatch, health monitoring and notification delivery | Private infrastructure; no VidyaDesk read-only operations adapter |

## Infrastructure dependencies and current blockers

- [Oracle Server](https://github.com/zzpsah/oracle-server) owns VPS host operations and private runtime access; it is not a school module.
- [PostgreSQL Services](https://github.com/zzpsah/postgresql-services) owns shared database operations. Its current documented database registry contains the DLR primary database; the README says future workloads such as School Data Records require separate onboarding and provisioning.
- The connected Supabase account reports the historical projects `umv-db` and `official-letter-intelligence-archive` as **INACTIVE**. Historical README schemas and counts are not evidence of a currently reachable database.
- The registered Oracle VPS Desktop Commander device is **OFFLINE**, last seen 410 hours before this audit. Live PostgreSQL, service health and API behavior could not be checked from this development session.
- Consequently, a student-data source database and the Oracle-hosted APIs are not currently verified as reachable dependencies for VidyaDesk. No private-data adapter can be implemented safely until the runtime is reachable and the owner confirms the actual primary store.

## Important classification decisions

- UDISE+ and eShikshaKosh are independent government systems and must never be merged into one source label.
- OFSS is an admissions/stream evidence source, not an independent VidyaDesk application or the canonical current student master.
- Oracle VPS is infrastructure hosting several project services, not a school-management module.
- Teacher reports belong to eShikshaKosh Automation. Teacher absence and monthly salary statements already have a dedicated owning application, Vetan-Vipatra; do not recreate it as a second payroll module in VidyaDesk.
- Report Central owns reconciliation and conflict decisions. VidyaDesk must not implement a competing student identity merge engine.
- DLR owns official letter originals and their processing lifecycle. VidyaDesk should link or display approved summaries, not duplicate Drive storage or delivery workers.
- n8n owns automation execution. VidyaDesk should request/observe only explicitly allow-listed jobs and status summaries.

## Verified interface facts from owning documentation

### School Data Records

The repository documents UDISE, e-ShikshaKosh, OFSS and core schemas and a versioned source snapshot model. Its automation data contract explicitly states that the consumer connector/export is a design contract, not an implemented API. Before integration, verify the current database architecture, RLS, fields, academic session, provenance and least-privilege consumer identity against the live database. Do not rely on historical README counts.

### Report Central

Report Central exposes an HTTP API and authenticated data routes. Its documented GET /v1/data-audit requires the sources.read permission. The existing VidyaDesk machine credential is restricted to the aggregate integration route and must not be widened. A new server-side contract must have separate permissions, fixed school/session scope, provenance, pagination and audit events.

### Digital Letter Registry

The documented production path is the Vercel application at /app, with a FastAPI control plane, Oracle compatibility bridge, local GoTrue/PostgREST and Oracle PostgreSQL. Original files remain in private Google Drive. The browser must never receive private Drive credentials or bypass archive membership/RLS. First integration should be a minimal read-only letter search/reference contract; uploads, delivery and document mutation remain in DLR.

### UDISE+ Automation

The owning API reference documents Vercel routes for capabilities, login/session, jobs, approvals and job results. These proxy to the Oracle control API on loopback port 9135. A job status is not proof of a successful portal write; the runner requires fresh read-back. VidyaDesk should initially expose only approved capability/job status summaries and deep links, not collect portal credentials or issue arbitrary jobs.

### eShikshaKosh Automation

The current handoff documents the Vercel workbench → authenticated Tailscale Funnel → Oracle gateway (127.0.0.1:8790) → job service (127.0.0.1:8787) → read-only report runners. Portal credentials and workbook bytes stay on the VPS; the browser receives a job id and short-lived signed download link. VidyaDesk may show a scoped job status only after an explicit consumer contract is implemented.

### n8n Operations

n8n editor is private on port 5678. The private DLR job bridge and alert dispatcher are allow-listed, network-restricted services; they are not public webhooks for VidyaDesk. The repository documents event-driven DLR intake and read-only monitoring. Any future VidyaDesk connection must use a new authenticated read-only status surface, not the editor API or raw bridge.

## VidyaDesk implementation sequence

1. **Project hub (current):** list these six real projects, verified repository links, documented app links, ownership and honest "not connected" states.
2. **Health/readiness layer:** add server-side, read-only health checks only where the owner provides a safe health endpoint. Store check time, result and failure reason; never infer health from a repository URL.
3. **Report Central aggregate:** retain the existing separate aggregate contract. Enable only after school mapping, publication approval and end-to-end contract verification.
4. **Source data read gateway:** agree a dedicated least-privilege identity with School Data Records / Report Central; verify school mapping, session, fields, provenance and audit before returning any student/staff data.
5. **UDISE and eShiksha job status:** implement separate adapters and allowlists, preserving each owning project's login, job, approval and read-back rules.
6. **Vetan-Vipatra:** keep the existing salary/absence workflow in its own application and expose a verified launch link. Any future data integration requires a separate permissioned API and privacy review; do not read or mirror the private teacher roster from the browser.\n7. **DLR letter references:** integrate a read-only search/reference view after archive membership and user identity mapping are designed. Keep originals and writes in DLR.
8. **n8n operations:** add only safe operational summaries with no ability to trigger arbitrary workflows.
9. **Project-backed school modules:** build one user journey at a time after its source contract and acceptance tests exist. Do not revive generic sample-data CRUD modules.

## Global acceptance gates

- A project URL is not a health check.
- A successful HTTP status is not proof that returned data is correct.
- Every data response must identify source, fixed school, academic session, retrieval time and source snapshot/version where applicable.
- Fail closed on unknown school, session, field, stale data, provider outage or permission failure.
- No private data in client bundles, localStorage, public Pages output, analytics, screenshots, logs or Git.
- No write or portal submission from VidyaDesk in the initial integration phases.
- Every integration has an owner, documented API, explicit permission, failure state, tests and rollback path.

# VidyaDesk

**Development preview:** <https://vidyadesk-git-feat-internal-access-student-records-zzpsah.vercel.app> (Vercel team SSO protected)  
**Public static site:** <https://zzpsah.github.io/vidyadesk/> (GitHub Pages; not suitable for private school data)  
**Repository:** <https://github.com/zzpsah/vidyadesk>

VidyaDesk is the unified project hub for **UCHCH MADHYAMIK VIDYALAY, TETAHALI**. It brings the school's existing software projects into one consistent workspace without copying their data ownership or pretending that an unconnected screen is operational.

## Current product behavior

- The default school context is a single fixed UMV Tethali identity.
- The workspace starts empty. No sample students, staff, classes, attendance, fees, notices, marks or timetable entries are generated.
- The project overview lists only six existing repositories verified in the owner's GitHub account: School Data Records, Report Central, Digital Letter Registry, UDISE+ Automation, eShikshaKosh Automation and n8n Operations.
- Four documented application entry points are provided for Report Central, Digital Letter Registry, UDISE+ Automation and eShikshaKosh Automation. A link is a launch shortcut, not a health check or proof of VidyaDesk integration.
- Operational school CRUD routes remain hidden until their source-backed data contract, authentication, school scope, tests and audit requirements are accepted.
- No login is enabled yet, per the current development decision. This does not authorize private student/staff data exposure; the portal remains a project hub until the security phase is complete.

## Project ownership map

| Project | Owns | VidyaDesk integration |
|---|---|---|
| School Data Records | Canonical school/source records | Not connected |
| Report Central | Snapshots, reconciliation, conflicts and import audit | Not connected; existing aggregate token remains restricted |
| Digital Letter Registry | Official letters, archive and delivery workflow | Not connected |
| UDISE+ Automation | UDISE+ automation and portal workflow | Not connected |
| eShikshaKosh Automation | eShikshaKosh student/teacher automation and reports | Not connected |
| n8n Operations | Automation workflows, monitoring and delivery events | Not connected |

UDISE+ and eShikshaKosh remain separate systems. OFSS is treated as an admissions data/evidence source, not as a separate application. Oracle VPS and PostgreSQL Services are infrastructure dependencies, not school modules. They are listed separately in the project hub.

## Infrastructure dependencies

- [Oracle Server](https://github.com/zzpsah/oracle-server) owns VPS host operations, private networking and runtime services.
- [PostgreSQL Services](https://github.com/zzpsah/postgresql-services) owns database operations, security and backup/restore standards. Its documented registry currently covers the DLR database; a School Data Records database has not been onboarded there.
- The connected Supabase account currently reports both `umv-db` and `official-letter-intelligence-archive` as **INACTIVE**. Do not treat their historical schemas/counts as a reachable live source.
- The registered Oracle VPS Desktop Commander device is **OFFLINE** (last seen 410 hours before this audit). Service health and live PostgreSQL state therefore remain unverified from this development session.

## Data and security rules

1. Source systems remain authoritative. VidyaDesk does not manufacture fallback records.
2. No browser-side credentials, portal cookies, OTP/CAPTCHA handling or direct government-portal writes.
3. Private student/staff records require authenticated, fixed-school, server-side read access and an audit trail before any UI is enabled.
4. The existing Report Central machine token is aggregate-only and must not be widened to protected record routes.
5. The canonical numeric provider school ID must be verified from the live source; it is never guessed.
6. Connection badges change only after a real health check and a validated source-backed read succeed.
7. Legacy demo storage is not loaded. The new workspace uses `vidyadesk.workspace.v2`; the old v1 browser key is left untouched and is not migrated into the school workspace.

## Architecture

- `core/projects.ts` — verified project inventory and ownership boundaries.
- `core/seed.ts` / `core/workspace.tsx` — legacy state-model code retained for review; neither is imported by the active project-hub app.
- `core/modules.ts` / `core/route-registry.ts` — legacy module metadata retained internally; the active app exposes no school CRUD routes.
- `features/overview.tsx` — unified project hub.
- `api/` — server-side integration endpoints; disabled until their source, scope and security gates are met.
- `docs/roadmap/` — phase gates and verified delivery status.
- `docs/security/` — session, access and data-boundary decisions.
- `docs/DEVOPS.md` and `AGENTS.md` — engineering and release rules.

## Development

Node `^22.13.0 || >=24.0.0`.

```sh
npm ci
npm run test:contract
npm run build
npm run dev
```

A branch push triggers GitHub Actions and a protected Vercel preview. Only the approved production branch/deployment workflow may change the public site. Do not merge or promote a preview until the phase gates and release checklist pass.

## Delivery roadmap

1. Complete baseline audit and remove misleading demo functionality.
2. Finish shared platform foundation and project hub acceptance.
3. Implement internal access, PIN exchange and durable server-side sessions.
4. Verify the UMV Tethali source mapping and implement the fixed-school read-only gateway.
5. Add real student/staff read models from approved sources.
6. Add further project-backed modules one by one, preserving source ownership.
7. Complete end-to-end security, operational recovery, UAT and production handover.

A phase is complete only with implementation, tests, deployment evidence and documentation. See [the implementation plan](docs/roadmap/IMPLEMENTATION-PLAN.md) and [the live status tracker](docs/roadmap/STATUS.md).

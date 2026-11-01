# VidyaDesk operational workspaces

VidyaDesk is the common school workbench. It does not recreate the owner applications or maintain a second copy of their operational records.

## Available workspaces

| Workspace | Operational actions | Owner application |
|---|---|---|
| UDISE+ Automation | Portal session, GP/EP/facility preview, approval and read-back | https://udise-auto.vercel.app/ |
| eShikshaKosh Workbench | Student OTR, teacher reports, job results | https://eshikshakosh-coral.vercel.app/ |
| Digital Letter Registry | New letter intake, archive search, review queue, archive management | https://eletters.vercel.app/app |
| Report Central | Snapshot imports, student reconciliation, conflict resolution, audit | https://reportcentral.vercel.app/ |
| Vetan-Vipatra | Teacher absence, salary statement, print/export | https://vetan-vipatra.vercel.app/ |
| School Data Records | Canonical data model, import rules and source verification | https://github.com/zzpsah/school-data-records |
| n8n Operations | Workflow definitions, execution health and alerts; private service | https://github.com/zzpsah/n8n-operations |

The VidyaDesk page provides action shortcuts into the corresponding owner application. A shortcut is a launch point, not a claim that the target workflow has been embedded in the VidyaDesk browser process. The owning application's authentication, role checks, audit trail and write approvals remain authoritative.

## Data ownership

- UDISE+ owns its portal session, GP/EP/FP jobs and verified portal writes.
- eShikshaKosh owns its student OTR and teacher-report jobs and private workbooks.
- School Data Records owns source snapshots, canonical student identity and stream mapping. The documented `umv-db` Supabase project currently reports INACTIVE; checkpoint figures must not be shown as live data.
- Report Central owns source imports, reconciliation decisions, conflicts and import audit.
- Digital Letter Registry owns letter originals, metadata, search, review, archive and delivery.
- Vetan-Vipatra owns teacher absence and salary calculations.
- n8n owns automation definitions and execution history; its editor and triggers remain private.

## Next integration layer

In-page operations will be added only where the owner exposes a stable API and a server-side user/session mapping. Portal credentials, DLR service-role keys, database passwords and machine tokens must never enter browser code. Do not revive the legacy localStorage demo CRUD modules as a substitute for the real owner databases.

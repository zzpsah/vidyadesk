# VidyaDesk integration status

**Checked:** 2026-11-01  
**Workspace:** UMV Tetahali · Siwan · Bihar · session 2026–27

| System | Owner project | Current evidence | VidyaDesk connection | Activation blocker |
|---|---|---|---|---|
| Report Central | report-central | Local API health HTTP 200; aggregate provider implementation is in [PR #3](https://github.com/zzpsah/report-central/pull/3) | Fixed-scope aggregate contract and server-side proxy implemented in code | PR not deployed; migration 022 pending; canonical school has no verified UDISE/eShikshaKosh mapping rows; machine token absent |
| Digital Letter Registry | digital-letter-registry | Local API health HTTP 200; DLR port remains tailnet-only | Viewer-scoped aggregate summary implemented in [PR #5](https://github.com/zzpsah/digital-letter-registry/pull/5) | Dedicated viewer identity, exact archive-name config, machine token and approved network path are not configured |
| UDISE+ Automation | udise-automation-suite | Local control API HTTP 200 on 9135; fixed-school status adapter is in [PR #11](https://github.com/zzpsah/udise-automation-suite/pull/11) | Aggregate-only owner endpoint in [PR #11](https://github.com/zzpsah/udise-automation-suite/pull/11); strict VPS bridge in Report Central [PR #3](https://github.com/zzpsah/report-central/pull/3); disabled VidyaDesk server proxy implemented on this branch | Review both PRs; provision `UDISE_VIDYADESK_READ_TOKEN`, `REPORT_CENTRAL_VIDYADESK_UDISE_STATUS_READ_TOKEN` and VidyaDesk server env; approve aggregate publication. Bridge uses existing `/rc`; no new Funnel route |
| eShikshaKosh Automation | eshikshakosh-automation | Local gateway HTTP 200 on 8790 and job service HTTP 200 on 8787 | Registered as an independent integration | Fixed-school aggregate job-status endpoint is implemented in [eShikshaKosh PR #1](https://github.com/zzpsah/eshikshakosh-automation/pull/1); endpoint is not active |
| School Data Records | school-data-records | Repository ownership confirmed; database source-of-truth still requires schema/connection review | Registered as the restricted source of truth | Confirm primary Postgres schema and school mapping before exposing any data |
| Digital Letter Registry files | digital-letter-registry | DLR owns letter originals and private archive access | Link and aggregate-only design; no file copy into VidyaDesk | No letter upload, download or OAuth flow from VidyaDesk |
| n8n Operations | n8n-operations | Local n8n listener is present; workflow triggers remain external | Registered as an integration owner | Needs a read-only workflow/run summary contract; no trigger is enabled |

## Workspace deployment

- VidyaDesk [PR #7](https://github.com/zzpsah/vidyadesk/pull/7) contains the overview, Report Central and Integrations routes. GitHub CI passes and its Vercel preview is publicly reachable.
- Vercel SSO protection was disabled for the VidyaDesk project to meet the no-login requirement. The production alias and previews are public; keep all deployments free of private student/staff data.
- Report Central aggregate and UDISE-status proxies are disabled by default. The UDISE path uses the existing `/rc` Funnel route and fails closed until its two dedicated server-only tokens are configured and aggregate publication is approved.
- No provider tokens, service identities or public Tailscale routes have been created for these integrations.

## Security rules

- VidyaDesk is the interface, not a second source-of-truth database.
- Each integration uses its owning project's read-only contract and a dedicated server-side credential.
- No service-role key is used to bypass row-level access.
- No student/staff CRUD route or raw record is enabled in the public workspace.
- Health HTTP 200 proves liveness only, not record correctness or successful portal sessions.

- UDISE bridge environment is not configured. No token has been generated or provisioned, no service has been restarted, and no Tailscale Serve/Funnel mapping has been changed.

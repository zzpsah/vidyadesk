# VidyaDesk integration status

**Checked:** 2026-11-01  
**Workspace:** UMV Tetahali · Siwan · Bihar · session 2026–27

| System | Owner project | Current evidence | VidyaDesk connection | Activation blocker |
|---|---|---|---|---|
| Report Central | report-central | Local API health HTTP 200; fixed-scope aggregate provider merged in [PR #3](https://github.com/zzpsah/report-central/pull/3) | VidyaDesk server-side aggregate proxy is implemented; Report Central remains the read-model owner | Migration 022, evidence-backed school mappings and dedicated machine token remain pending; endpoint must stay fail-closed |
| Digital Letter Registry | digital-letter-registry | Local API health HTTP 200; DLR port remains tailnet-only | Viewer-scoped provider summary merged in [DLR PR #5](https://github.com/zzpsah/digital-letter-registry/pull/5); Report Central loopback bridge proposed in [PR #6](https://github.com/zzpsah/report-central/pull/6); disabled VidyaDesk proxy/panel in PR #9 | Dedicated viewer identity, exact archive-name config, machine token and approved network path are not configured |
| UDISE+ Automation | udise-automation-suite | Local control API HTTP 200 on 9135; fixed-school status adapter merged in [PR #11](https://github.com/zzpsah/udise-automation-suite/pull/11) | Aggregate-only owner endpoint merged in [UDISE PR #11](https://github.com/zzpsah/udise-automation-suite/pull/11); strict VPS bridge merged in Report Central [PR #3](https://github.com/zzpsah/report-central/pull/3); disabled VidyaDesk server proxy implemented on this branch | Provision `UDISE_VIDYADESK_READ_TOKEN`, `REPORT_CENTRAL_VIDYADESK_UDISE_STATUS_READ_TOKEN` and VidyaDesk server env; verify the fixed-school mapping and approve aggregate publication. Bridge uses existing `/rc`; no new Funnel route |
| eShikshaKosh Automation | eshikshakosh-automation | Local gateway HTTP 200 on 8790 and job service HTTP 200 on 8787 | Fixed-school owner endpoint merged in [eShikshaKosh PR #1](https://github.com/zzpsah/eshikshakosh-automation/pull/1); Report Central loopback bridge proposed in [PR #5](https://github.com/zzpsah/report-central/pull/5); VidyaDesk disabled proxy/panel in PR #9 | Provision dedicated owner and Report Central tokens and approve the existing private loopback bridge; no new public route |
| School Data Records | school-data-records | Repository ownership confirmed; database source-of-truth still requires schema/connection review | Registered as the restricted source of truth | Confirm primary Postgres schema and school mapping before exposing any data |
| Digital Letter Registry files | digital-letter-registry | DLR owns letter originals and private archive access | Link and aggregate-only design; no file copy into VidyaDesk | No letter upload, download or OAuth flow from VidyaDesk |
| n8n Operations | n8n-operations | Local n8n listener is present; workflow triggers remain external | Registered as an integration owner | Needs a read-only workflow/run summary contract; no trigger is enabled |

## Workspace deployment

- VidyaDesk [PR #7](https://github.com/zzpsah/vidyadesk/pull/7) is merged to `main`; the overview, Report Central and Integrations routes are part of the production baseline. Operational Workspaces and status panels are proposed separately in [PR #9](https://github.com/zzpsah/vidyadesk/pull/9).
- Vercel SSO protection was disabled for the VidyaDesk project to meet the no-login requirement. The production alias and previews are public; keep all deployments free of private student/staff data.
- Report Central aggregate, UDISE, eShikshaKosh and DLR summary proxies are disabled by default. The UDISE path uses the existing `/rc` Funnel route and fails closed until its two dedicated server-only tokens are configured and aggregate publication is approved.
- No provider tokens or service identities have been created. Existing Tailscale routes were not changed; no new public route was created.

## Security rules

- VidyaDesk is the interface, not a second source-of-truth database.
- Each integration uses its owning project's read-only contract and a dedicated server-side credential.
- No service-role key is used to bypass row-level access.
- No student/staff CRUD route or raw record is enabled in the public workspace.
- Health HTTP 200 proves liveness only, not record correctness or successful portal sessions.

- UDISE bridge environment is not configured. No token has been generated or provisioned, no service has been restarted, and no Tailscale Serve/Funnel mapping has been changed.


## 2026-11-01 implementation update

- VidyaDesk PR #9 now contains separate UDISE+, eShikshaKosh and Digital Letter Registry summary panels. All proxies are server-side, fixed-scope, GET-only and disabled by default.
- Vercel preview commit `06f83498608c3b2a7d165913c95609012ceadb31` reached READY. `/` returned HTTP 200; all three `/api/*` routes returned the expected HTTP 503 `integration_not_activated`.
- Latest VidyaDesk PR #9 head `6e51d510` reached Vercel READY; preview and production aliases both returned HTTP 200. VidyaDesk build passed; 50 contract tests passed; `git diff --check` passed.
- Report Central PR #5 adds the eShikshaKosh loopback bridge; PR #6 adds the DLR loopback bridge. Both remain open and mergeable; neither is deployed.
- Report Central VPS still needs its bridge deployment and credentials. No migrations, token provisioning, service restart or Tailscale route changes were performed.


## 2026-11-01 owner adapter merge update

- eShikshaKosh PR #1, UDISE+ PR #11, Digital Letter Registry PR #5 and Report Central PR #3 have now merged into their respective owner-project `main` branches. This is code integration only; it does not mean the feeds are active.
- Report Central PR #5 (eShikshaKosh bridge) and PR #6 (DLR bridge) remain open. No Report Central migration 022, school mapping, viewer identity, machine token or service environment change has been applied.
- The Vetan-Vipatra deployment redirects to Vercel SSO (HTTP 302). Keep the payroll application protected; VidyaDesk exposes a single clearly labeled protected-app launch rather than implying that capability descriptions are live deep links.
- VidyaDesk PR #9 commit `6e51d5101e3bd3a8808fb1a167dad24f9f82da45` is deployed as a READY preview at `https://vidyadesk-fcwahoy3z-zzpsah.vercel.app`. Production remains on the last approved `main` deployment.
- No owner token was provisioned, no migration or service restart was performed, and no Tailscale Serve/Funnel mapping was changed.

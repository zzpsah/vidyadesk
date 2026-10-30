# Public Report Central proxy (no user login)

**Status:** The proxy code and tests are in this feature branch. It is not deployed, has no Vercel project configured yet, and is disabled by default.

VidyaDesk remains publicly accessible without user accounts in this phase. The Report Central connection is a server-to-server read-only path; the browser does not receive the upstream bearer token.

## Request path

```text
Public browser
  │ GET /api/report-central
  ▼
VidyaDesk Vercel Edge Function (api/report-central.ts)
  │ HTTPS + server-only Bearer token
  ▼
Report Central fixed-scope aggregate endpoint
  │ verified canonical school + UDISE/e-ShikshaKosh mappings
  ▼
Only four aggregate sections:
  overview · sourceComparison · conflictSummary · importAudit
```

GitHub Pages is static and cannot execute `api/report-central.ts`. The existing GitHub Pages deployment remains unchanged. A separate Vercel project connected to this repository is required before the API route exists online. The Vercel project has not been created or deployed in this phase.

## No-login behavior

- No login page, user account, cookie, browser token or session is introduced.
- The Vercel function is a public read-only endpoint once deployed and activated.
- It keeps the Report Central machine token in a server-side environment variable.
- Once activated, the aggregate counts and timestamps are public. CORS limits browser origins but is not authentication.
- No student names, PENs, Aadhaar values, row-level values, workbook paths, conflict details or provider credentials are returned.
- The endpoint does not accept a school id, school key, academic session, report id or other scope override from the browser.

## Server-side environment

Configure these only in the Vercel project environment; never in `VITE_*` variables, GitHub Actions, source files, query strings or browser storage.

| Variable | Purpose |
|---|---|
| `VIDYADESK_REPORT_CENTRAL_ENABLED` | Exact string `true` enables public reads. Keep `false` until all activation gates pass. |
| `REPORT_CENTRAL_AGGREGATE_URL` | Full HTTPS URL ending exactly in `/rc/v1/integrations/vidyadesk/aggregate` on the current Report Central Funnel host. The current documented URL is `https://oracle-server.tail2b7fe2.ts.net/rc/v1/integrations/vidyadesk/aggregate`. |
| `REPORT_CENTRAL_VIDYADESK_READ_TOKEN` | Dedicated machine token; same secret is configured on the Report Central API host. |
| `VIDYADESK_ALLOWED_ORIGIN` | Exact public frontend origin, currently `https://zzpsah.github.io`. |

Generate the token on an operator-controlled machine, store it in Bitwarden, and set the same value in both server environments. Never paste it into this repository or a chat. The Report Central API accepts it only on the exact aggregate GET route; it cannot act as a Report Central user or access other endpoints.

## Fail-closed behavior

- Feature flag absent or not exactly `true`: HTTP 503 `integration_not_activated`; no upstream request.
- Missing URL/token or non-HTTPS/malformed endpoint: HTTP 503; no upstream request.
- Report Central says school mappings are not verified: proxy returns a generic 503 `provider_scope_pending`.
- Wrong school/session, extra fields, invalid totals or missing school-scoped audit marker: HTTP 502 `provider_contract_mismatch`; payload is not forwarded.
- Upstream errors and timeouts return generic errors; private provider diagnostics are not sent to the browser.
- Successful aggregate responses may be cached at the CDN for 30 seconds, with 60 seconds stale-while-revalidate.

## Activation checklist

Do not activate the feature flag until all are true:

1. Report Central schema migration 022 has been applied through its documented migration process.
2. Canonical UMV Tetahali school identity and both evidence-backed source mappings have been independently verified in the live database.
3. The Report Central endpoint passes a read-only request with the dedicated machine token and returns the exact 1.0.0 contract.
4. The school explicitly approves publishing the four aggregate operational indicators on a public site.
5. The VidyaDesk Vercel project is created, connected to this repository, and configured with the four server-side variables.
6. Preview deployment tests confirm the function stays disabled by default, rejects wrong origins and methods, and returns only the validated aggregate envelope when enabled.
7. Production deployment is separately approved.

## Local tests

```sh
npm ci
npm run test:contract
npm run build
```

The proxy tests use mocked upstream responses. They do not contact Report Central or require credentials.

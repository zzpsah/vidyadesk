# Report Central read-only integration contract

**Status:** Contract and dashboard shell implemented; adapter unconfigured; no provider request has been made from VidyaDesk.

## Purpose

VidyaDesk is the UMV Tetahali operational workspace. Report Central remains the owner of versioned source snapshots, canonical reconciliation, conflicts and import audit. VidyaDesk may eventually display reviewed aggregate read models without becoming a second canonical student store.

## Fixed scope

| Field | Contract value |
|---|---|
| School key | `umv-tetahali` |
| School name | `UCHCH MADHYAMIK VIDYALAY, TETAHALI` |
| Academic session | `2026-2027` |
| Contract version | `1.0.0` |

The session format is normalized for the contract only. Before a live request, the provider's school registry and academic-session value must be checked; no inference from historical checkpoint counts is allowed.

## Permitted read models

All counts are non-negative integers. All timestamps are ISO-8601 parseable strings or null where explicitly allowed.

| Read model | Permitted fields |
|---|---|
| Overview | Current snapshot count, failed snapshot count, open conflict count, last successful snapshot timestamp |
| Source comparison | Separate source ids (`udise`, `eshikshakosh`), current snapshot count, last snapshot timestamp, academic session |
| Conflict summary | Open total and counts by error/warning/info severity |
| Import audit | Attempt, success, failure and ignored-duplicate counts; latest attempt timestamp |

No student names, PEN, Aadhaar values, phone numbers, guardian names, row-level source values, raw payloads or workbook bytes belong in these dashboard contracts.

## Response envelope

Each response must include:

- `contractVersion`
- `sourceSystem = report-central`
- exact school and academic-session scope
- `retrievedAt`
- snapshot identifier, positive version and creation timestamp
- typed aggregate `data`

The envelope guard in `core/report-central-contract.ts` rejects a wrong source, wrong school/session, unsupported contract version, unknown fields, invalid timestamps or invalid snapshot metadata. Dedicated payload validators cover overview, the two separate source records, conflict severity totals and import-audit arithmetic. A consumer must run both envelope and payload validation before rendering.

## Dashboard implementation

`features/report-central.tsx` presents four aggregate areas without inventing data: overview counts, separate UDISE/e-ShikshaKosh comparison, conflict severity totals, and import-audit totals. Until a verified adapter exists, every value is rendered as unavailable and the page states that no provider request has been made. The module is reachable from Operations navigation and from the Integrations registry.

The dashboard does not call the adapter interface, browser storage, a provider API URL or a backend endpoint. It offers an outbound link to the existing authenticated Report Central portal; sign-in and data access remain on that portal's own origin. The Report Central web app uses an HttpOnly session cookie behind its own Next.js proxy. VidyaDesk is currently a GitHub Pages static app on a different origin, so it cannot reuse that cookie or safely forward credentials. A scoped embed token is a separate capability and must be explicitly created, restricted to the confirmed UMV school scope, and approved before it is added. The expected school key and session are shown as pending provider verification, not as proof of the provider's current configuration.

## Authentication and transport boundary

- GitHub Pages serves public static assets. It is not a secret store and must not call authenticated Report Central routes directly.
- A future server-side proxy must own credentials/session handling, enforce the user's role and the UMV school scope, and return only the aggregate contract above.
- No session token, cookie, API key, password, OTP, CAPTCHA material or provider credential may enter browser storage, source code, logs or Git history.
- Provider authentication is not delegated to a client-supplied arbitrary URL.
- CORS configuration alone is not an authentication or authorization boundary.

## Connection states

- `unconfigured`: no server adapter or credentials configured.
- `configured`: server-side settings exist; provider reachability is not established.
- `reachable`: an authenticated health/read request succeeded, but payload contract verification is incomplete.
- `verified`: a real read-only request returned the expected source, school/session scope and schema and passed validation.

The current VidyaDesk screen must remain at `unconfigured` until those checks actually pass.

## Explicitly out of scope

No snapshot trigger, fetch, import, conflict resolution, data-quality refresh, source-file scan/download, database mutation, portal login or workflow trigger is exposed through this contract.

## Acceptance gates for a future live adapter

1. Confirm the actual Report Central school registry key and active session for Tetahali.
2. Agree the exact provider endpoints and a server-side least-privilege role.
3. Verify which provider read endpoints return aggregates without personal data.
4. Implement and test proxy-side redaction, authorization, timeout and error handling.
5. Verify the response envelope and each payload validator against a real read-only response.
6. Display provider retrieval time and snapshot version; distinguish stale, unavailable and unverified states.
7. Obtain separate approval before any write-capable workflow is considered.

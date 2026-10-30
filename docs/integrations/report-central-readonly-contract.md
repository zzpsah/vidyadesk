# Report Central read-only integration contract

**Status:** Contract, public proxy and state-aware dashboard are implemented in a feature branch. The proxy is disabled by default, no Vercel VidyaDesk project exists yet, and no live provider response has been verified.

## Purpose

VidyaDesk is the UMV Tetahali operational workspace. Report Central remains the owner of versioned source snapshots, canonical reconciliation, conflicts and import audit. VidyaDesk displays only reviewed aggregate read models and does not become a second canonical student store.

## Fixed scope

| Field | Contract value |
|---|---|
| School key | `umv-tetahali` |
| School name | `UCHCH MADHYAMIK VIDYALAY, TETAHALI` |
| Academic session | `2026-2027` |
| Contract version | `1.0.0` |

The session must be verified against the provider registry before activation. No inference from historical checkpoint counts is allowed.

## Permitted read models

All counts are non-negative integers. All timestamps are ISO-8601 parseable strings or null where explicitly allowed.

| Read model | Permitted fields |
|---|---|
| Overview | Current snapshot count, failed snapshot count, open conflict count, last successful snapshot timestamp |
| Source comparison | Separate source ids (`udise`, `eshikshakosh`), current snapshot count, last snapshot timestamp, academic session |
| Conflict summary | Open total and counts by error/warning/info severity |
| Import audit | Attempt, success, failure and ignored-duplicate counts; latest attempt timestamp; `historyCoverage=school_scoped_records_only` |

No student names, PEN, Aadhaar values, phone numbers, guardian names, row-level source values, raw payloads, workbook paths or conflict details belong in this contract. Import audit totals include only rows with verified source-school scope; historical rows without a school id are excluded rather than inferred.

## Response envelope

Each response includes:

- `contractVersion`
- `sourceSystem = report-central`
- exact school and academic-session scope
- `retrievedAt`
- snapshot identifier, positive version and creation timestamp
- typed aggregate `data` containing exactly overview, source comparison, conflict summary and import audit

The validators in `core/report-central-contract.ts` reject wrong source/school/session, unsupported contract versions, unknown fields, invalid timestamps, invalid snapshot metadata and inconsistent aggregate totals. Both envelope and aggregate validators must pass before rendering.

## Public no-login transport

VidyaDesk remains public and no user login is introduced in this phase. The data path is:

```text
Browser → same-origin /api/report-central (Vercel Edge Function)
        → HTTPS + server-only machine token
        → Report Central fixed-scope aggregate endpoint
```

- The Vercel proxy is implemented in `api/report-central.ts`.
- It accepts only GET (plus CORS preflight), does not accept caller-selected school/session filters, and validates the entire response before forwarding it.
- The dedicated machine token is held only in server environment variables on Vercel and Report Central. It is not a browser session or user login.
- Report Central accepts that token only on the exact aggregate GET route. It cannot access students, files, exports, conflict details, imports, snapshots or any other route.
- The public feature flag `VIDYADESK_REPORT_CENTRAL_ENABLED` must be exactly `true`; absent/false means no upstream request is made.
- Once enabled, the four aggregate sections are public to everyone who can access VidyaDesk. CORS is not authentication.
- Successful responses may be cached at the CDN for 30 seconds. Provider failures and invalid responses are not cached as successful data.

GitHub Pages remains a static deployment and cannot execute this API function. The Vercel VidyaDesk project has not yet been created or deployed. See [the public proxy runbook](public-report-central-proxy.md).

## Dashboard behavior

`features/report-central.tsx` requests only the same-origin proxy on a server-capable host. On the current GitHub Pages hostname it skips the request and explains that a server-side host is required. On Vercel it distinguishes loading, disabled, mapping-pending, unconfigured, unavailable, invalid and verified states. It never treats an error as zero and never falls back to local demo data.

A verified response populates the four aggregate panels, source-specific timestamps, conflict severity totals, school-scoped import audit and provider retrieval/snapshot metadata. A manual refresh is available; there is no background polling.

The generic Report Central embed overview is not reused: its current handler reports global store totals and the token is not school-bound. The student embed accepts a caller-supplied school filter, which is not sufficient authorization.

## Activation gates

1. Apply Report Central schema migration 022 through its documented migration process.
2. Verify the canonical UMV Tetahali school row and both evidence-backed source mappings in the live database.
3. Verify the dedicated machine token works only on the aggregate GET route.
4. Obtain approval to publish the four aggregate operational indicators publicly.
5. Create the VidyaDesk Vercel project and configure the server-only environment variables in [the proxy runbook](public-report-central-proxy.md).
6. Test disabled-by-default behavior, origin/method checks, error sanitization and exact response validation in preview.
7. Enable public reads only after all prior gates pass and production activation is approved.

## Explicitly out of scope

No snapshot trigger, fetch, import, conflict resolution, data-quality refresh, source-file scan/download, database mutation, portal login or workflow trigger is exposed through this contract.

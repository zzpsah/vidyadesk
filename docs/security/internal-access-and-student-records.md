# VidyaDesk internal access and full-record scope

**Status:** implementation contract for the next development phase. Not deployed. No production data is copied into this repository.

## Product decision

VidyaDesk is an internal school workspace, not a public dashboard. The earlier public/no-login aggregate-only design is superseded. The application must require a server-validated session before rendering or returning any school records.

The authorised data view is full-field, not a masked preview. Where a source system actually supplies a value, authorised users may view the complete stored value and its provenance. A missing or masked upstream value must remain missing or masked; VidyaDesk must never reconstruct or fabricate it.

## Entry credential and session

- The requested `2244` value is a bootstrap PIN only. It is not a bearer token, API key, database password, or production-grade long-term secret.
- The PIN must be configured as a server-side secret; never commit it, put it in Vite/client environment variables, expose it in source maps, or return it from an API.
- Successful verification exchanges the PIN for a cryptographically random, server-issued session token. Store only a hash of the token server-side.
- Deliver the session in a `Secure; HttpOnly; SameSite=Lax` cookie. Never put it in localStorage, sessionStorage, a URL, or JavaScript-readable state.
- Enforce durable, shared rate limiting and audit failed attempts. An in-memory per-function counter is insufficient on serverless deployments.
- Sessions expire, can be revoked, and are checked server-side on every protected API request. Logout revokes the session.
- Before production, replace the shared four-digit bootstrap PIN with a high-entropy credential or individual accounts. A four-digit PIN has only 10,000 possibilities and must not be treated as strong authentication.

## Full-record access rules

- No UI masking or field truncation is applied to authorised record details where the source value is present.
- Every query is scoped server-side to the canonical school identity and explicitly selected academic session. A browser-supplied school ID is never trusted as the authorization boundary.
- Student, staff, guardian, source-row, reconciliation, import and workbook details retain source-system provenance.
- Aadhaar and other high-impact identifiers may be displayed unmasked only to an authenticated, explicitly authorized role, with access logged. They must not appear in URLs, analytics, error messages, telemetry, ordinary application logs, public exports, or Git fixtures.
- Export/download is a separate permission from viewing. Every export is audited and scoped.
- Read-only integration is the default. No writes or portal submissions are enabled by this phase.

## Architecture

1. The browser serves only the VidyaDesk shell and login form; it contains no data credentials.
2. A server-side auth endpoint validates the bootstrap credential against a server-side verifier and issues a revocable session.
3. A server-side data gateway validates the session and permission for every request.
4. The gateway calls Report Central over HTTPS using a dedicated machine credential held only by the server.
5. Report Central validates the machine identity on a narrowly allowlisted set of read-only VidyaDesk routes, applies the fixed school/session scope, and writes audit events.
6. Responses use `Cache-Control: no-store`; service-worker, CDN and browser caches must not persist personal records.
7. The UI displays full source values returned by the provider and clearly distinguishes unavailable fields from genuinely empty values.

## Current blockers and deployment boundary

- The existing GitHub Pages site is static and cannot securely execute the server-side login/session gateway. A server-capable VidyaDesk deployment is required before private records can be shown.
- The existing Report Central VidyaDesk integration is aggregate-only. It must be extended through separately permissioned, school-scoped read models; widening the existing aggregate payload is prohibited.
- Live school/source mappings and the source schema must be verified on the provider database before enabling any records endpoint.
- No live database migration, mapping mutation, VPS restart, PR merge, or deployment is authorized by this design document.

## Acceptance criteria

- Unauthenticated requests to every private data endpoint return 401 and no record data.
- Expired, revoked, wrong-role and wrong-school requests return 401/403 and no record data.
- PIN verification is rate-limited across instances; failures and successes are audited without logging the PIN.
- Session cookie flags are verified in integration tests.
- The machine token is accepted only on explicit GET routes and cannot call other Report Central APIs.
- Student and staff responses include the source fields actually stored, including complete unmasked values where present; tests use synthetic fixtures only.
- No PII is present in client bundles, static files, logs, test fixtures, or public caches.
- School isolation, pagination, field provenance, export permissions, audit coverage, CI and production-host browser checks pass before rollout.

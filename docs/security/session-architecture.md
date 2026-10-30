# VidyaDesk internal session architecture

**Status:** Design baseline; implementation is gated on verified persistence and provider scope  
**Date:** 2026-10-30  
**Applies to:** Phase 2 — Internal access and security

## Security objectives

- Keep the fictional/local demo shell separate from every private-data route.
- Treat the configured bootstrap PIN as an exchange secret only. It must never be accepted as a session or API bearer token.
- Issue an opaque, cryptographically random server-side session identifier after a successful PIN exchange.
- Store only a one-way hash of the session identifier in durable storage. The browser receives it only in a Secure, HttpOnly, SameSite cookie.
- Enforce expiry, revocation, rate limits, role/permission checks and school scope on the server for every private request.
- Fail closed when persistence, configuration, identity, authorization or school mapping is unavailable.

## Required request flow

1. Browser submits the bootstrap PIN over HTTPS to the same-origin session endpoint.
2. Server validates the PIN using a constant-time comparison against a server-only secret representation.
3. Server applies a durable rate-limit policy. Rate-limit keys must not store raw PINs or raw IP addresses.
4. Server creates a high-entropy opaque session token, stores only its hash with created/expiry/revocation metadata, and sets the cookie.
5. Every protected API request hashes the cookie token, loads the session, checks expiry/revocation, resolves the server-side role and fixed school scope, then checks the requested permission.
6. Logout revokes the session server-side and expires the cookie. Administrative revocation invalidates already-issued sessions.

## Persistence requirements

The production implementation requires a durable transactional store reachable by the server runtime. It must support atomic rate-limit increments and session revocation across concurrent function instances. Process memory, browser storage, a stateless signed token alone, and deployment-local files are not acceptable.

Minimum logical records:

- access_sessions: token hash (unique), subject/role reference, school key, created time, expiry time, revoked time, last-seen time and audit correlation id.
- access_rate_limits: keyed digest, window start, attempt count, block-until and updated time.
- access_audit_events: event id, timestamp, actor/session reference, event type, outcome, request correlation id and safe metadata. Never record the PIN, raw session token, student fields or credential-bearing headers.

Use database constraints and transactions for uniqueness, expiry/revocation updates and atomic rate-limit decisions. Retention and backup policy must be documented before production use.

## HTTP and browser controls

- HTTPS only; same-origin API routes.
- Session cookie: HttpOnly; Secure; SameSite=Lax; Path=/; use a __Host- prefix where deployment topology supports it.
- No session token in JSON responses, URLs, localStorage, sessionStorage, logs or analytics.
- Require an exact configured Origin for state-changing requests and use a CSRF token or equivalent same-origin defense for mutations.
- Cache-Control: no-store on session and private-data responses.
- Apply restrictive content security policy and avoid wildcard CORS.
- Do not reveal whether a PIN, account, session or school identifier was the failing factor.

## Authorization and school isolation

- School identity is resolved only from server configuration and verified provider mapping; never trust a browser-supplied school id.
- The fixed school key is umv-tetahali and session is 2026-2027. The provider numeric school_id remains unverified and must not be guessed.
- Each route declares a permission. Deny by default when a permission is missing.
- The aggregate Report Central service token remains limited to aggregate endpoints. It must not be widened to student/staff routes.
- The provider adapter must use a dedicated read-only fixed-school identity or secure per-user delegation, with server-only credentials.
- Do not expose masked Aadhaar as if it were a full value. Do not reconstruct missing values.

## Acceptance tests required before Phase 2 can be accepted

- Anonymous requests cannot reach any private-data handler.
- Correct PIN creates a cookie-backed server session; wrong PIN does not.
- PIN alone cannot call protected APIs.
- Cookie flags and no-store headers are present.
- Expired, revoked, malformed and unknown sessions are denied.
- Rate limits are durable across separate server instances and reset only according to policy.
- CSRF/origin checks reject cross-origin state-changing requests.
- Role/permission checks and fixed school scope are enforced server-side.
- Logout and administrative revocation invalidate the same session immediately.
- Audit records contain no PIN, session token or student/staff data.
- Provider outage, persistence outage and unresolved school mapping all fail closed.

## Implementation gate

Do not implement or enable private session endpoints until all of the following are verified:

1. A durable database connection is available to the VidyaDesk server runtime, with migration/backup/restore ownership documented.
2. The exact provider numeric school id for UMV Tethali is confirmed from an authorized read-only source.
3. The provider-side read-only identity/contract is agreed and tested without widening the aggregate token.
4. Preview deployment secrets and origin configuration are confirmed without exposing their values.
5. Automated tests cover the acceptance list above.

At the time this document was written, the Oracle Desktop Commander device was offline, so the provider database could not be queried. No live records or database state were accessed or changed.

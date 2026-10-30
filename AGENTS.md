# VidyaDesk contributor instructions

## Product identity and scope
- Primary workspace: UMV Tethali, Tetahali, Siwan, Bihar; academic session 2026-2027.
- VidyaDesk is a unified launch and integration hub for the school's existing repositories and services.
- Do not build generic school-management CRUD screens unless an actual school project owns the workflow and a verified data contract is available.
- The current runtime is a project hub only. There are no student, staff, attendance, fee, timetable or exam records in VidyaDesk.
- Preserve the current React 19 + Vite + Tailwind 4 visual foundation.

## Source-of-truth boundaries
- School Data Records owns restricted school data, source snapshots and provenance.
- Report Central owns versioned snapshots, canonical identity/reconciliation, conflicts and import audit.
- UDISE+ and eShikshaKosh are separate truth sources and separate automation projects.
- OFSS is admission/stream evidence, not the canonical current student master or a separate application.
- Digital Letter Registry owns official letter originals, references, processing and delivery.
- n8n owns automation and monitoring workflows; Oracle VPS is infrastructure, not a school module.
- GitHub stores code and architecture, never private school datasets.

## Security
- Do not expose private student/staff records until Phase 2 authentication and Phase 3 fixed-school gateway gates pass.
- Never commit credentials, tokens, cookies, OTPs, CAPTCHA values, student names, PENs, Aadhaar values, phone numbers, guardian data or private source records.
- Never place provider secrets in Vite variables, browser bundles, localStorage, URLs, screenshots, logs or test fixtures.
- The requested bootstrap PIN is a future exchange credential only; it must create a server-issued session and must never be used as a bearer token. Use durable rate limiting, expiry/revocation and role checks.
- The existing Report Central aggregate token remains aggregate-only. It must not be repurposed for student-level access.
- Default to aggregate read-only contracts. Reject unknown fields and wrong school/session scope.
- No provider writes, database mutations, portal submissions, VPS changes or migrations without explicit approval.

## DevOps workflow
1. Read README, this file, relevant owner-project docs, package scripts, Git state and workflows.
2. Inspect the full call path; make the smallest coherent change.
3. Separate observed facts, design, assumptions and blocked work in docs/PRs.
4. Add tests for contracts, scope guards and regressions.
5. Run npm ci, npm run test:contract, npm run build; run browser checks for UI changes.
6. Review diffs for secrets, private data, scope widening, dead code and unrelated formatting.
7. Use a feature branch, descriptive commits and a pull request.
8. Require CI before review. Never merge or deploy production without explicit user authorization.
9. Report exact files, commands actually run, results and limitations. Never claim an unrun check.

## Vibecoding guardrails
- Do not guess APIs, payloads, school identifiers or live state. Mark unknowns as assumptions or blockers.
- Never fake a connected/verified state or replace provider data with synthetic data.
- Keep components small, types explicit and business rules outside presentation components.
- Validate at trust boundaries; fail closed on malformed, stale, wrong-school or wrong-session data.
- Preserve UDISE/eShikshaKosh/OFSS provenance; ambiguous matching remains unmatched.
- Avoid unnecessary dependencies and broad refactors.
- Document why each boundary exists, not only what changed.

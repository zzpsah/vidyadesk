# VidyaDesk contributor instructions

## Product identity and scope
- Primary workspace: UMV Tetahali, Tetahali, Siwan, Bihar; Hindi medium; academic session 2026–27.
- Preserve React 19 + Vite + Tailwind, school-scoped workspace state, current visual language and module registry.
- Never widen a school-scoped query or import silently. Local fixtures are fictional; label simulations and never invent live counts.

## Source-of-truth boundaries
- Report Central owns versioned snapshots, cross-source reconciliation, conflicts and import audit.
- School Data Records owns restricted school-data architecture.
- UDISE+ and e-ShikshaKosh are separate truth sources; preserve provenance.
- OFSS is admission/stream evidence, not the canonical current student master.
- Digital Letter Registry owns official letter originals, references, authorities, subjects and deadlines.
- n8n owns automation; trigger it only through a separately approved contract.
- GitHub stores code and architecture, never private school datasets.

## Security
- Never commit credentials, tokens, cookies, OTPs, CAPTCHA values, student names, PENs, Aadhaar values, phone numbers, guardian data or private source records.
- Never place provider secrets in Vite variables, browser bundles, localStorage, URLs, screenshots, logs or test fixtures.
- VidyaDesk remains public with no user login during this development phase. The optional Report Central proxy is server-side, fixed-scope and disabled by default.
- If enabled later, only the four approved aggregate sections become public; never expose student-level rows, raw source values or credentials.
- Default to aggregate read-only contracts. Reject unknown fields and wrong school/session scope.
- No provider writes, database mutations, portal submissions, VPS changes or migrations without explicit approval.

## DevOps workflow
1. Read README, this file, relevant docs, package scripts, Git state and workflows.
2. Inspect the full call path; make the smallest coherent change.
3. Separate observed facts, derived design, assumptions and blocked work in docs/PRs.
4. Add tests for contracts, scope guards and regressions.
5. Run `npm ci`, `npm run test:contract`, `npm run build`; run browser checks for UI changes.
6. Review diffs for secrets, private data, scope widening, dead code and unrelated formatting.
7. Use a feature branch, descriptive commits and a pull request.
8. Require CI before review. Never merge or deploy without explicit user authorization.
9. Report exact files, commands actually run, results and limitations. Never claim an unrun check.

## Vibecoding guardrails
- Do not guess APIs, payloads, school identifiers or live state. Mark unknowns as assumptions or blockers.
- Never fake a connected/verified state or replace provider data with synthetic data without a simulation label.
- Keep components small, types explicit and business rules outside presentation components.
- Validate at trust boundaries; fail closed on malformed, stale, wrong-school or wrong-session data.
- Preserve UDISE/e-ShikshaKosh/OFSS provenance; ambiguous matching remains unmatched.
- Avoid unnecessary dependencies and broad refactors; preserve backwards compatibility and school isolation.
- Document why each boundary exists, not only what changed.

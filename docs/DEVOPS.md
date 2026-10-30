# VidyaDesk DevOps and integration runbook

## Observed deployment model
- React 19 + Vite + Tailwind 4 frontend; static output in `dist/`.
- GitHub Pages deployment uses `.github/workflows/deploy.yml`, Node 24, `npm ci`, `npm run build`, and `PAGES_BASE=/<repository>/`.
- Deployment triggers only on pushes to `main` or manual dispatch.
- No authenticated provider adapter is deployed by the frontend workflow.

## Pull-request quality gates
`.github/workflows/ci.yml` runs on pull requests to main and feature-branch pushes: Node 24, `npm ci`, `npm run test:contract`, then `npm run build`. It does not deploy Pages.

## Local development
Supported Node versions: Node 22.13+ in the 22.x line or Node 24+.
```sh
npm ci
npm run test:contract
npm run dev
npm run build
npm run preview
```
For a Pages-path build: `PAGES_BASE=/vidyadesk/ npm run build`.

## Custom monitoring domain
- `shikshakosh.vercel.app` is attached to the VidyaDesk Vercel project and Vercel reports it as verified.
- The project currently has no production deployment (`live: false`; latest READY deployment has `target: null`). Domain verification therefore must not be described as a live application release.
- Vercel project SSO protection is configured for all deployments **except custom domains**. Do not point this custom domain at a preview branch or use it to bypass preview SSO. Keep it unassigned to a preview deployment until a reviewed production release is approved.
- Before the first production alias, finish the public/private route review. The current shell contains project links only; private student/staff routes remain blocked until server-side sessions and fixed-school authorization are accepted.

## Integration states
| State | Meaning |
|---|---|
| unconfigured | No approved server adapter/configuration exists |
| configured | Server configuration exists; not tested |
| reachable | Authenticated read endpoint responds; schema not yet trusted |
| verified | Real read-only response passes source, school, session and schema validation |
| stale/unavailable | Freshness or provider request fails; show last verified time and warning |

Never promote state based on a URL, HTTP 200 alone, mock data, old logs or historical checkpoint counts. The Report Central dashboard validates the complete envelope before showing any values; errors remain unavailable, not zero. GitHub Pages skips the proxy call; Vercel returns disabled by default without contacting the provider.

## Security boundary
- GitHub Pages is public. Never put provider credentials in frontend environment variables or bundles.
- The public VidyaDesk Vercel proxy uses a dedicated server-side machine token, exact school/session scope, strict response validation, an 8-second timeout and short CDN caching. It is disabled by default; GitHub Pages cannot execute the function.
- The current preview is a project directory only and contains no school records. Phase 2 must implement the approved PIN-to-server-session exchange before any private records are exposed. When the separate aggregate proxy is enabled, its four approved aggregate sections are public; CORS is not authentication. Do not activate it until the live school mapping and public-data approval are recorded.
- Vercel preview deployments are protected by team SSO. Keep previews synthetic-only until application authorization and school scope have both been verified.
- The Vercel preview project is linked to the VidyaDesk repository. The protected branch preview is a development surface, not a production deployment. The current project hub links to the six existing owner repositories and their documented app entry points; none is represented as integrated until a verified adapter exists.
- Keep cookies, tokens, passwords, OTPs, CAPTCHA material and raw provider responses out of browser storage/logs.
- Aggregate contracts reject unexpected fields. No write methods belong in the read adapter.
- Write workflows need a separate design and explicit approval.

## Release and rollback
- Feature work stays on a branch and is reviewed through a PR.
- Do not merge or dispatch deployment without explicit approval.
- If an approved release regresses, revert via a reviewed PR; do not force-push shared history.
- Preserve the previous successful Pages artifact until the replacement is verified.

## Evidence to record
For every PR/release: source branch and base SHA; changed files; exact test/build/browser commands and results; CI URL/conclusion; whether a provider request occurred; assumptions, blockers and rollback path. Never log secrets or private school data.

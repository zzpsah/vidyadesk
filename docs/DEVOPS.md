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

## Custom monitoring domain and deployment protection
- shikshakosh.vercel.app is attached to the VidyaDesk Vercel project, verified, and returned HTTP 200 in the 2026-11-01 runtime check.
- The last successful production deployment is the main-branch release at commit 3ebe3caf (deployment dpl_7NknGzCuyaCVuRznqGzHFS1nmeH3). The current feature branch has a separate preview and has not been promoted.
- On 2026-11-01, Vercel SSO protection was disabled at the project level to honor the owner's no-login requirement. Preview deployments and project aliases are therefore public; do not assume team SSO protects a preview.
- The current public workspace contains project metadata and links only. Keep private student/staff routes unavailable and do not place private records, credentials or tokens in public assets.

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
- The public VidyaDesk Vercel proxy uses a dedicated server-side machine token, exact school/session scope, strict response validation, an 8-second timeout and short CDN caching. It is disabled by default; GitHub Pages cannot execute the function. Its default exact CORS origin is `https://shikshakosh.vercel.app`; production environments may override it with `VIDYADESK_ALLOWED_ORIGIN`.
- The current workspace and preview contain project metadata only and no school records. No browser login, PIN exchange, cookie or user session is in scope. The separate aggregate proxy remains disabled; when enabled, its four approved aggregate sections are public and CORS is not authentication. Do not activate it until the live school mapping and public-data approval are recorded.
- Vercel SSO protection is disabled for this project. All previews are public; keep them synthetic-only and limited to approved project metadata until a separate private-data access design is explicitly approved.
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

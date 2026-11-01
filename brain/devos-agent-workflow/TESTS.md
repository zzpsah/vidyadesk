# Tests

Verified on 2026-11-01:
- npm ci — PASS; 179 packages installed, 0 vulnerabilities reported.
- npm run check:devos — PASS; required context files and four skills validated.
- npm run test:contract — PASS; 24 passed, 0 failed.
- npm run build — PASS; TypeScript check and Vite 8.3.5 production build.
- git diff --check — PASS.

Not run: browser E2E, live integrations, Vercel deployment or production data workflows. These are outside this documentation/CI enhancement.

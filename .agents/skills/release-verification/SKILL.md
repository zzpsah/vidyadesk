---
name: release-verification
description: Prepare a VidyaDesk change for review or release by checking Git scope, CI, tests, build, secrets and deployment boundaries. Use before committing, opening a pull request, merging or deploying.
---

# Release Verification

1. Confirm repository identity, branch, base commit and clean/expected Git status.
2. Inspect the complete diff, including untracked files and generated artifacts.
3. Run npm run check:devos, npm run test:contract and npm run build.
4. Confirm CI runs on the intended branch/PR and inspect actual run results.
5. Search changed files for credentials, tokens, private environment values, cookies, OTP/CAPTCHA data and private school/student records.
6. Check that source ownership, fixed-school scope and authentication boundaries have not widened.
7. Record exact commands, results, skipped checks and remaining risks.
8. Keep merge and production deployment as separate approval decisions. A passing build is not production readiness.

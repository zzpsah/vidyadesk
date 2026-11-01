---
name: school-data-contract
description: Review or design an integration contract involving school records, UDISE+, eShikshaKosh, OFSS, Report Central, School Data Records, DLR or payroll. Use before implementing a cross-repository data flow or adapter.
---

# School Data Contract Review

1. Identify the source-of-truth owner and read that repository's current AGENTS.md, .ai state, brain, source and tests.
2. Separate observed implementation from proposed contract and assumptions.
3. Preserve source provenance, academic session, source identifiers and import/run references where applicable.
4. Do not merge UDISE+ and eShikshaKosh into one source identity.
5. Do not treat OFSS as the canonical current student master.
6. Do not duplicate payroll or official-letter ownership in VidyaDesk.
7. Reject ambiguous identity matches; do not merge on similar names alone.
8. Default to aggregate/read-only access. Unknown fields, wrong school/session scope, stale payloads and missing provenance must fail closed.
9. Never place student names, PENs, Aadhaar values, phone numbers, guardian data, cookies, OTP/CAPTCHA values or private workbooks in Git, prompts, logs, fixtures or documentation.
10. Add contract tests and document the exact owner, endpoint, auth, scope, freshness and failure semantics before calling an integration verified.

# Project Brain — Security

- Never place credentials, tokens, cookies, OTP/CAPTCHA values, private keys or environment secrets in Git or project context.
- Never include student names, PENs, Aadhaar values, phone numbers, guardian data or private source records in skills, tests, fixtures or logs.
- Skills must instruct agents to preserve source ownership, fail closed on unverified school/session scope and avoid live portal writes.
- CI checks repository context structure only; it does not prove application security or production readiness.
- No automatic production deployment or database mutation is introduced.

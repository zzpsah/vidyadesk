---
name: integration-readiness
description: Assess whether an external or sibling-project integration is genuinely ready to connect. Use when checking APIs, service health, MCP tools, webhooks, databases or project launch links.
---

# Integration Readiness

Evaluate each layer separately:
- Ownership: which repository/service owns the capability?
- Reachability: is the endpoint reachable from the intended runtime?
- Liveness: does the health endpoint respond?
- Authentication: is the required credential configured server-side and least-privileged?
- Scope: is school/session/resource scope fixed and enforced?
- Contract: are schema, versioning, errors and provenance documented and tested?
- Freshness: is the data timestamp/source run known?
- Operations: are timeouts, retries, audit and monitoring defined?

A URL or HTTP 200 proves neither authentication nor data correctness. A local health check does not prove public reachability. A working MCP connection does not authorize every tool action.

Report each layer as VERIFIED, PARTIAL, BLOCKED or UNKNOWN with evidence. Keep integrations disabled/fail-closed when any mandatory gate is missing. Never run government-portal submissions, database migrations, bulk writes or production changes as a connectivity test.

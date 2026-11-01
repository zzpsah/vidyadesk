# MCP and Tool Boundaries

MCP/tool access is supplied by the active AI host and connected accounts. Repository documentation does not create access or authorization.

| Tool family | Appropriate use | Boundary |
|---|---|---|
| GitHub | Inspect repository, branches, commits, PRs, CI; create scoped feature changes when authorized | No merge, release or secret changes without separate approval |
| Desktop Commander | Inspect authorized VPS files, processes, service health and logs | Read-only first; no service restart, permission change, firewall change or database mutation without explicit approval |
| Supabase | Inspect project metadata/schema when the project is confirmed active | Historical/inactive projects are not treated as live; no SQL writes or migrations without approval |
| Vercel | Inspect project settings, deployment status and source commit | No environment-secret changes, production promotion, alias/domain changes or deployment without approval |
| n8n | Inspect version-controlled workflow definitions and documented execution state | Do not trigger production workflows or send notifications as a test |

For every tool action, record the target repository/service, exact scope, operation type, result and remaining uncertainty. A successful MCP call proves only that the tool call succeeded; it does not prove application correctness or production readiness.

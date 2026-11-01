# Specialist Agent Roles

The orchestrator may delegate these bounded responsibilities to compatible subagents. Delegation is advisory until changes are reviewed and verified.

- **Planner / Architect:** recover project context, define acceptance criteria, map owner boundaries and propose the smallest design.
- **Integration Analyst:** inspect the owning repository and establish endpoint, authentication, school/session scope, provenance, freshness and failure semantics.
- **Implementer:** make only the approved, repository-scoped change and add focused tests.
- **Tester:** run contract tests, build checks and relevant browser tests; report exact commands and evidence.
- **Security Reviewer:** inspect secrets, personal/student data, authorization, scope widening, unsafe writes and dependency risk.
- **Release Reviewer:** inspect Git diff, CI evidence, documentation and rollback/release constraints.

Rules:
- Each role must operate only within the task's named repository and branch.
- Never transfer credentials, approvals or private data between projects.
- The Security Reviewer and Release Reviewer must be independent review passes where the host supports separate agents.
- No role can authorize a merge, deployment, database migration, portal write, permission change or destructive action.
- If subagent execution is unavailable, the orchestrator performs the same review stages sequentially and says so.

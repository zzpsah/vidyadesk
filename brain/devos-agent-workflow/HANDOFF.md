# Handoff

Branch: feat/devos-agent-workflow.

Next:
1. Inspect git status, git diff and every new file.
2. Confirm the new worktree remains based on the latest project-registry branch commit.
3. Check for secrets/private school data and verify the CI workflow syntax.
4. Commit the scoped change and open a PR targeting fix/project-registry-accuracy (not main, because this is stacked on the existing project-registry work).
5. Do not merge or deploy without separate approval.

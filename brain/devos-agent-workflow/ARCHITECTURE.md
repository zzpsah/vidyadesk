# Architecture

- .agents/skills/*/SKILL.md: portable, task-scoped instructions for compatible AI coding agents.
- scripts/check-devos-context.mjs: dependency-free structural validator.
- package.json: exposes check:devos.
- .github/workflows/ci.yml: invokes the validator before existing contract tests and build.
- .ai/ and brain/: repository-local durable project state and enhancement handoff.

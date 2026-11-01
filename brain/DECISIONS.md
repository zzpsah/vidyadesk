# Project Brain — Decisions

- Use the portable Agent Skills SKILL.md format under .agents/skills/.
- Keep skill instructions vendor-neutral and project-specific.
- Use existing GitHub Actions CI as the automated quality hook rather than introducing local hooks that may be bypassed or behave differently across machines.
- Validate required DevOS files and skill frontmatter using Node built-ins only.
- Do not add agent runtime dependencies, API keys, secrets, or external services.
- No automatic merge or production deployment.

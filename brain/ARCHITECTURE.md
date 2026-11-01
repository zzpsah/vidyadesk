# Project Brain — Architecture

This enhancement adds portable Agent Skills under .agents/skills/ and a Node-only context validator under scripts/. GitHub Actions invokes the validator before contract tests and production build.

The skills are instructions for compatible coding agents; they do not grant tool access. MCP connections remain host-configured and least-privilege. Existing project CI is the automated event hook. No new always-on service or external dependency is introduced.

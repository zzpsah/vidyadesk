# Project Brain — Tests

Required verification:
- npm run check:devos — validates DevOS manifest, portable context and Agent Skill metadata.
- npm run test:contract — existing contract suite.
- npm run build — TypeScript and production bundle.

CI must run all three on pull requests to main and non-main pushes. No live provider calls are used by these checks.

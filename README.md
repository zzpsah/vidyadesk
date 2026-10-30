# VidyaDesk

**Live demo:** <https://zzpsah.github.io/vidyadesk/> — the current `main` branch, built and served by GitHub Pages. Fictional data, no account, nothing you enter leaves the browser.

VidyaDesk is customized as the primary UMV Tetahali school-management workspace. The underlying offline workspace retains an isolated multi-school data model for its existing demo and future expansion; the deployed school identity and first integration scope remain UMV Tetahali. Every school’s local records stay isolated.

It is a front end built to be extended, not a finished product. There is no user login or application database; local records live in `localStorage` in your own browser. The optional Report Central aggregate connection is server-side, read-only and disabled by default. It is not affiliated with, and is not an interface to, any government portal.

```
16 of 25 modules work against local browser data · 8 publish build blueprints · 1 integration dashboard is unconnected
```

## What it does today

| Area | Modules | Status |
|---|---|---|
| Students | Enrollment, Attendance, Exams & results, Fees & payments | IMPLEMENTED · OFFLINE_TESTED |
| People & transfers | Teachers & staff, Staff leave, and four transfer workflows | IMPLEMENTED · OFFLINE_TESTED |
| Academics | Classes & sections, Timetable, Reports | IMPLEMENTED · OFFLINE_TESTED |
| Communication | Notification board, Support tickets | IMPLEMENTED · OFFLINE_TESTED |
| Operations | PM Poshan mid-day meal register | IMPLEMENTED · OFFLINE_TESTED |
| Registered, not built | Sports assessment, Model school, Safe Saturday, Committee (MoM), Library, Transport, Inventory, Parent portal | SPEC PUBLISHED (blueprint page) |

`OFFLINE_TESTED` here means: exercised end to end in an isolated Chromium session against the local build — forms, validation, per-school isolation, reload persistence, CSV export, and 320/390/768/1280 px layouts, with zero page errors. Nothing reads from or writes to a live portal, so `LIVE_READ` and `LIVE_SAVE` deliberately do not apply yet.

### Integration registry

The **Operations → Integrations** page is the integration registry; **Operations → Report Central** is the first aggregate dashboard seam. It records the external systems that may contribute to the unified workspace while keeping their ownership and safety boundaries explicit:

- `report-central` — planned read-only summaries and reconciliation views.
- `digital-letter-registry` — planned read-only letter references and workflow history.
- `school-data-records` — restricted source-of-truth data; student-level records are not copied into the browser workspace.
- `udise-automation-suite` and `eshikshakosh-automation` — separate government-portal workflows; credentials, CAPTCHA, OTP and writes remain outside VidyaDesk.
- `n8n-operations` — planned authenticated automation boundary; no webhook trigger is enabled yet.

This registry remains descriptive. The Report Central dashboard now checks the same-origin `/api/report-central` proxy only when hosted on a server-capable deployment. GitHub Pages skips the request because it is static; the Vercel proxy returns a disabled state without contacting the provider until its server-side feature flag is explicitly enabled. The dashboard never substitutes invented figures.


### Report Central read-only contract

VidyaDesk now defines a versioned, aggregate-only contract for a future Report Central adapter in `core/report-central-contract.ts`.

- Scope is fixed to the UMV Tetahali school identity and academic session `2026-2027`; the session must be verified against the provider before data is accepted.
- Read models are limited to overview counts, separate UDISE/e-ShikshaKosh source summary, conflict totals and import-audit totals.
- Every future response must carry source identity, school/session scope, retrieval timestamp and snapshot id/version.
- Envelope and payload validators reject wrong-school/session data, unknown fields, invalid counts and inconsistent source/conflict/audit totals.
- The adapter interface intentionally has no write methods. No browser credentials, tokens, cookies or direct provider calls are permitted.
- The dashboard displays a clear unavailable/disabled state until a complete provider envelope passes validation. A verified response can populate the four aggregate panels; an HTTP 200 alone is not sufficient.
- A no-login Vercel Edge proxy now exists in `api/report-central.ts`; it holds the provider token server-side, validates the exact envelope, and is disabled unless `VIDYADESK_REPORT_CENTRAL_ENABLED=true`. It never accepts caller-selected school/session filters.
- GitHub Pages remains a public static frontend and cannot execute this API function. A separate Vercel project is required; it has not yet been created or deployed. See [the public proxy runbook](docs/integrations/public-report-central-proxy.md).
- Once enabled, the four aggregate sections are public. Do not enable them until the live school mapping is verified and the school approves publication.

See [the integration contract notes](docs/integrations/report-central-readonly-contract.md) for the field-level boundary and rollout gates.

## Architecture

```
core/          domain + state, no JSX except workspace.tsx
  types.ts       School = SchoolMeta & SchoolData; every record type lives here
  modules.ts     the registry: id, name, group, status, icon, blueprint spec
  seed.ts        deterministic fictional fixtures for a new school
  graph.ts       cross-module derivation — the only place two modules are combined
  workspace.tsx  reducer + Context + localStorage persistence
  metrics.ts     one-line live context per module (sidebar + tiles)
  format.ts      currency, dates, CSV cell escaping and download
  nav.ts         the { go, open } contract passed to every view
components/
  shell.tsx      sidebar (school picker, grouped nav) + topbar (crumbs)
  common.tsx     Panel, DataTable, Kpi, Pill, PageHead, filters, empty states
  dialogs.tsx    one DialogHost driven by a DialogState union
  ui/            bundled Shadcn catalog (the app uses a subset)
features/        one file per module group; views are pure consumers of the store
src/             App.tsx (route switch), main.tsx, globals.css (design tokens)
```

Four rules keep it coherent:

1. **A school owns its records.** `School` holds `students`, `staff`, `classes`, `notices`, `fees`, `attendance`, `leaveRequests`, `transferApplications`, `tickets`, `mdmEntries`, `assessments`, `marks` and `timetable`. The reducer's `onSchool()` helper only ever touches `state.activeSchoolId`, so no action can write into another school's data.
2. **Relationships are stored, not inferred from names.** A mark points at an `assessmentId` + `studentId`, a period at a `classId` + `staffId`, a ticket or notice at a `classId`, a transfer at a `staffId`. Renaming a teacher never silently re-parents their records.
3. **Derived numbers live in one file.** `core/graph.ts` is the only place two collections are combined — attendance percentages, per-student progress, staff workload, the meal-vs-register reconciliation. The module screens and the Reports screens call the same functions, so they cannot disagree.
4. **The registry drives the chrome, and views hold no copies.** Navigation, the overview board and the blueprint pages are generated from `modules.ts`; switching schools re-renders the whole workspace consistently (`<main>` is keyed on `route + school.id`).

State persists under `vidyadesk.workspace.v1`. Removing that key, or *Settings → Reset workspace*, restores the three demo schools. Workspaces saved before assessments and timetable periods became stored records are upgraded on load — the migration derives the same figures the old generated screens showed.

### Reports

`features/reports.tsx` holds eight report definitions, each declaring the module ids it joins and a `build(school, schools)` that returns headings, rows and a one-line note:

`Attendance by class` · `Fee dues` · `Student progress cards` · `Staff workload` · `Meal register vs attendance` · `Transfer pipeline` · `Facility backlog` · `All schools compared`

Nothing is stored twice — a report is recomputed from the registers each time it renders, and *Export CSV* writes exactly the rows on screen. The last one only exists because the workspace holds several schools.

### Adding a module

1. Add an entry to `core/modules.ts` (`id`, `name`, `nav`, `blurb`, `group`, `status`, `icon`). A `blueprint` entry needs `entities`, `workflow` and `checks` and renders automatically.
2. Add the entity type to `core/types.ts` and to `emptyData()` in `core/seed.ts` so a new school starts with an empty collection.
3. Add an action to the reducer in `core/workspace.tsx` and route it through `onSchool`. If older saved workspaces lack the collection, upgrade them in `upgrade()` there rather than in a view.
4. If the module's numbers combine two collections, add the derivation to `core/graph.ts` and read it from both the screen and the report.
5. Write the view in `features/`, register it in `renderView()` in `src/App.tsx`, and give it a line in `core/metrics.ts`.

The four transfer workflows are the reference example: one `TransfersView` component serves all four module ids, and each school keeps its own drafts.

## Data, privacy and honesty

* Student, teacher and register fixtures are fictional and generated from generic name pools. The default workspace is labelled for UMV Tetahali using public school context only; no real student, teacher or source record appears in this repository.
* Records never leave the browser. There is no backend, no analytics and no request to any third party.
* CSV export escapes cells that begin with `=`, `+`, `-` or `@` so a spreadsheet cannot execute them.
* The `functions/` and `dev/` folders come from the Qoder Sites starter and are unused by this app; they are kept so the project can be published there without rework.

## Develop

Node `^22.13.0 || >=24.0.0`.

```sh
npm install
npm run dev        # Vite on the printed loopback URL
npm run test:contract # aggregate integration contract tests
npm run build      # tsc --noEmit, then a static bundle in dist/
npm run preview    # serve dist/
```

The `@/*` path alias resolves to the **project root**, so imports read `@/core/types`, `@/components/ui/button` and `@/features/academics`. Root directories covered by TypeScript are listed in `tsconfig.json`.

### Publishing

A push to `main` runs `.github/workflows/deploy.yml`: it installs on Node 24, builds with `PAGES_BASE=/vidyadesk/` so the bundle's asset URLs carry the Pages project subpath, and publishes `dist/` through `actions/deploy-pages`. `base` defaults to `/` locally, so `npm run dev` and `npm run preview` are unaffected — pass `PAGES_BASE` to preview the exact artifact Pages serves.

The site is a static bundle: Pages serves it, and no server-side code runs. Records live in the visitor's own `localStorage`, keyed to the origin, so the demo and a local checkout never share data.

## Roadmap

The next build is pinned from any blueprint page (*Pin as next build*) and appears on the overview. In order of dependency:

1. **Persistence that is not a browser** — a Postgres schema keyed by `school_id`, mirroring `core/types.ts`, and a token-scoped API behind the same reducer actions.
2. **Accounts and roles** — head teacher, clerk, district viewer; the school picker becomes a list of schools a user may see.
3. **The remaining eight modules**, each already specified: entities, order of work and the checks that must pass before it can be called live.
4. **Import and export** — bulk student import, and report output that matches the formats the state portals expect.

Connecting any of this to a real portal is a separate, explicit decision: it needs authenticated APIs, and an HTTP 200 is not proof that a record was saved.

### Engineering and operations rules

See [AGENTS.md](AGENTS.md) for product, security, DevOps and vibecoding guardrails. The [DevOps runbook](docs/DEVOPS.md) defines pull-request checks, release boundaries, integration states and rollback expectations. Pull requests run contract tests and the production build; only `main` is eligible for GitHub Pages deployment.

## License

MIT — see [LICENSE](LICENSE). Template and vendored-CSS attribution: [PROVENANCE.md](PROVENANCE.md).

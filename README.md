# VidyaDesk

A school-agnostic workspace for running a school's day-to-day records. Nothing in the interface, the data model or the module registry names a particular school: you add a school, and every registered module becomes available to it with its own isolated records.

It is a front end built to be extended, not a finished product. There is no login, no database and no network call — records live in `localStorage` in your own browser. It is not affiliated with, and is not an interface to, any government portal.

```
15 of 24 modules work against real (local) data · 9 publish a build blueprint
```

## What it does today

| Area | Modules | Status |
|---|---|---|
| Students | Enrollment, Attendance, Exams & results, Fees & payments | IMPLEMENTED · OFFLINE_TESTED |
| People & transfers | Teachers & staff, Staff leave, and four transfer workflows | IMPLEMENTED · OFFLINE_TESTED |
| Academics | Classes & sections, Timetable | IMPLEMENTED · OFFLINE_TESTED |
| Communication | Notification board, Support tickets | IMPLEMENTED · OFFLINE_TESTED |
| Operations | PM Poshan mid-day meal register | IMPLEMENTED · OFFLINE_TESTED |
| Registered, not built | Sports assessment, Model school, Academic reports, Safe Saturday, Committee (MoM), Library, Transport, Inventory, Parent portal | SPEC PUBLISHED (blueprint page) |

`OFFLINE_TESTED` here means: exercised end to end in an isolated Chromium session against the local build — forms, validation, per-school isolation, reload persistence, CSV export, and 320/390/768/1280 px layouts, with zero page errors. Nothing reads from or writes to a live portal, so `LIVE_READ` and `LIVE_SAVE` deliberately do not apply yet.

## Architecture

```
core/          domain + state, no JSX except workspace.tsx
  types.ts       School = SchoolMeta & SchoolData; every record type lives here
  modules.ts     the registry: id, name, group, status, icon, blueprint spec
  seed.ts        deterministic fictional fixtures for a new school
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

Three rules keep it multi-school:

1. **A school owns its records.** `School` holds `students`, `staff`, `classes`, `notices`, `fees`, `attendance`, `leaveRequests`, `transferApplications`, `tickets` and `mdmEntries`. The reducer's `onSchool()` helper only ever touches `state.activeSchoolId`, so no action can write into another school's data.
2. **The registry drives the chrome.** Navigation, the overview board and the blueprint pages are generated from `modules.ts`. Adding a module is a registry entry plus a view — the shell never changes.
3. **Views get data through the store.** No view holds a copy of school data, so switching schools re-renders the whole workspace consistently (the `<main>` element is keyed on `route + school.id`).

State persists under `vidyadesk.workspace.v1`. Removing that key, or *Settings → Reset workspace*, restores the three demo schools.

### Adding a module

1. Add an entry to `core/modules.ts` (`id`, `name`, `nav`, `blurb`, `group`, `status`, `icon`). A `blueprint` entry needs `entities`, `workflow` and `checks` and renders automatically.
2. Add the entity type to `core/types.ts` and to `emptyData()` in `core/seed.ts` so a new school starts with an empty collection.
3. Add an action to the reducer in `core/workspace.tsx` and route it through `onSchool`.
4. Write the view in `features/`, register it in `renderView()` in `src/App.tsx`, and give it a line in `core/metrics.ts`.

The four transfer workflows are the reference example: one `TransfersView` component serves all four module ids, and each school keeps its own drafts.

## Data, privacy and honesty

* Every fixture is fictional and generated from generic name pools. Demo schools are literally named `Demo …`; no real school, student, teacher, block or district appears in source.
* Records never leave the browser. There is no backend, no analytics and no request to any third party.
* CSV export escapes cells that begin with `=`, `+`, `-` or `@` so a spreadsheet cannot execute them.
* The `functions/` and `dev/` folders come from the Qoder Sites starter and are unused by this app; they are kept so the project can be published there without rework.

## Develop

Node `^22.13.0 || >=24.0.0`.

```sh
npm install
npm run dev        # Vite on the printed loopback URL
npm run build      # tsc --noEmit, then a static bundle in dist/
npm run preview    # serve dist/
```

The `@/*` path alias resolves to the **project root**, so imports read `@/core/types`, `@/components/ui/button` and `@/features/academics`. Root directories covered by TypeScript are listed in `tsconfig.json`.

## Roadmap

The next build is pinned from any blueprint page (*Pin as next build*) and appears on the overview. In order of dependency:

1. **Persistence that is not a browser** — a Postgres schema keyed by `school_id`, mirroring `core/types.ts`, and a token-scoped API behind the same reducer actions.
2. **Accounts and roles** — head teacher, clerk, district viewer; the school picker becomes a list of schools a user may see.
3. **The remaining nine modules**, each already specified: entities, order of work and the checks that must pass before it can be called live.
4. **Import and export** — bulk student import, and report output that matches the formats the state portals expect.

Connecting any of this to a real portal is a separate, explicit decision: it needs authenticated APIs, and an HTTP 200 is not proof that a record was saved.

## License

MIT — see [LICENSE](LICENSE). Template and vendored-CSS attribution: [PROVENANCE.md](PROVENANCE.md).

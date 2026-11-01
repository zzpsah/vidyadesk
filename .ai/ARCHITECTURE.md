# Architecture

## Application
- React 19 + Vite + Tailwind 4 frontend.
- core/projects.ts owns the verified project inventory and ownership metadata.
- features/overview.tsx presents the project hub.
- features/report-central.tsx presents the aggregate-only Report Central surface.
- features/integrations.tsx presents the read-only integration catalogue.
- api/ contains server-side integration endpoints; activation remains gated.

## Ownership boundaries
- School Data Records: restricted school/source records and provenance.
- Report Central: versioned snapshots, canonical identity/reconciliation, conflicts and import audit.
- UDISE+ and eShikshaKosh: separate source systems and separate automation owners.
- OFSS: admissions/stream evidence, not the canonical current student master.
- Digital Letter Registry: official letter originals, references, processing and delivery.
- n8n: automation and monitoring workflows.
- Oracle VPS/PostgreSQL: infrastructure and database operations, not school-facing modules.

## Data flow rule
Integrations consume documented, least-privilege contracts from the owning project. Default to aggregate read-only data. Reject unknown fields and incorrect school/session scope. Never copy owner-system data into a second source of truth.

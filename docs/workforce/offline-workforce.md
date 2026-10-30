# Offline workforce directory

## Scope

The staff directory is an offline workflow backed only by the active school's browser-local workspace. It does not call Oracle VPS, Report Central, UDISE+, e-ShikshaKosh, a payroll system or a district HR service.

## Directory capabilities

- Search by staff name, role, subject, assigned class and class-teacher section.
- Combine role, subject and timetable-assignment filters.
- Review staff count, timetable coverage, weekly period totals and pending leave totals.
- Review an individual staff member's teaching periods, taught sections, class-teacher assignments, approved leave usage and derived remaining leave balance.
- Export the currently filtered directory to CSV. CSV cells continue to use the shared formula-injection guard.

## Calculation rules

- Weekly period counts come from stored timetable periods assigned to the staff member.
- Taught sections are the distinct class ids appearing in those periods.
- Class-teacher sections come from stored class-to-teacher relationships.
- Approved leave usage is summed from approved leave requests only.
- Displayed remaining leave is the staff master balance minus approved leave days. The staff master value is not mutated by this calculation.
- The directory does not declare a period count to be overloaded or underloaded; no official workload norm has been configured.

## Data and release boundary

Current fixtures are fictional sample records. Do not enter or commit real staff personal data in the public demo. The browser-local workspace is not a durable HR record, and approval in this interface does not submit leave to payroll or a department. Real staff data requires the separately gated authenticated session and fixed-school read-only gateway, with verified source provenance and field-level authorization.

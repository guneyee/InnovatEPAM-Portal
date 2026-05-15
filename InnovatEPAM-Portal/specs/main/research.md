# Research Notes - InnovatEPAM Portal

## Decision Summary

1. Keep the backend as a single Express application rooted in `src/`.
2. Preserve server-rendered static HTML pages for the primary demo flows.
3. Treat the Vite + React frontend as an additive entrypoint instead of a forced rewrite.
4. Keep MongoDB as the primary persistence model, but preserve the in-memory fallback for demos and test isolation.
5. Centralize business rules in route/service layers rather than duplicating them in UI code.

## Rationale

### Backend Shape

- A single Express app keeps routing, middleware, and error handling simple.
- Existing tests already target this shape, so keeping it stable protects delivery speed.
- The constitution prefers straightforward flows and minimal architectural complexity.

### Frontend Shape

- Existing public pages already cover authentication, submission, listing, and review.
- React is useful for incremental modernization, but replacing working static pages would add unnecessary migration risk.
- The current `/app` React surface is enough to validate the toolchain and future migration path.

### Persistence and Demo Continuity

- Mongoose-backed persistence supports the primary application behavior.
- In-memory fallback keeps workshops and demos usable when MongoDB is unavailable.
- `mongodb-memory-server` keeps tests deterministic without depending on a shared database.

### File Upload Handling

- `multer` with explicit MIME allowlisting and a 10 MB limit is sufficient for the MVP.
- Local `uploads/` storage is acceptable because production deployment is out of scope.
- A single attachment per idea keeps validation and retrieval simple.

### Review Workflow

- Multi-stage review, blind mode, and scoring belong in shared storage/service logic.
- This prevents divergent workflow behavior between admin, submitter, and React clients.
- Role checks remain server-side so privileged actions do not depend on client honesty.

## Rejected Alternatives

1. Full React rewrite first: rejected because it delays validated business flows and increases migration surface.
2. Splitting backend into multiple services: rejected because current scope does not justify operational or testing overhead.
3. External object storage for attachments: rejected because local demos and MVP scope do not require it.
4. Session-based authentication: rejected because JWT already matches existing API and client flows.

## Risks and Mitigations

1. Dual UI surfaces can drift. Mitigation: keep workflow logic server-side and validate core behavior through API tests.
2. In-memory fallback can differ from MongoDB behavior. Mitigation: maintain integration tests with `mongodb-memory-server` and keep fallback logic narrow.
3. Review workflow complexity can expand quickly. Mitigation: keep stage configuration and scoring centralized in one service boundary.
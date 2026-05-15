# Implementation Plan: InnovatEPAM Portal

**Branch**: `main` | **Date**: 2026-05-16 | **Spec**: `/specs/main/spec.md`

**Input**: Feature specification from `/specs/main/spec.md`

## Summary

Deliver a lightweight innovation portal where employees authenticate, submit ideas with optional attachments, review their submissions, and admins/evaluators manage the review lifecycle. The implementation remains intentionally simple: an Express API and server-rendered static pages handle the core workflow, while a small Vite + React frontend is available as an incremental UI entrypoint without replacing the stable portal flows.

## Technical Context

**Language/Version**: JavaScript on Node.js with CommonJS backend modules; React 19 for the optional frontend shell

**Primary Dependencies**: Express, Mongoose, jsonwebtoken, bcryptjs, multer, cors, dotenv, React, React DOM, Vite

**Storage**: MongoDB for primary persistence with in-memory fallback behavior for local/demo continuity; local filesystem storage under `uploads/` for attachments

**Testing**: Jest + Supertest integration tests, Jest unit tests, mongodb-memory-server for isolated database-backed test runs, ESLint for static validation

**Target Platform**: Local Windows/macOS/Linux development, browser-based desktop and mobile access, Node.js server runtime

**Project Type**: Single Node.js web application with static portal pages plus a separate Vite frontend package served by the same repository

**Performance Goals**: Fast local demo responsiveness, sub-second health and basic API responses in development, stable handling of small attachment uploads up to 10 MB

**Constraints**: Keep dependencies minimal and justified, preserve simple manual-demo flows, enforce authentication and role checks on privileged actions, maintain responsive pages without introducing a heavy frontend rewrite

**Scale/Scope**: Small internal portal for local demos and workshop delivery; supports authentication, idea submission, drafts, listing, multi-stage review, blind review, and scoring within a single repository

## Constitution Check

*GATE: Must pass before implementation and be re-checked after design changes.*

1. **Business value first**: Pass. Every scoped capability maps directly to submitter or admin outcomes from `spec.md`.
2. **Simplicity over complexity**: Pass with watch item. The backend remains a single Express app; the React frontend is additive and must not displace working static flows unless it clearly simplifies maintenance.
3. **Functional before polished**: Pass. Core API, auth, submission, listing, and review flows remain the implementation priority; UI polish is secondary.
4. **Responsive by default**: Pass. Existing public pages are responsive and any React additions must preserve mobile-safe layout behavior.
5. **Security by default**: Pass. JWT auth, role-based authorization, file-type validation, and bounded upload size are already part of the design and must remain enforced.
6. **Testing constitution alignment**: Pass with explicit requirement. New work should keep Jest coverage healthy, prefer test-first for behavior changes, and preserve the existing regression suite.
7. **Quality gates mapping**: Pass in current planning state. `spec.md` now maps to `tasks.md`; future architecture changes must be documented in `research.md` or ADRs and manual validation must be captured in `quickstart.md`.

## Project Structure

### Documentation (this feature)

```text
specs/main/
├── plan.md
├── spec.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app.js
├── middleware/
│   └── auth.js
├── models/
│   ├── Idea.js
│   └── User.js
├── public/
│   ├── admin.html
│   ├── index.html
│   ├── react-mini.js
│   └── user.html
├── routes/
│   ├── auth.js
│   └── ideas.js
└── services/
    └── storage.js

frontend/
├── index.html
├── vite.config.mjs
└── src/
    ├── App.jsx
    ├── main.jsx
    └── styles.css

tests/
├── integration/
│   ├── auth.test.js
│   ├── idea-file.test.js
│   └── ideas.test.js
├── unit/
│   └── middleware/
│       └── auth.test.js
└── setup.js

docs/
├── adr/
├── AGENTS.md
├── CONSTITUTION.md
├── PRD.md
└── STORIES.md
```

**Structure Decision**: Keep the repository as one backend-first application rooted in `src/` with tests in `tests/`, while treating `frontend/` as an incremental web client package for React/Vite development. This supports the constitution goal of simple architecture while allowing React adoption without breaking the working Express-delivered pages.

## Implementation Approach

### Phase Focus

1. Preserve the stable Express API and public HTML flows as the functional baseline.
2. Continue to model business behavior in `src/routes/ideas.js`, `src/routes/auth.js`, and `src/services/storage.js` rather than scattering workflow logic across the UI.
3. Use `frontend/` for additive React experiences, API health checks, and future UI migration slices.
4. Keep tests centered on behavior-scoped API validation before broadening frontend surface area.

### Data and Security Notes

1. `User` and `Idea` models remain the source of truth for auth and submission workflows.
2. Attachments stay single-file and bounded by multer configuration.
3. Admin/evaluator-only actions must continue to pass through JWT authentication plus role guards.
4. Blind-review and stage-scoring logic stays centralized in storage/service logic so UI clients remain thin.

### Validation Strategy

1. Run `npm test -- --runInBand` after backend behavior changes.
2. Run `npm run lint` after frontend or shared JavaScript changes.
3. Run `npm run client:build` for React/Vite deployment checks when frontend files change.
4. Keep quick manual validation centered on `/`, `/user`, `/admin`, `/app`, and `/health`.

## Complexity Tracking

No constitution violations currently require exception tracking. The only deliberate complexity is the coexistence of static HTML pages and a small React frontend, which is justified because it allows incremental modernization without destabilizing the existing demoable product.

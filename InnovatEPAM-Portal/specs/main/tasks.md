# Tasks: InnovatEPAM Portal

**Input**: Design documents from `/specs/main/`

**Prerequisites**: plan.md, spec.md

**Tests**: Not explicitly requested in the feature spec; validation is driven by independent story checks and existing Jest coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and validation.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the application skeleton, dependency set, and runnable entrypoints.

- [ ] T001 Align runtime and developer scripts in package.json
- [ ] T002 Create Express application bootstrap in src/app.js
- [ ] T003 [P] Configure local environment loading and startup guidance in README.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared platform pieces required by every story.

- [ ] T004 Create user and idea persistence models in src/models/User.js and src/models/Idea.js
- [ ] T005 [P] Implement authentication and role middleware in src/middleware/auth.js
- [ ] T006 [P] Implement storage and default admin bootstrapping in src/services/storage.js
- [ ] T007 Configure shared uploads handling and API routing in src/app.js and src/routes/ideas.js
- [ ] T008 Add consistent API error handling and 404 behavior in src/app.js

**Checkpoint**: Backend foundation is ready for feature work.

---

## Phase 3: User Story 1 - User Authentication (Priority: P1) 🎯 MVP

**Goal**: Employees can register, login, and receive role-aware access.

**Independent Test**: A user can register and login through the API and the portal pages show authenticated state.

### Implementation for User Story 1

- [ ] T009 [US1] Implement register, login, and logout endpoints in src/routes/auth.js
- [ ] T010 [P] [US1] Wire authentication UI actions into src/public/index.html and src/public/user.html
- [ ] T011 [P] [US1] Wire admin login flow into src/public/admin.html
- [ ] T012 [US1] Verify JWT payload and role enforcement paths in tests/integration/auth.test.js and tests/unit/middleware/auth.test.js

**Checkpoint**: Authentication works independently for submitter and admin flows.

---

## Phase 4: User Story 2 - Idea Submission (Priority: P1)

**Goal**: Authenticated submitters can create ideas with required fields and an optional attachment.

**Independent Test**: A logged-in submitter can send a valid idea payload and receive a persisted idea with status metadata.

### Implementation for User Story 2

- [ ] T013 [US2] Implement protected create-idea and draft endpoints in src/routes/ideas.js
- [ ] T014 [P] [US2] Add category-specific validation and payload normalization in src/routes/ideas.js
- [ ] T015 [P] [US2] Add submitter-side idea form, draft actions, and upload handling in src/public/user.html
- [ ] T016 [US2] Verify submission, draft, and file upload behavior in tests/integration/ideas.test.js and tests/integration/idea-file.test.js

**Checkpoint**: Submitters can create and save ideas without depending on admin features.

---

## Phase 5: User Story 3 - Idea Listing and Viewing (Priority: P2)

**Goal**: Users can browse ideas, inspect details, and view current status.

**Independent Test**: An authenticated user can load the idea list, select an idea, and view its details and attachment preview.

### Implementation for User Story 3

- [ ] T017 [US3] Implement list and detail retrieval endpoints in src/routes/ideas.js
- [ ] T018 [P] [US3] Render list/detail interactions on the submitter portal in src/public/user.html
- [ ] T019 [P] [US3] Render summary list and detail panel on the main landing page in src/public/index.html
- [ ] T020 [US3] Verify listing, filtering, pagination, and detail retrieval in tests/integration/ideas.test.js

**Checkpoint**: Idea browsing works independently from status update workflows.

---

## Phase 6: User Story 4 - Evaluation Workflow (Priority: P3)

**Goal**: Admins and evaluators can review ideas, score stages, and update statuses with comments.

**Independent Test**: An admin can login, load ideas, progress review stages, score them, and persist decisions.

### Implementation for User Story 4

- [ ] T021 [US4] Implement stage configuration, decision, scoring, and status update endpoints in src/routes/ideas.js
- [ ] T022 [P] [US4] Build review controls and stage configuration UI in src/public/admin.html
- [ ] T023 [US4] Enforce blind-review masking and stage progression logic in src/services/storage.js
- [ ] T024 [US4] Verify review workflow, scoring, and status transitions in tests/integration/ideas.test.js

**Checkpoint**: Evaluation workflow is independently usable by privileged roles.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Finalize documentation, demo flow, and optional React frontend touchpoints.

- [ ] T025 [P] Document quickstart, demo flow, and feature status in README.md, quickstart.md, and DEMO_SCRIPT.md
- [ ] T026 [P] Align Vite React entrypoints and Express integration in frontend/src/App.jsx, frontend/vite.config.mjs, and src/app.js
- [ ] T027 Run full regression validation with npm run lint and npm test

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 has no dependencies.
- Phase 2 depends on Phase 1 and blocks all user story work.
- Phase 3 depends on Phase 2 and establishes the MVP.
- Phase 4 depends on Phase 3 because submission requires authenticated users.
- Phase 5 depends on Phase 4 because ideas must exist before they can be listed.
- Phase 6 depends on Phase 5 because admins review existing ideas.
- Phase 7 depends on all prior phases.

### User Story Dependencies

- US1 enables secured access for all later stories.
- US2 depends on US1 for authenticated submission.
- US3 depends on US2 for meaningful data to display.
- US4 depends on US3 for reviewable ideas and detail views.

### Parallel Opportunities

- T003 can run in parallel with T002 after package setup starts.
- T005 and T006 can run in parallel once the base app exists.
- T010 and T011 can run in parallel once auth endpoints are defined.
- T014 and T015 can run in parallel during submission work.
- T018 and T019 can run in parallel during listing work.
- T022 can run in parallel with T023 during evaluation work.
- T025 and T026 can run in parallel during polish.

---

## Parallel Example: User Story 2

```bash
Task: "Add category-specific validation and payload normalization in src/routes/ideas.js"
Task: "Add submitter-side idea form, draft actions, and upload handling in src/public/user.html"
```

---

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational phases.
2. Deliver User Story 1 for login-ready access.
3. Deliver User Story 2 so submitters can create ideas.
4. Validate the MVP before expanding the workflow.

### Incremental Delivery

1. Add listing after submission is stable.
2. Add evaluation workflow after list/detail flows are stable.
3. Finish with documentation and React/Vite alignment.

### Validation Notes

1. Keep each story independently demoable.
2. Use existing Jest suites as regression protection after each completed story.
3. Run lint and tests before closing the polish phase.
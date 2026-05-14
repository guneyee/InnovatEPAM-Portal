# Constitution - InnovatEPAM Portal

## 1. Purpose
This constitution defines the mandatory rules for planning and implementation of InnovatEPAM Portal.

## 2. Product Principles
1. Business value first: every feature must map to a user or admin outcome.
2. Deterministic behavior: state transitions and validation rules must be explicit and reproducible.
3. Simplicity over complexity: prefer minimal dependencies and straightforward architecture.
4. Accessibility and responsive UX: all core flows must work on desktop and mobile.
5. Security by default: authentication, authorization, and file handling must be secure by design.

## 3. Technical Constraints
1. Frontend stack: Next.js + React + Tailwind CSS + shadcn/ui.
2. Persistence: SQLite as primary data store for this phase.
3. Date handling: date-fns for formatting and date utilities.
4. Theme implementation: Tailwind theme tokens using @theme conventions.
5. Minimal dependencies: every dependency must have a clear need.

## 4. Mandatory Functional Scope
1. Idea submission with category-aware dynamic form sections.
2. Draft lifecycle: save draft, edit draft, submit draft.
3. Multi-media attachments: documents, images, videos, presentations.
4. Admin evaluation pipeline with configurable stages.
5. Optional blind review mode for evaluator anonymity.

## 5. Quality Gates
1. Every requirement in spec.md must have at least one corresponding task in tasks.md.
2. Every task completion must update plan.md progress state.
3. Data model updates must be reflected in data-model.md before implementation.
4. Any architecture change must append a note in research.md with rationale.

## 6. Definition of Done
A feature is done only when:
1. Requirement is implemented and manually validated through quickstart.md scenario.
2. Data model impact is documented.
3. UX flow is responsive and usable on mobile and desktop.
4. Security constraints are verified (auth, role checks, file rules).

## 7. Non-Goals for This Kickoff
1. Unit, integration, and end-to-end test automation.
2. Advanced analytics and recommendation engines.
3. External workflow orchestration.

## 8. Amendment Process
Any major change to these principles must include:
1. Changed rule text.
2. Motivation.
3. Expected impact on scope or delivery.

Document Version: 1.0
Last Updated: 2026-05-14

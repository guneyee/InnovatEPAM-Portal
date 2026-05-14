# Constitution - InnovatEPAM Portal

## Purpose
Define the rules for planning and implementing InnovatEPAM Portal using SpecKit and AI-assisted development.

## Product Principles
1. Business value first: every feature must map to a clear user outcome.
2. Simplicity over complexity: prefer straightforward flows and minimal dependencies.
3. Functional before polished: ship working features before visual refinement.
4. Responsive by default: all core flows must work on desktop and mobile.
5. Security by default: authentication, authorization, and file handling must be safe.

## Technical Constraints
1. Use the chosen stack consistently across the project.
2. Keep architecture simple and testable.
3. Document every major technical decision in ADRs.
4. Use AI assistance with explicit context from specs and ADRs.
5. Keep dependencies minimal and justified.

## Mandatory Scope
1. User registration, login, logout.
2. Role distinction for submitter and admin/evaluator.
3. Idea submission with title, description, category, and file attachment.
4. Idea listing and viewing.
5. Status tracking and admin evaluation workflow.

## Quality Gates
1. Every requirement in spec.md must map to at least one task in tasks.md.
2. Every task must map to a specific requirement.
3. Any architecture decision must be recorded in research.md or an ADR.
4. Manual validation must be described in quickstart.md.

## Definition of Done
A feature is done only when:
1. It is implemented and manually validated.
2. It is reflected in the data model if needed.
3. It follows the product principles.
4. It is documented in the project summary.

## Non-Goals for MVP
1. Advanced analytics.
2. Complex workflow automation.
3. External identity provider integration.
4. Production deployment.

Document Version: 1.0

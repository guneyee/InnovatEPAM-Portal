# Research Notes - InnovatEPAM Portal

## 1. Stack Decisions

### Next.js + React
Why:
1. Unified full-stack delivery with strong routing and rendering patterns.
2. Good fit for dashboard-style internal tools.

Tradeoff:
1. Requires clear separation between server and client components.

### Tailwind CSS + shadcn/ui
Why:
1. Fast UI composition with design token consistency.
2. shadcn/ui provides composable, accessible building blocks.

Tradeoff:
1. Requires disciplined token usage to avoid style drift.

### SQLite
Why:
1. Lightweight and easy local setup for kickoff phase.
2. Predictable relational modeling for stage workflows and attachments.

Tradeoff:
1. Not ideal for high-concurrency horizontal scaling.

### date-fns
Why:
1. Small, explicit utility functions.
2. Reliable formatting and date calculations for timelines and audit logs.

Tradeoff:
1. Must standardize formatting helpers to avoid inconsistency.

## 2. UX and Product Research Implications
1. Multi-step forms reduce cognitive load for idea submission.
2. Draft autosave reduces abandonment for long-form submissions.
3. Review transparency requires complete stage history visibility.
4. Blind review should be explicit and reversible by admins.

## 3. Security and Governance Notes
1. Role checks must be server-side for all privileged actions.
2. File uploads require strict whitelist and size validation.
3. Audit records should be immutable once persisted.

## 4. Recommended Data Shape Highlights
1. Idea table should separate current state from historical stage events.
2. Stage configuration should be admin-controlled and ordered.
3. Attachment metadata should include storage path plus logical type.

## 5. Deferred Topics
1. Automated testing strategy.
2. External identity provider integration.
3. Cloud object storage migration for attachments.

Document Version: 1.0
Last Updated: 2026-05-14

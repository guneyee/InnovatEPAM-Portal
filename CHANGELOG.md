# Changelog

All notable changes to this project are documented in this file.

## 2026-05-15

### Added
1. Phase 2: Category-driven dynamic submission fields with server-side validation.
2. Phase 4: Draft lifecycle APIs and UI (save, list, edit, submit).
3. Phase 5: Multi-stage review pipeline (Screening, Technical, Business Impact, Final Decision).
4. Phase 6: Blind review controls with evaluator identity masking on active blind stages.
5. Phase 7: Scoring system (stage score 1-10, score history, aggregated summary).
6. Admin portal pages and controls for stage configuration, stage decisions, and scoring.
7. User portal updates for dynamic forms and draft workflows.

### Changed
1. Ideas API expanded with draft, stage config, stage decision, and stage scoring endpoints.
2. Idea model expanded to support review stage state, blind flags, history, and scoring metadata.
3. Project documentation refreshed:
   - README updated to current phase implementation status.
   - PROJECT_SUMMARY updated to reflect actual delivered scope.
   - DEMO_SCRIPT updated for the current 4-6 minute walkthrough.

### Validation
1. Automated tests passing: 59/59.
2. Test suites passing: 4/4.

### Known Limitation
1. Phase 3 Multi-Media is partially complete; full multi-attachment management is still pending.
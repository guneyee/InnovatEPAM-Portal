# ADR-003: Draft Management & Dynamic Forms

## Context
Phase 2 requirement: Enable users to save draft ideas before submission. Also need to support dynamic form fields based on category.

## Decision
**Implement draft system with dynamic form fields:**
- Add `isDraft` boolean field to Idea model
- Support category-specific form schemas stored as JSON
- Auto-save drafts periodically on frontend (not implemented in MVP backend, but schema supports it)
- Store form field definitions in separate collection

## Implementation
```javascript
// Idea schema extends with:
isDraft: { type: Boolean, default: false },
formFields: [{ key, value, type }],
lastSavedAt: { type: Date, default: Date.now }

// New route: PUT /api/ideas/:id/draft
// Allows partial updates without validation
```

## Consequences
**Positive:**
- Users can recover incomplete ideas
- Form can be customized per category
- Progressive submission (no data loss)

**Negative:**
- Requires frontend state management
- Cleanup needed for old drafts (implement later)
- Schema more complex

---
**Status**: Accepted  
**Date**: 2026-05-14

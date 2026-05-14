# User Stories - InnovatEPAM Portal (SpecKit Kickoff)

## Scope Alignment
This file is aligned with:
1. FR-1 Dynamic Idea Submission
2. FR-2 Draft Management
3. FR-3 Multi-Media Attachments
4. FR-4 Multi-Stage Evaluation Workflow
5. FR-5 Blind Review Option

## Epic 1: Foundation and Access Baseline

### Story E1-S1: Project Baseline and Roles Seed
As an admin
I want the application and database baseline ready with seeded roles and default stages
So that feature development can run on a stable foundation

Acceptance Criteria:
1. App starts without runtime errors.
2. SQLite schema migration creates required core tables.
3. Seed process creates Submitter, Evaluator, Admin roles exactly once.
4. Seed process creates default stages in this order: Screening, Technical, Business Impact, Final Decision.
5. Re-running seed is idempotent (no duplicate role or stage records).

## Epic 2: Dynamic Submission (FR-1)

### Story E2-S1: Category-Driven Form Rendering
As a submitter
I want form sections to adapt based on selected category
So that I only see fields relevant to my idea type

Acceptance Criteria:
1. Category selector includes: Technical, Process Improvement, Client Solution, Other.
2. Base fields are always visible: title, summary, problem, proposed solution, impact estimate.
3. Category-specific fields appear immediately after category change without page reload.
4. Switching category preserves base field values.
5. Required fields are visually marked before submit action.

### Story E2-S2: Required Field Enforcement on Submit
As a submitter
I want strict validation when submitting an idea
So that incomplete ideas are not accepted

Acceptance Criteria:
1. Submit action fails if any required field for selected category is missing.
2. Validation errors are shown per field with actionable text.
3. No idea record is persisted when validation fails.
4. Successful submit creates idea with status set to submitted.
5. Success response includes created idea id.

## Epic 3: Draft Lifecycle (FR-2)

### Story E3-S1: Save Draft Without Full Validation
As a submitter
I want to save partial work as draft
So that I can continue later

Acceptance Criteria:
1. Draft save accepts missing required submission fields.
2. Draft record is visible in draft list immediately after save.
3. Draft record stores last autosave timestamp.
4. Draft save returns draft id and updated timestamp.
5. Saving draft does not change status to submitted.

### Story E3-S2: Edit and Submit Existing Draft
As a submitter
I want to edit an existing draft and submit it later
So that I can iterate before final submission

Acceptance Criteria:
1. Draft opens with previously saved values.
2. Draft updates are persisted after save.
3. Submit from draft enforces full submit-time validation rules.
4. Valid draft submission transitions record from draft to submitted.
5. Invalid draft submission keeps record in draft state.

## Epic 4: Multi-Media Attachments (FR-3)

### Story E4-S1: Upload Attachments with Policy Enforcement
As a submitter
I want to upload supporting files with clear limits
So that evaluators can review complete context

Acceptance Criteria:
1. System accepts maximum 5 attachments per idea.
2. Allowed mime groups are document, image, video, presentation.
3. Files larger than 25 MB are rejected before persistence.
4. Unsupported file types are rejected with explicit error reason.
5. Accepted file metadata includes file name, type, size, upload time.

### Story E4-S2: Attachment Management in Idea Form
As a submitter
I want to view and remove uploaded files before submission
So that I can keep only relevant evidence

Acceptance Criteria:
1. Attachment list displays all current files for draft/submission context.
2. Removing an attachment updates the list immediately.
3. Removed attachment metadata is no longer linked to the idea.
4. Attachment count enforcement remains valid after add and remove operations.
5. Attachments persist when returning to edit the same draft.

## Epic 5: Multi-Stage Evaluation Workflow (FR-4)

### Story E5-S1: Admin Stage Configuration
As an admin
I want to enable or disable review stages
So that workflow depth can be adjusted per governance needs

Acceptance Criteria:
1. Admin can toggle each predefined stage on or off.
2. Stage configuration changes are persisted.
3. Only enabled stages are considered in transitions.
4. Stage order remains Screening, Technical, Business Impact, Final Decision.
5. Disabled stages are skipped automatically during progression.

### Story E5-S2: Evaluator Decisions and Transitions
As an evaluator
I want to record decisions and comments per stage
So that ideas move through a transparent pipeline

Acceptance Criteria:
1. Evaluator can submit stage decision with comment.
2. Transition to next stage is allowed only when current stage is enabled and pending.
3. Invalid stage transition attempts are rejected.
4. Each decision stores evaluator id and timestamp.
5. Final decision closes the workflow in final stage.

### Story E5-S3: Chronological Stage History
As a submitter
I want to see complete stage history
So that I can understand how my idea was evaluated

Acceptance Criteria:
1. History includes stage name, decision, comment, evaluator id reference, timestamp.
2. History is sorted chronologically ascending.
3. History updates immediately after each stage decision.
4. History view contains no duplicate event rows.
5. History is visible in idea detail view.

## Epic 6: Blind Review Controls (FR-5)

### Story E6-S1: Per-Stage Blind Review Toggle
As an admin
I want to enable blind review per stage
So that evaluator bias can be reduced where needed

Acceptance Criteria:
1. Blind review can be toggled independently for each stage.
2. Toggle state is persisted with stage configuration.
3. Toggle changes affect subsequent evaluator reads for that stage.
4. Existing audit records remain unchanged.
5. Stage config view clearly indicates blind mode on or off.

### Story E6-S2: Identity Masking for Evaluators
As an evaluator
I want submitter identity hidden in blind stages
So that I can review ideas objectively

Acceptance Criteria:
1. Evaluator view hides submitter identifying fields when blind mode is active for current stage.
2. Hidden fields include name and directly identifying profile attributes.
3. Non-identifying idea content remains fully visible.
4. Admin view still contains full identity for the same idea and stage.
5. Masking behavior is applied consistently on list and detail evaluator screens.

## Story-to-Requirement Traceability
1. FR-1: E2-S1, E2-S2
2. FR-2: E3-S1, E3-S2
3. FR-3: E4-S1, E4-S2
4. FR-4: E5-S1, E5-S2, E5-S3
5. FR-5: E6-S1, E6-S2

## Story Summary
1. Total epics: 6
2. Total stories: 12
3. Current focus: kickoff alignment, implementation pending

Document Version: 2.0
Last Updated: 2026-05-15

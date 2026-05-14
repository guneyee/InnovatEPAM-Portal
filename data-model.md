# Data Model - InnovatEPAM Portal

## 1. Entity Overview
1. User
2. Idea
3. IdeaDraft
4. Attachment
5. ReviewStageConfig
6. ReviewEvent

## 2. Tables and Fields

### users
1. id (PK, uuid)
2. email (unique, not null)
3. full_name (not null)
4. role (enum: submitter, evaluator, admin)
5. created_at (datetime, not null)
6. updated_at (datetime, not null)

Constraints:
1. email unique index.
2. role check constraint.

### ideas
1. id (PK, uuid)
2. submitter_id (FK -> users.id, not null)
3. category (enum: technical, process_improvement, client_solution, other)
4. title (not null)
5. summary (not null)
6. problem_statement (not null)
7. proposed_solution (not null)
8. impact_estimate (text, nullable)
9. current_stage_key (nullable until first stage starts)
10. current_status (enum: submitted, in_review, accepted, rejected)
11. blind_review_enabled (boolean, default false)
12. created_at (datetime, not null)
13. updated_at (datetime, not null)

Constraints:
1. submitter_id foreign key required.
2. current_status check constraint.

### idea_drafts
1. id (PK, uuid)
2. submitter_id (FK -> users.id, not null)
3. category (nullable)
4. payload_json (text, not null)
5. last_autosave_at (datetime, nullable)
6. created_at (datetime, not null)
7. updated_at (datetime, not null)

Constraints:
1. submitter_id foreign key required.

### attachments
1. id (PK, uuid)
2. idea_id (FK -> ideas.id, nullable)
3. draft_id (FK -> idea_drafts.id, nullable)
4. original_name (not null)
5. mime_type (not null)
6. logical_type (enum: document, image, video, presentation)
7. size_bytes (integer, not null)
8. storage_path (not null)
9. uploaded_by (FK -> users.id, not null)
10. uploaded_at (datetime, not null)

Constraints:
1. exactly one of idea_id or draft_id must be non-null.
2. size_bytes <= 26214400.

### review_stage_config
1. id (PK, uuid)
2. stage_key (unique, not null)
3. stage_name (not null)
4. stage_order (integer, not null)
5. is_enabled (boolean, not null)
6. blind_review_allowed (boolean, not null)
7. created_at (datetime, not null)
8. updated_at (datetime, not null)

Constraints:
1. stage_order unique among enabled stages.

### review_events
1. id (PK, uuid)
2. idea_id (FK -> ideas.id, not null)
3. stage_key (not null)
4. evaluator_id (FK -> users.id, not null)
5. decision (enum: advance, reject, request_changes)
6. comment (text, nullable)
7. decided_at (datetime, not null)

Constraints:
1. append-only write policy.
2. idea_id + stage_key + evaluator_id indexed.

## 3. Relationships
1. users (1) -> (N) ideas via submitter_id.
2. users (1) -> (N) idea_drafts via submitter_id.
3. ideas (1) -> (N) attachments.
4. idea_drafts (1) -> (N) attachments.
5. ideas (1) -> (N) review_events.

## 4. State Rules
1. Idea can transition only through enabled stage order.
2. Rejected and accepted are terminal states.
3. Blind review masks submitter fields in evaluator read models only.

## 5. Migration Notes
1. Create baseline schema with all tables and indexes.
2. Seed default stage config for four stages.
3. Keep migration scripts idempotent.

Document Version: 1.0
Last Updated: 2026-05-14

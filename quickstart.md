# Quickstart - InnovatEPAM Portal

## 1. Setup
1. Install dependencies.
2. Configure environment variables.
3. Initialize SQLite database and run migrations.
4. Start development server.

Example command sequence:
1. npm install
2. cp .env.example .env
3. npm run db:migrate
4. npm run dev

## 2. Manual Validation Scenarios

### Scenario A: Submitter creates and submits an idea
1. Sign in as submitter.
2. Open new idea form.
3. Select category Technical.
4. Fill required base and category-specific fields.
5. Attach one document and one image.
6. Save as draft.
7. Re-open draft and submit.

Expected:
1. Draft appears in draft list before submit.
2. Submitted idea appears in idea list with status submitted.

### Scenario B: Admin configures stages
1. Sign in as admin.
2. Open stage configuration.
3. Disable one stage and reorder remaining enabled stages.
4. Save configuration.

Expected:
1. Stage order is persisted.
2. Evaluation flow uses updated enabled stages.

### Scenario C: Evaluator reviews with blind mode
1. Admin enables blind mode for active stage.
2. Evaluator opens assigned idea.
3. Evaluator submits decision with comment.

Expected:
1. Submitter identity is hidden from evaluator.
2. Decision appears in stage history.

### Scenario D: Attachment validation
1. Attempt upload of unsupported file type.
2. Attempt upload above size limit.

Expected:
1. Unsupported type is rejected with clear message.
2. Oversized file is rejected with clear message.

## 3. Acceptance Walkthrough Checklist
1. Dynamic fields react to category changes.
2. Draft save/edit/submit flow works.
3. Multi-stage transitions enforce order.
4. Blind review masking behaves correctly.
5. Audit timeline records all review events.

Document Version: 1.0
Last Updated: 2026-05-14

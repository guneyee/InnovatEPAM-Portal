# Specification - InnovatEPAM Portal

## 1. Problem Statement
Employees need a structured platform to submit innovation ideas while administrators need a transparent and configurable workflow to evaluate and approve high-value ideas.

## 2. Objectives
1. Capture high-quality ideas with context-aware submission inputs.
2. Enable iterative drafting before final submission.
3. Support rich attachments to improve review quality.
4. Provide configurable multi-stage admin evaluation.
5. Support optional blind review for unbiased assessment.

## 3. Users and Roles
1. Submitter: creates drafts, submits ideas, tracks status.
2. Evaluator: reviews assigned ideas in one or more stages.
3. Admin: configures stages, controls reviewer assignment, finalizes outcomes.

## 4. Functional Requirements

### FR-1 Dynamic Idea Submission
1. System shall provide category selection: Technical, Process Improvement, Client Solution, Other.
2. System shall show base fields for all categories: title, summary, problem, proposed solution, impact estimate.
3. System shall render category-specific fields based on selected category.
4. System shall prevent submission when required fields are missing.

Acceptance criteria:
1. Changing category updates the form sections in real time.
2. Required fields are visually indicated and validated before submit.

### FR-2 Draft Management
1. System shall allow saving an idea as draft without full required-field enforcement.
2. System shall allow editing an existing draft.
3. System shall allow converting draft to submitted idea.
4. System shall persist draft autosave timestamp.

Acceptance criteria:
1. Draft appears in submitter draft list immediately after save.
2. Submitting draft applies full validation rules.

### FR-3 Multi-Media Attachments
1. System shall accept up to 5 attachments per idea.
2. System shall support mime groups: document, image, video, presentation.
3. System shall enforce max size 25 MB per file.
4. System shall store metadata: file name, type, size, upload time.

Acceptance criteria:
1. Unsupported file types are rejected with actionable error.
2. Oversized files are rejected before persistence.

### FR-4 Multi-Stage Evaluation Workflow
1. System shall support configurable stages: Screening, Technical, Business Impact, Final Decision.
2. Admin shall be able to enable/disable stages.
3. Idea shall progress only to the next enabled stage.
4. System shall record stage decision, comment, evaluator id, timestamp.

Acceptance criteria:
1. Invalid stage transition is blocked.
2. Stage history is visible in chronological order.

### FR-5 Blind Review Option
1. Admin shall be able to enable blind review mode per stage.
2. In blind mode, evaluator view shall hide submitter identifying data.
3. Audit log shall retain submitter identity for admins.

Acceptance criteria:
1. Evaluator cannot see submitter identity fields when blind mode is enabled.
2. Admin can still access full record for governance.

## 5. Non-Functional Requirements
1. Responsive UI on modern desktop and mobile browsers.
2. Role-based access control on all restricted actions.
3. SQLite persistence with migration-safe schema updates.
4. Date/time rendering via date-fns in consistent locale format.

## 6. Assumptions
1. Internal users authenticate through project-local auth for now.
2. File storage is local filesystem in kickoff stage.
3. Single-tenant deployment model.

## 7. Open Questions
1. Should blind review apply to all stages or only selected stages?
2. Do admins need weighted scoring in this phase or a later phase?
3. Should attachments be virus-scanned in current scope?

Document Version: 1.0
Last Updated: 2026-05-14

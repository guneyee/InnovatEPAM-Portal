# Specification - InnovatEPAM Portal

## Problem Statement
Employees need a structured portal to submit innovation ideas, and administrators need a transparent way to review and manage those ideas.

## Objectives
1. Allow employees to register and authenticate.
2. Let submitters create ideas with required fields and attachments.
3. Let users view submitted ideas.
4. Let admins review ideas and update their status.
5. Keep the workflow simple and manual-validation friendly.

## Users and Roles
1. Submitter: creates and tracks ideas.
2. Admin/Evaluator: reviews ideas and updates status.

## Functional Requirements

### FR-1 User Authentication
1. System shall support registration with email and password.
2. System shall support login and logout.
3. System shall distinguish submitters from admins/evaluators.

Acceptance criteria:
1. Users can register successfully.
2. Valid credentials produce a session/token.
3. Roles control access to privileged actions.

### FR-2 Idea Submission
1. System shall provide a form for title, description, and category.
2. System shall support a single file attachment per idea.
3. System shall validate required fields before submission.

Acceptance criteria:
1. A valid idea can be submitted.
2. Missing required fields are rejected.
3. Unsupported attachments are rejected.

### FR-3 Idea Listing and Viewing
1. System shall list submitted ideas.
2. System shall show idea details.
3. System shall show the current status of each idea.

Acceptance criteria:
1. Submitters can view their ideas.
2. Admins can view all ideas.
3. Idea details include status.

### FR-4 Evaluation Workflow
1. System shall support idea statuses: submitted, under review, accepted, rejected.
2. Admins shall be able to update the status of an idea.
3. Admins shall be able to leave comments during evaluation.

Acceptance criteria:
1. Status updates follow allowed transitions.
2. Comments are saved with the review action.
3. Privileged actions require admin access.

## Non-Functional Requirements
1. Responsive UI on desktop and mobile.
2. Clear validation and error messaging.
3. Secure authentication and role checks.
4. Maintainable code structure.

## Assumptions
1. Local development and demo are sufficient.
2. File storage may be local for the MVP.
3. No external deployment is required.

## Open Questions
1. Should future phases include drafts and multi-stage review?
2. Should blind review be planned now or later?
3. Should attachments remain single-file only in Phase 1?
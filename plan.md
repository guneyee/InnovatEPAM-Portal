# Implementation Plan - InnovatEPAM Portal

## 1. Scope
Deliver the core platform increment covering dynamic submission, drafts, attachments, multi-stage evaluation, and blind review controls.

## 2. Delivery Phases

### Phase A - Foundation
1. Bootstrap Next.js app shell and layout.
2. Configure Tailwind theme tokens and shadcn/ui.
3. Set up SQLite connection and baseline schema.

Exit criteria:
1. App boots and renders core layout.
2. Database tables can be created from migration script.

### Phase B - Submission and Drafts
1. Implement dynamic submission form.
2. Implement draft save/edit/submit flows.
3. Implement attachment upload and metadata persistence.

Exit criteria:
1. Submitter can complete full end-to-end draft to submit scenario.

### Phase C - Evaluation Workflow
1. Implement stage configuration for admins.
2. Implement evaluator review actions.
3. Implement stage transition and history logging.

Exit criteria:
1. Admin can run idea through all enabled stages.

### Phase D - Blind Review and Hardening
1. Implement blind review toggle per stage.
2. Apply conditional identity masking for evaluator views.
3. Perform manual validation via quickstart scenarios.

Exit criteria:
1. Blind review behavior validated in role-specific walkthrough.

## 3. Dependencies
1. Next.js, React, Tailwind CSS, shadcn/ui.
2. SQLite driver and migration tool.
3. date-fns for date formatting.

## 4. Risks and Mitigation
1. Dynamic form complexity
   - Mitigation: use schema-driven field config and strict category mappings.
2. Attachment security risk
   - Mitigation: whitelist mime types and enforce strict size limits.
3. Workflow drift
   - Mitigation: centralize stage transition policy in one module.

## 5. Tracking
Current status:
1. Constitution drafted.
2. Spec drafted.
3. Research documented.
4. Data model pending implementation.
5. Tasks ready for execution.

## 6. Milestone Checklist
1. M1: Foundation complete.
2. M2: Submission + drafts complete.
3. M3: Evaluation stages complete.
4. M4: Blind review complete.
5. M5: Manual acceptance walkthrough complete.

Document Version: 1.0
Last Updated: 2026-05-14

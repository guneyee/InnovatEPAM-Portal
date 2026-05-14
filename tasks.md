# Tasks - InnovatEPAM Portal

## Task Legend
1. Priority: P0 critical, P1 high, P2 normal.
2. Status: Todo, In Progress, Done.

## Epic 1 - Foundation Setup
1. [Todo][P0] Initialize Next.js app scaffold and app router structure.
2. [Todo][P0] Configure Tailwind theme tokens and base styles.
3. [Todo][P0] Install and configure shadcn/ui components baseline.
4. [Todo][P0] Configure SQLite connection and migration tooling.
5. [Todo][P1] Seed default roles and default review stage config.

Done criteria:
1. App starts successfully.
2. Database schema can be created and seeded.

## Epic 2 - Dynamic Submission and Drafts
1. [Todo][P0] Implement category selector and schema-driven dynamic fields.
2. [Todo][P0] Implement submitter draft list page.
3. [Todo][P0] Implement save draft endpoint and autosave timestamp updates.
4. [Todo][P0] Implement edit draft and submit draft flow.
5. [Todo][P1] Implement validation message UX for missing required fields.

Done criteria:
1. Submitter can save, edit, and submit drafts successfully.

## Epic 3 - Attachments
1. [Todo][P0] Implement attachment upload endpoint with type and size validation.
2. [Todo][P0] Persist attachment metadata in attachments table.
3. [Todo][P1] Implement attachment list and removal in idea form.
4. [Todo][P1] Implement server-side mapping of mime type to logical type.

Done criteria:
1. Allowed files upload successfully.
2. Invalid files are rejected with explicit reason.

## Epic 4 - Evaluation Workflow
1. [Todo][P0] Build admin stage configuration UI and persistence.
2. [Todo][P0] Implement stage transition policy service.
3. [Todo][P0] Build evaluator review screen and decision actions.
4. [Todo][P1] Persist review events with timestamp and comments.
5. [Todo][P1] Build idea timeline history component.

Done criteria:
1. Idea progresses through enabled stages only.
2. History shows all decisions in order.

## Epic 5 - Blind Review
1. [Todo][P0] Add per-stage blind review toggle in admin config.
2. [Todo][P0] Implement evaluator read model masking submitter identity.
3. [Todo][P1] Ensure admin read model still includes full identity fields.
4. [Todo][P1] Add audit log note when blind mode is active.

Done criteria:
1. Evaluator cannot view submitter identifying fields during blind stages.
2. Admin retains full visibility.

## Epic 6 - Manual Acceptance and Polish
1. [Todo][P1] Execute quickstart scenarios A-D and record results.
2. [Todo][P1] Verify responsive behavior across desktop and mobile breakpoints.
3. [Todo][P1] Verify role restrictions for all privileged actions.
4. [Todo][P2] Polish empty states, loading states, and error text.

Done criteria:
1. All quickstart scenarios pass.
2. No critical UX or security blockers remain.

## Requirement Coverage Matrix
1. FR-1 -> Epic 2 tasks 1 and 5.
2. FR-2 -> Epic 2 tasks 2 to 4.
3. FR-3 -> Epic 3 tasks 1 to 4.
4. FR-4 -> Epic 4 tasks 1 to 5.
5. FR-5 -> Epic 5 tasks 1 to 4.

Document Version: 1.0
Last Updated: 2026-05-14

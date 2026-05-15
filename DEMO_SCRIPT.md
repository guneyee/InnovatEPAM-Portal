# InnovatEPAM Portal - Demo Script (4-6 minutes)

## 1. Intro (20-30 seconds)
"Hi, this is InnovatEPAM Portal. It is an idea management platform built with AI-assisted Spec-Driven Development. I will show the live workflow, the implemented advanced phases, and test evidence."

## 2. Current Build Status (30 seconds)
What is implemented now:
1. Phase 1 Core Portal: complete
2. Phase 2 Smart Submission Forms: complete
3. Phase 3 Multi-Media: partial (single attachment flow active)
4. Phase 4 Draft Management: complete
5. Phase 5 Multi-Stage Review: complete
6. Phase 6 Blind Review: complete
7. Phase 7 Scoring System: complete

Quality snapshot:
1. 59/59 tests passing
2. 4/4 test suites passing

## 3. Live Demo Flow (2-3 minutes)

### Step A - User Submission with Dynamic Form
1. Open /user
2. Login as submitter
3. Change category and show dynamic required fields
4. Save as draft first
5. Load draft, finalize fields, submit

Talking point:
"This demonstrates Phase 2 and Phase 4 together: adaptive fields and draft lifecycle."

### Step B - Admin Multi-Stage Review
1. Open /admin
2. Login as admin
3. Load ideas
4. Show stage config panel (enable/disable and blind toggles)
5. Approve current stage to move Screening -> Technical

Talking point:
"This is Phase 5: a real 4-stage pipeline with ordered transitions and stage history."

### Step C - Blind Review + Scoring
1. Keep a stage in blind mode
2. Mention evaluator view masks submitter identity on active blind stage
3. Enter stage score (1-10)
4. Apply score and show score summary update

Talking point:
"This is Phase 6 and Phase 7: identity masking in evaluator context and stage-level scoring with aggregate summary."

## 4. API Highlights (45 seconds)
Show these implemented endpoints quickly:
1. POST /api/ideas/drafts
2. GET /api/ideas/drafts
3. POST /api/ideas/drafts/:id/submit
4. GET /api/ideas/stages/config
5. PUT /api/ideas/stages/config
6. PUT /api/ideas/:id/stages/decision
7. PUT /api/ideas/:id/stages/score

Short note:
"The API now supports complete draft, staged review, blind mode, and scoring workflows."

## 5. Test Proof (30-45 seconds)
Run:
```bash
npm test -- --runInBand
```

Expected key output to mention:
1. Test Suites: 4 passed, 4 total
2. Tests: 59 passed, 59 total

Optional callout:
"Integration tests include auth, idea lifecycle, drafts, multi-stage review, blind review, and scoring."

## 6. Known Gap (10 seconds)
"Phase 3 is partially complete: single attachment exists, but full multi-attachment management is the next increment."

## 7. Closing (20 seconds)
"This delivery proves an end-to-end portal with advanced workflow controls and strong automated validation. Specs + tests + AI gave fast delivery without losing traceability or quality."

## 8. Q&A Ready Answers
Why no deployment requirement?
1. Local demo is acceptable for this lab.
2. The app remains usable even if Atlas is unavailable because fallback mode is implemented.

How is blind review enforced?
1. Stage has a blind toggle.
2. Evaluator sees masked identity on active blind stage.
3. Admin retains full visibility.

How is score calculated?
1. Stage scores are stored per stage decision context.
2. Aggregate summary includes total, stage count, average, and per-stage map.

---

Prepared for: Module 08 Capstone Demo

# Quickstart - InnovatEPAM Portal

## Prerequisites

1. Node.js installed locally
2. npm available in the shell
3. Optional MongoDB instance for database-backed runtime

## Setup

1. Run `npm install`
2. Start the backend with `npm start` or the full stack with `npm run dev:full`
3. Optional: build the React app with `npm run client:build`

## Manual Validation

### Scenario 1: Health Check

1. Open `http://localhost:3000/`
2. Trigger the health check action on the home page
3. Confirm `/health` returns status and timestamp

Expected:

1. Status displays `OK`
2. Timestamp is rendered without a server error

### Scenario 2: Submitter Registration and Login

1. Open `http://localhost:3000/user`
2. Register a new submitter email and password
3. Login with the same credentials

Expected:

1. Registration succeeds or returns a clear duplicate-email message
2. Login returns a token-backed authenticated state
3. The page shows the current role as submitter

### Scenario 3: Draft Save and Final Submission

1. Stay on `http://localhost:3000/user`
2. Fill title, description, category, and category-specific fields
3. Save a draft
4. Reload drafts and re-open the saved draft
5. Submit the draft or submit a new idea directly

Expected:

1. Draft save succeeds without requiring every final field immediately
2. Draft list shows only the current user drafts
3. Final submission returns an idea id and `submitted` status

### Scenario 4: Idea Listing and Detail View

1. Load ideas on the user page or main page
2. Select a created idea from the list
3. Inspect description, category, status, and attachment handling

Expected:

1. The idea list loads without authorization errors for the logged-in user
2. Detail view shows the selected idea metadata
3. Attachments preview or download correctly when present

### Scenario 5: Admin Review Workflow

1. Open `http://localhost:3000/admin`
2. Login with `admin@epam.com` / `Admin1234!`
3. Load stage configuration and ideas
4. Score or approve/reject the current stage
5. Update overall status when appropriate

Expected:

1. Admin login succeeds
2. Stage configuration loads for privileged users
3. Stage decisions and scores are persisted
4. Status transitions follow allowed workflow rules

### Scenario 6: React Frontend Entry

1. Open `http://localhost:5173/` during `npm run dev:full` or `http://localhost:3000/app` after build
2. Trigger the React health check button

Expected:

1. The React app loads successfully
2. The health request reaches the backend and returns a success state

## Automated Validation

1. Run `npm run lint`
2. Run `npm test -- --runInBand`
3. Run `npm run client:build` when frontend files change
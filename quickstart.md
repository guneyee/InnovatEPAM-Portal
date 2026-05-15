# Quickstart - InnovatEPAM Portal

## Setup
1. Install dependencies with `npm install`.
2. Start the app with `npm start`.
3. Open the portal at `http://localhost:3000/`.

## Demo Routes
1. Home: `http://localhost:3000/`
2. User Portal: `http://localhost:3000/user`
3. Admin Portal: `http://localhost:3000/admin`
4. React App: `http://localhost:3000/app`
5. Speckit Proof: `http://localhost:3000/speckit-proof`
6. MCP Proof: `http://localhost:3000/mcp-proof`

## Manual Validation Scenarios

### Scenario A: Register and Login
1. Open the User Portal.
2. Create a new submitter account with a fresh email.
3. Log in with that account.

Expected:
1. Authentication succeeds.
2. A session token is issued.
3. The user can access draft and submission actions.

### Scenario B: Draft Lifecycle
1. Enter a title, category, and partial description.
2. Save the idea as a draft.
3. Load drafts back into the form.
4. Reopen the saved draft.

Expected:
1. A draft ID is returned.
2. The draft appears in the draft selector.
3. Partial data is restored into the form.

### Scenario C: Category-Aware Submission
1. Change the category to `Technical`.
2. Fill in the required category-specific fields.
3. Optionally attach one JPG or PNG file.
4. Submit the idea.

Expected:
1. Validation enforces category-specific fields.
2. The idea is created successfully.
3. Initial status is `submitted`.

### Scenario D: Admin Stage Configuration
1. Open the Admin Portal.
2. Log in with `admin@epam.com` / `Admin1234!`.
3. Load stage configuration.
4. Toggle stage enablement or blind mode.
5. Save the configuration.

Expected:
1. Stage configuration loads successfully.
2. Changes persist after save.
3. Blind mode can be enabled per stage.

### Scenario E: Multi-Stage Review and Scoring
1. Load submitted ideas in the Admin Portal.
2. Select an idea that is in review flow.
3. Enter a stage score between 1 and 10.
4. Approve the current stage.

Expected:
1. The idea advances to the next enabled stage.
2. Stage history grows by one event.
3. Score summary reflects the applied score.

### Scenario F: Proof Pages
1. Open the Speckit Proof page.
2. Open the MCP Proof page.

Expected:
1. Speckit artifacts and prerequisite output are visible.
2. MCP usage evidence is visible from the browser.

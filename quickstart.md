# Quickstart - InnovatEPAM Portal

## Setup
1. Install dependencies.
2. Configure environment variables.
3. Start the app locally.

## Manual Validation Scenarios

### Scenario A: Register and Login
1. Create a user account.
2. Log in with valid credentials.
3. Confirm role-based access.

Expected:
1. User can log in successfully.
2. Session/token is issued.

### Scenario B: Submit Idea
1. Open the submission form.
2. Enter title, description, and category.
3. Attach one file.
4. Submit the idea.

Expected:
1. Idea is created.
2. Status is submitted.

### Scenario C: View Ideas
1. Open the idea list.
2. Open a submitted idea.

Expected:
1. Ideas are displayed.
2. Details include status and attachment info.

### Scenario D: Admin Review
1. Log in as admin.
2. Open an idea.
3. Change its status and add a comment.

Expected:
1. Status changes are saved.
2. Comment is recorded.

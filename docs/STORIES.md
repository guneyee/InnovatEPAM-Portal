# User Stories - InnovatEPAM Portal Phase 1

## Epic 1: User Management

### Story 1.1: User Registration
**As a** new employee  
**I want to** register for an account with email and password  
**So that** I can access the innovation portal

**Acceptance Criteria:**
- [ ] Registration endpoint validates email format
- [ ] Password must be 8+ characters
- [ ] Duplicate emails rejected
- [ ] User created in database with hashed password
- [ ] Returns success response with user ID

**Definition of Done:**
- [ ] Implementation complete
- [ ] Tests passing (>80% coverage for this feature)
- [ ] Endpoint documented
- [ ] Code reviewed & committed

---

### Story 1.2: User Login
**As a** registered user  
**I want to** log in with email and password  
**So that** I can access my account

**Acceptance Criteria:**
- [ ] Login endpoint validates credentials
- [ ] Invalid credentials return 401
- [ ] Successful login returns JWT token
- [ ] JWT contains user ID and role
- [ ] Token can be used for authenticated requests

**Definition of Done:**
- [ ] Implementation complete
- [ ] Tests passing (>80% coverage)
- [ ] Endpoint documented
- [ ] Code reviewed & committed

---

### Story 1.3: User Logout
**As a** logged-in user  
**I want to** log out securely  
**So that** my session ends

**Acceptance Criteria:**
- [ ] Logout endpoint invalidates session
- [ ] Subsequent requests with old token rejected
- [ ] Returns success response

**Definition of Done:**
- [ ] Implementation complete
- [ ] Tests passing
- [ ] Code committed

---

## Epic 2: Idea Submission

### Story 2.1: Submission Form (UI + Backend)
**As a** submitter  
**I want to** fill out an idea submission form with title, description, and category  
**So that** I can propose my innovation

**Acceptance Criteria:**
- [ ] Form accepts title (1-100 chars), description (10-2000 chars), category
- [ ] Backend validates all fields
- [ ] Idea created with status "submitted"
- [ ] Submitter ID recorded
- [ ] Returns success with idea ID

**Definition of Done:**
- [ ] Implementation complete
- [ ] Tests passing
- [ ] Form tested with valid/invalid inputs
- [ ] Code committed

---

### Story 2.2: File Attachment
**As a** submitter  
**I want to** attach a single file to my idea (PDF, images, docs)  
**So that** I can provide supporting materials

**Acceptance Criteria:**
- [ ] Endpoint accepts file upload (max 10MB)
- [ ] Allowed types: pdf, jpg, png, docx, xlsx
- [ ] File stored securely
- [ ] File path recorded in idea document
- [ ] Returns file metadata (name, size, type)

**Definition of Done:**
- [ ] Implementation complete
- [ ] Tests passing
- [ ] Security checks in place
- [ ] Code committed

---

### Story 2.3: Idea Listing
**As a** user  
**I want to** view a list of all submitted ideas  
**So that** I can see what's been proposed

**Acceptance Criteria:**
- [ ] Listing returns all ideas with basic info (title, submitter, status, date)
- [ ] Pagination supported (10 per page)
- [ ] Filtering by status works
- [ ] Returns 200 OK

**Definition of Done:**
- [ ] Implementation complete
- [ ] Tests passing
- [ ] Code committed

---

### Story 2.4: Idea Viewing
**As a** user  
**I want to** view full details of a specific idea  
**So that** I can read the complete proposal

**Acceptance Criteria:**
- [ ] Endpoint returns full idea details (title, description, category, file, submitter, status)
- [ ] File attachment info included
- [ ] Returns 404 if idea not found
- [ ] Returns 200 OK with idea data

**Definition of Done:**
- [ ] Implementation complete
- [ ] Tests passing
- [ ] Code committed

---

## Epic 3: Evaluation Workflow

### Story 3.1: Admin Review & Status Tracking
**As an** admin  
**I want to** review submitted ideas and change their status  
**So that** I can manage the evaluation workflow

**Acceptance Criteria:**
- [ ] Admin can transition status: submitted → under_review → accepted/rejected
- [ ] Admin can add comments on review
- [ ] Comments visible to submitter
- [ ] Status changes logged
- [ ] Invalid transitions rejected

**Definition of Done:**
- [ ] Implementation complete
- [ ] Tests passing (including invalid transitions)
- [ ] Code committed

---

### Story 3.2: Status History
**As a** submitter  
**I want to** see the status history of my idea  
**So that** I know what happened with my proposal

**Acceptance Criteria:**
- [ ] Idea includes status history array
- [ ] Each status change timestamped
- [ ] Admin comments included in history
- [ ] History visible in idea details

**Definition of Done:**
- [ ] Implementation complete
- [ ] Tests passing
- [ ] Code committed

---

## Implementation Notes
- JWT tokens expire in 7 days
- Role validation middleware required for admin-only endpoints
- File uploads stored in `./uploads/` directory
- Status transitions: submitted → under_review, then → (accepted OR rejected)
- All endpoints return JSON responses

---
**Total Stories**: 8  
**Estimated MVP Time**: 8.5 hours  
**Sprint**: Module 08

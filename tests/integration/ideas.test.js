const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Idea = require('../../src/models/Idea');
const jwt = require('jsonwebtoken');

let authToken;
let userId;
let adminToken;
let adminUserId;
let evaluatorToken;
let evaluatorUserId;

beforeEach(async () => {
  // Create regular user for testing
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      email: 'submitter@example.com',
      password: 'password123'
    });

  userId = res.body.user.id;
  authToken = jwt.sign(
    { userId: userId, email: 'submitter@example.com', role: 'submitter' },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  );

  // Create admin user
  const adminRes = await request(app)
    .post('/api/auth/register')
    .send({
      email: 'admin@example.com',
      password: 'password123'
    });

  adminUserId = adminRes.body.user.id;
  // Update to admin role in database
  await User.findByIdAndUpdate(adminUserId, { role: 'admin' });

  adminToken = jwt.sign(
    { userId: adminUserId, email: 'admin@example.com', role: 'admin' },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  );

  const evaluatorRes = await request(app)
    .post('/api/auth/register')
    .send({
      email: 'evaluator@example.com',
      password: 'password123'
    });

  evaluatorUserId = evaluatorRes.body.user.id;
  await User.findByIdAndUpdate(evaluatorUserId, { role: 'evaluator' });

  evaluatorToken = jwt.sign(
    { userId: evaluatorUserId, email: 'evaluator@example.com', role: 'evaluator' },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  );
});

describe('POST /api/ideas - Idea Submission', () => {
  it('should submit idea with required fields', async () => {
    const res = await request(app)
      .post('/api/ideas')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'New Idea',
        description: 'This is a detailed description of my innovation idea.',
        category: 'Technology'
      });

    expect(res.status).toBe(201);
    expect(res.body.idea).toBeDefined();
    expect(res.body.idea.title).toBe('New Idea');
    expect(res.body.idea.status).toBe('submitted');
  });

  it('should reject submission without authentication', async () => {
    const res = await request(app)
      .post('/api/ideas')
      .send({
        title: 'Unauth Idea',
        description: 'This should fail without token.',
        category: 'Technology'
      });

    expect(res.status).toBe(401);
  });

  it('should reject missing title', async () => {
    const res = await request(app)
      .post('/api/ideas')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        description: 'Description here',
        category: 'Technology'
      });

    expect(res.status).toBe(400);
  });

  it('should reject missing description', async () => {
    const res = await request(app)
      .post('/api/ideas')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Title',
        category: 'Technology'
      });

    expect(res.status).toBe(400);
  });

  it('should reject description shorter than 10 characters', async () => {
    const res = await request(app)
      .post('/api/ideas')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Title',
        description: 'Short',
        category: 'Technology'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('10-2000');
  });

  it('should reject title longer than 100 characters', async () => {
    const longTitle = 'a'.repeat(101);
    const res = await request(app)
      .post('/api/ideas')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: longTitle,
        description: 'This is a valid description.',
        category: 'Technology'
      });

    expect(res.status).toBe(400);
  });

  it('should record initial status in history', async () => {
    const res = await request(app)
      .post('/api/ideas')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test',
        description: 'This is a detailed test description.',
        category: 'Process'
      });

    const idea = await Idea.findById(res.body.idea.id);
    expect(idea.statusHistory).toBeDefined();
    expect(idea.statusHistory.length).toBeGreaterThan(0);
    expect(idea.statusHistory[0].newStatus).toBe('submitted');
  });

  it('should reject technical idea when category-specific fields are missing', async () => {
    const res = await request(app)
      .post('/api/ideas')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Tech Idea Missing Details',
        description: 'This description is long enough but technical details are missing.',
        category: 'Technical'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Missing required Technical fields');
  });

  it('should submit technical idea when category-specific fields are provided', async () => {
    const res = await request(app)
      .post('/api/ideas')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Tech Idea With Details',
        description: 'This idea includes all required category-specific fields for technical submission.',
        category: 'Technical',
        categoryDetails: {
          techStack: 'Node.js and MongoDB',
          complexity: 'Medium'
        }
      });

    expect(res.status).toBe(201);
    expect(res.body.idea).toBeDefined();
  });
});

describe('GET /api/ideas - Idea Listing', () => {
  beforeEach(async () => {
    // Create test ideas
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/ideas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: `Idea ${i}`,
          description: `This is description number ${i} for testing listings.`,
          category: 'Technology'
        });
    }
  });

  it('should list all ideas with pagination', async () => {
    const res = await request(app)
      .get('/api/ideas')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.ideas)).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBeGreaterThan(0);
  });

  it('should require authentication', async () => {
    const res = await request(app)
      .get('/api/ideas');

    expect(res.status).toBe(401);
  });

  it('should support pagination', async () => {
    const res = await request(app)
      .get('/api/ideas?page=1')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(1);
  });

  it('should filter by status', async () => {
    const res = await request(app)
      .get('/api/ideas?status=submitted')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    res.body.ideas.forEach(idea => {
      expect(idea.status).toBe('submitted');
    });
  });
});

describe('GET /api/ideas/:id - Idea Details', () => {
  let ideaId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/ideas')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Details Test',
        description: 'This is a test idea for viewing details.',
        category: 'Innovation'
      });

    ideaId = res.body.idea.id;
  });

  it('should retrieve full idea details', async () => {
    const res = await request(app)
      .get(`/api/ideas/${ideaId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.idea).toBeDefined();
    expect(res.body.idea.title).toBe('Details Test');
    expect(res.body.idea.description).toBeDefined();
    expect(res.body.idea.status).toBe('submitted');
  });

  it('should return 404 for nonexistent idea', async () => {
    const res = await request(app)
      .get('/api/ideas/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(404);
  });

  it('should require authentication', async () => {
    const res = await request(app)
      .get(`/api/ideas/${ideaId}`);

    expect(res.status).toBe(401);
  });
});

describe('Draft Management', () => {
  it('should save a draft without full required submission fields', async () => {
    const res = await request(app)
      .post('/api/ideas/drafts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Draft title only',
        category: 'Technical'
      });

    expect(res.status).toBe(201);
    expect(res.body.draft).toBeDefined();
    expect(res.body.draft.status).toBe('draft');
  });

  it('should list only current user drafts', async () => {
    await request(app)
      .post('/api/ideas/drafts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'My Draft', category: 'Other' });

    const res = await request(app)
      .get('/api/ideas/drafts')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.drafts)).toBe(true);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
    res.body.drafts.forEach((draft) => {
      expect(draft.status).toBe('draft');
    });
  });

  it('should submit a valid draft and transition it to submitted', async () => {
    const draftRes = await request(app)
      .post('/api/ideas/drafts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Technical draft',
        description: 'This draft is ready for final submission with all required details.',
        category: 'Technical',
        techStack: 'Node.js + MongoDB',
        complexity: 'Medium'
      });

    const draftId = draftRes.body.draft.id;
    const submitRes = await request(app)
      .post(`/api/ideas/drafts/${draftId}/submit`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({});

    expect(submitRes.status).toBe(200);
    expect(submitRes.body.idea.status).toBe('submitted');
  });

  it('should reject draft submission when required fields are still missing', async () => {
    const draftRes = await request(app)
      .post('/api/ideas/drafts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Incomplete technical draft',
        category: 'Technical'
      });

    const draftId = draftRes.body.draft.id;
    const submitRes = await request(app)
      .post(`/api/ideas/drafts/${draftId}/submit`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({});

    expect(submitRes.status).toBe(400);
  });
});

describe('Multi-Stage Review Workflow', () => {
  let ideaId;

  beforeEach(async () => {
    await request(app)
      .put('/api/ideas/stages/config')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        stages: [
          { name: 'Screening', enabled: true },
          { name: 'Technical', enabled: true },
          { name: 'Business Impact', enabled: true },
          { name: 'Final Decision', enabled: true }
        ]
      });

    const createRes = await request(app)
      .post('/api/ideas')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Pipeline Test Idea',
        description: 'This idea is used to test the four-stage review workflow pipeline behavior.',
        category: 'Technical',
        techStack: 'Node.js + MongoDB',
        complexity: 'Medium'
      });
    ideaId = createRes.body.idea.id;
  });

  it('should expose default 4-stage configuration', async () => {
    const res = await request(app)
      .get('/api/ideas/stages/config')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.stages)).toBe(true);
    expect(res.body.stages.length).toBe(4);
    expect(res.body.stages[0].name).toBe('Screening');
  });

  it('should advance to accepted after approving all enabled stages', async () => {
    for (let i = 0; i < 4; i += 1) {
      const decisionRes = await request(app)
        .put(`/api/ideas/${ideaId}/stages/decision`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ decision: 'approve', comment: `Approved stage ${i + 1}` });

      expect(decisionRes.status).toBe(200);
    }

    const ideaRes = await request(app)
      .get(`/api/ideas/${ideaId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(ideaRes.status).toBe(200);
    expect(ideaRes.body.idea.status).toBe('accepted');
    expect(ideaRes.body.idea.currentStage).toBeNull();
    expect((ideaRes.body.idea.stageHistory || []).length).toBe(4);
  });

  it('should reject pipeline immediately when a stage decision is reject', async () => {
    const decisionRes = await request(app)
      .put(`/api/ideas/${ideaId}/stages/decision`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ decision: 'reject', comment: 'Failed screening' });

    expect(decisionRes.status).toBe(200);
    expect(decisionRes.body.idea.status).toBe('rejected');
    expect(decisionRes.body.idea.currentStage).toBeNull();
  });

  it('should allow admin to disable a stage and skip it in progression', async () => {
    const configRes = await request(app)
      .put('/api/ideas/stages/config')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        stages: [
          { name: 'Technical', enabled: false }
        ]
      });

    expect(configRes.status).toBe(200);

    // approve screening
    const firstDecision = await request(app)
      .put(`/api/ideas/${ideaId}/stages/decision`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ decision: 'approve' });

    expect(firstDecision.status).toBe(200);
    expect(firstDecision.body.idea.currentStage).toBe('Business Impact');
  });

  it('should mask submitter identity for evaluator when blind mode is active on current stage', async () => {
    const configRes = await request(app)
      .put('/api/ideas/stages/config')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        stages: [
          { name: 'Screening', enabled: true, blind: true },
          { name: 'Technical', enabled: true, blind: false },
          { name: 'Business Impact', enabled: true, blind: false },
          { name: 'Final Decision', enabled: true, blind: false }
        ]
      });

    expect(configRes.status).toBe(200);

    const detailRes = await request(app)
      .get(`/api/ideas/${ideaId}`)
      .set('Authorization', `Bearer ${evaluatorToken}`);

    expect(detailRes.status).toBe(200);
    expect(detailRes.body.idea.submitterEmail).toBe('hidden-for-blind-review');

    const listRes = await request(app)
      .get('/api/ideas')
      .set('Authorization', `Bearer ${evaluatorToken}`);

    expect(listRes.status).toBe(200);
    const listed = listRes.body.ideas.find((item) => String(item._id) === String(ideaId));
    expect(listed).toBeDefined();
    expect(listed.submitterEmail).toBe('hidden-for-blind-review');
  });

  it('should keep submitter identity visible for admin even when blind mode is active', async () => {
    await request(app)
      .put('/api/ideas/stages/config')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        stages: [
          { name: 'Screening', enabled: true, blind: true },
          { name: 'Technical', enabled: true, blind: false },
          { name: 'Business Impact', enabled: true, blind: false },
          { name: 'Final Decision', enabled: true, blind: false }
        ]
      });

    const detailRes = await request(app)
      .get(`/api/ideas/${ideaId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(detailRes.status).toBe(200);
    expect(detailRes.body.idea.submitterEmail).toBe('submitter@example.com');
  });
});

describe('Scoring System', () => {
  let ideaId;

  beforeEach(async () => {
    await request(app)
      .put('/api/ideas/stages/config')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        stages: [
          { name: 'Screening', enabled: true, blind: false },
          { name: 'Technical', enabled: true, blind: false },
          { name: 'Business Impact', enabled: true, blind: false },
          { name: 'Final Decision', enabled: true, blind: false }
        ]
      });

    const createRes = await request(app)
      .post('/api/ideas')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Scoring Test Idea',
        description: 'This idea validates scoring endpoint behavior and aggregate score summary.',
        category: 'Technical',
        techStack: 'Node.js',
        complexity: 'Medium'
      });
    ideaId = createRes.body.idea.id;
  });

  it('should allow evaluator to score current stage', async () => {
    const scoreRes = await request(app)
      .put(`/api/ideas/${ideaId}/stages/score`)
      .set('Authorization', `Bearer ${evaluatorToken}`)
      .send({ score: 8, comment: 'Strong early-stage potential' });

    expect(scoreRes.status).toBe(200);
    expect(scoreRes.body.idea.scoreSummary.averageScore).toBe(8);
    expect(scoreRes.body.idea.scoreSummary.scoredStages).toBe(1);
  });

  it('should reject invalid score values', async () => {
    const scoreRes = await request(app)
      .put(`/api/ideas/${ideaId}/stages/score`)
      .set('Authorization', `Bearer ${evaluatorToken}`)
      .send({ score: 11 });

    expect(scoreRes.status).toBe(400);
    expect(scoreRes.body.error).toContain('between 1 and 10');
  });

  it('should compute aggregate average score across multiple stages', async () => {
    await request(app)
      .put(`/api/ideas/${ideaId}/stages/score`)
      .set('Authorization', `Bearer ${evaluatorToken}`)
      .send({ score: 8 });

    await request(app)
      .put(`/api/ideas/${ideaId}/stages/decision`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ decision: 'approve' });

    const secondScore = await request(app)
      .put(`/api/ideas/${ideaId}/stages/score`)
      .set('Authorization', `Bearer ${evaluatorToken}`)
      .send({ score: 6 });

    expect(secondScore.status).toBe(200);
    expect(secondScore.body.idea.scoreSummary.totalScore).toBe(14);
    expect(secondScore.body.idea.scoreSummary.scoredStages).toBe(2);
    expect(secondScore.body.idea.scoreSummary.averageScore).toBe(7);
  });
});

describe('PUT /api/ideas/:id/status - Status Update', () => {
  let ideaId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/ideas')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Status Test',
        description: 'This idea will be used for testing status transitions.',
        category: 'Process'
      });

    ideaId = res.body.idea.id;
  });

  it('should allow admin to change status from submitted to under_review', async () => {
    const res = await request(app)
      .put(`/api/ideas/${ideaId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        newStatus: 'under_review',
        comment: 'Now reviewing this idea'
      });

    expect(res.status).toBe(200);
    expect(res.body.idea.status).toBe('under_review');
  });

  it('should allow transition from under_review to accepted', async () => {
    // First transition
    await request(app)
      .put(`/api/ideas/${ideaId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ newStatus: 'under_review' });

    // Second transition
    const res = await request(app)
      .put(`/api/ideas/${ideaId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        newStatus: 'accepted',
        comment: 'Great idea!'
      });

    expect(res.status).toBe(200);
    expect(res.body.idea.status).toBe('accepted');
  });

  it('should reject invalid status transitions', async () => {
    const res = await request(app)
      .put(`/api/ideas/${ideaId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ newStatus: 'accepted' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Cannot transition');
  });

  it('should record status change in history', async () => {
    await request(app)
      .put(`/api/ideas/${ideaId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        newStatus: 'under_review',
        comment: 'Review started'
      });

    const idea = await Idea.findById(ideaId);
    const historyEntry = idea.statusHistory.find(h => h.newStatus === 'under_review');
    expect(historyEntry).toBeDefined();
    expect(historyEntry.comment).toBe('Review started');
  });

  it('should reject update from non-admin user', async () => {
    const res = await request(app)
      .put(`/api/ideas/${ideaId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ newStatus: 'under_review' });

    expect(res.status).toBe(403);
  });

  it('should require authentication', async () => {
    const res = await request(app)
      .put(`/api/ideas/${ideaId}/status`)
      .send({ newStatus: 'under_review' });

    expect(res.status).toBe(401);
  });
});

const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Idea = require('../../src/models/Idea');
const jwt = require('jsonwebtoken');

let authToken;
let userId;
let adminToken;
let adminUserId;

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

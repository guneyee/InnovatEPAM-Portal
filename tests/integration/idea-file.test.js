const fs = require('fs');
const path = require('path');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Idea = require('../../src/models/Idea');

let authToken;

beforeEach(async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'fileuser@example.com', password: 'password123' });

  authToken = jwt.sign(
    { userId: res.body.user.id, email: 'fileuser@example.com', role: 'submitter' },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  );
});

describe('GET /api/ideas/:id/file', () => {
  it('should return 404 when the idea has no attachment', async () => {
    const idea = await Idea.create({
      title: 'No file idea',
      description: 'This idea intentionally has no attachment.',
      category: 'Process',
      submitterId: new User({ email: 'ghost@example.com', password: 'x', role: 'submitter' })._id,
      submitterEmail: 'ghost@example.com',
      status: 'submitted'
    });

    const res = await request(app)
      .get(`/api/ideas/${idea._id}/file`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('File not found');
  });

  it('should return 404 when attachment metadata exists but file is missing on disk', async () => {
    const idea = await Idea.create({
      title: 'Missing file idea',
      description: 'This idea points to a file that does not exist.',
      category: 'Process',
      submitterId: new User({ email: 'ghost2@example.com', password: 'x', role: 'submitter' })._id,
      submitterEmail: 'ghost2@example.com',
      status: 'submitted',
      fileAttachment: {
        originalName: 'missing.pdf',
        filename: 'missing-file.pdf',
        mimetype: 'application/pdf',
        size: 100,
        uploadedAt: new Date()
      }
    });

    const res = await request(app)
      .get(`/api/ideas/${idea._id}/file`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('File not found on server');
  });

  it('should download an attachment when the file exists', async () => {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const filename = `coverage-test-${Date.now()}.txt`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, 'attachment content');

    try {
      const idea = await Idea.create({
        title: 'Downloadable idea',
        description: 'This idea has a real file attachment.',
        category: 'Process',
        submitterId: new User({ email: 'ghost3@example.com', password: 'x', role: 'submitter' })._id,
        submitterEmail: 'ghost3@example.com',
        status: 'submitted',
        fileAttachment: {
          originalName: 'attachment.txt',
          filename,
          mimetype: 'text/plain',
          size: 18,
          uploadedAt: new Date()
        }
      });

      const res = await request(app)
        .get(`/api/ideas/${idea._id}/file`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-disposition']).toContain('attachment.txt');
      expect(res.text).toContain('attachment content');
    } finally {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  });
});
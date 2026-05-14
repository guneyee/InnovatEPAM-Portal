const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');

describe('POST /api/auth/register', () => {
  it('should register user successfully with valid data', async () => {
    // Arrange
    const newUser = {
      email: 'test@example.com',
      password: 'password123'
    };

    // Act
    const res = await request(app)
      .post('/api/auth/register')
      .send(newUser);

    // Assert
    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user.role).toBe('submitter');
    expect(res.body.message).toBe('User registered successfully');
  });

  it('should reject invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'invalid-email',
        password: 'password123'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Invalid email format');
  });

  it('should reject password shorter than 8 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'short'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('at least 8 characters');
  });

  it('should reject duplicate email', async () => {
    // First registration
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'duplicate@example.com',
        password: 'password123'
      });

    // Duplicate attempt
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'duplicate@example.com',
        password: 'password123'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('already registered');
  });

  it('should reject missing email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        password: 'password123'
      });

    expect(res.status).toBe(400);
  });

  it('should reject missing password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com'
      });

    expect(res.status).toBe(400);
  });

  it('should hash password before storing', async () => {
    const password = 'password123';
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'hashed@example.com',
        password: password
      });

    const user = await User.findOne({ email: 'hashed@example.com' });
    expect(user.password).not.toBe(password);
  });

  it('should convert email to lowercase', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'TEST@EXAMPLE.COM',
        password: 'password123'
      });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('test@example.com');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    // Create test user
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'login@example.com',
        password: 'password123'
      });
  });

  it('should login successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'password123'
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('login@example.com');
  });

  it('should return JWT token with correct payload', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'password123'
      });

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET || 'dev-secret');
    expect(decoded.email).toBe('login@example.com');
    expect(decoded.role).toBe('submitter');
    expect(decoded.userId).toBeDefined();
  });

  it('should reject invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123'
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('should reject wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'wrongpassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('should reject missing email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        password: 'password123'
      });

    expect(res.status).toBe(400);
  });

  it('should reject missing password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com'
      });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/logout', () => {
  it('should logout successfully', async () => {
    const res = await request(app)
      .post('/api/auth/logout');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Logout successful');
  });
});

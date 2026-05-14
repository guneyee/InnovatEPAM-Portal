const jwt = require('jsonwebtoken');
const { authenticateToken, authorizeRole } = require('../../../src/middleware/auth');

describe('auth middleware', () => {
  const createRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  it('should reject requests without a token', () => {
    const req = { headers: {} };
    const res = createRes();
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Access token required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject invalid or expired tokens', () => {
    const req = { headers: { authorization: 'Bearer invalid-token' } };
    const res = createRes();
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should attach decoded user and continue for valid token', () => {
    const token = jwt.sign(
      { userId: 'user-1', email: 'user@example.com', role: 'submitter' },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    );
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createRes();
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user.email).toBe('user@example.com');
    expect(next).toHaveBeenCalled();
  });

  it('should reject role checks without authentication', () => {
    const req = {};
    const res = createRes();
    const next = jest.fn();

    authorizeRole('admin')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject unauthorized roles', () => {
    const req = { user: { role: 'submitter' } };
    const res = createRes();
    const next = jest.fn();

    authorizeRole('admin', 'evaluator')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Insufficient permissions' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should allow permitted roles to continue', () => {
    const req = { user: { role: 'admin' } };
    const res = createRes();
    const next = jest.fn();

    authorizeRole('admin', 'evaluator')(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
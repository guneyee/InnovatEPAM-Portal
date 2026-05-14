# Testing Constitution - InnovatEPAM Portal

## Testing Principles (Module 07 Configuration)

### Core Principles
1. **Test-Driven Development (TDD)**: Write tests BEFORE code
2. **Comprehensive Coverage**: Aim for 70%+ code coverage
3. **Clear Test Structure**: Arrange-Act-Assert (AAA)
4. **Fast Feedback**: Tests run in <5 seconds
5. **Isolation**: Each test independent, no side effects

### Testing Strategy

#### Unit Tests
- Test individual functions/methods in isolation
- Mock external dependencies (database, file system)
- Verify inputs and outputs
- **Framework**: Jest
- **Coverage Target**: 80%+ per feature

Example:
```javascript
describe('validateEmail', () => {
  it('should accept valid email', () => {
    const result = validateEmail('test@example.com');
    expect(result).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = validateEmail('invalid');
    expect(result).toBe(false);
  });
});
```

#### Integration Tests
- Test API endpoints with database
- Verify request/response flow
- Test error handling
- **Framework**: Jest + Supertest
- **Coverage Target**: 60%+ per endpoint

Example:
```javascript
describe('POST /api/auth/register', () => {
  it('should register user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'new@test.com', password: 'password123' });
    
    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
  });

  it('should reject duplicate email', async () => {
    // First registration
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'password123' });
    
    // Duplicate attempt
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'password123' });
    
    expect(res.status).toBe(400);
  });
});
```

### Test Organization
```
tests/
├── unit/
│   ├── validators.test.js
│   ├── utils.test.js
│   └── models.test.js
├── integration/
│   ├── auth.test.js
│   ├── ideas.test.js
│   └── evaluation.test.js
└── setup.js
```

### Testing Workflow (RED → GREEN)
1. **RED**: Write test that fails
2. **GREEN**: Write minimal code to pass test
3. **REFACTOR**: Improve code while maintaining test pass
4. **COMMIT**: Push with meaningful message

### Validation Checklist
- [ ] New feature has tests before implementation
- [ ] Tests pass locally (`npm test`)
- [ ] Coverage reported (`npm run test:coverage`)
- [ ] No console errors or warnings
- [ ] All edge cases covered

### Test Naming Convention
```javascript
// ❌ Bad
test('works', () => { ... })

// ✅ Good
test('should validate email with domain correctly', () => { ... })
test('should reject password shorter than 8 characters', () => { ... })
test('should handle database connection error gracefully', () => { ... })
```

### Mock Strategy
- Mock database calls
- Mock file system operations
- Mock external APIs
- Keep real: Business logic, validation, error handling

### CI/CD Integration (Future)
- All tests must pass before merge
- Coverage must be ≥70%
- Tests run automatically on commit

---
**Framework**: Jest + Supertest  
**Language**: JavaScript  
**Coverage Target**: 70%+  
**Status**: Active for Phase 1

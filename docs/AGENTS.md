# AI-Native Development Agents

## AI Usage Guidelines

### 1. Spec-Driven Prompting
When asking AI to generate code, provide:
```
I'm building the InnovatEPAM Portal - an employee innovation management platform.

Context:
- [Paste relevant user story]
- Tech Stack: Node.js + Express + MongoDB
- Testing Framework: Jest + Supertest
- Reference: See docs/CONSTITUTION.md for testing approach

Task:
[What you need]

Requirements:
- Follow Node.js/Express best practices
- Write tests following TDD approach (RED then GREEN)
- Use JWT for auth
- Return JSON responses
- Include error handling
```

### 2. Code Generation Workflow
1. **Paste the user story** → AI knows what to build
2. **Reference ADRs** → AI respects tech decisions
3. **Request tests first** → RED phase (failing test)
4. **Request implementation** → GREEN phase (passing code)
5. **Run and validate** → Ensure tests pass

### 3. Example Prompts

#### Generating Tests (RED Phase)
```
I'm implementing Story 1.1: User Registration for InnovatEPAM Portal.

Context:
- Framework: Express.js
- Database: MongoDB with Mongoose
- Testing: Jest + Supertest
- Reference: docs/CONSTITUTION.md for testing principles

Task:
Generate comprehensive tests for POST /api/auth/register endpoint

Requirements:
- Should validate email format
- Should reject passwords < 8 characters
- Should reject duplicate emails
- Should hash password before storing
- Should return user ID on success
- Follow AAA pattern (Arrange-Act-Assert)
- Use Jest + Supertest
```

#### Generating Implementation (GREEN Phase)
```
I'm implementing Story 1.1: User Registration for InnovatEPAM Portal.

Context:
- See: tests/integration/auth.test.js (the tests to pass)
- ADR-002: JWT-based auth with bcrypt (10 rounds)
- Tech: Express + MongoDB (Mongoose)

Task:
Implement POST /api/auth/register that passes all tests

Requirements:
- Validate email and password
- Hash password with bcrypt (10 rounds)
- Create user in MongoDB
- Return 201 with user object (id, email, role)
- Return 400 with error message on validation failure
- Return 400 if email already exists
```

### 4. Key References for AI
- **Tech Decisions**: Refer to docs/adr/*.md
- **Testing Standards**: Refer to docs/CONSTITUTION.md
- **User Stories**: Refer to docs/STORIES.md
- **Database Model**: Refer to src/models/*.js

### 5. Common Patterns

#### Middleware Pattern
```javascript
// AI-generated middleware follows this pattern:
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

#### Model Pattern
```javascript
// AI-generated models follow Mongoose conventions
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['submitter', 'evaluator', 'admin'], default: 'submitter' },
  createdAt: { type: Date, default: Date.now }
});
```

#### Test Pattern
```javascript
// AAA Pattern that AI uses
describe('Feature', () => {
  it('should do something', async () => {
    // Arrange
    const input = { ... };
    
    // Act
    const result = await functionUnderTest(input);
    
    // Assert
    expect(result).toBe(expected);
  });
});
```

### 6. Validation Checklist
- [ ] Generated tests use AAA pattern
- [ ] Implementation passes all tests
- [ ] Error handling included
- [ ] Security best practices followed (bcrypt, JWT validation, input validation)
- [ ] Code follows project conventions
- [ ] Tests pass: `npm test`
- [ ] Coverage meets 70%+ target

---
**Author**: Development Team  
**Framework**: Node.js + Express  
**Testing**: Jest + Supertest  
**Status**: Active

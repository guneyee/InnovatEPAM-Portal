# ADR-002: Authentication & Authorization Strategy

## Context
Need secure authentication for MVP supporting role-based access (submitter, evaluator, admin).

## Decision
**JWT-based stateless authentication** with role-based middleware:
- Passwords hashed with bcrypt (salt rounds: 10)
- JWT tokens expire in 7 days
- Tokens contain user ID and role
- Role-based middleware for endpoint protection

## Implementation Details
```javascript
// JWT Payload Structure
{
  userId: "...",
  email: "user@example.com",
  role: "submitter" | "evaluator" | "admin",
  iat: 1234567890,
  exp: 1234654290
}
```

## Roles & Permissions
| Role | Can Submit | Can Review | Can Admin |
|------|-----------|-----------|----------|
| submitter | ✓ | ✗ | ✗ |
| evaluator | ✓ | ✓ | ✗ |
| admin | ✓ | ✓ | ✓ |

## Security Measures
1. Passwords: bcrypt with 10 rounds
2. Tokens: Signed with ENV variable SECRET_KEY
3. HTTPS: Required in production
4. CORS: Restricted to frontend domain
5. Rate limiting: Added to auth endpoints (5 requests/min per IP)

## Consequences
**Positive:**
- Stateless, scales horizontally
- Simple to implement and test
- Role-based access easy to manage
- No session storage needed

**Negative:**
- Token revocation not real-time (wait for expiry)
- No built-in logout (client-side token removal only)
- Token size grows with claims

---
**Status**: Accepted  
**Date**: 2026-05-14

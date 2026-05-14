# ADR-001: Technology Stack Selection

## Context
Needed to select technology stack for InnovatEPAM Portal MVP. Requirements:
- Fast development cycle (8.5 hours)
- Suitable for AI-native development workflow
- Scalable to future phases
- Good testing ecosystem

## Decision
**Chosen Stack:**
- **Framework**: Express.js (Node.js)
- **Database**: MongoDB
- **Authentication**: JWT (jsonwebtoken)
- **Testing**: Jest + Supertest
- **File Storage**: Local filesystem (./uploads)
- **Runtime**: Node.js 16+

## Rationale
1. **Express.js**: Lightweight, flexible, perfect for rapid prototyping
2. **MongoDB**: Schema-flexible, easy to iterate on data model
3. **JWT**: Stateless auth, works well with AI-generated code
4. **Jest**: Industry standard, great IDE integration
5. **Local Storage**: Simplifies MVP, avoids S3/cloud complexity

## Consequences
**Positive:**
- Fast iteration cycle
- Good AI code generation support
- Easy to test locally
- Familiar patterns for most developers

**Negative:**
- Local file storage not suitable for production
- Single MongoDB instance (no cluster)
- Will need refactoring for multi-server deployment
- File uploads limited to local disk

## Future Considerations
- Phase 2+: Consider cloud storage (AWS S3, Azure Blob)
- Phase 3+: Add Redis for caching
- Production: MongoDB Atlas + proper deployment strategy

---
**Status**: Accepted  
**Date**: 2026-05-14  
**Author**: Development Team

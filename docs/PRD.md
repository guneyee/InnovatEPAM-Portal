# Product Requirements Document - InnovatEPAM Portal

## 1. Executive Summary
InnovatEPAM Portal is an employee innovation management platform enabling secure idea submission, collaborative evaluation, and workflow tracking. Phase 1 (MVP) delivers core authentication, submission, and basic evaluation functionality.

## 2. Product Vision
Enable organizations to capture, evaluate, and act on employee innovation ideas through a simple, secure, AI-native platform.

## 3. Goals (Phase 1)
- [ ] Establish secure authentication foundation
- [ ] Enable idea submission with file attachments
- [ ] Implement basic evaluation workflow
- [ ] Demonstrate AI-native development workflow

## 4. Success Metrics
- User registration/login working
- File uploads processed correctly
- Status workflow transitions valid
- Tests passing at 70%+ coverage
- Demo runs without errors

## 5. Target Users
- **Submitters**: Employees submitting ideas
- **Evaluators**: Managers/team leads reviewing ideas
- **Admins**: System administrators managing users and workflows

## 6. Out of Scope (Phase 1)
- Email notifications
- Scoring/rating system
- Multi-stage reviews
- Advanced analytics
- Mobile app

## 7. Constraints
- Single file attachment per idea
- Basic role model (submitter, evaluator, admin)
- Simple status model (submitted, under_review, accepted, rejected)
- Local MongoDB for MVP
- JWT-based auth (no OAuth yet)

---
**Author**: Development Team  
**Status**: Active  
**Phase**: 1 (MVP)

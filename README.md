# InnovatEPAM Portal MVP

> An employee innovation management platform built with AI-native development workflow

## Overview
InnovatEPAM Portal is a platform for employees to submit and manage innovation ideas. The MVP (Phase 1) enables basic idea submission, user authentication, and evaluation workflows.

## Quick Start

### Prerequisites
- Node.js 16+
- MongoDB (local or Atlas)
- npm or yarn

### Setup
```bash
npm install
npm run dev
```

### Test
```bash
npm test
```

## Project Structure
```
├── docs/               # Specifications & Architecture Decisions
│   ├── PRD.md
│   ├── STORIES.md
│   ├── CONSTITUTION.md
│   └── adr/            # Architecture Decision Records
├── src/
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routes
│   ├── controllers/    # Business logic
│   ├── middleware/     # Auth, validation
│   └── app.js
├── tests/              # Test files
└── package.json
```

## Features (Phase 1)

- [x] User Authentication (register, login, logout)
- [x] Role-based Access (submitter, evaluator, admin)
- [x] Idea Submission Form
- [x] File Attachment Support
- [x] Idea Listing & Viewing
- [x] Evaluation Workflow (status tracking)

## Tech Stack
- **Framework**: Express.js
- **Database**: MongoDB
- **Auth**: JWT
- **Testing**: Jest + Supertest

## Development Process
This project follows **Spec-Driven Development (SDD)**:
1. Write specifications (PRD, Stories, ADRs)
2. Generate tests (RED phase)
3. Implement code (GREEN phase)
4. Commit & iterate

See `docs/CONSTITUTION.md` for testing principles.

---
**Sprint**: Module 08 Capstone
**Date**: May 14, 2026

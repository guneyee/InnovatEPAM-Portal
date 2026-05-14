# ADR-004: Multi-Media File Support

## Context
Phase 3 requirement: Support multiple file types and multiple attachments per idea.

## Decision
**Enable multiple file attachments with extended type support:**
- Modify fileAttachment to fileAttachments (array)
- Support: PDF, images (JPG, PNG, GIF), documents (DOCX, XLSX, PPTX), videos (MP4, WebM)
- Max 3 files per idea
- Max 50MB total per idea
- Store metadata: filename, size, type, uploadDate, description

## Implementation
```javascript
// Idea schema:
fileAttachments: [
  {
    originalName: String,
    filename: String,
    mimetype: String,
    size: Number,
    description: String,
    uploadedAt: Date,
    url: String
  }
]

// New routes:
POST /api/ideas/:id/attachments (add file)
DELETE /api/ideas/:id/attachments/:fileId (remove file)
GET /api/ideas/:id/attachments/:fileId (download)
```

## Consequences
**Positive:**
- Richer idea presentations
- Better documentation support
- More flexibility

**Negative:**
- Increased storage needs
- More complex file management
- Upload handling more complex

---
**Status**: Accepted  
**Date**: 2026-05-14

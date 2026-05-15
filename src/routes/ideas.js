const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  createIdea,
  listIdeas,
  findIdeaById,
  updateIdeaStatus,
  updateDraftIdea,
  submitDraftIdea,
  getReviewStageConfig,
  setReviewStageConfig,
  decideIdeaStage,
  scoreIdeaStage,
  isDatabaseReady
} = require('../services/storage');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const CATEGORY_REQUIREMENTS = {
  Technical: ['techStack', 'complexity'],
  'Process Improvement': ['processArea', 'efficiencyGain'],
  'Client Solution': ['clientSegment', 'valueProposition'],
  Other: ['expectedOutcome', 'whyNow']
};

const FIELD_LABELS = {
  techStack: 'Tech stack',
  complexity: 'Complexity',
  processArea: 'Process area',
  efficiencyGain: 'Efficiency gain',
  clientSegment: 'Client segment',
  valueProposition: 'Value proposition',
  expectedOutcome: 'Expected outcome',
  whyNow: 'Why now'
};

const normalizeValue = (value) => {
  if (Array.isArray(value)) {
    return String(value[0] || '').trim();
  }
  return String(value || '').trim();
};

const optionalValue = (value) => {
  const normalized = normalizeValue(value);
  return normalized || undefined;
};

const extractCategoryDetails = (body, category) => {
  const required = CATEGORY_REQUIREMENTS[category] || [];

  if (!required.length) {
    return {};
  }

  const details = {};
  const nested = body.categoryDetails && typeof body.categoryDetails === 'object' ? body.categoryDetails : {};

  required.forEach((field) => {
    const raw = nested[field] !== undefined ? nested[field] : body[field];
    details[field] = normalizeValue(raw);
  });

  return details;
};

const mergeCategoryDetails = (base, overrides) => {
  const merged = { ...(base || {}) };
  Object.keys(overrides || {}).forEach((key) => {
    const value = normalizeValue(overrides[key]);
    if (value) {
      merged[key] = value;
    }
  });
  return merged;
};

const validateCategoryDetails = (category, details) => {
  const required = CATEGORY_REQUIREMENTS[category] || [];

  if (!required.length) {
    return null;
  }

  const missing = required.filter((field) => !normalizeValue(details[field]));
  if (!missing.length) {
    return null;
  }

  const missingLabels = missing.map((field) => FIELD_LABELS[field] || field);
  return `Missing required ${category} fields: ${missingLabels.join(', ')}`;
};

const validateFinalSubmission = ({ title, description, category, categoryDetails }) => {
  if (!title || !description || !category) {
    return 'Title, description, and category required';
  }

  if (title.length < 1 || title.length > 100) {
    return 'Title must be 1-100 characters';
  }

  if (description.length < 10 || description.length > 2000) {
    return 'Description must be 10-2000 characters';
  }

  return validateCategoryDetails(category, categoryDetails);
};

const toIdeaResponse = (idea) => ({
  id: idea._id,
  title: idea.title,
  description: idea.description,
  category: idea.category,
  categoryDetails: idea.categoryDetails || {},
  submitterId: idea.submitterId,
  submitterEmail: idea.submitterEmail,
  status: idea.status,
  currentStage: idea.currentStage || null,
  reviewStages: idea.reviewStages || [],
  stageHistory: idea.stageHistory || [],
  scoreHistory: idea.scoreHistory || [],
  scoreSummary: idea.scoreSummary || {
    totalScore: 0,
    scoredStages: 0,
    averageScore: 0,
    stageScores: {}
  },
  fileAttachment: idea.fileAttachment,
  statusHistory: idea.statusHistory,
  createdAt: idea.createdAt,
  updatedAt: idea.updatedAt
});

const isBlindReviewActive = (idea) => {
  if (!idea || !idea.currentStage || !Array.isArray(idea.reviewStages)) {
    return false;
  }

  const active = idea.reviewStages.find((stage) => stage.name === idea.currentStage);
  if (!active) {
    return false;
  }

  return Boolean(active.enabled) && Boolean(active.blind) && active.status === 'pending';
};

const maskIdeaForRole = (idea, role) => {
  const response = toIdeaResponse(idea);
  if (role === 'evaluator' && isBlindReviewActive(idea)) {
    response.submitterEmail = 'hidden-for-blind-review';
    response.submitterId = null;
  }
  return response;
};

const parseScore = (rawScore) => {
  if (rawScore === undefined || rawScore === null || rawScore === '') {
    return undefined;
  }

  const parsed = Number(rawScore);
  if (!Number.isFinite(parsed)) {
    return NaN;
  }
  return parsed;
};

// Configure multer for file uploads
const uploadsDir = './uploads';
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// GET /api/ideas/stages/config - List global stage configuration
router.get('/stages/config', authenticateToken, authorizeRole('admin', 'evaluator'), async (req, res) => {
  try {
    const stages = await getReviewStageConfig();
    res.status(200).json({ stages });
  } catch (err) {
    console.error('Get stage config error:', err);
    res.status(500).json({ error: 'Failed to get stage configuration' });
  }
});

// PUT /api/ideas/stages/config - Update global stage configuration (admin only)
router.put('/stages/config', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const stages = Array.isArray(req.body.stages) ? req.body.stages : [];
    const updated = await setReviewStageConfig(stages);
    res.status(200).json({ message: 'Stage configuration updated', stages: updated });
  } catch (err) {
    console.error('Update stage config error:', err);
    res.status(500).json({ error: 'Failed to update stage configuration' });
  }
});

// POST /api/ideas/drafts - Save a draft with partial fields
router.post('/drafts', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const title = optionalValue(req.body.title);
    const description = optionalValue(req.body.description);
    const category = optionalValue(req.body.category);
    const categoryDetails = extractCategoryDetails(req.body, category);

    const draftPayload = {
      title,
      description,
      category,
      categoryDetails,
      submitterId: req.user.userId,
      submitterEmail: req.user.email,
      fileAttachment: undefined,
      status: 'draft',
      statusComment: 'Draft saved'
    };

    if (req.file) {
      draftPayload.fileAttachment = {
        originalName: req.file.originalname,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date()
      };
    }

    const draft = await createIdea(draftPayload);
    res.status(201).json({
      message: 'Draft saved',
      draft: {
        id: draft._id,
        status: draft.status,
        updatedAt: draft.updatedAt
      }
    });
  } catch (err) {
    console.error('Save draft error:', err);
    if (req.file) {
      fs.unlink(path.join(uploadsDir, req.file.filename), (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting file:', unlinkErr);
      });
    }
    res.status(500).json({ error: 'Failed to save draft' });
  }
});

// GET /api/ideas/drafts - List drafts for the current submitter
router.get('/drafts', authenticateToken, async (req, res) => {
  try {
    const result = await listIdeas({
      status: 'draft',
      submitterId: req.user.userId,
      page: 1,
      limit: 100
    });

    res.status(200).json({ drafts: result.ideas, total: result.total });
  } catch (err) {
    console.error('List drafts error:', err);
    res.status(500).json({ error: 'Failed to list drafts' });
  }
});

// PUT /api/ideas/drafts/:id - Update draft content
router.put('/drafts/:id', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const draft = await findIdeaById(req.params.id);
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    if (String(draft.submitterId) !== String(req.user.userId)) {
      return res.status(403).json({ error: 'Forbidden: not your draft' });
    }

    if (draft.status !== 'draft') {
      return res.status(400).json({ error: 'Only drafts can be edited' });
    }

    const nextCategory = req.body.category !== undefined ? normalizeValue(req.body.category) : draft.category;
    const parsedDetails = req.body.category !== undefined
      ? mergeCategoryDetails({}, extractCategoryDetails(req.body, nextCategory))
      : mergeCategoryDetails(draft.categoryDetails || {}, extractCategoryDetails(req.body, draft.category));

    const updates = {
      title: req.body.title !== undefined ? optionalValue(req.body.title) : draft.title,
      description: req.body.description !== undefined ? optionalValue(req.body.description) : draft.description,
      category: nextCategory,
      categoryDetails: parsedDetails
    };

    if (req.file) {
      updates.fileAttachment = {
        originalName: req.file.originalname,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date()
      };
    }

    const updatedDraft = await updateDraftIdea({ id: req.params.id, updates });
    res.status(200).json({
      message: 'Draft updated',
      draft: {
        id: updatedDraft._id,
        status: updatedDraft.status,
        updatedAt: updatedDraft.updatedAt
      }
    });
  } catch (err) {
    console.error('Update draft error:', err);
    if (req.file) {
      fs.unlink(path.join(uploadsDir, req.file.filename), (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting file:', unlinkErr);
      });
    }
    res.status(500).json({ error: 'Failed to update draft' });
  }
});

// POST /api/ideas/drafts/:id/submit - Submit an existing draft
router.post('/drafts/:id/submit', authenticateToken, async (req, res) => {
  try {
    const draft = await findIdeaById(req.params.id);
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    if (String(draft.submitterId) !== String(req.user.userId)) {
      return res.status(403).json({ error: 'Forbidden: not your draft' });
    }

    if (draft.status !== 'draft') {
      return res.status(400).json({ error: 'Only drafts can be submitted' });
    }

    const finalFields = {
      title: normalizeValue(req.body.title) || draft.title,
      description: normalizeValue(req.body.description) || draft.description,
      category: normalizeValue(req.body.category) || draft.category,
      categoryDetails: mergeCategoryDetails(
        draft.categoryDetails || {},
        extractCategoryDetails(req.body, normalizeValue(req.body.category) || draft.category)
      )
    };

    const validationError = validateFinalSubmission(finalFields);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    await updateDraftIdea({
      id: req.params.id,
      updates: {
        title: finalFields.title,
        description: finalFields.description,
        category: finalFields.category,
        categoryDetails: finalFields.categoryDetails
      }
    });

    const submittedIdea = await submitDraftIdea({
      id: req.params.id,
      changedBy: req.user.userId,
      comment: 'Draft submitted'
    });

    res.status(200).json({
      message: 'Draft submitted successfully',
      idea: {
        id: submittedIdea._id,
        status: submittedIdea.status,
        updatedAt: submittedIdea.updatedAt
      }
    });
  } catch (err) {
    console.error('Submit draft error:', err);
    res.status(500).json({ error: 'Failed to submit draft' });
  }
});

// POST /api/ideas - Submit new idea with optional file
router.post('/', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const categoryDetails = extractCategoryDetails(req.body, category);
    const validationError = validateFinalSubmission({ title, description, category, categoryDetails });
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Create idea
    const ideaPayload = {
      title,
      description,
      category,
      categoryDetails,
      submitterId: req.user.userId,
      submitterEmail: req.user.email,
      fileAttachment: undefined
    };

    // Add file if uploaded
    if (req.file) {
      ideaPayload.fileAttachment = {
        originalName: req.file.originalname,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date()
      };
    }

    const idea = await createIdea(ideaPayload);

    res.status(201).json({
      message: 'Idea submitted successfully',
      mode: isDatabaseReady() ? 'database' : 'in-memory',
      idea: {
        id: idea._id,
        title: idea.title,
        categoryDetails: idea.categoryDetails || {},
        status: idea.status,
        submittedAt: idea.createdAt
      }
    });
  } catch (err) {
    console.error('Submit idea error:', err);
    if (req.file) {
      fs.unlink(path.join(uploadsDir, req.file.filename), (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    res.status(500).json({ error: 'Failed to submit idea' });
  }
});

// GET /api/ideas - List all ideas (with pagination)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const status = req.query.status;

    const result = await listIdeas({ status, page, limit });

    const ideas = (result.ideas || []).map((idea) => {
      const raw = {
        _id: idea._id || idea.id,
        title: idea.title,
        description: idea.description,
        category: idea.category,
        categoryDetails: idea.categoryDetails || {},
        submitterId: idea.submitterId,
        submitterEmail: idea.submitterEmail,
        status: idea.status,
        currentStage: idea.currentStage || null,
        reviewStages: idea.reviewStages || [],
        stageHistory: idea.stageHistory || [],
        fileAttachment: idea.fileAttachment,
        statusHistory: idea.statusHistory || [],
        createdAt: idea.createdAt,
        updatedAt: idea.updatedAt
      };

      const masked = maskIdeaForRole(raw, req.user.role);
      return {
        _id: masked.id,
        title: masked.title,
        submitterEmail: masked.submitterEmail,
        status: masked.status,
        currentStage: masked.currentStage,
        createdAt: masked.createdAt,
        category: masked.category,
        reviewStages: masked.reviewStages
      };
    });

    res.status(200).json({
      ideas,
      pagination: {
        page: page,
        limit: limit,
        total: result.total,
        pages: Math.ceil(result.total / limit)
      }
    });
  } catch (err) {
    console.error('List ideas error:', err);
    res.status(500).json({ error: 'Failed to list ideas' });
  }
});

// GET /api/ideas/:id - View specific idea
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const idea = await findIdeaById(req.params.id);

    if (!idea) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    res.status(200).json({ idea: maskIdeaForRole(idea, req.user.role) });
  } catch (err) {
    console.error('Get idea error:', err);
    res.status(500).json({ error: 'Failed to retrieve idea' });
  }
});

// PUT /api/ideas/:id/stages/decision - Decide the current review stage
router.put('/:id/stages/decision', authenticateToken, authorizeRole('admin', 'evaluator'), async (req, res) => {
  try {
    const decision = normalizeValue(req.body.decision).toLowerCase();
    const comment = normalizeValue(req.body.comment);
    const score = parseScore(req.body.score);

    if (!['approve', 'reject'].includes(decision)) {
      return res.status(400).json({ error: 'Decision must be approve or reject' });
    }

    if (Number.isNaN(score) || (score !== undefined && (score < 1 || score > 10))) {
      return res.status(400).json({ error: 'Score must be a number between 1 and 10' });
    }

    const result = await decideIdeaStage({
      id: req.params.id,
      decision,
      comment,
      evaluatorId: req.user.userId,
      score
    });

    if (result.error) {
      return res.status(result.code || 400).json({ error: result.error });
    }

    res.status(200).json({
      message: 'Stage decision recorded',
      idea: toIdeaResponse(result.idea)
    });
  } catch (err) {
    console.error('Stage decision error:', err);
    res.status(500).json({ error: 'Failed to record stage decision' });
  }
});

// PUT /api/ideas/:id/stages/score - Score the current review stage
router.put('/:id/stages/score', authenticateToken, authorizeRole('admin', 'evaluator'), async (req, res) => {
  try {
    const score = parseScore(req.body.score);
    const comment = normalizeValue(req.body.comment);

    if (Number.isNaN(score) || score === undefined || score < 1 || score > 10) {
      return res.status(400).json({ error: 'Score must be a number between 1 and 10' });
    }

    const result = await scoreIdeaStage({
      id: req.params.id,
      score,
      comment,
      evaluatorId: req.user.userId
    });

    if (result.error) {
      return res.status(result.code || 400).json({ error: result.error });
    }

    res.status(200).json({
      message: 'Stage score recorded',
      idea: toIdeaResponse(result.idea)
    });
  } catch (err) {
    console.error('Stage score error:', err);
    res.status(500).json({ error: 'Failed to record stage score' });
  }
});

// PUT /api/ideas/:id/status - Update idea status (admin only)
router.put('/:id/status', authenticateToken, authorizeRole('admin', 'evaluator'), async (req, res) => {
  try {
    const { newStatus, comment } = req.body;
    const validStatuses = ['submitted', 'under_review', 'accepted', 'rejected'];

    if (!newStatus || !validStatuses.includes(newStatus)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const idea = await findIdeaById(req.params.id);
    if (!idea) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    // Validate status transition
    const validTransitions = {
      'submitted': ['under_review'],
      'under_review': ['accepted', 'rejected'],
      'accepted': [],
      'rejected': []
    };

    if (!validTransitions[idea.status].includes(newStatus)) {
      return res.status(400).json({ 
        error: `Cannot transition from ${idea.status} to ${newStatus}` 
      });
    }

    const updatedIdea = await updateIdeaStatus({
      id: req.params.id,
      newStatus,
      comment,
      changedBy: req.user.userId
    });

    res.status(200).json({
      message: 'Idea status updated',
      idea: {
        id: updatedIdea._id,
        status: updatedIdea.status,
        statusHistory: updatedIdea.statusHistory
      }
    });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// GET /api/ideas/:id/file - Download attachment
router.get('/:id/file', authenticateToken, async (req, res) => {
  try {
    const idea = await findIdeaById(req.params.id);
    if (!idea || !idea.fileAttachment || !idea.fileAttachment.filename) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.join(uploadsDir, idea.fileAttachment.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    res.download(filePath, idea.fileAttachment.originalName);
  } catch (err) {
    console.error('Download file error:', err);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Idea = require('../models/Idea');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

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

// POST /api/ideas - Submit new idea with optional file
router.post('/', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { title, description, category } = req.body;

    // Validation
    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Title, description, and category required' });
    }

    if (title.length < 1 || title.length > 100) {
      return res.status(400).json({ error: 'Title must be 1-100 characters' });
    }

    if (description.length < 10 || description.length > 2000) {
      return res.status(400).json({ error: 'Description must be 10-2000 characters' });
    }

    // Create idea
    const idea = new Idea({
      title,
      description,
      category,
      submitterId: req.user.userId,
      submitterEmail: req.user.email,
      status: 'submitted'
    });

    // Add file if uploaded
    if (req.file) {
      idea.fileAttachment = {
        originalName: req.file.originalname,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date()
      };
    }

    // Record initial status in history
    idea.statusHistory.push({
      oldStatus: null,
      newStatus: 'submitted',
      changedBy: req.user.userId,
      changedAt: new Date(),
      comment: 'Idea submitted'
    });

    await idea.save();

    res.status(201).json({
      message: 'Idea submitted successfully',
      idea: {
        id: idea._id,
        title: idea.title,
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
    const skip = (page - 1) * limit;
    const status = req.query.status;

    let query = {};
    if (status) {
      query.status = status;
    }

    const ideas = await Idea.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .select('title submitterEmail status createdAt category');

    const total = await Idea.countDocuments(query);

    res.status(200).json({
      ideas: ideas,
      pagination: {
        page: page,
        limit: limit,
        total: total,
        pages: Math.ceil(total / limit)
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
    const idea = await Idea.findById(req.params.id);

    if (!idea) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    res.status(200).json({
      idea: {
        id: idea._id,
        title: idea.title,
        description: idea.description,
        category: idea.category,
        submitterId: idea.submitterId,
        submitterEmail: idea.submitterEmail,
        status: idea.status,
        fileAttachment: idea.fileAttachment,
        statusHistory: idea.statusHistory,
        createdAt: idea.createdAt,
        updatedAt: idea.updatedAt
      }
    });
  } catch (err) {
    console.error('Get idea error:', err);
    res.status(500).json({ error: 'Failed to retrieve idea' });
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

    const idea = await Idea.findById(req.params.id);
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

    const oldStatus = idea.status;
    idea.status = newStatus;
    idea.updatedAt = new Date();

    // Add to history
    idea.statusHistory.push({
      oldStatus: oldStatus,
      newStatus: newStatus,
      changedBy: req.user.userId,
      changedAt: new Date(),
      comment: comment || `Status changed to ${newStatus}`
    });

    await idea.save();

    res.status(200).json({
      message: 'Idea status updated',
      idea: {
        id: idea._id,
        status: idea.status,
        statusHistory: idea.statusHistory
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
    const idea = await Idea.findById(req.params.id);
    if (!idea || !idea.fileAttachment) {
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

const mongoose = require('mongoose');

const ideaSchema = new mongoose.Schema({
  title: {
    type: String,
    minlength: 1,
    maxlength: 100
  },
  description: {
    type: String,
    minlength: 10,
    maxlength: 2000
  },
  category: {
    type: String
  },
  categoryDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  reviewStages: [
    {
      name: String,
      enabled: { type: Boolean, default: true },
      blind: { type: Boolean, default: false },
      status: { type: String, enum: ['pending', 'approved', 'rejected', 'skipped'], default: 'pending' },
      score: Number,
      decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      decidedAt: Date,
      comment: String
    }
  ],
  currentStage: {
    type: String,
    default: null
  },
  stageHistory: [
    {
      stageName: String,
      decision: String,
      comment: String,
      evaluatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  scoreHistory: [
    {
      stageName: String,
      score: Number,
      evaluatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      comment: String,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  scoreSummary: {
    totalScore: { type: Number, default: 0 },
    scoredStages: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    stageScores: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  submitterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submitterEmail: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'accepted', 'rejected'],
    default: 'submitted'
  },
  fileAttachment: {
    originalName: String,
    filename: String,
    mimetype: String,
    size: Number,
    uploadedAt: Date
  },
  statusHistory: [
    {
      oldStatus: String,
      newStatus: String,
      changedBy: mongoose.Schema.Types.ObjectId,
      changedAt: { type: Date, default: Date.now },
      comment: String
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Idea', ideaSchema);

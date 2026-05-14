const mongoose = require('mongoose');

const ideaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true
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
    enum: ['submitted', 'under_review', 'accepted', 'rejected'],
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

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Idea = require('../models/Idea');

const users = [];
const ideas = [];
let inMemoryAdminSeeded = false;

const REVIEW_STAGE_ORDER = ['Screening', 'Technical', 'Business Impact', 'Final Decision'];
let reviewStageConfig = REVIEW_STAGE_ORDER.map((name) => ({ name, enabled: true, blind: false }));

const cloneStageConfig = () => reviewStageConfig.map((item) => ({ ...item }));

const createStageState = () =>
  cloneStageConfig().map((stage) => ({
    name: stage.name,
    enabled: stage.enabled,
    blind: Boolean(stage.blind),
    status: stage.enabled ? 'pending' : 'skipped',
    score: null,
    decidedBy: null,
    decidedAt: null,
    comment: ''
  }));

const recomputeScoreSummary = (idea) => {
  const stageScores = {};
  let totalScore = 0;
  let scoredStages = 0;

  (idea.reviewStages || []).forEach((stage) => {
    if (typeof stage.score === 'number' && Number.isFinite(stage.score)) {
      stageScores[stage.name] = stage.score;
      totalScore += stage.score;
      scoredStages += 1;
    }
  });

  const averageScore = scoredStages ? Number((totalScore / scoredStages).toFixed(2)) : 0;
  idea.scoreSummary = {
    totalScore,
    scoredStages,
    averageScore,
    stageScores
  };
};

const recordStageScore = ({ idea, stage, score, evaluatorId, comment }) => {
  if (!idea.scoreHistory) {
    idea.scoreHistory = [];
  }

  stage.score = score;
  idea.scoreHistory.push({
    stageName: stage.name,
    score,
    evaluatorId,
    comment: comment || '',
    timestamp: new Date()
  });

  recomputeScoreSummary(idea);
};

const findCurrentStageName = (stages) => {
  const pendingStage = (stages || []).find((stage) => stage.enabled && stage.status === 'pending');
  return pendingStage ? pendingStage.name : null;
};

const normalizeStageState = (idea) => {
  if (!idea.reviewStages || !idea.reviewStages.length) {
    idea.reviewStages = createStageState();
    idea.currentStage = findCurrentStageName(idea.reviewStages);
    if (!idea.stageHistory) {
      idea.stageHistory = [];
    }
    if (!idea.scoreHistory) {
      idea.scoreHistory = [];
    }
    if (!idea.scoreSummary) {
      idea.scoreSummary = {
        totalScore: 0,
        scoredStages: 0,
        averageScore: 0,
        stageScores: {}
      };
    }
    recomputeScoreSummary(idea);
    return;
  }

  const byName = new Map((idea.reviewStages || []).map((stage) => [stage.name, stage]));
  const rebuilt = cloneStageConfig().map((configStage) => {
    const existingDoc = byName.get(configStage.name);
    const existing = existingDoc && typeof existingDoc.toObject === 'function'
      ? existingDoc.toObject()
      : existingDoc;
    if (!existing) {
      return {
        name: configStage.name,
        enabled: configStage.enabled,
        blind: Boolean(configStage.blind),
        status: configStage.enabled ? 'pending' : 'skipped',
        score: null,
        decidedBy: null,
        decidedAt: null,
        comment: ''
      };
    }

    if (!configStage.enabled && existing.status === 'pending') {
      return {
        ...existing,
        enabled: false,
        blind: Boolean(configStage.blind),
        status: 'skipped'
      };
    }

    return {
      ...existing,
      enabled: configStage.enabled,
      blind: Boolean(configStage.blind)
    };
  });

  idea.reviewStages = rebuilt;
  idea.currentStage = findCurrentStageName(rebuilt);
  if (!idea.stageHistory) {
    idea.stageHistory = [];
  }
  if (!idea.scoreHistory) {
    idea.scoreHistory = [];
  }
  if (!idea.scoreSummary) {
    idea.scoreSummary = {
      totalScore: 0,
      scoredStages: 0,
      averageScore: 0,
      stageScores: {}
    };
  }
  recomputeScoreSummary(idea);
};

const createId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
const DEFAULT_ADMIN_EMAIL = (process.env.DEFAULT_ADMIN_EMAIL || 'admin@epam.com').toLowerCase();
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin1234!';

const isDatabaseReady = () => mongoose.connection.readyState === 1;

const ensureDefaultAdmin = async () => {
  if (isDatabaseReady()) {
    const existingAdmin = await User.findOne({ email: DEFAULT_ADMIN_EMAIL });
    if (existingAdmin) {
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
      }
      return;
    }

    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
    const admin = new User({
      email: DEFAULT_ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin'
    });
    await admin.save();
    return;
  }

  if (inMemoryAdminSeeded) {
    return;
  }

  const existingInMemoryAdmin = users.find((user) => user.email === DEFAULT_ADMIN_EMAIL);
  if (existingInMemoryAdmin) {
    existingInMemoryAdmin.role = 'admin';
    inMemoryAdminSeeded = true;
    return;
  }

  const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
  users.push({
    _id: createId('usr'),
    email: DEFAULT_ADMIN_EMAIL,
    password: hashedPassword,
    role: 'admin',
    createdAt: new Date()
  });
  inMemoryAdminSeeded = true;
};

const findUserByEmail = async (email) => {
  await ensureDefaultAdmin();
  const normalizedEmail = email.toLowerCase();

  if (isDatabaseReady()) {
    return User.findOne({ email: normalizedEmail });
  }

  return users.find((user) => user.email === normalizedEmail) || null;
};

const createUser = async ({ email, password, role = 'submitter' }) => {
  const normalizedEmail = email.toLowerCase();

  if (isDatabaseReady()) {
    const user = new User({ email: normalizedEmail, password, role });
    await user.save();
    return user;
  }

  const user = {
    _id: createId('usr'),
    email: normalizedEmail,
    password,
    role,
    createdAt: new Date()
  };
  users.push(user);
  return user;
};

const createIdea = async ({
  title,
  description,
  category,
  categoryDetails,
  submitterId,
  submitterEmail,
  fileAttachment,
  status = 'submitted',
  statusComment
}) => {
  if (isDatabaseReady()) {
    const idea = new Idea({
      title,
      description,
      category,
      categoryDetails: categoryDetails || {},
      submitterId,
      submitterEmail,
      status,
      reviewStages: createStageState(),
      currentStage: null,
      stageHistory: [],
      scoreHistory: [],
      scoreSummary: {
        totalScore: 0,
        scoredStages: 0,
        averageScore: 0,
        stageScores: {}
      },
      fileAttachment
    });

    idea.currentStage = findCurrentStageName(idea.reviewStages);

    idea.statusHistory.push({
      oldStatus: null,
      newStatus: status,
      changedBy: submitterId,
      changedAt: new Date(),
      comment: statusComment || (status === 'draft' ? 'Draft saved' : 'Idea submitted')
    });

    await idea.save();
    return idea;
  }

  const now = new Date();
  const idea = {
    _id: createId('idea'),
    title,
    description,
    category,
    categoryDetails: categoryDetails || {},
    submitterId,
    submitterEmail,
    status,
    reviewStages: createStageState(),
    currentStage: null,
    stageHistory: [],
    scoreHistory: [],
    scoreSummary: {
      totalScore: 0,
      scoredStages: 0,
      averageScore: 0,
      stageScores: {}
    },
    fileAttachment: fileAttachment || undefined,
    statusHistory: [
      {
        oldStatus: null,
        newStatus: status,
        changedBy: submitterId,
        changedAt: now,
        comment: statusComment || (status === 'draft' ? 'Draft saved' : 'Idea submitted')
      }
    ],
    createdAt: now,
    updatedAt: now
  };

  idea.currentStage = findCurrentStageName(idea.reviewStages);

  ideas.push(idea);
  return idea;
};

const listIdeas = async ({ status, submitterId, page = 1, limit = 10 }) => {
  if (isDatabaseReady()) {
    const query = {};
    if (status) {
      query.status = status;
    }
    if (submitterId) {
      query.submitterId = submitterId;
    }
    const skip = (page - 1) * limit;

    const result = await Idea.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .select('title submitterEmail status currentStage reviewStages createdAt category');

    const total = await Idea.countDocuments(query);

    return { ideas: result, total };
  }

  const filtered = ideas.filter((idea) => {
    if (status && idea.status !== status) {
      return false;
    }
    if (submitterId && String(idea.submitterId) !== String(submitterId)) {
      return false;
    }
    return true;
  });
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const skip = (page - 1) * limit;

  return {
    ideas: filtered.slice(skip, skip + limit).map((idea) => ({
      _id: idea._id,
      title: idea.title,
      submitterEmail: idea.submitterEmail,
      status: idea.status,
      currentStage: idea.currentStage || null,
      reviewStages: idea.reviewStages || [],
      createdAt: idea.createdAt,
      category: idea.category
    })),
    total: filtered.length
  };
};

const findIdeaById = async (id) => {
  if (isDatabaseReady()) {
    const idea = await Idea.findById(id);
    if (idea) {
      normalizeStageState(idea);
      await idea.save();
    }
    return idea;
  }

  const found = ideas.find((idea) => idea._id === id) || null;
  if (found) {
    normalizeStageState(found);
  }
  return found;
};

const updateIdeaStatus = async ({ id, newStatus, comment, changedBy }) => {
  if (isDatabaseReady()) {
    const idea = await Idea.findById(id);
    if (!idea) {
      return null;
    }

    const oldStatus = idea.status;
    idea.status = newStatus;
    idea.updatedAt = new Date();
    idea.statusHistory.push({
      oldStatus,
      newStatus,
      changedBy,
      changedAt: new Date(),
      comment: comment || `Status changed to ${newStatus}`
    });

    await idea.save();
    return idea;
  }

  const idea = ideas.find((item) => item._id === id);
  if (!idea) {
    return null;
  }

  const oldStatus = idea.status;
  idea.status = newStatus;
  idea.updatedAt = new Date();
  idea.statusHistory.push({
    oldStatus,
    newStatus,
    changedBy,
    changedAt: new Date(),
    comment: comment || `Status changed to ${newStatus}`
  });

  return idea;
};

const updateDraftIdea = async ({ id, updates }) => {
  if (isDatabaseReady()) {
    const idea = await Idea.findById(id);
    if (!idea) {
      return null;
    }

    Object.assign(idea, updates);
    normalizeStageState(idea);
    idea.updatedAt = new Date();
    await idea.save();
    return idea;
  }

  const idea = ideas.find((item) => item._id === id);
  if (!idea) {
    return null;
  }

  Object.assign(idea, updates);
  normalizeStageState(idea);
  idea.updatedAt = new Date();
  return idea;
};

const submitDraftIdea = async ({ id, changedBy, comment }) => {
  if (isDatabaseReady()) {
    const idea = await Idea.findById(id);
    if (!idea) {
      return null;
    }

    const oldStatus = idea.status;
    normalizeStageState(idea);
    idea.status = 'submitted';
    idea.updatedAt = new Date();
    idea.statusHistory.push({
      oldStatus,
      newStatus: 'submitted',
      changedBy,
      changedAt: new Date(),
      comment: comment || 'Draft submitted'
    });

    await idea.save();
    return idea;
  }

  const idea = ideas.find((item) => item._id === id);
  if (!idea) {
    return null;
  }

  const oldStatus = idea.status;
  normalizeStageState(idea);
  idea.status = 'submitted';
  idea.updatedAt = new Date();
  idea.statusHistory.push({
    oldStatus,
    newStatus: 'submitted',
    changedBy,
    changedAt: new Date(),
    comment: comment || 'Draft submitted'
  });

  return idea;
};

const getReviewStageConfig = async () => cloneStageConfig();

const setReviewStageConfig = async (updates) => {
  const allowedNames = new Set(REVIEW_STAGE_ORDER);
  const byName = new Map(cloneStageConfig().map((stage) => [stage.name, stage]));

  (updates || []).forEach((item) => {
    if (!item || !allowedNames.has(item.name)) {
      return;
    }
    byName.set(item.name, {
      name: item.name,
      enabled: Boolean(item.enabled),
      blind: Boolean(item.blind)
    });
  });

  reviewStageConfig = REVIEW_STAGE_ORDER.map((name) => {
    const configured = byName.get(name);
    return configured || { name, enabled: true, blind: false };
  });

  if (isDatabaseReady()) {
    const docs = await Idea.find({ status: { $in: ['submitted', 'under_review'] } });
    for (const idea of docs) {
      normalizeStageState(idea);
      await idea.save();
    }
  } else {
    ideas.forEach((idea) => {
      if (idea.status === 'submitted' || idea.status === 'under_review') {
        normalizeStageState(idea);
      }
    });
  }

  return cloneStageConfig();
};

const decideIdeaStage = async ({ id, decision, comment, evaluatorId, score }) => {
  const applyDecision = (idea) => {
    normalizeStageState(idea);

    if (idea.status === 'accepted' || idea.status === 'rejected' || idea.status === 'draft') {
      return { error: 'Idea is already closed or not reviewable', code: 400 };
    }

    const currentStage = (idea.reviewStages || []).find((stage) => stage.name === idea.currentStage);
    if (!currentStage || !currentStage.enabled || currentStage.status !== 'pending') {
      return { error: 'No active review stage available', code: 400 };
    }

    const normalizedDecision = decision === 'reject' ? 'reject' : 'approve';

    if (score !== undefined && score !== null) {
      recordStageScore({ idea, stage: currentStage, score, evaluatorId, comment });
    }

    currentStage.status = normalizedDecision === 'approve' ? 'approved' : 'rejected';
    currentStage.decidedBy = evaluatorId;
    currentStage.decidedAt = new Date();
    currentStage.comment = comment || '';

    if (!idea.stageHistory) {
      idea.stageHistory = [];
    }
    idea.stageHistory.push({
      stageName: currentStage.name,
      decision: normalizedDecision,
      comment: comment || '',
      evaluatorId,
      timestamp: new Date()
    });

    const oldStatus = idea.status;
    let nextStatus = idea.status;

    if (normalizedDecision === 'reject') {
      idea.currentStage = null;
      nextStatus = 'rejected';
    } else {
      const nextPending = idea.reviewStages.find((stage) => stage.enabled && stage.status === 'pending');
      if (nextPending) {
        idea.currentStage = nextPending.name;
        nextStatus = 'under_review';
      } else {
        idea.currentStage = null;
        nextStatus = 'accepted';
      }
    }

    idea.status = nextStatus;
    idea.updatedAt = new Date();
    if (!idea.statusHistory) {
      idea.statusHistory = [];
    }
    if (oldStatus !== nextStatus) {
      idea.statusHistory.push({
        oldStatus,
        newStatus: nextStatus,
        changedBy: evaluatorId,
        changedAt: new Date(),
        comment: comment || `Stage ${currentStage.name}: ${normalizedDecision}`
      });
    }

    return { idea };
  };

  if (isDatabaseReady()) {
    const idea = await Idea.findById(id);
    if (!idea) {
      return { error: 'Idea not found', code: 404 };
    }

    const result = applyDecision(idea);
    if (result.error) {
      return result;
    }

    await idea.save();
    return { idea };
  }

  const idea = ideas.find((item) => item._id === id);
  if (!idea) {
    return { error: 'Idea not found', code: 404 };
  }

  return applyDecision(idea);
};

const scoreIdeaStage = async ({ id, score, comment, evaluatorId }) => {
  const applyScore = (idea) => {
    normalizeStageState(idea);

    if (idea.status === 'accepted' || idea.status === 'rejected' || idea.status === 'draft') {
      return { error: 'Idea is already closed or not reviewable', code: 400 };
    }

    const currentStage = (idea.reviewStages || []).find((stage) => stage.name === idea.currentStage);
    if (!currentStage || !currentStage.enabled || currentStage.status !== 'pending') {
      return { error: 'No active review stage available', code: 400 };
    }

    recordStageScore({ idea, stage: currentStage, score, evaluatorId, comment });
    idea.updatedAt = new Date();
    return { idea };
  };

  if (isDatabaseReady()) {
    const idea = await Idea.findById(id);
    if (!idea) {
      return { error: 'Idea not found', code: 404 };
    }

    const result = applyScore(idea);
    if (result.error) {
      return result;
    }

    await idea.save();
    return { idea };
  }

  const idea = ideas.find((item) => item._id === id);
  if (!idea) {
    return { error: 'Idea not found', code: 404 };
  }

  return applyScore(idea);
};

module.exports = {
  isDatabaseReady,
  ensureDefaultAdmin,
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
  findUserByEmail,
  createUser,
  createIdea,
  listIdeas,
  findIdeaById,
  updateIdeaStatus,
  updateDraftIdea,
  submitDraftIdea,
  getReviewStageConfig,
  setReviewStageConfig,
  decideIdeaStage,
  scoreIdeaStage
};

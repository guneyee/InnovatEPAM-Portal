# Data Model - InnovatEPAM Portal

## Entities

1. User
2. Idea
3. FileAttachment
4. ReviewStage
5. StageHistoryEvent
6. ScoreHistoryEvent
7. StatusHistoryEvent

## User

**Purpose**: Represents a platform account that can submit ideas or perform review actions.

**Fields**:

1. `id`: MongoDB object identifier
2. `email`: unique, lowercased login identity
3. `password`: bcrypt hash
4. `role`: one of `submitter`, `evaluator`, `admin`
5. `createdAt`: creation timestamp

**Rules**:

1. Email must be unique.
2. Password is never returned in API responses.
3. Role controls access to privileged routes.

## Idea

**Purpose**: Core business record for an innovation submission and its lifecycle.

**Fields**:

1. `id`: MongoDB object identifier
2. `title`: 1-100 characters
3. `description`: 10-2000 characters
4. `category`: business category string
5. `categoryDetails`: category-specific detail map
6. `submitterId`: reference to `User`
7. `submitterEmail`: denormalized email for display and fallback operation
8. `status`: one of `draft`, `submitted`, `under_review`, `accepted`, `rejected`
9. `currentStage`: active review stage name or `null`
10. `reviewStages`: ordered list of stage configuration and decisions
11. `stageHistory`: history of stage decisions
12. `scoreHistory`: history of stage scores
13. `scoreSummary`: aggregate review scoring snapshot
14. `fileAttachment`: optional embedded attachment metadata
15. `statusHistory`: status transition audit trail
16. `createdAt`: creation timestamp
17. `updatedAt`: last update timestamp

**Rules**:

1. New direct submissions default to `submitted`.
2. Drafts may be partial, but final submission must satisfy validation rules.
3. Category-specific required fields depend on the selected category.
4. Admin/evaluator transitions and stage decisions append to history collections.

## FileAttachment

**Purpose**: Stores metadata for the optional single uploaded file.

**Fields**:

1. `originalName`
2. `filename`
3. `mimetype`
4. `size`
5. `uploadedAt`

**Rules**:

1. Only one attachment is supported in the MVP.
2. Files must match the server allowlist.
3. Missing files on disk are treated as retrieval errors, not silent success.

## ReviewStage

**Purpose**: Configures and tracks progression through the evaluation pipeline.

**Fields**:

1. `name`
2. `enabled`
3. `blind`
4. `status`: `pending`, `approved`, `rejected`, or `skipped`
5. `score`
6. `decidedBy`
7. `decidedAt`
8. `comment`

**Rules**:

1. Only enabled stages participate in progression.
2. Blind mode hides submitter identity from evaluator-facing responses on the active stage.
3. Rejecting a stage can terminate the pipeline early.

## History Records

### StageHistoryEvent

1. `stageName`
2. `decision`
3. `comment`
4. `evaluatorId`
5. `timestamp`

### ScoreHistoryEvent

1. `stageName`
2. `score`
3. `evaluatorId`
4. `comment`
5. `timestamp`

### StatusHistoryEvent

1. `oldStatus`
2. `newStatus`
3. `changedBy`
4. `changedAt`
5. `comment`

## Relationships

1. One `User` can own many `Idea` records.
2. One `Idea` belongs to exactly one submitter.
3. One `Idea` can have one embedded `FileAttachment`.
4. One `Idea` can have many review stages and history entries.

## Validation Notes

1. `Technical` requires `techStack` and `complexity`.
2. `Process Improvement` requires `processArea` and `efficiencyGain`.
3. `Client Solution` requires `clientSegment` and `valueProposition`.
4. `Other` requires `expectedOutcome` and `whyNow`.
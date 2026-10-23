import mongoose from 'mongoose';

const readingProgressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    storyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Story',
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    completedPages: {
      type: [Number], // array of unique page numbers explicitly completed, e.g. [1, 2, 3]
      default: [],
    },
    lastOpenedPage: {
      type: Number,
      default: 1,
    },
    totalPages: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
    },
    progressPercent: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    lastReadAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index so each student has one reading progress record per story per class
readingProgressSchema.index({ studentId: 1, storyId: 1 }, { unique: true });

export default mongoose.model('ReadingProgress', readingProgressSchema);

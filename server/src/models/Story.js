import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema(
  {
    pageNumber: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    scenePrompt: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const storySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Story title is required'],
      trim: true,
    },
    theme: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Adventure', 'Friendship', 'Animals', 'Nature', 'Kindness', 'Science', 'Fantasy', 'Family', 'Other'],
      default: 'Adventure',
    },
    targetAge: {
      type: Number,
      required: true,
      min: 3,
      max: 16,
    },
    language: {
      type: String,
      enum: ['en', 'fr', 'ar'],
      required: true,
      default: 'en',
    },
    pageCount: {
      type: Number,
      required: true,
      enum: [5, 8, 10, 13, 15],
    },
    pages: {
      type: [pageSchema],
      required: true,
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length === this.pageCount;
        },
        message: 'Pages array length must match pageCount',
      },
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    coverTheme: {
      type: String,
      default: 'stars', // gradient/theme identifier for UI card cover
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    translatedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Story',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Story', storySchema);

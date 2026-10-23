import Story from '../models/Story.js';
import Class from '../models/Class.js';
import Assignment from '../models/Assignment.js';
import ReadingProgress from '../models/ReadingProgress.js';
import { generateStoryWithAI, translateStoryWithAI } from '../services/aiStoryService.js';
import { sanitizeStoryPages } from '../services/contentSafetyService.js';

// @desc    Generate a story using AI
// @route   POST /api/stories/generate
// @access  Private (Teacher)
export const generateStory = async (req, res) => {
  try {
    const { theme, targetAge, language, pageCount, category } = req.body;

    if (!theme || !targetAge || !language || !pageCount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide theme, targetAge, language, and pageCount (5, 8, 10, 13, or 15).',
      });
    }

    const storyData = await generateStoryWithAI({
      theme: theme.trim(),
      targetAge: Number(targetAge),
      language,
      pageCount: Number(pageCount),
    });

    if (category) {
      storyData.category = category;
    }

    // Safety validation
    const safetyCheck = sanitizeStoryPages(storyData.pages);
    if (!safetyCheck.safe) {
      return res.status(422).json({
        success: false,
        message: `Safety check failed: ${safetyCheck.reason}`,
      });
    }

    // Save as draft in database
    const story = await Story.create({
      ...storyData,
      teacherId: req.user._id,
      status: 'draft',
    });

    res.status(201).json({
      success: true,
      message: 'Story generated successfully as Draft. Please review before publishing.',
      data: story,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get teacher's stories with filtering & search
// @route   GET /api/stories
// @access  Private (Teacher)
export const getStories = async (req, res) => {
  try {
    const { search, status, language, category, minAge, maxAge } = req.query;

    const query = { teacherId: req.user._id };

    if (status && ['draft', 'published'].includes(status)) {
      query.status = status;
    }

    if (language && ['en', 'fr', 'ar'].includes(language)) {
      query.language = language;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { theme: { $regex: search, $options: 'i' } },
      ];
    }

    if (minAge || maxAge) {
      query.targetAge = {};
      if (minAge) query.targetAge.$gte = Number(minAge);
      if (maxAge) query.targetAge.$lte = Number(maxAge);
    }

    const stories = await Story.find(query).sort({ updatedAt: -1 });

    // Populate assignment count for each story
    const storiesWithMeta = await Promise.all(
      stories.map(async (story) => {
        const assignments = await Assignment.find({ storyId: story._id }).populate('classId', 'name');
        const hasActiveReaders = await ReadingProgress.exists({
          storyId: story._id,
          status: { $in: ['in_progress', 'completed'] },
        });

        return {
          ...story.toObject(),
          assignedClasses: assignments.map((a) => a.classId),
          hasActiveReaders: !!hasActiveReaders,
        };
      })
    );

    res.json({ success: true, count: storiesWithMeta.length, data: storiesWithMeta });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single story by ID
// @route   GET /api/stories/:id
// @access  Private (Teacher or Student assigned to it)
export const getStoryById = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    // Role check
    if (req.user.role === 'teacher') {
      if (story.teacherId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied: not your story' });
      }
    } else if (req.user.role === 'student') {
      // Must be published and assigned to student's class
      if (story.status !== 'published') {
        return res.status(403).json({ success: false, message: 'Story is not published' });
      }
      const isAssigned = await Assignment.exists({ storyId: story._id, classId: req.user.classId });
      if (!isAssigned) {
        return res.status(403).json({ success: false, message: 'Story is not assigned to your class' });
      }
    }

    const hasActiveReaders = await ReadingProgress.exists({
      storyId: story._id,
      status: { $in: ['in_progress', 'completed'] },
    });

    const assignments = await Assignment.find({ storyId: story._id }).populate('classId', 'name');

    res.json({
      success: true,
      data: {
        ...story.toObject(),
        hasActiveReaders: !!hasActiveReaders,
        assignedClasses: assignments.map((a) => a.classId),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update story (edit title, page content, category, status)
// @route   PUT /api/stories/:id
// @access  Private (Teacher)
export const updateStory = async (req, res) => {
  try {
    const story = await Story.findOne({ _id: req.params.id, teacherId: req.user._id });
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    const { title, category, pages, status } = req.body;

    // Check if students have started reading
    const hasActiveReaders = await ReadingProgress.exists({
      storyId: story._id,
      status: { $in: ['in_progress', 'completed'] },
    });

    if (pages && Array.isArray(pages)) {
      if (hasActiveReaders && pages.length !== story.pageCount) {
        return res.status(400).json({
          success: false,
          message: 'Cannot add, remove, or reorder pages because students have already started reading this story.',
        });
      }

      // Safety check on edited page contents
      const safety = sanitizeStoryPages(pages);
      if (!safety.safe) {
        return res.status(422).json({ success: false, message: safety.reason });
      }

      story.pages = pages;
      story.pageCount = pages.length;
    }

    if (title) story.title = title.trim();
    if (category) story.category = category;
    if (status && ['draft', 'published'].includes(status)) {
      story.status = status;
    }

    await story.save();

    res.json({ success: true, message: 'Story updated successfully', data: story });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Publish story
// @route   PATCH /api/stories/:id/publish
// @access  Private (Teacher)
export const publishStory = async (req, res) => {
  try {
    const story = await Story.findOne({ _id: req.params.id, teacherId: req.user._id });
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    story.status = 'published';
    await story.save();

    res.json({ success: true, message: 'Story published successfully! It can now be assigned to classes.', data: story });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Translate an existing story using AI
// @route   POST /api/stories/:id/translate
// @access  Private (Teacher)
export const translateStory = async (req, res) => {
  try {
    const { targetLanguage } = req.body;
    const story = await Story.findOne({ _id: req.params.id, teacherId: req.user._id });
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    if (story.language === targetLanguage) {
      return res.status(400).json({ success: false, message: 'Story is already in this language' });
    }

    const translatedData = await translateStoryWithAI(story, targetLanguage);
    const newStory = await Story.create({
      ...translatedData,
      teacherId: req.user._id,
      status: 'draft', // Must be reviewed and approved by teacher before publishing
    });

    res.status(201).json({
      success: true,
      message: `Story translated to ${targetLanguage.toUpperCase()} as a new Draft for review.`,
      data: newStory,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign a published story to one or more classes
// @route   POST /api/stories/:id/assign
// @access  Private (Teacher)
export const assignStory = async (req, res) => {
  try {
    const { classIds } = req.body; // array of class IDs
    if (!classIds || !Array.isArray(classIds) || classIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide at least one classId to assign' });
    }

    const story = await Story.findOne({ _id: req.params.id, teacherId: req.user._id });
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    if (story.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Only published stories can be assigned to classes. Please publish the story first.',
      });
    }

    // Verify all classIds belong to the current teacher
    const validClasses = await Class.find({ _id: { $in: classIds }, teacherId: req.user._id });
    if (validClasses.length !== classIds.length) {
      return res.status(403).json({
        success: false,
        message: 'One or more selected classes do not belong to you or do not exist.',
      });
    }

    const createdAssignments = [];
    for (const cls of validClasses) {
      const existing = await Assignment.findOne({ storyId: story._id, classId: cls._id });
      if (!existing) {
        const assignment = await Assignment.create({
          storyId: story._id,
          classId: cls._id,
          teacherId: req.user._id,
        });
        createdAssignments.push(assignment);
      }
    }

    res.status(200).json({
      success: true,
      message: `Story successfully assigned to ${validClasses.length} class(es).`,
      assignedCount: validClasses.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Unassign a story from a class
// @route   DELETE /api/stories/:id/assign/:classId
// @access  Private (Teacher)
export const unassignStory = async (req, res) => {
  try {
    const { id: storyId, classId } = req.params;

    const assignment = await Assignment.findOneAndDelete({
      storyId,
      classId,
      teacherId: req.user._id,
    });

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    res.json({ success: true, message: 'Story unassigned from class successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a story
// @route   DELETE /api/stories/:id
// @access  Private (Teacher)
export const deleteStory = async (req, res) => {
  try {
    const story = await Story.findOne({ _id: req.params.id, teacherId: req.user._id });
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    // Clean up assignments and progress
    await Assignment.deleteMany({ storyId: story._id });
    await ReadingProgress.deleteMany({ storyId: story._id });
    await Story.findByIdAndDelete(story._id);

    res.json({ success: true, message: 'Story and related assignments removed cleanly.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

import ReadingProgress from '../models/ReadingProgress.js';
import Story from '../models/Story.js';
import Assignment from '../models/Assignment.js';
import User from '../models/User.js';
import Class from '../models/Class.js';

// ==========================================
// STUDENT CONTROLLERS
// ==========================================

// @desc    Get all stories assigned to student's class with personal progress
// @route   GET /api/progress/student/stories
// @access  Private (Student)
export const getStudentAssignedStories = async (req, res) => {
  try {
    const student = req.user;
    if (!student.classId) {
      return res.json({ success: true, count: 0, data: [] });
    }

    // Find all assignments for this student's class
    const assignments = await Assignment.find({ classId: student.classId }).populate('storyId');

    // Only include published stories
    const publishedAssignments = assignments.filter((a) => a.storyId && a.storyId.status === 'published');

    const result = await Promise.all(
      publishedAssignments.map(async (assignment) => {
        const story = assignment.storyId;

        // Fetch or prepare progress record
        let progress = await ReadingProgress.findOne({
          studentId: student._id,
          storyId: story._id,
        });

        if (!progress) {
          progress = {
            status: 'not_started',
            completedPages: [],
            lastOpenedPage: 1,
            progressPercent: 0,
            totalPages: story.pageCount,
          };
        }

        return {
          storyId: story._id,
          title: story.title,
          theme: story.theme,
          category: story.category,
          language: story.language,
          targetAge: story.targetAge,
          totalPages: story.pageCount,
          coverTheme: story.coverTheme,
          status: progress.status,
          completedPagesCount: progress.completedPages ? progress.completedPages.length : 0,
          completedPages: progress.completedPages || [],
          lastOpenedPage: progress.lastOpenedPage || 1,
          progressPercent: progress.progressPercent || 0,
          lastReadAt: progress.lastReadAt || null,
        };
      })
    );

    res.json({ success: true, count: result.length, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get student reading progress for a specific story
// @route   GET /api/progress/student/story/:storyId
// @access  Private (Student)
export const getStudentProgressForStory = async (req, res) => {
  try {
    const student = req.user;
    const { storyId } = req.params;

    const story = await Story.findById(storyId);
    if (!story || story.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Story not available' });
    }

    // Verify assignment to student's class
    const isAssigned = await Assignment.exists({ storyId, classId: student.classId });
    if (!isAssigned) {
      return res.status(403).json({ success: false, message: 'Story is not assigned to your class' });
    }

    let progress = await ReadingProgress.findOne({
      studentId: student._id,
      storyId: story._id,
    });

    if (!progress) {
      progress = await ReadingProgress.create({
        studentId: student._id,
        storyId: story._id,
        classId: student.classId,
        totalPages: story.pageCount,
        completedPages: [],
        lastOpenedPage: 1,
        status: 'not_started',
        progressPercent: 0,
      });
    }

    res.json({
      success: true,
      data: {
        story: {
          _id: story._id,
          title: story.title,
          theme: story.theme,
          category: story.category,
          language: story.language,
          targetAge: story.targetAge,
          pageCount: story.pageCount,
          pages: story.pages,
        },
        progress: {
          status: progress.status,
          completedPages: progress.completedPages,
          lastOpenedPage: progress.lastOpenedPage,
          progressPercent: progress.progressPercent,
          completedPagesCount: progress.completedPages.length,
          totalPages: progress.totalPages,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Record last opened page for automatic resume (Opening a page DOES NOT mark it complete!)
// @route   POST /api/progress/student/story/:storyId/open-page
// @access  Private (Student)
export const updateLastOpenedPage = async (req, res) => {
  try {
    const student = req.user;
    const { storyId } = req.params;
    const { pageNumber } = req.body;

    const pageNum = Number(pageNumber);
    if (!pageNum || pageNum < 1) {
      return res.status(400).json({ success: false, message: 'Valid pageNumber is required' });
    }

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    let progress = await ReadingProgress.findOne({
      studentId: student._id,
      storyId: story._id,
    });

    if (!progress) {
      progress = new ReadingProgress({
        studentId: student._id,
        storyId: story._id,
        classId: student.classId,
        totalPages: story.pageCount,
        completedPages: [],
        lastOpenedPage: pageNum,
        status: 'in_progress', // Opened the story
        progressPercent: 0,
        lastReadAt: new Date(),
      });
    } else {
      progress.lastOpenedPage = pageNum;
      progress.lastReadAt = new Date();
      // If was not_started, moving to in_progress upon opening
      if (progress.status === 'not_started') {
        progress.status = 'in_progress';
      }
    }

    await progress.save();

    res.json({
      success: true,
      data: {
        lastOpenedPage: progress.lastOpenedPage,
        status: progress.status,
        completedPages: progress.completedPages,
        progressPercent: progress.progressPercent,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Explicitly mark a page as completed
// @route   POST /api/progress/student/story/:storyId/complete-page
// @access  Private (Student)
export const markPageCompleted = async (req, res) => {
  try {
    const student = req.user;
    const { storyId } = req.params;
    const { pageNumber } = req.body;

    const pageNum = Number(pageNumber);
    if (!pageNum || pageNum < 1) {
      return res.status(400).json({ success: false, message: 'Valid pageNumber is required' });
    }

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    if (pageNum > story.pageCount) {
      return res.status(400).json({ success: false, message: 'Page number exceeds story total pages' });
    }

    let progress = await ReadingProgress.findOne({
      studentId: student._id,
      storyId: story._id,
    });

    if (!progress) {
      progress = new ReadingProgress({
        studentId: student._id,
        storyId: story._id,
        classId: student.classId,
        totalPages: story.pageCount,
        completedPages: [pageNum],
        lastOpenedPage: pageNum,
        status: story.pageCount === 1 ? 'completed' : 'in_progress',
        progressPercent: Math.round((1 / story.pageCount) * 100),
        lastReadAt: new Date(),
      });
    } else {
      // Add page if not already in completedPages
      if (!progress.completedPages.includes(pageNum)) {
        progress.completedPages.push(pageNum);
        progress.completedPages.sort((a, b) => a - b);
      }

      progress.lastOpenedPage = pageNum;
      progress.lastReadAt = new Date();

      // Calculate progress percent
      const completedCount = progress.completedPages.length;
      progress.progressPercent = Math.min(100, Math.round((completedCount / story.pageCount) * 100));

      if (completedCount >= story.pageCount) {
        progress.status = 'completed';
        progress.completedAt = new Date();
      } else {
        progress.status = 'in_progress';
      }
    }

    await progress.save();

    res.json({
      success: true,
      message: `Page ${pageNum} marked as completed`,
      data: {
        completedPages: progress.completedPages,
        completedPagesCount: progress.completedPages.length,
        totalPages: progress.totalPages,
        progressPercent: progress.progressPercent,
        status: progress.status,
        lastOpenedPage: progress.lastOpenedPage,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// TEACHER CONTROLLERS
// ==========================================

// @desc    Get reading progress for a class and story
// @route   GET /api/progress/teacher/class/:classId/story/:storyId
// @access  Private (Teacher)
export const getTeacherProgressForClassAndStory = async (req, res) => {
  try {
    const { classId, storyId } = req.params;

    // Verify ownership of class
    const cls = await Class.findOne({ _id: classId, teacherId: req.user._id });
    if (!cls) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    // Verify story
    const story = await Story.findOne({ _id: storyId, teacherId: req.user._id });
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    // Get all students in this class
    const students = await User.find({ classId: cls._id, role: 'student' }).sort({ name: 1 });

    // Get all reading progress records for this story & class
    const progressRecords = await ReadingProgress.find({
      classId: cls._id,
      storyId: story._id,
    });

    const progressMap = new Map();
    progressRecords.forEach((pr) => {
      progressMap.set(pr.studentId.toString(), pr);
    });

    let notStartedCount = 0;
    let inProgressCount = 0;
    let completedCount = 0;

    const studentList = students.map((student) => {
      const pr = progressMap.get(student._id.toString());
      const completedPagesCount = pr ? pr.completedPages.length : 0;
      const totalPages = story.pageCount;
      const progressPercent = pr ? pr.progressPercent : 0;
      const status = pr ? pr.status : 'not_started';
      const lastOpenedPage = pr ? pr.lastOpenedPage : 1;
      const lastReadAt = pr ? pr.lastReadAt : null;

      if (status === 'completed') completedCount++;
      else if (status === 'in_progress') inProgressCount++;
      else notStartedCount++;

      return {
        studentId: student._id,
        name: student.name,
        username: student.username,
        avatar: student.avatar,
        completedPagesCount,
        totalPages,
        progressFraction: `${completedPagesCount}/${totalPages} pages`,
        progressPercent,
        status, // 'not_started' | 'in_progress' | 'completed'
        lastOpenedPage,
        lastReadAt,
      };
    });

    const totalStudents = students.length;
    const averageProgress =
      totalStudents > 0
        ? Math.round(studentList.reduce((acc, curr) => acc + curr.progressPercent, 0) / totalStudents)
        : 0;

    res.json({
      success: true,
      data: {
        class: {
          _id: cls._id,
          name: cls.name,
          targetAge: cls.targetAge,
        },
        story: {
          _id: story._id,
          title: story.title,
          language: story.language,
          totalPages: story.pageCount,
        },
        summary: {
          totalStudents,
          notStartedCount,
          inProgressCount,
          completedCount,
          averageProgress,
        },
        students: studentList,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

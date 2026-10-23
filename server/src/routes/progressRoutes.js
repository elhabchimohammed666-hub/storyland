import express from 'express';
import {
  getStudentAssignedStories,
  getStudentProgressForStory,
  updateLastOpenedPage,
  markPageCompleted,
  getTeacherProgressForClassAndStory,
} from '../controllers/progressController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Student routes
router.get('/student/stories', requireRole('student'), getStudentAssignedStories);
router.get('/student/story/:storyId', requireRole('student'), getStudentProgressForStory);
router.post('/student/story/:storyId/open-page', requireRole('student'), updateLastOpenedPage);
router.post('/student/story/:storyId/complete-page', requireRole('student'), markPageCompleted);

// Teacher routes
router.get('/teacher/class/:classId/story/:storyId', requireRole('teacher'), getTeacherProgressForClassAndStory);

export default router;

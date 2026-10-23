import express from 'express';
import {
  generateStory,
  getStories,
  getStoryById,
  updateStory,
  publishStory,
  translateStory,
  assignStory,
  unassignStory,
  deleteStory,
} from '../controllers/storyController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Accessible by teacher or assigned student
router.get('/:id', getStoryById);

// Teacher-only routes
router.post('/generate', requireRole('teacher'), generateStory);
router.get('/', requireRole('teacher'), getStories);
router.put('/:id', requireRole('teacher'), updateStory);
router.patch('/:id/publish', requireRole('teacher'), publishStory);
router.post('/:id/translate', requireRole('teacher'), translateStory);
router.post('/:id/assign', requireRole('teacher'), assignStory);
router.delete('/:id/assign/:classId', requireRole('teacher'), unassignStory);
router.delete('/:id', requireRole('teacher'), deleteStory);

export default router;

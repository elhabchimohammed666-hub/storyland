import express from 'express';
import {
  getTeacherClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  addStudent,
  removeStudent,
} from '../controllers/classController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(requireRole('teacher'));

router.route('/')
  .get(getTeacherClasses)
  .post(createClass);

router.route('/:id')
  .get(getClassById)
  .put(updateClass)
  .delete(deleteClass);

router.post('/:id/students', addStudent);
router.delete('/:classId/students/:studentId', removeStudent);

export default router;

import express from 'express';
import { registerTeacher, loginTeacher, loginStudent, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/teacher/register', registerTeacher);
router.post('/teacher/login', loginTeacher);
router.post('/student/login', loginStudent);
router.get('/me', protect, getMe);

export default router;

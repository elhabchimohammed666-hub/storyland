import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'storyland_super_secure_jwt_secret_key_2026', {
    expiresIn: '30d',
  });
};

// @desc    Register a new teacher
// @route   POST /api/auth/teacher/register
// @access  Public
export const registerTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Teacher with this email already exists' });
    }

    const teacher = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'teacher',
      avatar: 'owl',
    });

    const token = generateToken(teacher._id);

    res.status(201).json({
      success: true,
      data: {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        role: teacher.role,
        avatar: teacher.avatar,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login teacher
// @route   POST /api/auth/teacher/login
// @access  Public
export const loginTeacher = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email and password' });
    }

    const teacher = await User.findOne({ email: email.toLowerCase(), role: 'teacher' });
    if (!teacher || !(await teacher.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(teacher._id);

    res.json({
      success: true,
      data: {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        role: teacher.role,
        avatar: teacher.avatar,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login student
// @route   POST /api/auth/student/login
// @access  Public
export const loginStudent = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please enter username and password' });
    }

    const student = await User.findOne({ username: username.toLowerCase().trim(), role: 'student' }).populate('classId', 'name targetAge');

    if (!student || !(await student.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const token = generateToken(student._id);

    res.json({
      success: true,
      data: {
        _id: student._id,
        name: student.name,
        username: student.username,
        role: student.role,
        avatar: student.avatar,
        classId: student.classId,
        teacherId: student.teacherId,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('classId', 'name targetAge');
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

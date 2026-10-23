import Class from '../models/Class.js';
import User from '../models/User.js';
import Assignment from '../models/Assignment.js';
import ReadingProgress from '../models/ReadingProgress.js';

// @desc    Get all classes for logged-in teacher
// @route   GET /api/classes
// @access  Private (Teacher)
export const getTeacherClasses = async (req, res) => {
  try {
    const classes = await Class.find({ teacherId: req.user._id }).sort({ createdAt: -1 });

    // Attach student count and assignment count
    const enriched = await Promise.all(
      classes.map(async (cls) => {
        const studentCount = await User.countDocuments({ classId: cls._id, role: 'student' });
        const assignmentCount = await Assignment.countDocuments({ classId: cls._id });
        return {
          ...cls.toObject(),
          studentCount,
          assignmentCount,
        };
      })
    );

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single class with students and assignments
// @route   GET /api/classes/:id
// @access  Private (Teacher)
export const getClassById = async (req, res) => {
  try {
    const cls = await Class.findOne({ _id: req.params.id, teacherId: req.user._id });
    if (!cls) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const students = await User.find({ classId: cls._id, role: 'student' }).select('-password').sort({ name: 1 });
    const assignments = await Assignment.find({ classId: cls._id }).populate('storyId');

    res.json({
      success: true,
      data: {
        ...cls.toObject(),
        students,
        assignments,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new class
// @route   POST /api/classes
// @access  Private (Teacher)
export const createClass = async (req, res) => {
  try {
    const { name, description, targetAge } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Class name is required' });
    }

    const newClass = await Class.create({
      name: name.trim(),
      description: description?.trim() || '',
      targetAge: Number(targetAge) || 8,
      teacherId: req.user._id,
    });

    res.status(201).json({ success: true, data: newClass });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a class
// @route   PUT /api/classes/:id
// @access  Private (Teacher)
export const updateClass = async (req, res) => {
  try {
    const { name, description, targetAge } = req.body;

    const cls = await Class.findOne({ _id: req.params.id, teacherId: req.user._id });
    if (!cls) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    if (name) cls.name = name.trim();
    if (description !== undefined) cls.description = description.trim();
    if (targetAge) cls.targetAge = Number(targetAge);

    await cls.save();

    res.json({ success: true, data: cls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a class and clean up associations safely
// @route   DELETE /api/classes/:id
// @access  Private (Teacher)
export const deleteClass = async (req, res) => {
  try {
    const cls = await Class.findOne({ _id: req.params.id, teacherId: req.user._id });
    if (!cls) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    // Clean up students belonging to this class
    const students = await User.find({ classId: cls._id });
    const studentIds = students.map((s) => s._id);

    // Delete reading progress of these students
    await ReadingProgress.deleteMany({ studentId: { $in: studentIds } });
    // Delete students
    await User.deleteMany({ classId: cls._id });
    // Delete class assignments
    await Assignment.deleteMany({ classId: cls._id });
    // Delete class itself
    await Class.findByIdAndDelete(cls._id);

    res.json({ success: true, message: 'Class, students, and related progress removed cleanly.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a student to a class
// @route   POST /api/classes/:id/students
// @access  Private (Teacher)
export const addStudent = async (req, res) => {
  try {
    const { name, username, password, avatar } = req.body;

    const cls = await Class.findOne({ _id: req.params.id, teacherId: req.user._id });
    if (!cls) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    if (!name || !username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, username, and password' });
    }

    const cleanUsername = username.toLowerCase().trim();
    const existing = await User.findOne({ username: cleanUsername });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Username is already taken' });
    }

    const student = await User.create({
      name: name.trim(),
      username: cleanUsername,
      password,
      role: 'student',
      teacherId: req.user._id,
      classId: cls._id,
      avatar: avatar || 'fox',
    });

    res.status(201).json({
      success: true,
      data: {
        _id: student._id,
        name: student.name,
        username: student.username,
        role: student.role,
        avatar: student.avatar,
        classId: student.classId,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove a student from a class
// @route   DELETE /api/classes/:classId/students/:studentId
// @access  Private (Teacher)
export const removeStudent = async (req, res) => {
  try {
    const { classId, studentId } = req.params;

    const cls = await Class.findOne({ _id: classId, teacherId: req.user._id });
    if (!cls) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const student = await User.findOne({ _id: studentId, classId: cls._id, role: 'student' });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found in this class' });
    }

    // Clean up reading progress
    await ReadingProgress.deleteMany({ studentId: student._id });
    // Remove student record
    await User.findByIdAndDelete(student._id);

    res.json({ success: true, message: 'Student and reading records deleted cleanly' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

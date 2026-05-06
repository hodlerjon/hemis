const Student = require('../models/Student');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const getStudents = asyncHandler(async (req, res) => {
  const { faculty, group, isActive, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (faculty) filter.faculty = faculty;
  if (group) filter.group = group;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const skip = (Number(page) - 1) * Number(limit);
  const [students, total] = await Promise.all([
    Student.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('faculty', 'name code')
      .populate('group', 'name code')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    Student.countDocuments(filter),
  ]);

  res.json({ success: true, total, page: Number(page), data: students });
});

const getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id)
    .populate('user', 'firstName lastName email role')
    .populate('faculty')
    .populate('group');

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }
  res.json({ success: true, data: student });
});

const createStudent = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, faculty, group, studentId, dateOfBirth, phone, address } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  const user = await User.create({ firstName, lastName, email, password, role: 'student' });

  const student = await Student.create({ user: user._id, faculty, group, studentId, dateOfBirth, phone, address });

  const populated = await student.populate([
    { path: 'user', select: 'firstName lastName email' },
    { path: 'faculty', select: 'name code' },
    { path: 'group', select: 'name code' },
  ]);

  res.status(201).json({ success: true, data: populated });
});

const updateStudent = asyncHandler(async (req, res) => {
  const { firstName, lastName, ...studentData } = req.body;

  const student = await Student.findById(req.params.id);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  if (firstName || lastName) {
    await User.findByIdAndUpdate(student.user, { firstName, lastName }, { runValidators: true });
  }

  const updated = await Student.findByIdAndUpdate(req.params.id, studentData, {
    new: true,
    runValidators: true,
  })
    .populate('user', 'firstName lastName email')
    .populate('faculty', 'name code')
    .populate('group', 'name code');

  res.json({ success: true, data: updated });
});

const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }
  res.json({ success: true, message: 'Student deleted successfully' });
});

// @desc  Joriy talabaning o'z profili
// @route GET /api/students/me
// @access Private/Student
const getMyProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id })
    .populate('user', 'firstName lastName email')
    .populate('faculty', 'name code')
    .populate('group', 'name code year semester');

  if (!student) {
    res.status(404);
    throw new Error('Student profile not found for this user');
  }
  res.json({ success: true, data: student });
});

module.exports = { getStudents, getStudent, getMyProfile, createStudent, updateStudent, deleteStudent };

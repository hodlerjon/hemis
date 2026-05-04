const Teacher = require('../models/Teacher');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const getTeachers = asyncHandler(async (req, res) => {
  const { faculty, degree, isActive, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (faculty) filter.faculty = faculty;
  if (degree) filter.degree = degree;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const skip = (Number(page) - 1) * Number(limit);
  const [teachers, total] = await Promise.all([
    Teacher.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('faculty', 'name code')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    Teacher.countDocuments(filter),
  ]);

  res.json({ success: true, total, page: Number(page), data: teachers });
});

const getTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id)
    .populate('user', 'firstName lastName email role')
    .populate('faculty');

  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }
  res.json({ success: true, data: teacher });
});

const createTeacher = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, faculty, employeeId, degree, specialization, phone } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  const user = await User.create({ firstName, lastName, email, password, role: 'teacher' });

  const teacher = await Teacher.create({ user: user._id, faculty, employeeId, degree, specialization, phone });

  const populated = await teacher.populate([
    { path: 'user', select: 'firstName lastName email' },
    { path: 'faculty', select: 'name code' },
  ]);

  res.status(201).json({ success: true, data: populated });
});

const updateTeacher = asyncHandler(async (req, res) => {
  const { firstName, lastName, ...teacherData } = req.body;

  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }

  if (firstName || lastName) {
    await User.findByIdAndUpdate(teacher.user, { firstName, lastName }, { runValidators: true });
  }

  const updated = await Teacher.findByIdAndUpdate(req.params.id, teacherData, {
    new: true,
    runValidators: true,
  })
    .populate('user', 'firstName lastName email')
    .populate('faculty', 'name code');

  res.json({ success: true, data: updated });
});

const deleteTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findByIdAndDelete(req.params.id);
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }
  res.json({ success: true, message: 'Teacher deleted successfully' });
});

module.exports = { getTeachers, getTeacher, createTeacher, updateTeacher, deleteTeacher };

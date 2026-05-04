const Grade = require('../models/Grade');
const Student = require('../models/Student');
const asyncHandler = require('../utils/asyncHandler');

const getGrades = asyncHandler(async (req, res) => {
  const { student, subject, teacher, semester, academicYear, letterGrade, page = 1, limit = 50 } = req.query;
  const filter = {};
  if (student) filter.student = student;
  if (subject) filter.subject = subject;
  if (teacher) filter.teacher = teacher;
  if (semester) filter.semester = Number(semester);
  if (academicYear) filter.academicYear = academicYear;
  if (letterGrade) filter.letterGrade = letterGrade;

  // Students can only see their own grades
  if (req.user.role === 'student') {
    const studentRecord = await Student.findOne({ user: req.user._id });
    if (!studentRecord) {
      return res.json({ success: true, total: 0, page: 1, data: [] });
    }
    filter.student = studentRecord._id;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [grades, total] = await Promise.all([
    Grade.find(filter)
      .populate({ path: 'student', populate: { path: 'user', select: 'firstName lastName' } })
      .populate('subject', 'name code credits')
      .populate({ path: 'teacher', populate: { path: 'user', select: 'firstName lastName' } })
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    Grade.countDocuments(filter),
  ]);

  res.json({ success: true, total, page: Number(page), data: grades });
});

const getGrade = asyncHandler(async (req, res) => {
  const grade = await Grade.findById(req.params.id)
    .populate({ path: 'student', populate: { path: 'user', select: 'firstName lastName' } })
    .populate('subject')
    .populate({ path: 'teacher', populate: { path: 'user', select: 'firstName lastName email' } });

  if (!grade) {
    res.status(404);
    throw new Error('Grade not found');
  }
  res.json({ success: true, data: grade });
});

// @desc    Get all grades for a specific student
// @route   GET /api/grades/student/:id
const getStudentGrades = asyncHandler(async (req, res) => {
  const { semester, academicYear } = req.query;
  const filter = { student: req.params.id };
  if (semester) filter.semester = Number(semester);
  if (academicYear) filter.academicYear = academicYear;

  const grades = await Grade.find(filter)
    .populate('subject', 'name code credits type')
    .populate({ path: 'teacher', populate: { path: 'user', select: 'firstName lastName' } })
    .sort({ academicYear: -1, semester: -1 });

  const gpa = grades.length
    ? (grades.reduce((acc, g) => acc + (g.total || 0), 0) / grades.length).toFixed(2)
    : null;

  res.json({ success: true, gpa, count: grades.length, data: grades });
});

const createGrade = asyncHandler(async (req, res) => {
  const grade = await Grade.create(req.body);
  res.status(201).json({ success: true, data: grade });
});

// Uses findById + save() so the pre('save') hook recalculates total & letterGrade
const updateGrade = asyncHandler(async (req, res) => {
  const grade = await Grade.findById(req.params.id);
  if (!grade) {
    res.status(404);
    throw new Error('Grade not found');
  }

  const allowed = ['midterm', 'final', 'exam', 'semester', 'academicYear'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) grade[field] = req.body[field];
  });

  await grade.save();
  res.json({ success: true, data: grade });
});

const deleteGrade = asyncHandler(async (req, res) => {
  const grade = await Grade.findByIdAndDelete(req.params.id);
  if (!grade) {
    res.status(404);
    throw new Error('Grade not found');
  }
  res.json({ success: true, message: 'Grade deleted successfully' });
});

module.exports = { getGrades, getGrade, getStudentGrades, createGrade, updateGrade, deleteGrade };

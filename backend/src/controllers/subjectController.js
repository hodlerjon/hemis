const Subject = require('../models/Subject');
const asyncHandler = require('../utils/asyncHandler');

const getSubjects = asyncHandler(async (req, res) => {
  const { faculty, teacher, type, isActive, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (faculty) filter.faculty = faculty;
  if (teacher) filter.teacher = teacher;
  if (type) filter.type = type;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const skip = (Number(page) - 1) * Number(limit);
  const [subjects, total] = await Promise.all([
    Subject.find(filter)
      .populate('faculty', 'name code')
      .populate({ path: 'teacher', populate: { path: 'user', select: 'firstName lastName' } })
      .skip(skip)
      .limit(Number(limit))
      .sort({ name: 1 }),
    Subject.countDocuments(filter),
  ]);

  res.json({ success: true, total, page: Number(page), data: subjects });
});

const getSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id)
    .populate('faculty')
    .populate({ path: 'teacher', populate: { path: 'user', select: 'firstName lastName email' } });

  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }
  res.json({ success: true, data: subject });
});

const createSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.create(req.body);
  res.status(201).json({ success: true, data: subject });
});

const updateSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('faculty', 'name code')
    .populate({ path: 'teacher', populate: { path: 'user', select: 'firstName lastName' } });

  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }
  res.json({ success: true, data: subject });
});

const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findByIdAndDelete(req.params.id);
  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }
  res.json({ success: true, message: 'Subject deleted successfully' });
});

module.exports = { getSubjects, getSubject, createSubject, updateSubject, deleteSubject };

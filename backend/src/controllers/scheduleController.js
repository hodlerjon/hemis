const Schedule = require('../models/Schedule');
const asyncHandler = require('../utils/asyncHandler');

const getSchedules = asyncHandler(async (req, res) => {
  const { group, teacher, subject, dayOfWeek, academicYear, semester, page = 1, limit = 50 } = req.query;
  const filter = {};
  if (group) filter.group = group;
  if (teacher) filter.teacher = teacher;
  if (subject) filter.subject = subject;
  if (dayOfWeek) filter.dayOfWeek = Number(dayOfWeek);
  if (academicYear) filter.academicYear = academicYear;
  if (semester) filter.semester = Number(semester);

  const skip = (Number(page) - 1) * Number(limit);
  const [schedules, total] = await Promise.all([
    Schedule.find(filter)
      .populate('group', 'name code')
      .populate('subject', 'name code type')
      .populate({ path: 'teacher', populate: { path: 'user', select: 'firstName lastName' } })
      .skip(skip)
      .limit(Number(limit))
      .sort({ dayOfWeek: 1, startTime: 1 }),
    Schedule.countDocuments(filter),
  ]);

  res.json({ success: true, total, page: Number(page), data: schedules });
});

const getSchedule = asyncHandler(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id)
    .populate('group')
    .populate('subject')
    .populate({ path: 'teacher', populate: { path: 'user', select: 'firstName lastName email' } });

  if (!schedule) {
    res.status(404);
    throw new Error('Schedule not found');
  }
  res.json({ success: true, data: schedule });
});

const createSchedule = asyncHandler(async (req, res) => {
  const schedule = await Schedule.create(req.body);
  res.status(201).json({ success: true, data: schedule });
});

const updateSchedule = asyncHandler(async (req, res) => {
  const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('group', 'name code')
    .populate('subject', 'name code')
    .populate({ path: 'teacher', populate: { path: 'user', select: 'firstName lastName' } });

  if (!schedule) {
    res.status(404);
    throw new Error('Schedule not found');
  }
  res.json({ success: true, data: schedule });
});

const deleteSchedule = asyncHandler(async (req, res) => {
  const schedule = await Schedule.findByIdAndDelete(req.params.id);
  if (!schedule) {
    res.status(404);
    throw new Error('Schedule not found');
  }
  res.json({ success: true, message: 'Schedule deleted successfully' });
});

module.exports = { getSchedules, getSchedule, createSchedule, updateSchedule, deleteSchedule };

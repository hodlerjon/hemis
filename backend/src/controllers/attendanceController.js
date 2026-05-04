const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const asyncHandler = require('../utils/asyncHandler');

const getAttendances = asyncHandler(async (req, res) => {
  const { student, schedule, subject, date, status, page = 1, limit = 50 } = req.query;
  const filter = {};
  if (student) filter.student = student;
  if (schedule) filter.schedule = schedule;
  if (subject) filter.subject = subject;
  if (status) filter.status = status;
  if (date) {
    const d = new Date(date);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    filter.date = { $gte: d, $lt: next };
  }

  // Students can only see their own attendance records
  if (req.user.role === 'student') {
    const studentRecord = await Student.findOne({ user: req.user._id });
    if (!studentRecord) {
      return res.json({ success: true, total: 0, page: 1, data: [] });
    }
    filter.student = studentRecord._id;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [records, total] = await Promise.all([
    Attendance.find(filter)
      .populate({ path: 'student', populate: { path: 'user', select: 'firstName lastName' } })
      .populate('subject', 'name code')
      .populate('schedule', 'dayOfWeek startTime endTime room')
      .populate('recordedBy', 'firstName lastName')
      .skip(skip)
      .limit(Number(limit))
      .sort({ date: -1 }),
    Attendance.countDocuments(filter),
  ]);

  res.json({ success: true, total, page: Number(page), data: records });
});

const getAttendance = asyncHandler(async (req, res) => {
  const record = await Attendance.findById(req.params.id)
    .populate({ path: 'student', populate: { path: 'user', select: 'firstName lastName' } })
    .populate('subject')
    .populate('schedule')
    .populate('recordedBy', 'firstName lastName');

  if (!record) {
    res.status(404);
    throw new Error('Attendance record not found');
  }
  res.json({ success: true, data: record });
});

// @desc    Get attendance by student ID
// @route   GET /api/attendance/student/:id
const getStudentAttendance = asyncHandler(async (req, res) => {
  const { subject, from, to } = req.query;
  const filter = { student: req.params.id };
  if (subject) filter.subject = subject;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }

  const records = await Attendance.find(filter)
    .populate('subject', 'name code')
    .populate('schedule', 'dayOfWeek startTime endTime room')
    .sort({ date: -1 });

  const summary = {
    total: records.length,
    present: records.filter((r) => r.status === 'present').length,
    absent: records.filter((r) => r.status === 'absent').length,
    late: records.filter((r) => r.status === 'late').length,
    excused: records.filter((r) => r.status === 'excused').length,
  };

  res.json({ success: true, summary, data: records });
});

const createAttendance = asyncHandler(async (req, res) => {
  const record = await Attendance.create({ ...req.body, recordedBy: req.user._id });
  res.status(201).json({ success: true, data: record });
});

const bulkCreateAttendance = asyncHandler(async (req, res) => {
  const { records } = req.body;
  if (!Array.isArray(records) || records.length === 0) {
    res.status(400);
    throw new Error('Records array is required and must not be empty');
  }
  const withRecorder = records.map((r) => ({ ...r, recordedBy: req.user._id }));
  const created = await Attendance.insertMany(withRecorder, { ordered: false });
  res.status(201).json({ success: true, count: created.length, data: created });
});

const updateAttendance = asyncHandler(async (req, res) => {
  const record = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!record) {
    res.status(404);
    throw new Error('Attendance record not found');
  }
  res.json({ success: true, data: record });
});

const deleteAttendance = asyncHandler(async (req, res) => {
  const record = await Attendance.findByIdAndDelete(req.params.id);
  if (!record) {
    res.status(404);
    throw new Error('Attendance record not found');
  }
  res.json({ success: true, message: 'Attendance record deleted' });
});

module.exports = {
  getAttendances,
  getAttendance,
  getStudentAttendance,
  createAttendance,
  bulkCreateAttendance,
  updateAttendance,
  deleteAttendance,
};

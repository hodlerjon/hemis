const Group = require('../models/Group');
const asyncHandler = require('../utils/asyncHandler');

const getGroups = asyncHandler(async (req, res) => {
  const { faculty, year, semester, isActive, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (faculty) filter.faculty = faculty;
  if (year) filter.year = Number(year);
  if (semester) filter.semester = Number(semester);
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const skip = (Number(page) - 1) * Number(limit);
  const [groups, total] = await Promise.all([
    Group.find(filter).populate('faculty', 'name code').skip(skip).limit(Number(limit)).sort({ name: 1 }),
    Group.countDocuments(filter),
  ]);

  res.json({ success: true, total, page: Number(page), data: groups });
});

const getGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id).populate('faculty');
  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }
  res.json({ success: true, data: group });
});

const createGroup = asyncHandler(async (req, res) => {
  const group = await Group.create(req.body);
  res.status(201).json({ success: true, data: group });
});

const updateGroup = asyncHandler(async (req, res) => {
  const group = await Group.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('faculty', 'name code');

  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }
  res.json({ success: true, data: group });
});

const deleteGroup = asyncHandler(async (req, res) => {
  const group = await Group.findByIdAndDelete(req.params.id);
  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }
  res.json({ success: true, message: 'Group deleted successfully' });
});

module.exports = { getGroups, getGroup, createGroup, updateGroup, deleteGroup };

const Faculty = require('../models/Faculty');
const asyncHandler = require('../utils/asyncHandler');

const getFaculties = asyncHandler(async (req, res) => {
  const { isActive, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const skip = (Number(page) - 1) * Number(limit);
  const [faculties, total] = await Promise.all([
    Faculty.find(filter).populate('dean', 'user employeeId').skip(skip).limit(Number(limit)).sort({ name: 1 }),
    Faculty.countDocuments(filter),
  ]);

  res.json({ success: true, total, page: Number(page), data: faculties });
});

const getFaculty = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findById(req.params.id).populate('dean');
  if (!faculty) {
    res.status(404);
    throw new Error('Faculty not found');
  }
  res.json({ success: true, data: faculty });
});

const createFaculty = asyncHandler(async (req, res) => {
  const faculty = await Faculty.create(req.body);
  res.status(201).json({ success: true, data: faculty });
});

const updateFaculty = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!faculty) {
    res.status(404);
    throw new Error('Faculty not found');
  }
  res.json({ success: true, data: faculty });
});

const deleteFaculty = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findByIdAndDelete(req.params.id);
  if (!faculty) {
    res.status(404);
    throw new Error('Faculty not found');
  }
  res.json({ success: true, message: 'Faculty deleted successfully' });
});

module.exports = { getFaculties, getFaculty, createFaculty, updateFaculty, deleteFaculty };

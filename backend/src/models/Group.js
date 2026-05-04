const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
      maxlength: [50, 'Group name cannot exceed 50 characters'],
    },
    code: {
      type: String,
      required: [true, 'Group code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [15, 'Group code cannot exceed 15 characters'],
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      required: [true, 'Faculty is required'],
    },
    year: {
      type: Number,
      required: [true, 'Academic year is required'],
      min: [1, 'Year must be at least 1'],
      max: [6, 'Year cannot exceed 6'],
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester must be at least 1'],
      max: [2, 'Semester cannot exceed 2'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Group', groupSchema);

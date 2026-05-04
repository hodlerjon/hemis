const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Faculty name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Faculty name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Faculty code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [10, 'Faculty code cannot exceed 10 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    dean: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Faculty', facultySchema);

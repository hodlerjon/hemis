const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject is required'],
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'Teacher is required'],
    },
    midterm: {
      type: Number,
      min: [0, 'Midterm grade cannot be negative'],
      max: [100, 'Midterm grade cannot exceed 100'],
    },
    final: {
      type: Number,
      min: [0, 'Final grade cannot be negative'],
      max: [100, 'Final grade cannot exceed 100'],
    },
    exam: {
      type: Number,
      min: [0, 'Exam grade cannot be negative'],
      max: [100, 'Exam grade cannot exceed 100'],
    },
    total: {
      type: Number,
      min: [0, 'Total grade cannot be negative'],
      max: [100, 'Total grade cannot exceed 100'],
    },
    letterGrade: {
      type: String,
      enum: ['A', 'B', 'C', 'D', 'F'],
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1],
      max: [2],
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      match: [/^\d{4}-\d{4}$/, 'Academic year must be in YYYY-YYYY format'],
    },
  },
  { timestamps: true }
);

gradeSchema.index({ student: 1, subject: 1, semester: 1, academicYear: 1 }, { unique: true });

gradeSchema.pre('save', function (next) {
  const weights = { midterm: 0.3, final: 0.3, exam: 0.4 };
  let total = 0;
  let weightSum = 0;

  if (this.midterm != null) { total += this.midterm * weights.midterm; weightSum += weights.midterm; }
  if (this.final != null)   { total += this.final   * weights.final;   weightSum += weights.final;   }
  if (this.exam != null)    { total += this.exam    * weights.exam;    weightSum += weights.exam;    }

  if (weightSum > 0) {
    this.total = Math.round(total / weightSum);
    if      (this.total >= 90) this.letterGrade = 'A';
    else if (this.total >= 75) this.letterGrade = 'B';
    else if (this.total >= 60) this.letterGrade = 'C';
    else if (this.total >= 50) this.letterGrade = 'D';
    else                       this.letterGrade = 'F';
  }

  next();
});

module.exports = mongoose.model('Grade', gradeSchema);

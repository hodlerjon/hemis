const express = require('express');
const { body } = require('express-validator');
const {
  getAttendances,
  getAttendance,
  getStudentAttendance,
  createAttendance,
  bulkCreateAttendance,
  updateAttendance,
  deleteAttendance,
} = require('../controllers/attendanceController');
const { protect } = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');
const validateObjectId = require('../middlewares/validateObjectId');
const handleValidation = require('../middlewares/handleValidation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Attendance tracking
 */

/**
 * @swagger
 * /attendance:
 *   get:
 *     summary: Get all attendance records
 *     tags: [Attendance]
 *     parameters:
 *       - in: query
 *         name: student
 *         schema: { type: string }
 *       - in: query
 *         name: subject
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [present, absent, late, excused] }
 *       - in: query
 *         name: date
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: List of attendance records
 */
router.get('/', protect, getAttendances);

/**
 * @swagger
 * /attendance/student/{id}:
 *   get:
 *     summary: Get attendance summary for a student
 *     tags: [Attendance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: subject
 *         schema: { type: string }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Student attendance summary and records
 */
router.get('/student/:id', protect, validateObjectId(), getStudentAttendance);

router.get('/:id', protect, validateObjectId(), getAttendance);

/**
 * @swagger
 * /attendance:
 *   post:
 *     summary: Create a single attendance record
 *     tags: [Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [student, schedule, subject, date, status]
 *             properties:
 *               student:  { type: string }
 *               schedule: { type: string }
 *               subject:  { type: string }
 *               date:     { type: string, format: date }
 *               status:   { type: string, enum: [present, absent, late, excused] }
 *               note:     { type: string }
 *     responses:
 *       201:
 *         description: Attendance record created
 */
router.post(
  '/',
  protect,
  authorize('admin', 'teacher'),
  [
    body('student').notEmpty().withMessage('Student is required'),
    body('schedule').notEmpty().withMessage('Schedule is required'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('status').isIn(['present', 'absent', 'late', 'excused']).withMessage('Invalid status'),
  ],
  handleValidation,
  createAttendance
);

/**
 * @swagger
 * /attendance/bulk:
 *   post:
 *     summary: Bulk create attendance records for a class
 *     tags: [Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [records]
 *             properties:
 *               records:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     student:  { type: string }
 *                     schedule: { type: string }
 *                     subject:  { type: string }
 *                     date:     { type: string }
 *                     status:   { type: string }
 *     responses:
 *       201:
 *         description: Bulk records created
 */
router.post('/bulk', protect, authorize('admin', 'teacher'), bulkCreateAttendance);

router.put('/:id', protect, authorize('admin', 'teacher'), validateObjectId(), updateAttendance);
router.delete('/:id', protect, authorize('admin'), validateObjectId(), deleteAttendance);

module.exports = router;

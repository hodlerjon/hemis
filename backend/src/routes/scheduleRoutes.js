const express = require('express');
const { body } = require('express-validator');
const {
  getSchedules, getSchedule, createSchedule, updateSchedule, deleteSchedule,
} = require('../controllers/scheduleController');
const { protect } = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');
const validateObjectId = require('../middlewares/validateObjectId');
const handleValidation = require('../middlewares/handleValidation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Schedules
 *   description: Class schedule management
 */

/**
 * @swagger
 * /schedules:
 *   get:
 *     summary: Get all schedules
 *     tags: [Schedules]
 *     parameters:
 *       - in: query
 *         name: group
 *         schema: { type: string }
 *       - in: query
 *         name: teacher
 *         schema: { type: string }
 *       - in: query
 *         name: subject
 *         schema: { type: string }
 *       - in: query
 *         name: dayOfWeek
 *         schema: { type: integer, minimum: 1, maximum: 7 }
 *       - in: query
 *         name: academicYear
 *         schema: { type: string, example: "2024-2025" }
 *       - in: query
 *         name: semester
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of schedules
 */
router.get('/', protect, getSchedules);
router.get('/:id', protect, validateObjectId(), getSchedule);

/**
 * @swagger
 * /schedules:
 *   post:
 *     summary: Create a schedule entry
 *     tags: [Schedules]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [group, subject, teacher, dayOfWeek, startTime, endTime, room, semester, academicYear]
 *             properties:
 *               group:        { type: string }
 *               subject:      { type: string }
 *               teacher:      { type: string }
 *               dayOfWeek:    { type: integer, minimum: 1, maximum: 7 }
 *               startTime:    { type: string, example: "09:00" }
 *               endTime:      { type: string, example: "10:30" }
 *               room:         { type: string }
 *               semester:     { type: integer }
 *               academicYear: { type: string, example: "2024-2025" }
 *     responses:
 *       201:
 *         description: Schedule created
 */
router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('group').notEmpty().withMessage('Group is required'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('teacher').notEmpty().withMessage('Teacher is required'),
    body('dayOfWeek').isInt({ min: 1, max: 7 }).withMessage('Day of week must be between 1 and 7'),
    body('startTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Start time must be HH:MM'),
    body('endTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('End time must be HH:MM'),
    body('room').notEmpty().withMessage('Room is required'),
    body('semester').isInt({ min: 1, max: 2 }).withMessage('Semester must be 1 or 2'),
    body('academicYear').matches(/^\d{4}-\d{4}$/).withMessage('Academic year must be YYYY-YYYY'),
  ],
  handleValidation,
  createSchedule
);

router.put('/:id', protect, authorize('admin'), validateObjectId(), updateSchedule);
router.delete('/:id', protect, authorize('admin'), validateObjectId(), deleteSchedule);

module.exports = router;

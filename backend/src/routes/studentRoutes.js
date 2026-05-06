const express = require('express');
const { body } = require('express-validator');
const {
  getStudents, getStudent, getMyProfile, createStudent, updateStudent, deleteStudent,
} = require('../controllers/studentController');
const { protect } = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');
const validateObjectId = require('../middlewares/validateObjectId');
const handleValidation = require('../middlewares/handleValidation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Student management
 */

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Get all students
 *     tags: [Students]
 *     parameters:
 *       - in: query
 *         name: faculty
 *         schema: { type: string }
 *       - in: query
 *         name: group
 *         schema: { type: string }
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: List of students
 */
router.get('/me', protect, authorize('student'), getMyProfile);
router.get('/', protect, authorize('admin', 'teacher'), getStudents);
router.get('/:id', protect, validateObjectId(), getStudent);

/**
 * @swagger
 * /students:
 *   post:
 *     summary: Create a student (also creates linked user)
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password, faculty, group, studentId]
 *             properties:
 *               firstName:  { type: string }
 *               lastName:   { type: string }
 *               email:      { type: string }
 *               password:   { type: string }
 *               faculty:    { type: string }
 *               group:      { type: string }
 *               studentId:  { type: string }
 *               dateOfBirth: { type: string, format: date }
 *               phone:      { type: string }
 *               address:    { type: string }
 *     responses:
 *       201:
 *         description: Student created
 */
router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('faculty').notEmpty().withMessage('Faculty is required'),
    body('group').notEmpty().withMessage('Group is required'),
    body('studentId').notEmpty().withMessage('Student ID is required'),
  ],
  handleValidation,
  createStudent
);

router.put('/:id', protect, authorize('admin'), validateObjectId(), updateStudent);
router.delete('/:id', protect, authorize('admin'), validateObjectId(), deleteStudent);

module.exports = router;

const express = require('express');
const { body } = require('express-validator');
const {
  getTeachers, getTeacher, getMyProfile, createTeacher, updateTeacher, deleteTeacher,
} = require('../controllers/teacherController');
const { protect } = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');
const validateObjectId = require('../middlewares/validateObjectId');
const handleValidation = require('../middlewares/handleValidation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Teachers
 *   description: Teacher management
 */

/**
 * @swagger
 * /teachers:
 *   get:
 *     summary: Get all teachers
 *     tags: [Teachers]
 *     parameters:
 *       - in: query
 *         name: faculty
 *         schema: { type: string }
 *       - in: query
 *         name: degree
 *         schema: { type: string, enum: [bachelor, master, phd, professor] }
 *     responses:
 *       200:
 *         description: List of teachers
 */
router.get('/me', protect, authorize('teacher'), getMyProfile);
router.get('/', protect, getTeachers);
router.get('/:id', protect, validateObjectId(), getTeacher);

/**
 * @swagger
 * /teachers:
 *   post:
 *     summary: Create a teacher (also creates linked user)
 *     tags: [Teachers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password, faculty, employeeId]
 *             properties:
 *               firstName:      { type: string }
 *               lastName:       { type: string }
 *               email:          { type: string }
 *               password:       { type: string }
 *               faculty:        { type: string }
 *               employeeId:     { type: string }
 *               degree:         { type: string }
 *               specialization: { type: string }
 *               phone:          { type: string }
 *     responses:
 *       201:
 *         description: Teacher created
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
    body('employeeId').notEmpty().withMessage('Employee ID is required'),
  ],
  handleValidation,
  createTeacher
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  validateObjectId(),
  [
    body('employeeId').optional().notEmpty().withMessage('Employee ID cannot be empty'),
    body('degree').optional().isIn(['bachelor', 'master', 'phd', 'professor']).withMessage('Invalid degree'),
    body('specialization').optional().isLength({ max: 100 }).withMessage('Specialization max 100 chars'),
    body('phone').optional().isLength({ max: 20 }).withMessage('Phone max 20 chars'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  ],
  handleValidation,
  updateTeacher
);
router.delete('/:id', protect, authorize('admin'), validateObjectId(), deleteTeacher);

module.exports = router;

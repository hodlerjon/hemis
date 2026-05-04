const express = require('express');
const { body } = require('express-validator');
const {
  getGrades, getGrade, getStudentGrades, createGrade, updateGrade, deleteGrade,
} = require('../controllers/gradeController');
const { protect } = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');
const validateObjectId = require('../middlewares/validateObjectId');
const handleValidation = require('../middlewares/handleValidation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Grades
 *   description: Grade management
 */

/**
 * @swagger
 * /grades:
 *   get:
 *     summary: Get all grades
 *     tags: [Grades]
 *     parameters:
 *       - in: query
 *         name: student
 *         schema: { type: string }
 *       - in: query
 *         name: subject
 *         schema: { type: string }
 *       - in: query
 *         name: semester
 *         schema: { type: integer }
 *       - in: query
 *         name: academicYear
 *         schema: { type: string }
 *       - in: query
 *         name: letterGrade
 *         schema: { type: string, enum: [A, B, C, D, F] }
 *     responses:
 *       200:
 *         description: List of grades
 */
router.get('/', protect, getGrades);

/**
 * @swagger
 * /grades/student/{id}:
 *   get:
 *     summary: Get all grades for a specific student (with GPA)
 *     tags: [Grades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: semester
 *         schema: { type: integer }
 *       - in: query
 *         name: academicYear
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Student grades with GPA calculation
 */
router.get('/student/:id', protect, validateObjectId(), getStudentGrades);

router.get('/:id', protect, validateObjectId(), getGrade);

/**
 * @swagger
 * /grades:
 *   post:
 *     summary: Create a grade record
 *     tags: [Grades]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [student, subject, teacher, semester, academicYear]
 *             properties:
 *               student:      { type: string }
 *               subject:      { type: string }
 *               teacher:      { type: string }
 *               midterm:      { type: number, minimum: 0, maximum: 100 }
 *               final:        { type: number, minimum: 0, maximum: 100 }
 *               exam:         { type: number, minimum: 0, maximum: 100 }
 *               semester:     { type: integer }
 *               academicYear: { type: string, example: "2024-2025" }
 *     responses:
 *       201:
 *         description: Grade created (total and letterGrade auto-calculated)
 */
router.post(
  '/',
  protect,
  authorize('admin', 'teacher'),
  [
    body('student').notEmpty().withMessage('Student is required'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('teacher').notEmpty().withMessage('Teacher is required'),
    body('semester').isInt({ min: 1, max: 2 }).withMessage('Semester must be 1 or 2'),
    body('academicYear').matches(/^\d{4}-\d{4}$/).withMessage('Academic year must be YYYY-YYYY'),
    body('midterm').optional().isFloat({ min: 0, max: 100 }).withMessage('Midterm must be 0-100'),
    body('final').optional().isFloat({ min: 0, max: 100 }).withMessage('Final must be 0-100'),
    body('exam').optional().isFloat({ min: 0, max: 100 }).withMessage('Exam must be 0-100'),
  ],
  handleValidation,
  createGrade
);

router.put('/:id', protect, authorize('admin', 'teacher'), validateObjectId(), updateGrade);
router.delete('/:id', protect, authorize('admin'), validateObjectId(), deleteGrade);

module.exports = router;

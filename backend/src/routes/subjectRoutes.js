const express = require('express');
const { body } = require('express-validator');
const {
  getSubjects, getSubject, createSubject, updateSubject, deleteSubject,
} = require('../controllers/subjectController');
const { protect } = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');
const validateObjectId = require('../middlewares/validateObjectId');
const handleValidation = require('../middlewares/handleValidation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Subjects
 *   description: Subject management
 */

/**
 * @swagger
 * /subjects:
 *   get:
 *     summary: Get all subjects
 *     tags: [Subjects]
 *     parameters:
 *       - in: query
 *         name: faculty
 *         schema: { type: string }
 *       - in: query
 *         name: teacher
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [lecture, seminar, lab, practice] }
 *     responses:
 *       200:
 *         description: List of subjects
 */
router.get('/', protect, getSubjects);
router.get('/:id', protect, validateObjectId(), getSubject);

/**
 * @swagger
 * /subjects:
 *   post:
 *     summary: Create a subject
 *     tags: [Subjects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code, faculty, teacher, credits]
 *             properties:
 *               name:        { type: string }
 *               code:        { type: string }
 *               faculty:     { type: string }
 *               teacher:     { type: string }
 *               credits:     { type: integer }
 *               description: { type: string }
 *               type:        { type: string }
 *     responses:
 *       201:
 *         description: Subject created
 */
router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('name').notEmpty().withMessage('Subject name is required'),
    body('code').notEmpty().withMessage('Subject code is required'),
    body('faculty').notEmpty().withMessage('Faculty is required'),
    body('teacher').notEmpty().withMessage('Teacher is required'),
    body('credits').isInt({ min: 1, max: 10 }).withMessage('Credits must be between 1 and 10'),
  ],
  handleValidation,
  createSubject
);

router.put('/:id', protect, authorize('admin'), validateObjectId(), updateSubject);
router.delete('/:id', protect, authorize('admin'), validateObjectId(), deleteSubject);

module.exports = router;

const express = require('express');
const { body } = require('express-validator');
const {
  getFaculties, getFaculty, createFaculty, updateFaculty, deleteFaculty,
} = require('../controllers/facultyController');
const { protect } = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');
const validateObjectId = require('../middlewares/validateObjectId');
const handleValidation = require('../middlewares/handleValidation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Faculties
 *   description: Faculty management
 */

/**
 * @swagger
 * /faculties:
 *   get:
 *     summary: Get all faculties
 *     tags: [Faculties]
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of faculties
 */
router.get('/', protect, getFaculties);

/**
 * @swagger
 * /faculties/{id}:
 *   get:
 *     summary: Get faculty by ID
 *     tags: [Faculties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Faculty data
 */
router.get('/:id', protect, validateObjectId(), getFaculty);

/**
 * @swagger
 * /faculties:
 *   post:
 *     summary: Create a faculty
 *     tags: [Faculties]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code]
 *             properties:
 *               name:        { type: string }
 *               code:        { type: string }
 *               description: { type: string }
 *               dean:        { type: string }
 *     responses:
 *       201:
 *         description: Faculty created
 */
router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('name').notEmpty().withMessage('Faculty name is required'),
    body('code').notEmpty().withMessage('Faculty code is required'),
  ],
  handleValidation,
  createFaculty
);

/**
 * @swagger
 * /faculties/{id}:
 *   put:
 *     summary: Update a faculty
 *     tags: [Faculties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Faculty updated
 */
router.put('/:id', protect, authorize('admin'), validateObjectId(), updateFaculty);

/**
 * @swagger
 * /faculties/{id}:
 *   delete:
 *     summary: Delete a faculty
 *     tags: [Faculties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Faculty deleted
 */
router.delete('/:id', protect, authorize('admin'), validateObjectId(), deleteFaculty);

module.exports = router;

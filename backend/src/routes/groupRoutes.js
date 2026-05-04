const express = require('express');
const { body } = require('express-validator');
const {
  getGroups, getGroup, createGroup, updateGroup, deleteGroup,
} = require('../controllers/groupController');
const { protect } = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');
const validateObjectId = require('../middlewares/validateObjectId');
const handleValidation = require('../middlewares/handleValidation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Groups
 *   description: Academic group management
 */

/**
 * @swagger
 * /groups:
 *   get:
 *     summary: Get all groups
 *     tags: [Groups]
 *     parameters:
 *       - in: query
 *         name: faculty
 *         schema: { type: string }
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *       - in: query
 *         name: semester
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of groups
 */
router.get('/', protect, getGroups);
router.get('/:id', protect, validateObjectId(), getGroup);

/**
 * @swagger
 * /groups:
 *   post:
 *     summary: Create a group
 *     tags: [Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code, faculty, year, semester]
 *             properties:
 *               name:     { type: string }
 *               code:     { type: string }
 *               faculty:  { type: string }
 *               year:     { type: integer }
 *               semester: { type: integer }
 *     responses:
 *       201:
 *         description: Group created
 */
router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('name').notEmpty().withMessage('Group name is required'),
    body('code').notEmpty().withMessage('Group code is required'),
    body('faculty').notEmpty().withMessage('Faculty is required'),
    body('year').isInt({ min: 1, max: 6 }).withMessage('Year must be between 1 and 6'),
    body('semester').isInt({ min: 1, max: 2 }).withMessage('Semester must be 1 or 2'),
  ],
  handleValidation,
  createGroup
);

router.put('/:id', protect, authorize('admin'), validateObjectId(), updateGroup);
router.delete('/:id', protect, authorize('admin'), validateObjectId(), deleteGroup);

module.exports = router;

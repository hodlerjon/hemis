const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  refresh,
  logout,
  changePassword,
  getMe,
} = require('../controllers/authController');
const { protect }     = require('../middlewares/authMiddleware');
const authorize        = require('../middlewares/authorize');
const handleValidation = require('../middlewares/handleValidation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Yangi foydalanuvchi yaratish (faqat admin)
 *     tags: [Auth]
 *     responses:
 *       201: { description: Created }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
router.post(
  '/register',
  protect,
  authorize('admin'),
  [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['admin', 'teacher', 'student']).withMessage('Invalid role'),
  ],
  handleValidation,
  register
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login — accessToken + refreshToken cookie qaytaradi
 *     tags: [Auth]
 *     security: []
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  handleValidation,
  login
);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Yangi accessToken olish (refreshToken cookie kerak)
 *     tags: [Auth]
 *     security: []
 */
router.post('/refresh', refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout — DB va cookie tozalanadi
 *     tags: [Auth]
 */
router.post('/logout', protect, logout);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Parolni o'zgartirish
 *     tags: [Auth]
 */
router.post(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  handleValidation,
  changePassword
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Joriy foydalanuvchi ma'lumotlari
 *     tags: [Auth]
 */
router.get('/me', protect, getMe);

module.exports = router;

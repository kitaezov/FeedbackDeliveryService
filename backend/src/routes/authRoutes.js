/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', authController.register);

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', authController.login);

/**
 * @route POST /api/auth/validate-token
 * @desc Validate JWT token
 * @access Public
 */
router.post('/validate-token', authController.validateToken);

/**
 * @route GET /api/auth/profile
 * @desc Get user profile data
 * @access Private
 */
router.get('/profile', authController.getProfile);

/**
 * @route POST /api/auth/reset-password
 * @desc Reset user password (development only)
 * @access Public
 */
router.post('/reset-password', authController.resetPassword);

module.exports = router; 
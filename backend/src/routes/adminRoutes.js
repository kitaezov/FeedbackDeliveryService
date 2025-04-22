/**
 * Admin Routes
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, checkRole } = require('../middleware/authMiddleware');

// Initialize head admin (public route, only works once)
router.get('/init-head-admin', adminController.initializeHeadAdmin);

// Get all users - Admin or higher only
router.get('/users', authenticateToken, checkRole('admin'), adminController.getUsers);

// Update user role - Admin can assign manager, head_admin can assign any role
router.put('/users/:id/role', authenticateToken, checkRole('admin'), adminController.updateUserRole);

// Block user account - Admin or higher only
router.post('/users/:id/block', authenticateToken, checkRole('admin'), adminController.blockUser);

// Unblock user account - Admin or higher only
router.post('/users/:id/unblock', authenticateToken, checkRole('admin'), adminController.unblockUser);

// Delete review - Manager or higher
router.delete('/reviews/:id', authenticateToken, checkRole('manager'), adminController.deleteReview);

// Get all deleted reviews with reasons - Manager or higher
router.get('/deleted-reviews', authenticateToken, checkRole('manager'), adminController.getDeletedReviews);

// Restaurant management routes
router.get('/restaurants', authenticateToken, checkRole('admin'), adminController.getRestaurants);
router.post('/restaurants', authenticateToken, checkRole('admin'), adminController.createRestaurant);
router.put('/restaurants/:id', authenticateToken, checkRole('admin'), adminController.updateRestaurant);
router.delete('/restaurants/:id', authenticateToken, checkRole('admin'), adminController.deleteRestaurant);

module.exports = router; 
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');

// Authentication Routes

// User registration
router.post('/register', authController.register);

// User login
router.post('/login', authController.login);

// Get current user profile
router.get('/profile', authenticate, authController.getProfile);

// Update current user profile
router.put('/profile', authenticate, authController.updateProfile);

// Change password
router.put('/change-password', authenticate, authController.changePassword);

// Admin/Manager Routes

// Get all users (managers and admins only)
router.get('/users', authenticate, authorize('manager', 'admin'), authController.getUsers);

// Update user role or status (admins only)
router.put('/users/:id', authenticate, authorize('admin'), authController.updateUser);

module.exports = router;

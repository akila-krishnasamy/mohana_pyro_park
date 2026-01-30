import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  getUsers,
  updateUserRole
} from '../controllers/authController.js';
import { protect, authorize, isManagerOrOwner, isOwner } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);

// Admin routes
router.get('/users', protect, isManagerOrOwner, getUsers);
router.put('/users/:id/role', protect, isOwner, updateUserRole);

export default router;

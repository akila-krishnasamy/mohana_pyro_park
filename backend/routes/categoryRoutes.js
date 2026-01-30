import express from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { protect, isManagerOrOwner } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);

// Manager routes
router.post('/', protect, isManagerOrOwner, createCategory);
router.put('/:id', protect, isManagerOrOwner, updateCategory);
router.delete('/:id', protect, isManagerOrOwner, deleteCategory);

export default router;

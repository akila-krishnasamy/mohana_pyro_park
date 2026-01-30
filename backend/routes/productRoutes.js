import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getFeaturedProducts,
  getLowStockProducts,
  getDeadStock
} from '../controllers/productController.js';
import { protect, isStaffOrHigher, isManagerOrOwner } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/:id', getProduct);

// Staff routes
router.get('/admin/low-stock', protect, isStaffOrHigher, getLowStockProducts);

// Manager routes
router.get('/admin/dead-stock', protect, isManagerOrOwner, getDeadStock);
router.post('/', protect, isManagerOrOwner, createProduct);
router.put('/:id', protect, isManagerOrOwner, updateProduct);
router.delete('/:id', protect, isManagerOrOwner, deleteProduct);

export default router;

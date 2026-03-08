import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  applyStoreWideDiscount,
  removeStoreWideDiscount,
  syncProductImages,
  getProductsByCategory,
  getFeaturedProducts,
  getLowStockProducts,
  getDeadStock
} from '../controllers/productController.js';
import { protect, isStaffOrHigher, isManagerOrOwner } from '../middleware/auth.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'products');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype?.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/:id', getProduct);

// Staff routes
router.get('/admin/low-stock', protect, isStaffOrHigher, getLowStockProducts);

// Manager routes
router.get('/admin/dead-stock', protect, isManagerOrOwner, getDeadStock);
router.put('/admin/store-discount', protect, isManagerOrOwner, applyStoreWideDiscount);
router.put('/admin/store-discount/remove', protect, isManagerOrOwner, removeStoreWideDiscount);
router.put('/admin/sync-images', protect, isManagerOrOwner, syncProductImages);
router.post('/', protect, isManagerOrOwner, upload.single('image'), createProduct);
router.put('/:id', protect, isManagerOrOwner, upload.single('image'), updateProduct);
router.delete('/:id', protect, isManagerOrOwner, deleteProduct);

export default router;

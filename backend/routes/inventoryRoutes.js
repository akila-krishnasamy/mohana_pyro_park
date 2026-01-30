import express from 'express';
import {
  getInventory,
  restockProduct,
  adjustStock,
  getInventoryLogs,
  getInventorySummary
} from '../controllers/inventoryController.js';
import { protect, isStaffOrHigher, isManagerOrOwner } from '../middleware/auth.js';

const router = express.Router();

// Staff routes
router.get('/', protect, isStaffOrHigher, getInventory);

// Manager routes
router.get('/logs', protect, isManagerOrOwner, getInventoryLogs);
router.get('/summary', protect, isManagerOrOwner, getInventorySummary);
router.post('/:productId/restock', protect, isManagerOrOwner, restockProduct);
router.post('/:productId/adjust', protect, isManagerOrOwner, adjustStock);

export default router;

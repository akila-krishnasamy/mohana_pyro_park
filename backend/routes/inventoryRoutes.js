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
router.post('/:productId/adjust', protect, isStaffOrHigher, adjustStock);

// Manager routes
router.get('/logs', protect, isStaffOrHigher, getInventoryLogs);
router.get('/summary', protect, isManagerOrOwner, getInventorySummary);
router.post('/:productId/restock', protect, isManagerOrOwner, restockProduct);

export default router;

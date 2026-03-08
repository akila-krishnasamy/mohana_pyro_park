import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  updateOrderTracking,
  uncancelOrder,
  assignDelivery,
  getOrderStats
} from '../controllers/orderController.js';
import { protect, isStaffOrHigher, isManagerOrOwner } from '../middleware/auth.js';

const router = express.Router();

// Customer routes
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);

// Staff routes
router.get('/', protect, isStaffOrHigher, getAllOrders);
router.get('/stats', protect, isStaffOrHigher, getOrderStats);
router.put('/:id/status', protect, isStaffOrHigher, updateOrderStatus);
router.put('/:id/tracking', protect, isStaffOrHigher, updateOrderTracking);
router.put('/:id/uncancel', protect, isStaffOrHigher, uncancelOrder);

// Manager routes
router.put('/:id/assign-delivery', protect, isManagerOrOwner, assignDelivery);

// Shared route (accessible by customer for their orders, staff for all)
router.get('/:id', protect, getOrder);

export default router;

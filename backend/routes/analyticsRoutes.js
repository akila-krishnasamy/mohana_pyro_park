import express from 'express';
import {
  getSalesAnalytics,
  getTopProducts,
  getFestivalAnalytics,
  getDeliveryTypeAnalytics,
  getFulfillmentAnalytics,
  getDashboardOverview,
  getRevenueAnalytics,
  getInventoryAnalytics,
  getCustomerAnalytics,
  getSalesDetailedAnalytics
} from '../controllers/analyticsController.js';
import { protect, isOwner, isManagerOrOwner, isStaff } from '../middleware/auth.js';

const router = express.Router();

// Dashboard (all staff can view)
router.get('/dashboard', protect, isStaff, getDashboardOverview);
router.get('/sales', protect, isStaff, getSalesAnalytics);
router.get('/sales-detailed', protect, isStaff, getSalesDetailedAnalytics);
router.get('/top-products', protect, isStaff, getTopProducts);
router.get('/revenue', protect, isStaff, getRevenueAnalytics);
router.get('/inventory', protect, isStaff, getInventoryAnalytics);
router.get('/customers', protect, isStaff, getCustomerAnalytics);

// Owner-only routes (detailed analytics)
router.get('/festival', protect, isOwner, getFestivalAnalytics);
router.get('/delivery-type', protect, isOwner, getDeliveryTypeAnalytics);
router.get('/fulfillment', protect, isOwner, getFulfillmentAnalytics);

export default router;

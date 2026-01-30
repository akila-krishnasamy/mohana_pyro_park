import Order from '../models/Order.js';
import Product from '../models/Product.js';
import InventoryLog from '../models/InventoryLog.js';
import mongoose from 'mongoose';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private/Customer
export const createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      items,
      deliveryType,
      deliveryAddress,
      pickupDate,
      pickupTimeSlot,
      paymentMethod,
      customerNotes
    } = req.body;

    // Validate items and check stock
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);

      if (!product) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`
        });
      }

      if (!product.isActive) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Product is no longer available: ${product.name}`
        });
      }

      if (product.stock < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }

      const unitPrice = product.discountPrice || product.price;
      const totalPrice = unitPrice * item.quantity;

      orderItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice,
        totalPrice
      });

      subtotal += totalPrice;

      // Reduce stock
      product.stock -= item.quantity;
      product.totalSold += item.quantity;
      await product.save({ session });

      // Log inventory change
      await InventoryLog.create([{
        product: product._id,
        type: 'sale',
        quantity: -item.quantity,
        previousStock: product.stock + item.quantity,
        newStock: product.stock,
        reason: 'Order placed',
        performedBy: req.user._id
      }], { session });
    }

    // Calculate delivery charge
    const deliveryCharge = deliveryType === 'delivery' ? 50 : 0;
    const totalAmount = subtotal + deliveryCharge;

    // Determine festival context based on date
    const festivalContext = determineFestivalContext(new Date());

    // Create order
    const order = await Order.create([{
      customer: req.user._id,
      items: orderItems,
      subtotal,
      deliveryCharge,
      totalAmount,
      deliveryType,
      deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : undefined,
      pickupDate: deliveryType === 'pickup' ? pickupDate : undefined,
      pickupTimeSlot: deliveryType === 'pickup' ? pickupTimeSlot : undefined,
      paymentMethod,
      customerNotes,
      festivalContext,
      status: 'pending',
      statusTimeline: [{
        status: 'pending',
        timestamp: new Date(),
        notes: 'Order placed'
      }]
    }], { session });

    await session.commitTransaction();

    const populatedOrder = await Order.findById(order[0]._id)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name imageUrl');

    res.status(201).json({
      success: true,
      order: populatedOrder
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// Helper function to determine festival context
function determineFestivalContext(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Diwali season (October 15 - November 15 approximately)
  if ((month === 10 && day >= 15) || (month === 11 && day <= 15)) {
    return 'diwali';
  }

  // New Year season (December 20 - January 5)
  if ((month === 12 && day >= 20) || (month === 1 && day <= 5)) {
    return 'new-year';
  }

  // Pongal (January 13-16)
  if (month === 1 && day >= 13 && day <= 16) {
    return 'pongal';
  }

  // Christmas (December 20-26)
  if (month === 12 && day >= 20 && day <= 26) {
    return 'christmas';
  }

  return 'normal';
}

// @desc    Get customer orders
// @route   GET /api/orders/my-orders
// @access  Private/Customer
export const getMyOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { customer: req.user._id };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('items.product', 'name imageUrl')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      count: orders.length,
      total,
      pages: Math.ceil(total / limit),
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone address')
      .populate('items.product', 'name imageUrl category')
      .populate('packedBy', 'name')
      .populate('deliveryAssignedTo', 'name phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Customers can only see their own orders
    if (req.user.role === 'customer' && 
        order.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Staff/Admin)
// @route   GET /api/orders
// @access  Private/Staff+
export const getAllOrders = async (req, res, next) => {
  try {
    const {
      status,
      deliveryType,
      festivalContext,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (deliveryType) query.deliveryType = deliveryType;
    if (festivalContext) query.festivalContext = festivalContext;

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Search by order number or customer name
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      count: orders.length,
      total,
      pages: Math.ceil(total / limit),
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Staff+
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Validate status transition
    const validTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['packing', 'cancelled'],
      'packing': ['ready', 'cancelled'],
      'ready': ['out-for-delivery', 'picked-up', 'cancelled'],
      'out-for-delivery': ['delivered', 'cancelled'],
      'delivered': [],
      'picked-up': [],
      'cancelled': []
    };

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from '${order.status}' to '${status}'`
      });
    }

    // Handle cancellation - restore stock
    if (status === 'cancelled') {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        for (const item of order.items) {
          const product = await Product.findById(item.product).session(session);
          if (product) {
            product.stock += item.quantity;
            product.totalSold -= item.quantity;
            await product.save({ session });

            await InventoryLog.create([{
              product: product._id,
              type: 'return',
              quantity: item.quantity,
              previousStock: product.stock - item.quantity,
              newStock: product.stock,
              reason: `Order ${order.orderNumber} cancelled`,
              relatedOrder: order._id,
              performedBy: req.user._id
            }], { session });
          }
        }

        order.status = status;
        order.statusTimeline.push({
          status,
          timestamp: new Date(),
          updatedBy: req.user._id,
          notes
        });

        await order.save({ session });
        await session.commitTransaction();
        session.endSession();
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    } else {
      // Update status
      order.status = status;
      order.statusTimeline.push({
        status,
        timestamp: new Date(),
        updatedBy: req.user._id,
        notes
      });

      // Set staff assignments
      if (status === 'packing') {
        order.packedBy = req.user._id;
      }

      await order.save();
    }

    const updatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name');

    res.json({
      success: true,
      order: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign delivery
// @route   PUT /api/orders/:id/assign-delivery
// @access  Private/Manager+
export const assignDelivery = async (req, res, next) => {
  try {
    const { staffId } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.deliveryType !== 'delivery') {
      return res.status(400).json({
        success: false,
        message: 'This is not a delivery order'
      });
    }

    order.deliveryAssignedTo = staffId;
    order.statusTimeline.push({
      status: 'delivery-assigned',
      timestamp: new Date(),
      updatedBy: req.user._id,
      notes: `Delivery assigned to staff`
    });

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('deliveryAssignedTo', 'name phone');

    res.json({
      success: true,
      order: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order statistics for dashboard
// @route   GET /api/orders/stats
// @access  Private/Staff+
export const getOrderStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's stats
    const todayStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { 
            $sum: { 
              $cond: [{ $ne: ['$status', 'cancelled'] }, '$totalAmount', 0] 
            } 
          },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          confirmedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          packingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'packing'] }, 1, 0] }
          },
          readyOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'ready'] }, 1, 0] }
          },
          deliveredOrders: {
            $sum: { 
              $cond: [
                { $in: ['$status', ['delivered', 'picked-up']] }, 
                1, 
                0
              ] 
            }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    // Pending orders count (all time, need attention)
    const pendingCount = await Order.countDocuments({
      status: { $in: ['pending', 'confirmed', 'packing', 'ready', 'out-for-delivery'] }
    });

    res.json({
      success: true,
      stats: {
        today: todayStats[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          confirmedOrders: 0,
          packingOrders: 0,
          readyOrders: 0,
          deliveredOrders: 0,
          cancelledOrders: 0
        },
        pendingCount
      }
    });
  } catch (error) {
    next(error);
  }
};

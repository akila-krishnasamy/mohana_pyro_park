import Order from '../models/Order.js';
import Product from '../models/Product.js';
import InventoryLog from '../models/InventoryLog.js';
import { sendOrderStatusEmail } from '../services/emailService.js';

const trackingStatusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'reached-hub'];

const getCurrentUnitPrice = (product) => {
  const now = new Date();
  const startsAt = product.discountStartsAt ? new Date(product.discountStartsAt) : null;
  const endsAt = product.discountEndsAt ? new Date(product.discountEndsAt) : null;
  const isActiveDiscount =
    product.discountPrice != null &&
    Number(product.discountPrice) < Number(product.price) &&
    (!startsAt || startsAt <= now) &&
    (!endsAt || endsAt >= now);

  return isActiveDiscount ? product.discountPrice : product.price;
};

const deriveStatusFromTracking = (order) => {
  if (order.arrivedHub?.checked) return 'reached-hub';
  if (order.reachedHub?.checked) return 'shipped';
  if (order.shipped?.checked) return 'processing';
  if (order.orderPicked?.checked) return 'confirmed';
  return 'pending';
};

const pushStatusTimeline = (order, status, updatedBy, notes = '') => {
  const lastStatus = order.statusTimeline?.[order.statusTimeline.length - 1]?.status;
  if (lastStatus === status) return;

  order.statusTimeline.push({
    status,
    timestamp: new Date(),
    updatedBy,
    notes
  });
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private/Customer
export const createOrder = async (req, res, next) => {
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

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items provided'
      });
    }

    // Validate items and check stock
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product is no longer available: ${product.name}`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }

      const unitPrice = getCurrentUnitPrice(product);
      const totalPrice = unitPrice * item.quantity;

      orderItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice,
        totalPrice
      });

      subtotal += totalPrice;
    }

    // Calculate delivery charge (free for orders above 2000)
    const deliveryCharge = deliveryType === 'delivery' ? (subtotal >= 2000 ? 0 : 100) : 0;
    const totalAmount = subtotal + deliveryCharge;

    // Generate order number
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const orderNumber = `MPP${year}${month}${day}${random}`;

    // Determine festival context based on date
    const festivalContext = determineFestivalContext(new Date());

    // Create order
    const order = await Order.create({
      orderNumber,
      customer: req.user._id,
      items: orderItems,
      subtotal,
      deliveryCharge,
      totalAmount,
      deliveryType,
      deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : undefined,
      pickupDate: deliveryType === 'pickup' ? pickupDate : undefined,
      pickupTimeSlot: deliveryType === 'pickup' ? pickupTimeSlot : undefined,
      paymentMethod: paymentMethod || 'cash',
      customerNotes,
      festivalContext,
      status: 'pending',
      statusTimeline: [{
        status: 'pending',
        timestamp: new Date(),
        notes: 'Order placed'
      }]
    });

    // Update product stock and create inventory logs
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      const previousStock = product.stock;
      const newStock = previousStock - item.quantity;

      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, totalSold: item.quantity }
      });

      await InventoryLog.create({
        product: item.product,
        type: 'sale',
        quantity: -item.quantity,
        previousStock,
        newStock,
        reason: `Order ${orderNumber}`,
        relatedOrder: order._id,
        performedBy: req.user._id
      });
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name imageUrl');

    await sendOrderStatusEmail({
      to: populatedOrder.customer?.email,
      customerName: populatedOrder.customer?.name,
      orderNumber: populatedOrder.orderNumber,
      status: populatedOrder.status
    });

    res.status(201).json({
      success: true,
      order: populatedOrder
    });
  } catch (error) {
    next(error);
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

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Staff+
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, notes, cancellationReason } = req.body;

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
      'confirmed': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['reached-hub', 'cancelled'],
      'reached-hub': ['delivered', 'picked-up', 'cancelled'],
      'delivered': [],
      'picked-up': [],
      'cancelled': [],
      // Legacy statuses for backwards compatibility
      'packing': ['ready', 'cancelled'],
      'ready': ['out-for-delivery', 'cancelled'],
      'out-for-delivery': ['delivered', 'cancelled']
    };

    if (!validTransitions[order.status] || !validTransitions[order.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from '${order.status}' to '${status}'`
      });
    }

    // Handle cancellation - restore stock (without transactions)
    if (status === 'cancelled') {
      try {
        for (const item of order.items) {
          const product = await Product.findById(item.product);
          if (product) {
            const previousStock = product.stock;
            const newStock = previousStock + item.quantity;

            await Product.findByIdAndUpdate(item.product, {
              $inc: { stock: item.quantity, totalSold: -item.quantity }
            });

            await InventoryLog.create({
              product: product._id,
              type: 'return',
              quantity: item.quantity,
              previousStock,
              newStock,
              reason: `Order ${order.orderNumber} cancelled`,
              relatedOrder: order._id,
              performedBy: req.user._id
            });
          }
        }

        order.status = status;
        order.cancelledAt = new Date();
        order.cancellationReason = cancellationReason || '';
        order.cancelledBy = req.user._id;
        
        // Reset all tracking checkboxes when cancelled
        order.orderPicked = { checked: false, checkedAt: null, checkedBy: null };
        order.shipped = { checked: false, checkedAt: null, checkedBy: null };
        order.reachedHub = { checked: false, checkedAt: null, checkedBy: null };
        order.arrivedHub = { checked: false, checkedAt: null, checkedBy: null };
        
        order.statusTimeline.push({
          status,
          timestamp: new Date(),
          updatedBy: req.user._id,
          notes: cancellationReason || notes
        });

        await order.save();
      } catch (error) {
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
      .populate('items.product', 'name imageUrl');

    await sendOrderStatusEmail({
      to: updatedOrder.customer?.email,
      customerName: updatedOrder.customer?.name,
      orderNumber: updatedOrder.orderNumber,
      status: updatedOrder.status
    });

    res.json({
      success: true,
      order: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Uncancel order (restore cancelled order to pending)
// @route   PUT /api/orders/:id/uncancel
// @access  Private/Manager+
export const uncancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status !== 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Only cancelled orders can be uncancelled'
      });
    }

    // Deduct stock again for uncancelled order
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        // Check if there's enough stock
        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Not enough stock for ${product.name}. Available: ${product.stock}, Required: ${item.quantity}`
          });
        }
      }
    }

    // Deduct stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        const previousStock = product.stock;
        const newStock = previousStock - item.quantity;

        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity, totalSold: item.quantity }
        });

        await InventoryLog.create({
          product: product._id,
          type: 'sale',
          quantity: -item.quantity,
          previousStock,
          newStock,
          reason: `Order ${order.orderNumber} uncancelled`,
          relatedOrder: order._id,
          performedBy: req.user._id
        });
      }
    }

    // Restore order to pending
    order.status = 'pending';
    order.cancelledAt = undefined;
    order.cancellationReason = '';
    order.cancelledBy = undefined;
    order.statusTimeline.push({
      status: 'pending',
      timestamp: new Date(),
      updatedBy: req.user._id,
      notes: 'Order uncancelled and restored to pending'
    });

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name imageUrl');

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
      status: { $in: ['pending', 'confirmed', 'processing', 'shipped', 'reached-hub'] }
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

// @desc    Update order tracking checkboxes
// @route   PUT /api/orders/:id/tracking
// @access  Private/Staff+
export const updateOrderTracking = async (req, res, next) => {
  try {
    const { field, checked } = req.body;

    // Validate field name - ordered from first to last step
    const trackingOrder = ['orderPicked', 'shipped', 'reachedHub', 'arrivedHub'];
    if (!trackingOrder.includes(field)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tracking field'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update the tracking field
    order[field] = {
      checked: checked,
      checkedAt: checked ? new Date() : null,
      checkedBy: checked ? req.user._id : null
    };

    // If unchecking, also uncheck all subsequent steps (cascade uncheck)
    if (!checked) {
      const fieldIndex = trackingOrder.indexOf(field);
      for (let i = fieldIndex + 1; i < trackingOrder.length; i++) {
        const subsequentField = trackingOrder[i];
        if (order[subsequentField]?.checked) {
          order[subsequentField] = {
            checked: false,
            checkedAt: null,
            checkedBy: null
          };
        }
      }
    }

    let statusChanged = false;
    const derivedStatus = deriveStatusFromTracking(order);
    if (order.status !== 'cancelled' && order.status !== derivedStatus) {
      const currentStatusIndex = trackingStatusOrder.indexOf(order.status);
      const derivedStatusIndex = trackingStatusOrder.indexOf(derivedStatus);

      const isForwardMove = derivedStatusIndex > currentStatusIndex;
      order.status = derivedStatus;
      statusChanged = true;
      pushStatusTimeline(
        order,
        derivedStatus,
        req.user._id,
        isForwardMove ? 'Auto-updated from tracking progress' : 'Auto-adjusted after tracking step update'
      );
    }

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name imageUrl')
      .populate('orderPicked.checkedBy', 'name')
      .populate('shipped.checkedBy', 'name')
      .populate('reachedHub.checkedBy', 'name');

    const shouldNotifyOnTick = checked === true && updatedOrder.status !== 'cancelled';

    if (statusChanged || shouldNotifyOnTick) {
      await sendOrderStatusEmail({
        to: updatedOrder.customer?.email,
        customerName: updatedOrder.customer?.name,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status
      });
    }

    res.json({
      success: true,
      order: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

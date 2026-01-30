import mongoose from 'mongoose';

// Order status timeline entry
const statusTimelineSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    default: ''
  }
}, { _id: false });

// Order item schema
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true // Stored to preserve historical data
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  unitPrice: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  
  // Pricing
  subtotal: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  deliveryCharge: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },

  // Delivery type
  deliveryType: {
    type: String,
    enum: ['pickup', 'delivery'],
    required: true
  },
  
  // Delivery address (only for delivery orders)
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String
  },

  // Pickup details (only for pickup orders)
  pickupDate: {
    type: Date
  },
  pickupTimeSlot: {
    type: String // e.g., "10:00 AM - 12:00 PM"
  },

  // Status management
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'packing', 'ready', 'out-for-delivery', 'delivered', 'picked-up', 'cancelled'],
    default: 'pending'
  },
  statusTimeline: [statusTimelineSchema],

  // Staff assignments
  packedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deliveryAssignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Payment
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'card', 'online'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },

  // Additional info
  customerNotes: {
    type: String,
    default: ''
  },
  internalNotes: {
    type: String,
    default: ''
  },

  // Festival tagging for analytics
  festivalContext: {
    type: String,
    enum: ['diwali', 'new-year', 'christmas', 'pongal', 'normal'],
    default: 'normal'
  },

  // Timestamps for analytics
  confirmedAt: Date,
  packedAt: Date,
  readyAt: Date,
  deliveredAt: Date,
  cancelledAt: Date

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for fulfillment time (in hours)
orderSchema.virtual('fulfillmentTime').get(function() {
  if (this.deliveredAt && this.createdAt) {
    return Math.round((this.deliveredAt - this.createdAt) / (1000 * 60 * 60) * 10) / 10;
  }
  return null;
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Count orders for today
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    
    const count = await mongoose.model('Order').countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    
    const sequence = (count + 1).toString().padStart(4, '0');
    this.orderNumber = `MPP${year}${month}${day}${sequence}`;
  }
  next();
});

// Add status to timeline when status changes
orderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusTimeline.push({
      status: this.status,
      timestamp: new Date()
    });

    // Set specific timestamps based on status
    const now = new Date();
    switch (this.status) {
      case 'confirmed':
        this.confirmedAt = now;
        break;
      case 'packing':
        break;
      case 'ready':
        this.readyAt = now;
        this.packedAt = now;
        break;
      case 'delivered':
      case 'picked-up':
        this.deliveredAt = now;
        break;
      case 'cancelled':
        this.cancelledAt = now;
        break;
    }
  }
  next();
});

// Indexes for efficient querying
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ festivalContext: 1, createdAt: -1 });
orderSchema.index({ deliveryType: 1, status: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;

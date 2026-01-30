import mongoose from 'mongoose';

// Track inventory movements (restocking, sales, adjustments)
const inventoryLogSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  type: {
    type: String,
    enum: ['restock', 'sale', 'adjustment', 'return', 'damage'],
    required: true
  },
  quantity: {
    type: Number,
    required: true // Positive for additions, negative for deductions
  },
  previousStock: {
    type: Number,
    required: true
  },
  newStock: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    default: ''
  },
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  unitCost: {
    type: Number, // For restock: purchase cost per unit
    default: 0
  },
  supplier: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

inventoryLogSchema.index({ product: 1, createdAt: -1 });
inventoryLogSchema.index({ type: 1, createdAt: -1 });

const InventoryLog = mongoose.model('InventoryLog', inventoryLogSchema);

export default InventoryLog;

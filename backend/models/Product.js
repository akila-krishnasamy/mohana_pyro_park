import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [150, 'Product name cannot exceed 150 characters']
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  discountPrice: {
    type: Number,
    default: null
  },
  unit: {
    type: String,
    enum: ['piece', 'box', 'pack', 'dozen'],
    default: 'piece'
  },
  itemsPerUnit: {
    type: Number,
    default: 1 // e.g., 10 pieces per box
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  lowStockThreshold: {
    type: Number,
    default: 10 // Alert when stock falls below this
  },
  safetyType: {
    type: String,
    enum: ['safe', 'moderate', 'high-noise', 'professional'],
    default: 'safe'
  },
  ageRecommendation: {
    type: String,
    enum: ['all-ages', '8+', '12+', '18+'],
    default: 'all-ages'
  },
  imageUrl: {
    type: String,
    default: '/images/default-cracker.png'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isFestivalSpecial: {
    type: Boolean,
    default: false
  },
  festivalTags: [{
    type: String,
    enum: ['diwali', 'new-year', 'christmas', 'pongal', 'wedding', 'general']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  totalSold: {
    type: Number,
    default: 0
  },
  lastRestocked: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for checking low stock
productSchema.virtual('isLowStock').get(function() {
  return this.stock <= this.lowStockThreshold;
});

// Virtual for effective price (considering discount)
productSchema.virtual('effectivePrice').get(function() {
  return this.discountPrice && this.discountPrice < this.price 
    ? this.discountPrice 
    : this.price;
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.discountPrice && this.discountPrice < this.price) {
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  return 0;
});

// Index for search and filtering
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ totalSold: -1 });

const Product = mongoose.model('Product', productSchema);

export default Product;

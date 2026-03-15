import Product from '../models/Product.js';
import Category from '../models/Category.js';

const normalizeProductPayload = (payload) => {
  const normalized = { ...payload };

  if (Object.prototype.hasOwnProperty.call(normalized, 'discountPrice')) {
    const rawDiscount = normalized.discountPrice;

    if (rawDiscount === '' || rawDiscount === null || rawDiscount === undefined) {
      normalized.discountPrice = null;
      normalized.discountStartsAt = null;
      normalized.discountEndsAt = null;
    } else {
      const numericDiscount = Number(rawDiscount);
      normalized.discountPrice = Number.isFinite(numericDiscount) ? numericDiscount : null;

      if (normalized.discountPrice == null) {
        normalized.discountStartsAt = null;
        normalized.discountEndsAt = null;
      }
    }
  }

  if (Object.prototype.hasOwnProperty.call(normalized, 'price')) {
    const numericPrice = Number(normalized.price);
    if (Number.isFinite(numericPrice)) {
      normalized.price = numericPrice;
      if (
        normalized.discountPrice != null &&
        Number.isFinite(Number(normalized.discountPrice)) &&
        Number(normalized.discountPrice) >= numericPrice
      ) {
        normalized.discountPrice = null;
      }
    }
  }

  return normalized;
};

const resolveDefaultImageForProduct = (product) => {
  const existingImage = product.imageUrl;

  const hasCustomLocalImage =
    existingImage &&
    existingImage !== '/images/default-cracker.png' &&
    (existingImage.startsWith('/api/uploads/products/') || existingImage.startsWith('/images/products/'));

  if (hasCustomLocalImage) {
    return existingImage;
  }

  const categoryName = typeof product.category === 'object' ? product.category?.name : product.category || '';
  const searchText = `${product.name || ''} ${categoryName || ''}`.toLowerCase();

  const keywordImageMap = [
    { keywords: ['5000', 'wala'], image: '/api/uploads/products/5000-walas-crackers.jpg' },
    { keywords: ['1000', 'wala'], image: '/api/uploads/products/1000Wala.webp' },
    { keywords: ['dragon', 'bomb'], image: '/api/uploads/products/DragonBomb.jpg' },
    { keywords: ['classic', 'atom', 'bomb'], image: '/api/uploads/products/ClassicAtomBomb.jpg' },
    { keywords: ['atom', 'bomb'], image: '/api/uploads/products/AtomBomb.png' },
    { keywords: ['hydrogen', 'bomb'], image: '/api/uploads/products/DragonBomb.jpg' },
    { keywords: ['hydro', 'bomb'], image: '/api/uploads/products/DragonBomb.jpg' },
    { keywords: ['pubg', 'bomb'], image: '/api/uploads/products/DragonBomb.jpg' },
    { keywords: ['paper', 'bomb'], image: '/api/uploads/products/ClassicAtomBomb.jpg' },
    { keywords: ['bomb'], image: '/api/uploads/products/AtomBomb.png' },
    { keywords: ['red', 'bijili'], image: '/api/uploads/products/RedBijilli.jpg' },
    { keywords: ['lakshmi'], image: '/api/uploads/products/Lakshmi.webp' },
    { keywords: ['kuruvi'], image: '/api/uploads/products/Kuruvi.jpg' },
    { keywords: ['100 shot'], image: '/images/products/100 shot.webp' },
    { keywords: ['200 shot'], image: '/images/products/200 shot.webp' },
    { keywords: ['265 shot'], image: '/images/products/265 shot.webp' },
    { keywords: ['whistling', 'rocket'], image: '/images/products/whistling-rocket.png' },
    { keywords: ['sky', 'shot'], image: '/images/products/sky-shot-rocket.png' },
    { keywords: ['two sound', 'rocket'], image: '/images/products/2-sound-rocket.png' },
    { keywords: ['color pearl', 'rocket'], image: '/images/products/color-pearl-rocket.png' },
    { keywords: ['musical', 'rocket'], image: '/images/products/lunik-rocket.png' },
    { keywords: ['rocket'], image: '/images/products/2-sound-rocket.png' },
    { keywords: ['30cm', 'sparkler'], image: '/images/products/whistling-rocket.png' },
    { keywords: ['50cm', 'sparkler'], image: '/images/products/whistling-rocket.png' },
    { keywords: ['15cm', 'sparkler'], image: '/images/products/whistling-rocket.png' },
    { keywords: ['10cm', 'sparkler'], image: '/images/products/whistling-rocket.png' },
    { keywords: ['7cm', 'sparkler'], image: '/images/products/whistling-rocket.png' },
    { keywords: ['electric', 'sparkler'], image: '/images/products/whistling-rocket.png' },
    { keywords: ['colour', 'sparkler'], image: '/images/products/whistling-rocket.png' },
    { keywords: ['color', 'sparkler'], image: '/images/products/whistling-rocket.png' },
    { keywords: ['green', 'sparkler'], image: '/images/products/whistling-rocket.png' },
    { keywords: ['red', 'sparkler'], image: '/images/products/whistling-rocket.png' },
    { keywords: ['sparkler'], image: '/images/products/whistling-rocket.png' },
    { keywords: ['whistling', 'chakkar'], image: '/images/products/whistling-chakkar.png' },
    { keywords: ['electric', 'chakkar'], image: '/images/products/electric-chakkar.png' },
    { keywords: ['plastic', 'chakkar'], image: '/images/products/deluxe-ground-chakkar.png' },
    { keywords: ['wire', 'chakkar'], image: '/images/products/electric-chakkar.png' },
    { keywords: ['ground', 'chakkar', 'big'], image: '/images/products/super-chakkar-big.png' },
    { keywords: ['ground', 'chakkar', 'deluxe'], image: '/images/products/deluxe-ground-chakkar.png' },
    { keywords: ['chakkar'], image: '/images/products/ground-chakkar.jpg' },
    { keywords: ['super', 'deluxe', 'flower', 'pot'], image: '/images/products/super-deluxe-flower-pot.png' },
    { keywords: ['crackling', 'flower', 'pot'], image: '/images/products/crackling-flower-pot.png' },
    { keywords: ['rainbow', 'flower', 'pot'], image: '/images/products/rainbow-flower-pot.png' },
    { keywords: ['large', 'flower', 'pot'], image: '/images/products/large-flower-pot.png' },
    { keywords: ['medium', 'flower', 'pot'], image: '/images/products/medium-flower-pot.png' },
    { keywords: ['small', 'flower', 'pot'], image: '/images/products/small-flower-pot.png' },
    { keywords: ['flower', 'pot'], image: '/images/products/flower-pots.png' }
  ];

  for (const rule of keywordImageMap) {
    if (rule.keywords.every((keyword) => searchText.includes(keyword))) {
      return rule.image;
    }
  }

  const categoryImageMap = [
    { keywords: ['bomb'], image: '/api/uploads/products/AtomBomb.png' },
    { keywords: ['rocket'], image: '/images/products/2-sound-rocket.png' },
    { keywords: ['chakkar'], image: '/images/products/ground-chakkar.jpg' },
    { keywords: ['flower', 'pot'], image: '/images/products/flower-pots.png' },
    { keywords: ['multicolour', 'shot'], image: '/images/products/100 shot.webp' },
    { keywords: ['fancy', 'fountain'], image: '/images/products/rainbow-flower-pot.png' }
  ];

  const categoryText = String(categoryName).toLowerCase();
  for (const rule of categoryImageMap) {
    if (rule.keywords.every((keyword) => categoryText.includes(keyword))) {
      return rule.image;
    }
  }

  if (existingImage && existingImage !== '/images/default-cracker.png') {
    return existingImage;
  }

  return '/images/default-cracker.png';
};

const isDiscountActiveNow = (product, now = new Date()) => {
  if (product.discountPrice == null) return false;

  const startsAt = product.discountStartsAt ? new Date(product.discountStartsAt) : null;
  const endsAt = product.discountEndsAt ? new Date(product.discountEndsAt) : null;

  if (startsAt && startsAt > now) return false;
  if (endsAt && endsAt < now) return false;

  return Number(product.discountPrice) < Number(product.price);
};

const normalizeDiscount = (productDoc) => {
  const product = productDoc.toObject ? productDoc.toObject() : productDoc;
  const normalizedProduct = {
    ...product,
    imageUrl: resolveDefaultImageForProduct(product)
  };

  if (!isDiscountActiveNow(product)) {
    return {
      ...normalizedProduct,
      discountPrice: null,
      discountStartsAt: null,
      discountEndsAt: null
    };
  }

  return normalizedProduct;
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      safetyType,
      festivalTag,
      inStock,
      lowStock,
      outOfStock,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 20
    } = req.query;

    const query = { isActive: true };

    // Category filter
    if (category) {
      // Check if category is a valid ObjectId
      const mongoose = await import('mongoose');
      const isValidObjectId = mongoose.default.Types.ObjectId.isValid(category);
      
      let categoryDoc;
      if (isValidObjectId) {
        categoryDoc = await Category.findById(category);
      }
      
      // If not found by ID, search by slug or name
      if (!categoryDoc) {
        categoryDoc = await Category.findOne({ 
          $or: [
            { slug: category },
            { name: { $regex: `^${category.replace(/-/g, ' ')}$`, $options: 'i' } },
            { name: { $regex: category.replace(/-/g, '.*'), $options: 'i' } }
          ]
        });
      }
      
      if (categoryDoc) {
        query.category = categoryDoc._id;
      } else {
        // Category not found, return empty results
        query.category = null;
      }
    }

    // Search in name, description, tags
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Safety type filter
    if (safetyType) {
      query.safetyType = safetyType;
    }

    // Festival tag filter
    if (festivalTag) {
      query.festivalTags = festivalTag;
    }

    // In stock filter
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Low stock filter (stock <= lowStockThreshold)
    if (lowStock === 'true' || lowStock === true) {
      query.$expr = { $lte: ['$stock', '$lowStockThreshold'] };
      query.stock = { $gt: 0 }; // Low stock but not out of stock
    }

    // Out of stock filter (stock === 0)
    if (outOfStock === 'true' || outOfStock === true) {
      query.stock = 0;
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .populate('category', 'name')
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    const normalizedProducts = products.map(normalizeDiscount);

    res.json({
      success: true,
      count: normalizedProducts.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      products: normalizedProducts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name description');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const normalizedProduct = normalizeDiscount(product);

    res.json({
      success: true,
      product: normalizedProduct
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Manager+
export const createProduct = async (req, res, next) => {
  try {
    const payload = normalizeProductPayload({ ...req.body });

    if (req.file) {
      payload.imageUrl = `/api/uploads/products/${req.file.filename}`;
    }

    const product = await Product.create(payload);

    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Manager+
export const updateProduct = async (req, res, next) => {
  try {
    const payload = normalizeProductPayload({ ...req.body });

    if (req.file) {
      payload.imageUrl = `/api/uploads/products/${req.file.filename}`;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply store-wide discount for date range
// @route   PUT /api/products/admin/store-discount
// @access  Private/Manager+
export const applyStoreWideDiscount = async (req, res, next) => {
  try {
    const { discountPercent, startDate, endDate } = req.body;

    const percent = Number(discountPercent);

    if (!Number.isFinite(percent) || percent < 0 || percent >= 100) {
      return res.status(400).json({
        success: false,
        message: 'discountPercent must be between 0 and 99'
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required'
      });
    }

    const discountStartsAt = new Date(startDate);
    const discountEndsAt = new Date(endDate);

    if (Number.isNaN(discountStartsAt.getTime()) || Number.isNaN(discountEndsAt.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid startDate or endDate'
      });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    discountStartsAt.setHours(0, 0, 0, 0);
    discountEndsAt.setHours(23, 59, 59, 999);

    if (discountStartsAt < todayStart || discountEndsAt < todayStart) {
      return res.status(400).json({
        success: false,
        message: 'Discount dates must be today or a future date'
      });
    }

    if (discountEndsAt < discountStartsAt) {
      return res.status(400).json({
        success: false,
        message: 'endDate must be greater than or equal to startDate'
      });
    }

    const activeProducts = await Product.find({ isActive: true }).select('_id price');

    if (activeProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active products found'
      });
    }

    const operations = activeProducts.map((product) => {
      const computedDiscountPrice = Number((Number(product.price) * (1 - percent / 100)).toFixed(2));
      const shouldApplyDiscount = computedDiscountPrice < Number(product.price);

      return {
        updateOne: {
          filter: { _id: product._id },
          update: {
            $set: {
              discountPrice: shouldApplyDiscount ? computedDiscountPrice : null,
              discountStartsAt: shouldApplyDiscount ? discountStartsAt : null,
              discountEndsAt: shouldApplyDiscount ? discountEndsAt : null
            }
          }
        }
      };
    });

    await Product.bulkWrite(operations);

    res.json({
      success: true,
      message: percent === 0
        ? 'Store-wide offer removed. Original prices restored'
        : `Store-wide ${percent}% discount applied`,
      updatedCount: operations.length,
      discountPercent: percent,
      discountStartsAt,
      discountEndsAt
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove store-wide discount from all active products
// @route   PUT /api/products/admin/store-discount/remove
// @access  Private/Manager+
export const removeStoreWideDiscount = async (req, res, next) => {
  try {
    const result = await Product.updateMany(
      { isActive: true },
      {
        $set: {
          discountPrice: null,
          discountStartsAt: null,
          discountEndsAt: null
        }
      }
    );

    res.json({
      success: true,
      message: 'Store-wide offer removed. Original prices restored',
      updatedCount: result.modifiedCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sync product image URLs from mapping rules
// @route   PUT /api/products/admin/sync-images
// @access  Private/Manager+
export const syncProductImages = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true }).select('_id name category imageUrl');

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active products found'
      });
    }

    const operations = [];

    for (const product of products) {
      const nextImageUrl = resolveDefaultImageForProduct(product);
      if (nextImageUrl && nextImageUrl !== product.imageUrl) {
        operations.push({
          updateOne: {
            filter: { _id: product._id },
            update: { $set: { imageUrl: nextImageUrl } }
          }
        });
      }
    }

    if (operations.length > 0) {
      await Product.bulkWrite(operations);
    }

    res.json({
      success: true,
      message: 'Product images synced successfully',
      updatedCount: operations.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
// @access  Private/Manager+
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get products by category
// @route   GET /api/products/category/:categoryId
// @access  Public
export const getProductsByCategory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const products = await Product.find({ 
      category: req.params.categoryId,
      isActive: true 
    })
      .populate('category', 'name')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Product.countDocuments({ 
      category: req.params.categoryId,
      isActive: true 
    });

    const normalizedProducts = products.map(normalizeDiscount);

    res.json({
      success: true,
      count: normalizedProducts.length,
      total,
      pages: Math.ceil(total / limit),
      products: normalizedProducts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured/top products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ 
      isActive: true,
      stock: { $gt: 0 }
    })
      .populate('category', 'name')
      .sort({ totalSold: -1 })
      .limit(12);

    const normalizedProducts = products.map(normalizeDiscount);

    res.json({
      success: true,
      products: normalizedProducts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get low stock products
// @route   GET /api/products/low-stock
// @access  Private/Staff+
export const getLowStockProducts = async (req, res, next) => {
  try {
    const products = await Product.find({
      isActive: true,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    })
      .populate('category', 'name')
      .sort({ stock: 1 });

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dead stock (no sales in 90 days)
// @route   GET /api/products/dead-stock
// @access  Private/Manager+
export const getDeadStock = async (req, res, next) => {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Products with stock but no recent sales
    const products = await Product.aggregate([
      {
        $match: {
          isActive: true,
          stock: { $gt: 0 }
        }
      },
      {
        $lookup: {
          from: 'orders',
          let: { productId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $gte: ['$createdAt', ninetyDaysAgo] },
                    { $ne: ['$status', 'cancelled'] }
                  ]
                }
              }
            },
            { $unwind: '$items' },
            {
              $match: {
                $expr: { $eq: ['$items.product', '$$productId'] }
              }
            }
          ],
          as: 'recentOrders'
        }
      },
      {
        $match: {
          recentOrders: { $size: 0 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      },
      {
        $project: {
          name: 1,
          stock: 1,
          price: 1,
          category: '$category.name',
          lastRestocked: 1,
          totalSold: 1,
          deadStockValue: { $multiply: ['$stock', '$price'] }
        }
      },
      {
        $sort: { deadStockValue: -1 }
      }
    ]);

    const totalDeadStockValue = products.reduce((sum, p) => sum + p.deadStockValue, 0);

    res.json({
      success: true,
      count: products.length,
      totalDeadStockValue,
      products
    });
  } catch (error) {
    next(error);
  }
};

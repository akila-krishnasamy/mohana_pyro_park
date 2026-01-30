import Product from '../models/Product.js';
import InventoryLog from '../models/InventoryLog.js';

// @desc    Get all inventory with stock info
// @route   GET /api/inventory
// @access  Private/Staff+
export const getInventory = async (req, res, next) => {
  try {
    const { category, lowStock, search, page = 1, limit = 50 } = req.query;

    const query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (lowStock === 'true') {
      query.$expr = { $lte: ['$stock', '$lowStockThreshold'] };
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const products = await Product.find(query)
      .populate('category', 'name')
      .select('name category stock lowStockThreshold price lastRestocked totalSold')
      .sort({ stock: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    // Get low stock count
    const lowStockCount = await Product.countDocuments({
      isActive: true,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    });

    // Get out of stock count
    const outOfStockCount = await Product.countDocuments({
      isActive: true,
      stock: 0
    });

    res.json({
      success: true,
      count: products.length,
      total,
      pages: Math.ceil(total / limit),
      lowStockCount,
      outOfStockCount,
      products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update stock (restock)
// @route   POST /api/inventory/:productId/restock
// @access  Private/Manager+
export const restockProduct = async (req, res, next) => {
  try {
    const { quantity, unitCost, supplier, notes } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive number'
      });
    }

    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const previousStock = product.stock;
    product.stock += quantity;
    product.lastRestocked = new Date();
    await product.save();

    // Log inventory change
    await InventoryLog.create({
      product: product._id,
      type: 'restock',
      quantity,
      previousStock,
      newStock: product.stock,
      reason: notes || 'Stock replenishment',
      performedBy: req.user._id,
      unitCost: unitCost || 0,
      supplier: supplier || ''
    });

    res.json({
      success: true,
      message: `Stock updated. New stock: ${product.stock}`,
      product: {
        id: product._id,
        name: product.name,
        previousStock,
        addedQuantity: quantity,
        newStock: product.stock
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Adjust stock (for corrections)
// @route   POST /api/inventory/:productId/adjust
// @access  Private/Manager+
export const adjustStock = async (req, res, next) => {
  try {
    const { newStock, reason } = req.body;

    if (newStock === undefined || newStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'New stock must be a non-negative number'
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Reason is required for stock adjustment'
      });
    }

    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const previousStock = product.stock;
    const quantityChange = newStock - previousStock;
    product.stock = newStock;
    await product.save();

    // Log inventory change
    await InventoryLog.create({
      product: product._id,
      type: 'adjustment',
      quantity: quantityChange,
      previousStock,
      newStock: product.stock,
      reason,
      performedBy: req.user._id
    });

    res.json({
      success: true,
      message: `Stock adjusted. New stock: ${product.stock}`,
      product: {
        id: product._id,
        name: product.name,
        previousStock,
        newStock: product.stock,
        adjustment: quantityChange
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inventory logs
// @route   GET /api/inventory/logs
// @access  Private/Manager+
export const getInventoryLogs = async (req, res, next) => {
  try {
    const { productId, type, startDate, endDate, page = 1, limit = 50 } = req.query;

    const query = {};

    if (productId) {
      query.product = productId;
    }

    if (type) {
      query.type = type;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const logs = await InventoryLog.find(query)
      .populate('product', 'name')
      .populate('performedBy', 'name')
      .populate('relatedOrder', 'orderNumber')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await InventoryLog.countDocuments(query);

    res.json({
      success: true,
      count: logs.length,
      total,
      pages: Math.ceil(total / limit),
      logs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inventory summary
// @route   GET /api/inventory/summary
// @access  Private/Manager+
export const getInventorySummary = async (req, res, next) => {
  try {
    // Total inventory value
    const inventoryValue = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$stock', '$price'] } },
          totalItems: { $sum: '$stock' },
          totalProducts: { $sum: 1 }
        }
      }
    ]);

    // Stock by category
    const stockByCategory = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      {
        $group: {
          _id: '$category',
          categoryName: { $first: '$categoryInfo.name' },
          totalStock: { $sum: '$stock' },
          totalValue: { $sum: { $multiply: ['$stock', '$price'] } },
          productCount: { $sum: 1 }
        }
      },
      { $sort: { totalValue: -1 } }
    ]);

    // Recent restocks (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentRestocks = await InventoryLog.aggregate([
      {
        $match: {
          type: 'restock',
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          totalRestocked: { $sum: '$quantity' },
          totalCost: { $sum: { $multiply: ['$quantity', '$unitCost'] } },
          restockCount: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      summary: {
        inventory: inventoryValue[0] || { totalValue: 0, totalItems: 0, totalProducts: 0 },
        byCategory: stockByCategory,
        recentRestocks: recentRestocks[0] || { totalRestocked: 0, totalCost: 0, restockCount: 0 }
      }
    });
  } catch (error) {
    next(error);
  }
};

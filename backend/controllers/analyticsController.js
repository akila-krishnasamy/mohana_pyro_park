import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import mongoose from 'mongoose';

// @desc    Get sales analytics
// @route   GET /api/analytics/sales
// @access  Private/Owner
export const getSalesAnalytics = async (req, res, next) => {
  try {
    const { period = '30days', startDate, endDate } = req.query;

    let dateFilter = {};
    const now = new Date();

    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      switch (period) {
        case '7days':
          dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 7)) } };
          break;
        case '30days':
          dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 30)) } };
          break;
        case '90days':
          dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 90)) } };
          break;
        case '1year':
          dateFilter = { createdAt: { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) } };
          break;
        case '2years':
          dateFilter = { createdAt: { $gte: new Date(now.setFullYear(now.getFullYear() - 2)) } };
          break;
        default:
          dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 30)) } };
      }
    }

    // Overall sales stats
    const salesStats = await Order.aggregate([
      { $match: { ...dateFilter, status: { $nin: ['cancelled'] } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' },
          totalItems: { $sum: { $size: '$items' } }
        }
      }
    ]);

    // Daily sales for chart
    const dailySales = await Order.aggregate([
      { $match: { ...dateFilter, status: { $nin: ['cancelled'] } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: {
                $dateFromParts: {
                  year: '$_id.year',
                  month: '$_id.month',
                  day: '$_id.day'
                }
              }
            }
          },
          revenue: 1,
          orders: 1
        }
      }
    ]);

    // Monthly sales for chart
    const monthlySales = await Order.aggregate([
      { $match: { ...dateFilter, status: { $nin: ['cancelled'] } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $cond: [{ $lt: ['$_id.month', 10] }, { $concat: ['0', { $toString: '$_id.month' }] }, { $toString: '$_id.month' }] }
            ]
          },
          revenue: 1,
          orders: 1
        }
      }
    ]);

    res.json({
      success: true,
      analytics: {
        summary: salesStats[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, totalItems: 0 },
        dailySales,
        monthlySales
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top selling products
// @route   GET /api/analytics/top-products
// @access  Private/Owner
export const getTopProducts = async (req, res, next) => {
  try {
    const { period = '30days', limit = 10 } = req.query;

    const now = new Date();
    let dateFilter = {};

    switch (period) {
      case '7days':
        dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 7)) } };
        break;
      case '30days':
        dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 30)) } };
        break;
      case '1year':
        dateFilter = { createdAt: { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) } };
        break;
      default:
        dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 30)) } };
    }

    const topProducts = await Order.aggregate([
      { $match: { ...dateFilter, status: { $nin: ['cancelled'] } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.productName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $project: {
          _id: 1,
          productName: 1,
          totalQuantity: 1,
          totalRevenue: 1,
          orderCount: 1,
          category: { $arrayElemAt: ['$productDetails.category', 0] },
          currentStock: { $arrayElemAt: ['$productDetails.stock', 0] }
        }
      }
    ]);

    // Get category names
    const Category = mongoose.model('Category');
    const topProductsWithCategory = await Promise.all(
      topProducts.map(async (product) => {
        if (product.category) {
          const category = await Category.findById(product.category);
          return { ...product, categoryName: category?.name || 'Unknown' };
        }
        return { ...product, categoryName: 'Unknown' };
      })
    );

    res.json({
      success: true,
      topProducts: topProductsWithCategory
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get festival-based analytics
// @route   GET /api/analytics/festival
// @access  Private/Owner
export const getFestivalAnalytics = async (req, res, next) => {
  try {
    const festivalSales = await Order.aggregate([
      { $match: { status: { $nin: ['cancelled'] } } },
      {
        $group: {
          _id: '$festivalContext',
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // Format the results
    const festivalData = festivalSales.map(item => ({
      festival: item._id || 'normal',
      revenue: item.totalRevenue,
      orders: item.totalOrders,
      avgOrderValue: Math.round(item.avgOrderValue)
    }));

    // Get year-over-year Diwali comparison
    const currentYear = new Date().getFullYear();
    const diwaliComparison = await Order.aggregate([
      {
        $match: {
          festivalContext: 'diwali',
          status: { $nin: ['cancelled'] }
        }
      },
      {
        $group: {
          _id: { $year: '$createdAt' },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 3 }
    ]);

    res.json({
      success: true,
      festivalAnalytics: {
        byFestival: festivalData,
        diwaliYearOverYear: diwaliComparison.map(item => ({
          year: item._id,
          revenue: item.revenue,
          orders: item.orders
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get delivery vs pickup analytics
// @route   GET /api/analytics/delivery-type
// @access  Private/Owner
export const getDeliveryTypeAnalytics = async (req, res, next) => {
  try {
    const { period = '30days' } = req.query;

    const now = new Date();
    let dateFilter = {};

    switch (period) {
      case '7days':
        dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 7)) } };
        break;
      case '30days':
        dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 30)) } };
        break;
      case '1year':
        dateFilter = { createdAt: { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) } };
        break;
      default:
        dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 30)) } };
    }

    const deliveryAnalytics = await Order.aggregate([
      { $match: { ...dateFilter, status: { $nin: ['cancelled'] } } },
      {
        $group: {
          _id: '$deliveryType',
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    // Daily trend by delivery type
    const dailyTrend = await Order.aggregate([
      { $match: { ...dateFilter, status: { $nin: ['cancelled'] } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            type: '$deliveryType'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Transform daily trend for chart
    const trendData = {};
    dailyTrend.forEach(item => {
      if (!trendData[item._id.date]) {
        trendData[item._id.date] = { date: item._id.date, pickup: 0, delivery: 0 };
      }
      trendData[item._id.date][item._id.type] = item.count;
    });

    res.json({
      success: true,
      deliveryAnalytics: {
        summary: deliveryAnalytics.map(item => ({
          type: item._id,
          orders: item.totalOrders,
          revenue: item.totalRevenue,
          avgOrderValue: Math.round(item.avgOrderValue)
        })),
        dailyTrend: Object.values(trendData)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get fulfillment time analytics
// @route   GET /api/analytics/fulfillment
// @access  Private/Owner
export const getFulfillmentAnalytics = async (req, res, next) => {
  try {
    const { period = '30days' } = req.query;

    const now = new Date();
    let dateFilter = {};

    switch (period) {
      case '7days':
        dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 7)) } };
        break;
      case '30days':
        dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 30)) } };
        break;
      default:
        dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 30)) } };
    }

    const fulfillmentStats = await Order.aggregate([
      {
        $match: {
          ...dateFilter,
          status: { $in: ['delivered', 'picked-up'] },
          deliveredAt: { $exists: true }
        }
      },
      {
        $project: {
          deliveryType: 1,
          fulfillmentHours: {
            $divide: [
              { $subtract: ['$deliveredAt', '$createdAt'] },
              3600000 // Convert to hours
            ]
          }
        }
      },
      {
        $group: {
          _id: '$deliveryType',
          avgFulfillmentTime: { $avg: '$fulfillmentHours' },
          minFulfillmentTime: { $min: '$fulfillmentHours' },
          maxFulfillmentTime: { $max: '$fulfillmentHours' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    // Overall average
    const overallAvg = await Order.aggregate([
      {
        $match: {
          ...dateFilter,
          status: { $in: ['delivered', 'picked-up'] },
          deliveredAt: { $exists: true }
        }
      },
      {
        $project: {
          fulfillmentHours: {
            $divide: [
              { $subtract: ['$deliveredAt', '$createdAt'] },
              3600000
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgFulfillmentTime: { $avg: '$fulfillmentHours' },
          totalCompleted: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      fulfillmentAnalytics: {
        overall: overallAvg[0] || { avgFulfillmentTime: 0, totalCompleted: 0 },
        byDeliveryType: fulfillmentStats.map(item => ({
          type: item._id,
          avgHours: Math.round(item.avgFulfillmentTime * 10) / 10,
          minHours: Math.round(item.minFulfillmentTime * 10) / 10,
          maxHours: Math.round(item.maxFulfillmentTime * 10) / 10,
          totalOrders: item.totalOrders
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard overview (combined analytics)
// @route   GET /api/analytics/dashboard
// @access  Private/Owner
export const getDashboardOverview = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    // Today's stats
    const todayStats = await Order.aggregate([
      { $match: { createdAt: { $gte: today, $lt: tomorrow }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      }
    ]);

    // This month's stats
    const thisMonthStats = await Order.aggregate([
      { $match: { createdAt: { $gte: thisMonthStart }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      }
    ]);

    // Last month's stats (for comparison)
    const lastMonthStats = await Order.aggregate([
      { $match: { createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      }
    ]);

    // Pending orders count
    const pendingOrders = await Order.countDocuments({
      status: { $in: ['pending', 'confirmed', 'packing'] }
    });

    // Low stock products count
    const lowStockCount = await Product.countDocuments({
      isActive: true,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    });

    // Recent orders
    const recentOrders = await Order.find()
      .populate('customer', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber customer totalAmount status createdAt');

    // Calculate month-over-month growth
    const thisMonthRevenue = thisMonthStats[0]?.revenue || 0;
    const lastMonthRevenue = lastMonthStats[0]?.revenue || 0;
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      dashboard: {
        today: todayStats[0] || { revenue: 0, orders: 0 },
        thisMonth: thisMonthStats[0] || { revenue: 0, orders: 0 },
        lastMonth: lastMonthStats[0] || { revenue: 0, orders: 0 },
        revenueGrowth: parseFloat(revenueGrowth),
        pendingOrders,
        lowStockCount,
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get revenue analytics with monthly breakdown
// @route   GET /api/analytics/revenue
// @access  Private/Staff
export const getRevenueAnalytics = async (req, res, next) => {
  try {
    const { period = '12months' } = req.query;

    let monthsBack = 12;
    switch (period) {
      case '7days': monthsBack = 1; break;
      case '30days': monthsBack = 1; break;
      case '3months': monthsBack = 3; break;
      case '12months': monthsBack = 12; break;
      case 'all': monthsBack = 36; break;
      default: monthsBack = 12;
    }

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);

    // Total revenue
    const totalStats = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $nin: ['cancelled'] } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    // Monthly revenue breakdown
    const monthlyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $nin: ['cancelled'] } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthly = monthlyRevenue.map(item => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      revenue: item.revenue,
      orders: item.orders
    }));

    // Revenue by category
    const categoryRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $nin: ['cancelled'] } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.category',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$category.name',
          revenue: { $sum: '$items.totalPrice' },
          quantity: { $sum: '$items.quantity' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    res.json({
      success: true,
      totalRevenue: totalStats[0]?.totalRevenue || 0,
      totalOrders: totalStats[0]?.totalOrders || 0,
      avgOrderValue: Math.round(totalStats[0]?.avgOrderValue || 0),
      monthlyRevenue: formattedMonthly,
      categoryRevenue: categoryRevenue.map(c => ({ _id: c._id || 'Unknown', revenue: c.revenue, quantity: c.quantity }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inventory analytics
// @route   GET /api/analytics/inventory
// @access  Private/Staff
export const getInventoryAnalytics = async (req, res, next) => {
  try {
    // Overall stats
    const products = await Product.find({ isActive: true });
    
    const stats = {
      totalProducts: products.length,
      totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
      lowStock: products.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).length,
      outOfStock: products.filter(p => p.stock === 0).length,
      totalStock: products.reduce((sum, p) => sum + p.stock, 0)
    };

    // Stock by category
    const categoryStock = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$categoryInfo.name',
          totalStock: { $sum: '$stock' },
          productCount: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$price', '$stock'] } }
        }
      },
      { $sort: { totalStock: -1 } }
    ]);

    // Low stock items
    const lowStockItems = await Product.find({
      isActive: true,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    })
    .populate('category', 'name')
    .sort({ stock: 1 })
    .limit(10)
    .select('name stock lowStockThreshold category price');

    res.json({
      success: true,
      stats,
      categoryStock: categoryStock.map(c => ({ _id: c._id || 'Unknown', ...c })),
      lowStockItems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer analytics
// @route   GET /api/analytics/customers
// @access  Private/Staff
export const getCustomerAnalytics = async (req, res, next) => {
  try {
    const { period = '12months' } = req.query;

    let monthsBack = 12;
    switch (period) {
      case '7days': monthsBack = 1; break;
      case '30days': monthsBack = 1; break;
      case '3months': monthsBack = 3; break;
      case '12months': monthsBack = 12; break;
      case 'all': monthsBack = 36; break;
      default: monthsBack = 12;
    }

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);

    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    // Total customers
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    // New customers this month
    const newThisMonth = await User.countDocuments({
      role: 'customer',
      createdAt: { $gte: thisMonthStart }
    });

    // Customers with more than 1 order (returning)
    const returning = await Order.aggregate([
      { $group: { _id: '$customer', orderCount: { $sum: 1 } } },
      { $match: { orderCount: { $gt: 1 } } },
      { $count: 'count' }
    ]);

    // New customers by month
    const newCustomers = await User.aggregate([
      { 
        $match: { 
          role: 'customer',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedNewCustomers = newCustomers.map(item => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      count: item.count
    }));

    // Top customers by order value
    const topCustomers = await Order.aggregate([
      { $match: { status: { $nin: ['cancelled'] } } },
      {
        $group: {
          _id: '$customer',
          totalSpent: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'customerInfo'
        }
      },
      { $unwind: '$customerInfo' },
      {
        $project: {
          name: '$customerInfo.name',
          email: '$customerInfo.email',
          totalSpent: 1,
          orderCount: 1
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalCustomers,
        newThisMonth,
        returning: returning[0]?.count || 0
      },
      newCustomers: formattedNewCustomers,
      topCustomers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed sales analytics with orders breakdown
// @route   GET /api/analytics/sales-detailed
// @access  Private/Staff
export const getSalesDetailedAnalytics = async (req, res, next) => {
  try {
    const { period = '30days' } = req.query;

    let daysBack = 30;
    switch (period) {
      case '7days': daysBack = 7; break;
      case '30days': daysBack = 30; break;
      case '3months': daysBack = 90; break;
      case '12months': daysBack = 365; break;
      case 'all': daysBack = 730; break;
      default: daysBack = 30;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Overall stats
    const totalStats = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $nin: ['cancelled'] } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Top products
    const topProducts = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $nin: ['cancelled'] } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.productName' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      totalRevenue: totalStats[0]?.totalRevenue || 0,
      totalOrders: totalStats[0]?.totalOrders || 0,
      avgOrderValue: Math.round(totalStats[0]?.avgOrderValue || 0),
      ordersByStatus,
      topProducts
    });
  } catch (error) {
    next(error);
  }
};

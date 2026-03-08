import { useQuery } from '@tanstack/react-query';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users, 
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { analyticsAPI, ordersAPI, productsAPI } from '../../services/api';
import { LoadingSpinner, StatusBadge } from '../../components/common';

const COLORS = ['#ec4899', '#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16'];

const Dashboard = () => {
  // Fetch dashboard overview
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: analyticsAPI.getDashboard,
  });

  // Fetch sales analytics for chart data
  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['salesAnalytics'],
    queryFn: () => analyticsAPI.getSales({ period: '2years' }),
  });

  // Fetch top products for category breakdown
  const { data: topProductsData } = useQuery({
    queryKey: ['topProducts'],
    queryFn: () => analyticsAPI.getTopProducts({ period: '2years', limit: 50 }),
  });

  const isLoading = dashboardLoading || salesLoading;

  if (isLoading) return <LoadingSpinner />;

  if (dashboardError) {
    console.error('Dashboard error:', dashboardError);
  }

  // Extract data from responses
  const dashboard = dashboardData?.dashboard || {};
  const salesAnalytics = salesData?.analytics || {};
  const topProducts = topProductsData?.topProducts || [];

  // Calculate totals from dashboard
  const thisMonth = dashboard.thisMonth || { revenue: 0, orders: 0 };
  const lastMonth = dashboard.lastMonth || { revenue: 0, orders: 0 };
  const recentOrders = dashboard.recentOrders || [];
  const pendingOrders = dashboard.pendingOrders || 0;
  const lowStockCount = dashboard.lowStockCount || 0;
  const totalProducts = dashboard.totalProducts || 0;
  const totalCustomers = dashboard.totalCustomers || 0;

  // Calculate total stats from all-time sales
  const totalStats = salesAnalytics.summary || { totalRevenue: 0, totalOrders: 0 };

  // Group top products by category for pie chart
  const categoryRevenue = topProducts.reduce((acc, product) => {
    const cat = product.categoryName || 'Unknown';
    const existing = acc.find(c => c.name === cat);
    if (existing) {
      existing.revenue += product.totalRevenue;
    } else {
      acc.push({ name: cat, revenue: product.totalRevenue });
    }
    return acc;
  }, []).sort((a, b) => b.revenue - a.revenue);

  // Monthly sales for chart
  const monthlySales = salesAnalytics.monthlySales || [];

  // Format month names
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedMonthlySales = monthlySales.map(item => ({
    ...item,
    monthName: monthNames[parseInt(item.month?.split('-')[1]) - 1] || item.month
  }));

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${(totalStats.totalRevenue || 0).toLocaleString()}`,
      subValue: `This month: ₹${(thisMonth.revenue || 0).toLocaleString()}`,
      change: dashboard.revenueGrowth || 0,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Total Orders',
      value: totalStats.totalOrders || 0,
      subValue: `Pending: ${pendingOrders}`,
      change: lastMonth.orders > 0 ? Math.round((thisMonth.orders - lastMonth.orders) / lastMonth.orders * 100) : 0,
      icon: ShoppingCart,
      color: 'bg-blue-500',
    },
    {
      title: 'Products',
      value: totalProducts,
      subValue: `Low stock: ${lowStockCount}`,
      change: 0,
      icon: Package,
      color: 'bg-purple-500',
    },
    {
      title: 'Avg Order Value',
      value: `₹${Math.round(totalStats.avgOrderValue || 0).toLocaleString()}`,
      subValue: `Customers: ${totalCustomers}`,
      change: 0,
      icon: TrendingUp,
      color: 'bg-pink-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('en-IN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.title} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.subValue}</p>
                {stat.change !== 0 && (
                  <div className={`flex items-center gap-1 mt-2 text-sm ${
                    stat.change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change > 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    <span>{Math.abs(stat.change)}% from last month</span>
                  </div>
                )}
              </div>
              <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h2>
          <div className="h-80">
            {formattedMonthlySales.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedMonthlySales}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="monthName" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip 
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#ec4899" 
                    strokeWidth={2}
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No revenue data available
              </div>
            )}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h2>
          <div className="h-80">
            {categoryRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryRevenue.slice(0, 8)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="revenue"
                    nameKey="name"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryRevenue.slice(0, 8).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No category data available
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {categoryRevenue.slice(0, 8).map((cat, index) => (
              <div key={cat.name} className="flex items-center gap-1 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-gray-600 truncate max-w-[80px]">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders & Low Stock */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-primary-600 text-sm font-medium hover:text-primary-700">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No orders yet</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-subtle rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">{order.customer?.name || 'Customer'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">₹{order.totalAmount?.toLocaleString()}</p>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-gray-900">Low Stock Alert</h2>
            </div>
            <Link to="/admin/inventory" className="text-primary-600 text-sm font-medium hover:text-primary-700">
              Manage Stock
            </Link>
          </div>
          <div className="space-y-4">
            {lowStockCount === 0 ? (
              <p className="text-gray-500 text-center py-4">All products are well stocked!</p>
            ) : (
              <div className="text-center py-4">
                <p className="text-3xl font-bold text-amber-600">{lowStockCount}</p>
                <p className="text-gray-500">products need restocking</p>
                <Link 
                  to="/admin/inventory" 
                  className="inline-block mt-4 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200"
                >
                  View Low Stock Items
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

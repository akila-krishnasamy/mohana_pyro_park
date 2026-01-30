import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Calendar,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Download,
  AlertTriangle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line
} from 'recharts';
import { analyticsAPI } from '../../services/api';
import { LoadingSpinner } from '../../components/common';

const COLORS = ['#ec4899', '#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6', '#84cc16', '#f97316'];

const Analytics = () => {
  const [period, setPeriod] = useState('12months');

  // Fetch revenue analytics
  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['revenueAnalytics', period],
    queryFn: () => analyticsAPI.getRevenue({ period }),
  });

  // Fetch sales analytics with orders breakdown
  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['salesDetailedAnalytics', period],
    queryFn: () => analyticsAPI.getSalesDetailed({ period }),
  });

  // Fetch inventory analytics
  const { data: inventoryData, isLoading: inventoryLoading } = useQuery({
    queryKey: ['inventoryAnalytics'],
    queryFn: analyticsAPI.getInventory,
  });

  // Fetch customer analytics
  const { data: customerData, isLoading: customerLoading } = useQuery({
    queryKey: ['customerAnalytics', period],
    queryFn: () => analyticsAPI.getCustomers({ period }),
  });

  const isLoading = revenueLoading || salesLoading || inventoryLoading || customerLoading;

  if (isLoading) return <LoadingSpinner />;

  // Extract data
  const totalRevenue = revenueData?.totalRevenue || 0;
  const totalOrders = salesData?.totalOrders || revenueData?.totalOrders || 0;
  const avgOrderValue = salesData?.avgOrderValue || revenueData?.avgOrderValue || 0;
  const monthlyRevenue = revenueData?.monthlyRevenue || [];
  const categoryRevenue = revenueData?.categoryRevenue || [];
  const ordersByStatus = salesData?.ordersByStatus || [];
  const topProducts = salesData?.topProducts || [];
  const inventoryStats = inventoryData?.stats || {};
  const categoryStock = inventoryData?.categoryStock || [];
  const lowStockItems = inventoryData?.lowStockItems || [];
  const customerStats = customerData?.stats || {};
  const newCustomers = customerData?.newCustomers || [];
  const topCustomers = customerData?.topCustomers || [];

  // Status colors for charts
  const statusColors = {
    pending: '#fbbf24',
    confirmed: '#3b82f6',
    processing: '#8b5cf6',
    packing: '#6366f1',
    shipped: '#a855f7',
    'out-for-delivery': '#f59e0b',
    delivered: '#10b981',
    'picked-up': '#14b8a6',
    cancelled: '#ef4444',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-500 mt-1">Detailed business insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="input w-auto"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="3months">Last 3 Months</option>
              <option value="12months">Last 12 Months</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{totalRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">For selected period</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{totalOrders.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">For selected period</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg. Order Value</p>
              <p className="text-2xl font-bold text-gray-900">₹{avgOrderValue.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">Per order average</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{customerStats.totalCustomers || 0}</p>
              <p className="text-xs text-green-600 mt-1">+{customerStats.newThisMonth || 0} this month</p>
            </div>
            <div className="p-3 bg-pink-100 rounded-lg">
              <Users className="w-6 h-6 text-pink-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue & Orders Trend</h2>
        <div className="h-80">
          {monthlyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={60} />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `₹${value.toLocaleString()}` : value,
                    name === 'revenue' ? 'Revenue' : 'Orders'
                  ]}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#ec4899" 
                  strokeWidth={2}
                  fill="url(#colorRevenue)" 
                  name="Revenue"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#a855f7" 
                  strokeWidth={2}
                  dot={{ fill: '#a855f7', r: 3 }}
                  name="Orders"
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No data available for selected period
            </div>
          )}
        </div>
      </div>

      {/* Category Revenue & Orders by Status */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue by Category */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Category</h2>
          <div className="h-72">
            {categoryRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryRevenue.slice(0, 8)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="revenue"
                    nameKey="_id"
                    label={({ _id, percent }) => `${(percent * 100).toFixed(0)}%`}
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
              <div className="flex items-center justify-center h-full text-gray-400">
                No data available
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {categoryRevenue.slice(0, 8).map((cat, index) => (
              <div key={cat._id || index} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-gray-600">{cat._id || 'Unknown'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h2>
          <div className="h-72">
            {ordersByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersByStatus}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="_id" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => [value, 'Orders']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {ordersByStatus.map((entry, index) => (
                      <Cell key={index} fill={statusColors[entry._id] || '#6b7280'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Products & Inventory */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h2>
          <div className="h-72">
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fontSize: 10 }} 
                    width={100}
                    tickFormatter={(value) => value?.length > 12 ? value.substring(0, 12) + '...' : value}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'totalSold' ? `${value} units` : `₹${value.toLocaleString()}`,
                      name === 'totalSold' ? 'Quantity Sold' : 'Revenue'
                    ]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="totalSold" fill="#ec4899" radius={[0, 4, 4, 0]} name="totalSold" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Inventory Overview */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventory Overview</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Total Products</p>
              <p className="text-xl font-bold text-gray-900">{inventoryStats.totalProducts || 0}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Total Stock Value</p>
              <p className="text-xl font-bold text-gray-900">
                ₹{(inventoryStats.totalValue || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <p className="text-xs text-amber-700">Low Stock Items</p>
              <p className="text-xl font-bold text-amber-600">{inventoryStats.lowStock || 0}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-xs text-red-700">Out of Stock</p>
              <p className="text-xl font-bold text-red-600">{inventoryStats.outOfStock || 0}</p>
            </div>
          </div>
          
          {/* Low Stock Alerts */}
          {lowStockItems.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Low Stock Alerts
              </h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {lowStockItems.slice(0, 5).map(item => (
                  <div key={item._id} className="flex items-center justify-between text-sm p-2 bg-amber-50 rounded">
                    <span className="text-gray-700 truncate flex-1">{item.name}</span>
                    <span className={`font-medium ml-2 ${item.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                      {item.stock} left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer Analytics */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Customer Growth Chart */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Growth</h2>
          <div className="h-64">
            {newCustomers.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={newCustomers}>
                  <defs>
                    <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => [value, 'New Customers']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#a855f7" 
                    strokeWidth={2}
                    fill="url(#colorCustomers)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Top Customers */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h2>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {topCustomers.length > 0 ? (
              topCustomers.slice(0, 8).map((customer, index) => (
                <div key={customer._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{customer.name}</p>
                    <p className="text-xs text-gray-500">{customer.orderCount} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">₹{customer.totalSpent.toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                No customer data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stock by Category */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock Distribution by Category</h2>
        <div className="h-64">
          {categoryStock.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStock}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'totalStock' ? `${value} units` : `₹${value.toLocaleString()}`,
                    name === 'totalStock' ? 'Stock' : 'Value'
                  ]}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Bar dataKey="totalStock" fill="#10b981" radius={[4, 4, 0, 0]} name="Stock Units" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;

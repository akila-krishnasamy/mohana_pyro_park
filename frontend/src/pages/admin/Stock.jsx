import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Package,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Search,
  Filter
} from 'lucide-react';
import { productsAPI } from '../../services/api';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../../components/common';

const Stock = () => {
  const [stockFilter, setStockFilter] = useState('all'); // all, low, out, available
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all products
  const { data, isLoading, error } = useQuery({
    queryKey: ['stockProducts', stockFilter],
    queryFn: () => {
      const params = { limit: 500 };
      if (stockFilter === 'low') {
        params.lowStock = true;
      } else if (stockFilter === 'out') {
        params.outOfStock = true;
      } else if (stockFilter === 'available') {
        params.inStock = true;
      }
      return productsAPI.getAll(params);
    },
  });

  const products = data?.products || [];

  // Filter by search
  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort: out of stock first, then low stock, then by stock ascending
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (a.stock === 0 && b.stock !== 0) return -1;
    if (a.stock !== 0 && b.stock === 0) return 1;
    const aIsLow = a.stock > 0 && a.stock <= (a.lowStockThreshold || 10);
    const bIsLow = b.stock > 0 && b.stock <= (b.lowStockThreshold || 10);
    if (aIsLow && !bIsLow) return -1;
    if (!aIsLow && bIsLow) return 1;
    return a.stock - b.stock;
  });

  const getStockStatus = (product) => {
    if (product.stock === 0) {
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-700', icon: XCircle };
    }
    if (product.stock <= (product.lowStockThreshold || 10)) {
      return { label: 'Low Stock', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle };
    }
    return { label: 'In Stock', color: 'bg-green-100 text-green-700', icon: CheckCircle };
  };

  // Calculate summary stats
  const stats = {
    total: products.length,
    outOfStock: products.filter(p => p.stock === 0).length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= (p.lowStockThreshold || 10)).length,
    available: products.filter(p => p.stock > (p.lowStockThreshold || 10)).length,
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setStockFilter('all')}
          className={`card p-4 text-left transition-all ${stockFilter === 'all' ? 'ring-2 ring-primary-500' : ''}`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Package className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Products</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setStockFilter('out')}
          className={`card p-4 text-left transition-all ${stockFilter === 'out' ? 'ring-2 ring-red-500' : ''}`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
              <p className="text-sm text-gray-500">Out of Stock</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setStockFilter('low')}
          className={`card p-4 text-left transition-all ${stockFilter === 'low' ? 'ring-2 ring-amber-500' : ''}`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{stats.lowStock}</p>
              <p className="text-sm text-gray-500">Low Stock</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setStockFilter('available')}
          className={`card p-4 text-left transition-all ${stockFilter === 'available' ? 'ring-2 ring-green-500' : ''}`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.available}</p>
              <p className="text-sm text-gray-500">Available</p>
            </div>
          </div>
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="w-4 h-4" />
            <span>
              {stockFilter === 'all' && 'All Products'}
              {stockFilter === 'out' && 'Out of Stock'}
              {stockFilter === 'low' && 'Low Stock'}
              {stockFilter === 'available' && 'Available'}
            </span>
          </div>
        </div>
      </div>

      {/* Products Table */}
      {sortedProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description={stockFilter !== 'all' ? "No products match the selected filter." : "No products in inventory."}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Low Stock Threshold
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedProducts.map((product) => {
                  const status = getStockStatus(product);
                  const StatusIcon = status.icon;
                  return (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-subtle rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            {product.imageUrl && product.imageUrl !== '/images/default-cracker.png' ? (
                              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-lg">🎆</span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.category?.name || 'Uncategorized'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-600 font-mono">{product.sku || '-'}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`text-lg font-bold ${
                          product.stock === 0 ? 'text-red-600' : 
                          product.stock <= (product.lowStockThreshold || 10) ? 'text-amber-600' : 
                          'text-gray-900'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm text-gray-500">{product.lowStockThreshold || 10}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <p className="font-medium text-gray-900">₹{product.price?.toLocaleString()}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stock;

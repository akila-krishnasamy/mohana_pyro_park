import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  Plus, 
  Minus, 
  Package, 
  AlertTriangle,
  History,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { productsAPI, inventoryAPI } from '../../services/api';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../../components/common';
import toast from 'react-hot-toast';

const Inventory = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentType, setAdjustmentType] = useState('add');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [showModal, setShowModal] = useState(false);
  const limit = 20;

  const { data, isLoading, error } = useQuery({
    queryKey: ['inventoryProducts', filterType, page],
    queryFn: () => productsAPI.getAll({ 
      lowStock: filterType === 'low' ? true : undefined,
      outOfStock: filterType === 'out' ? true : undefined,
      page, 
      limit 
    }),
  });

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['inventoryLogs'],
    queryFn: () => inventoryAPI.getLogs({ limit: 10 }),
  });

  const adjustStockMutation = useMutation({
    mutationFn: ({ productId, adjustment, reason }) => 
      inventoryAPI.adjust(productId, { adjustment, reason }),
    onSuccess: () => {
      toast.success('Stock updated successfully');
      queryClient.invalidateQueries(['inventoryProducts']);
      queryClient.invalidateQueries(['inventoryLogs']);
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update stock');
    },
  });

  const products = data?.products || [];
  const pagination = data?.pagination || {};
  const logs = logsData?.logs || [];

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openModal = (product, type) => {
    setSelectedProduct(product);
    setAdjustmentType(type);
    setQuantity('');
    setReason('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    setQuantity('');
    setReason('');
  };

  const handleAdjustStock = () => {
    if (!quantity || parseInt(quantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    const adjustment = adjustmentType === 'add' ? parseInt(quantity) : -parseInt(quantity);
    
    if (adjustmentType === 'remove' && parseInt(quantity) > selectedProduct.stock) {
      toast.error('Cannot remove more than current stock');
      return;
    }

    adjustStockMutation.mutate({
      productId: selectedProduct._id,
      adjustment,
      reason: reason || (adjustmentType === 'add' ? 'Stock added' : 'Stock removed'),
    });
  };

  const getStockStatus = (stock, minStock) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700' };
    if (stock <= minStock) return { label: 'Low Stock', color: 'bg-amber-100 text-amber-700' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-700' };
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Filters */}
          <div className="card p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by product name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setPage(1);
                  }}
                  className="input w-auto"
                >
                  <option value="all">All Products</option>
                  <option value="low">Low Stock</option>
                  <option value="out">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Table */}
          {filteredProducts.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No products found"
              description="No products match the selected filter."
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
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Min Stock
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredProducts.map((product) => {
                      const status = getStockStatus(product.stock, product.minStock);
                      return (
                        <tr key={product._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-subtle rounded-lg flex items-center justify-center">
                                <span className="text-lg">🎆</span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                                <p className="text-xs text-gray-500">{product.category?.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm font-mono text-gray-600">{product.sku}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`text-lg font-semibold ${
                              product.stock === 0 ? 'text-red-600' : 
                              product.stock <= product.minStock ? 'text-amber-600' : 'text-gray-900'
                            }`}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center text-gray-600">
                            {product.minStock}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openModal(product, 'add')}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Add Stock"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openModal(product, 'remove')}
                                disabled={product.stock === 0}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Remove Stock"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                  <p className="text-sm text-gray-600">
                    Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-medium px-3">
                      Page {page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                      disabled={page === pagination.pages}
                      className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            {logsLoading ? (
              <div className="text-center py-4 text-gray-500">Loading...</div>
            ) : logs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {logs.map((log) => (
                  <div key={log._id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-1.5 rounded-lg ${
                      log.type === 'in' ? 'bg-green-100' : 
                      log.type === 'out' ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      {log.type === 'in' ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {log.product?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {log.type === 'in' ? '+' : '-'}{Math.abs(log.quantity)} units
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(log.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {adjustmentType === 'add' ? 'Add Stock' : 'Remove Stock'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{selectedProduct.name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Stock
                </label>
                <p className="text-2xl font-bold text-gray-900">{selectedProduct.stock}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity to {adjustmentType === 'add' ? 'Add' : 'Remove'}
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  max={adjustmentType === 'remove' ? selectedProduct.stock : undefined}
                  className="input"
                  placeholder="Enter quantity"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason (Optional)
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="input"
                  placeholder="e.g., New shipment, Damaged goods"
                />
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  New Stock: <span className="font-semibold text-gray-900">
                    {adjustmentType === 'add' 
                      ? selectedProduct.stock + (parseInt(quantity) || 0)
                      : selectedProduct.stock - (parseInt(quantity) || 0)
                    }
                  </span>
                </p>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustStock}
                disabled={adjustStockMutation.isPending}
                className={`btn-primary ${
                  adjustmentType === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {adjustStockMutation.isPending ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;

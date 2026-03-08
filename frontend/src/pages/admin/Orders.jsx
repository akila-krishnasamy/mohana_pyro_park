import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  Eye, 
  Calendar, 
  Package,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  RotateCcw
} from 'lucide-react';
import { ordersAPI } from '../../services/api';
import { LoadingSpinner, ErrorMessage, EmptyState, StatusBadge } from '../../components/common';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [cancelModal, setCancelModal] = useState({ open: false, orderId: null });
  const [cancelReason, setCancelReason] = useState('');
  const limit = 15;

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminOrders', page],
    queryFn: () => ordersAPI.getAll({ 
      page, 
      limit 
    }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, cancellationReason }) => ordersAPI.updateStatus(id, status, cancellationReason),
    onSuccess: (data, variables) => {
      if (variables.status === 'cancelled') {
        toast.success('Order cancelled successfully');
      } else {
        toast.success('Order status updated');
      }
      queryClient.invalidateQueries(['adminOrders']);
      setCancelModal({ open: false, orderId: null });
      setCancelReason('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });

  const uncancelMutation = useMutation({
    mutationFn: (id) => ordersAPI.uncancel(id),
    onSuccess: () => {
      toast.success('Order restored successfully');
      queryClient.invalidateQueries(['adminOrders']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to restore order');
    },
  });

  const updateTrackingMutation = useMutation({
    mutationFn: ({ id, field, checked }) => ordersAPI.updateTracking(id, field, checked),
    onSuccess: () => {
      toast.success('Tracking updated');
      queryClient.invalidateQueries(['adminOrders']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update tracking');
    },
  });

  const handleTrackingChange = (orderId, field, currentValue) => {
    updateTrackingMutation.mutate({ id: orderId, field, checked: !currentValue });
  };

  const orders = data?.orders || [];
  const pagination = {
    total: data?.total || 0,
    pages: data?.pages || 1
  };

  // Filter by tracking status
  let filteredOrders = orders;
  
  if (statusFilter) {
    filteredOrders = orders.filter(order => {
      switch (statusFilter) {
        case 'order-confirm':
          return order.orderPicked?.checked === true;
        case 'pickup':
          return order.shipped?.checked === true;
        case 'dispatch':
          return order.reachedHub?.checked === true;
        case 'reached-hub':
          return order.arrivedHub?.checked === true;
        case 'cancelled':
          return order.status === 'cancelled';
        default:
          return true;
      }
    });
  }

  // Then filter by search query
  filteredOrders = filteredOrders.filter(order =>
    order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const trackingFilterOptions = [
    { value: 'order-confirm', label: 'Order Confirm' },
    { value: 'pickup', label: 'Pickup' },
    { value: 'dispatch', label: 'Dispatch' },
    { value: 'reached-hub', label: 'Reached Hub' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
        <div className="text-sm text-gray-500">
          Total: {pagination.total || 0} orders
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number, customer name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="input w-auto"
            >
              <option value="">All Orders</option>
              {trackingFilterOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders found"
          description={statusFilter ? "No orders match the selected filter." : "No orders have been placed yet."}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Order Confirm
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Pickup
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Dispatch
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Reached Hub
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Cancelled
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-subtle rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                            <p className="text-xs text-gray-500">{order.items?.length} items</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-medium text-gray-900">{order.customer?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{order.customer?.email || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {formatDate(order.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-semibold text-gray-900">
                          ₹{order.totalAmount?.toLocaleString()}
                        </p>
                        <p className={`text-xs ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                          {order.paymentStatus === 'paid' ? 'Paid' : 'COD'}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleTrackingChange(order._id, 'orderPicked', order.orderPicked?.checked)}
                          disabled={updateTrackingMutation.isPending || order.status === 'cancelled'}
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                            order.status === 'cancelled'
                              ? 'bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed'
                              : order.orderPicked?.checked 
                                ? 'bg-green-500 border-green-500 text-white' 
                                : 'border-gray-300 hover:border-green-400'
                          }`}
                          title={order.status === 'cancelled' ? 'Order cancelled' : order.orderPicked?.checked ? `Confirmed on ${new Date(order.orderPicked.checkedAt).toLocaleString()}` : 'Mark as confirmed'}
                        >
                          {order.orderPicked?.checked && <Check className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleTrackingChange(order._id, 'shipped', order.shipped?.checked)}
                          disabled={updateTrackingMutation.isPending || order.status === 'cancelled' || !order.orderPicked?.checked}
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                            order.status === 'cancelled' || !order.orderPicked?.checked
                              ? 'bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed'
                              : order.shipped?.checked 
                                ? 'bg-blue-500 border-blue-500 text-white' 
                                : 'border-gray-300 hover:border-blue-400'
                          }`}
                          title={order.status === 'cancelled' ? 'Order cancelled' : !order.orderPicked?.checked ? 'Complete Order Confirm first' : order.shipped?.checked ? `Picked up on ${new Date(order.shipped.checkedAt).toLocaleString()}` : 'Mark as pickup'}
                        >
                          {order.shipped?.checked && <Check className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleTrackingChange(order._id, 'reachedHub', order.reachedHub?.checked)}
                          disabled={updateTrackingMutation.isPending || order.status === 'cancelled' || !order.shipped?.checked}
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                            order.status === 'cancelled' || !order.shipped?.checked
                              ? 'bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed'
                              : order.reachedHub?.checked 
                                ? 'bg-purple-500 border-purple-500 text-white' 
                                : 'border-gray-300 hover:border-purple-400'
                          }`}
                          title={order.status === 'cancelled' ? 'Order cancelled' : !order.shipped?.checked ? 'Complete Pickup first' : order.reachedHub?.checked ? `Dispatched on ${new Date(order.reachedHub.checkedAt).toLocaleString()}` : 'Mark as dispatched'}
                        >
                          {order.reachedHub?.checked && <Check className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleTrackingChange(order._id, 'arrivedHub', order.arrivedHub?.checked)}
                          disabled={updateTrackingMutation.isPending || order.status === 'cancelled' || !order.reachedHub?.checked}
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                            order.status === 'cancelled' || !order.reachedHub?.checked
                              ? 'bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed'
                              : order.arrivedHub?.checked 
                                ? 'bg-orange-500 border-orange-500 text-white' 
                                : 'border-gray-300 hover:border-orange-400'
                          }`}
                          title={order.status === 'cancelled' ? 'Order cancelled' : !order.reachedHub?.checked ? 'Complete Dispatch first' : order.arrivedHub?.checked ? `Reached hub on ${new Date(order.arrivedHub.checkedAt).toLocaleString()}` : 'Mark as reached hub'}
                        >
                          {order.arrivedHub?.checked && <Check className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => {
                            if (order.status !== 'cancelled' && !['delivered', 'picked-up'].includes(order.status)) {
                              setCancelModal({ open: true, orderId: order._id });
                            }
                          }}
                          disabled={order.status === 'cancelled' || ['delivered', 'picked-up'].includes(order.status)}
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center mx-auto transition-colors ${
                            order.status === 'cancelled' 
                              ? 'bg-red-500 border-red-500 text-white cursor-default' 
                              : ['delivered', 'picked-up'].includes(order.status)
                                ? 'border-gray-200 bg-gray-100 cursor-not-allowed'
                                : 'border-gray-300 hover:border-red-400 hover:bg-red-50 cursor-pointer'
                          }`}
                          title={order.status === 'cancelled' ? `Cancelled on ${new Date(order.cancelledAt || order.updatedAt).toLocaleString()}` : ['delivered', 'picked-up'].includes(order.status) ? 'Cannot cancel completed orders' : 'Click to cancel order'}
                        >
                          {order.status === 'cancelled' && <Check className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/admin/orders/${order._id}`}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {/* Uncancel button - show for cancelled orders */}
                          {order.status === 'cancelled' && (
                            <button
                              onClick={() => uncancelMutation.mutate(order._id)}
                              disabled={uncancelMutation.isPending}
                              className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1"
                              title="Restore Order"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Restore
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
              <p className="text-sm text-gray-600">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} orders
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium px-3">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancelModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Cancel Order</h3>
              <button
                onClick={() => {
                  setCancelModal({ open: false, orderId: null });
                  setCancelReason('');
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cancellation Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter the reason for cancellation..."
                  rows={3}
                  className="input w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This reason will be shown to the customer.
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setCancelModal({ open: false, orderId: null });
                    setCancelReason('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!cancelReason.trim()) {
                      toast.error('Please enter a cancellation reason');
                      return;
                    }
                    updateStatusMutation.mutate({
                      id: cancelModal.orderId,
                      status: 'cancelled',
                      cancellationReason: cancelReason
                    });
                  }}
                  disabled={updateStatusMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {updateStatusMutation.isPending ? 'Cancelling...' : 'Confirm Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;

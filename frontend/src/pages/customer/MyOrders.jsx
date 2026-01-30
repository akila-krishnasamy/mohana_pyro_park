import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, ChevronRight, Calendar, Search, Filter } from 'lucide-react';
import { ordersAPI } from '../../services/api';
import { LoadingSpinner, ErrorMessage, EmptyState, StatusBadge } from '../../components/common';

const MyOrders = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['myOrders', statusFilter, page],
    queryFn: () => ordersAPI.getMyOrders({ 
      status: statusFilter || undefined,
      page, 
      limit 
    }),
  });

  const orders = data?.orders || [];
  const pagination = data?.pagination || {};

  const filteredOrders = orders.filter(order =>
    order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className="page-container">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number..."
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
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders found"
          description={
            statusFilter
              ? "No orders match the selected filter. Try changing the filter."
              : "You haven't placed any orders yet. Start shopping to see your orders here!"
          }
          action={
            !statusFilter && (
              <Link to="/products" className="btn-primary">
                Start Shopping
              </Link>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="card p-4 sm:p-6 block hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-subtle rounded-lg">
                    <Package className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-gray-900">
                        #{order.orderNumber}
                      </h3>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {order.items?.length} item{order.items?.length !== 1 ? 's' : ''} • 
                      <span className="font-medium text-gray-900 ml-1">
                        ₹{order.totalAmount?.toLocaleString()}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-primary-600 font-medium">
                  <span className="text-sm">View Details</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {order.items?.slice(0, 4).map((item, index) => (
                    <div
                      key={index}
                      className="w-12 h-12 bg-gradient-subtle rounded-lg flex items-center justify-center flex-shrink-0"
                      title={item.product?.name}
                    >
                      <span className="text-lg">🎆</span>
                    </div>
                  ))}
                  {order.items?.length > 4 && (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-gray-500">
                        +{order.items.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary px-4 py-2 disabled:opacity-50"
          >
            Previous
          </button>
          <div className="flex items-center gap-2">
            {[...Array(pagination.pages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                  page === i + 1
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="btn-secondary px-4 py-2 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MyOrders;

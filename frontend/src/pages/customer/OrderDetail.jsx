import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  Phone, 
  Calendar, 
  CreditCard,
  Truck,
  Store,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Check
} from 'lucide-react';
import { ordersAPI } from '../../services/api';
import { LoadingSpinner, ErrorMessage, StatusBadge } from '../../components/common';
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersAPI.getById(id),
  });

  const cancelMutation = useMutation({
    mutationFn: () => ordersAPI.cancel(id),
    onSuccess: () => {
      toast.success('Order cancelled successfully');
      queryClient.invalidateQueries(['order', id]);
      queryClient.invalidateQueries(['myOrders']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    },
  });

  const order = data?.order;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'confirmed':
      case 'processing':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'reached-hub':
        return <CheckCircle className="w-5 h-5 text-orange-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const orderTimeline = [
    { status: 'pending', label: 'Order Placed' },
    { status: 'confirmed', label: 'Confirmed' },
    { status: 'processing', label: 'Processing' },
    { status: 'shipped', label: 'Shipped' },
    { status: 'reached-hub', label: 'Reached Hub' },
  ];

  const getTimelineStatus = (stepStatus) => {
    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'reached-hub'];
    const currentIndex = statusOrder.indexOf(order?.status);
    const stepIndex = statusOrder.indexOf(stepStatus);

    if (order?.status === 'cancelled') {
      return stepStatus === 'pending' ? 'completed' : 'cancelled';
    }

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const canCancel = order && ['pending', 'confirmed'].includes(order.status);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!order) {
    navigate('/orders');
    return null;
  }

  return (
    <div className="page-container">
      <Link to="/orders" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </Link>

      {/* Order Header */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                Order #{order.orderNumber}
              </h1>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex items-center gap-2 text-gray-500 mt-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(order.createdAt)}</span>
            </div>
          </div>

          {canCancel && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to cancel this order?')) {
                  cancelMutation.mutate();
                }
              }}
              disabled={cancelMutation.isPending}
              className="btn-secondary text-red-600 border-red-200 hover:bg-red-50"
            >
              {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status / Tracking Progress */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Status</h2>

            {order.status === 'cancelled' ? (
              <div className="p-4 bg-red-50 rounded-lg space-y-3">
                <div className="flex items-center gap-4">
                  <XCircle className="w-8 h-8 text-red-500" />
                  <div>
                    <p className="font-medium text-red-700">Order Cancelled</p>
                    <p className="text-sm text-red-600 mt-1">
                      This order was cancelled on {formatDate(order.cancelledAt || order.updatedAt)}
                    </p>
                  </div>
                </div>
                {order.cancellationReason && (
                  <div className="mt-3 pt-3 border-t border-red-100">
                    <p className="text-sm font-medium text-red-700">Reason:</p>
                    <p className="text-sm text-red-600 mt-1">{order.cancellationReason}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <div className="flex justify-between">
                  {/* Order Placed */}
                  <div className="flex flex-col items-center relative z-10">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-500 text-white">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <p className="text-xs mt-2 text-center text-gray-700 font-medium">Order Placed</p>
                  </div>

                  {/* Confirmed (Order Confirm) */}
                  <div className="flex flex-col items-center relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      order.orderPicked?.checked 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {order.orderPicked?.checked ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <p className={`text-xs mt-2 text-center ${order.orderPicked?.checked ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                      Confirmed
                    </p>
                  </div>

                  {/* Processing (Pickup) */}
                  <div className="flex flex-col items-center relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      order.shipped?.checked 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {order.shipped?.checked ? <CheckCircle className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                    </div>
                    <p className={`text-xs mt-2 text-center ${order.shipped?.checked ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                      Processing
                    </p>
                  </div>

                  {/* Shipped (Dispatch) */}
                  <div className="flex flex-col items-center relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      order.reachedHub?.checked 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {order.reachedHub?.checked ? <CheckCircle className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
                    </div>
                    <p className={`text-xs mt-2 text-center ${order.reachedHub?.checked ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                      Shipped
                    </p>
                  </div>

                  {/* Reached Hub */}
                  <div className="flex flex-col items-center relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      order.arrivedHub?.checked
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {order.arrivedHub?.checked ? <CheckCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                    </div>
                    <p className={`text-xs mt-2 text-center ${order.arrivedHub?.checked ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                      Reached Hub
                    </p>
                  </div>
                </div>
                {/* Progress Line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-0" style={{ margin: '0 40px' }}>
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{
                      width: `${(() => {
                        let progress = 0;
                        if (order.orderPicked?.checked) progress = 1;
                        if (order.shipped?.checked) progress = 2;
                        if (order.reachedHub?.checked) progress = 3;
                        if (order.arrivedHub?.checked) progress = 4;
                        return (progress / 4) * 100;
                      })()}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Items ({order.items?.length})
            </h2>
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-gradient-subtle rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.product?.imageUrl && item.product.imageUrl !== '/images/default-cracker.png' ? (
                      <img src={item.product.imageUrl} alt={item.productName || item.product?.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">🎆</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.product?._id}`}
                      className="font-medium text-gray-900 hover:text-primary-600 line-clamp-1"
                    >
                      {item.productName || item.product?.name || 'Product'}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      ₹{(item.unitPrice || item.price || 0).toLocaleString()} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    ₹{(item.totalPrice || (item.unitPrice || item.price || 0) * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Price Summary */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Price Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{order.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge</span>
                <span className={order.deliveryCharge === 0 ? 'text-green-600' : ''}>
                  {order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{order.discount?.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-semibold text-gray-900">
                  <span>Total</span>
                  <span>₹{order.totalAmount?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {order.deliveryAddress ? 'Delivery Address' : 'Pickup Location'}
            </h2>
            {order.deliveryAddress ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-900">
                      {order.deliveryAddress.street}
                    </p>
                    <p className="text-gray-600">
                      {order.deliveryAddress.city}, {order.deliveryAddress.state}
                    </p>
                    <p className="text-gray-600">
                      {order.deliveryAddress.pincode}
                    </p>
                  </div>
                </div>
                {order.deliveryAddress.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <p className="text-gray-900">{order.deliveryAddress.phone}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <Store className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">MOHANA PYRO PARK</p>
                  <p className="text-gray-600">123 Main Street, Sivakasi</p>
                  <p className="text-gray-600">Tamil Nadu - 626123</p>
                </div>
              </div>
            )}
          </div>

          {/* Payment Info */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment</h2>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <CreditCard className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                </p>
                <p className={`text-sm ${
                  order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                </p>
              </div>
            </div>
          </div>

          {/* Order Notes */}
          {order.notes && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Notes</h2>
              <p className="text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;

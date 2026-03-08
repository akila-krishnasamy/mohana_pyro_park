import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  Phone, 
  Calendar, 
  CreditCard,
  User,
  Mail,
  Truck,
  Store,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Printer,
  Check
} from 'lucide-react';
import { ordersAPI } from '../../services/api';
import { LoadingSpinner, ErrorMessage, StatusBadge } from '../../components/common';
import toast from 'react-hot-toast';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminOrder', id],
    queryFn: () => ordersAPI.getById(id),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status) => ordersAPI.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Order status updated');
      queryClient.invalidateQueries(['adminOrder', id]);
      queryClient.invalidateQueries(['adminOrders']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });

  const updateTrackingMutation = useMutation({
    mutationFn: ({ field, checked }) => ordersAPI.updateTracking(id, field, checked),
    onSuccess: () => {
      toast.success('Tracking updated');
      queryClient.invalidateQueries(['adminOrder', id]);
      queryClient.invalidateQueries(['adminOrders']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update tracking');
    },
  });

  const handleTrackingChange = (field, currentValue) => {
    updateTrackingMutation.mutate({ field, checked: !currentValue });
  };

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

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-700' },
    { value: 'processing', label: 'Processing', color: 'bg-indigo-100 text-indigo-700' },
    { value: 'shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-700' },
    { value: 'reached-hub', label: 'Reached Hub', color: 'bg-orange-100 text-orange-700' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-700' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
  ];

  const orderTimeline = [
    { status: 'pending', label: 'Order Placed', icon: Clock },
    { status: 'confirmed', label: 'Confirmed', icon: CheckCircle },
    { status: 'processing', label: 'Processing', icon: Package },
    { status: 'shipped', label: 'Shipped', icon: Truck },
    { status: 'delivered', label: 'Delivered', icon: CheckCircle },
  ];

  const getTimelineStatus = (stepStatus) => {
    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(order?.status);
    const stepIndex = statusOrder.indexOf(stepStatus);

    if (order?.status === 'cancelled') {
      return stepStatus === 'pending' ? 'completed' : 'cancelled';
    }

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!order) {
    navigate('/admin/orders');
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/admin/orders" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>
        <button 
          onClick={() => window.print()}
          className="btn-secondary flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Print Order
        </button>
      </div>

      {/* Order Header */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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

          {/* Status Update */}
          {order.status !== 'cancelled' && order.status !== 'delivered' && order.status !== 'picked-up' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Update Status:</span>
              <select
                value={order.status}
                onChange={(e) => updateStatusMutation.mutate(e.target.value)}
                disabled={updateStatusMutation.isPending}
                className="input w-auto"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Timeline */}
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

                  {/* Confirmed */}
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

                  {/* Processing */}
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

                  {/* Shipped */}
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
                      <CheckCircle className="w-5 h-5" />
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Price</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Qty</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order.items?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-subtle rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {item.product?.imageUrl && item.product.imageUrl !== '/images/default-cracker.png' ? (
                              <img src={item.product.imageUrl} alt={item.productName || item.product?.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xl">🎆</span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.productName || item.product?.name || 'Product'}</p>
                            <p className="text-xs text-gray-500">{item.product?.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center text-gray-600">
                        ₹{(item.unitPrice || item.price || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-center text-gray-600">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-gray-900">
                        ₹{(item.totalPrice || (item.unitPrice || item.price || 0) * item.quantity).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <p className="text-gray-900">{order.customer?.name || 'N/A'}</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <p className="text-gray-900">{order.customer?.email || 'N/A'}</p>
              </div>
              {order.customer?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <p className="text-gray-900">{order.customer.phone}</p>
                </div>
              )}
            </div>
          </div>

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
                    <p className="text-gray-900">{order.deliveryAddress.street}</p>
                    <p className="text-gray-600">
                      {order.deliveryAddress.city}, {order.deliveryAddress.state}
                    </p>
                    <p className="text-gray-600">{order.deliveryAddress.pincode}</p>
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

          {/* Staff Tracking */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Staff Tracking</h2>
            <div className="space-y-4">
              {/* Order Picked */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleTrackingChange('orderPicked', order.orderPicked?.checked)}
                    disabled={updateTrackingMutation.isPending}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                      order.orderPicked?.checked 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {order.orderPicked?.checked && <Check className="w-4 h-4" />}
                  </button>
                  <span className="font-medium text-gray-700">Order Confirm</span>
                </div>
                {order.orderPicked?.checked && order.orderPicked?.checkedAt && (
                  <span className="text-xs text-gray-500">
                    {new Date(order.orderPicked.checkedAt).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Pickup */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleTrackingChange('shipped', order.shipped?.checked)}
                    disabled={updateTrackingMutation.isPending}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                      order.shipped?.checked 
                        ? 'bg-blue-500 border-blue-500 text-white' 
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {order.shipped?.checked && <Check className="w-4 h-4" />}
                  </button>
                  <span className="font-medium text-gray-700">Pickup</span>
                </div>
                {order.shipped?.checked && order.shipped?.checkedAt && (
                  <span className="text-xs text-gray-500">
                    {new Date(order.shipped.checkedAt).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Dispatch */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleTrackingChange('reachedHub', order.reachedHub?.checked)}
                    disabled={updateTrackingMutation.isPending}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                      order.reachedHub?.checked 
                        ? 'bg-purple-500 border-purple-500 text-white' 
                        : 'border-gray-300 hover:border-purple-400'
                    }`}
                  >
                    {order.reachedHub?.checked && <Check className="w-4 h-4" />}
                  </button>
                  <span className="font-medium text-gray-700">Dispatch</span>
                </div>
                {order.reachedHub?.checked && order.reachedHub?.checkedAt && (
                  <span className="text-xs text-gray-500">
                    {new Date(order.reachedHub.checkedAt).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Reached Hub */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleTrackingChange('arrivedHub', order.arrivedHub?.checked)}
                    disabled={updateTrackingMutation.isPending}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                      order.arrivedHub?.checked 
                        ? 'bg-orange-500 border-orange-500 text-white' 
                        : 'border-gray-300 hover:border-orange-400'
                    }`}
                  >
                    {order.arrivedHub?.checked && <Check className="w-4 h-4" />}
                  </button>
                  <span className="font-medium text-gray-700">Reached Hub</span>
                </div>
                {order.arrivedHub?.checked && order.arrivedHub?.checkedAt && (
                  <span className="text-xs text-gray-500">
                    {new Date(order.arrivedHub.checkedAt).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Cancelled */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                      order.status === 'cancelled' 
                        ? 'bg-red-500 border-red-500 text-white' 
                        : 'border-gray-300'
                    }`}
                  >
                    {order.status === 'cancelled' && <Check className="w-4 h-4" />}
                  </div>
                  <span className={`font-medium ${order.status === 'cancelled' ? 'text-red-600' : 'text-gray-700'}`}>Cancelled</span>
                </div>
                {order.status === 'cancelled' && order.cancelledAt && (
                  <span className="text-xs text-gray-500">
                    {new Date(order.cancelledAt).toLocaleString()}
                  </span>
                )}
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

export default AdminOrderDetail;

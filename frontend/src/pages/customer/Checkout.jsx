import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { MapPin, Truck, Store, CreditCard, ArrowLeft, Check, Loader } from 'lucide-react';
import { useCartStore, useAuthStore } from '../../store';
import { ordersAPI } from '../../services/api';
import { PurchaseSuccessPopup } from '../../components/common';
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [deliveryMethod, setDeliveryMethod] = useState('delivery');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
    phone: user?.phone || '',
    notes: '',
  });

  const total = getTotal();
  const deliveryCharge = deliveryMethod === 'pickup' ? 0 : (total >= 2000 ? 0 : 50);
  const grandTotal = total + deliveryCharge;

  const createOrderMutation = useMutation({
    mutationFn: ordersAPI.create,
    onSuccess: (response) => {
      clearCart();
      toast.success('Order placed successfully!');
      setShowPopup(true);
      setTimeout(() => {
        navigate(`/orders/${response.order._id}`);
      }, 3000);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to place order');
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (deliveryMethod === 'delivery') {
      if (!formData.street || !formData.city || !formData.pincode || !formData.phone) {
        toast.error('Please fill in all delivery details');
        return;
      }
    }

    const orderData = {
      items: items.map(item => ({
        productId: item.product._id,
        quantity: item.quantity,
        price: item.product.discountPrice || item.product.price,
      })),
      deliveryType: deliveryMethod,
      deliveryAddress: deliveryMethod === 'delivery' ? {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      } : null,
      paymentMethod: paymentMethod === 'cod' ? 'cash' : paymentMethod,
      customerNotes: formData.notes,
    };

    createOrderMutation.mutate(orderData);
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="page-container">
      <Link to="/cart" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Cart
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Method */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Method</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <label
                  className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    deliveryMethod === 'delivery'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="delivery"
                    checked={deliveryMethod === 'delivery'}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`p-2 rounded-lg ${deliveryMethod === 'delivery' ? 'bg-primary-100' : 'bg-gray-100'}`}>
                    <Truck className={`w-5 h-5 ${deliveryMethod === 'delivery' ? 'text-primary-600' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Home Delivery</p>
                    <p className="text-sm text-gray-500">
                      {total >= 2000 ? 'FREE' : '₹50'} • 2-3 days
                    </p>
                  </div>
                  {deliveryMethod === 'delivery' && (
                    <Check className="w-5 h-5 text-primary-600 ml-auto" />
                  )}
                </label>

                <label
                  className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    deliveryMethod === 'pickup'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="pickup"
                    checked={deliveryMethod === 'pickup'}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`p-2 rounded-lg ${deliveryMethod === 'pickup' ? 'bg-primary-100' : 'bg-gray-100'}`}>
                    <Store className={`w-5 h-5 ${deliveryMethod === 'pickup' ? 'text-primary-600' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Store Pickup</p>
                    <p className="text-sm text-gray-500">FREE • Same day</p>
                  </div>
                  {deliveryMethod === 'pickup' && (
                    <Check className="w-5 h-5 text-primary-600 ml-auto" />
                  )}
                </label>
              </div>
            </div>

            {/* Delivery Address */}
            {deliveryMethod === 'delivery' && (
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Delivery Address</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      placeholder="House number, street name"
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="input"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="6-digit pincode"
                      className="input"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="10-digit phone number"
                      className="input"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Store Pickup Info */}
            {deliveryMethod === 'pickup' && (
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Store className="w-5 h-5 text-primary-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Pickup Location</h2>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900">MOHANA PYRO PARK</p>
                  <p className="text-gray-600 mt-1">
                    123 Main Street, Sivakasi<br />
                    Tamil Nadu - 626123
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Open: 9:00 AM - 9:00 PM (All days)
                  </p>
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
              </div>
              <label
                className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer ${
                  paymentMethod === 'cod'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="sr-only"
                />
                <div className={`p-2 rounded-lg ${paymentMethod === 'cod' ? 'bg-primary-100' : 'bg-gray-100'}`}>
                  <span className="text-xl">💵</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Cash on Delivery</p>
                  <p className="text-sm text-gray-500">Pay when you receive your order</p>
                </div>
                {paymentMethod === 'cod' && (
                  <Check className="w-5 h-5 text-primary-600 ml-auto" />
                )}
              </label>
            </div>

            {/* Order Notes */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Notes (Optional)</h2>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any special instructions for your order..."
                rows={3}
                className="input"
              />
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

              {/* Order Items */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {items.map((item) => {
                  const price = item.product.discountPrice || item.product.price;
                  return (
                    <div key={item.product._id} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-subtle rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {item.product.imageUrl && item.product.imageUrl !== '/images/default-cracker.png' ? (
                          <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl">🎆</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          ₹{price.toLocaleString()} × {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        ₹{(price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className={deliveryCharge === 0 ? 'text-green-600' : ''}>
                    {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                  </span>
                </div>
              </div>

              <div className="border-t mt-4 pt-4 mb-6">
                <div className="flex justify-between text-lg font-semibold text-gray-900">
                  <span>Total</span>
                  <span>₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={createOrderMutation.isPending}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {createOrderMutation.isPending ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Place Order
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By placing this order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </form>

      <PurchaseSuccessPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
      />
    </div>
  );
};

export default Checkout;

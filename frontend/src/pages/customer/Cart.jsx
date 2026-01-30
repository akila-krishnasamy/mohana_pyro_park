import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore, useAuthStore } from '../../store';
import { EmptyState } from '../../components/common';

const Cart = () => {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const total = getTotal();
  const deliveryCharge = total >= 2000 ? 0 : 50;
  const grandTotal = total + deliveryCharge;

  if (items.length === 0) {
    return (
      <div className="page-container">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added any products yet. Start shopping to fill your cart!"
          action={
            <Link to="/products" className="btn-primary inline-flex items-center gap-2">
              Browse Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="text-red-600 hover:text-red-700 font-medium text-sm"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const effectivePrice = item.product.discountPrice || item.product.price;
            return (
              <div key={item.product._id} className="card p-4 sm:p-6">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-subtle rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-4xl">🎆</span>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <Link 
                      to={`/products/${item.product._id}`}
                      className="font-semibold text-gray-900 hover:text-primary-600 line-clamp-2"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.product.category?.name}
                    </p>
                    <p className="font-semibold text-gray-900 mt-2">
                      ₹{effectivePrice.toLocaleString()}
                      <span className="text-gray-500 font-normal"> / {item.product.unit}</span>
                    </p>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex flex-col items-end justify-between">
                    {/* Quantity */}
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                        className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="p-1.5 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Subtotal & Remove */}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="font-semibold text-gray-900">
                        ₹{(effectivePrice * item.quantity).toLocaleString()}
                      </span>
                      <button
                        onClick={() => removeItem(item.product._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stock Warning */}
                {item.quantity >= item.product.stock && (
                  <p className="text-amber-600 text-sm mt-3">
                    Maximum available quantity reached
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.length} items)</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge</span>
                <span className={deliveryCharge === 0 ? 'text-green-600' : ''}>
                  {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                </span>
              </div>
              {total < 2000 && (
                <p className="text-xs text-gray-500">
                  Add ₹{(2000 - total).toLocaleString()} more for free delivery
                </p>
              )}
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between text-lg font-semibold text-gray-900">
                <span>Total</span>
                <span>₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {isAuthenticated ? (
              <Link
                to="/checkout"
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  Login to Checkout
                </Link>
                <p className="text-center text-sm text-gray-500">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-primary-600 font-medium">
                    Sign Up
                  </Link>
                </p>
              </div>
            )}

            <Link
              to="/products"
              className="block text-center text-primary-600 font-medium mt-4 hover:text-primary-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Zap, Search, AlertTriangle } from 'lucide-react';
import { productsAPI, categoriesAPI } from '../../services/api';
import { useCartStore, useAuthStore } from '../../store';
import { LoadingSpinner } from '../../components/common';
import toast from 'react-hot-toast';

const QuickPurchase = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { addItem, items: cartItems } = useCartStore();
  const [quantities, setQuantities] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const canShop = !isAuthenticated || user?.role === 'customer';

  // Fetch products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products-quick', { limit: 500 }],
    queryFn: () => productsAPI.getAll({ limit: 500 }),
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll(),
  });

  const products = productsData?.products || [];
  const categories = categoriesData?.categories || [];

  // Filter products by search
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  // Group products by category
  const productsByCategory = useMemo(() => {
    const grouped = {};
    categories.forEach(cat => {
      const catProducts = filteredProducts.filter(p => p.category?._id === cat._id || p.category === cat._id);
      if (catProducts.length > 0) {
        grouped[cat._id] = {
          name: cat.name,
          products: catProducts
        };
      }
    });
    return grouped;
  }, [filteredProducts, categories]);

  const handleQuantityChange = (productId, value) => {
    const product = products.find(p => p._id === productId);
    const maxStock = product?.stock || 0;
    const qty = Math.min(Math.max(0, parseInt(value) || 0), maxStock);
    setQuantities(prev => ({ ...prev, [productId]: qty }));
  };

  // Calculate totals
  const { netTotal, youSave, totalItems } = useMemo(() => {
    let net = 0;
    let original = 0;
    let items = 0;

    Object.entries(quantities).forEach(([productId, qty]) => {
      if (qty > 0) {
        const product = products.find(p => p._id === productId);
        if (product) {
          const discountPrice = product.discountPrice || product.price;
          net += discountPrice * qty;
          original += product.price * qty;
          items += qty;
        }
      }
    });

    return {
      netTotal: net,
      youSave: original - net,
      totalItems: items
    };
  }, [quantities, products]);

  const handleAddAllToCart = () => {
    let addedCount = 0;
    Object.entries(quantities).forEach(([productId, qty]) => {
      if (qty > 0) {
        const product = products.find(p => p._id === productId);
        if (product) {
          addItem(product, qty);
          addedCount += qty;
        }
      }
    });
    if (addedCount > 0) {
      toast.success(`Added ${addedCount} items to cart`);
      setQuantities({});
    } else {
      toast.error('Please enter quantities first');
    }
  };

  if (!canShop) {
    return (
      <div className="page-container text-center py-16">
        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Purchase</h2>
        <p className="text-gray-500">This feature is available for customers only.</p>
      </div>
    );
  }

  if (productsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Quick Purchase</h1>
          </div>
          <p className="text-white/80 mb-6">Quickly add multiple items to your cart in one go!</p>
          
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </div>

      {/* Sticky Summary Bar */}
      <div className="sticky top-16 z-40 bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">Items:</span>
                <span className="font-bold text-lg text-gray-900">{totalItems}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">You Save:</span>
                <span className="font-bold text-lg text-green-600">₹{youSave.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">Total:</span>
                <span className="font-bold text-xl text-primary-600">₹{netTotal.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddAllToCart}
                disabled={totalItems === 0}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart ({totalItems})
              </button>
              {cartItems.length > 0 && (
                <button
                  onClick={() => navigate('/cart')}
                  className="btn-secondary"
                >
                  View Cart ({cartItems.length})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {Object.entries(productsByCategory).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(productsByCategory).map(([categoryId, categoryData]) => (
              <div key={categoryId} className="card overflow-hidden">
                {/* Category Header */}
                <div className="bg-gradient-to-r from-primary-500 to-secondary-500 px-6 py-3">
                  <h2 className="text-white font-bold text-lg">{categoryData.name}</h2>
                </div>

                {/* Products */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-16">#</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase w-24">Stock</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase w-24">MRP</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase w-24">Price</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase w-28">Qty</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase w-28">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {categoryData.products.map((product, index) => {
                        const qty = quantities[product._id] || 0;
                        const effectivePrice = product.discountPrice || product.price;
                        const rowTotal = effectivePrice * qty;
                        const hasDiscount = product.discountPrice && product.discountPrice < product.price;
                        const stock = product.stock || 0;
                        const isOutOfStock = stock === 0;
                        const isLowStock = stock > 0 && stock <= 10;

                        return (
                          <tr key={product._id} className={`hover:bg-gray-50 transition-colors ${isOutOfStock ? 'bg-red-50/50 opacity-60' : ''}`}>
                            <td className="px-4 py-3 text-gray-500 text-sm">{index + 1}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                                  {product.imageUrl && product.imageUrl !== '/images/default-cracker.png' ? (
                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-xl">🎆</span>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{product.name}</p>
                                  <p className="text-xs text-gray-500">{product.unitType || '1 Pkt'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {isOutOfStock ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                  Out of Stock
                                </span>
                              ) : isLowStock ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                  <AlertTriangle className="w-3 h-3" />
                                  {stock} left
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                  In Stock
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-sm ${hasDiscount ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                ₹{product.price}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="font-semibold text-green-600">₹{effectivePrice}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {isOutOfStock ? (
                                <span className="text-xs text-gray-400">—</span>
                              ) : (
                                <input
                                  type="number"
                                  min="0"
                                  max={stock}
                                  value={qty || ''}
                                  onChange={(e) => handleQuantityChange(product._id, Math.min(parseInt(e.target.value) || 0, stock))}
                                  className="w-20 text-center border border-gray-300 rounded-lg px-2 py-1.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-colors"
                                  placeholder="0"
                                />
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className={`font-semibold ${qty > 0 ? 'text-primary-600' : 'text-gray-300'}`}>
                                ₹{rowTotal.toLocaleString()}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Fixed Bar */}
      <div className="sticky bottom-0 bg-white border-t shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-gray-500 text-sm block">Selected Items</span>
                <span className="font-bold text-2xl text-gray-900">{totalItems}</span>
              </div>
              <div className="h-10 w-px bg-gray-200"></div>
              <div>
                <span className="text-gray-500 text-sm block">You Save</span>
                <span className="font-bold text-2xl text-green-600">₹{youSave.toLocaleString()}</span>
              </div>
              <div className="h-10 w-px bg-gray-200"></div>
              <div>
                <span className="text-gray-500 text-sm block">Grand Total</span>
                <span className="font-bold text-2xl text-primary-600">₹{netTotal.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddAllToCart}
                disabled={totalItems === 0}
                className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              {cartItems.length > 0 && (
                <button
                  onClick={() => navigate('/checkout')}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-colors"
                >
                  Checkout →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickPurchase;

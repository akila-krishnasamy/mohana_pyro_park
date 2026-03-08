import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Minus, Plus, ArrowLeft, Shield, Truck, RotateCcw } from 'lucide-react';
import { productsAPI } from '../../services/api';
import { useCartStore, useAuthStore } from '../../store';
import { PageLoader, ErrorMessage, StatusBadge } from '../../components/common';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  // Reset image error when product changes
  useEffect(() => {
    setImageError(false);
  }, [id]);

  // Only customers (or unauthenticated users) can shop
  const canShop = !isAuthenticated || user?.role === 'customer';

  const { data: product, isLoading, isError, refetch } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsAPI.getOne(id),
    select: (res) => res.product,
  });

  // Get image URL - try product imageUrl or match by name
  const getProductImage = () => {
    if (!product) return null;
    
    // If product has a valid imageUrl (local path), use it
    if (product.imageUrl && product.imageUrl.startsWith('/images/products/')) {
      return product.imageUrl;
    }
    
    // Try to match product name to local image file
    const productName = product.name?.toLowerCase();
    if (productName?.includes('100 shot')) return '/images/products/100 shot.webp';
    if (productName?.includes('200 shot')) return '/images/products/200 shot.webp';
    if (productName?.includes('265 shot')) return '/images/products/265 shot.webp';
    
    // Return the imageUrl if it exists (external URL)
    if (product.imageUrl && product.imageUrl !== '/images/default-cracker.png') {
      return product.imageUrl;
    }
    
    return null;
  };

  const productImage = product ? getProductImage() : null;

  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorMessage message="Failed to load product" onRetry={refetch} />;
  if (!product) return <ErrorMessage message="Product not found" />;

  const effectivePrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast.error('Product is out of stock');
      return;
    }
    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} items available`);
      return;
    }
    addItem(product, quantity);
    toast.success(`${product.name} added to cart!`);
  };

  const safetyLabels = {
    'safe': { label: 'Safe for All Ages', color: 'badge-success' },
    'moderate': { label: 'Moderate', color: 'badge-warning' },
    'high-noise': { label: 'High Noise', color: 'badge-danger' },
    'professional': { label: 'Professional Use Only', color: 'badge-danger' },
  };

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link 
          to="/products" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-square bg-gradient-subtle rounded-2xl flex items-center justify-center relative overflow-hidden">
            {productImage && !imageError ? (
              <img 
                src={productImage} 
                alt={product.name} 
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="text-[150px]">🎆</div>
            )}
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {hasDiscount && (
                <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded">
                  -{discountPercent}% OFF
                </span>
              )}
              {product.isFestivalSpecial && (
                <span className="bg-accent-gold text-white text-sm font-bold px-3 py-1 rounded">
                  Festival Special
                </span>
              )}
            </div>

            {product.stock <= 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg text-lg">
                  Out of Stock
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Category */}
          <p className="text-primary-600 font-medium">
            {product.category?.name}
          </p>

          {/* Name */}
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-gray-900">
              ₹{effectivePrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-xl text-gray-400 line-through">
                ₹{product.price.toLocaleString()}
              </span>
            )}
            <span className="text-gray-500">per {product.unit}</span>
          </div>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed">
            {product.description || 'Premium quality cracker from Sivakasi. Perfect for celebrations and festivals.'}
          </p>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className={safetyLabels[product.safetyType]?.color}>
              {safetyLabels[product.safetyType]?.label}
            </span>
            {product.ageRecommendation !== 'all-ages' && (
              <span className="badge-info">Age: {product.ageRecommendation}</span>
            )}
            {product.itemsPerUnit > 1 && (
              <span className="badge">{product.itemsPerUnit} pcs per {product.unit}</span>
            )}
          </div>

          {/* Stock Info */}
          <div>
            {product.stock > 0 ? (
              <p className={`font-medium ${product.stock <= product.lowStockThreshold ? 'text-amber-600' : 'text-green-600'}`}>
                {product.stock <= product.lowStockThreshold 
                  ? `Only ${product.stock} left in stock!`
                  : '✓ In Stock'
                }
              </p>
            ) : (
              <p className="text-red-600 font-medium">Out of Stock</p>
            )}
          </div>

          {/* Quantity Selector - Only for customers */}
          {product.stock > 0 && canShop && (
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-medium">Quantity:</span>
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Add to Cart Button - Only for customers */}
          {canShop ? (
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-lg transition-all
                ${product.stock > 0 
                  ? 'btn-primary' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          ) : (
            <div className="w-full py-4 rounded-xl bg-gray-100 text-center text-gray-600">
              <p className="font-medium">Viewing as {user?.role}</p>
              <p className="text-sm">Shopping is available for customers only</p>
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-xs text-gray-600">Quality Certified</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xs text-gray-600">Fast Delivery</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
                <RotateCcw className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-xs text-gray-600">Easy Returns</p>
            </div>
          </div>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500 mb-2">Tags:</p>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Eye } from 'lucide-react';
import { useCartStore, useAuthStore } from '../../store';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addItem } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();

  // Only customers (or unauthenticated users) can shop
  const canShop = !isAuthenticated || user?.role === 'customer';

  const effectivePrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!canShop) {
      toast.error('Shopping is available for customers only');
      return;
    }
    
    if (product.stock <= 0) {
      toast.error('Product is out of stock');
      return;
    }
    
    addItem(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <Link to={`/products/${product._id}`} className="card-hover group">
      {/* Image */}
      <div className="relative aspect-square bg-gradient-subtle overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl">🎆</div>
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {hasDiscount && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discountPercent}%
            </span>
          )}
          {product.isFestivalSpecial && (
            <span className="bg-accent-gold text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
              <Star className="w-3 h-3" />
              Special
            </span>
          )}
        </div>

        {/* Stock badge */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-900 font-semibold px-4 py-2 rounded-lg">
              Out of Stock
            </span>
          </div>
        )}
        {product.stock > 0 && product.stock <= product.lowStockThreshold && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded">
              Only {product.stock} left
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <p className="text-xs text-primary-600 font-medium mb-1">
          {product.category?.name || 'Crackers'}
        </p>

        {/* Name */}
        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">
            ₹{effectivePrice.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              ₹{product.price.toLocaleString()}
            </span>
          )}
          <span className="text-xs text-gray-500">/ {product.unit}</span>
        </div>

        {/* Add to Cart Button - Only for customers */}
        {canShop ? (
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all
              ${product.stock > 0 
                ? 'bg-primary-500 text-white hover:bg-primary-600 active:scale-[0.98]' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        ) : (
          <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium bg-gray-100 text-gray-500">
            <Eye className="w-4 h-4" />
            View Only
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;

import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, CheckCircle } from 'lucide-react';
import { categoriesAPI, productsAPI } from '../../services/api';
import { LoadingSpinner, ErrorMessage } from '../../components/common';
import toast from 'react-hot-toast';

const initialForm = {
  name: '',
  category: '',
  description: '',
  price: '',
  discountPrice: '',
  stock: '',
  unit: 'box',
  itemsPerUnit: '10'
};

const NewArrival = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageError, setImageError] = useState(false);

  const { data: categoriesData, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesAPI.getAll
  });

  const categories = categoriesData?.categories || [];

  const createMutation = useMutation({
    mutationFn: productsAPI.createWithImage,
    onSuccess: () => {
      toast.success('New arrival product created successfully');
      queryClient.invalidateQueries(['adminProducts']);
      setFormData(initialForm);
      setImageFile(null);
      setImagePreview('');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create new arrival product');
    }
  });

  const selectedCategoryName = useMemo(() => {
    const category = categories.find((cat) => cat._id === formData.category);
    return category?.name || 'Ground Chakkar';
  }, [categories, formData.category]);

  useEffect(() => {
    setImageError(false);
  }, [imagePreview]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const effectivePrice = formData.discountPrice ? Number(formData.discountPrice) : Number(formData.price || 0);
  const isInStock = Number(formData.stock || 0) > 0;

  const handleSubmit = (e) => {
    e.preventDefault();

    const price = Number(formData.price);
    const discountPrice = formData.discountPrice ? Number(formData.discountPrice) : null;

    if (discountPrice && discountPrice > price) {
      toast.error('Offer price must be less than or equal to MRP');
      return;
    }

    const payload = new FormData();
    payload.append('name', formData.name.trim());
    payload.append('category', formData.category);
    payload.append('description', formData.description.trim());
    payload.append('price', String(price));
    if (discountPrice != null) payload.append('discountPrice', String(discountPrice));
    payload.append('stock', String(Number(formData.stock)));
    payload.append('unit', formData.unit);
    payload.append('itemsPerUnit', String(Number(formData.itemsPerUnit)));
    payload.append('safetyType', 'safe');
    payload.append('ageRecommendation', 'all-ages');
    payload.append('isActive', 'true');
    if (imageFile) payload.append('image', imageFile);

    createMutation.mutate(payload);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreview('');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      e.target.value = '';
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-gray-900">New Product Arrival</h1>
        <p className="text-sm text-gray-500 mt-1">Create a new arrival product for customer listing.</p>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Super Chakkar Big"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              className="input"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              className="input"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="High quality Super Chakkar Big from Sivakasi. Perfect for celebrations."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
            <input
              type="file"
              accept="image/*"
              className="input"
              onChange={handleImageChange}
            />
            <p className="text-xs text-gray-500 mt-1">Upload JPG, PNG or WEBP (max 5MB)</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MRP (₹) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="120"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Offer Price (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input"
                value={formData.discountPrice}
                onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                placeholder="100"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
              <input
                type="number"
                min="0"
                className="input"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
              <select
                className="input"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                <option value="piece">piece</option>
                <option value="box">box</option>
                <option value="pack">pack</option>
                <option value="dozen">dozen</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Items / Unit *</label>
              <input
                type="number"
                min="1"
                className="input"
                value={formData.itemsPerUnit}
                onChange={(e) => setFormData({ ...formData, itemsPerUnit: e.target.value })}
                placeholder="10"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Creating...' : 'Create New Arrival'}
          </button>
        </form>
      </div>

      <div className="card p-6 h-fit">
        <p className="text-sm font-medium text-gray-500 mb-4">Preview</p>

        <div className="rounded-xl border border-gray-200 p-5 bg-white">
          <div className="w-full h-48 rounded-xl bg-gradient-subtle flex items-center justify-center overflow-hidden mb-4">
            {imagePreview && !imageError ? (
              <img
                src={imagePreview}
                alt={formData.name || 'Product image'}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="text-5xl">🎆</span>
            )}
          </div>

          <p className="text-sm text-gray-600">{selectedCategoryName}</p>

          <h2 className="text-xl font-bold text-gray-900 mt-1">
            {formData.name || 'Super Chakkar Big'}
          </h2>

          <p className="text-2xl font-bold text-gray-900 mt-2">
            ₹{Number(effectivePrice || 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">per {formData.unit || 'box'}</p>

          <p className="text-gray-600 mt-3">
            {formData.description || 'High quality Super Chakkar Big from Sivakasi. Perfect for celebrations.'}
          </p>

          <div className="mt-4 space-y-1 text-sm text-gray-700">
            <p>Safe for All Ages</p>
            <p>{Number(formData.itemsPerUnit || 0)} pcs per {formData.unit || 'box'}</p>
            <p className={isInStock ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              {isInStock ? '✓ In Stock' : '✗ Out of Stock'}
            </p>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-500">Quantity:</p>
            <div className="w-16 h-10 mt-1 rounded-lg border border-gray-300 flex items-center justify-center text-gray-700">1</div>
          </div>

          <button type="button" className="btn-primary w-full mt-4" disabled>
            <Package className="w-4 h-4" />
            Add to Cart
          </button>

          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <CheckCircle className="w-4 h-4" />
            Preview only, customer view style
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewArrival;
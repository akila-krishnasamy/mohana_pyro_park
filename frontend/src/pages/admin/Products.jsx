import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { productsAPI, categoriesAPI } from '../../services/api';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../../components/common';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [failedImages, setFailedImages] = useState({});
  const limit = 15;

  const initialFormState = {
    name: '',
    description: '',
    category: '',
    price: '',
    discountPrice: '',
    stock: '',
    unit: 'piece',
    itemsPerUnit: '1',
    isActive: true,
  };

  const [formData, setFormData] = useState(initialFormState);

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminProducts', categoryFilter, page],
    queryFn: () => productsAPI.getAll({ 
      category: categoryFilter || undefined,
      page, 
      limit 
    }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesAPI.getAll,
  });

  const createMutation = useMutation({
    mutationFn: productsAPI.create,
    onSuccess: () => {
      toast.success('Product created successfully');
      queryClient.invalidateQueries(['adminProducts']);
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create product');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => productsAPI.update(id, data),
    onSuccess: () => {
      toast.success('Product updated successfully');
      queryClient.invalidateQueries(['adminProducts']);
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update product');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: productsAPI.delete,
    onSuccess: () => {
      toast.success('Product deleted successfully');
      queryClient.invalidateQueries(['adminProducts']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    },
  });

  const products = data?.products || [];
  const pagination = data?.pagination || {};
  const categories = categoriesData?.categories || [];

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const resolveProductImage = (product) => {
    const name = (product?.name || '').toLowerCase();
    const categoryName = (product?.category?.name || '').toLowerCase();
    const text = `${name} ${categoryName}`;

    if (text.includes('5000') && text.includes('wala')) return '/api/uploads/products/5000-walas-crackers.jpg';
    if (text.includes('1000') && text.includes('wala')) return '/api/uploads/products/1000Wala.webp';
    if (text.includes('dragon') && text.includes('bomb')) return '/api/uploads/products/DragonBomb.jpg';
    if (text.includes('atom') && text.includes('bomb')) return '/api/uploads/products/AtomBomb.png';
    if (text.includes('hydro') && text.includes('bomb')) return '/api/uploads/products/DragonBomb.jpg';
    if (text.includes('hydrogen') && text.includes('bomb')) return '/api/uploads/products/DragonBomb.jpg';
    if (text.includes('paper') && text.includes('bomb')) return '/api/uploads/products/ClassicAtomBomb.jpg';
    if (text.includes('pubg') && text.includes('bomb')) return '/api/uploads/products/DragonBomb.jpg';
    if (text.includes('bomb')) return '/api/uploads/products/AtomBomb.png';

    if (name.includes('100 shot')) return '/images/products/100 shot.webp';
    if (name.includes('200 shot')) return '/images/products/200 shot.webp';
    if (name.includes('265 shot')) return '/images/products/265 shot.webp';
    if (text.includes('chakkar')) return '/images/products/ground-chakkar.jpg';
    if (text.includes('flower pot') || text.includes('flowerpot')) return '/images/products/flower-pots.png';

    if (product?.imageUrl && product.imageUrl !== '/images/default-cracker.png') {
      return product.imageUrl;
    }

    return null;
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category?._id || '',
        price: product.price || '',
        discountPrice: product.discountPrice || '',
        stock: product.stock || '',
        unit: product.unit || 'piece',
        itemsPerUnit: product.itemsPerUnit || '1',
        isActive: product.isActive ?? true,
      });
      setImagePreview(resolveProductImage(product) || '');
    } else {
      setEditingProduct(null);
      setFormData(initialFormState);
      setImagePreview('');
    }
    setImageFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData(initialFormState);
    setImageFile(null);
    setImagePreview('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreview(editingProduct ? resolveProductImage(editingProduct) || '' : '');
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

    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const price = Number(formData.price);
    const hasDiscountInput = formData.discountPrice !== '';
    const discountPrice = hasDiscountInput ? Number(formData.discountPrice) : null;

    if (discountPrice != null && discountPrice > price) {
      toast.error('Offer price must be less than or equal to MRP');
      return;
    }

    const payload = new FormData();
    payload.append('name', formData.name.trim());
    payload.append('category', formData.category);
    payload.append('description', formData.description.trim());
    payload.append('price', String(price));
    payload.append('discountPrice', discountPrice != null ? String(discountPrice) : '');
    payload.append('stock', String(Number(formData.stock)));
    payload.append('unit', formData.unit);
    payload.append('itemsPerUnit', String(Number(formData.itemsPerUnit)));
    payload.append('isActive', String(formData.isActive));
    if (imageFile) payload.append('image', imageFile);

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (product) => {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      deleteMutation.mutate(product._id);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
        <button
          onClick={() => openModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="input w-auto"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description="No products match your search. Try adjusting your filters or add a new product."
          action={
            <button onClick={() => openModal()} className="btn-primary">
              Add Product
            </button>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Category</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Price</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Offer</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Stock</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-subtle rounded-lg flex items-center justify-center overflow-hidden">
                          {resolveProductImage(product) && !failedImages[product._id] ? (
                            <img
                              src={resolveProductImage(product)}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={() => setFailedImages((prev) => ({ ...prev, [product._id]: true }))}
                            />
                          ) : (
                            <span className="text-xl">🎆</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {product.category?.name}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="font-medium text-gray-900">₹{product.price?.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {product.discountPrice != null && product.discountPrice < product.price ? (
                        <p className="font-medium text-green-600">₹{product.discountPrice?.toLocaleString()}</p>
                      ) : (
                        <p className="text-gray-400">—</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-medium ${
                        product.stock === 0 ? 'text-red-600' : 
                        product.stock <= product.minStock ? 'text-amber-600' : 'text-gray-900'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium px-3">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input"
                    rows={3}
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="input"
                    onChange={handleImageChange}
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload JPG, PNG or WEBP (max 5MB)</p>
                  {imagePreview ? (
                    <div className="mt-3 w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit *
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="input"
                  >
                    <option value="piece">Piece</option>
                    <option value="box">Box</option>
                    <option value="pack">Pack</option>
                    <option value="dozen">Dozen</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    MRP (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Offer Price (₹)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.discountPrice}
                      onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                      className="input"
                      min="0"
                      step="0.01"
                    />
                    <button
                      type="button"
                      className="btn-secondary whitespace-nowrap"
                      onClick={() => setFormData({ ...formData, discountPrice: '' })}
                    >
                      Remove Offer
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="input"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Items / Unit *
                  </label>
                  <input
                    type="number"
                    value={formData.itemsPerUnit}
                    onChange={(e) => setFormData({ ...formData, itemsPerUnit: e.target.value })}
                    className="input"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.isActive.toString()}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                    className="input"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
            </form>
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="btn-primary"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : editingProduct ? 'Update Product' : 'Create Product'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;

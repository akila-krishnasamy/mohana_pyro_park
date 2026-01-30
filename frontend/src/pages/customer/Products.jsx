import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { productsAPI, categoriesAPI } from '../../services/api';
import ProductCard from '../../components/customer/ProductCard';
import { PageLoader, ErrorMessage, EmptyState } from '../../components/common';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    safetyType: searchParams.get('safetyType') || '',
    inStock: searchParams.get('inStock') || '',
    sortBy: searchParams.get('sortBy') || 'name',
    sortOrder: searchParams.get('sortOrder') || 'asc',
  });

  const [page, setPage] = useState(1);

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll(),
    select: (res) => res.categories,
  });

  // Fetch products
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['products', filters, page],
    queryFn: () => productsAPI.getAll({ ...filters, page, limit: 16 }),
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      safetyType: '',
      inStock: '',
      sortBy: 'name',
      sortOrder: 'asc',
    });
    setPage(1);
  };

  const hasActiveFilters = filters.category || filters.minPrice || filters.maxPrice || 
    filters.safetyType || filters.inStock;

  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorMessage message="Failed to load products" onRetry={refetch} />;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Products</h1>
        <p className="text-gray-500">Explore our wide range of premium quality crackers</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search products..."
            className="input-field pl-10"
          />
        </div>

        {/* Sort */}
        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-');
            setFilters(prev => ({ ...prev, sortBy, sortOrder }));
          }}
          className="input-field w-full md:w-48"
        >
          <option value="name-asc">Name: A to Z</option>
          <option value="name-desc">Name: Z to A</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="totalSold-desc">Best Selling</option>
        </select>

        {/* Filter Toggle (Mobile) */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden btn-secondary flex items-center justify-center gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
          )}
        </button>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <aside className={`
          fixed inset-0 z-50 bg-white md:static md:block md:w-64 md:flex-shrink-0
          transform transition-transform duration-300
          ${showFilters ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b md:hidden">
            <h2 className="font-semibold">Filters</h2>
            <button onClick={() => setShowFilters(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 md:p-0 space-y-6 overflow-y-auto max-h-[calc(100vh-60px)] md:max-h-none">
            {/* Category Filter */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={!filters.category}
                    onChange={() => handleFilterChange('category', '')}
                    className="text-primary-500"
                  />
                  <span className="text-gray-700">All Categories</span>
                </label>
                {categories?.map((cat) => (
                  <label key={cat._id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={filters.category === cat._id}
                      onChange={() => handleFilterChange('category', cat._id)}
                      className="text-primary-500"
                    />
                    <span className="text-gray-700">{cat.name}</span>
                    <span className="text-xs text-gray-400">({cat.productCount})</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="input-field w-full"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="input-field w-full"
                />
              </div>
            </div>

            {/* Safety Type */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Safety Level</h3>
              <div className="space-y-2">
                {[
                  { value: '', label: 'All' },
                  { value: 'safe', label: 'Safe for Kids' },
                  { value: 'moderate', label: 'Moderate' },
                  { value: 'high-noise', label: 'High Noise' },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="safetyType"
                      checked={filters.safetyType === option.value}
                      onChange={() => handleFilterChange('safetyType', option.value)}
                      className="text-primary-500"
                    />
                    <span className="text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* In Stock */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.inStock === 'true'}
                  onChange={(e) => handleFilterChange('inStock', e.target.checked ? 'true' : '')}
                  className="rounded text-primary-500"
                />
                <span className="text-gray-700">In Stock Only</span>
              </label>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full btn-ghost text-red-600 hover:bg-red-50"
              >
                Clear All Filters
              </button>
            )}

            {/* Mobile Apply Button */}
            <button
              onClick={() => setShowFilters(false)}
              className="w-full btn-primary md:hidden"
            >
              Apply Filters
            </button>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Results Count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-500">
              Showing {data?.products?.length || 0} of {data?.total || 0} products
            </p>
          </div>

          {data?.products?.length > 0 ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {data.products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {data.pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-ghost disabled:opacity-50"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, data.pages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium ${
                          page === pageNum 
                            ? 'bg-primary-500 text-white' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setPage(p => Math.min(data.pages, p + 1))}
                    disabled={page === data.pages}
                    className="btn-ghost disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              title="No products found"
              description="Try adjusting your filters or search terms"
              action={
                hasActiveFilters && (
                  <button onClick={clearFilters} className="btn-primary">
                    Clear Filters
                  </button>
                )
              }
            />
          )}
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {showFilters && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setShowFilters(false)}
        />
      )}
    </div>
  );
};

export default Products;

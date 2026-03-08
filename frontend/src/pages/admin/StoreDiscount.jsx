import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Percent } from 'lucide-react';
import { productsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const StoreDiscount = () => {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];
  const after30Days = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    discountPercent: '10',
    startDate: today,
    endDate: after30Days
  });

  const discountMutation = useMutation({
    mutationFn: productsAPI.applyStoreDiscount,
    onSuccess: (data) => {
      toast.success(data.message || 'Store discount applied');
      queryClient.invalidateQueries(['adminProducts']);
      queryClient.invalidateQueries(['products']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to apply store discount');
    }
  });

  const removeDiscountMutation = useMutation({
    mutationFn: productsAPI.removeStoreDiscount,
    onSuccess: (data) => {
      toast.success(data.message || 'Store-wide offer removed');
      queryClient.invalidateQueries(['adminProducts']);
      queryClient.invalidateQueries(['products']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to remove store-wide offer');
    }
  });

  const handleApply = (e) => {
    e.preventDefault();

    const percent = Number(formData.discountPercent);
    const startDate = formData.startDate;
    const endDate = formData.endDate;

    if (!Number.isFinite(percent) || percent < 0 || percent >= 100) {
      toast.error('Enter a valid discount percentage between 0 and 99');
      return;
    }

    if (!startDate || !endDate) {
      toast.error('Select both from and to dates');
      return;
    }

    const todayDate = new Date(today);
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (startDateObj < todayDate || endDateObj < todayDate) {
      toast.error('Please select only current or future dates');
      return;
    }

    if (endDateObj < startDateObj) {
      toast.error('To date must be after or equal to from date');
      return;
    }

    discountMutation.mutate({
      discountPercent: percent,
      startDate,
      endDate
    });
  };

  const handleRemoveOffer = () => {
    const shouldRemove = window.confirm('Remove store-wide offer and show original prices?');
    if (!shouldRemove) return;
    removeDiscountMutation.mutate();
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-2">
          <Percent className="w-6 h-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Store-wide Discount</h1>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Apply same discount percentage to all active products between selected dates.
        </p>

        <form onSubmit={handleApply} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage (%) *</label>
            <input
              type="number"
              min="0"
              max="99"
              className="input"
              value={formData.discountPercent}
              onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
              placeholder="10"
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date *</label>
              <input
                type="date"
                className="input"
                value={formData.startDate}
                min={today}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date *</label>
              <input
                type="date"
                className="input"
                value={formData.endDate}
                min={formData.startDate || today}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={discountMutation.isPending}>
            {discountMutation.isPending ? 'Applying...' : 'Apply Discount To All Products'}
          </button>
        </form>
      </div>

      <div className="card p-6 border border-red-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Remove Offer</h2>
        <p className="text-sm text-gray-500 mb-4">
          This will clear all product discounts and show original prices.
        </p>
        <button
          type="button"
          className="btn-secondary w-full"
          onClick={handleRemoveOffer}
          disabled={removeDiscountMutation.isPending}
        >
          {removeDiscountMutation.isPending ? 'Removing...' : 'Remove Offer'}
        </button>
      </div>
    </div>
  );
};

export default StoreDiscount;

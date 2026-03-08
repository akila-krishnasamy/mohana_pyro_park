import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (!(config.data instanceof FormData) && !config.headers?.['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data).then(res => res.data),
  register: (data) => api.post('/auth/register', data).then(res => res.data),
  getMe: () => api.get('/auth/me').then(res => res.data),
  updateProfile: (data) => api.put('/auth/profile', data).then(res => res.data),
  changePassword: (data) => api.put('/auth/password', data).then(res => res.data),
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }).then(res => res.data),
  getOne: (id) => api.get(`/products/${id}`).then(res => res.data),
  getFeatured: () => api.get('/products/featured').then(res => res.data),
  getByCategory: (categoryId, params) => api.get(`/products/category/${categoryId}`, { params }).then(res => res.data),
  create: (data) => api.post('/products', data).then(res => res.data),
  createWithImage: (formData) => api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data),
  update: (id, data) => api.put(`/products/${id}`, data).then(res => res.data),
  delete: (id) => api.delete(`/products/${id}`).then(res => res.data),
  applyStoreDiscount: (data) => api.put('/products/admin/store-discount', data).then(res => res.data),
  removeStoreDiscount: () => api.put('/products/admin/store-discount/remove').then(res => res.data),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories').then(res => res.data),
  getOne: (id) => api.get(`/categories/${id}`).then(res => res.data),
  create: (data) => api.post('/categories', data).then(res => res.data),
  update: (id, data) => api.put(`/categories/${id}`, data).then(res => res.data),
  delete: (id) => api.delete(`/categories/${id}`).then(res => res.data),
};

// Orders API
export const ordersAPI = {
  create: (data) => api.post('/orders', data).then(res => res.data),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }).then(res => res.data),
  getById: (id) => api.get(`/orders/${id}`).then(res => res.data),
  getAll: (params) => api.get('/orders', { params }).then(res => res.data),
  updateStatus: (id, status, cancellationReason) => api.put(`/orders/${id}/status`, { status, cancellationReason }).then(res => res.data),
  updateTracking: (id, field, checked) => api.put(`/orders/${id}/tracking`, { field, checked }).then(res => res.data),
  uncancel: (id) => api.put(`/orders/${id}/uncancel`).then(res => res.data),
  cancel: (id) => api.put(`/orders/${id}/cancel`).then(res => res.data),
};

// Inventory API
export const inventoryAPI = {
  getLogs: (params) => api.get('/inventory/logs', { params }).then(res => res.data),
  adjust: (productId, data) => api.post(`/inventory/${productId}/adjust`, data).then(res => res.data),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard').then(res => res.data),
  getSales: (params) => api.get('/analytics/sales', { params }).then(res => res.data),
  getSalesDetailed: (params) => api.get('/analytics/sales-detailed', { params }).then(res => res.data),
  getRevenue: (params) => api.get('/analytics/revenue', { params }).then(res => res.data),
  getInventory: () => api.get('/analytics/inventory').then(res => res.data),
  getCustomers: (params) => api.get('/analytics/customers', { params }).then(res => res.data),
  getTopProducts: (params) => api.get('/analytics/top-products', { params }).then(res => res.data),
  getFestival: () => api.get('/analytics/festival').then(res => res.data),
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }).then(res => res.data),
  getOne: (id) => api.get(`/users/${id}`).then(res => res.data),
  create: (data) => api.post('/users', data).then(res => res.data),
  update: (id, data) => api.put(`/users/${id}`, data).then(res => res.data),
  delete: (id) => api.delete(`/users/${id}`).then(res => res.data),
};

export default api;

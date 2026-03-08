import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Customer Pages
import Home from './pages/customer/Home';
import Products from './pages/customer/Products';
import ProductDetail from './pages/customer/ProductDetail';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import MyOrders from './pages/customer/MyOrders';
import OrderDetail from './pages/customer/OrderDetail';
import Profile from './pages/customer/Profile';
import QuickPurchase from './pages/customer/QuickPurchase';
import PaymentMethods from './pages/customer/PaymentMethods';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import AdminOrderDetail from './pages/admin/OrderDetail';
import Inventory from './pages/admin/Inventory';
import Stock from './pages/admin/Stock';
import AdminProducts from './pages/admin/Products';
import NewArrival from './pages/admin/NewArrival';
import StoreDiscount from './pages/admin/StoreDiscount';
import Analytics from './pages/admin/Analytics';
import Users from './pages/admin/Users';

// Protected Route Components
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Route that only allows customers or unauthenticated users (for cart/checkout)
const CustomerOnlyRoute = ({ children, requireAuth = false }) => {
  const { isAuthenticated, user } = useAuthStore();

  // If auth required and not logged in, redirect to login
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If logged in but not a customer, redirect to admin
  if (isAuthenticated && ['staff', 'manager', 'owner'].includes(user?.role)) {
    // Staff goes to orders, managers/owners go to dashboard
    const adminPath = user?.role === 'staff' ? '/admin/orders' : '/admin';
    return <Navigate to={adminPath} replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    // Redirect to appropriate dashboard based on role
    if (['staff', 'manager', 'owner'].includes(user?.role)) {
      const adminPath = user?.role === 'staff' ? '/admin/orders' : '/admin';
      return <Navigate to={adminPath} replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />

      {/* Customer Routes */}
      <Route path="/" element={<CustomerLayout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="payment-methods" element={<PaymentMethods />} />
        <Route path="quick-purchase" element={
          <CustomerOnlyRoute>
            <QuickPurchase />
          </CustomerOnlyRoute>
        } />
        <Route path="cart" element={
          <CustomerOnlyRoute>
            <Cart />
          </CustomerOnlyRoute>
        } />
        <Route path="checkout" element={
          <CustomerOnlyRoute requireAuth={true}>
            <Checkout />
          </CustomerOnlyRoute>
        } />
        <Route path="orders" element={
          <CustomerOnlyRoute requireAuth={true}>
            <MyOrders />
          </CustomerOnlyRoute>
        } />
        <Route path="orders/:id" element={
          <CustomerOnlyRoute requireAuth={true}>
            <OrderDetail />
          </CustomerOnlyRoute>
        } />
        <Route path="profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['staff', 'manager', 'owner']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={
          <ProtectedRoute allowedRoles={['manager', 'owner']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetail />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="stock" element={<Stock />} />
        <Route path="products" element={
          <ProtectedRoute allowedRoles={['manager', 'owner']}>
            <AdminProducts />
          </ProtectedRoute>
        } />
        <Route path="new-arrival" element={
          <ProtectedRoute allowedRoles={['manager', 'owner']}>
            <NewArrival />
          </ProtectedRoute>
        } />
        <Route path="store-discount" element={
          <ProtectedRoute allowedRoles={['manager', 'owner']}>
            <StoreDiscount />
          </ProtectedRoute>
        } />
        <Route path="analytics" element={
          <ProtectedRoute allowedRoles={['owner']}>
            <Analytics />
          </ProtectedRoute>
        } />
        <Route path="users" element={
          <ProtectedRoute allowedRoles={['manager', 'owner']}>
            <Users />
          </ProtectedRoute>
        } />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

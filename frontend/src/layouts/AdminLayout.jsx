import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Plus,
  Percent,
  MessageCircle,
  ShoppingCart,
  BarChart3,
  Users,
  Boxes,
  ClipboardList,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Store
} from 'lucide-react';
import { Logo } from '../components/common';
import { useAuthStore } from '../store';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isManager, isOwner } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, roles: ['manager', 'owner'] },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart, roles: ['staff', 'manager', 'owner'] },
    { name: 'Inventory', path: '/admin/inventory', icon: Boxes, roles: ['staff', 'manager', 'owner'] },
    { name: 'Stock', path: '/admin/stock', icon: ClipboardList, roles: ['staff', 'manager', 'owner'] },
    { name: 'Products', path: '/admin/products', icon: Package, roles: ['manager', 'owner'] },
    { name: 'New Arrival', path: '/admin/new-arrival', icon: Plus, roles: ['manager', 'owner'] },
    { name: 'Store Discount', path: '/admin/store-discount', icon: Percent, roles: ['manager', 'owner'] },
    { name: 'Campaigns', path: '/admin/campaigns', icon: MessageCircle, roles: ['manager', 'owner'] },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3, roles: ['owner'] },
    { name: 'Users', path: '/admin/users', icon: Users, roles: ['manager', 'owner'] },
  ];

  const filteredNav = navigation.filter(item => item.roles.includes(user?.role));

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Logo size="small" />
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-gray-600 hover:text-gray-900"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50
        transform transition-transform duration-300
        lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <Logo size="small" />
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredNav.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all
                  ${isActive(item.path)
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-primary'
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200">
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg mb-2"
            >
              <Store className="w-5 h-5" />
              View Store
            </Link>
            
            <div className="flex items-center gap-3 px-3 py-2.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg mt-2"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

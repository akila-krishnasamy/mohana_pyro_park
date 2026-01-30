import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Auth Store
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true });
        localStorage.setItem('token', token);
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('auth-storage');
      },

      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } });
      },

      // Role checks
      isCustomer: () => get().user?.role === 'customer',
      isStaff: () => ['staff', 'manager', 'owner'].includes(get().user?.role),
      isManager: () => ['manager', 'owner'].includes(get().user?.role),
      isOwner: () => get().user?.role === 'owner',
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// Cart Store
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existingIndex = items.findIndex(item => item.product._id === product._id);
        
        if (existingIndex >= 0) {
          const newItems = [...items];
          newItems[existingIndex].quantity += quantity;
          set({ items: newItems });
        } else {
          set({ items: [...items, { product, quantity }] });
        }
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        const items = get().items.map(item =>
          item.product._id === productId ? { ...item, quantity } : item
        );
        set({ items });
      },

      removeItem: (productId) => {
        set({ items: get().items.filter(item => item.product._id !== productId) });
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.product.discountPrice || item.product.price;
          return total + (price * item.quantity);
        }, 0);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

// UI Store (for modals, sidebars, etc.)
export const useUIStore = create((set) => ({
  isSidebarOpen: false,
  isCartOpen: false,
  isMobileMenuOpen: false,

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  
  closeSidebar: () => set({ isSidebarOpen: false }),
  closeCart: () => set({ isCartOpen: false }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
}));

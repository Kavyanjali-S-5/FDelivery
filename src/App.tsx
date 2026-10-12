import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { Services } from './components/Services.tsx';
import { About } from './components/About.tsx';
import { MenuSection } from './components/MenuSection.tsx';
import { FoodDetailModal } from './components/FoodDetailModal.tsx';
import { Testimonials } from './components/Testimonials.tsx';
import { AppDownload } from './components/AppDownload.tsx';
import { Footer } from './components/Footer.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutView } from './components/CheckoutView.tsx';
import { OrderTrackingView } from './components/OrderTrackingView.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { ProfileModal } from './components/ProfileModal.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';

import { api, authState, FoodItem, Category, UserProfile, Order } from './api.ts';
import { CartItem, ActiveView, ToastNotification } from './types.ts';

export default function App() {
  // Navigation & Views
  const [activeView, setActiveView] = useState<ActiveView>('storefront');
  const [trackingOrderId, setTrackingOrderId] = useState<string>('');

  // Authentication
  const [user, setUser] = useState<UserProfile | null>(authState.getUser());

  // Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Product');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoadingMenu, setIsLoadingMenu] = useState<boolean>(true);

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('fdelivery_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItem | null>(null);

  // Notifications
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = 'toast-' + Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('fdelivery_cart', JSON.stringify(cart));
  }, [cart]);

  // Load menu & categories from backend
  const loadMenuData = async () => {
    setIsLoadingMenu(true);
    try {
      const [catsRes, itemsRes] = await Promise.all([
        api.getCategories(),
        api.getFoodItems(),
      ]);
      setCategories(catsRes.categories || []);
      setFoodItems(itemsRes.items || []);
    } catch (err: any) {
      console.error('Failed to load menu data:', err);
      addToast('Error loading menu from server. Please refresh.', 'error');
    } finally {
      setIsLoadingMenu(false);
    }
  };

  useEffect(() => {
    loadMenuData();

    // Verify user session
    if (authState.getToken()) {
      api.getMe()
        .then((res) => setUser(res.user))
        .catch(() => {
          authState.clearSession();
          setUser(null);
        });
    }
  }, []);

  // Filtered food items based on category and search
  const filteredFoodItems = foodItems.filter((item) => {
    if (!item.is_available) return false;

    // Category match
    if (selectedCategory !== 'All Product' && selectedCategory !== 'All') {
      const cat = categories.find((c) => c.name.toLowerCase() === selectedCategory.toLowerCase());
      if (cat && item.category_id !== cat.id) return false;
    }

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }

    return true;
  });

  // Cart actions
  const handleAddToCart = (foodItem: FoodItem, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.foodItem.id === foodItem.id);
      if (existing) {
        return prev.map((item) =>
          item.foodItem.id === foodItem.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { foodItem, quantity }];
    });
    addToast(`Added "${foodItem.name}" to cart!`, 'success');
  };

  const handleUpdateCartQuantity = (foodId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.foodItem.id === foodId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveFromCart = (foodId: string) => {
    setCart((prev) => prev.filter((item) => item.foodItem.id !== foodId));
    addToast('Item removed from cart', 'info');
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Auth actions
  const handleAuthSuccess = (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
    addToast(`Welcome back, ${authenticatedUser.full_name}!`, 'success');
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setIsProfileOpen(false);
    if (activeView === 'admin') {
      setActiveView('storefront');
    }
    addToast('Signed out successfully.', 'info');
  };

  // Navigation handlers
  const handleNavigate = (view: ActiveView) => {
    if (view === 'admin' && user?.role !== 'admin') {
      setIsAuthOpen(true);
      addToast('Please sign in with an Administrator account to view Admin Panel.', 'info');
      return;
    }
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderPlaced = (order: Order) => {
    setTrackingOrderId(order.order_number);
    addToast(`Order #${order.order_number} confirmed!`, 'success');
  };

  const handleTrackOrderFromProfile = (orderNumber: string) => {
    setTrackingOrderId(orderNumber);
    setActiveView('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app-root">
      {/* Toast Notifications Overlay */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: 500,
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor:
                toast.type === 'error'
                  ? '#ef4444'
                  : toast.type === 'info'
                  ? '#3b82f6'
                  : '#10b981',
              pointerEvents: 'auto',
              animation: 'slideUp 0.25s ease',
            }}
          >
            <i
              className={`bx ${
                toast.type === 'error'
                  ? 'bx-error'
                  : toast.type === 'info'
                  ? 'bx-info-circle'
                  : 'bx-check-circle'
              }`}
              style={{ fontSize: '1.2rem' }}
            ></i>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Main Views */}
      {activeView === 'admin' ? (
        <AdminDashboard
          onNavigate={handleNavigate}
          categories={categories}
          foodItems={foodItems}
          onRefreshData={loadMenuData}
        />
      ) : (
        <>
          {/* Header & Navbar */}
          <Navbar
            cartCount={cartTotalItems}
            user={user}
            activeView={activeView}
            onOpenCart={() => setIsCartOpen(true)}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
            onNavigate={handleNavigate}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchSubmit={(e) => {
              e.preventDefault();
              if (activeView !== 'storefront') {
                setActiveView('storefront');
              }
              const recipesEl = document.getElementById('recipes');
              recipesEl?.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* View switcher */}
          {activeView === 'checkout' ? (
            <CheckoutView
              cart={cart}
              user={user}
              onOrderPlaced={handleOrderPlaced}
              onNavigate={handleNavigate}
              onClearCart={handleClearCart}
            />
          ) : activeView === 'tracking' ? (
            <OrderTrackingView
              initialOrderId={trackingOrderId}
              user={user}
              onNavigate={handleNavigate}
            />
          ) : (
            /* Storefront landing page */
            <main>
              <Hero
                onExploreClick={() => {
                  const recipesEl = document.getElementById('recipes');
                  recipesEl?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
              <Services />
              <About />
              <MenuSection
                categories={categories}
                items={filteredFoodItems}
                selectedCategory={selectedCategory}
                onSelectCategory={(catName) => setSelectedCategory(catName)}
                onAddToCart={(item) => handleAddToCart(item)}
                onSelectItem={(item) => setSelectedFoodItem(item)}
                searchQuery={searchQuery}
                onClearSearch={() => setSearchQuery('')}
                isLoading={isLoadingMenu}
              />
              <Testimonials />
              <AppDownload />
            </main>
          )}

          {/* Footer */}
          <Footer onNavigate={handleNavigate} />
        </>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={() => handleNavigate('checkout')}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* User Profile & Past Orders Modal */}
      {user && (
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={user}
          onUpdateUser={(updated) => setUser(updated)}
          onLogout={handleLogout}
          onTrackOrder={handleTrackOrderFromProfile}
          onNavigate={handleNavigate}
        />
      )}

      {/* Food Details Modal */}
      <FoodDetailModal
        item={selectedFoodItem}
        onClose={() => setSelectedFoodItem(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}

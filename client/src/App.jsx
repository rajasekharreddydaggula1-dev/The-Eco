import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import AuthPage from './pages/AuthPage';
import StorefrontHome from './pages/StorefrontHome';
import ProductDetails from './pages/ProductDetails';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import VendorDashboard from './pages/VendorDashboard';
import CheckoutSuccess from './pages/CheckoutSuccess';
import { getProfile } from './store/slices/authSlice';

function AppContent() {
  const dispatch = useDispatch();
  const location = useLocation();

  const { currentStore } = useSelector(state => state.stores);
  const cartCarts = useSelector(state => state.cart.carts);

  const [cartOpen, setCartOpen] = useState(false);

  // Sync token and get user profile on mount
  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  // Determine cart items and count for active store tenant
  const activeStoreId = currentStore?._id;
  const activeCart = activeStoreId ? (cartCarts[activeStoreId] || []) : [];
  const cartCount = activeCart.reduce((sum, item) => sum + item.quantity, 0);

  // Suppress default navbar on Auth and Dashboards
  const showNavbar = !['/auth', '/dashboard', '/admin'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {showNavbar && (
        <Navbar 
          onCartClick={() => setCartOpen(true)} 
          cartCount={cartCount} 
        />
      )}

      <main className="flex-1">
        <Routes>
          {/* Marketplace Directory */}
          <Route path="/" element={<StorefrontHome />} />

          {/* Tenant Storefront */}
          <Route path="/store/:storeSlug" element={<StorefrontHome onCartClick={() => setCartOpen(true)} cartCount={cartCount} />} />
          <Route path="/store/:storeSlug/products/:productId" element={<ProductDetails />} />

          {/* Unified Authentication */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Role-Based Portals */}
          <Route path="/dashboard" element={<VendorDashboard />} />
          <Route path="/admin" element={<SuperAdminDashboard />} />

          {/* Stripe / Mock Callbacks */}
          <Route path="/checkout-success" element={<CheckoutSuccess />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Slide-out Tenant Cart Drawer */}
      {activeStoreId && (
        <CartDrawer
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          storeId={activeStoreId}
        />
      )}

      {/* Shared Platform Footer */}
      {showNavbar && (
        <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-600">
          <p>© {new Date().getFullYear()} The Eco Multi-Tenant E-Commerce SaaS. All Rights Reserved.</p>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import BottomNavbar from './components/BottomNavbar';
import CartDrawer from './components/CartDrawer';
import WalletModal from './components/WalletModal';
import VoiceAssistant from './components/VoiceAssistant';
import CameraVisualSearch from './components/CameraVisualSearch';
import AuthPage from './pages/AuthPage';
import StorefrontHome from './pages/StorefrontHome';
import ProductDetails from './pages/ProductDetails';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import VendorDashboard from './pages/VendorDashboard';
import CheckoutSuccess from './pages/CheckoutSuccess';
import ProfilePage from './pages/ProfilePage';
import { getProfile } from './store/slices/authSlice';

function AppContent() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { currentStore } = useSelector(state => state.stores);
  const cartCarts = useSelector(state => state.cart.carts);
  const { user, loading } = useSelector(state => state.auth);

  const [cartOpen, setCartOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  // Sync token and get user profile on mount
  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  // Redirect to /auth if user is not logged in and not on /auth page
  useEffect(() => {
    const token = localStorage.getItem('eco_token');
    if (!token && !user && location.pathname !== '/auth') {
      navigate('/auth');
    } else if (token && !user && !loading && location.pathname !== '/auth') {
      navigate('/auth');
    }
  }, [user, loading, location.pathname, navigate]);

  // Determine cart items and count globally across all stores
  const activeStoreId = currentStore?._id;
  const cartCount = Object.keys(cartCarts).reduce((sum, sId) => {
    const cart = cartCarts[sId] || [];
    return sum + cart.reduce((s, item) => s + item.quantity, 0);
  }, 0);

  // Suppress default navbar on Auth and Dashboards, or if user is not logged in
  const showNavbar = user && !['/auth', '/dashboard', '/admin'].includes(location.pathname);

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleYouClick = () => {
    navigate('/auth');
  };

  const handleVoiceSearch = (term) => {
    setSearchParams({ search: term });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {showNavbar && (
        <Navbar 
          onCartClick={() => setCartOpen(true)} 
          onWalletClick={() => {
            if (!user) navigate('/auth');
            else setWalletOpen(true);
          }}
          onVoiceClick={() => setVoiceOpen(true)}
          onCameraClick={() => setCameraOpen(true)}
          cartCount={cartCount} 
        />
      )}

      <main className={`flex-1 ${showNavbar ? 'pt-16 md:pt-0' : ''}`}>
        <Routes>
          {/* Marketplace Directory */}
          <Route path="/" element={<StorefrontHome />} />

          {/* Tenant Storefront */}
          <Route path="/store/:storeSlug" element={<StorefrontHome onCartClick={() => setCartOpen(true)} cartCount={cartCount} />} />
          <Route path="/store/:storeSlug/products/:productId" element={<ProductDetails />} />

          {/* Unified Authentication */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Customer Profile & Orders Page */}
          <Route path="/profile" element={<ProfilePage />} />

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
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        storeId={activeStoreId}
      />

      {/* Wallet Portal Modal */}
      <WalletModal
        isOpen={walletOpen}
        onClose={() => setWalletOpen(false)}
      />

      {/* Voice Assistant Modal */}
      <VoiceAssistant
        isOpen={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onSearch={handleVoiceSearch}
        onCartOpen={() => setCartOpen(true)}
        onWalletOpen={() => {
          if (!user) navigate('/auth');
          else setWalletOpen(true);
        }}
      />

      {/* Camera Search Modal */}
      <CameraVisualSearch
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
      />

      {/* Bottom Navigation for Mobile Screens */}
      {showNavbar && (
        <BottomNavbar
          onCartClick={() => setCartOpen(true)}
          onWalletClick={() => {
            if (!user) navigate('/auth');
            else setWalletOpen(true);
          }}
          onMenuClick={() => setVoiceOpen(true)}
          onYouClick={handleYouClick}
          onHomeClick={handleHomeClick}
          cartCount={cartCount}
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

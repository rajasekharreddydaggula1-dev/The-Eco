import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ShoppingBag, LogOut, User as UserIcon, Settings, BarChart2, Shield } from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import Logo from './Logo';

export default function Navbar({ onCartClick, cartCount = 0 }) {
  const { user } = useSelector(state => state.auth);
  const { currentStore } = useSelector(state => state.stores);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { storeSlug } = useParams();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth');
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Brand Name */}
          <div className="flex items-center">
            {storeSlug && currentStore ? (
              <Link to={`/store/${storeSlug}`} className="flex items-center gap-3">
                {currentStore.logo ? (
                  <img src={currentStore.logo} alt={currentStore.name} className="h-8 w-8 rounded-full object-cover border border-slate-700" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-eco-500 font-bold text-white">
                    {currentStore.name[0]}
                  </div>
                )}
                <span className="text-xl font-bold font-display tracking-tight text-white hover:text-eco-400 transition-colors">
                  {currentStore.name}
                </span>
              </Link>
            ) : (
              <Link to="/" className="flex items-center gap-2">
                <Logo className="h-8 w-8" />
                <span className="text-xl font-bold font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-eco-400">
                  The Eco
                </span>
              </Link>
            )}
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-4">
            {/* Storefront Home link if we are in a store */}
            {storeSlug && (
              <Link to="/" className="hidden sm:inline-block text-sm text-slate-400 hover:text-white transition-colors">
                All Stores
              </Link>
            )}

            {/* Cart Icon (only visible when in store tenant view) */}
            {storeSlug && currentStore && (
              <button
                onClick={onCartClick}
                className="relative p-2 text-slate-400 hover:text-eco-400 transition-colors"
                aria-label="Open Cart"
              >
                <ShoppingBag className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-eco-500 text-[10px] font-bold text-white ring-2 ring-slate-950">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Dashboard Redirect Shortcuts based on Role */}
            {user && (
              <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
                {user.role === 'Super Admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 rounded-lg bg-brand-900/40 border border-brand-500/20 px-3 py-1.5 text-xs font-semibold text-brand-300 hover:bg-brand-900/70 transition-all"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    Admin
                  </Link>
                )}
                {user.role === 'Vendor' && (
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-1.5 rounded-lg bg-eco-900/40 border border-eco-500/20 px-3 py-1.5 text-xs font-semibold text-eco-300 hover:bg-eco-900/70 transition-all"
                  >
                    <BarChart2 className="h-3.5 w-3.5" />
                    Dashboard
                  </Link>
                )}

                <div className="hidden md:flex flex-col text-right pl-2">
                  <span className="text-xs font-medium text-slate-200">{user.name}</span>
                  <span className="text-[10px] text-slate-500">{user.role}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="rounded-lg p-2 text-slate-400 hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}

            {!user && (
              <Link
                to="/auth"
                className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 shadow-lg shadow-brand-600/20 transition-all active:scale-95"
              >
                <UserIcon className="h-4 w-4" />
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

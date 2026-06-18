import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { ShoppingBag, LogOut, User as UserIcon, Search, MapPin, Mic, Camera, Wallet, ArrowLeft } from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import Logo from './Logo';

export default function Navbar({ 
  onCartClick, 
  onWalletClick, 
  onVoiceClick, 
  onCameraClick, 
  cartCount = 0 
}) {
  const { user } = useSelector(state => state.auth);
  const { currentStore } = useSelector(state => state.stores);
  const cartCarts = useSelector(state => state.cart.carts);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { storeSlug } = useParams();

  // Search local state
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [pincode, setPincode] = useState('110001');

  // Sync url search term
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchTerm(params.get('search') || '');
  }, [location.search]);

  // Compute total global cart items (sum of items across all stores)
  const globalCartCount = Object.keys(cartCarts).reduce((sum, sId) => {
    const cart = cartCarts[sId] || [];
    return sum + cart.reduce((s, item) => s + item.quantity, 0);
  }, 0);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (storeSlug) {
      navigate(`/store/${storeSlug}?search=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate(`/?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth');
  };

  const changePincode = () => {
    const newPin = prompt("Enter Pincode for delivery location:", pincode);
    if (newPin && newPin.trim().length === 6) {
      setPincode(newPin.trim());
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-900 bg-slate-950/95 shadow-xl backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Left Block: Back Button, Brand Logo & Store details */}
          <div className="flex items-center gap-3.5 flex-shrink-0">
            {/* Back Button - Conditionally displayed on all inner paths */}
            {location.pathname !== '/' && (
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold text-xs"
                title="Go Back"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-amber-500" />
                <span>Back</span>
              </button>
            )}

            {/* Logo */}
            {storeSlug && currentStore ? (
              <Link to={`/store/${storeSlug}`} className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
                {currentStore.logo ? (
                  <img src={currentStore.logo} alt={currentStore.name} className="h-8 w-8 rounded-lg object-cover border border-slate-800" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-eco-600 font-bold text-white shadow-md">
                    {currentStore.name[0]}
                  </div>
                )}
                <span className="text-sm font-bold text-white hidden sm:inline-block max-w-[110px] truncate">
                  {currentStore.name}
                </span>
              </Link>
            ) : (
              <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                <Logo className="h-8 w-8" />
                <span className="text-lg font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-eco-400">
                  The Eco
                </span>
              </Link>
            )}

            {/* Pincode Location Selector */}
            {user && user.role === 'Customer' && (
              <button 
                onClick={changePincode}
                className="hidden lg:flex items-center gap-1.5 text-left border border-transparent hover:border-slate-800 px-2 py-1 rounded transition-colors cursor-pointer"
                title="Change Pincode Location"
              >
                <MapPin className="h-4 w-4 text-amber-500" />
                <div className="text-[10px] leading-tight">
                  <p className="text-[9px] text-slate-500 font-bold uppercase">Deliver to {user.name.split(' ')[0]}</p>
                  <p className="font-extrabold text-slate-200">Delhi {pincode}</p>
                </div>
              </button>
            )}
          </div>

          {/* Centered Amazon/Flipkart Search Bar */}
          <form 
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-lg md:max-w-xl relative flex items-center bg-slate-900 border border-slate-800 rounded-lg overflow-hidden focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all"
          >
            {/* Category selection */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-slate-900 border-r border-slate-800 px-2.5 py-2 text-[10px] font-bold text-slate-300 focus:outline-none hidden sm:block max-w-[85px] cursor-pointer"
            >
              <option value="">All</option>
              <option value="Footwear">Shoes</option>
              <option value="Apparel">Clothing</option>
              <option value="Produce">Organic</option>
              <option value="Electronics">Tech</option>
            </select>

            {/* Main search text input */}
            <input
              type="text"
              placeholder="Search in The Eco..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />

            {/* Voice Mic Icon */}
            <button
              type="button"
              onClick={onVoiceClick}
              className="p-2 text-slate-400 hover:text-amber-500 transition-colors"
              title="Voice Assistant"
            >
              <Mic className="h-4 w-4 text-amber-500 animate-pulse" />
            </button>

            {/* Camera visual search icon */}
            <button
              type="button"
              onClick={onCameraClick}
              className="p-2 text-slate-400 hover:text-amber-500 transition-colors"
              title="Camera visual Search"
            >
              <Camera className="h-4 w-4" />
            </button>

            {/* Search Submit button (Amazon-yellow style) */}
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 p-2.5 px-4.5 transition-colors cursor-pointer flex items-center justify-center font-bold"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Right Section Shortcuts */}
          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            {/* Wallet button (Two-line text block) */}
            {user && user.role === 'Customer' && (
              <button
                onClick={onWalletClick}
                className="hidden sm:flex flex-col text-left border border-transparent hover:border-slate-800 px-2.5 py-1 rounded transition-colors cursor-pointer"
                title="Open Wallet Modal"
              >
                <div className="text-[10px] leading-tight">
                  <p className="text-[9px] text-slate-400 font-medium flex items-center gap-1">
                    <Wallet className="h-3 w-3 text-emerald-400" />
                    <span>Wallet Balance</span>
                  </p>
                  <p className="font-extrabold text-emerald-400">
                    {user.walletBalance !== undefined 
                      ? Number(user.walletBalance).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }) 
                      : '₹0'}
                  </p>
                </div>
              </button>
            )}

            {/* Profile/Account Two-line Block */}
            {user ? (
              <Link 
                to={user.role === 'Customer' ? '/profile' : user.role === 'Vendor' ? '/dashboard' : '/admin'}
                className="hidden sm:flex flex-col text-left border border-transparent hover:border-slate-800 px-2.5 py-1 rounded transition-colors"
                title="Go to Dashboard / Orders"
              >
                <div className="text-[10px] leading-tight">
                  <p className="text-[9px] text-slate-400 font-medium">Hello, {user.name.split(' ')[0]}</p>
                  <p className="font-extrabold text-slate-100">Account & Profile</p>
                </div>
              </Link>
            ) : (
              <Link 
                to="/auth"
                className="hidden sm:flex flex-col text-left border border-transparent hover:border-slate-800 px-2.5 py-1 rounded transition-colors"
                title="Login to Account"
              >
                <div className="text-[10px] leading-tight">
                  <p className="text-[9px] text-slate-400 font-medium">Hello, sign in</p>
                  <p className="font-extrabold text-slate-100">Account & Lists</p>
                </div>
              </Link>
            )}

            {/* Your Orders & Tracking (Two-line block) */}
            {user && user.role === 'Customer' && (
              <Link
                to="/profile"
                className="hidden md:flex flex-col text-left border border-transparent hover:border-slate-800 px-2.5 py-1 rounded transition-colors"
                title="Your Order History & Shipment Tracking"
              >
                <div className="text-[10px] leading-tight">
                  <p className="text-[9px] text-slate-400 font-medium">Returns</p>
                  <p className="font-extrabold text-slate-100">& Orders</p>
                </div>
              </Link>
            )}

            {/* Role Admin/Merchant Buttons */}
            {user && user.role === 'Super Admin' && (
              <Link
                to="/admin"
                className="hidden lg:flex flex-col text-left border border-transparent hover:border-slate-800 px-2.5 py-1 rounded transition-colors"
              >
                <div className="text-[10px] leading-tight">
                  <p className="text-[9px] text-amber-500 font-medium">System</p>
                  <p className="font-extrabold text-amber-400">Admin Panel</p>
                </div>
              </Link>
            )}

            {/* Role Vendor Button */}
            {user && user.role === 'Vendor' && (
              <Link
                to="/dashboard"
                className="hidden lg:flex flex-col text-left border border-transparent hover:border-slate-800 px-2.5 py-1 rounded transition-colors"
              >
                <div className="text-[10px] leading-tight">
                  <p className="text-[9px] text-eco-400 font-medium">Merchant</p>
                  <p className="font-extrabold text-eco-300">Dashboard</p>
                </div>
              </Link>
            )}

            {/* Cart Icon widget */}
            <button
              onClick={onCartClick}
              className="flex items-center gap-2 border border-transparent hover:border-slate-800 px-2 py-1 rounded transition-colors relative cursor-pointer"
              aria-label="Open Cart"
            >
              <div className="relative">
                <ShoppingBag className="h-6 w-6 text-slate-200" />
                {globalCartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-slate-950 ring-2 ring-slate-950 shadow-md">
                    {globalCartCount}
                  </span>
                )}
              </div>
              <div className="text-[10px] leading-tight text-left hidden sm:block">
                <p className="text-[9px] text-slate-400 font-medium">Shopping</p>
                <p className="font-extrabold text-slate-100">Cart</p>
              </div>
            </button>

            {/* Logout/Login Trigger button */}
            {user ? (
              <button
                onClick={handleLogout}
                className="rounded-lg p-2 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                title="Logout Account"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            ) : (
              <Link
                to="/auth"
                className="flex sm:hidden items-center gap-1 rounded bg-amber-500 text-slate-950 px-2.5 py-1.5 font-bold text-[10px]"
              >
                <UserIcon className="h-3 w-3" />
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

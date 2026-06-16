import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Sparkles, Building, User, Mail, Lock, AlertCircle, ShoppingBag } from 'lucide-react';
import { loginUser, registerUser, clearAuthError } from '../store/slices/authSlice';
import Logo from '../components/Logo';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('Customer'); // Customer or Vendor for registration
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    storeName: '',
    storeDescription: ''
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, error } = useSelector(state => state.auth);

  // Clear errors on page switch
  useEffect(() => {
    dispatch(clearAuthError());
  }, [isLogin, dispatch]);

  // Handle redirects on success
  useEffect(() => {
    if (user) {
      if (user.role === 'Super Admin') {
        navigate('/admin');
      } else if (user.role === 'Vendor') {
        navigate('/dashboard');
      } else {
        // Customer redirects
        const fromStore = localStorage.getItem('last_visited_store');
        if (fromStore) {
          localStorage.removeItem('last_visited_store');
          navigate(`/store/${fromStore}`);
        } else {
          navigate('/');
        }
      }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      dispatch(loginUser({ email: formData.email, password: formData.password }));
    } else {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role
      };
      if (role === 'Vendor') {
        payload.storeName = formData.storeName;
        payload.storeDescription = formData.storeDescription;
      }
      dispatch(registerUser(payload));
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-animated-gradient px-4 py-12 sm:px-6 lg:px-8">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-brand-600/10 blur-3xl" />
      <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-eco-600/10 blur-3xl" />

      {/* Main Container Card */}
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl glass-panel shadow-2xl md:grid-cols-12">
        {/* Left Side: Brand Showcase */}
        <div className="relative hidden flex-col justify-between p-10 md:col-span-5 md:flex bg-slate-900/40 border-r border-slate-800/50">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <span className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-eco-400">
              The Eco
            </span>
          </div>

          <div className="my-auto space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-300 border border-brand-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              Multi-Tenant E-Commerce
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              One platform.<br />
              Infinite storefronts.
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Launch your store, configure custom aesthetics, set product variants, and accept secure payments. Everything isolated, completely secure.
            </p>
          </div>

          <div className="flex gap-4 text-xs text-slate-500">
            <span>Security Isolated</span>
            <span>•</span>
            <span>Stripe Secured</span>
          </div>
        </div>

        {/* Right Side: Form controls */}
        <div className="flex flex-col justify-center p-8 sm:p-12 md:col-span-7 bg-slate-950/40">
          <div className="w-full max-w-md mx-auto">
            {/* Title / Toggle */}
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                {isLogin ? 'Welcome back to The Eco' : 'Create your account'}
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                {isLogin ? "New to the platform? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                >
                  {isLogin ? 'Sign up here' : 'Log in here'}
                </button>
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-950/20 p-3.5 text-sm text-red-400">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {!isLogin && (
                <>
                  {/* Name field */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Full Name</label>
                    <div className="relative">
                      <User className="absolute top-3 left-3 h-5 w-5 text-slate-500" />
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="glass-input w-full pl-10"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  {/* Role Selector Tabs */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Account Role</label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 border border-slate-800 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setRole('Customer')}
                        className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
                          role === 'Customer'
                            ? 'bg-brand-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <User className="h-3.5 w-3.5" />
                        Buyer / Customer
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('Vendor')}
                        className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
                          role === 'Vendor'
                            ? 'bg-eco-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Building className="h-3.5 w-3.5" />
                        Merchant / Vendor
                      </button>
                    </div>
                  </div>

                  {/* Store Name (Vendor Only) */}
                  {role === 'Vendor' && (
                    <div className="space-y-4 p-4 rounded-lg border border-eco-500/20 bg-eco-950/10">
                      <h4 className="text-xs font-bold text-eco-400 uppercase tracking-wider flex items-center gap-1.5">
                        <ShoppingBag className="h-3.5 w-3.5" />
                        Storefront Setup
                      </h4>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-400">Store Name</label>
                        <div className="relative">
                          <Building className="absolute top-3 left-3 h-5 w-5 text-slate-500" />
                          <input
                            type="text"
                            name="storeName"
                            required={role === 'Vendor'}
                            value={formData.storeName}
                            onChange={handleChange}
                            className="glass-input w-full pl-10"
                            placeholder="e.g. Nike Sportswear"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-400">Store Description</label>
                        <textarea
                          name="storeDescription"
                          value={formData.storeDescription}
                          onChange={handleChange}
                          rows={2}
                          className="glass-input w-full py-2"
                          placeholder="What do you sell?"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Email field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Email Address</label>
                <div className="relative">
                  <Mail className="absolute top-3 left-3 h-5 w-5 text-slate-500" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="glass-input w-full pl-10"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Password</label>
                <div className="relative">
                  <Lock className="absolute top-3 left-3 h-5 w-5 text-slate-500" />
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="glass-input w-full pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 active:scale-98 mt-6 ${
                  isLogin
                    ? 'bg-brand-600 hover:bg-brand-500 focus:ring-brand-500 shadow-brand-600/20'
                    : role === 'Vendor'
                    ? 'bg-eco-600 hover:bg-eco-500 focus:ring-eco-500 shadow-eco-600/20'
                    : 'bg-brand-600 hover:bg-brand-500 focus:ring-brand-500 shadow-brand-600/20'
                }`}
              >
                {loading ? 'Processing request...' : isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

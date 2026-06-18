import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Sparkles, 
  Building, 
  User, 
  Mail, 
  Lock, 
  AlertCircle, 
  ShoppingBag, 
  ArrowRight, 
  CreditCard, 
  Check,
  Eye,
  EyeOff
} from 'lucide-react';
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
  const { user, loading, error } = useSelector(state => state.auth);
  
  const [showPassword, setShowPassword] = useState(false);

  // Clear errors on page/tab switch
  useEffect(() => {
    dispatch(clearAuthError());
  }, [isLogin, role, dispatch]);

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
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-16 sm:px-6 lg:px-8 overflow-hidden select-none">
      
      {/* Dynamic Animated Blobs */}
      <div className="absolute top-[-10%] left-[-10%] h-[50vw] w-[50vw] rounded-full bg-indigo-600/10 blur-[120px] animate-drift-slow pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[60vw] w-[60vw] rounded-full bg-emerald-600/10 blur-[150px] animate-drift-slower pointer-events-none" />

      {/* Main Glassmorphic Wrapper */}
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-900 bg-slate-950/40 backdrop-blur-2xl shadow-2xl md:grid-cols-12 relative z-10">
        
        {/* Left Column: Brand & Feature Highlights */}
        <div className="relative hidden flex-col justify-between p-12 md:col-span-5 md:flex bg-slate-900/10 border-r border-slate-900/50 backdrop-blur-md">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <Logo className="h-9 w-9 text-indigo-400" />
            <span className="text-2xl font-bold tracking-tight text-white">
              The <span className="text-emerald-400">Eco</span>
            </span>
          </div>

          {/* Slogan and details */}
          <div className="my-auto space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
              <Sparkles className="h-4 w-4" />
              SaaS Marketplace
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
                One Platform.<br />
                Beautiful Eco Storefronts.
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect with local green brands or start your own digital storefront. Fully isolated databases, secure Stripe-powered transactions, and customized dashboards.
              </p>
            </div>

            {/* Feature Checkpoints */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Shield className="h-3 w-3" />
                </div>
                <span>Strict Tenant Data Isolation</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CreditCard className="h-3 w-3" />
                </div>
                <span>Stripe Payments in Indian Rupees (INR)</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Sparkles className="h-3 w-3" />
                </div>
                <span>High-Fidelity Dashboard Metrics</span>
              </div>
            </div>
          </div>

          {/* Footer security tag */}
          <div className="flex gap-4 text-[10px] uppercase font-bold tracking-wider text-slate-500">
            <span>ISOLATED SYSTEM</span>
            <span>•</span>
            <span>STRIPE SECURED</span>
          </div>
        </div>

        {/* Right Column: User Auth Actions */}
        <div className="flex flex-col justify-center p-8 sm:p-12 md:col-span-7 bg-slate-950/20">
          <div className="w-full max-w-md mx-auto">
            
            {/* Title / Action Switcher */}
            <div className="text-center md:text-left animate-slide-up">
              <h2 className="text-3xl font-extrabold tracking-tight text-white">
                {isLogin ? 'Sign In' : 'Join The Eco'}
              </h2>
              <p className="mt-2.5 text-xs text-slate-400">
                {isLogin ? "Looking to create a storefront or buyer account? " : "Already have a registered account? "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-4 decoration-indigo-500/40"
                >
                  {isLogin ? 'Sign up here' : 'Log in here'}
                </button>
              </p>
            </div>

            {/* Error Message Box */}
            {error && (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-950/15 p-4 text-xs text-red-400 animate-slide-up">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Main Interactive Form */}
            <form onSubmit={handleSubmit} key={isLogin ? "signin-form" : "signup-form"} className="mt-8 space-y-5 animate-slide-up">
              {!isLogin && (
                <>
                  {/* Full Name field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                    <div className="relative">
                      <User className="absolute top-3 left-3.5 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="glass-input w-full pl-10 text-xs py-3 bg-slate-900/30 border-slate-800/80 focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  {/* Interactive Premium Role Selection Cards */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Customer Card */}
                      <div 
                        onClick={() => setRole('Customer')}
                        className={`cursor-pointer rounded-xl border p-3.5 flex flex-col justify-between transition-all duration-300 ${
                          role === 'Customer'
                            ? 'bg-indigo-600/10 border-indigo-500/60 shadow-md shadow-indigo-600/5 glow-border-brand'
                            : 'bg-slate-900/20 border-slate-850 hover:border-slate-800'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <User className={`h-4.5 w-4.5 ${role === 'Customer' ? 'text-indigo-400' : 'text-slate-500'}`} />
                          {role === 'Customer' && <Check className="h-3.5 w-3.5 text-indigo-400" />}
                        </div>
                        <div className="mt-4">
                          <p className="text-xs font-bold text-white">Buyer</p>
                          <p className="text-[9px] text-slate-500 mt-0.5">Shop organic items</p>
                        </div>
                      </div>

                      {/* Vendor Card */}
                      <div 
                        onClick={() => setRole('Vendor')}
                        className={`cursor-pointer rounded-xl border p-3.5 flex flex-col justify-between transition-all duration-300 ${
                          role === 'Vendor'
                            ? 'bg-emerald-600/10 border-emerald-500/60 shadow-md shadow-emerald-600/5 glow-border-eco'
                            : 'bg-slate-900/20 border-slate-850 hover:border-slate-800'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <Building className={`h-4.5 w-4.5 ${role === 'Vendor' ? 'text-emerald-400' : 'text-slate-500'}`} />
                          {role === 'Vendor' && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                        </div>
                        <div className="mt-4">
                          <p className="text-xs font-bold text-white">Merchant</p>
                          <p className="text-[9px] text-slate-500 mt-0.5">Sell sustainable items</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vendor Storefront Fields */}
                  {role === 'Vendor' && (
                    <div className="space-y-4 p-4 rounded-2xl border border-emerald-500/20 bg-emerald-950/5 animate-slide-up">
                      <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
                        <ShoppingBag className="h-3.5 w-3.5" />
                        Create Storefront Profile
                      </h4>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Store Name</label>
                        <div className="relative">
                          <Building className="absolute top-3 left-3.5 h-4 w-4 text-slate-500" />
                          <input
                            type="text"
                            name="storeName"
                            required={role === 'Vendor'}
                            value={formData.storeName}
                            onChange={handleChange}
                            className="glass-input w-full pl-10 text-xs py-3 bg-slate-900/30 border-slate-800/80 focus:border-emerald-500 focus:ring-emerald-500"
                            placeholder="e.g. Khadi Weaves"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Store Description</label>
                        <textarea
                          name="storeDescription"
                          value={formData.storeDescription}
                          onChange={handleChange}
                          rows={2}
                          className="glass-input w-full text-xs py-2.5 bg-slate-900/30 border-slate-800/80 focus:border-emerald-500 focus:ring-emerald-500"
                          placeholder="Tell us what eco-friendly items you supply..."
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Email field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                <div className="relative">
                  <Mail className="absolute top-3 left-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`glass-input w-full pl-10 text-xs py-3 bg-slate-900/30 border-slate-800/80 focus:ring-1 ${
                      !isLogin && role === 'Vendor' 
                        ? 'focus:border-emerald-500 focus:ring-emerald-500' 
                        : 'focus:border-indigo-500 focus:ring-indigo-500'
                    }`}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Password</label>
                <div className="relative">
                  <Lock className="absolute top-3 left-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`glass-input w-full pl-10 pr-10 text-xs py-3 bg-slate-900/30 border-slate-800/80 focus:ring-1 ${
                      !isLogin && role === 'Vendor' 
                        ? 'focus:border-emerald-500 focus:ring-emerald-500' 
                        : 'focus:border-indigo-500 focus:ring-indigo-500'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 active:scale-95 mt-6 hover:shadow-2xl ${
                  loading
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : isLogin
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-indigo-600/10'
                    : role === 'Vendor'
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 shadow-emerald-600/10'
                    : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-indigo-600/10'
                }`}
              >
                <span>{loading ? 'Processing Request...' : isLogin ? 'Sign In to Dashboard' : 'Complete Setup'}</span>
                {!loading && <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

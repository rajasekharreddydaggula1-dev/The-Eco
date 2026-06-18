import React from 'react';
import { Home, User, Wallet, ShoppingBag, Menu } from 'lucide-react';

export default function BottomNavbar({ 
  onCartClick, 
  onWalletClick, 
  onMenuClick, 
  onYouClick, 
  onHomeClick, 
  cartCount = 0 
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-900 bg-slate-950/95 backdrop-blur-lg md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {/* Home */}
        <button
          onClick={onHomeClick}
          className="flex flex-col items-center justify-center w-12 h-12 text-slate-400 active:text-eco-400 hover:text-eco-400 transition-colors"
        >
          <Home className="h-5 w-5" />
          <span className="text-[9px] font-medium mt-1">Home</span>
        </button>

        {/* You */}
        <button
          onClick={onYouClick}
          className="flex flex-col items-center justify-center w-12 h-12 text-slate-400 active:text-eco-400 hover:text-eco-400 transition-colors"
        >
          <User className="h-5 w-5" />
          <span className="text-[9px] font-medium mt-1">You</span>
        </button>

        {/* Wallet */}
        <button
          onClick={onWalletClick}
          className="flex flex-col items-center justify-center w-12 h-12 text-slate-400 active:text-eco-400 hover:text-eco-400 transition-colors"
        >
          <Wallet className="h-5 w-5" />
          <span className="text-[9px] font-medium mt-1">Wallet</span>
        </button>

        {/* Cart */}
        <button
          onClick={onCartClick}
          className="relative flex flex-col items-center justify-center w-12 h-12 text-slate-400 active:text-eco-400 hover:text-eco-400 transition-colors"
        >
          <ShoppingBag className="h-5 w-5" />
          {cartCount > 0 && (
            <span className="absolute top-1 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-eco-500 text-[8px] font-bold text-white ring-1 ring-slate-950">
              {cartCount}
            </span>
          )}
          <span className="text-[9px] font-medium mt-1">Cart</span>
        </button>

        {/* Menu */}
        <button
          onClick={onMenuClick}
          className="flex flex-col items-center justify-center w-12 h-12 text-slate-400 active:text-eco-400 hover:text-eco-400 transition-colors"
        >
          <Menu className="h-5 w-5" />
          <span className="text-[9px] font-medium mt-1">Menu</span>
        </button>
      </div>
    </div>
  );
}

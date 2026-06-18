import React from 'react';

export default function Logo({ className = "h-8 w-8" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Background glow shadow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/20 to-eco-500/20 blur-md rounded-xl" />
      
      {/* SVG Icon */}
      <svg
        className="relative z-10 w-full h-full text-transparent"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" /> {/* Indigo / Purple */}
            <stop offset="50%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#22c55e" /> {/* Eco green */}
          </linearGradient>
          <linearGradient id="handleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>
        </defs>

        {/* Shopping Bag Handle */}
        <path
          d="M11 10C11 7.23858 13.2386 5 16 5C18.7614 5 21 7.23858 21 10"
          stroke="url(#handleGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Shopping Bag Body */}
        <path
          d="M7 11C7 9.89543 7.89543 9 9 9H23C24.1046 9 25 9.89543 25 11L27 25C27 26.6569 25.6569 28 24 28H8C6.34315 28 5 26.6569 5 25L7 11Z"
          fill="url(#bagGrad)"
          stroke="url(#handleGrad)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Stylized Inner Leaf (Checkmark) to symbolize Eco Commerce */}
        <path
          d="M12 19L15 22L21 15"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Decorative smile/arrow representing fulfillment under the bag */}
        <path
          d="M9 25C13 28 19 28 23 25"
          stroke="url(#handleGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

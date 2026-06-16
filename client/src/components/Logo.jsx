import React from 'react';

export default function Logo({ className = "h-8 w-8" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Glow Effect behind the logo */}
      <div className="absolute inset-0 bg-eco-500/20 blur-md rounded-full" />
      
      {/* SVG Icon */}
      <svg
        className="relative z-10 w-full h-full text-transparent"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="50%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        
        {/* Outer Ring */}
        <circle
          cx="16"
          cy="16"
          r="14"
          className="stroke-[1.5]"
          stroke="url(#logoGrad)"
          strokeDasharray="4 2"
        />
        
        {/* Abstract Geometric Leaf */}
        <path
          d="M16 6C16 6 10 13 10 18C10 21.3137 12.6863 24 16 24C19.3137 24 22 21.3137 22 18C22 13 16 6 16 6Z"
          fill="url(#logoGrad)"
          fillOpacity="0.15"
          stroke="url(#logoGrad)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        
        {/* Inner Rib */}
        <path
          d="M16 24V11"
          stroke="url(#logoGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        
        {/* Side leaf veins */}
        <path
          d="M16 18L19.5 15.5"
          stroke="url(#logoGrad)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M16 15L12.5 12.5"
          stroke="url(#logoGrad)"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

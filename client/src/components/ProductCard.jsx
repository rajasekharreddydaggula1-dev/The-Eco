import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Package } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';

export default function ProductCard({ product, storeSlug, onQuickAdded, index = 0 }) {
  const dispatch = useDispatch();

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // If product has variants, we default to the first variant
    let variantName = '';
    let price = product.price;

    if (product.variants && product.variants.length > 0) {
      variantName = product.variants[0].name;
      price = product.variants[0].price;
    }

    dispatch(addToCart({
      storeId: product.store,
      productId: product._id,
      name: product.name,
      price,
      quantity: 1,
      variantName,
      image: product.images[0] || ''
    }));

    if (onQuickAdded) {
      onQuickAdded(product.name);
    }
  };

  const hasVariants = product.variants && product.variants.length > 0;
  const mainImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600'; // Default placeholder

  const isOutOfStock = product.stock <= 0;

  return (
    <div 
      style={{ animationDelay: `${index * 60}ms` }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm card-elevate animate-fade-in-up"
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-950">
        <img
          src={mainImage}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 ease-out"
          loading="lazy"
        />
        {/* Category Badge */}
        <span className="absolute top-3 left-3 rounded-full bg-slate-950/80 backdrop-blur-md px-3 py-1 text-[10px] font-semibold tracking-wider text-slate-300 uppercase border border-slate-800 transition-transform duration-300 group-hover:scale-105">
          {product.category}
        </span>
        {/* Out Of Stock Badge */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/85 backdrop-blur-xs">
            <span className="rounded-lg bg-red-950/60 border border-red-500/30 px-3 py-1.5 text-xs font-bold text-red-400">
              OUT OF STOCK
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-semibold text-slate-100 group-hover:text-eco-400 transition-colors">
          <Link to={`/store/${storeSlug}/products/${product._id}`}>
            <span aria-hidden="true" className="absolute inset-0" />
            {product.name}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs text-slate-400">
          {product.description}
        </p>

        {/* Pricing / Stock */}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-white">
              ₹{product.price.toFixed(2)}
            </span>
            {hasVariants && (
              <span className="block text-[10px] text-slate-500 font-medium">
                {product.variants.length} options
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Package className="h-3.5 w-3.5" />
            <span>{product.stock} left</span>
          </div>
        </div>

        {/* Action Buttons overlaying or at the bottom */}
        <div className="mt-3 flex gap-2 z-10">
          <Link
            to={`/store/${storeSlug}/products/${product._id}`}
            className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-750 hover:text-white px-3 py-2 text-xs font-semibold text-slate-300 transition-all duration-300 active:scale-95"
          >
            <Eye className="h-3.5 w-3.5" />
            Details
          </Link>
          {!isOutOfStock && (
            <button
              onClick={handleQuickAdd}
              className="flex items-center justify-center rounded-lg bg-eco-600 hover:bg-eco-500 hover:scale-105 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-eco-600/10 transition-all duration-300 active:scale-90"
              title="Add to Cart"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

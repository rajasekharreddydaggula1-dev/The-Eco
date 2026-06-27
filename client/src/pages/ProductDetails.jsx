import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Check, ShieldAlert, Layers } from 'lucide-react';
import { fetchProductById, clearCurrentProduct } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';

export default function ProductDetails() {
  const { storeSlug, productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentProduct, loading, error } = useSelector(state => state.products);
  const { currentStore } = useSelector(state => state.stores);

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [toastMessage, setToastMessage] = useState('');
  const [activeImage, setActiveImage] = useState('');

  // 1. Fetch Product details on Mount
  useEffect(() => {
    dispatch(fetchProductById({ id: productId, tenantSlug: storeSlug }));
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [productId, storeSlug, dispatch]);

  // 2. Select initial variant / image when product is resolved
  useEffect(() => {
    if (currentProduct) {
      if (currentProduct.variants && currentProduct.variants.length > 0) {
        setSelectedVariant(currentProduct.variants[0]);
      }
      if (currentProduct.images && currentProduct.images.length > 0) {
        setActiveImage(currentProduct.images[0]);
      }
    }
  }, [currentProduct]);

  const handleAdd = () => {
    if (!currentProduct) return;

    let price = currentProduct.price;
    let varName = '';

    if (selectedVariant) {
      price = selectedVariant.price;
      varName = selectedVariant.name;
    }

    dispatch(addToCart({
      storeId: currentProduct.store,
      productId: currentProduct._id,
      name: currentProduct.name,
      price,
      quantity,
      variantName: varName,
      image: currentProduct.images[0] || ''
    }));

    setToastMessage(`Added ${quantity}x ${currentProduct.name} ${varName ? `(${varName})` : ''} to cart!`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Back link skeleton */}
          <div className="h-4 bg-slate-900 rounded-md w-36 shimmer-sweep" />

          {/* Grid Layout skeleton */}
          <div className="grid gap-8 md:grid-cols-12 rounded-2xl glass-panel p-6 sm:p-8">
            {/* Gallery Skeletons */}
            <div className="md:col-span-6 space-y-4">
              <div className="aspect-square rounded-xl bg-slate-900/60 shimmer-sweep" />
              <div className="flex gap-2.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 w-16 bg-slate-900/40 rounded-lg shimmer-sweep" />
                ))}
              </div>
            </div>

            {/* Info Skeletons */}
            <div className="md:col-span-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="h-5 w-20 bg-slate-905 rounded-full shimmer-sweep" />
                <div className="h-7 bg-slate-850 rounded-md w-3/4 shimmer-sweep" />
                <div className="h-8 bg-slate-800 rounded-md w-28 mt-2 shimmer-sweep" />
                <div className="space-y-2 pt-4">
                  <div className="h-3 bg-slate-900 rounded-md w-full shimmer-sweep" />
                  <div className="h-3 bg-slate-900 rounded-md w-5/6 shimmer-sweep" />
                  <div className="h-3 bg-slate-900 rounded-md w-2/3 shimmer-sweep" />
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-900">
                <div className="h-4 bg-slate-900 rounded-md w-1/3 shimmer-sweep" />
                <div className="flex gap-4">
                  <div className="h-10 w-24 bg-slate-900 rounded-lg shimmer-sweep" />
                  <div className="h-10 bg-slate-850 rounded-lg flex-1 shimmer-sweep" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentProduct) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-slate-950">
        <span className="text-4xl mb-4">⚠️</span>
        <h2 className="text-lg font-bold text-slate-200">Product Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">{error || 'The catalog item is missing or belongs to another tenant.'}</p>
        <Link to={`/store/${storeSlug}`} className="mt-6 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-500">
          Return to Storefront
        </Link>
      </div>
    );
  }

  const hasVariants = currentProduct.variants && currentProduct.variants.length > 0;
  
  // Calculate price dynamically based on chosen variant
  const currentPrice = selectedVariant ? selectedVariant.price : currentProduct.price;
  
  // Calculate stock dynamically based on chosen variant
  const currentStock = selectedVariant ? selectedVariant.stock : currentProduct.stock;
  const isOutOfStock = currentStock <= 0;

  return (
    <div className="min-h-screen bg-slate-950 py-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-eco-600 border border-eco-500 px-4 py-3.5 text-xs font-semibold text-white shadow-2xl animate-slide-in-right">
          <Check className="h-4 w-4" />
          {toastMessage}
        </div>
      )}

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Back Link */}
        <Link to={`/store/${storeSlug}`} className="group inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors duration-300">
          <ArrowLeft className="h-4 w-4 transform transition-transform duration-300 group-hover:-translate-x-1" />
          Back to Store Catalog
        </Link>

        {/* Product Grid */}
        <div className="grid gap-8 md:grid-cols-12 rounded-2xl glass-panel p-6 sm:p-8 animate-fade-in-up">
          {/* Images Gallery */}
          <div className="md:col-span-6 space-y-4">
            <div className="aspect-square rounded-xl bg-slate-950 overflow-hidden border border-slate-900">
              <img
                key={activeImage}
                src={activeImage || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600'}
                alt={currentProduct.name}
                className="h-full w-full object-cover animate-fade-in-up"
              />
            </div>
            {/* Gallery Thumbnails */}
            {currentProduct.images && currentProduct.images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto py-1">
                {currentProduct.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border transition-all duration-300 ${
                      activeImage === img 
                        ? 'border-eco-500 scale-90 ring-2 ring-eco-500/20' 
                        : 'border-slate-800 opacity-60 hover:opacity-100 hover:scale-95'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category */}
              <span className="inline-block rounded-full bg-slate-900 border border-slate-850 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                {currentProduct.category}
              </span>

              {/* Title & Price */}
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{currentProduct.name}</h1>
                <p className="text-2xl font-extrabold text-white mt-2">₹{currentPrice.toFixed(2)}</p>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-400 leading-relaxed">{currentProduct.description}</p>

              {/* Variants Selector */}
              {hasVariants && (
                <div className="space-y-3 pt-4 border-t border-slate-900">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-eco-500" />
                    Choose Variant option
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {currentProduct.variants.map((v) => (
                      <button
                        key={v._id}
                        onClick={() => {
                          setSelectedVariant(v);
                          setQuantity(1);
                        }}
                        className={`rounded-lg px-4 py-2 text-xs font-semibold border transition-all duration-300 active:scale-95 ${
                          selectedVariant?._id === v._id
                            ? 'bg-eco-600 border-eco-500 text-white shadow-md'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {v.name} (₹{v.price.toFixed(2)})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CTA: Quantity & Add to Cart */}
            <div className="pt-6 border-t border-slate-900 space-y-4">
              {/* Stock Indicator */}
              <div className="flex items-center gap-2 text-xs font-medium">
                {isOutOfStock ? (
                  <span className="flex items-center gap-1 text-red-400 font-bold">
                    <ShieldAlert className="h-4 w-4 animate-pulse" />
                    Out of Stock
                  </span>
                ) : currentStock <= 5 ? (
                  <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                    <ShieldAlert className="h-4 w-4 animate-bounce" />
                    Only {currentStock} items left in stock!
                  </span>
                ) : (
                  <span className="text-slate-500">In Stock: {currentStock} items available</span>
                )}
              </div>

              {/* Controls */}
              {!isOutOfStock && (
                <div className="flex items-center gap-4">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-slate-800 rounded-lg bg-slate-900 p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="text-slate-400 hover:text-white px-2 py-1 transition-transform duration-200 active:scale-75"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="text-xs font-bold px-3 text-slate-200">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                      className="text-slate-400 hover:text-white px-2 py-1 transition-transform duration-200 active:scale-75"
                      disabled={quantity >= currentStock}
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAdd}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-eco-600 hover:bg-eco-500 hover:scale-[1.02] px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-eco-600/25 transition-all duration-300 active:scale-[0.97]"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

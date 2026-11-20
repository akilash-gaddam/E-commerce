import React, { useState } from 'react';
import { Heart, Minus, Plus } from 'lucide-react';
import { CategoryArtwork } from './CategoryArtwork';

export default function ProductCard({
  product,
  inCart = false,
  cartQuantity = 0,
  inWishlist = false,
  onAddToCart,
  onUpdateQuantity,
  onToggleWishlist,
}) {
  const [busy, setBusy] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);

  const formatPrice = (price) => `$${price.toFixed(2)}`;
  const stockQty = product.stock_qty;
  const outOfStock = stockQty <= 0;
  const lowStock = stockQty > 0 && stockQty <= 10;

  const stockBadgeClass = outOfStock
    ? 'bg-crimson/10 text-crimson-400 border border-crimson/20'
    : lowStock
    ? 'bg-amber/10 text-amber-400 border border-amber/20'
    : 'bg-emerald/10 text-emerald-400 border border-emerald/20';

  const stockLabel = outOfStock ? 'OUT OF STOCK' : `${stockQty} LEFT`;

  const handleAdd = async () => {
    setBusy(true);
    try {
      await onAddToCart(product.id);
    } finally {
      setBusy(false);
    }
  };

  const handleChangeQty = async (newQty) => {
    setBusy(true);
    try {
      await onUpdateQuantity(product.id, newQty);
    } finally {
      setBusy(false);
    }
  };

  const handleImageLoad = () => {
    setImgLoading(false);
  };

  const handleImageError = () => {
    setImgError(true);
    setImgLoading(false);
  };

  return (
    <div className="product-card group">
      {/* Image / category artwork */}
      <div className="product-card-image relative">
        <div className="absolute inset-0">
          {product.image_url && !imgError ? (
            <>
              {/* Loading placeholder */}
              {imgLoading && (
                <div className="w-full h-full bg-border-muted animate-pulse absolute inset-0" aria-hidden="true" />
              )}
              <img
                src={product.image_url}
                alt={product.name}
                className={`w-full h-full object-cover transition-all duration-500 ${
                  imgLoading ? 'opacity-0' : 'opacity-100'
                } group-focus:scale-105`}
                loading="lazy"
                decoding="async"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </>
          ) : (
            <CategoryArtwork category={product.category} />
          )}
        </div>

        {/* Wishlist toggle - floating */}
        <button
          type="button"
          onClick={() => onToggleWishlist(product.id)}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center bg-elevated border border-border shadow-glass-sm hover:shadow-hard transition-all duration-300 rounded-full"
        >
          <Heart
            className={`w-4 h-4 ${inWishlist ? 'fill-gold stroke-gold' : 'stroke-ink'}`}
          />
        </button>

        {/* Category badge */}
        <span className="absolute top-3 left-3 z-10 badge-category bg-ink-muted/10 text-ink-light border border-border-muted">
          {product.category}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-body font-body-bold text-base leading-snug text-ink line-clamp-2">
            {product.name}
          </h3>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono font-mono-medium text-[11px] text-ink-muted uppercase tracking-wider">
            {product.sku}
          </span>
          <span className="text-ink-light">·</span>
          <span className="font-mono font-mono-medium text-[11px] text-ink-muted">
            {product.unit}
          </span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="font-mono font-mono-bold text-lg text-ink">
            {formatPrice(product.selling_price)}
          </span>
          <span className={`font-mono font-mono-medium text-[10px] px-2.5 py-1 ${stockBadgeClass} rounded-full`}>
            {stockLabel}
          </span>
        </div>

        {/* Action area */}
        <div className="mt-auto">
          {outOfStock ? (
            <button
              type="button"
              disabled
              className="w-full py-2.5 bg-border-muted text-ink-light font-body font-body-semibold text-sm border border-border rounded-xl cursor-not-allowed"
            >
              Out of Stock
            </button>
          ) : inCart ? (
            <div className="qty-stepper w-full justify-between">
              <button
                type="button"
                disabled={busy}
                onClick={() => handleChangeQty(cartQuantity - 1)}
                className="qty-btn disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-mono font-mono-bold text-sm tabular-nums">
                {cartQuantity}
              </span>
              <button
                type="button"
                disabled={busy || cartQuantity >= stockQty}
                onClick={() => handleChangeQty(cartQuantity + 1)}
                className="qty-btn disabled:opacity-40"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={handleAdd}
              className="w-full py-2.5 bg-gold text-gold-text font-body font-body-semibold text-sm border border-gold shadow-glass hover:bg-gold-hover transition-all duration-300 rounded-xl disabled:opacity-60"
            >
              + Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
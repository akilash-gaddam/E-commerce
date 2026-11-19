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

  const formatPrice = (price) => `$${price.toFixed(2)}`;
  const stockQty = product.stock_qty;
  const outOfStock = stockQty <= 0;
  const lowStock = stockQty > 0 && stockQty <= 10;

  const stockBadgeClass = outOfStock
    ? 'bg-ink text-elevated'
    : lowStock
    ? 'bg-amber-400 text-ink'
    : 'bg-forest text-forest-text';

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

  return (
    <div className="product-card">
      {/* Image / category artwork */}
      <div className="product-card-image relative">
        <div className="absolute inset-0">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <CategoryArtwork category={product.category} />
          )}
        </div>

        {/* Wishlist toggle */}
        <button
          type="button"
          onClick={() => onToggleWishlist(product.id)}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-2 right-2 z-10 w-9 h-9 flex items-center justify-center bg-elevated border border-border shadow-hard-sm hover:shadow-hard transition-all"
        >
          <Heart
            className={`w-4 h-4 ${inWishlist ? 'fill-ink stroke-ink' : 'stroke-ink'}`}
          />
        </button>

        {/* Category badge */}
        <span className="absolute top-2 left-2 z-10 badge-category bg-elevated text-ink border border-border">
          {product.category}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-body font-body-bold text-base leading-snug text-ink">
            {product.name}
          </h3>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono font-mono-medium text-[11px] text-ink-muted uppercase">
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
          <span className={`font-mono font-mono-bold text-[10px] px-2 py-1 ${stockBadgeClass}`}>
            {stockLabel}
          </span>
        </div>

        {/* Action area */}
        <div className="mt-auto">
          {outOfStock ? (
            <button
              type="button"
              disabled
              className="w-full py-2.5 bg-border-muted text-ink-light font-body font-body-bold text-sm border border-border cursor-not-allowed"
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
              className="w-full py-2.5 bg-citrus text-citrus-text font-body font-body-bold text-sm border border-border hover:bg-citrus-hover transition-colors disabled:opacity-60"
            >
              + Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

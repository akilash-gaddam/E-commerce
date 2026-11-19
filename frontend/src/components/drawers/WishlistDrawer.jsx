import React from 'react';
import { Heart, ShoppingBag, Trash2, X } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CategoryArtwork } from '../CategoryArtwork';
import { formatPrice } from '../../utils/helpers';

export default function WishlistDrawer({ open, onClose }) {
  const { wishlist, loading, toggleWishlist } = useWishlist();
  const { isAuthenticated, isCustomer } = useAuth();
  const navigate = useNavigate();

  if (!open) return null;

  if (!isAuthenticated || !isCustomer) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="bg-elevated border border-border shadow-hard p-6 max-w-sm w-full mx-4">
          <p className="font-body font-body-medium text-ink mb-4">Please log in to view your wishlist</p>
          <button onClick={() => navigate('/login')} className="btn-primary w-full">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const items = wishlist.items || [];

  const handleToggle = async (productId) => {
    await toggleWishlist(productId);
  };

  const handleMoveToCart = async (productId) => {
    await toggleWishlist(productId);
    navigate('/shop');
  };

  const handleRemove = async (productId) => {
    await toggleWishlist(productId);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-elevated border-l border-border shadow-hard-lg z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-display font-display-bold text-lg">Wishlist ({items.length})</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-border-muted rounded transition-colors"
            aria-label="Close wishlist"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="font-mono font-mono-medium text-sm text-center py-8">Loading...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-12 h-12 mx-auto text-ink-light mb-4 stroke-ink-light" />
              <p className="font-body font-body-medium text-ink mb-4">Your wishlist is empty</p>
              <button
                onClick={() => { onClose(); navigate('/shop'); }}
                className="btn-primary"
              >
                Go to Shop
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.product_id} className="flex gap-3 border border-border rounded p-3 bg-elevated">
                  {/* Product thumbnail */}
                  <div className="w-14 h-14 flex-shrink-0 border border-border rounded overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <CategoryArtwork category={item.category} />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-body-bold text-sm text-ink truncate">{item.name}</p>
                    <p className="font-mono font-mono-medium text-xs text-ink-muted mt-0.5">
                      {item.sku} · {item.unit}
                    </p>
                    <p className="font-mono font-mono-bold text-sm text-ink mt-1">
                      {formatPrice(item.selling_price)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => handleMoveToCart(item.product_id)}
                      className="btn-ghost text-xs"
                    >
                      <ShoppingBag className="w-3 h-3 mr-1" />
                      Move to Cart
                    </button>
                    <button
                      onClick={() => handleRemove(item.product_id)}
                      className="text-ink-muted hover:text-ink transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border p-4 bg-elevated text-center">
            <p className="font-mono font-mono-medium text-sm text-ink-muted">
              {items.length} item{items.length !== 1 ? 's' : ''} in your wishlist
            </p>
          </div>
        )}
      </div>
    </>
  );
}
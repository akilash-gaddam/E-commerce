import React from 'react';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CategoryArtwork } from '../CategoryArtwork';
import { formatPrice } from '../../utils/helpers';

export default function CartDrawer({ open, onClose, onCheckout }) {
  const { cart, loading, updateCartItem, removeFromCart, subtotal } = useCart();
  const { isAuthenticated, isCustomer } = useAuth();
  const navigate = useNavigate();

  if (!open) return null;

  if (!isAuthenticated || !isCustomer) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="bg-elevated border border-border shadow-hard p-6 max-w-sm w-full mx-4">
          <p className="font-body font-body-medium text-ink mb-4">Please log in to view your cart</p>
          <button onClick={() => navigate('/login')} className="btn-primary w-full">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const items = cart.items || [];
  const totalItems = items.length;
  const total = subtotal || 0;

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeFromCart(itemId);
    } else {
      await updateCartItem(itemId, { quantity: newQuantity });
    }
  };

  const handleRemove = async (itemId) => {
    await removeFromCart(itemId);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-elevated border-l border-border shadow-hard-lg z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-display font-display-bold text-lg">Your Cart ({totalItems})</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-border-muted rounded transition-colors"
            aria-label="Close cart"
          >
            <span className="font-mono font-mono-bold text-lg">✕</span>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="font-mono font-mono-medium text-sm text-center py-8">Loading...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-12 h-12 mx-auto text-ink-light mb-4" />
              <p className="font-body font-body-medium text-ink mb-4">Your cart is empty</p>
              <button
                onClick={() => { onClose(); navigate('/shop'); }}
                className="btn-primary"
              >
                Go to Shop
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 border border-border rounded p-3 bg-elevated">
                  {/* Product thumbnail */}
                  <div className="w-16 h-16 flex-shrink-0 border border-border rounded overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <CategoryArtwork category={item.category} />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className="font-body font-body-bold text-sm text-ink truncate">{item.name}</p>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-ink-muted hover:text-ink transition-colors"
                        aria-label="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="font-mono font-mono-medium text-xs text-ink-muted mt-0.5">
                      {item.sku} · {item.unit}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <div className="qty-stepper">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="qty-btn"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-mono-bold text-sm px-2">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock_qty}
                          className="qty-btn disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-mono font-mono-bold text-sm">
                        {formatPrice(item.item_total)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border p-4 bg-elevated">
            <div className="flex justify-between items-center mb-4">
              <span className="font-body font-body-semibold text-ink">Subtotal</span>
              <span className="font-mono font-mono-bold text-lg">{formatPrice(total)}</span>
            </div>
            <button
              onClick={() => { onClose(); onCheckout(); }}
              className="w-full btn-primary"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
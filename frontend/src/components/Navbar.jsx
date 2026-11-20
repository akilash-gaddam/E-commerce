import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, LogOut, Menu, X, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import CartDrawer from './drawers/CartDrawer';
import WishlistDrawer from './drawers/WishlistDrawer';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin, isCustomer, isAuthenticated } = useAuth();
  const { itemCount, subtotal } = useCart();
  const { count: wishlistCount } = useWishlist();

  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isShopPage = location.pathname === '/shop' || location.pathname === '/checkout';
  const isOrdersPage = location.pathname === '/orders';
  const isAdminPage = location.pathname === '/admin';
  const isLoginPage = location.pathname === '/login';

  const formatPrice = (price) => `$${price.toFixed(2)}`;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSwitchPortal = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    // Minimal navbar for login page
    return (
      <nav className="sticky top-0 z-50 bg-elevated border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/login')}
              className="font-display text-xl font-display-bold tracking-tight hover:opacity-70 transition-opacity flex items-baseline gap-0.5"
            >
              STANDARD<span className="text-gold">.</span>IO
            </button>
            <div className="flex items-center gap-4">
              <span className="portal-badge-storefront font-mono font-mono-medium text-xs px-3 py-1.5 rounded-xl">
                STOREFRONT
              </span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-elevated border-b border-border h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo + Nav */}
            <div className="flex items-center gap-8">
              <button
                onClick={() => navigate(isAdmin ? '/admin' : '/shop')}
                className="font-display text-xl font-display-bold tracking-tight hover:opacity-70 transition-opacity flex items-baseline gap-0.5"
              >
                STANDARD<span className="text-gold">.</span>IO
              </button>

              {/* Portal Badge */}
              <span className={`portal-badge ${isAdmin ? 'portal-badge-admin' : 'portal-badge-storefront'} hidden sm:block`}>
                {isAdmin ? 'ADMIN CONSOLE' : 'STOREFRONT'}
              </span>

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-1">
                {isCustomer && (
                  <>
                    <button
                      onClick={() => navigate('/shop')}
                      className={`btn-ghost px-3 py-1.5 rounded-xl ${isShopPage ? 'bg-border-muted border-border' : ''}`}
                    >
                      Shop
                    </button>
                    <button
                      onClick={() => navigate('/orders')}
                      className={`btn-ghost px-3 py-1.5 rounded-xl ${isOrdersPage ? 'bg-border-muted border-border' : ''}`}
                    >
                      Track Orders
                    </button>
                  </>
                )}
                {isAdmin && (
                  <button
                    onClick={() => navigate('/admin')}
                    className={`btn-ghost px-3 py-1.5 rounded-xl ${isAdminPage ? 'bg-border-muted border-border' : ''}`}
                  >
                    Command Center
                  </button>
                )}
              </div>
            </div>

            {/* Right: User + Actions */}
            <div className="flex items-center gap-2">
              {/* Wishlist */}
              {isCustomer && (
                <button
                  onClick={() => setWishlistOpen(true)}
                  className="relative p-2 hover:bg-border-muted transition-colors rounded-xl group"
                  aria-label="Open wishlist"
                >
                  <Heart className="w-5 h-5 stroke-ink group-hover:stroke-ink transition-colors" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gold border border-gold/30 rounded-full font-mono font-mono-bold text-[10px] flex items-center justify-center shadow-glass">
                      {wishlistCount}
                    </span>
                  )}
                </button>
              )}

              {/* Cart */}
              {isCustomer && (
                <button
                  onClick={() => setCartOpen(true)}
                  className="relative p-2 hover:bg-border-muted transition-colors rounded-xl group"
                  aria-label="Open cart"
                >
                  <ShoppingBag className="w-5 h-5 stroke-ink group-hover:stroke-ink transition-colors" />
                  {itemCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 bg-gold border border-gold/30 rounded-full font-mono font-mono-bold text-[10px] flex items-center justify-center px-1.5 shadow-glass">
                      {itemCount}
                    </span>
                  )}
                </button>
              )}

              {/* Cart subtotal indicator */}
              {isCustomer && itemCount > 0 && (
                <span className="hidden sm:block font-mono font-mono-medium text-sm text-ink-muted">
                  {formatPrice(subtotal)}
                </span>
              )}

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-border-muted transition-colors rounded-xl"
                >
                  <div className="w-8 h-8 bg-gold/10 border border-gold/30 rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 stroke-gold" />
                  </div>
                  <span className="hidden sm:block font-body font-body-semibold text-sm">
                    {user?.name || 'User'}
                  </span>
                </button>

                {mobileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-elevated border border-border shadow-glass-lg rounded-xl overflow-hidden z-50">
                    <div className="p-3 border-b border-border">
                      <p className="font-body font-body-semibold text-sm">{user?.name}</p>
                      <p className="font-mono font-mono-medium text-xs text-ink-muted">{user?.email}</p>
                    </div>
                    <div className="p-1">
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleSwitchPortal();
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-border-muted transition-colors rounded-xl"
                      >
                        Switch Portal
                      </button>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-border-muted transition-colors rounded-xl flex items-center gap-2 text-ink"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-border-muted transition-colors rounded-xl"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              {isCustomer && (
                <>
                  <button
                    onClick={() => {
                      navigate('/shop');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-border-muted transition-colors rounded-xl"
                  >
                    Shop
                  </button>
                  <button
                    onClick={() => {
                      navigate('/orders');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-border-muted transition-colors rounded-xl"
                  >
                    Track Orders
                  </button>
                </>
              )}
              {isAdmin && (
                <button
                  onClick={() => {
                    navigate('/admin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-border-muted transition-colors rounded-xl"
                >
                  Command Center
                </button>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Drawers */}
      {isCustomer && (
        <>
          <CartDrawer
            open={cartOpen}
            onClose={() => setCartOpen(false)}
            onCheckout={() => {
              setCartOpen(false);
              navigate('/checkout');
            }}
          />
          <WishlistDrawer
            open={wishlistOpen}
            onClose={() => setWishlistOpen(false)}
          />
        </>
      )}
    </>
  );
}

export default Navbar;
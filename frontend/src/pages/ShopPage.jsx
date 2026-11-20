import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { productAPI } from '../api/client';
import ProductCard from '../components/ProductCard';

export default function ShopPage() {
  const { isAuthenticated } = useAuth();
  const { cart, addToCart, updateCartItem, clearCart } = useCart();
  const { wishlist, toggleWishlist, isInWishlist } = useWishlist();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    in_stock_only: false,
  });
  const [loading, setLoading] = useState(true);

  // Build map: productId -> cart quantity
  const cartQtyMap = {};
  cart.items.forEach((item) => {
    cartQtyMap[item.product_id] = item.quantity;
  });

  const formatPrice = (price) => `$${price.toFixed(2)}`;

  useEffect(() => {
    fetchProducts();
    productAPI.categories().then((res) => setCategories(res.data || [])).catch(() => {});
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productAPI.list(filters);
      setProducts(response.data || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = (category) => {
    setFilters((prev) => ({ ...prev, category: category === filters.category ? '' : category }));
    fetchProducts();
  };

  const handleSearch = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
    // Debounce by fetching after short delay
    clearTimeout(window.shopSearchTimer);

    window.shopSearchTimer = setTimeout(() => {
      fetchProducts();
    }, 300);
  };

  const handleInStockToggle = () => {
    setFilters((prev) => ({ ...prev, in_stock_only: !prev.in_stock_only }));
    fetchProducts();
  };

  const handleAddToCart = async (productId) => {
    const stockItem = products.find((p) => p.id === productId);
    const qty = cartQtyMap[productId] || 0;
    if (qty >= (stockItem?.stock_qty || 0)) return;
    await addToCart(productId, 1);
  };

  const handleUpdateQuantity = async (productId, newQty) => {
    const stockItem = products.find((p) => p.id === productId);
    if (newQty > (stockItem?.stock_qty || 0)) return;
    const cartItem = cart.items.find((i) => i.product_id === productId);
    await updateCartItem(cartItem.id, newQty);
  };

  const handleToggleWishlist = async (productId) => {
    await toggleWishlist(productId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
        <div className="font-mono font-mono-medium text-sm text-ink-muted">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      {/* Hero Bar */}
      <div className="border-b border-border bg-elevated sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 py-4">
            <h1 className="font-display font-display-bold text-xl lg:text-2xl text-ink">
              STANDARD<span className="text-gold">.</span>IO
            </h1>

            {/* Search + Filters */}
            <div className="flex-1 max-w-3xl relative">
              <input
                type="text"
                value={filters.search}
                onChange={handleSearch}
                placeholder="Search products, SKUs..."
                className="w-full px-4 py-3 bg-elevated border border-border font-body text-ink placeholder:text-ink-muted
                  focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent
                  transition-all duration-300 rounded-xl lg:text-base"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer font-body font-body-medium text-sm">
                <input
                  type="checkbox"
                  checked={filters.in_stock_only}
                  onChange={handleInStockToggle}
                  className="w-4 h-4 bg-elevated border border-border rounded focus:ring-gold"
                />
                <span className="text-ink-muted">In Stock Only</span>
              </label>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mt-3 lg:mt-0 lg:border-t lg:pt-4">
            <button
              type="button"
              onClick={() => handleCategoryFilter('')}
              className={`px-3 py-1.5 rounded-xl font-mono font-mono-medium text-sm border transition-all duration-300 ${
                filters.category === ''
                  ? 'bg-gold text-gold-text border-gold shadow-glass'
                  : 'bg-elevated text-ink border-border hover:bg-border-muted'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl font-mono font-mono-medium text-sm border transition-all duration-300 ${
                  filters.category === cat
                    ? 'bg-gold text-gold-text border-gold shadow-glass'
                    : 'bg-elevated text-ink border-border hover:bg-border-muted'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <div className="font-mono font-mono-medium text-lg text-ink mb-2">
                No products found
              </div>
              <p className="font-body font-body-medium text-sm text-ink-muted">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                inCart={product.id in cartQtyMap}
                cartQuantity={cartQtyMap[product.id] || 0}
                inWishlist={isInWishlist(product.id)}
                onAddToCart={handleAddToCart}
                onUpdateQuantity={handleUpdateQuantity}
                onToggleWishlist={handleToggleWishlist}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
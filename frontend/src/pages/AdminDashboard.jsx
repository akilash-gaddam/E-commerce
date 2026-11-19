import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../api/client';
import { formatPrice, STATUS_STAGES } from '../utils/helpers';
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const COLORS = {
  revenue: '#111111',
  profit: '#143628',
  citrus: '#D4FF00',
  forest: '#143628',
  ink: '#111111',
};

const categoryColors = [
  '#111111', '#143628', '#52524E', '#8B6914', '#1E3A5F', '#8B5E3C',
];

const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

function AdminDashboard() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'inventory' | 'orders'

  // Analytics state
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(null);

  // Inventory state
  const [products, setProducts] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '', category: '', sku: '', cost_price: '', selling_price: '', stock_qty: '', unit: '', image_url: ''
  });
  const [newProductError, setNewProductError] = useState('');

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Load data when tab changes or component mounts
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      if (activeTab === 'analytics') loadAnalytics();
      else if (activeTab === 'inventory') loadInventory();
      else if (activeTab === 'orders') loadOrders();
    }
  }, [activeTab, isAuthenticated, isAdmin]);

  // --- Analytics ---
  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const response = await adminAPI.getAnalytics({ days: 30 });
      setAnalytics(response.data);
      setAnalyticsError(null);
    } catch (err) {
      setAnalyticsError('Failed to load analytics data');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // --- Inventory ---
  const loadInventory = async () => {
    setInventoryLoading(true);
    try {
      const response = await adminAPI.listProducts({ include_inactive: true });
      setProducts(response.data || []);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setInventoryLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setNewProductError('');
    try {
      await adminAPI.createProduct({
        name: newProduct.name,
        category: newProduct.category,
        sku: newProduct.sku,
        cost_price: parseFloat(newProduct.cost_price),
        selling_price: parseFloat(newProduct.selling_price),
        stock_qty: parseInt(newProduct.stock_qty),
        unit: newProduct.unit,
        image_url: newProduct.image_url || null,
      });
      setShowAddProduct(false);
      setNewProduct({ name: '', category: '', sku: '', cost_price: '', selling_price: '', stock_qty: '', unit: '', image_url: '' });
      loadInventory();
    } catch (err) {
      setNewProductError(err.response?.data?.detail || 'Failed to create product');
    }
  };

  const handleStockAdjust = async (productId, delta) => {
    try {
      await adminAPI.adjustStock(productId, { quantity: delta });
      loadInventory();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to adjust stock');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Delete this product?')) return;
    try {
      await adminAPI.deleteProduct(productId);
      loadInventory();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete product');
    }
  };

  const getUnitProfit = (p) => p.selling_price - p.cost_price;

  // --- Orders ---
  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await adminAPI.listOrders();
      setOrders(response.data.orders || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await adminAPI.updateOrderStatus(orderId, { status: newStatus });
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update status');
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
        <div className="card-elevated max-w-md w-full p-8 text-center">
          <p className="font-body font-body-medium text-ink mb-4">Admin access required</p>
        </div>
      </div>
    );
  }

  // --- Tabs Header ---
  const tabs = [
    { id: 'analytics', label: 'Revenue & Profit' },
    { id: 'inventory', label: 'Inventory & Stock' },
    { id: 'orders', label: 'Incoming Orders & Dispatch' },
  ];

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-elevated border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="font-display font-display-bold text-3xl lg:text-4xl text-ink flex items-center gap-4">
            STANDARD<span className="text-ink-light">.</span>IO
            <span className="font-mono font-mono-medium text-sm text-ink-muted">ADMIN CONSOLE</span>
          </h1>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-5 py-2.5 rounded font-body font-body-semibold text-sm border transition-colors ${
                  activeTab === tab.id
                    ? 'bg-citrus text-citrus-text border-citrus'
                    : 'bg-elevated text-ink border-border hover:bg-border-muted'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: Revenue & Profit Analytics */}
        {activeTab === 'analytics' && (
          <AnalyticsTab
            analytics={analytics}
            loading={analyticsLoading}
            error={analyticsError}
            onRetry={loadAnalytics}
            formatCurrency={formatCurrency}
          />
        )}

        {/* TAB 2: Inventory & Stock */}
        {activeTab === 'inventory' && (
          <InventoryTab
            products={products}
            loading={inventoryLoading}
            showAddProduct={showAddProduct}
            setShowAddProduct={setShowAddProduct}
            newProduct={newProduct}
            setNewProduct={setNewProduct}
            handleAddProduct={handleAddProduct}
            handleStockAdjust={handleStockAdjust}
            handleDeleteProduct={handleDeleteProduct}
            newProductError={newProductError}
            getUnitProfit={getUnitProfit}
          />
        )}

        {/* TAB 3: Incoming Orders & Dispatch */}
        {activeTab === 'orders' && (
          <OrdersTab
            orders={orders}
            loading={ordersLoading}
            handleOrderStatusChange={handleOrderStatusChange}
          />
        )}
      </div>
    </div>
  );
}

// ========== ANALYTICS TAB ==========
function AnalyticsTab({ analytics, loading, error, onRetry, formatCurrency }) {
  const chartData = analytics?.daily_series?.map((d) => ({
    date: d.date,
    revenue: d.revenue,
    profit: d.profit,
    cost: d.cost,
  })) || [];

  const categoryData = analytics?.category_breakdown?.map((cat, idx) => ({
    category: cat.category,
    revenue: cat.revenue,
    profit: cat.profit,
    margin: cat.margin_pct,
    color: categoryColors[idx % categoryColors.length],
  })) || [];

  if (loading) return <div className="font-mono font-mono-medium text-sm py-8">Loading analytics...</div>;
  if (error) return (
    <div className="card-elevated max-w-md w-full p-8 text-center">
      <p className="font-body font-body-medium text-ink mb-4">{error}</p>
      <button onClick={onRetry} className="btn-primary">Retry</button>
    </div>
  );
  if (!analytics) return <div className="font-mono font-mono-medium text-sm py-8">No analytics data</div>;

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard label="Total Revenue" value={formatCurrency(analytics.total_revenue)} />
        <KPICard label="Net Profit" value={formatCurrency(analytics.net_profit)} />
        <KPICard label="Profit Margin" value={`${analytics.profit_margin_pct}%`} />
        <KPICard label="Total Orders" value={analytics.total_orders} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue vs Profit */}
        <div className="card-elevated p-6">
          <h2 className="font-body font-body-semibold text-lg mb-4">Daily Revenue vs Net Profit (30 Days)</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#52524E' }}
                />
                <YAxis
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#52524E' }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #111111',
                    boxShadow: '4px 4px 0px #111111',
                    borderRadius: '0',
                  }}
                  formatter={(value, name) => [
                    formatCurrency(value),
                    name === 'revenue' ? 'Revenue' : name === 'profit' ? 'Net Profit' : 'Cost',
                  ]}
                  labelFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#111111" name="Revenue" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="#143628" name="Net Profit" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Profit Breakdown */}
        <div className="card-elevated p-6">
          <h2 className="font-body font-body-semibold text-lg mb-4">Category Profit Breakdown</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="profit"
                  nameKey="category"
                  label={({ category, profit, margin }) => `${category}: ${formatCurrency(profit)} (${margin}%)`}
                  labelLine={false}
                >
                  {categoryData.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={categoryColors[idx % categoryColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #111111',
                    boxShadow: '4px 4px 0px #111111',
                    borderRadius: '0',
                  }}
                  formatter={(value, name) => [formatCurrency(value), name === 'profit' ? 'Profit' : 'Revenue']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Low Stock Alert Panel */}
      <div className="card-elevated p-6">
        <h2 className="font-body font-body-semibold text-lg mb-4 flex items-center gap-2">
          Low Stock Alert ({"≤"} 10 units)
        </h2>
        {analytics.low_stock_products?.length > 0 ? (
          <div className="table-container rounded">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="table-cell">Product</th>
                  <th className="table-cell">Category</th>
                  <th className="table-cell">SKU</th>
                  <th className="table-cell text-center">Stock</th>
                  <th className="table-cell text-right">Unit</th>
                </tr>
              </thead>
              <tbody>
                {analytics.low_stock_products.map((p) => (
                  <tr key={p.id} className="table-row">
                    <td className="table-cell font-body font-body-medium">{p.name}</td>
                    <td className="table-cell font-mono font-mono-medium text-xs text-ink-muted">{p.category}</td>
                    <td className="table-cell font-mono font-mono-medium text-xs">{p.sku}</td>
                    <td className="table-cell text-center font-mono font-mono-bold text-sm">
                      <span className={`px-2 py-1 rounded ${
                        p.stock_qty <= 0 ? 'bg-ink text-elevated' :
                        p.stock_qty <= 5 ? 'bg-amber-400 text-ink' : 'bg-forest text-forest-text'
                      }`}>
                        {p.stock_qty <= 0 ? 'OUT' : p.stock_qty}
                      </span>
                    </td>
                    <td className="table-cell text-right font-mono font-mono-medium text-xs text-ink-muted">{p.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-ink-muted">
            <div className="font-display font-display-bold text-4xl text-forest mb-2">✓</div>
            <p className="font-body font-body-medium">All products well stocked</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ========== INVENTORY TAB ==========
function InventoryTab({
  products, loading, showAddProduct, setShowAddProduct,
  newProduct, setNewProduct, handleAddProduct,
  handleStockAdjust, handleDeleteProduct, newProductError, getUnitProfit
}) {
  const categories = ['Produce', 'Dairy', 'Pantry', 'Beverages', 'Bakery'];

  if (loading) return <div className="font-mono font-mono-medium text-sm py-8">Loading inventory...</div>;

  return (
    <div className="space-y-6">
      {/* Add Product Button + Modal */}
      <div className="flex justify-between items-center">
        <h2 className="font-body font-body-semibold text-lg">Inventory Manager</h2>
        <button onClick={() => setShowAddProduct(true)} className="btn-primary">
          + Add New Supermarket Item
        </button>
      </div>

      {/* Inventory Table */}
      <div className="card-elevated overflow-hidden">
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="table-cell">Product</th>
                <th className="table-cell">Category</th>
                <th className="table-cell">SKU</th>
                <th className="table-cell text-right">Cost</th>
                <th className="table-cell text-right">Sell</th>
                <th className="table-cell text-right">Unit Profit</th>
                <th className="table-cell text-center">Stock</th>
                <th className="table-cell text-right">Unit</th>
                <th className="table-cell text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="table-row">
                  <td className="table-cell font-body font-body-medium">{p.name}</td>
                  <td className="table-cell font-mono font-mono-medium text-xs text-ink-muted">{p.category}</td>
                  <td className="table-cell font-mono font-mono-medium text-xs">{p.sku}</td>
                  <td className="table-cell text-right font-mono font-mono-medium">{formatCurrency(p.cost_price)}</td>
                  <td className="table-cell text-right font-mono font-mono-medium">{formatCurrency(p.selling_price)}</td>
                  <td className="table-cell text-right font-mono font-mono-bold text-forest">{formatCurrency(getUnitProfit(p))}</td>
                  <td className="table-cell text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleStockAdjust(p.id, -1)}
                        disabled={p.stock_qty <= 0}
                        className="qty-btn disabled:opacity-40"
                      >−</button>
                      <span className={`font-mono font-mono-bold text-sm ${
                        p.stock_qty <= 0 ? 'text-ink' : p.stock_qty <= 10 ? 'text-amber-600' : 'text-forest'
                      }`}>
                        {p.stock_qty}
                      </span>
                      <button
                        onClick={() => handleStockAdjust(p.id, 1)}
                        className="qty-btn"
                      >+</button>
                    </div>
                  </td>
                  <td className="table-cell text-right font-mono font-mono-medium text-xs text-ink-muted">{p.unit}</td>
                  <td className="table-cell text-center">
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="text-ink-muted hover:text-red-600 transition-colors"
                      aria-label="Delete"
                    >
                      <span className="font-mono font-mono-bold">✕</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4" onClick={() => setShowAddProduct(false)}>
          <div className="bg-elevated border border-border shadow-hard-lg w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border">
              <h3 className="font-body font-body-semibold text-lg">Add New Product</h3>
              <p className="font-body font-body-medium text-sm text-ink-muted mt-1">Fill in the details below. Unit profit is calculated automatically.</p>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              {newProductError && (
                <div className="p-3 bg-red-100 border border-red-600 text-red-700 text-sm font-body">
                  {newProductError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-body font-body-medium mb-2 text-ink">Name *</label>
                  <Input
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="Organic Bananas"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-body font-body-medium mb-2 text-ink">Category *</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-body font-body-medium mb-2 text-ink">SKU *</label>
                  <Input
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    placeholder="PROD-BAN-001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-body font-body-medium mb-2 text-ink">Unit *</label>
                  <Input
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                    placeholder="1kg"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-body font-body-medium mb-2 text-ink">Cost Price *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProduct.cost_price}
                    onChange={(e) => setNewProduct({ ...newProduct, cost_price: e.target.value })}
                    placeholder="0.35"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-body font-body-medium mb-2 text-ink">Selling Price *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProduct.selling_price}
                    onChange={(e) => setNewProduct({ ...newProduct, selling_price: e.target.value })}
                    placeholder="0.69"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-body font-body-medium mb-2 text-ink">Initial Stock Qty *</label>
                <Input
                  type="number"
                  min="0"
                  value={newProduct.stock_qty}
                  onChange={(e) => setNewProduct({ ...newProduct, stock_qty: e.target.value })}
                  placeholder="100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-body font-body-medium mb-2 text-ink">Image URL (optional)</label>
                <Input
                  value={newProduct.image_url}
                  onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              {/* Live Profit Preview */}
              {(newProduct.cost_price && newProduct.selling_price) && (
                <div className="p-3 bg-border-muted rounded border border-border">
                  <p className="font-body font-body-medium text-sm text-ink-muted">Unit Profit Preview:</p>
                  <p className="font-display font-display-bold text-lg text-forest">
                    {formatCurrency(parseFloat(newProduct.selling_price) - parseFloat(newProduct.cost_price))}
                  </p>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">Save Product</Button>
                <Button type="button" variant="ghost" onClick={() => setShowAddProduct(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== ORDERS TAB ==========
function OrdersTab({ orders, loading, handleOrderStatusChange }) {
  if (loading) return <div className="font-mono font-mono-medium text-sm py-8">Loading orders...</div>;

  return (
    <div className="space-y-6">
      <h2 className="font-body font-body-semibold text-lg">Incoming Orders & Dispatch</h2>
      {orders.length === 0 ? (
        <div className="card-elevated p-12 text-center">
          <p className="font-body font-body-medium text-ink-muted">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card-elevated p-6">
              {/* Order Header */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4 pb-4 border-b border-border">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono font-mono-bold text-lg text-ink">#{order.id}</span>
                    <span className="font-body font-body-medium text-sm text-ink-muted">
                      {new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="font-mono font-mono-medium text-sm text-ink-muted mt-1">
                    {order.customer.name} · {order.customer.email}
                  </p>
                  <p className="font-mono font-mono-medium text-xs text-ink-muted mt-1">
                    {order.address_snapshot.street}, {order.address_snapshot.city} {order.address_snapshot.zip_code}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div className="text-right">
                    <p className="font-mono font-mono-bold text-lg text-ink">{formatCurrency(order.total_revenue)}</p>
                    <p className="font-mono font-mono-medium text-sm text-forest">Profit: {formatCurrency(order.net_profit)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="font-mono font-mono-medium text-xs text-ink-muted">Status:</label>
                    <select
                      value={order.status}
                      onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                      className="px-3 py-1.5 bg-elevated border border-border rounded font-mono font-mono-medium text-sm"
                    >
                      {STATUS_STAGES.map((stage) => (
                        <option key={stage} value={stage} style={{ color: getStatusColor(stage) }}>
                          {stage}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                    <div className="flex flex-col gap-0.5">
                      <p className="font-body font-body-medium text-sm text-ink">{item.name}</p>
                      <p className="font-mono font-mono-medium text-xs text-ink-muted">
                        {item.unit} · Qty {item.quantity} · {formatCurrency(item.unit_price)} ea
                      </p>
                    </div>
                    <span className="font-mono font-mono-bold text-sm text-ink">
                      {formatCurrency(item.unit_price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ========== HELPERS ==========
function KPICard({ label, value }) {
  return (
    <div className="card-elevated p-6">
      <div className="font-body font-body-medium text-sm text-ink-muted mb-2">{label}</div>
      <div className="text-3xl font-display font-display-bold text-ink">{value}</div>
    </div>
  );
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Placed': return '#111111';
    case 'Packed': return '#143628';
    case 'Out for Delivery': return '#143628';
    case 'Delivered': return '#143628';
    default: return '#111111';
  }
};

export default AdminDashboard;
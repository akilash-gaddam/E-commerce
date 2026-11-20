import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { customerAPI } from '../api/client';
import { formatPrice, formatOrderId, STATUS_STAGES } from '../utils/helpers';
import OrderStepper from '../components/OrderStepper';
import { CategoryArtwork } from '../components/CategoryArtwork';

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshingOrderId, setRefreshingOrderId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await customerAPI.getOrders();
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (orderId) => {
    setRefreshingOrderId(orderId);
    try {
      await fetchOrders();
    } finally {
      setRefreshingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
        <div className="font-mono font-mono-medium text-sm">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <div className="border-b border-border bg-elevated sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="font-display font-display-bold text-xl lg:text-2xl text-ink">My Orders</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="font-body font-body-semibold text-sm text-ink-muted uppercase tracking-wider mb-6">
          Order History
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="font-mono font-mono-medium text-lg text-ink mb-2">No orders yet</div>
            <p className="font-body font-body-medium text-sm text-ink-muted">
              Your order history will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="card-elevated overflow-hidden flex flex-col">
                {/* Order Header */}
                <div className="p-4 border-b border-border bg-border-muted/30">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono font-mono-bold text-lg text-ink">
                          #{`ORD-${order.id}`.padStart(4, '0')}
                        </span>
                        <span className="font-body font-body-medium text-sm text-ink-muted ml-auto">
                          {new Date(order.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="font-mono font-mono-medium text-sm text-ink-muted mt-1">
                        {order.address_snapshot.street}, {order.address_snapshot.city}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRefresh(order.id)}
                      disabled={refreshingOrderId === order.id}
                      className="flex items-center gap-2 px-3 py-1.5 bg-elevated border border-border rounded font-mono font-mono-medium text-sm text-ink hover:bg-border-muted transition-colors disabled:opacity-50"
                    >
                      Refresh Status
                    </button>
                  </div>
                </div>

                {/* Stepper */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-body font-body-medium text-sm text-ink-muted uppercase tracking-wider">
                      Order Status
                    </span>
                    <span className={`font-mono font-mono-bold text-xs ${
                      order.status === 'Delivered' ? 'text-forest' : 'text-ink'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <OrderStepper status={order.status} />
                </div>

                {/* Items */}
                <div className="p-4 border-b border-border">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center gap-4 py-2 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Product thumbnail */}
                        <div className="w-12 h-12 flex-shrink-0 border border-border rounded overflow-hidden relative">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover transition-opacity duration-300"
                              loading="lazy"
                              decoding="async"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'block';
                              }}
                            />
                          ) : null}
                          <CategoryArtwork
                            category={item.category}
                            className={item.image_url ? 'absolute inset-0' : ''}
                            style={item.image_url ? { display: 'none' } : {}}
                          />
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <p className="font-body font-body-medium text-sm text-ink truncate">{item.name}</p>
                          <p className="font-mono font-mono-medium text-xs text-ink-muted">
                            {item.unit} · Qty {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-mono-bold text-sm text-ink whitespace-nowrap">
                        {formatPrice(item.unit_price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="p-4 bg-elevated border-t border-border">
                  <div className="flex justify-between">
                    <span className="font-body font-body-medium text-sm text-ink-muted">Total</span>
                    <span className="font-mono font-mono-bold text-lg text-ink">{formatPrice(order.total_revenue)}</span>
                  </div>
                  <p className="font-mono font-mono-medium text-xs text-ink-muted mt-1">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

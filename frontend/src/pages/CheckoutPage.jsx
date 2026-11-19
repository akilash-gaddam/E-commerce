import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { customerAPI } from '../api/client';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isCustomer, user } = useAuth();
  const { cart, subtotal, clearCart, fetchCart } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addressForm, setAddressForm] = useState({
    full_name: '',
    phone: '',
    street: '',
    city: '',
    zip_code: '',
    is_default: false,
  });

  useEffect(() => {
    if (isAuthenticated && isCustomer) {
      fetchAddresses();
      // Clear selected address if cart is empty
      if (cart.items.length === 0) {
        setSelectedAddressId(null);
      }
    }
  }, [isAuthenticated, isCustomer]);

  const fetchAddresses = async () => {
    try {
      const response = await customerAPI.getAddresses();
      const addrs = response.data || [];
      setAddresses(addrs);
      // Auto-select default address if none selected
      if (!selectedAddressId && addrs.length > 0) {
        const defaultAddr = addrs.find((a) => a.is_default) || addrs[0];
        setSelectedAddressId(defaultAddr.id);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    }
  };

  const handleAddressChange = (e) => {
    setAddressForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }));
  };

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    try {
      const response = await customerAPI.createAddress(addressForm);
      const newAddr = response.data;
      setAddresses((prev) => [...prev, newAddr]);
      setSelectedAddressId(newAddr.id);
      setShowAddressForm(false);
      setAddressForm({ full_name: '', phone: '', street: '', city: '', zip_code: '', is_default: false });
    } catch (error) {
      alert('Failed to create address');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Delete this address?')) return;
    try {
      await customerAPI.deleteAddress(addressId);
      setAddresses((prev) => prev.filter((a) => a.id !== addressId));
      if (selectedAddressId === addressId) {
        const remaining = addresses.filter((a) => a.id !== addressId);
        setSelectedAddressId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (error) {
      alert('Failed to delete address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert('Please select a delivery address');
      return;
    }
    if (cart.items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const response = await customerAPI.createOrder({ address_id: selectedAddressId });
      clearCart();
      navigate('/orders');
    } catch (error) {
      const detail = error.response?.data?.detail;
      alert(detail || 'Failed to place order. Please check stock availability.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => `$${price.toFixed(2)}`;

  if (!isAuthenticated || !isCustomer) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
        <div className="card-elevated max-w-md w-full p-8 text-center">
          <p className="font-body font-body-medium text-ink mb-4">Please log in to checkout</p>
          <Button onClick={() => navigate('/login')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
        <div className="card-elevated max-w-md w-full p-8 text-center">
          <p className="font-body font-body-medium text-ink mb-4">Your cart is empty</p>
          <Button onClick={() => navigate('/shop')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <div className="border-b border-border bg-elevated sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="font-display font-display-bold text-xl lg:text-2xl text-ink">Checkout</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Address Selection */}
          <div className="lg:col-span-2">
            <div className="card-elevated p-6 mb-6">
              <h2 className="font-body font-body-semibold text-lg mb-4">Delivery Address</h2>

              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="font-body font-body-medium text-ink-muted mb-4">No saved addresses yet</p>
                  <Button variant="secondary" onClick={() => setShowAddressForm(true)}>
                    + Add Address
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className={`flex items-start gap-4 p-4 border-2 rounded cursor-pointer transition-colors ${
                          selectedAddressId === address.id
                            ? 'border-citrus bg-citrus/5'
                            : 'border-border-muted hover:border-border'
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          value={address.id}
                          checked={selectedAddressId === address.id}
                          onChange={() => setSelectedAddressId(address.id)}
                          className="mt-1 w-4 h-4 bg-citrus border-border text-citrus focus:ring-citrus"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 font-body font-body-semibold text-sm">
                            <span className="font-mono font-mono-medium text-xs text-ink-muted">{address.full_name}</span>
                            {address.is_default && (
                              <span className="font-mono font-mono-medium text-[10px] px-1.5 py-0.5 bg-forest text-forest-text rounded">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-ink-muted mt-1">{address.street}</p>
                          <p className="text-sm text-ink-muted">{address.city} {address.zip_code}</p>
                          <p className="text-sm text-ink-muted mt-1">{address.phone}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    onClick={() => setShowAddressForm(true)}
                    className="w-full"
                  >
                    + Add New Address
                  </Button>
                </>
              )}

              {/* New Address Form */}
              {showAddressForm && (
                <form onSubmit={handleCreateAddress} className="mt-6 p-4 bg-border-muted rounded space-y-4">
                  <h3 className="font-body font-body-semibold text-sm">New Address</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-body font-body-medium mb-2 text-ink">Full Name</label>
                      <Input
                        name="full_name"
                        value={addressForm.full_name}
                        onChange={handleAddressChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-body font-body-medium mb-2 text-ink">Phone</label>
                      <Input
                        type="tel"
                        name="phone"
                        value={addressForm.phone}
                        onChange={handleAddressChange}
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-body font-body-medium mb-2 text-ink">Street Address</label>
                    <Input
                      name="street"
                      value={addressForm.street}
                      onChange={handleAddressChange}
                      placeholder="123 Main Street, Apt 4B"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-body font-body-medium mb-2 text-ink">City</label>
                      <Input
                        name="city"
                        value={addressForm.city}
                        onChange={handleAddressChange}
                        placeholder="Mumbai"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-body font-body-medium mb-2 text-ink">Zip Code</label>
                      <Input
                        name="zip_code"
                        value={addressForm.zip_code}
                        onChange={handleAddressChange}
                        placeholder="400001"
                        required
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer font-body font-body-medium text-sm">
                    <input
                      type="checkbox"
                      name="is_default"
                      checked={addressForm.is_default}
                      onChange={handleAddressChange}
                      className="w-4 h-4 bg-elevated border border-border rounded focus:ring-citrus"
                    />
                    <span className="text-ink-muted">Set as default</span>
                  </label>
                  <div className="flex gap-3 pt-2">
                    <Button type="submit" className="flex-1">Save Address</Button>
                    <Button type="button" variant="ghost" onClick={() => setShowAddressForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="card-elevated p-6 sticky top-24">
              <h2 className="font-body font-body-semibold text-lg mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-body-medium text-sm text-ink">{item.name}</p>
                      <p className="font-mono font-mono-medium text-xs text-ink-muted">
                        {item.sku} · {item.unit} · Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-mono font-mono-bold text-sm text-ink whitespace-nowrap">
                      {formatPrice(item.item_total)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border-muted pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-body font-body-medium text-ink-muted">Subtotal</span>
                  <span className="font-mono font-mono-bold text-ink">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-body font-body-medium text-ink-muted">Delivery</span>
                  <span className="font-mono font-mono-bold text-ink">FREE</span>
                </div>
                <div className="border-t border-border-muted pt-2"></div>
                <div className="flex justify-between text-lg">
                  <span className="font-body font-body-bold text-ink">Total</span>
                  <span className="font-mono font-mono-bold text-ink">{formatPrice(subtotal)}</span>
                </div>
              </div>

              <Button
                className="w-full mt-4"
                onClick={handlePlaceOrder}
                disabled={loading || !selectedAddressId}
              >
                {loading ? 'Placing Order...' : `Place Order — ${formatPrice(subtotal)}`}
              </Button>

              <p className="font-mono font-mono-medium text-xs text-ink-muted text-center mt-3">
                Secure checkout via STANDARD.IO
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
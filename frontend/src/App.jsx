import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import CartDrawer from './components/drawers/CartDrawer';
import WishlistDrawer from './components/drawers/WishlistDrawer';
import LoginPage from './pages/LoginPage';
import ShopPage from './pages/ShopPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import AdminDashboard from './pages/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';

// ============================================================
// ROUTE GUARD COMPONENTS
// ============================================================

function CustomerRoute() {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return <Outlet />;
}

function AdminRoute() {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  if (loading) return null;
  if (!isAuthenticated || !isAdmin) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function RootRoute() {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/shop" replace />;
  return <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<LoginPage />} />

      {/* Customer area */}
      <Route element={<CustomerRoute />}>
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrdersPage />} />
      </Route>

      {/* Admin area */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* Catch-all: 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <BrowserRouter>
            <Navbar />
            <AppRoutes />
          </BrowserRouter>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
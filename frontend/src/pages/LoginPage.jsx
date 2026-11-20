import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { authAPI } from '../api/client';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, login } = useAuth();

  const [mode, setMode] = useState('customer-login'); // 'customer-login' | 'admin-login' | 'register'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === 'register';

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="font-mono font-mono-medium text-sm text-ink-muted">LOADING...</div>
      </div>
    );
  }

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/admin' : '/shop', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError('');
  };

  const handleCustomerLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
        portal: 'customer',
      });
      login(response.data.access_token, response.data.user);
      navigate('/shop');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
        portal: 'admin',
      });
      login(response.data.access_token, response.data.user);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.detail || 'Admin login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      login(response.data.access_token, response.data.user);
      navigate('/shop');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoCredentials = (portal) => {
    setMode(portal === 'admin' ? 'admin-login' : 'customer-login');
    setFormData({
      name: '',
      email: portal === 'admin' ? 'admin@standard.io' : 'user@standard.io',
      password: portal === 'admin' ? 'admin123' : 'user123',
    });
    setError('');
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4 relative">
      {/* Radial vignette background */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at top, #1C1C22 0%, #09090B 70%)'
      }} />

      <div className="card-elevated max-w-md w-full px-10 sm:px-12 py-10 relative">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-display-bold mb-3">
            <span className="text-ink">STANDARD</span>
            <span className="text-gold">.</span>IO
          </h2>
          <p className="font-body font-body-medium text-sm text-ink-muted">
            {isRegister ? 'Create your account' : 'Sign in to continue'}
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-8">
          <button
            onClick={() => { setMode('customer-login'); setError(''); }}
            className={`py-2 px-3 rounded-xl text-center font-body font-body-semibold text-sm border transition-all duration-300 ${
              mode === 'customer-login'
                ? 'bg-gold text-gold-text border-gold shadow-glass'
                : 'bg-elevated text-ink border-border hover:bg-border-muted'
            }`}
          >
            Customer
          </button>
          <button
            onClick={() => { setMode('admin-login'); setError(''); }}
            className={`py-2 px-3 rounded-xl text-center font-body font-body-semibold text-sm border transition-all duration-300 ${
              mode === 'admin-login'
                ? 'bg-emerald/10 text-emerald-400 border-emerald/20 shadow-glass'
                : 'bg-elevated text-ink border-border hover:bg-border-muted'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); }}
            className={`py-2 px-3 rounded-xl text-center font-body font-body-semibold text-sm border transition-all duration-300 ${
              mode === 'register'
                ? 'bg-crimson/10 text-crimson-400 border-crimson/20 shadow-glass'
                : 'bg-elevated text-ink border-border hover:bg-border-muted'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-crimson/10 border border-crimson/20 text-crimson-400 text-sm font-body rounded-xl">
            {error}
          </div>
        )}

        {/* Forms */}
        {mode === 'customer-login' && (
          <form onSubmit={handleCustomerLogin}>
            <div className="mb-4">
              <label className="block text-sm font-body font-body-medium mb-2 text-ink">Email</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="customer@standard.io"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-body font-body-medium mb-2 text-ink">Password</label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full btn-primary" disabled={submitting}>
              {submitting ? 'Signing In...' : 'Sign In'}
            </Button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('customer')}
              className="w-full mt-3 py-2 text-sm font-body font-body-medium text-ink-muted hover:text-ink transition-colors"
            >
              Fill Demo Credentials
            </button>
          </form>
        )}

        {mode === 'admin-login' && (
          <form onSubmit={handleAdminLogin}>
            <div className="mb-4">
              <label className="block text-sm font-body font-body-medium mb-2 text-ink">Email</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="admin@standard.io"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-body font-body-medium mb-2 text-ink">Password</label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" variant="secondary" className="w-full btn-secondary" disabled={submitting}>
              {submitting ? 'Signing In...' : 'Admin Sign In'}
            </Button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('admin')}
              className="w-full mt-3 py-2 text-sm font-body font-body-medium text-ink-muted hover:text-ink transition-colors"
            >
              Fill Demo Credentials
            </button>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label className="block text-sm font-body font-body-medium mb-2 text-ink">Full Name</label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-body font-body-medium mb-2 text-ink">Email</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="customer@standard.io"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-body font-body-medium mb-2 text-ink">Password</label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full btn-primary" disabled={submitting}>
              {submitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-border-muted text-center">
          <p className="font-mono font-mono-medium text-xs text-ink-muted">
            DEMO CUSTOMER: user@standard.io / user123
          </p>
          <p className="font-mono font-mono-medium text-xs text-ink-muted mt-1">
            DEMO ADMIN: admin@standard.io / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
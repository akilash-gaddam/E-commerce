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
        <div className="font-mono font-mono-medium text-sm">LOADING...</div>
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
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="card-elevated max-w-md w-full px-6 sm:px-10 py-10">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-display font-display-bold mb-2">
            STANDARD<span className="text-ink-light">.</span>IO
          </h2>
          <p className="font-body font-body-medium text-sm text-ink-muted">
            {isRegister ? 'Create your account' : 'Sign in to continue'}
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-8">
          <button
            onClick={() => { setMode('customer-login'); setError(''); }}
            className={`py-2 px-3 rounded text-center font-body font-body-semibold text-sm border transition-colors ${
              mode === 'customer-login'
                ? 'bg-citrus text-citrus-text border-citrus'
                : 'bg-elevated text-ink border-border hover:bg-border-muted'
            }`}
          >
            Customer
          </button>
          <button
            onClick={() => { setMode('admin-login'); setError(''); }}
            className={`py-2 px-3 rounded text-center font-body font-body-semibold text-sm border transition-colors ${
              mode === 'admin-login'
                ? 'bg-forest text-forest-text border-forest'
                : 'bg-elevated text-ink border-border hover:bg-border-muted'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); }}
            className={`py-2 px-3 rounded text-center font-body font-body-semibold text-sm border transition-colors ${
              mode === 'register'
                ? 'bg-ink text-elevated border-ink'
                : 'bg-elevated text-ink border-border hover:bg-border-muted'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-600 text-red-700 text-sm font-body">
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
            <Button type="submit" className="w-full btn-secondary" disabled={submitting}>
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

        <div className="mt-6 pt-6 border-t border-border-muted text-center">
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
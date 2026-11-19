import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  // Redirect to shop after showing the page
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      navigate('/shop');
    }, 3000);
    return () => clearTimeout(timeoutId);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center">
      <div className="text-center py-20">
        <div className="font-mono font-mono-medium text-6xl text-ink mb-4">404</div>
        <h2 className="font-display font-display-bold text-2xl mb-6">Page Not Found</h2>
        <p className="font-body font-body-medium text-ink-muted mb-10">
          The page you are looking for doesn't exist.
        </p>
        <Button onClick={() => navigate('/shop')}>Go to Shop</Button>
      </div>
    </div>
  );
}
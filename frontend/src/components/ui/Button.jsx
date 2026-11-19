import React from 'react';

export function Button({ className = '', variant = 'primary', children, ...props }) {
  const baseClasses = 'font-body font-body-bold px-6 py-3 border border-border shadow-hard';
  const variantClasses = {
    primary: 'bg-citrus text-citrus-text hover:bg-citrus-hover transition-colors duration-150',
    secondary: 'bg-forest text-forest-text hover:bg-forest-hover transition-colors duration-150',
    ghost: 'bg-transparent text-ink hover:bg-border-muted transition-colors duration-150',
    danger: 'bg-ink text-elevated hover:bg-ink/90 transition-colors duration-150',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export default Button;
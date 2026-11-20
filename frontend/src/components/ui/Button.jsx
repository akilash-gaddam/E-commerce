import React from 'react';

export function Button({
  children,
  className = '',
  variant = 'primary',
  type = 'button',
  disabled = false,
  onClick,
  ...props
}) {
  const baseClasses = `
    font-body font-body-semibold
    px-5 py-2.5
    rounded-xl
    border
    transition-all duration-300
    focus:outline-none
    focus:ring-2
    focus:ring-offset-2
    disabled:opacity-50
    disabled:cursor-not-allowed
  `;

  const variants = {
    primary: `
      bg-gold text-gold-text
      border-gold
      shadow-glass
      hover:bg-gold-hover
      hover:shadow-hard
      focus:ring-gold focus:ring-offset-canvas
    `,
    secondary: `
      bg-elevated text-ink
      border-border
      shadow-glass
      hover:bg-border-muted
      hover:shadow-soft
      focus:ring-gold focus:ring-offset-canvas
    `,
    danger: `
      bg-crimson text-elevated
      border-transparent
      shadow-glass-sm
      hover:bg-crimson/90
      focus:ring-crimson focus:ring-offset-canvas
    `,
    ghost: `
      bg-transparent text-ink
      border-transparent
      hover:bg-border-muted
      focus:ring-gold focus:ring-offset-canvas
    `,
    success: `
      bg-emerald/10 text-ink
      border-emerald/20
      shadow-glass-sm
      hover:bg-emerald/20
      focus:ring-emerald focus:ring-offset-canvas
    `,
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
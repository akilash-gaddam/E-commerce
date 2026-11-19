import React from 'react';

export function Input({
  className = '',
  type = 'text',
  value = '',
  onChange,
  placeholder,
  disabled = false,
  ...props
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className={`w-full px-4 py-3 bg-elevated border border-border font-body text-ink placeholder:text-ink-light
        focus:outline-none focus:ring-2 focus:ring-citrus focus:border-transparent
        transition-all duration-150 ${className}`}
      {...props}
    />
  );
}

export default Input;

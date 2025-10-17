import React from 'react';
import './Button.css';

/**
 * Reusable Button Component
 * @param {string} variant - 'primary' | 'secondary' | 'danger' | 'outline'
 * @param {string} size - 'small' | 'medium' | 'large'
 * @param {boolean} loading - Show loading spinner
 * @param {boolean} disabled - Disable button
 * @param {function} onClick - Click handler
 * @param {string} type - 'button' | 'submit' | 'reset'
 */
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  loading = false, 
  disabled = false, 
  onClick, 
  type = 'button',
  className = '',
  ...props 
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const disabledClass = (disabled || loading) ? 'btn-disabled' : '';
  const classes = `${baseClass} ${variantClass} ${sizeClass} ${disabledClass} ${className}`.trim();

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="btn-spinner"></span>
          <span className="btn-loading-text">Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;

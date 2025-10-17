import React from 'react';
import './LoadingSpinner.css';

/**
 * Loading Spinner Component
 * @param {string} size - 'small' | 'medium' | 'large'
 * @param {string} color - Spinner color (default: primary)
 * @param {string} text - Optional loading text
 */
const LoadingSpinner = ({ 
  size = 'medium', 
  color = '#00796B', 
  text = '' 
}) => {
  const sizeClass = `spinner-${size}`;

  return (
    <div className="spinner-container">
      <div 
        className={`spinner ${sizeClass}`}
        style={{ borderTopColor: color }}
      ></div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;

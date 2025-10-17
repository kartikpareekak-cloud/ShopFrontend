import React, { useEffect } from 'react';
import './ToastNotification.css';

/**
 * Toast Notification Component
 * @param {string} type - 'success' | 'error' | 'warning' | 'info'
 * @param {string} message - Notification message
 * @param {number} duration - Auto-dismiss duration in ms (0 = no auto-dismiss)
 * @param {function} onClose - Close callback
 */
const ToastNotification = ({ 
  type = 'info', 
  message, 
  duration = 3000, 
  onClose 
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose && onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onClose} aria-label="Close notification">
        ✕
      </button>
    </div>
  );
};

/**
 * Toast Container Component
 * Manages multiple toast notifications
 */
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          type={toast.type}
          message={toast.message}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ToastNotification;

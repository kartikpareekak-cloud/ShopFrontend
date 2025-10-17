import React from 'react';
import './InputField.css';

/**
 * Reusable Input Field Component
 * @param {string} label - Field label
 * @param {string} type - Input type (text, email, password, number, etc.)
 * @param {string} value - Input value
 * @param {function} onChange - Change handler
 * @param {string} error - Error message
 * @param {string} placeholder - Placeholder text
 * @param {boolean} required - Required field
 * @param {boolean} disabled - Disabled state
 */
const InputField = ({
  label,
  type = 'text',
  value,
  onChange,
  error = '',
  placeholder = '',
  required = false,
  disabled = false,
  name,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || name || label?.toLowerCase().replace(/\s+/g, '-');
  const hasError = Boolean(error);

  return (
    <div className={`input-field ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`input ${hasError ? 'input-error' : ''} ${disabled ? 'input-disabled' : ''}`}
        {...props}
      />
      {hasError && <span className="input-error-message">{error}</span>}
    </div>
  );
};

export default InputField;

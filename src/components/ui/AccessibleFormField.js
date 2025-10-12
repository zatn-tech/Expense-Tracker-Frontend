import React from 'react';
import { getFormFieldAria, getErrorId, getHelpId } from '../../utils/accessibility';

/**
 * Accessible form field component with proper labels, error handling, and ARIA attributes
 */
const AccessibleFormField = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  helpText,
  required = false,
  disabled = false,
  autoComplete,
  className = '',
  labelClassName = '',
  inputClassName = '',
  errorClassName = '',
  helpClassName = '',
  ...props
}) => {
  const errorId = getErrorId(id);
  const helpId = getHelpId(id);
  const ariaProps = getFormFieldAria(id, !!error, error);

  const baseInputClasses = `
    w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors
    dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
    ${error 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-600 dark:focus:ring-red-800 bg-red-50 dark:bg-red-900/20'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200 dark:border-gray-600 dark:focus:ring-blue-800'
    }
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${inputClassName}
  `;

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Label */}
      <label 
        htmlFor={id} 
        className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${labelClassName}`}
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>

      {/* Input */}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        className={baseInputClasses}
        aria-describedby={[
          error ? errorId : undefined,
          helpText ? helpId : undefined
        ].filter(Boolean).join(' ') || undefined}
        {...ariaProps}
        {...props}
      />

      {/* Help Text */}
      {helpText && (
        <div id={helpId} className={`text-sm text-gray-500 dark:text-gray-400 ${helpClassName}`}>
          {helpText}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div 
          id={errorId} 
          className={`text-sm text-red-600 dark:text-red-400 ${errorClassName}`}
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default AccessibleFormField;



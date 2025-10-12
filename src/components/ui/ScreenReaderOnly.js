import React from 'react';

/**
 * ScreenReaderOnly component for visually hidden content that should be available to screen readers
 * This follows WCAG guidelines for providing text alternatives for visual content
 */
const ScreenReaderOnly = ({ children, className = '', ...props }) => {
  return (
    <span 
      className={`sr-only ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default ScreenReaderOnly;


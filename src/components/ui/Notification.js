import React, { useState, useEffect } from 'react';

const Notification = ({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose, 
  show = false 
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsExiting(false);
      
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [show, message, duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-5 h-5 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="w-5 h-5 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case 'info':
      default:
        return (
          <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getStyles = () => {
    const baseStyles = "max-w-sm w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 transform transition-all duration-300 ease-in-out";
    
    if (!isVisible) {
      return `${baseStyles} translate-x-full opacity-0`;
    }
    
    if (isExiting) {
      return `${baseStyles} translate-x-full opacity-0`;
    }
    
    return `${baseStyles} translate-x-0 opacity-100`;
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'border-l-4 border-l-green-500';
      case 'error':
        return 'border-l-4 border-l-red-500';
      case 'warning':
        return 'border-l-4 border-l-yellow-500';
      case 'info':
      default:
        return 'border-l-4 border-l-blue-500';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`${getStyles()} ${getTypeStyles()}`}>
      <div className="p-4">
        <div className="flex items-start space-x-3">
          {getIcon()}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white break-words">
              {message}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification; 
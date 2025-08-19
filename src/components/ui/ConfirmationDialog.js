import React from 'react';

const ConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning' // 'warning', 'danger', 'info'
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: '⚠️',
          iconBg: 'bg-red-100 dark:bg-red-900/30',
          iconColor: 'text-red-600 dark:text-red-400',
          buttonBg: 'bg-red-600 hover:bg-red-700',
          borderColor: 'border-red-200 dark:border-red-700'
        };
      case 'warning':
        return {
          icon: '⚠️',
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
          borderColor: 'border-yellow-200 dark:border-yellow-700'
        };
      case 'info':
      default:
        return {
          icon: 'ℹ️',
          iconBg: 'bg-blue-100 dark:bg-blue-900/30',
          iconColor: 'text-blue-600 dark:text-blue-400',
          buttonBg: 'bg-blue-600 hover:bg-blue-700',
          borderColor: 'border-blue-200 dark:border-blue-700'
        };
    }
  };

  const styles = getTypeStyles();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${styles.borderColor} bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-t-2xl`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${styles.iconBg} rounded-lg flex items-center justify-center`}>
              <span className="text-lg">{styles.icon}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Please confirm your action</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {message}
          </p>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 text-sm font-medium text-white ${styles.buttonBg} rounded-lg transition-colors flex items-center space-x-2`}
            >
              <span>{styles.icon}</span>
              <span>{confirmText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog; 
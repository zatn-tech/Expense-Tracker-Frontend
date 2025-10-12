import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const EmailConnectionDeleteDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  connectionEmail,
  transactionCount = 0 
}) => {
  const { theme } = useTheme();
  const [deleteTransactions, setDeleteTransactions] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(deleteTransactions);
      onClose();
    } catch (error) {
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-md w-full rounded-xl shadow-xl ${
        theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Email Connection
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This action cannot be undone
              </p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Are you sure you want to delete the email connection for{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{connectionEmail}</span>?
            </p>
            
            {transactionCount > 0 && (
              <div className={`p-4 rounded-lg border ${
                theme === 'dark' ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-2">
                      {transactionCount} detected transaction{transactionCount !== 1 ? 's' : ''} found
                    </p>
                    <div className="space-y-3">
                      <label className="flex items-start">
                        <input
                          type="radio"
                          name="deleteOption"
                          checked={deleteTransactions}
                          onChange={() => setDeleteTransactions(true)}
                          className="mt-1 mr-3 text-red-600 focus:ring-red-500"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Delete all detected transactions
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            This will remove all email transactions and any created transactions from your expense tracker
                          </p>
                        </div>
                      </label>
                      <label className="flex items-start">
                        <input
                          type="radio"
                          name="deleteOption"
                          checked={!deleteTransactions}
                          onChange={() => setDeleteTransactions(false)}
                          className="mt-1 mr-3 text-green-600 focus:ring-green-500"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Keep detected transactions
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            This will preserve all email transactions and created transactions in your expense tracker
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors duration-200 ${
                theme === 'dark'
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              } ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isDeleting}
              className={`px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors duration-200 ${
                isDeleting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
              }`}
            >
              {isDeleting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </div>
              ) : (
                'Delete Connection'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailConnectionDeleteDialog;


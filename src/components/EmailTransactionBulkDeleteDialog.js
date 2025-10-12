import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const EmailTransactionBulkDeleteDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  selectedTransactions = [],
  allTransactions = [],
  connections = [],
  onTransactionCountChange
}) => {
  const { theme } = useTheme();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteOptions, setDeleteOptions] = useState({
    selectedTransactions: true, // Delete only selected transactions
    deleteCreatedTransactions: false, // Don't delete created transactions by default
    filterBy: 'selected', // 'selected', 'connection', 'status', 'dateRange'
    connectionId: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  });

  // Calculate transaction counts based on current filters
  const getTransactionCount = () => {
    if (deleteOptions.filterBy === 'selected') {
      return selectedTransactions.length;
    }

    let filtered = allTransactions;

    if (deleteOptions.connectionId) {
      filtered = filtered.filter(tx => tx.emailConnectionId === deleteOptions.connectionId);
    }

    if (deleteOptions.status) {
      filtered = filtered.filter(tx => tx.status === deleteOptions.status);
    }

    if (deleteOptions.dateFrom) {
      filtered = filtered.filter(tx => new Date(tx.detectedDate) >= new Date(deleteOptions.dateFrom));
    }

    if (deleteOptions.dateTo) {
      filtered = filtered.filter(tx => new Date(tx.detectedDate) <= new Date(deleteOptions.dateTo));
    }

    return filtered.length;
  };

  const transactionCount = getTransactionCount();
  const createdTransactionsCount = selectedTransactions.filter(tx => tx.createdTransactionId).length;

  // Notify parent of transaction count changes
  useEffect(() => {
    if (onTransactionCountChange) {
      onTransactionCountChange(transactionCount, createdTransactionsCount);
    }
  }, [transactionCount, createdTransactionsCount, onTransactionCountChange]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (transactionCount === 0) {
      return;
    }

    setIsDeleting(true);
    try {
      const payload = {
        deleteCreatedTransactions: deleteOptions.deleteCreatedTransactions
      };

      if (deleteOptions.filterBy === 'selected') {
        payload.transactionIds = selectedTransactions.map(tx => tx._id);
      } else {
        if (deleteOptions.connectionId) payload.connectionId = deleteOptions.connectionId;
        if (deleteOptions.status) payload.status = deleteOptions.status;
        if (deleteOptions.dateFrom) payload.dateFrom = deleteOptions.dateFrom;
        if (deleteOptions.dateTo) payload.dateTo = deleteOptions.dateTo;
      }

      await onConfirm(payload);
      onClose();
    } catch (error) {
    } finally {
      setIsDeleting(false);
    }
  };

  const getConnectionName = (connectionId) => {
    const connection = connections.find(conn => conn._id === connectionId);
    return connection ? connection.email : 'Unknown Connection';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-2xl w-full rounded-xl shadow-xl ${
        theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Bulk Delete Email Transactions
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This action cannot be undone
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Delete Scope Selection */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">What to delete?</h4>
              <div className="space-y-3">
                <label className="flex items-start">
                  <input
                    type="radio"
                    name="deleteScope"
                    checked={deleteOptions.filterBy === 'selected'}
                    onChange={() => setDeleteOptions({ ...deleteOptions, filterBy: 'selected' })}
                    className="mt-1 mr-3 text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Selected transactions ({selectedTransactions.length} transactions)
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Delete only the transactions you've selected
                    </p>
                  </div>
                </label>
                
                <label className="flex items-start">
                  <input
                    type="radio"
                    name="deleteScope"
                    checked={deleteOptions.filterBy === 'connection'}
                    onChange={() => setDeleteOptions({ ...deleteOptions, filterBy: 'connection' })}
                    className="mt-1 mr-3 text-red-600 focus:ring-red-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      All transactions from a connection
                    </p>
                    <label htmlFor="connection-select" className="sr-only">Select email connection</label>
                    <select
                      id="connection-select"
                      value={deleteOptions.connectionId}
                      onChange={(e) => setDeleteOptions({ ...deleteOptions, connectionId: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      disabled={deleteOptions.filterBy !== 'connection'}
                      aria-label="Select email connection"
                    >
                      <option value="">Select email connection</option>
                      {connections.map(conn => (
                        <option key={conn._id} value={conn._id}>
                          {conn.email} ({allTransactions.filter(tx => tx.emailConnectionId === conn._id).length} transactions)
                        </option>
                      ))}
                    </select>
                  </div>
                </label>

                <label className="flex items-start">
                  <input
                    type="radio"
                    name="deleteScope"
                    checked={deleteOptions.filterBy === 'status'}
                    onChange={() => setDeleteOptions({ ...deleteOptions, filterBy: 'status' })}
                    className="mt-1 mr-3 text-red-600 focus:ring-red-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      All transactions with a specific status
                    </p>
                    <label htmlFor="status-select" className="sr-only">Select transaction status</label>
                    <select
                      id="status-select"
                      value={deleteOptions.status}
                      onChange={(e) => setDeleteOptions({ ...deleteOptions, status: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      disabled={deleteOptions.filterBy !== 'status'}
                      aria-label="Select transaction status"
                    >
                      <option value="">Select status</option>
                      <option value="pending">Pending ({allTransactions.filter(tx => tx.status === 'pending').length})</option>
                      <option value="approved">Approved ({allTransactions.filter(tx => tx.status === 'approved').length})</option>
                      <option value="rejected">Rejected ({allTransactions.filter(tx => tx.status === 'rejected').length})</option>
                      <option value="modified">Modified ({allTransactions.filter(tx => tx.status === 'modified').length})</option>
                    </select>
                  </div>
                </label>
              </div>
            </div>

            {/* Additional Options */}
            <div className={`p-4 rounded-lg border ${
              theme === 'dark' ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-3">
                    {transactionCount} email transaction{transactionCount !== 1 ? 's' : ''} will be deleted
                  </p>
                  
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      checked={deleteOptions.deleteCreatedTransactions}
                      onChange={(e) => setDeleteOptions({ ...deleteOptions, deleteCreatedTransactions: e.target.checked })}
                      className="mt-1 mr-3 text-red-600 focus:ring-red-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Also delete created transactions
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        This will also delete {createdTransactionsCount} actual transactions that were created from these email transactions
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 mt-6">
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
              disabled={isDeleting || transactionCount === 0}
              className={`px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors duration-200 ${
                isDeleting || transactionCount === 0
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
                `Delete ${transactionCount} Transaction${transactionCount !== 1 ? 's' : ''}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTransactionBulkDeleteDialog;

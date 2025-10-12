import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useConfirmation } from '../hooks/useConfirmation';
import ConfirmationDialog from './ui/ConfirmationDialog';

function ImportManager({ onClose, onImportDeleted }) {
  const { userId } = useParams();
  const { token } = useContext(AuthContext);
  const { showSuccess, showError } = useNotification();
  const { confirmation, showConfirmation, hideConfirmation } = useConfirmation();
  const [importHistory, setImportHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchImportHistory();
  }, [userId, token]);

  const fetchImportHistory = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(
        `${API_ENDPOINTS.USER_TRANSACTIONS(userId)}?limit=1000`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Handle different response formats
      let transactions = [];
      if (Array.isArray(response.data)) {
        transactions = response.data;
      } else if (response.data && Array.isArray(response.data.transactions)) {
        transactions = response.data.transactions;
      } else {
        transactions = [];
      }

      // Group transactions by importId
      const importGroups = {};
      
      transactions.forEach(transaction => {
        if (transaction.importId) {
          if (!importGroups[transaction.importId]) {
            importGroups[transaction.importId] = {
              importId: transaction.importId,
              transactions: [],
              totalAmount: 0,
              incomeAmount: 0,
              expenseAmount: 0,
              createdAt: transaction.createdAt
            };
          }
          
          importGroups[transaction.importId].transactions.push(transaction);
          importGroups[transaction.importId].totalAmount += parseFloat(transaction.amount) || 0;
          
          if (transaction.type === 'income') {
            importGroups[transaction.importId].incomeAmount += parseFloat(transaction.amount) || 0;
          } else {
            importGroups[transaction.importId].expenseAmount += parseFloat(transaction.amount) || 0;
          }
        }
      });

      // Convert to array and sort by creation date
      const history = Object.values(importGroups).sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      setImportHistory(history);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load import history');
    } finally {
      setLoading(false);
    }
  };

  const deleteImportBatch = async (importId) => {
    showConfirmation({
      title: 'Delete Import Batch',
      message: 'Are you sure you want to delete this import batch? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          setDeleting(importId);
          await axios.delete(
            `${API_ENDPOINTS.USER_TRANSACTIONS_IMPORT_BATCH(userId)}`,
            {
              headers: { Authorization: `Bearer ${token}` },
              data: { importId }
            }
          );

          // Remove from local state
          setImportHistory(prev => prev.filter(importBatch => importBatch.importId !== importId));
          
          // Call callback to refresh main transaction list
          if (onImportDeleted) {
            onImportDeleted();
          }
          
          showSuccess('Import batch deleted successfully!');
        } catch (err) {
          showError('Failed to delete import batch');
        } finally {
          setDeleting(null);
        }
      }
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
              <div className="bg-white dark:bg-black rounded-lg p-6">
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading import history...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-black rounded-lg shadow-xl w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your imported transaction batches</p>
        </div>
      </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {importHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📥</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Import History</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Import some transactions to see them here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {importHistory.map((importBatch) => (
                <div
                  key={importBatch.importId}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Import Batch
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(importBatch.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full">
                        {importBatch.transactions.length} transactions
                      </span>
                      <button
                        onClick={() => deleteImportBatch(importBatch.importId)}
                        disabled={deleting === importBatch.importId}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Delete this import batch"
                      >
                        {deleting === importBatch.importId ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white dark:bg-black rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Amount</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(importBatch.totalAmount)}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-black rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Income</div>
                      <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(importBatch.incomeAmount)}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-black rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Expenses</div>
                      <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                        {formatCurrency(importBatch.expenseAmount)}
                      </div>
                    </div>
                  </div>

                  {/* Sample Transactions */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Sample Transactions
                    </h4>
                    <div className="space-y-2">
                      {importBatch.transactions.slice(0, 3).map((transaction, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-white dark:bg-black rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex items-center space-x-3">
                            <span className={`w-2 h-2 rounded-full ${
                              transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                            }`}></span>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {transaction.category}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {transaction.description || 'No description'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${
                              transaction.type === 'income' 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(transaction.transactionDate)}
                            </div>
                          </div>
                        </div>
                      ))}
                      {importBatch.transactions.length > 3 && (
                        <div className="text-center text-sm text-gray-600 dark:text-gray-400 py-2">
                          +{importBatch.transactions.length - 3} more transactions
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmation.isOpen}
        onClose={hideConfirmation}
        onConfirm={confirmation.onConfirm}
        title={confirmation.title}
        message={confirmation.message}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        type={confirmation.type}
      />
    </>
  );
}

export default ImportManager; 
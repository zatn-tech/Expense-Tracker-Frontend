import React, { useContext } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useConfirmation } from '../hooks/useConfirmation';
import ConfirmationDialog from './ui/ConfirmationDialog';

function formatINR(amount) {
  return amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
}

function getCategoryIcon(category) {
  const categoryIcons = {
    'Food': '🍽️',
    'Transportation': '🚗',
    'Shopping': '🛒',
    'Entertainment': '🎬',
    'Bills': '📄',
    'Health': '⚕️',
    'Salary': '💼',
    'Freelance': '💻',
    'Investment': '📈',
    'Business': '🏢',
    'Gift': '🎁',
    'Other': '📝'
  };
  
  return categoryIcons[category] || '📝';
}

function TransactionList({ transactions, onDelete, userId }) {
  const { token } = useContext(AuthContext);
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  const { confirmation, showConfirmation, hideConfirmation } = useConfirmation();

  const handleDelete = async (transactionId) => {
    showConfirmation({
      title: 'Delete Transaction',
      message: 'Are you sure you want to delete this transaction? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          const response = await axios.delete(`${API_ENDPOINTS.USER_TRANSACTIONS(userId)}/${transactionId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          onDelete(transactionId);
          showSuccess('Transaction deleted successfully!');
          
          // Handle goal notifications from delete response
          if (response.data.goalNotifications && response.data.goalNotifications.length > 0) {
            response.data.goalNotifications.forEach((notification) => {
              if (notification.type === 'success') {
                showSuccess(notification.message);
              } else if (notification.type === 'error') {
                showError(notification.message);
              } else if (notification.type === 'warning') {
                showWarning(notification.message);
              } else {
                showInfo(notification.message);
              }
            });
          }
        } catch (err) {
          console.error('Delete error:', err);
          showError('Failed to delete transaction: ' + (err.response?.data?.error || err.message));
        }
      }
    });
  };

  const formatTransactionDate = (transaction) => {
    // Use transactionDate if available, otherwise fall back to createdAt
    const dateToUse = transaction.transactionDate || transaction.createdAt;
    
    if (!dateToUse) {
      return 'Unknown date';
    }

    try {
      const date = new Date(dateToUse);
      
      // Check if the date is today
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      
      // Check if the date is yesterday
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday = date.toDateString() === yesterday.toDateString();
      
      if (isToday) {
        return `Today, ${date.toLocaleTimeString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        })}`;
      } else if (isYesterday) {
        return `Yesterday, ${date.toLocaleTimeString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        })}`;
      } else {
        // Show full date for older transactions
        return date.toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
          year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const getTimeAgo = (transaction) => {
    // This shows when the transaction was uploaded (createdAt)
    const uploadDate = transaction.createdAt;
    if (!uploadDate) return '';

    try {
      const now = new Date();
      const uploaded = new Date(uploadDate);
      const diffInMinutes = Math.floor((now - uploaded) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h ago`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d ago`;
      
      return uploaded.toLocaleDateString('en-IN', { 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return '';
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="text-gray-400 dark:text-gray-500 text-4xl sm:text-6xl mb-4">📝</div>
        <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">No transactions yet</h3>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-6 px-4">
          Start tracking your finances by adding your first transaction!
        </p>
        <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20">
          <span className="mr-2">💡</span>
          Add a transaction to get started
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="max-h-96 overflow-y-auto custom-scrollbar">
        {transactions
          .sort((a, b) => {
            // Sort by transaction date first, then by creation date
            const dateA = new Date(a.transactionDate || a.createdAt);
            const dateB = new Date(b.transactionDate || b.createdAt);
            return dateB - dateA;
          })
          .map((txn) => (
          <div
            key={txn._id}
            className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 overflow-hidden"
          >
            {/* Main Transaction Row */}
            <div className="p-4">
              <div className="flex items-start space-x-3">
                {/* Category Icon */}
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg shadow-sm ${
                    txn.type === 'income' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {getCategoryIcon(txn.category)}
                  </div>
                </div>
                
                {/* Transaction Details */}
                <div className="flex-1 min-w-0">
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                        {txn.category}
                      </h3>
                      {txn.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                          {txn.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Amount */}
                    <div className="flex-shrink-0 ml-3">
                      <p className={`text-lg font-bold ${
                        txn.type === 'income' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {txn.type === 'income' ? '+' : '-'} {formatINR(txn.amount)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Tags Row */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {/* Type Badge */}
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      txn.type === 'income'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    }`}>
                      {txn.type === 'income' ? '💰 Income' : '💸 Expense'}
                    </span>
                    
                    {/* Payment Method Badge */}
                    {txn.paymentMethod && txn.paymentMethod !== 'cash' && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                        {txn.paymentMethod === 'card' && '💳 Card'}
                        {txn.paymentMethod === 'upi' && '📱 UPI'}
                        {txn.paymentMethod === 'bank_transfer' && '🏦 Transfer'}
                        {txn.paymentMethod === 'other' && '💼 Other'}
                        {txn.paymentMethod === 'cash' && '💵 Cash'}
                      </span>
                    )}
                  </div>
                  
                  {/* Date Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        📅 {formatTransactionDate(txn)}
                      </span>
                      
                      {/* Upload time indicator */}
                      {txn.transactionDate && txn.createdAt && 
                       new Date(txn.transactionDate).toDateString() !== new Date(txn.createdAt).toDateString() && (
                        <span className="flex items-center">
                          • Added {getTimeAgo(txn)}
                        </span>
                      )}
                    </div>
                    
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(txn._id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Delete transaction"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
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
    </div>
  );
}

export default TransactionList;

import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { fetchCategoriesByType } from '../utils/categoryUtils';
import { triggerBudgetBrowserNotification } from '../utils/budgetNotificationTrigger';
import { triggerGoalBrowserNotification } from '../utils/goalNotificationTrigger';
import AccountSelector from './AccountSelector';
import { TYPOGRAPHY, TYPOGRAPHY_COMBINATIONS } from '../utils/typography';

function EditTransaction({ transaction, onClose, onUpdate }) {
  const { userId } = useParams();
  const { token } = useContext(AuthContext);
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState({ expense: [], income: [] });
  const [formData, setFormData] = useState({
    type: 'expense',
    category: '',
    amount: '',
    transactionDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    description: '',
    accountId: ''
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type || 'expense',
        category: transaction.category || '',
        amount: transaction.amount || '',
        transactionDate: transaction.transactionDate 
          ? new Date(transaction.transactionDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        paymentMethod: transaction.paymentMethod || 'cash',
        description: transaction.description || '',
        accountId: transaction.accountId || ''
      });
    }
    fetchCategories();
  }, [transaction]);

  const fetchCategories = async () => {
    try {
      const [expenseCategories, incomeCategories] = await Promise.all([
        fetchCategoriesByType(userId, token, 'expense'),
        fetchCategoriesByType(userId, token, 'income')
      ]);
      
      setCategories({
        expense: expenseCategories,
        income: incomeCategories
      });
    } catch (error) {
      // Handle error silently
    }
  };

  const loadCategoriesForType = async (type) => {
    try {
      const categoriesForType = await fetchCategoriesByType(userId, token, type);
      setCategories(prev => ({
        ...prev,
        [type]: categoriesForType
      }));
    } catch (error) {
      // Handle error silently
    }
  };

  const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: '💵' },
    { value: 'card', label: 'Card', icon: '💳' },
    { value: 'upi', label: 'UPI', icon: '📱' },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
    { value: 'other', label: 'Other', icon: '💼' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Load categories when type changes
    if (name === 'type' && value) {
      loadCategoriesForType(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put(
        `${API_ENDPOINTS.USER_TRANSACTIONS(userId)}/${transaction._id}`,
        {
          ...formData,
          amount: parseFloat(formData.amount)
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.status === 'success') {
        showSuccess('Transaction updated successfully!');
        
        // Handle goal notifications from update response
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

        // Trigger budget notifications
        if (response.data.budgetNotifications && response.data.budgetNotifications.length > 0) {
          response.data.budgetNotifications.forEach((notification) => {
            triggerBudgetBrowserNotification(notification);
          });
        }

        // Trigger goal notifications
        if (response.data.goalNotifications && response.data.goalNotifications.length > 0) {
          response.data.goalNotifications.forEach((notification) => {
            triggerGoalBrowserNotification(notification);
          });
        }

        onUpdate(response.data.data);
        onClose();
      } else {
        showError(response.data.message || 'Failed to update transaction');
      }
    } catch (err) {
      console.error('Update error:', err);
      showError('Failed to update transaction: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!transaction) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Transaction</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Transaction Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: 'type', value: 'expense' } })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.type === 'expense'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>💸</span>
                    <span className="font-medium">Expense</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: 'type', value: 'income' } })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.type === 'income'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>💰</span>
                    <span className="font-medium">Income</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
              >
                <option value="">Select a category</option>
                {categories[formData.type]?.map((category) => (
                  <option key={category._id || category} value={category.name || category}>
                    {category.name || category}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount (₹)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="Enter amount"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
              />
            </div>

            {/* Transaction Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Transaction Date
              </label>
              <input
                type="date"
                name="transactionDate"
                value={formData.transactionDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => handleChange({ target: { name: 'paymentMethod', value: method.value } })}
                    className={`p-2 rounded-lg border-2 transition-all text-sm ${
                      formData.paymentMethod === method.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>{method.icon}</span>
                      <span>{method.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Account */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Account
              </label>
              <AccountSelector
                selectedAccountId={formData.accountId}
                onAccountChange={(accountId) => handleChange({ target: { name: 'accountId', value: accountId } })}
                showBalance={true}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add a description..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Updating...' : 'Update Transaction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditTransaction;

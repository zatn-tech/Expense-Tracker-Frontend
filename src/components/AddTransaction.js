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

function AddTransaction({ onAdd }) {
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
    fetchCategories();
  }, []);

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
    { value: 'bank_transfer', label: 'Bank', icon: '🏦' }
  ];

  const quickAmounts = [100, 500, 1000, 2000, 5000];

  const resetForm = () => {
    setFormData({
      type: 'expense',
      category: '',
      amount: '',
      transactionDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      description: '',
      accountId: ''
    });
  };

  const handleTypeChange = (type) => {
    setFormData({ ...formData, type, category: '' });
    loadCategoriesForType(type);
  };

  const handleAccountChange = (accountId) => {
    setFormData({ ...formData, accountId });
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.category || !formData.accountId) {
      showWarning('Please fill in all required fields including account selection');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        API_ENDPOINTS.USER_TRANSACTIONS(userId),
        {
          ...formData,
          amount: parseFloat(formData.amount)
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (onAdd) {
        onAdd(response.data.transaction);
      }

      showSuccess('Transaction added successfully!');
      resetForm();
      
      // Trigger notifications
      if (response.data.budgetAlerts) {
        response.data.budgetAlerts.forEach(alert => {
          if (alert.type === 'error') {
            showError(alert.message);
          } else {
            showWarning(alert.message);
          }
        });
      }

      if (response.data.goalNotifications) {
        response.data.goalNotifications.forEach(notification => {
          showInfo(notification.message);
        });
      }

      // Browser notifications
      if (response.data.budgetAlerts) {
        response.data.budgetAlerts.forEach(alert => {
          triggerBudgetBrowserNotification(alert);
        });
      }

      if (response.data.goalNotifications) {
        response.data.goalNotifications.forEach(notification => {
          triggerGoalBrowserNotification(notification);
        });
      }

    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to add transaction';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Transaction Type Toggle - Compact */}
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => handleTypeChange('expense')}
          className={`flex-1 py-2.5 px-4 rounded-lg border-2 transition-all duration-200 font-medium text-sm ${
            formData.type === 'expense'
              ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-600 dark:bg-rose-900/20 dark:text-rose-300'
              : 'border-gray-200 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <span className="text-lg">💸</span>
            <span>Expense</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('income')}
          className={`flex-1 py-2.5 px-4 rounded-lg border-2 transition-all duration-200 font-medium text-sm ${
            formData.type === 'income'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300'
              : 'border-gray-200 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <span className="text-lg">💰</span>
            <span>Income</span>
          </div>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Account Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
            <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Account
          </label>
          <AccountSelector
            selectedAccountId={formData.accountId}
            onAccountChange={handleAccountChange}
            required={true}
            showBalance={true}
            className="w-full"
          />
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
            <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-lg font-semibold">
              ₹
            </span>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full pl-8 pr-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-medium transition-all duration-200"
              placeholder="0.00"
              required
            />
          </div>
          
          {/* Quick Amount Buttons */}
          <div className="flex flex-wrap gap-2">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setFormData({...formData, amount: amount.toString()})}
                className="px-3 py-1.5 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 font-medium border border-blue-200 dark:border-blue-700"
              >
                ₹{amount.toLocaleString('en-IN')}
              </button>
            ))}
          </div>
        </div>

        {/* Category Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
            <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
            required
          >
            <option value="">Choose category</option>
            {categories[formData.type] && categories[formData.type].map((category) => (
              <option key={category._id} value={category.name}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Payment and Date - Side by Side */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <svg className="w-4 h-4 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Payment
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
            >
              {paymentMethods.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.icon} {method.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Date
            </label>
            <input
              type="date"
              value={formData.transactionDate}
              onChange={(e) => setFormData({...formData, transactionDate: e.target.value})}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
            <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Description
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
            placeholder="Add description..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !formData.amount || !formData.category || !formData.accountId}
          className="w-full py-3 px-4 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Adding...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add Transaction</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default AddTransaction;

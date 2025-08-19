import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function EditBudget({ budget, onClose, onBudgetUpdated }) {
  const { userId } = useParams();
  const { token } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'monthly',
    amount: '',
    category: '',
    startDate: '',
    endDate: '',
    description: '',
    alertThreshold: 80,
    rollover: false,
    isActive: true
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (budget) {
      setFormData({
        name: budget.name || '',
        type: budget.type || 'monthly',
        amount: budget.amount || '',
        category: budget.category || '',
        startDate: budget.startDate ? new Date(budget.startDate).toISOString().split('T')[0] : '',
        endDate: budget.endDate ? new Date(budget.endDate).toISOString().split('T')[0] : '',
        description: budget.description || '',
        alertThreshold: budget.alertThreshold || 80,
        rollover: budget.rollover || false,
        isActive: budget.isActive !== undefined ? budget.isActive : true
      });
    }
    fetchCategories();
  }, [budget]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.USER_TRANSACTIONS(userId), {
        headers: { Authorization: `Bearer ${token}` }
      });

      let transactions = [];
      if (Array.isArray(response.data)) {
        transactions = response.data;
      } else if (response.data && Array.isArray(response.data.transactions)) {
        transactions = response.data.transactions;
      }

      const uniqueCategories = [...new Set(transactions.map(t => t.category).filter(Boolean))];
      setCategories(uniqueCategories.sort());
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.amount || !formData.startDate || !formData.endDate) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.type === 'category' && !formData.category) {
      setError('Please select a category for category budget');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      setError('Budget amount must be greater than 0');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError('End date must be after start date');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const budgetData = {
        ...formData,
        amount: parseFloat(formData.amount),
        alertThreshold: parseInt(formData.alertThreshold)
      };

      await axios.put(API_ENDPOINTS.USER_BUDGETS_UPDATE(userId, budget._id), budgetData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      onBudgetUpdated();
    } catch (err) {
      console.error('Error updating budget:', err);
      setError(err.response?.data?.error || 'Failed to update budget');
    } finally {
      setLoading(false);
    }
  };

  const getBudgetTypeDescription = (type) => {
    switch (type) {
      case 'monthly':
        return 'Monthly budget that resets every month';
      case 'yearly':
        return 'Yearly budget that covers the entire year';
      case 'category':
        return 'Budget for a specific spending category';
      case 'custom':
        return 'Custom budget with your own start and end dates';
      default:
        return '';
    }
  };

  if (!budget) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-black rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Budget</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Update your budget settings</p>
          </div>
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
        <form onSubmit={handleSubmit} className="p-6">
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

          <div className="space-y-6">
            {/* Budget Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Budget Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Monthly Groceries, Entertainment Budget"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Budget Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Budget Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="monthly">Monthly Budget</option>
                <option value="yearly">Yearly Budget</option>
                <option value="category">Category Budget</option>
                <option value="custom">Custom Budget</option>
              </select>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {getBudgetTypeDescription(formData.type)}
              </p>
            </div>

            {/* Category (for category budgets) */}
            {formData.type === 'category' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Budget Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Budget Amount (₹) *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Add a description for this budget..."
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Alert Threshold */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Alert Threshold (%)
              </label>
              <input
                type="number"
                name="alertThreshold"
                value={formData.alertThreshold}
                onChange={handleInputChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Get alerted when you reach this percentage of your budget
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="rollover"
                  checked={formData.rollover}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Allow unused budget to roll over to next period
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Budget is active (uncheck to pause tracking)
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Updating...' : 'Update Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBudget; 
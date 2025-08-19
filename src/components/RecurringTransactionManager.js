import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useConfirmation } from '../hooks/useConfirmation';
import ConfirmationDialog from './ui/ConfirmationDialog';

const RecurringTransactionManager = () => {
  const { userId } = useParams();
  const { token } = useContext(AuthContext);
  const { showSuccess, showError, showInfo } = useNotification();
  const { confirmation, showConfirmation, hideConfirmation } = useConfirmation();
  
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: '',
    frequency: 'monthly',
    interval: 1,
    startDate: '',
    description: ''
  });

  const [categories, setCategories] = useState({ expense: [], income: [] });

  useEffect(() => {
    fetchRecurringTransactions();
    fetchCategories();
  }, [userId]);

  const fetchCategories = async () => {
    try {
      const [expenseCategories, incomeCategories] = await Promise.all([
        axios.get(API_ENDPOINTS.USER_CATEGORIES_TYPE(userId, 'expense'), {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(API_ENDPOINTS.USER_CATEGORIES_TYPE(userId, 'income'), {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setCategories({
        expense: expenseCategories.data,
        income: incomeCategories.data
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      type,
      category: '' // Clear category when type changes
    }));
  };

  const fetchRecurringTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.USER_RECURRING_TRANSACTIONS(userId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecurringTransactions(response.data);
    } catch (error) {
      console.error('Error fetching recurring transactions:', error);
      setError('Failed to fetch recurring transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        interval: parseInt(formData.interval)
      };

      await axios.post(API_ENDPOINTS.USER_RECURRING_TRANSACTIONS(userId), payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowAddForm(false);
      setFormData({
        title: '',
        amount: '',
        type: 'expense',
        category: '',
        frequency: 'monthly',
        interval: 1,
        startDate: '',
        description: ''
      });
      fetchRecurringTransactions();
      showSuccess('Recurring transaction created successfully!');
    } catch (error) {
      console.error('Error saving recurring transaction:', error);
      showError(error.response?.data?.message || 'Failed to save recurring transaction');
    }
  };

  const handleDelete = async (id) => {
    showConfirmation({
      title: 'Delete Recurring Transaction',
      message: 'Are you sure you want to delete this recurring transaction? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_ENDPOINTS.USER_RECURRING_TRANSACTIONS(userId)}/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          fetchRecurringTransactions();
          showSuccess('Recurring transaction deleted successfully!');
        } catch (error) {
          console.error('Error deleting recurring transaction:', error);
          showError('Failed to delete recurring transaction');
        }
      }
    });
  };

  const handleProcess = async () => {
    try {
      setProcessing(true);
      const response = await axios.post(API_ENDPOINTS.USER_RECURRING_TRANSACTIONS_PROCESS(userId), {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.processed.length > 0) {
        showSuccess(`Successfully processed ${response.data.processed.length} recurring transactions!`);
        fetchRecurringTransactions();
      } else {
        showInfo('No recurring transactions were due for processing.');
      }
    } catch (error) {
      console.error('Error processing recurring transactions:', error);
      showError('Failed to process recurring transactions');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-black rounded-lg p-6">
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading recurring transactions...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black rounded-lg shadow-xl w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your automatic recurring transactions
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleProcess}
            disabled={processing}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-medium transition-colors shadow-modern hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50"
          >
            {processing ? 'Processing...' : 'Process Due'}
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-medium transition-colors shadow-modern hover:from-indigo-700 hover:to-indigo-800"
          >
            Add Recurring
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
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
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {recurringTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔄</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Recurring Transactions</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first recurring transaction to automate your finances
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-medium transition-colors shadow-modern hover:from-indigo-700 hover:to-indigo-800"
            >
              Create Recurring Transaction
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {recurringTransactions.map((transaction) => (
              <div
                key={transaction._id}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        transaction.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}></div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{transaction.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {transaction.category} • {transaction.frequency}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className={`font-semibold ${
                        transaction.type === 'income' 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Next: {formatDate(transaction.nextDueDate)}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDelete(transaction._id)}
                      className="p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {transaction.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {transaction.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
                  <span>Processed: {transaction.totalOccurrences} times</span>
                  <span>Last: {transaction.lastProcessed ? formatDate(transaction.lastProcessed) : 'Never'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 transform transition-all duration-300 scale-100">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">🔄</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Add Recurring Transaction
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Set up automatic transactions</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white dark:bg-gray-900">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories[formData.type] && categories[formData.type].map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Frequency *
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Optional description"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-colors shadow-lg flex items-center space-x-2"
                >
                  <span>🔄</span>
                  <span>Create Recurring Transaction</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
};

export default RecurringTransactionManager; 
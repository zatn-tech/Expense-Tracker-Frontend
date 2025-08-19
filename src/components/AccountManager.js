import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { TYPOGRAPHY, TYPOGRAPHY_COMBINATIONS } from '../utils/typography';

const AccountManager = ({ onAccountCreated, isSetupMode = false }) => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'other',
    balance: '',
    description: '',
    currency: 'INR',
    notes: ''
  });

  // Account type options with better icons
  const accountTypes = [
    { value: 'checking', label: 'Checking Account', icon: '🏦', color: 'blue' },
    { value: 'savings', label: 'Savings Account', icon: '💰', color: 'emerald' },
    { value: 'credit', label: 'Credit Card', icon: '💳', color: 'purple' },
    { value: 'investment', label: 'Investment Account', icon: '📈', color: 'indigo' },
    { value: 'cash', label: 'Cash', icon: '💵', color: 'amber' },
    { value: 'other', label: 'Other', icon: '📁', color: 'gray' }
  ];

  // Currency options
  const currencies = [
    { value: 'INR', label: 'Indian Rupee (₹)' },
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' }
  ];

  useEffect(() => {
    if (user && user._id) {
      fetchAccounts();
    }
  }, [user]);

  const fetchAccounts = async () => {
    try {
      if (!user || !user._id) {
        setError('User not authenticated');
        return;
      }
      
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch(`${API_ENDPOINTS.USERS(user._id)}/accounts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }

      const data = await response.json();
      setAccounts(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'other',
      balance: '',
      description: '',
      currency: 'INR',
      notes: ''
    });
    setEditingAccount(null);
    setShowCreateForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const url = editingAccount 
        ? `${API_ENDPOINTS.USERS(user._id)}/accounts/${editingAccount._id}`
        : `${API_ENDPOINTS.USERS(user._id)}/accounts`;
      
      const method = editingAccount ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save account');
      }

      await fetchAccounts();
      resetForm();
      
      // In setup mode, don't auto-advance - let user add more accounts
      // The continue button will call onAccountCreated when ready
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance.toString(),
      description: account.description || '',
      currency: account.currency,
      notes: account.notes || ''
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (accountId) => {
    if (!window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch(`${API_ENDPOINTS.USERS(user._id)}/accounts/${accountId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete account');
      }

      await fetchAccounts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSetDefault = async (accountId) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch(`${API_ENDPOINTS.USERS(user._id)}/accounts/${accountId}/default`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to set default account');
      }

      await fetchAccounts();
    } catch (err) {
      setError(err.message);
    }
  };

  const getAccountTypeColor = (type) => {
    const accountType = accountTypes.find(t => t.value === type);
    return accountType ? accountType.color : 'gray';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={TYPOGRAPHY.BODY_LG + " text-gray-600 dark:text-gray-400"}>Loading accounts...</p>
        </div>
      </div>
    );
  }

  if (!user || !user._id) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className={TYPOGRAPHY.H3 + " mb-3"}>Authentication Required</h3>
          <p className={TYPOGRAPHY.BODY_LG + " mb-6"}>Please log in to access your accounts</p>
        </div>
      </div>
    );
  }

  return (
    <div className={isSetupMode ? "" : "min-h-screen bg-gray-50 dark:bg-black"}>
      <div className={isSetupMode ? "" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"}>
        {/* Header Section - Only show description in non-setup mode */}
        {!isSetupMode && (
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your financial accounts and track balances
                </p>
              </div>
              {!showCreateForm && accounts.length > 0 && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Account
                </button>
              )}
            </div>
          </div>
        )}

        {/* Setup mode: Show add button when no accounts exist */}
        {isSetupMode && accounts.length === 0 && !showCreateForm && (
          <div className="text-center mb-8">
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-base font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Your First Account
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Account Summary Cards */}
        {accounts.length > 0 && (
          <div className={isSetupMode ? "mb-6" : "mb-8"}>
            {!isSetupMode && (
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Your Accounts ({accounts.length})
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Total Balance: ₹{accounts.reduce((sum, acc) => sum + acc.balance, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            )}
            
            {isSetupMode && (
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {accounts.length === 1 ? 'Your Account' : `Your Accounts (${accounts.length})`}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {accounts.length === 1 ? 'Great start! You can add more accounts if needed.' : 'Perfect! You can add more accounts or continue to the next step.'}
                </p>
              </div>
            )}
            
            <div className={`grid gap-4 ${isSetupMode ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
              {accounts.map(account => {
                const accountType = accountTypes.find(t => t.value === account.type);
                const typeColor = getAccountTypeColor(account.type);
                
                return (
                  <div key={account._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 group">
                    {/* Account Header */}
                    <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 bg-${typeColor}-100 dark:bg-${typeColor}-900/30 rounded-lg flex items-center justify-center`}>
                            <span className="text-lg">
                              {accountType?.icon || '📁'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {account.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                              {account.type} Account
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          {account.isDefault && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Default
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${typeColor}-100 dark:bg-${typeColor}-900/30 text-${typeColor}-800 dark:text-${typeColor}-300`}>
                            {account.currency}
                          </span>
                        </div>
                      </div>
                      
                      {/* Balance Display */}
                      <div className="mb-3">
                        <p className={`text-2xl font-bold ${
                          account.balance >= 0 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          ₹{account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                        {account.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {account.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Account Actions */}
                    <div className="p-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(account)}
                          className="flex-1 py-2 px-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                        >
                          Edit
                        </button>
                        {!account.isDefault && (
                          <>
                            <button
                              onClick={() => handleSetDefault(account._id)}
                              className="flex-1 py-2 px-3 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all duration-200"
                            >
                              Set Default
                            </button>
                            <button
                              onClick={() => handleDelete(account._id)}
                              className="flex-1 py-2 px-3 text-sm font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all duration-200"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Create/Edit Account Form */}
        {showCreateForm && (
          <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8 ${isSetupMode ? 'max-w-2xl mx-auto' : ''}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingAccount ? 'Edit Account' : 'Create New Account'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className={`grid gap-5 ${isSetupMode ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., Main Savings Account"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    {accountTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Initial Balance
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      name="balance"
                      value={formData.balance}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full pl-8 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    {currencies.map(currency => (
                      <option key={currency.value} value={currency.value}>
                        {currency.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Brief description of the account"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Additional notes about the account"
                />
              </div>

              <div className={`flex space-x-3 pt-6 ${isSetupMode ? 'border-t border-gray-200 dark:border-gray-700' : ''}`}>
                <button
                  type="submit"
                  className={`flex-1 ${isSetupMode ? 'py-3 px-6 text-base' : 'py-2.5 px-4 text-sm'} bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl ${isSetupMode ? 'transform hover:scale-105' : 'shadow-sm hover:shadow-md'}`}
                >
                  <span className="mr-2">🏦</span>
                  {editingAccount ? 'Update Account' : 'Create Account'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className={`flex-1 ${isSetupMode ? 'py-3 px-6 text-base' : 'py-2.5 px-4 text-sm'} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Create Account Button */}
        {!showCreateForm && accounts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">No accounts yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Create your first account to start tracking your finances</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-base font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Your First Account
            </button>
          </div>
        )}

        {/* Continue to Next Step button for setup mode */}
        {isSetupMode && accounts.length > 0 && (
          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
            <div className="text-center">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full mb-3">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Account{accounts.length === 1 ? '' : 's'} Created Successfully!
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You've set up {accounts.length} account{accounts.length === 1 ? '' : 's'}. 
                  {accounts.length === 1 ? ' You can add more accounts or continue to set up categories.' : ' You can add more accounts or continue to the next step.'}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-4 py-2.5 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 font-medium hover:shadow-md"
                >
                  <span className="mr-2">➕</span>
                  Add Another Account
                </button>
                <button
                  onClick={() => onAccountCreated && onAccountCreated()}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <span className="mr-2">🎯</span>
                  Continue to Categories
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AccountManager; 
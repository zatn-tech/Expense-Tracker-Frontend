import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { AuthContext } from '../context/AuthContext';
import { TYPOGRAPHY } from '../utils/typography';

const BalanceSettingsModal = ({ onClose, userId, accounts: dashboardAccounts, onUpdate }) => {
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    method: 'net_cash_flow',
    customAccountIds: [],
    showBreakdown: true
  });

  const balanceMethods = [
    {
      id: 'net_cash_flow',
      name: 'Net Cash Flow',
      description: 'Income minus expenses (current method)',
      icon: '📊'
    },
    {
      id: 'total_accounts',
      name: 'Total Account Balance',
      description: 'Sum of all your account balances',
      icon: '🏦'
    },
    {
      id: 'main_account',
      name: 'Main Account Balance',
      description: 'Balance of your primary/default account',
      icon: '⭐'
    },
    {
      id: 'liquid_balance',
      name: 'Liquid Balance',
      description: 'Sum of checking, savings, and current accounts',
      icon: '💳'
    },
    {
      id: 'investment_balance',
      name: 'Investment Balance',
      description: 'Sum of investment, stocks, and bonds accounts',
      icon: '📈'
    },
    {
      id: 'custom_accounts',
      name: 'Custom Accounts',
      description: 'Select specific accounts to include',
      icon: '🎯'
    }
  ];

  useEffect(() => {
    fetchUserPreferences();
  }, []);

  // Use accounts passed from dashboard instead of fetching again
  const accounts = dashboardAccounts || [];

  const fetchUserPreferences = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.USER_PROFILE(userId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.preferences?.balanceDisplay) {
        setPreferences(response.data.preferences.balanceDisplay);
      }
    } catch (error) {
      // Set default preferences if API call fails
      setPreferences({
        method: 'net_cash_flow',
        customAccountIds: [],
        showBreakdown: true
      });
    }
  };

  const handleMethodChange = (method) => {
    setPreferences(prev => ({
      ...prev,
      method,
      customAccountIds: method === 'custom_accounts' ? prev.customAccountIds : []
    }));
  };

  const handleAccountToggle = (accountId) => {
    setPreferences(prev => ({
      ...prev,
      customAccountIds: prev.customAccountIds.includes(accountId)
        ? prev.customAccountIds.filter(id => id !== accountId)
        : [...prev.customAccountIds, accountId]
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await axios.patch(
        API_ENDPOINTS.USER_BALANCE_PREFERENCES(userId),
        preferences,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      
      // Pass the new preferences back to parent for local update
      onUpdate(preferences);
      onClose();
    } catch (error) {
      alert('Failed to update preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className={TYPOGRAPHY.H2}>
            Balance Display Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Balance Method Selection */}
          <div>
            <h3 className={TYPOGRAPHY.H3 + " mb-4"}>
              Choose Balance Calculation Method
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {balanceMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleMethodChange(method.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    preferences.method === method.id
                      ? 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20'
                      : 'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{method.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {method.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {method.description}
                      </p>
                    </div>
                    {preferences.method === method.id && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Account Selection */}
          {preferences.method === 'custom_accounts' && (
            <div>
              <h3 className={TYPOGRAPHY.H3 + " mb-4"}>
                Select Accounts to Include
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {Array.isArray(accounts) && accounts.length > 0 ? (
                  accounts.map((account) => (
                    <label
                      key={account._id}
                      className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={preferences.customAccountIds.includes(account._id)}
                        onChange={() => handleAccountToggle(account._id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {account.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {account.type} • ₹{account.balance?.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </label>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8 text-gray-500 dark:text-gray-400">
                    {accounts.length === 0 ? 'No accounts found' : 'Loading accounts...'}
                  </div>
                )}
              </div>
              {preferences.customAccountIds.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Please select at least one account
                </p>
              )}
            </div>
          )}

          {/* Additional Options */}
          <div>
            <h3 className={TYPOGRAPHY.H3 + " mb-4"}>
              Additional Options
            </h3>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={preferences.showBreakdown}
                onChange={(e) => setPreferences(prev => ({ ...prev, showBreakdown: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700 dark:text-gray-300">
                Show balance breakdown details
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || (preferences.method === 'custom_accounts' && preferences.customAccountIds.length === 0)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BalanceSettingsModal; 
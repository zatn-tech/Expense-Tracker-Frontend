import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { TYPOGRAPHY } from '../utils/typography';

const AccountSelector = ({ 
  selectedAccountId, 
  onAccountChange, 
  required = false, 
  showBalance = true,
  className = "",
  disabled = false 
}) => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchAccounts();
    }
  }, [user]);

  const fetchAccounts = async () => {
    try {
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
      
      // Auto-select default account if none selected
      if (!selectedAccountId && data.data && data.data.length > 0) {
        const defaultAccount = data.data.find(acc => acc.isDefault);
        if (defaultAccount) {
          onAccountChange(defaultAccount._id);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountChange = (e) => {
    const accountId = e.target.value;
    onAccountChange(accountId);
  };

  const getSelectedAccount = () => {
    return accounts.find(acc => acc._id === selectedAccountId);
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <span className={TYPOGRAPHY.BODY_SM + " text-gray-500 dark:text-gray-400"}>Loading accounts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${TYPOGRAPHY.ERROR} ${className}`}>
        Error loading accounts: {error}
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className={`${TYPOGRAPHY.WARNING} ${className}`}>
        No accounts found. Please create an account first.
      </div>
    );
  }

  return (
    <div className={className}>
      <select
        value={selectedAccountId || ''}
        onChange={handleAccountChange}
        required={required}
        disabled={disabled}
        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all duration-200"
      >
        <option value="">Select an account</option>
        {accounts.map(account => (
          <option key={account._id} value={account._id}>
            {account.name} ({account.type})
            {account.isDefault && ' - Default'}
            {showBalance && ` - ₹${account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          </option>
        ))}
      </select>

      {showBalance && selectedAccountId && (
        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className={TYPOGRAPHY.BODY_SM + " font-medium text-gray-700 dark:text-gray-300"}>Current Balance:</span>
            <span className={`${TYPOGRAPHY.AMOUNT_SM} ${
              getSelectedAccount()?.balance >= 0 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-rose-600 dark:text-rose-400'
            }`}>
              ₹{getSelectedAccount()?.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          {getSelectedAccount()?.isDefault && (
            <div className="mt-2 flex items-center">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Default Account
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccountSelector; 
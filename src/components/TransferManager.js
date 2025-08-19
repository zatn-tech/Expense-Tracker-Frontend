import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { AuthContext } from '../context/AuthContext';
import { TYPOGRAPHY, TYPOGRAPHY_COMBINATIONS } from '../utils/typography';

const TransferManager = ({ onTransferComplete, accounts: dashboardAccounts, className = '' }) => {
  const { token, user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [formData, setFormData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    description: '',
    transferDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  // Use accounts passed from dashboard instead of fetching again
  const accounts = dashboardAccounts?.filter(account => account.isActive) || [];

 

  const validateTransfer = async () => {
    
    if (!formData.fromAccountId || !formData.toAccountId || !formData.amount) {
      
      setSafeErrors({ general: 'Please fill in all required fields' });
      return false;
    }

    if (formData.fromAccountId === formData.toAccountId) {
      
      setSafeErrors({ general: 'Cannot transfer to the same account' });
      return false;
    }

    if (parseFloat(formData.amount) <= 0) {
      
      setSafeErrors({ amount: 'Amount must be greater than 0' });
      return false;
    }

    // Check for reasonable transfer amount (max 1 billion)
    if (parseFloat(formData.amount) > 1000000000) {

      setSafeErrors({ amount: 'Amount cannot exceed 1 billion' });
      return false;
    }

    // Check for decimal places
    if (formData.amount.includes('.') && formData.amount.split('.')[1].length > 2) {
      
      setSafeErrors({ amount: 'Amount cannot have more than 2 decimal places' });
      return false;
    }

    setValidating(true);
  
  
    try {
      const validationData = {
        fromAccountId: formData.fromAccountId,
        toAccountId: formData.toAccountId,
        amount: parseFloat(formData.amount)
      };
      
      
      
      
      const response = await axios.post(API_ENDPOINTS.TRANSFER_VALIDATE, validationData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      

      if (response.data.status === 'success') {
        
        setSafeErrors({});
        
        return true;
      }
    } catch (error) {
    
      let errorMessage = 'Transfer validation failed';
      
      
      
      if (error.response?.data?.error) {
        if (typeof error.response.data.error === 'string') {
          errorMessage = error.response.data.error;
          
        } else if (error.response.data.error.message) {
          errorMessage = error.response.data.error.message;
          
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
          
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        
      }
      
      setSafeErrors({ general: errorMessage });
      
      return false;
    } finally {
      setValidating(false);
      
    }

    
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setSafeErrors({});
    setSuccess('');

    const isValid = await validateTransfer();
    if (!isValid) return;

    setLoading(true);
   
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries) {
   
      try {
            const transferData = {
      ...formData,
      amount: parseFloat(formData.amount)
    };
    
   
    
    const response = await axios.post(API_ENDPOINTS.TRANSFERS, transferData, {
      headers: { Authorization: `Bearer ${token}` }
    });

        if (response.data.status === 'success') {
   
          setSuccess('Transfer completed successfully!');
   
          const resetFormData = {
            fromAccountId: '',
            toAccountId: '',
            amount: '',
            description: '',
            transferDate: new Date().toISOString().split('T')[0],
            notes: ''
          };
   
          setFormData(resetFormData);
          
          if (onTransferComplete) {
   
            onTransferComplete(response.data.data);
          }
          break; // Success, exit retry loop
        }
      } catch (error) {
   
        let errorMessage = 'Failed to complete transfer';
        
        
        
        if (error.response?.data?.error) {
          if (typeof error.response.data.error === 'string') {
            errorMessage = error.response.data.error;

          } else if (error.response.data.error.message) {
            errorMessage = error.response.data.error.message;
            
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
            
          }
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
          
        }

        // If it's a retryable error and we haven't exceeded max retries
        
        
        if (errorMessage.includes('try again') && retryCount < maxRetries) {
          retryCount++;
        
          setSafeErrors({ general: `Transfer attempt ${retryCount} failed, retrying...` });
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          continue;
        } else {
          console.log(`Transfer failed after ${retryCount + 1} attempts`);
        }
        
        setSafeErrors({ general: errorMessage });
        break; // Exit retry loop on non-retryable error or max retries reached
      }
    }
    
    setLoading(false);
    };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
    
      setSafeErrors({ ...errors, [name]: '' });
    }
    if (errors.general) {
    
      setSafeErrors({ ...errors, general: '' });
    }
  };

  const getAccountBalance = (accountId) => {
    const account = accounts.find(acc => acc._id === accountId);
    const balance = account ? account.balance : 0;
    
    return balance;
  };

  const getAccountCurrency = (accountId) => {
    const account = accounts.find(acc => acc._id === accountId);
    const currency = account ? account.currency : 'INR';
    
    return currency;
  };

  // Safety function to ensure errors are always strings
  const setSafeErrors = (errorObj) => {
    const safeErrors = {};
    Object.keys(errorObj).forEach(key => {
      if (typeof errorObj[key] === 'string') {
        safeErrors[key] = errorObj[key];
      } else {
        safeErrors[key] = 'An error occurred';
      }
    });
    setErrors(safeErrors);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 ${className}`}>
      <div className="mb-6">
        <h3 className={TYPOGRAPHY_COMBINATIONS.cardHeader.title}>Transfer Between Accounts</h3>
        <p className={TYPOGRAPHY.BODY_SM + " text-gray-600 dark:text-gray-400 mt-2"}>
          Move funds between your accounts securely
        </p>
      </div>

      {success && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-green-500 mr-2">✅</span>
            <span className="text-green-700 dark:text-green-300 text-sm">{success}</span>
          </div>
        </div>
      )}

      {errors.general && typeof errors.general === 'string' && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">❌</span>
            <span className="text-red-700 dark:text-red-300 text-sm">{errors.general}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* From Account */}
          <div>
            <label className={TYPOGRAPHY.BODY_SM + " font-medium text-gray-700 dark:text-gray-300 block mb-2"}>
              From Account *
            </label>
            <select
              name="fromAccountId"
              value={formData.fromAccountId}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
              onFocus={() => console.log('From account select focused')}
            >
              <option value="">Select source account</option>
              {accounts.map(account => (
                <option key={account._id} value={account._id}>
                  {account.name} - ₹{account.balance.toLocaleString('en-IN')} ({account.currency})
                </option>
              ))}
            </select>
            {formData.fromAccountId && (
              <p className={TYPOGRAPHY.BODY_XS + " text-gray-500 dark:text-gray-400 mt-1"}>
                Available: ₹{getAccountBalance(formData.fromAccountId).toLocaleString('en-IN')} {getAccountCurrency(formData.fromAccountId)}
              </p>
            )}
          </div>

          {/* To Account */}
          <div>
            <label className={TYPOGRAPHY.BODY_SM + " font-medium text-gray-700 dark:text-gray-300 block mb-2"}>
              To Account *
            </label>
            <select
              name="toAccountId"
              value={formData.toAccountId}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
              onFocus={() => console.log('To account select focused')}
            >
              <option value="">Select destination account</option>
              {accounts
                .filter(account => account._id !== formData.fromAccountId)
                .map(account => (
                  <option key={account._id} value={account._id}>
                    {account.name} - ₹{account.balance.toLocaleString('en-IN')} ({account.currency})
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Amount */}
          <div>
            <label className={TYPOGRAPHY.BODY_SM + " font-medium text-gray-700 dark:text-gray-300 block mb-2"}>
              Amount *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                ₹
              </span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                className="w-full pl-8 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
                onFocus={() => console.log('Amount input focused')}
                onBlur={() => console.log('Amount input blurred, value:', formData.amount)}
              />
            </div>
            {errors.amount && typeof errors.amount === 'string' && (
              <p className={TYPOGRAPHY.BODY_XS + " text-red-500 mt-1"}>{errors.amount}</p>
            )}
          </div>

          {/* Transfer Date */}
          <div>
            <label className={TYPOGRAPHY.BODY_SM + " font-medium text-gray-700 dark:text-gray-300 block mb-2"}>
              Transfer Date
            </label>
            <input
              type="date"
              name="transferDate"
              value={formData.transferDate}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={TYPOGRAPHY.BODY_SM + " font-medium text-gray-700 dark:text-gray-300 block mb-2"}>
            Description
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="e.g., Moving savings to investment account"
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Notes */}
        <div>
          <label className={TYPOGRAPHY.BODY_SM + " font-medium text-gray-700 dark:text-gray-300 block mb-2"}>
            Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Additional notes about this transfer..."
            rows="3"
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || validating}
            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => console.log('Submit button clicked, loading:', loading, 'validating:', validating)}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : validating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Validating...
              </>
            ) : (
              <>
                <span className="mr-2">💸</span>
                Complete Transfer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransferManager; 
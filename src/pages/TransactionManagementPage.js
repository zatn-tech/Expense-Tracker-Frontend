import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import TransactionManager from '../components/TransactionManager';

function TransactionManagementPage() {
  const { userId } = useParams();
  const { token, user } = useContext(AuthContext);

  // Security check: Ensure user can only access their own data
  useEffect(() => {
    if (user && userId !== user._id) {
      window.location.href = `/user/${user._id}/transactions`;
      return;
    }
  }, [userId, user]);

  const handleTransactionsUpdated = () => {
    // Transaction updates are handled within the TransactionManager component
    // No need to refresh other data
  };

  const handleClose = () => {
    // Navigate back to dashboard
    window.location.href = `/user/${userId}/dashboard`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and bulk operate on your transactions</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <TransactionManager 
          onClose={handleClose} 
          onTransactionsUpdated={handleTransactionsUpdated}
        />
      </div>
    </div>
  );
}

export default TransactionManagementPage; 
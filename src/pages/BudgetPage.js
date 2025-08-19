import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import BudgetManager from '../components/BudgetManager';

function BudgetPage() {
  const { userId } = useParams();
  const { token, user } = useContext(AuthContext);

  // Security check: Ensure user can only access their own data
  useEffect(() => {
    if (user && userId !== user._id) {
      window.location.href = `/user/${user._id}/budgets`;
      return;
    }
  }, [userId, user]);

  const handleBudgetUpdated = () => {
    // Budget updates are handled within the BudgetManager component
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
        <div className="px-3 lg:px-6 py-4">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Budget Management</h2>
          <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1">Create and manage your spending budgets</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-2 lg:p-6">
        <BudgetManager 
          onClose={handleClose} 
          onBudgetUpdated={handleBudgetUpdated}
        />
      </div>
    </div>
  );
}

export default BudgetPage; 
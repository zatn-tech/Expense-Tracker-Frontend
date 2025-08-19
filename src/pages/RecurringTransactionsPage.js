import React, { useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import RecurringTransactionManager from '../components/RecurringTransactionManager';

function RecurringTransactionsPage() {
  const { userId } = useParams();
  const { user } = useContext(AuthContext);

  // Security check: Ensure user can only access their own data
  useEffect(() => {
    if (user && userId !== user._id) {
      window.location.href = `/user/${user._id}/recurring-transactions`;
      return;
    }
  }, [userId, user]);

  const handleRecurringTransactionUpdated = () => {
    // Handle any updates if needed
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <div className="bg-white dark:bg-black shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recurring Transactions</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Automate your regular income and expenses</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <RecurringTransactionManager 
          onRecurringTransactionUpdated={handleRecurringTransactionUpdated}
        />
      </div>
    </div>
  );
}

export default RecurringTransactionsPage; 
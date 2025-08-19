import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Reports from '../components/Reports';

function ReportsPage() {
  const { userId } = useParams();
  const { token, user } = useContext(AuthContext);

  const handleClose = () => {
    // Navigate back to dashboard
    window.location.href = `/user/${userId}/dashboard`;
  };

  // Security check: Ensure user can only access their own data
  useEffect(() => {
    if (user && userId !== user._id) {
      window.location.href = `/user/${user._id}/reports`;
      return;
    }
  }, [userId, user]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 lg:px-6 py-4">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h2>
          <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1">View detailed reports and analytics</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-2 lg:p-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-2 lg:p-6">
          <Reports onClose={handleClose} />
        </div>
      </div>
    </div>
  );
}

export default ReportsPage; 
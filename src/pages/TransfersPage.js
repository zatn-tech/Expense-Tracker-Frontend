import React, { useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import TransferManager from '../components/TransferManager';
import TransferHistory from '../components/TransferHistory';
import { TYPOGRAPHY, TYPOGRAPHY_COMBINATIONS } from '../utils/typography';

const TransfersPage = () => {
  const { userId } = useParams();
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('transfer'); // 'transfer' or 'history'
  const [refreshKey, setRefreshKey] = useState(0);

  // Security check: Ensure user can only access their own page
  if (user && userId !== user._id) {
    window.location.href = `/user/${user._id}/transfers`;
    return null;
  }

  const handleTransferComplete = (transferData) => {
    // Refresh the transfer history
    setRefreshKey(prev => prev + 1);
    // Switch to history tab to show the new transfer
    setActiveTab('history');
  };

  const handleTransferUpdate = (transferData) => {
    // Refresh the transfer history
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className={TYPOGRAPHY_COMBINATIONS.pageHeader.container}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className={TYPOGRAPHY_COMBINATIONS.pageHeader.title}>
                Account Transfers
              </h1>
              <p className={TYPOGRAPHY_COMBINATIONS.pageHeader.subtitle}>
                Move funds between your accounts and track transfer history
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('transfer')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'transfer'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2">💸</span>
                New Transfer
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2">📊</span>
                Transfer History
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {activeTab === 'transfer' ? (
            <TransferManager onTransferComplete={handleTransferComplete} />
          ) : (
            <TransferHistory 
              key={refreshKey}
              onTransferUpdate={handleTransferUpdate}
            />
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className={TYPOGRAPHY_COMBINATIONS.cardHeader.title}>Transfer Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  💸
                </div>
                <p className={TYPOGRAPHY.BODY_SM + " text-gray-600 dark:text-gray-400"}>
                  Quick transfers between accounts
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  🔒
                </div>
                <p className={TYPOGRAPHY.BODY_SM + " text-gray-600 dark:text-gray-400"}>
                  Secure and atomic operations
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  📈
                </div>
                <p className={TYPOGRAPHY.BODY_SM + " text-gray-600 dark:text-gray-400"}>
                  Complete audit trail
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransfersPage; 
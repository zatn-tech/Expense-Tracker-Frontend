import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ImportTransactions from '../components/ImportTransactions';
import ImportManager from '../components/ImportManager';
import ExportData from '../components/ExportData';

function ImportPage() {
  const { userId } = useParams();
  const { token, user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('import'); // import, export, history

  // Security check: Ensure user can only access their own data
  useEffect(() => {
    if (user && userId !== user._id) {
      window.location.href = `/user/${user._id}/import`;
      return;
    }
  }, [userId, user]);

  const handleImportSuccess = () => {
    // Import success is handled within the ImportTransactions component
  };

  const handleImportDeleted = () => {
    // Import deletion is handled within the ImportManager component
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Import & Export</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Import, export, and manage your transaction data</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('import')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'import'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Import Data
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'export'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Export Data
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Import History
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'import' && (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
              <ImportTransactions 
                onClose={handleClose} 
                onImportSuccess={handleImportSuccess}
              />
            </div>
          )}
          
          {activeTab === 'export' && (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
              <ExportData 
                onClose={handleClose}
              />
            </div>
          )}
          
          {activeTab === 'history' && (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
              <ImportManager 
                onClose={handleClose} 
                onImportDeleted={handleImportDeleted}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImportPage; 
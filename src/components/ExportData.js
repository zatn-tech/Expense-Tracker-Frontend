// src/components/ExportData.js
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function ExportData({ onClose }) {
  const { userId } = useParams();
  const { token, user } = useContext(AuthContext);
  const [exporting, setExporting] = useState({
    json: false,
    archive: false,
    csv: false
  });
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const exportOptions = [
    {
      id: 'json',
      title: 'Complete Data (JSON)',
      description: 'All your data in JSON format - profile, transactions, and settings',
      icon: '📋',
      size: 'Small',
      format: 'JSON',
      includes: ['Profile information', 'All transactions', 'Account preferences', 'Usage statistics']
    },
    {
      id: 'archive',
      title: 'Complete Archive (ZIP)',
      description: 'Everything in multiple formats - most comprehensive option',
      icon: '📦',
      size: 'Medium',
      format: 'ZIP Archive',
      includes: ['Profile (JSON)', 'Transactions (CSV & JSON)', 'Summary report (TXT)', 'README file']
    },
    {
      id: 'csv',
      title: 'Transactions Only (CSV)',
      description: 'Transaction data in spreadsheet format with date range selection',
      icon: '📊',
      size: 'Small',
      format: 'CSV',
      includes: ['Transaction details', 'Custom date range', 'Spreadsheet compatible']
    }
  ];

  const handleExport = async (type) => {
    console.log('Exporting:', type); // Debug log
    setExporting({ ...exporting, [type]: true });
    
    try {
      let endpoint, filename, responseType = 'blob';
      const params = {};

      switch (type) {
        case 'json':
          endpoint = API_ENDPOINTS.USER_EXPORT_ALL_DATA(userId);
          filename = `user-data-${user?.email}-${Date.now()}.json`;
          responseType = 'json';
          break;
        case 'archive':
          endpoint = API_ENDPOINTS.USER_EXPORT_ARCHIVE(userId);
          filename = `complete-export-${user?.email}-${Date.now()}.zip`;
          break;
        case 'csv':
          endpoint = API_ENDPOINTS.USER_EXPORT_TRANSACTIONS_CSV(userId);
          filename = `transactions-${user?.email}-${Date.now()}.csv`;
          if (dateRange.startDate) params.startDate = dateRange.startDate;
          if (dateRange.endDate) params.endDate = dateRange.endDate;
          break;
        default:
          throw new Error('Invalid export type');
      }

      console.log('Making request to:', endpoint); // Debug log

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        params,
        responseType
      });

      console.log('Response received:', response); // Debug log

      if (responseType === 'json') {
        // For JSON, create blob from the response
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { 
          type: 'application/json' 
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        // For blob responses
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }

      // Show success message
      alert('Your data has been exported successfully!');

    } catch (err) {
      console.error(`${type} export error:`, err);
      alert(`Error exporting data: ${err.response?.data?.error || err.message}`);
    } finally {
      setExporting({ ...exporting, [type]: false });
    }
  };

  return (
            <div className="bg-white dark:bg-black rounded-xl shadow-2xl w-full">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">📥</span>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Export Your Data</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Download your personal data</p>
          </div>
        </div>
      </div>

        <div className="p-6 space-y-6">
          {/* Privacy Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <span className="text-xl">🔒</span>
              <div>
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300">Privacy & Security</h3>
                <p className="text-sm text-blue-800 dark:text-blue-400 mt-1">
                  Your exported data contains sensitive information. Keep files secure.
                </p>
              </div>
            </div>
          </div>

          {/* Date Range for CSV Export */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Date Range (for CSV Export)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Choose Export Format</h3>
            
            {exportOptions.map((option) => (
              <div
                key={option.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{option.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{option.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{option.description}</p>
                      <div className="mt-1 text-xs text-gray-500">
                        Format: {option.format} • Size: {option.size}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleExport(option.id)}
                    disabled={exporting[option.id]}
                    className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg font-medium transition-all duration-200 ${
                      exporting[option.id]
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700 text-white focus:outline-none focus:ring-2 focus:ring-primary-500'
                    }`}
                  >
                    {exporting[option.id] ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Exporting...
                      </>
                    ) : (
                      <>
                        <span className="mr-1">📥</span>
                        Export
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
  );
}

export default ExportData;

import React, { useState, useContext } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { triggerBudgetBrowserNotification } from '../utils/budgetNotificationTrigger';

function ImportTransactions({ onClose, onImportSuccess }) {
  const { userId } = useParams();
  const { token } = useContext(AuthContext);
  const { showSuccess, showError, showWarning } = useNotification();
  const [importing, setImporting] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState('csv');
  const [importResult, setImportResult] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState('');

  const importOptions = [
    {
      id: 'csv',
      title: 'CSV File',
      description: 'Import transactions from a CSV file',
      icon: '📊',
      format: 'CSV',
      acceptedTypes: '.csv',
      example: `amount,type,category,description,transactionDate,paymentMethod,tags
100,expense,Food & Dining,Lunch,2024-01-15,cash,"lunch,work"
500,income,Salary,Monthly salary,2024-01-01,bank_transfer,"salary,monthly"`
    },
    {
      id: 'json',
      title: 'JSON File',
      description: 'Import transactions from a JSON file',
      icon: '📋',
      format: 'JSON',
      acceptedTypes: '.json',
      example: `[
  {
    "amount": 100,
    "type": "expense",
    "category": "Food & Dining",
    "description": "Lunch",
    "transactionDate": "2024-01-15",
    "paymentMethod": "cash",
    "tags": ["lunch", "work"]
  },
  {
    "amount": 500,
    "type": "income",
    "category": "Salary",
    "description": "Monthly salary",
    "transactionDate": "2024-01-01",
    "paymentMethod": "bank_transfer",
    "tags": ["salary", "monthly"]
  }
]`
    }
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      setImportResult(null);
    }
  };

  const handlePreview = async () => {
    if (!selectedFile) {
      setError('Please select a file to preview');
      return;
    }

    setPreviewing(true);
    setError('');
    setPreviewData(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('fileType', fileType);

      const endpoint = API_ENDPOINTS.USER_TRANSACTIONS_IMPORT_PREVIEW(userId);
      
      const response = await axios.post(endpoint, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setPreviewData(response.data);
    } catch (err) {
      console.error('Preview error:', err);
      setError(err.response?.data?.error || 'Failed to preview transactions');
    } finally {
      setPreviewing(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a file to import');
      return;
    }

    setImporting(true);
    setError('');
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const endpoint = API_ENDPOINTS.USER_TRANSACTIONS_IMPORT(userId, fileType);
      
      const response = await axios.post(endpoint, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setImportResult(response.data);
      
      // Show success message
      showSuccess(`Successfully imported ${response.data.imported} transactions!`);
      
      // Handle budget alerts from import
      if (response.data.budgetAlerts && response.data.budgetAlerts.length > 0) {
        response.data.budgetAlerts.forEach(alert => {
          // Show in-app notification
          if (alert.type === 'error') {
            showError(alert.message);
          } else {
            showWarning(alert.message);
          }
          
          // Trigger browser notification
          triggerBudgetBrowserNotification(alert);
        });
      }
      
      // Call the success callback to refresh the transaction list
      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (err) {
      console.error('Import error:', err);
      setError(err.response?.data?.error || 'Failed to import transactions');
    } finally {
      setImporting(false);
    }
  };

  const handleFileTypeChange = (type) => {
    setFileType(type);
    setSelectedFile(null);
    setError('');
    setImportResult(null);
  };

  const resetForm = () => {
    setSelectedFile(null);
    setFileType('csv');
    setImportResult(null);
    setPreviewData(null);
    setError('');
  };

  const downloadTemplate = async () => {
    try {
      const response = await axios.get(
        `${API_ENDPOINTS.USER_TRANSACTIONS_TEMPLATE(userId, fileType)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sample-transactions.${fileType}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download template:', error);
      // Fallback to client-side template
      const option = importOptions.find(opt => opt.id === fileType);
      const blob = new Blob([option.example], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `template.${fileType}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }
  };

  return (
            <div className="bg-white dark:bg-black rounded-lg shadow-xl w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
  
          <p className="text-gray-600 dark:text-gray-400 mt-1">Upload your transaction data from CSV or JSON files</p>
        </div>
      </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* File Type Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Choose File Format</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {importOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleFileTypeChange(option.id)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    fileType === option.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{option.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{option.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{option.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upload File</h3>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input
                type="file"
                accept={importOptions.find(opt => opt.id === fileType)?.acceptedTypes}
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer block"
              >
                <div className="text-4xl mb-4">📁</div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {selectedFile ? selectedFile.name : 'Click to select file'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  or drag and drop your {fileType.toUpperCase()} file here
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Maximum file size: 5MB
                </p>
              </label>
            </div>
          </div>

          {/* Template Download */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Need a template?</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Download a sample {fileType.toUpperCase()} file to see the required format
            </p>
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Template
            </button>
          </div>

          {/* Preview Section */}
          {previewData && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Preview Results</h4>
              
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-white dark:bg-black rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                  <div className="text-xs text-blue-600 dark:text-blue-400">Total</div>
                  <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">{previewData.totalCount}</div>
                </div>
                <div className="bg-white dark:bg-black rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                  <div className="text-xs text-green-600 dark:text-green-400">Income</div>
                  <div className="text-lg font-semibold text-green-700 dark:text-green-300">{previewData.summary.income}</div>
                </div>
                <div className="bg-white dark:bg-black rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                  <div className="text-xs text-red-600 dark:text-red-400">Expenses</div>
                  <div className="text-lg font-semibold text-red-700 dark:text-red-300">{previewData.summary.expense}</div>
                </div>
                <div className="bg-white dark:bg-black rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                  <div className="text-xs text-gray-600 dark:text-gray-400">Total Amount</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    ₹{previewData.summary.totalAmount.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Preview Transactions */}
              <div>
                <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Sample Transactions (showing first {previewData.preview.length})
                </h5>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {previewData.preview.map((transaction, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white dark:bg-black rounded-lg p-2 border border-blue-200 dark:border-blue-700"
                    >
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${
                          transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {transaction.category}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {transaction.description || 'No description'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-semibold ${
                          transaction.type === 'income' 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(transaction.transactionDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Errors */}
              {previewData.errors && previewData.errors.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                    Errors Found ({previewData.errorCount})
                  </h5>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 max-h-32 overflow-y-auto">
                    {previewData.errors.map((error, index) => (
                      <div key={index} className="text-xs text-red-700 dark:text-red-300 mb-1">
                        Row {error.row}: {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Import Error</h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Display */}
          {importResult && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Import Successful!</h3>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    {importResult.message}
                  </p>
                  {importResult.errors && importResult.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-green-600 dark:text-green-400">
                        {importResult.errors.length} rows had errors and were skipped.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={resetForm}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Reset
          </button>
          <div className="flex space-x-3">
            <button
              onClick={handlePreview}
              disabled={!selectedFile || previewing}
              className="px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {previewing ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Previewing...
                </div>
              ) : (
                'Preview'
              )}
            </button>
            <button
              onClick={handleImport}
              disabled={!selectedFile || importing}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {importing ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Importing...
                </div>
              ) : (
                'Import Transactions'
              )}
            </button>
          </div>
        </div>
      </div>
  );
}

export default ImportTransactions; 
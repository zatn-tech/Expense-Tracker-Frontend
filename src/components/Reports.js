import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Reports({ onClose }) {
  const { userId } = useParams();
  const { token } = useContext(AuthContext);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState({ pdf: false, excel: false });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      };
      
      const res = await axios.get(API_ENDPOINTS.USER_EXPORT_SUMMARY(userId), {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      
      setReportData(res.data);
    } catch (err) {
      alert('Error loading report data: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    setExporting({ ...exporting, pdf: true });
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      };
      
      const response = await axios.get(API_ENDPOINTS.USER_EXPORT_PDF(userId), {
        headers: { Authorization: `Bearer ${token}` },
        params,
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expense-report-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 lg:px-6 py-3 rounded-lg shadow-lg z-50 flex items-center text-sm lg:text-base';
      successMsg.innerHTML = '<span class="mr-2">📄</span>PDF report downloaded successfully!';
      document.body.appendChild(successMsg);
      setTimeout(() => document.body.removeChild(successMsg), 3000);

    } catch (err) {
      alert('Error exporting to PDF: ' + (err.response?.data?.error || err.message));
    } finally {
      setExporting({ ...exporting, pdf: false });
    }
  };

  const exportToExcel = async () => {
    setExporting({ ...exporting, excel: true });
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      };
      
      const response = await axios.get(API_ENDPOINTS.USER_EXPORT_EXCEL(userId), {
        headers: { Authorization: `Bearer ${token}` },
        params,
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expense-report-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 lg:px-6 py-3 rounded-lg shadow-lg z-50 flex items-center text-sm lg:text-base';
      successMsg.innerHTML = '<span class="mr-2">📊</span>Excel report downloaded successfully!';
      document.body.appendChild(successMsg);
      setTimeout(() => document.body.removeChild(successMsg), 3000);

    } catch (err) {
      alert('Error exporting to Excel: ' + (err.response?.data?.error || err.message));
    } finally {
      setExporting({ ...exporting, excel: false });
    }
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-black rounded-xl p-6 lg:p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="text-gray-600 dark:text-gray-400 text-center">Generating your report...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black rounded-xl shadow-2xl w-full">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-700/50 px-4 lg:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xl lg:text-2xl">📊</span>
          <div>

            <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">View and export your transaction data</p>
          </div>
        </div>
      </div>

      <div className="p-2 lg:p-6 space-y-3 lg:space-y-6">
        {/* Date Range Selector */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 lg:p-4">
          <h3 className="text-sm lg:text-lg font-medium text-gray-900 dark:text-white mb-3">Report Period</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
            <div>
              <label className="block text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-full px-2 lg:px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs lg:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-full px-2 lg:px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs lg:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {reportData && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 lg:p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm font-medium text-green-800 dark:text-green-300">Income</p>
                    <p className="text-sm lg:text-2xl font-bold text-green-900 dark:text-green-100">
                      {formatCurrency(reportData.summary.totalIncome)}
                    </p>
                  </div>
                  <span className="text-lg lg:text-2xl">💰</span>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 lg:p-4 border border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm font-medium text-red-800 dark:text-red-300">Expenses</p>
                    <p className="text-sm lg:text-2xl font-bold text-red-900 dark:text-red-100">
                      {formatCurrency(reportData.summary.totalExpenses)}
                    </p>
                  </div>
                  <span className="text-lg lg:text-2xl">💸</span>
                </div>
              </div>

              <div className={`rounded-lg p-2 lg:p-4 border ${
                reportData.summary.balance >= 0
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs lg:text-sm font-medium ${
                      reportData.summary.balance >= 0
                        ? 'text-blue-800 dark:text-blue-300'
                        : 'text-orange-800 dark:text-orange-300'
                    }`}>Balance</p>
                    <p className={`text-sm lg:text-2xl font-bold ${
                      reportData.summary.balance >= 0
                        ? 'text-blue-900 dark:text-blue-100'
                        : 'text-orange-900 dark:text-orange-100'
                    }`}>
                      {formatCurrency(reportData.summary.balance)}
                    </p>
                  </div>
                  <span className="text-lg lg:text-2xl">{reportData.summary.balance >= 0 ? '📈' : '📉'}</span>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 lg:p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm font-medium text-gray-800 dark:text-gray-300">Count</p>
                    <p className="text-sm lg:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {reportData.summary.transactionCount}
                    </p>
                  </div>
                  <span className="text-lg lg:text-2xl">📝</span>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 lg:p-6">
              <h3 className="text-sm lg:text-lg font-medium text-gray-900 dark:text-white mb-3">Category Breakdown</h3>
              <div className="space-y-2 lg:space-y-3">
                {Object.entries(reportData.categoryBreakdown).map(([category, data]) => (
                  <div key={category} className="flex flex-col space-y-1 lg:space-y-0 p-2 lg:p-3 bg-white dark:bg-black rounded-lg">
                    <span className="font-medium text-gray-900 dark:text-white text-xs lg:text-base">{category}</span>
                    <div className="flex flex-col space-y-1 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4 text-xs lg:text-sm">
                      {data.income > 0 && (
                        <span className="text-green-600 dark:text-green-400">
                          +{formatCurrency(data.income)}
                        </span>
                      )}
                      {data.expense > 0 && (
                        <span className="text-red-600 dark:text-red-400">
                          -{formatCurrency(data.expense)}
                        </span>
                      )}
                      <span className={`font-medium ${
                        data.total >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatCurrency(Math.abs(data.total))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Buttons */}
            <div className="flex flex-col gap-2 lg:gap-4 pt-3 lg:pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={exportToPDF}
                disabled={exporting.pdf}
                className={`flex-1 inline-flex items-center justify-center px-3 lg:px-6 py-2.5 lg:py-3 border border-transparent rounded-lg text-white font-medium transition-all duration-200 text-sm lg:text-base ${
                  exporting.pdf
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                }`}
              >
                {exporting.pdf ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Exporting PDF...
                  </>
                ) : (
                  <>
                    <span className="mr-2">📄</span>
                    Export to PDF
                  </>
                )}
              </button>

              <button
                onClick={exportToExcel}
                disabled={exporting.excel}
                className={`flex-1 inline-flex items-center justify-center px-3 lg:px-6 py-2.5 lg:py-3 border border-transparent rounded-lg text-white font-medium transition-all duration-200 text-sm lg:text-base ${
                  exporting.excel
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                }`}
              >
                {exporting.excel ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Exporting Excel...
                  </>
                ) : (
                  <>
                    <span className="mr-2">📊</span>
                    Export to Excel
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Reports;

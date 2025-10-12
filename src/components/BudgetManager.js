import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useConfirmation } from '../hooks/useConfirmation';
import ConfirmationDialog from './ui/ConfirmationDialog';
import AddBudget from './AddBudget';
import EditBudget from './EditBudget';

function BudgetManager({ onClose, onBudgetUpdated }) {
  const { userId } = useParams();
  const { token } = useContext(AuthContext);
  const { showSuccess, showError } = useNotification();
  const { confirmation, showConfirmation, hideConfirmation } = useConfirmation();
  
  const [budgets, setBudgets] = useState([]);
  const [budgetStats, setBudgetStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  useEffect(() => {
    fetchBudgetData();
  }, [userId, token, selectedPeriod]);

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch budgets, stats, and alerts in parallel
      const [budgetsResponse, statsResponse, alertsResponse] = await Promise.all([
        axios.get(API_ENDPOINTS.USER_BUDGETS(userId), {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(API_ENDPOINTS.USER_BUDGETS_STATS_OVERVIEW(userId, selectedPeriod), {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(API_ENDPOINTS.USER_BUDGETS_ALERTS(userId), {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setBudgets(budgetsResponse.data);
      setBudgetStats(statsResponse.data);
      setAlerts(alertsResponse.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetCreated = () => {
    setShowAddBudget(false);
    fetchBudgetData();
    if (onBudgetUpdated) {
      onBudgetUpdated();
    }
  };

  const handleBudgetUpdated = () => {
    setEditingBudget(null);
    fetchBudgetData();
    if (onBudgetUpdated) {
      onBudgetUpdated();
    }
  };

  const handleBudgetDeleted = async (budgetId) => {
    showConfirmation({
      title: 'Delete Budget',
      message: 'Are you sure you want to delete this budget? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(API_ENDPOINTS.USER_BUDGETS_UPDATE(userId, budgetId), {
            headers: { Authorization: `Bearer ${token}` }
          });

          fetchBudgetData();
          if (onBudgetUpdated) {
            onBudgetUpdated();
          }
          
          showSuccess('Budget deleted successfully!');
        } catch (err) {
          showError(err.response?.data?.error || 'Failed to delete budget');
        }
      }
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProgressColor = (percentage, isExceeded) => {
    if (isExceeded) return 'bg-red-500';
    if (percentage >= 90) return 'bg-red-400';
    if (percentage >= 80) return 'bg-yellow-500';
    if (percentage >= 60) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getBudgetTypeIcon = (type) => {
    switch (type) {
      case 'monthly': return '📅';
      case 'yearly': return '📊';
      case 'category': return '🏷️';
      case 'custom': return '⚙️';
      default: return '💰';
    }
  };

  return (
    <div className="bg-white dark:bg-black rounded-xl shadow-2xl w-full">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-700/50 px-3 lg:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xl lg:text-2xl">💰</span>
          <div>
            <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Create and manage your spending budgets</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddBudget(true)}
          className="px-3 lg:px-4 py-2 lg:py-2.5 bg-blue-600 text-white text-sm lg:text-base rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>➕</span>
          <span className="hidden sm:inline">Add Budget</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      <div className="p-3 lg:p-6 space-y-4 lg:space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading budgets...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 text-lg mb-2">❌</div>
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={fetchBudgetData}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Period Selector */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 lg:p-4">
              <h3 className="text-base lg:text-lg font-medium text-gray-900 dark:text-white mb-3">Select Period</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'current', label: 'Current Month' },
                  { value: 'previous', label: 'Previous Month' },
                  { value: 'next', label: 'Next Month' }
                ].map((period) => (
                  <button
                    key={period.value}
                    onClick={() => setSelectedPeriod(period.value)}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      selectedPeriod === period.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Stats */}
            {budgetStats && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 lg:p-4">
                  <div className="text-xs lg:text-sm text-green-600 dark:text-green-400">Total Budget</div>
                  <div className="text-lg lg:text-2xl font-bold text-green-900 dark:text-green-100">
                    {formatCurrency(budgetStats.totalBudgetAmount)}
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 lg:p-4">
                  <div className="text-xs lg:text-sm text-yellow-600 dark:text-yellow-400">Total Spent</div>
                  <div className="text-lg lg:text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                    {formatCurrency(budgetStats.totalSpentAmount)}
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 lg:p-4">
                  <div className="text-xs lg:text-sm text-purple-600 dark:text-purple-400">Usage</div>
                  <div className="text-lg lg:text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {budgetStats.overallUsagePercentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            )}

            {/* Alerts Section */}
            {alerts.length > 0 && (
              <div className="mb-4 lg:mb-6">
                <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-3">⚠️ Budget Alerts</h3>
                <div className="space-y-2">
                  {alerts.map((alert, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        alert.isExceeded
                          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                          : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white text-sm lg:text-base">{alert.budgetName}</div>
                          <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">{alert.message}</div>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(alert.spentAmount)} / {formatCurrency(alert.budgetAmount)}
                          </div>
                          <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                            {alert.usagePercentage.toFixed(1)}% used
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Budgets List */}
            <div>
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Budgets</h3>
              
              {budgets.length === 0 ? (
                <div className="text-center py-8 lg:py-12">
                  <div className="text-4xl lg:text-6xl mb-4">💰</div>
                  <h3 className="text-base lg:text-lg font-medium text-gray-900 dark:text-white mb-2">No Budgets Created</h3>
                  <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mb-4 px-4">
                    Create your first budget to start tracking your spending
                  </p>
                  <button
                    onClick={() => setShowAddBudget(true)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm lg:text-base rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Create Your First Budget
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 lg:gap-4">
                  {budgets.map((budget) => (
                    <div
                      key={budget._id}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 lg:p-4 border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 space-y-2 sm:space-y-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl lg:text-2xl">{getBudgetTypeIcon(budget.type)}</span>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">{budget.name}</h4>
                            <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                              {budget.type.charAt(0).toUpperCase() + budget.type.slice(1)} Budget
                              {budget.category && ` • ${budget.category}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end space-x-2">
                          {budget.isExceeded && (
                            <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded-full">
                              Exceeded
                            </span>
                          )}
                          {budget.shouldAlert && !budget.isExceeded && (
                            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded-full">
                              Alert
                            </span>
                          )}
                          <div className="flex space-x-1">
                            <button
                              onClick={() => setEditingBudget(budget)}
                              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                              title="Edit budget"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleBudgetDeleted(budget._id)}
                              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              title="Delete budget"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs lg:text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{budget.usagePercentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(budget.usagePercentage, budget.isExceeded)}`}
                            style={{ width: `${Math.min(budget.usagePercentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Budget Details */}
                      <div className="grid grid-cols-2 gap-3 lg:gap-4 text-xs lg:text-sm">
                        <div>
                          <div className="text-gray-600 dark:text-gray-400">Budget</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(budget.amount)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600 dark:text-gray-400">Spent</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(budget.currentSpending)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600 dark:text-gray-400">Remaining</div>
                          <div className={`font-medium ${
                            budget.remainingAmount < 0 
                              ? 'text-red-600 dark:text-red-400' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {formatCurrency(budget.remainingAmount)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600 dark:text-gray-400">Period</div>
                          <div className="font-medium text-gray-900 dark:text-white text-xs">
                            {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
                          </div>
                        </div>
                      </div>

                      {budget.description && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">{budget.description}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Add Budget Modal */}
      {showAddBudget && (
        <AddBudget
          onClose={() => setShowAddBudget(false)}
          onBudgetCreated={handleBudgetCreated}
        />
      )}

      {/* Edit Budget Modal */}
      {editingBudget && (
        <EditBudget
          budget={editingBudget}
          onClose={() => setEditingBudget(null)}
          onBudgetUpdated={handleBudgetUpdated}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmation.isOpen}
        onClose={hideConfirmation}
        onConfirm={confirmation.onConfirm}
        title={confirmation.title}
        message={confirmation.message}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        type={confirmation.type}
      />
    </div>
  );
}

export default BudgetManager; 
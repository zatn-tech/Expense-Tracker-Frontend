import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useConfirmation } from '../hooks/useConfirmation';
import ConfirmationDialog from './ui/ConfirmationDialog';
import { API_ENDPOINTS } from '../config/api';

const GoalManager = () => {
  const { userId } = useParams();
  const { token } = useContext(AuthContext);
  const { showSuccess, showError } = useNotification();
  const { confirmation, showConfirmation, hideConfirmation } = useConfirmation();
  
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [creatingGoal, setCreatingGoal] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'savings',
    targetAmount: '',
    startDate: '',
    targetDate: '',
    category: '',
    description: ''
  });

  const goalTypes = [
    { value: 'savings', label: 'Savings Goal', icon: '💰' },
    { value: 'spending_limit', label: 'Spending Limit', icon: '📊' },
    { value: 'debt_payoff', label: 'Debt Payoff', icon: '💳' },
    { value: 'income_target', label: 'Income Target', icon: '📈' }
  ];

  const [categories, setCategories] = useState({
    savings: [],
    spending_limit: [],
    debt_payoff: [],
    income_target: []
  });
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [userId]);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await axios.get(API_ENDPOINTS.USER_CATEGORIES(userId), {
        headers: { Authorization: `Bearer ${token}` }
      });

      const allCategories = response.data.filter(cat => cat.isActive);
      
      // Map categories to goal types
      const mappedCategories = {
        savings: allCategories
          .filter(cat => cat.type === 'expense' && ['savings', 'investment'].includes(cat.subtype))
          .map(cat => ({ value: cat.name, label: cat.name, icon: cat.icon })),
        spending_limit: allCategories
          .filter(cat => cat.type === 'expense')
          .map(cat => ({ value: cat.name, label: cat.name, icon: cat.icon })),
        debt_payoff: allCategories
          .filter(cat => cat.type === 'expense' && cat.subtype === 'debt')
          .map(cat => ({ value: cat.name, label: cat.name, icon: cat.icon })),
        income_target: allCategories
          .filter(cat => cat.type === 'income')
          .map(cat => ({ value: cat.name, label: cat.name, icon: cat.icon }))
      };

      setCategories(mappedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchCategoriesForGoalType = async (goalType) => {
    try {
      setCategoriesLoading(true);
      const response = await axios.get(API_ENDPOINTS.USER_CATEGORIES(userId), {
        headers: { Authorization: `Bearer ${token}` }
      });

      const allCategories = response.data.filter(cat => cat.isActive);
      
      let filteredCategories = [];
      
      switch (goalType) {
        case 'savings':
          filteredCategories = allCategories
            .filter(cat => cat.type === 'expense' && ['savings', 'investment'].includes(cat.subtype))
            .map(cat => ({ value: cat.name, label: cat.name, icon: cat.icon }));
          break;
        case 'spending_limit':
          filteredCategories = allCategories
            .filter(cat => cat.type === 'expense')
            .map(cat => ({ value: cat.name, label: cat.name, icon: cat.icon }));
          break;
        case 'debt_payoff':
          filteredCategories = allCategories
            .filter(cat => cat.type === 'expense' && cat.subtype === 'debt')
            .map(cat => ({ value: cat.name, label: cat.name, icon: cat.icon }));
          break;
        case 'income_target':
          filteredCategories = allCategories
            .filter(cat => cat.type === 'income')
            .map(cat => ({ value: cat.name, label: cat.name, icon: cat.icon }));
          break;
        default:
          filteredCategories = [];
      }

      setCategories(prev => ({
        ...prev,
        [goalType]: filteredCategories
      }));
    } catch (error) {
      console.error('Error fetching categories for goal type:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [userId]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.USER_GOALS(userId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoals(response.data);
    } catch (error) {
      console.error('Error fetching goals:', error);
      setError('Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setCreatingGoal(true);
    
    try {
      const payload = {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount)
      };

      // Create the goal first
      const response = await axios.post(API_ENDPOINTS.USER_GOALS(userId), payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Automatically calculate progress from existing transactions
      if (response.data._id) {
        try {
          await axios.post(API_ENDPOINTS.USER_GOALS_CALCULATE_PROGRESS(userId, response.data._id), {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (calcError) {
          console.error('Error calculating initial progress:', calcError);
          // Don't show error to user as goal was created successfully
        }
      }

      setShowAddForm(false);
      resetForm();
      fetchGoals();
      
      showSuccess('Goal created successfully! Progress has been calculated from your existing transactions.');
    } catch (error) {
      console.error('Error saving goal:', error);
      showError(error.response?.data?.message || 'Failed to save goal');
    } finally {
      setCreatingGoal(false);
    }
  };

  const handleDelete = async (id) => {
    showConfirmation({
      title: 'Delete Goal',
      message: 'Are you sure you want to delete this goal? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_ENDPOINTS.USER_GOALS(userId)}/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          fetchGoals();
          showSuccess('Goal deleted successfully!');
        } catch (error) {
          console.error('Error deleting goal:', error);
          showError('Failed to delete goal');
        }
      }
    });
  };

  const handleCalculateProgress = async (id) => {
    try {
      await axios.post(API_ENDPOINTS.USER_GOALS_CALCULATE_PROGRESS(userId, id), {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchGoals();
      showSuccess('Progress calculated successfully!');
    } catch (error) {
      console.error('Error calculating progress:', error);
      showError('Failed to calculate progress');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'savings',
      targetAmount: '',
      startDate: '',
      targetDate: '',
      category: '',
      description: ''
    });
  };

  // Reset category when goal type changes
  const handleGoalTypeChange = (newType) => {
    setFormData({
      ...formData,
      type: newType,
      category: '' // Clear category when type changes
    });
    
    // Fetch categories for the new goal type
    fetchCategoriesForGoalType(newType);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCategoryIcon = (goalType, category) => {
    const categoryList = categories[goalType];
    if (categoryList) {
      const foundCategory = categoryList.find(cat => cat.value === category);
      return foundCategory?.icon || '📋';
    }
    return '📋';
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-black rounded-lg p-6">
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading goals...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black rounded-lg shadow-xl w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Set and track your financial objectives
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-medium transition-colors shadow-modern hover:from-indigo-700 hover:to-indigo-800"
        >
          Add Goal
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {goals.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Financial Goals</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first financial goal to start tracking your progress
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-medium transition-colors shadow-modern hover:from-indigo-700 hover:to-indigo-800"
            >
              Create Your First Goal
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => (
              <div
                key={goal._id}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-lg">
                        {goalTypes.find(t => t.value === goal.type)?.icon || '🎯'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">{goal.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {getCategoryIcon(goal.type, goal.category)} {goal.category} • {goalTypes.find(t => t.value === goal.type)?.label}
                        </p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <span>{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</span>
                        <span>{Math.round(goal.progressPercentage)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(goal.progressPercentage)}`}
                          style={{ width: `${Math.min(goal.progressPercentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Goal Details */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Target Date:</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {formatDate(goal.targetDate)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Days Left:</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {goal.daysRemaining} days
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Daily Target:</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(goal.dailyTarget)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Info */}
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      <span>Progress calculated from transactions between {formatDate(goal.startDate)} and today</span>
                    </div>
                    
                    {goal.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {goal.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleCalculateProgress(goal._id)}
                      className="p-1 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
                      title="Calculate from transactions"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handleDelete(goal._id)}
                      className="p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300"
                      title="Delete goal"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 transform transition-all duration-300 scale-100">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">🎯</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Add New Goal
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Create a financial goal to track</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white dark:bg-gray-900">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Goal Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Goal Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleGoalTypeChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {goalTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                    {categoriesLoading && (
                      <span className="ml-2 inline-flex items-center">
                        <svg className="animate-spin h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                    )}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    disabled={categoriesLoading}
                  >
                    <option value="">
                      {categoriesLoading ? 'Loading categories...' : 'Select Category'}
                    </option>
                    {categories[formData.type] && categories[formData.type].length > 0 ? (
                      categories[formData.type].map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.icon} {category.label}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        {categoriesLoading ? 'Loading...' : 'No categories available'}
                      </option>
                    )}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Date *
                </label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Describe your goal..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingGoal}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors shadow-lg disabled:opacity-50 flex items-center space-x-2"
                >
                  {creatingGoal ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Creating Goal...</span>
                    </>
                  ) : (
                    <>
                      <span>🎯</span>
                      <span>Create Goal</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
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
};

export default GoalManager; 
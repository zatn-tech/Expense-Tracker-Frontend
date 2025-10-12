import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useConfirmation } from '../hooks/useConfirmation';
import ConfirmationDialog from './ui/ConfirmationDialog';
import { API_ENDPOINTS } from '../config/api';

function TransactionManager({ onClose, onTransactionsUpdated }) {
  const { userId } = useParams();
  const { token } = useContext(AuthContext);
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  const { confirmation, showConfirmation, hideConfirmation } = useConfirmation();
  
  // State management
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTransactions, setSelectedTransactions] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  
  // Basic Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(20);
  
  // Advanced Search
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    minAmount: '',
    maxAmount: '',
    paymentMethod: 'all',
    description: '',
    tags: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  
  // Categories state
  const [availableCategories, setAvailableCategories] = useState({ expense: [], income: [] });
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
    fetchAllCategories();
  }, [userId, token]);

  useEffect(() => {
    applyFilters();
  }, [transactions, startDate, endDate, dateFilter, searchTerm, typeFilter, categoryFilter, availableCategories, showAdvancedSearch, advancedFilters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(
        `${API_ENDPOINTS.USER_TRANSACTIONS(userId)}?limit=1000`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      let fetchedTransactions = [];
      if (Array.isArray(response.data)) {
        fetchedTransactions = response.data;
      } else if (response.data && Array.isArray(response.data.transactions)) {
        fetchedTransactions = response.data.transactions;
      }

      setTransactions(fetchedTransactions);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCategories = async () => {
    try {
      setCategoriesLoading(true);
      const [expenseResponse, incomeResponse] = await Promise.all([
        axios.get(API_ENDPOINTS.USER_CATEGORIES_TYPE(userId, 'expense'), {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(API_ENDPOINTS.USER_CATEGORIES_TYPE(userId, 'income'), {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setAvailableCategories({
        expense: expenseResponse.data,
        income: incomeResponse.data
      });
    } catch (error) {
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleTypeFilterChange = (newTypeFilter) => {
    setTypeFilter(newTypeFilter);
    setCategoryFilter('all'); // Reset category filter when type changes
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Apply date filters
    if (dateFilter !== 'all') {
      const now = new Date();
      let filterStartDate = new Date();
      let filterEndDate = new Date();

      switch (dateFilter) {
        case 'today':
          filterStartDate.setHours(0, 0, 0, 0);
          filterEndDate.setHours(23, 59, 59, 999);
          break;
        case 'week':
          filterStartDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterStartDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterStartDate.setFullYear(now.getFullYear() - 1);
          break;
        case 'custom':
          if (startDate && endDate) {
            filterStartDate = new Date(startDate);
            filterEndDate = new Date(endDate);
            filterEndDate.setHours(23, 59, 59, 999);
          }
          break;
        default:
          break;
      }

      if (dateFilter !== 'all') {
        filtered = filtered.filter(transaction => {
          const transactionDate = new Date(transaction.transactionDate);
          return transactionDate >= filterStartDate && transactionDate <= filterEndDate;
        });
      }
    }

    // Apply basic search filter
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === typeFilter);
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.category === categoryFilter);
    }

    // Apply advanced filters
    if (showAdvancedSearch) {
      // Amount range filter
      if (advancedFilters.minAmount) {
        filtered = filtered.filter(transaction => 
          parseFloat(transaction.amount) >= parseFloat(advancedFilters.minAmount)
        );
      }
      if (advancedFilters.maxAmount) {
        filtered = filtered.filter(transaction => 
          parseFloat(transaction.amount) <= parseFloat(advancedFilters.maxAmount)
        );
      }

      // Payment method filter
      if (advancedFilters.paymentMethod !== 'all') {
        filtered = filtered.filter(transaction => 
          transaction.paymentMethod === advancedFilters.paymentMethod
        );
      }

      // Description filter
      if (advancedFilters.description) {
        filtered = filtered.filter(transaction =>
          transaction.description?.toLowerCase().includes(advancedFilters.description.toLowerCase())
        );
      }

      // Tags filter (if implemented in future)
      if (advancedFilters.tags) {
        filtered = filtered.filter(transaction =>
          transaction.tags?.some(tag => 
            tag.toLowerCase().includes(advancedFilters.tags.toLowerCase())
          )
        );
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (advancedFilters.sortBy) {
        case 'amount':
          aValue = parseFloat(a.amount);
          bValue = parseFloat(b.amount);
          break;
        case 'date':
          aValue = new Date(a.transactionDate || a.createdAt);
          bValue = new Date(b.transactionDate || b.createdAt);
          break;
        case 'category':
          aValue = a.category?.toLowerCase();
          bValue = b.category?.toLowerCase();
          break;
        case 'description':
          aValue = a.description?.toLowerCase();
          bValue = b.description?.toLowerCase();
          break;
        default:
          aValue = new Date(a.transactionDate || a.createdAt);
          bValue = new Date(b.transactionDate || b.createdAt);
      }

      if (advancedFilters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  };

  const handleSelectTransaction = (transactionId) => {
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(transactionId)) {
      newSelected.delete(transactionId);
    } else {
      newSelected.add(transactionId);
    }
    setSelectedTransactions(newSelected);
  };

  const handleSelectAll = () => {
    const currentPageTransactions = getCurrentPageTransactions();
    const currentPageIds = currentPageTransactions.map(t => t._id);
    
    if (currentPageIds.every(id => selectedTransactions.has(id))) {
      const newSelected = new Set(selectedTransactions);
      currentPageIds.forEach(id => newSelected.delete(id));
      setSelectedTransactions(newSelected);
    } else {
      const newSelected = new Set(selectedTransactions);
      currentPageIds.forEach(id => newSelected.add(id));
      setSelectedTransactions(newSelected);
    }
  };

  const deleteSelectedTransactions = async () => {
    if (selectedTransactions.size === 0) {
      setError('Please select transactions to delete');
      return;
    }

    showConfirmation({
      title: 'Delete Selected Transactions',
      message: `Are you sure you want to delete ${selectedTransactions.size} selected transaction(s)? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          setBulkDeleting(true);
          setError('');

          const transactionIds = Array.from(selectedTransactions);
          
          for (const transactionId of transactionIds) {
            const response = await axios.delete(
              `${API_ENDPOINTS.USER_TRANSACTIONS(userId)}/${transactionId}`,
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            );
            
            // Handle goal notifications from delete response
            if (response.data.goalNotifications && response.data.goalNotifications.length > 0) {
              response.data.goalNotifications.forEach((notification) => {
                if (notification.type === 'success') {
                  showSuccess(notification.message);
                } else if (notification.type === 'error') {
                  showError(notification.message);
                } else if (notification.type === 'warning') {
                  showWarning(notification.message);
                } else {
                  showInfo(notification.message);
                }
              });
            }
          }

          await fetchTransactions();
          setSelectedTransactions(new Set());
          
          if (onTransactionsUpdated) {
            onTransactionsUpdated();
          }
          
          showSuccess(`Successfully deleted ${selectedTransactions.size} transaction(s)`);
        } catch (err) {
          showError(err.response?.data?.error || 'Failed to delete selected transactions');
        } finally {
          setBulkDeleting(false);
        }
      }
    });
  };

  const deleteAllFilteredTransactions = async () => {
    if (filteredTransactions.length === 0) {
      setError('No transactions to delete');
      return;
    }

    showConfirmation({
      title: 'Delete All Filtered Transactions',
      message: `Are you sure you want to delete ALL ${filteredTransactions.length} transactions in the current filter? This action cannot be undone.`,
      confirmText: 'Delete All',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          setDeletingAll(true);
          setError('');

          const transactionIds = filteredTransactions.map(t => t._id);
          
          for (const transactionId of transactionIds) {
            const response = await axios.delete(
              `${API_ENDPOINTS.USER_TRANSACTIONS(userId)}/${transactionId}`,
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            );
            
            // Handle goal notifications from delete response
            if (response.data.goalNotifications && response.data.goalNotifications.length > 0) {
              response.data.goalNotifications.forEach((notification) => {
                if (notification.type === 'success') {
                  showSuccess(notification.message);
                } else if (notification.type === 'error') {
                  showError(notification.message);
                } else if (notification.type === 'warning') {
                  showWarning(notification.message);
                } else {
                  showInfo(notification.message);
                }
              });
            }
          }

          await fetchTransactions();
          setSelectedTransactions(new Set());
          
          if (onTransactionsUpdated) {
            onTransactionsUpdated();
          }
          
          showSuccess(`Successfully deleted ${filteredTransactions.length} transaction(s)`);
        } catch (err) {
          showError(err.response?.data?.error || 'Failed to delete all transactions');
        } finally {
          setDeletingAll(false);
        }
      }
    });
  };

  const getCurrentPageTransactions = () => {
    const startIndex = (currentPage - 1) * transactionsPerPage;
    const endIndex = startIndex + transactionsPerPage;
    return filteredTransactions.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(filteredTransactions.length / transactionsPerPage);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getCategories = () => {
    // Use dynamic categories based on type filter
    if (typeFilter === 'income') {
      return availableCategories.income.map(cat => cat.name);
    } else if (typeFilter === 'expense') {
      return availableCategories.expense.map(cat => cat.name);
    } else {
      // For 'all' type, combine both income and expense categories
      const allCategories = [
        ...availableCategories.income.map(cat => cat.name),
        ...availableCategories.expense.map(cat => cat.name)
      ];
      return allCategories.sort();
    }
  };

  const handleAdvancedFilterChange = (field, value) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearAdvancedFilters = () => {
    setAdvancedFilters({
      minAmount: '',
      maxAmount: '',
      paymentMethod: 'all',
      description: '',
      tags: '',
      sortBy: 'date',
      sortOrder: 'desc'
    });
  };

  const getPaymentMethods = () => {
    const methods = new Set();
    transactions.forEach(transaction => {
      if (transaction.paymentMethod) {
        methods.add(transaction.paymentMethod);
      }
    });
    return Array.from(methods).sort();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-black rounded-lg p-6">
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading transactions...
          </div>
        </div>
      </div>
    );
  }

  const currentPageTransactions = getCurrentPageTransactions();
  const totalPages = getTotalPages();
  const categories = getCategories();

  return (
    <>
      <div className="bg-white dark:bg-black rounded-lg shadow-xl w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
  
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and bulk operate on your transactions</p>
        </div>
      </div>

        {/* Filters Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Range</label>
              <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {dateFilter === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
              <select value={typeFilter} onChange={(e) => handleTypeFilterChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
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
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={categoriesLoading}
              >
                <option value="all">
                  {categoriesLoading ? 'Loading categories...' : 'All Categories'}
                </option>
                {getCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Main Search Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quick Search</label>
              <button
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors px-3 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <span>{showAdvancedSearch ? '🔽' : '🔼'}</span>
                <span>{showAdvancedSearch ? 'Hide Advanced Search' : 'Show Advanced Search'}</span>
              </button>
            </div>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search by description, category, or payment method..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-colors" 
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-400 dark:text-gray-500">🔍</span>
              </div>
            </div>
          </div>

          {/* Advanced Search Section */}
          {showAdvancedSearch && (
            <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <span className="mr-2">🔍</span>
                  Advanced Search
                </h3>
                <button
                  onClick={clearAdvancedFilters}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors px-3 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Clear All Filters
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Amount Range */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount Range</label>
                  <div className="flex space-x-3">
                    <div className="flex-1">
                      <input
                        type="number"
                        placeholder="Min"
                        value={advancedFilters.minAmount}
                        onChange={(e) => handleAdvancedFilterChange('minAmount', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-colors"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        placeholder="Max"
                        value={advancedFilters.maxAmount}
                        onChange={(e) => handleAdvancedFilterChange('maxAmount', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method</label>
                  <select
                    value={advancedFilters.paymentMethod}
                    onChange={(e) => handleAdvancedFilterChange('paymentMethod', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-colors"
                  >
                    <option value="all">All Payment Methods</option>
                    {getPaymentMethods().map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                  <input
                    type="text"
                    placeholder="Search in description..."
                    value={advancedFilters.description}
                    onChange={(e) => handleAdvancedFilterChange('description', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-colors"
                  />
                </div>

                {/* Sort By */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sort By</label>
                  <select
                    value={advancedFilters.sortBy}
                    onChange={(e) => handleAdvancedFilterChange('sortBy', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-colors"
                  >
                    <option value="date">Date</option>
                    <option value="amount">Amount</option>
                    <option value="category">Category</option>
                    <option value="description">Description</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sort Order</label>
                  <select
                    value={advancedFilters.sortOrder}
                    onChange={(e) => handleAdvancedFilterChange('sortOrder', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-colors"
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>

                {/* Tags (Future Feature) */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tags</label>
                  <input
                    type="text"
                    placeholder="Search by tags..."
                    value={advancedFilters.tags}
                    onChange={(e) => handleAdvancedFilterChange('tags', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <div className="text-sm text-blue-600 dark:text-blue-400">Total Transactions</div>
              <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">{filteredTransactions.length}</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
              <div className="text-sm text-green-600 dark:text-green-400">Income</div>
              <div className="text-lg font-semibold text-green-900 dark:text-green-100">
                {formatCurrency(filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0))}
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
              <div className="text-sm text-red-600 dark:text-red-400">Expenses</div>
              <div className="text-lg font-semibold text-red-900 dark:text-red-100">
                {formatCurrency(filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0))}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">Selected</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{selectedTransactions.size}</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
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
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            <button onClick={deleteSelectedTransactions} disabled={selectedTransactions.size === 0 || bulkDeleting} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {bulkDeleting ? 'Deleting...' : `Delete Selected (${selectedTransactions.size})`}
            </button>
            <button onClick={deleteAllFilteredTransactions} disabled={filteredTransactions.length === 0 || deletingAll} className="px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {deletingAll ? 'Deleting All...' : `Delete All (${filteredTransactions.length})`}
            </button>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Transactions Found</h3>
              <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        <input type="checkbox" checked={currentPageTransactions.length > 0 && currentPageTransactions.every(t => selectedTransactions.has(t._id))} onChange={handleSelectAll} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Payment Method</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-700">
                    {currentPageTransactions.map((transaction) => (
                      <tr key={transaction._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input type="checkbox" checked={selectedTransactions.has(transaction._id)} onChange={() => handleSelectTransaction(transaction._id)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{formatDate(transaction.transactionDate)}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          <div className="max-w-xs truncate" title={transaction.description}>{transaction.description || 'No description'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{transaction.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${transaction.type === 'income' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className={transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{transaction.paymentMethod || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing {((currentPage - 1) * transactionsPerPage) + 1} to {Math.min(currentPage * transactionsPerPage, filteredTransactions.length)} of {filteredTransactions.length} results
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                      Previous
                    </button>
                    <span className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

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
    </>
  );
}

export default TransactionManager; 
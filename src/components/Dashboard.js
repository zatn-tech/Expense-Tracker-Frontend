import React, { useEffect, useState, useContext, useCallback, useRef } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AddTransaction from './AddTransaction';
import TransactionList from './TransactionList';
import Reports from './Reports';
import ExportData from './ExportData';
import MonthlyTransactionsChart from './MonthlyTransactionsChart';
import ExpensePieCarousel from './ExpensePieCarousel';
import TransferManager from './TransferManager';
import BalanceSettingsModal from './BalanceSettingsModal';

import { TYPOGRAPHY, TYPOGRAPHY_COMBINATIONS } from '../utils/typography';

function Dashboard() {
  const { userId } = useParams();
  const { token, user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [stats, setStats] = useState({ 
    totalIncome: 0, 
    totalExpenses: 0, 
    balance: 0,
    balanceMethod: 'net_cash_flow',
    balanceMethodLabel: 'Net Cash Flow',
    balanceBreakdown: {
      income: 0,
      expenses: 0,
      netFlow: 0
    }
  });
  const [monthlyStats, setMonthlyStats] = useState({ transactions: 0, avgPerDay: 0, topCategory: 'None' });
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReports, setShowReports] = useState(false);
  const [showExportData, setShowExportData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [showBalanceSettings, setShowBalanceSettings] = useState(false);
  const [success, setSuccess] = useState('');

  const isFetchingRef = useRef(false);

  // Security check: Ensure user can only access their own dashboard
  useEffect(() => {
    if (user && userId !== user._id) {
      window.location.href = `/user/${user._id}/dashboard`;
      return;
    }
  }, [userId, user]);

  const fetchTransactions = useCallback(async () => {
    if (!token || !userId || isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    setLoading(true);
    try {
      // First, get accurate stats from the stats endpoint
      const statsUrl = `${API_ENDPOINTS.USER_TRANSACTIONS(userId).replace('/transactions', '/transactions/stats')}`;
      
      const statsRes = await axios.get(statsUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (statsRes.data.status === 'success') {
        const statsData = statsRes.data.data;
        
        // Set stats directly from backend calculation
        setStats({
          totalIncome: statsData.totalIncome,
          totalExpenses: statsData.totalExpenses,
          balance: statsData.balance,
          balanceMethod: statsData.balanceMethod,
          balanceMethodLabel: statsData.balanceMethodLabel,
          balanceBreakdown: statsData.balanceBreakdown
        });
      }
      
      // Then fetch all transactions for display (with higher limit)
      const debugParam = process.env.NODE_ENV === 'development' ? '&debug=true' : '';
      const url = `${API_ENDPOINTS.USER_TRANSACTIONS(userId)}?limit=1000${debugParam}`;
      
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Handle both old and new response formats
      let transactionArray;
      if (Array.isArray(res.data)) {
        transactionArray = res.data;
      } else if (res.data.transactions && Array.isArray(res.data.transactions)) {
        transactionArray = res.data.transactions;
      } else {
        transactionArray = [];
      }
      
      // Validate and clean transaction data
      transactionArray = transactionArray.map(t => {
        // Safety check for transaction object
        if (!t || typeof t !== 'object') {
          return null;
        }
        
        return {
          ...t,
          amount: parseFloat(t.amount) || 0,
          type: t.type || 'expense', // Default to expense if type is missing
          transactionDate: t.transactionDate ? new Date(t.transactionDate) : new Date(t.createdAt)
        };
      }).filter(t => {
        // Filter out invalid transactions
        if (!t) return false;
        
        const isValid = t.amount > 0 && ['income', 'expense'].includes(t.type);
        return isValid;
      });
      
      // Sort by transaction date (not creation date)
      transactionArray.sort((a, b) => {
        const dateA = new Date(a.transactionDate || a.createdAt);
        const dateB = new Date(b.transactionDate || b.createdAt);
        return dateB - dateA; // Most recent transaction dates first
      });
      
      setTransactions(transactionArray);
      
      // Only recalculate stats if we didn't get them from the stats endpoint
      if (statsRes.data.status !== 'success') {
        calculateStats(transactionArray);
      }
      
      calculateMonthlyStats(transactionArray);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      if (err.response?.status === 403) {
        // Access denied handled by redirect
        // Redirect to auth page instead of calling logout
        window.location.href = '/auth';
      } else {
        setTransactions([]);
        calculateStats([]);
        calculateMonthlyStats([]);
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [token, userId]);

  const fetchStatsOnly = useCallback(async () => {
    if (!token || !userId) return;
    
    try {
      const statsUrl = `${API_ENDPOINTS.USER_TRANSACTIONS(userId).replace('/transactions', '/transactions/stats')}`;
      const statsRes = await axios.get(statsUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (statsRes.data.status === 'success') {
        const statsData = statsRes.data.data;
        
        setStats({
          totalIncome: statsData.totalIncome,
          totalExpenses: statsData.totalExpenses,
          balance: statsData.balance,
          balanceMethod: statsData.balanceMethod,
          balanceMethodLabel: statsData.balanceMethodLabel,
          balanceBreakdown: statsData.balanceBreakdown
        });
      }
    } catch (err) {
      console.error('Error fetching stats only:', err);
    }
  }, [token, userId]);

  const fetchAccounts = useCallback(async () => {
    if (!token || !userId) return;
    
    try {
      const response = await axios.get(`${API_ENDPOINTS.USERS(userId)}/accounts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.status === 'success') {
        setAccounts(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setAccounts([]);
    }
  }, [token, userId]);

  useEffect(() => {
    fetchTransactions();
    fetchAccounts();
  }, [fetchTransactions, fetchAccounts]);

  // Filter transactions based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTransactions(transactions);
    } else {
      const filtered = transactions.filter(transaction =>
        transaction && (
          transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredTransactions(filtered);
    }
  }, [transactions, searchTerm]);

  const calculateStats = (transactionArray) => {
    const totalIncome = transactionArray
      .filter(t => t && t.type === 'income')
      .reduce((sum, t) => {
        const amount = parseFloat(t.amount) || 0;
        return sum + amount;
      }, 0);
    
    const totalExpenses = transactionArray
      .filter(t => t && t.type === 'expense')
      .reduce((sum, t) => {
        const amount = parseFloat(t.amount) || 0;
        return sum + amount;
      }, 0);
    
    const balance = totalIncome - totalExpenses;
    
    setStats({
      totalIncome: Math.round(totalIncome * 100) / 100, // Round to 2 decimal places
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      balance: Math.round(balance * 100) / 100,
      balanceMethod: 'net_cash_flow',
      balanceMethodLabel: 'Net Cash Flow',
      balanceBreakdown: {
        income: Math.round(totalIncome * 100) / 100,
        expenses: Math.round(totalExpenses * 100) / 100,
        netFlow: Math.round(balance * 100) / 100
      }
    });
  };

  const calculateMonthlyStats = (transactionArray) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactionArray.filter(t => {
      if (!t) return false;
      const transactionDate = new Date(t.transactionDate || t.createdAt);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const avgPerDay = monthlyTransactions.length > 0 
      ? monthlyTransactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0) / daysInMonth 
      : 0;
    
    // Find top category
    const categoryCounts = {};
    monthlyTransactions.forEach(t => {
      if (t && t.category) {
        categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
      }
    });
    
    const topCategory = Object.keys(categoryCounts).length > 0
      ? Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b)
      : 'None';
    
    setMonthlyStats({
      transactions: monthlyTransactions.length,
      avgPerDay,
      topCategory
    });
  };

  const handleAdd = (newTransaction) => {
    // Validate the new transaction
    if (!newTransaction || typeof newTransaction !== 'object') {
      return;
    }
    
    // Ensure required properties exist
    const validatedTransaction = {
      ...newTransaction,
      type: newTransaction.type || 'expense',
      amount: parseFloat(newTransaction.amount) || 0,
      category: newTransaction.category || 'Unknown',
      transactionDate: newTransaction.transactionDate || new Date().toISOString()
    };
    
    setTransactions(prev => [validatedTransaction, ...prev]);
    calculateStats([validatedTransaction, ...transactions]);
    calculateMonthlyStats([validatedTransaction, ...transactions]);
  };

  const handleTransferComplete = (transferData) => {
    // Refresh accounts and transactions after transfer
    fetchAccounts();
    setShowTransferForm(false);
    setSuccess('Transfer completed successfully! Your account balances have been updated.');
  };

  const handleDelete = (deletedTransactionId) => {
    const updatedTransactions = transactions.filter(t => t._id !== deletedTransactionId);
    setTransactions(updatedTransactions);
    calculateStats(updatedTransactions);
    calculateMonthlyStats(updatedTransactions);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={TYPOGRAPHY.BODY_LG + " text-gray-600 dark:text-gray-400"}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Header Section with Balance */}
        <div className={TYPOGRAPHY_COMBINATIONS.pageHeader.container + " mb-6 sm:mb-12"}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            {/* Greeting - Left Side */}
            <div>
              <h1 className={TYPOGRAPHY_COMBINATIONS.pageHeader.title}>
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}! 👋
              </h1>
              <p className={TYPOGRAPHY_COMBINATIONS.pageHeader.subtitle}>
                Here's your financial overview for today
              </p>
            </div>
            
            {/* Balance - Right Side */}
            <div className="flex-shrink-0 text-right">
              <div className="flex items-center justify-end mb-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                  {stats.balanceMethodLabel || 'Current Balance'}
                </p>
                <button
                  onClick={() => setShowBalanceSettings(true)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Change balance display method"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              <p className={`text-2xl font-bold ${
                stats.balance >= 0 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-rose-600 dark:text-rose-400'
              }`}>
                ₹{Math.abs(stats.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-16">
          {/* Income Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 lg:p-8 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full">
                +2.5%
              </span>
            </div>
            <h3 className={TYPOGRAPHY.BODY_SM + " font-medium text-gray-500 dark:text-gray-400 mb-3"}>Total Income</h3>
            <p className={`${TYPOGRAPHY.AMOUNT} text-gray-900 dark:text-white mb-3`}>
              ₹{stats.totalIncome.toLocaleString('en-IN')}
            </p>
            <p className={TYPOGRAPHY.BODY_XS + " text-gray-500 dark:text-gray-400"}>
              {transactions.filter(t => t.type === 'income').length} transactions this month
            </p>
          </div>

          {/* Expenses Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 lg:p-8 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="w-14 h-14 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
              <span className="text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-3 py-1.5 rounded-full">
                +1.2%
              </span>
            </div>
            <h3 className={TYPOGRAPHY.BODY_SM + " font-medium text-gray-500 dark:text-gray-400 mb-3"}>Total Expenses</h3>
            <p className={`${TYPOGRAPHY.AMOUNT} text-gray-900 dark:text-white mb-3`}>
              ₹{stats.totalExpenses.toLocaleString('en-IN')}
            </p>
            <p className={TYPOGRAPHY.BODY_XS + " text-gray-500 dark:text-gray-400"}>
              {transactions.filter(t => t.type === 'expense').length} transactions this month
            </p>
          </div>

          {/* Monthly Overview Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 lg:p-8 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full">
                This Month
              </span>
            </div>
            <h3 className={TYPOGRAPHY.BODY_SM + " font-medium text-gray-500 dark:text-gray-400 mb-3"}>Monthly Overview</h3>
            <p className={`${TYPOGRAPHY.AMOUNT} text-gray-900 dark:text-white mb-3`}>
              {monthlyStats.transactions}
            </p>
            <p className={TYPOGRAPHY.BODY_XS + " text-gray-500 dark:text-gray-400"}>
              Top category: {monthlyStats.topCategory}
            </p>
          </div>
        </div>

        {/* Quick Transfer Section */}
        <div className="mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mr-3">
                  <span className="text-lg">💸</span>
                </div>
                <h2 className={TYPOGRAPHY_COMBINATIONS.cardHeader.title}>Quick Transfer</h2>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowTransferForm(!showTransferForm)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 transition-all duration-200"
                >
                  {showTransferForm ? 'Hide' : 'Show'} Transfer Form
                </button>
                <a
                  href={`/user/${userId}/transfers`}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-all duration-200"
                >
                  <span className="mr-2">📊</span>
                  View History
                </a>
              </div>
            </div>
            
            {showTransferForm ? (
              <TransferManager 
                onTransferComplete={handleTransferComplete}
                accounts={accounts} // Pass existing accounts data
                className="mt-4"
              />
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🏦</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Quick Transfer
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Move money between your accounts quickly and securely
                </p>
                <button
                  onClick={() => setShowTransferForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 transition-all duration-200"
                >
                  <span className="mr-2">💸</span>
                  Start Transfer
                </button>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    <span className="text-green-700 dark:text-green-300 text-sm">{success}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={`/user/${userId}/transfers`}
                      className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                    >
                      View History
                    </a>
                    <button
                      onClick={() => setSuccess('')}
                      className="text-green-500 hover:text-green-700 dark:hover:text-green-300"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Accounts Section */}
        {accounts.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className={TYPOGRAPHY_COMBINATIONS.sectionHeader.title}>
                Your Accounts
              </h2>
              <button
                onClick={() => window.location.href = `/user/${userId}/accounts`}
                className={TYPOGRAPHY.LINK_SM + " font-medium"}
              >
                View All →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {accounts.slice(0, 4).map(account => (
                <div key={account._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className={TYPOGRAPHY.BODY_SM + " font-semibold text-gray-900 dark:text-white truncate mb-1"}>
                        {account.name}
                      </h3>
                      <p className={TYPOGRAPHY.BODY_XS + " text-gray-500 dark:text-gray-400 capitalize"}>
                        {account.type}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      {account.isDefault && (
                        <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs px-2.5 py-1.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className={`${TYPOGRAPHY.AMOUNT_SM} ${
                      account.balance >= 0 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-rose-600 dark:text-rose-400'
                    } mb-2`}>
                      ₹{account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                    {account.description && (
                      <p className={TYPOGRAPHY.BODY_XS + " text-gray-600 dark:text-gray-400 truncate"}>
                        {account.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-10">
          {/* Left Column - Add Transaction & Summary */}
          <div className="xl:col-span-1 space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Add Transaction Form */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
              <div className="flex items-center mb-4 sm:mb-6 lg:mb-8">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h2 className={TYPOGRAPHY_COMBINATIONS.cardHeader.title}>Add Transaction</h2>
              </div>
              <AddTransaction userId={userId} onAdd={handleAdd} />
            </div>



            {/* This Month Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
              <h3 className={TYPOGRAPHY_COMBINATIONS.cardHeader.title + " mb-6"}>
                This Month Summary
              </h3>
              <div className="space-y-5">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className={TYPOGRAPHY.BODY_SM + " text-gray-600 dark:text-gray-400"}>Transactions</span>
                  <span className={TYPOGRAPHY.BODY + " font-semibold text-gray-900 dark:text-white"}>{monthlyStats.transactions}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className={TYPOGRAPHY.BODY_SM + " text-gray-600 dark:text-gray-400"}>Avg. per day</span>
                  <span className={TYPOGRAPHY.BODY + " font-semibold text-gray-900 dark:text-white"}>
                    ₹{monthlyStats.avgPerDay.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className={TYPOGRAPHY.BODY_SM + " text-gray-600 dark:text-gray-400"}>Top category</span>
                  <span className={TYPOGRAPHY.BODY + " font-semibold text-gray-900 dark:text-white"}>{monthlyStats.topCategory}</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className={TYPOGRAPHY_COMBINATIONS.cardHeader.title}>Recent Activity</h3>
              </div>
              <div className="space-y-4">
                {transactions.length > 0 ? (
                  transactions.slice(0, 3).map((transaction) => {
                    // Safety check for transaction properties
                    if (!transaction || typeof transaction !== 'object') {
                      console.warn('⚠️ Invalid transaction object:', transaction);
                      return null;
                    }
                    
                    const transactionType = transaction.type || 'expense';
                    const transactionCategory = transaction.category || 'Unknown';
                    const transactionAmount = transaction.amount || 0;
                    const transactionDate = transaction.transactionDate || transaction.createdAt || new Date();
                    
                    return (
                      <div key={transaction._id || `temp-${Math.random()}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${transactionType === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                          <div>
                            <div className={TYPOGRAPHY.BODY_SM + " font-medium text-gray-900 dark:text-white"}>
                              {transactionCategory}
                            </div>
                            <div className={TYPOGRAPHY.BODY_XS + " text-gray-500 dark:text-gray-400"}>
                              {new Date(transactionDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className={`${TYPOGRAPHY.BODY_SM} font-semibold ${transactionType === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {transactionType === 'income' ? '+' : '-'}₹{transactionAmount}
                        </div>
                      </div>
                    );
                  }).filter(Boolean) // Remove any null entries
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className={TYPOGRAPHY.BODY_SM + " font-medium mb-1"}>No transactions yet</div>
                    <div className={TYPOGRAPHY.BODY_XS}>Add your first transaction to see activity here</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Transaction List & Charts */}
          <div className="xl:col-span-2 space-y-8">
            {/* Transaction List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-3 sm:space-y-0">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h2 className={TYPOGRAPHY_COMBINATIONS.cardHeader.title}>Recent Transactions</h2>
                  <span className="ml-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-xs font-medium px-3 py-1.5 rounded-full">
                    {filteredTransactions.length}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={fetchTransactions}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Refresh"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Search Input */}
              <div className="mb-8">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pl-12 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200"
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              <TransactionList 
                transactions={filteredTransactions} 
                onDelete={handleDelete}
                userId={userId}
              />
            </div>

            {/* Expense Categories Pie Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <h2 className={TYPOGRAPHY_COMBINATIONS.cardHeader.title}>Expense Categories</h2>
              </div>
              <ExpensePieCarousel/>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="mt-20">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h2 className={TYPOGRAPHY_COMBINATIONS.cardHeader.title}>Monthly Transactions</h2>
            </div>
            <MonthlyTransactionsChart/>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showReports && (
        <Reports onClose={() => setShowReports(false)} />
      )}

      {showExportData && (
        <ExportData onClose={() => setShowExportData(false)} />
      )}

      {/* Balance Settings Modal */}
      {showBalanceSettings && (
        <BalanceSettingsModal 
          onClose={() => setShowBalanceSettings(false)}
          userId={userId}
          accounts={accounts} // Pass existing accounts data
          onUpdate={(newPreferences) => {
            // Update the stats object with new balance method
            if (newPreferences && newPreferences.method) {
              // Trigger a stats refresh only (not full transactions)
              fetchStatsOnly();
            }
          }}
        />
      )}

    </div>
  );
}

export default Dashboard;

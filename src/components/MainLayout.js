import React, { useContext, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import Footer from './Footer';

function MainLayout({ children }) {
  const { userId } = useParams();
  const { logout, user } = useContext(AuthContext);
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Check if current route is active
  const isActiveRoute = (path) => {
    return location.pathname === `/user/${userId}${path}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Main Content Area with Sidebar and Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-black shadow-lg border-r border-gray-200 dark:border-gray-700 
          transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Logo/Brand */}
          <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-lg">💰</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Expense Tracker</h1>
              </div>
              {/* Mobile close button */}
              <button
                onClick={closeSidebar}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 flex-1 overflow-y-auto min-h-0">
            <div className="space-y-2">
              <Link
                to={`/user/${userId}/dashboard`}
                onClick={closeSidebar}
                className={`flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActiveRoute('/dashboard')
                    ? 'text-white bg-gradient-to-r from-indigo-600 to-indigo-700 shadow-modern'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                </svg>
                Dashboard
              </Link>

              <Link
                to={`/user/${userId}/budgets`}
                onClick={closeSidebar}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActiveRoute('/budgets')
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Budgets
              </Link>

              <Link
                to={`/user/${userId}/transactions`}
                onClick={closeSidebar}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActiveRoute('/transactions')
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 00-2 2v2h2V7z" />
                </svg>
                Transactions
              </Link>

              <Link
                to={`/user/${userId}/accounts`}
                onClick={closeSidebar}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActiveRoute('/accounts')
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Accounts
              </Link>

              <Link
                to={`/user/${userId}/transfers`}
                onClick={closeSidebar}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActiveRoute('/transfers')
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Transfers
              </Link>

              <Link
                to={`/user/${userId}/import`}
                onClick={closeSidebar}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActiveRoute('/import')
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Import/Export
              </Link>

              <Link
                to={`/user/${userId}/email-detection`}
                onClick={closeSidebar}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActiveRoute('/email-detection')
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Detection
              </Link>

              <Link
                to={`/user/${userId}/reports`}
                onClick={closeSidebar}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActiveRoute('/reports')
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Reports
              </Link>

              <Link
                to={`/user/${userId}/categories`}
                onClick={closeSidebar}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActiveRoute('/categories')
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Categories
              </Link>

              <Link
                to={`/user/${userId}/goals`}
                onClick={closeSidebar}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActiveRoute('/goals')
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Goals
              </Link>

              <Link
                to={`/user/${userId}/recurring-transactions`}
                onClick={closeSidebar}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActiveRoute('/recurring-transactions')
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recurring
              </Link>

              <Link
                to={`/user/${userId}/profile`}
                onClick={closeSidebar}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActiveRoute('/profile')
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </Link>
            </div>
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user?.name || 'User'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email || 'user@example.com'}
                </div>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden lg:ml-0 flex flex-col min-h-0">
          {/* Header */}
          <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
            <div className="px-4 lg:px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {/* Mobile menu button */}
                  <button
                    onClick={toggleSidebar}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 mr-3"
                  >
                    <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                      {location.pathname.includes('/dashboard') && 'Dashboard'}
                      {location.pathname.includes('/budgets') && 'Budgets'}
                      {location.pathname.includes('/transactions') && 'Transactions'}
                      {location.pathname.includes('/email-detection') && 'Email Detection'}
                      {location.pathname.includes('/accounts') && 'Accounts'}
                      {location.pathname.includes('/transfers') && 'Transfers'}
                      {location.pathname.includes('/import') && 'Import/Export'}
                      {location.pathname.includes('/reports') && 'Reports'}
                      {location.pathname.includes('/categories') && 'Categories'}
                      {location.pathname.includes('/goals') && 'Goals'}
                      {location.pathname.includes('/recurring-transactions') && 'Recurring Transactions'}
                      {location.pathname.includes('/profile') && 'Profile'}
                    </h2>
                  </div>
                </div>
                
                {/* Header Right Section */}
                <div className="flex items-center space-x-3">
                  {/* Theme Toggle */}
                  <ThemeToggle />
                  
                  {/* Mobile Logout Button */}
                  <button
                    onClick={handleLogoutClick}
                    className="lg:hidden p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-2 lg:p-6 min-h-0">
            {children}
          </div>
        </div>
      </div>

      {/* Footer - Now at the same level as sidebar and content, covering full width */}
      <Footer />
      
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                <span className="text-2xl">🚪</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Confirm Logout
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to logout? You'll need to sign in again to access your account.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={cancelLogout}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainLayout; 
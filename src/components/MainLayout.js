import React, { useContext, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useUpdates } from '../context/UpdatesContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';
import Footer from './Footer';
import Tooltip from './ui/Tooltip';

function MainLayout({ children }) {
  const { userId } = useParams();
  const { logout, user } = useContext(AuthContext);
  const { unreadCount } = useUpdates();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
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
      {/* Skip Links for Keyboard Navigation */}
      <div className="sr-only focus:not-sr-only">
        <a 
          href="#main-content" 
          className="absolute top-0 left-0 bg-blue-600 text-white px-4 py-2 z-50 focus:relative focus:top-0 focus:left-0"
        >
          Skip to main content
        </a>
        <a 
          href="#navigation" 
          className="absolute top-0 left-0 bg-blue-600 text-white px-4 py-2 z-50 focus:relative focus:top-0 focus:left-0 ml-32"
        >
          Skip to navigation
        </a>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Main Content Area with Sidebar and Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside 
          id="navigation"
          className={`
            fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-black shadow-lg border-r border-gray-200 dark:border-gray-700 
            transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
          aria-label="Main navigation"
        >
          {/* Logo/Brand */}
          <header className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
                  <svg 
                    className="w-8 h-8 text-white" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Modern minimalist expense tracker logo - Current Design */}
                    <path 
                      d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      fill="none"
                    />
                    <path 
                      d="M8 4v4h8V4" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      fill="none"
                    />
                    <circle 
                      cx="12" 
                      cy="14" 
                      r="1.5" 
                      fill="currentColor"
                    />
                    <path 
                      d="M10 14h4" 
                      stroke="currentColor" 
                      strokeWidth="1.5"
                    />
                    {/* Subtle accent lines */}
                    <path 
                      d="M6 10h2" 
                      stroke="currentColor" 
                      strokeWidth="1" 
                      opacity="0.6"
                    />
                    <path 
                      d="M16 10h2" 
                      stroke="currentColor" 
                      strokeWidth="1" 
                      opacity="0.6"
                    />
                  </svg>
                  
                  {/* Alternative ultra-minimalist logo - uncomment to use:
                  <svg 
                    className="w-8 h-8 text-white" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    <path d="M8 4v4h8V4" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M10 12h4M10 15h4M10 18h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  */}
                </div>
                <div className="flex flex-col">
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Expense</h1>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Tracker</h1>
                </div>
              </div>
              {/* Mobile close button */}
              <button
                onClick={closeSidebar}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close navigation menu"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </header>

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
                aria-current={isActiveRoute('/dashboard') ? 'page' : undefined}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
                aria-current={isActiveRoute('/budgets') ? 'page' : undefined}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
                aria-current={isActiveRoute('/transactions') ? 'page' : undefined}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
                aria-current={isActiveRoute('/accounts') ? 'page' : undefined}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
        </aside>

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
                      {location.pathname.includes('/updates') && 'Updates'}
                      {location.pathname.includes('/customization') && 'Customization Center'}
                      {location.pathname.includes('/admin/updates') && 'Admin Updates'}
                      {location.pathname.includes('/profile') && 'Profile'}
                      {location.pathname.includes('/user-guide') && 'User Guide'}
                    </h2>
                  </div>
                </div>
                
                {/* Header Right Section */}
                <div className="flex items-center space-x-2">
                  {/* Desktop Actions - Always visible */}
                  <div className="hidden sm:flex items-center space-x-2">
                    {/* Updates */}
                    <Tooltip content="Updates">
                      <Link
                        to={`/user/${userId}/updates`}
                        className={`relative p-2 rounded-lg transition-colors ${
                          isActiveRoute('/updates')
                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        aria-label="View updates and announcements"
                        aria-current={isActiveRoute('/updates') ? 'page' : undefined}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                        </svg>
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full min-w-[18px] h-[18px]">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                      </Link>
                    </Tooltip>

                    {/* Customization */}
                    <Tooltip content="Customization Center">
                      <Link
                        to={`/user/${userId}/customization`}
                        className={`p-2 rounded-lg transition-colors ${
                          isActiveRoute('/customization')
                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        aria-label="Customization Center"
                        aria-current={isActiveRoute('/customization') ? 'page' : undefined}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                        </svg>
                      </Link>
                    </Tooltip>

                    {/* User Guide */}
                    <Tooltip content="User Guide">
                      <Link
                        to={`/user/${userId}/user-guide`}
                        className={`p-2 rounded-lg transition-colors ${
                          isActiveRoute('/user-guide')
                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        aria-label="User Guide"
                        aria-current={isActiveRoute('/user-guide') ? 'page' : undefined}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </Link>
                    </Tooltip>

                    {/* Admin Panel - Only show for admin users */}
                    {(user?.isAdmin || user?.role === 'admin' || user?.role === 'superadmin') && (
                      <Tooltip content="Admin Panel">
                        <Link
                          to="/admin/updates"
                          className={`p-2 rounded-lg transition-colors ${
                            location.pathname.includes('/admin/updates')
                              ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                              : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                          }`}
                          aria-label="Admin panel - manage updates"
                          aria-current={location.pathname.includes('/admin/updates') ? 'page' : undefined}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </Link>
                      </Tooltip>
                    )}

                    {/* Theme Toggle */}
                    <Tooltip content={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
                      <ThemeToggle />
                    </Tooltip>
                  </div>

                  {/* Mobile Menu Button */}
                  <div className="sm:hidden relative">
                    <button
                      onClick={toggleMobileMenu}
                      className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      aria-label="Open menu"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>

                    {/* Mobile Dropdown Menu */}
                    {mobileMenuOpen && (
                      <>
                        {/* Backdrop */}
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={closeMobileMenu}
                          aria-hidden="true"
                        />
                        
                        {/* Menu */}
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                          <div className="py-2">
                            {/* Updates */}
                            <Link
                              to={`/user/${userId}/updates`}
                              onClick={closeMobileMenu}
                              className={`flex items-center px-4 py-3 text-sm transition-colors ${
                                isActiveRoute('/updates')
                                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                              </svg>
                              Updates
                              {unreadCount > 0 && (
                                <span className="ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full min-w-[20px] h-[20px]">
                                  {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                              )}
                            </Link>

                            {/* Customization */}
                            <Link
                              to={`/user/${userId}/customization`}
                              onClick={closeMobileMenu}
                              className={`flex items-center px-4 py-3 text-sm transition-colors ${
                                isActiveRoute('/customization')
                                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                              </svg>
                              Customization
                            </Link>

                            {/* User Guide */}
                            <Link
                              to={`/user/${userId}/user-guide`}
                              onClick={closeMobileMenu}
                              className={`flex items-center px-4 py-3 text-sm transition-colors ${
                                isActiveRoute('/user-guide')
                                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                              User Guide
                            </Link>

                            {/* Admin Panel - Only show for admin users */}
                            {(user?.isAdmin || user?.role === 'admin' || user?.role === 'superadmin') && (
                              <Link
                                to="/admin/updates"
                                onClick={closeMobileMenu}
                                className={`flex items-center px-4 py-3 text-sm transition-colors ${
                                  location.pathname.includes('/admin/updates')
                                    ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                              >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Admin Panel
                              </Link>
                            )}

                            <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

                            {/* Theme Toggle */}
                            <button
                              onClick={() => {
                                toggleTheme();
                                closeMobileMenu();
                              }}
                              className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                {theme === 'light' ? (
                                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                ) : (
                                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                                )}
                              </svg>
                              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                            </button>

                            {/* Logout */}
                            <button
                              onClick={() => {
                                closeMobileMenu();
                                handleLogoutClick();
                              }}
                              className="flex items-center w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              Logout
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Desktop Logout Button */}
                  <button
                    onClick={handleLogoutClick}
                    className="hidden sm:block p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    aria-label="Logout"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <main 
            id="main-content"
            className="flex-1 overflow-y-auto p-2 lg:p-6 min-h-0"
            role="main"
            aria-label="Main content"
          >
            {children}
          </main>
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
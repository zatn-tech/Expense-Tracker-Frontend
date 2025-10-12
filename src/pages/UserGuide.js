import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useMobile } from '../hooks/useMobile';

const UserGuide = () => {
  const { theme } = useTheme();
  const isMobile = useMobile();
  const [activeSection, setActiveSection] = useState('overview');
  const [activeSubsection, setActiveSubsection] = useState('welcome');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState(new Set(['overview']));
  const [showSearchResults, setShowSearchResults] = useState(false);

  const sections = [
    {
      id: 'overview',
      title: 'Getting Started',
      icon: '🚀',
      subsections: [
        { id: 'welcome', title: 'Welcome to ExpenseTracker', content: 'WelcomeContent' },
        { id: 'setup', title: 'Initial Setup', content: 'SetupContent' },
        { id: 'navigation', title: 'App Navigation', content: 'NavigationContent' }
      ]
    },
    {
      id: 'authentication',
      title: 'Authentication',
      icon: '🔐',
      subsections: [
        { id: 'signup', title: 'Creating Your Account', content: 'SignupContent' },
        { id: 'login', title: 'Logging In', content: 'LoginContent' },
        { id: 'social-login', title: 'Social Login', content: 'SocialLoginContent' },
        { id: 'remember-me', title: 'Remember Me Feature', content: 'RememberMeContent' },
        { id: 'password-reset', title: 'Password Reset', content: 'PasswordResetContent' }
      ]
    },
    {
      id: 'transactions',
      title: 'Transaction Management',
      icon: '💰',
      subsections: [
        { id: 'adding-transactions', title: 'Adding Transactions', content: 'AddingTransactionsContent' },
        { id: 'categories', title: 'Categories & Tags', content: 'CategoriesContent' },
        { id: 'accounts', title: 'Account Management', content: 'AccountsContent' },
        { id: 'transfers', title: 'Account Transfers', content: 'TransfersContent' },
        { id: 'bulk-operations', title: 'Bulk Operations', content: 'BulkOperationsContent' }
      ]
    },
    {
      id: 'email-scanning',
      title: 'Email Transaction Detection',
      icon: '📧',
      subsections: [
        { id: 'email-setup', title: 'Setting Up Email Connections', content: 'EmailSetupContent' },
        { id: 'scanning-process', title: 'How Scanning Works', content: 'ScanningProcessContent' },
        { id: 'transaction-detection', title: 'Transaction Detection', content: 'TransactionDetectionContent' },
        { id: 'approving-transactions', title: 'Approving & Managing', content: 'ApprovingTransactionsContent' },
        { id: 'email-bulk-delete', title: 'Bulk Delete Email Transactions', content: 'EmailBulkDeleteContent' }
      ]
    },
    {
      id: 'budgets',
      title: 'Budget Management',
      icon: '📊',
      subsections: [
        { id: 'creating-budgets', title: 'Creating Budgets', content: 'CreatingBudgetsContent' },
        { id: 'budget-tracking', title: 'Tracking Progress', content: 'BudgetTrackingContent' },
        { id: 'budget-alerts', title: 'Budget Alerts', content: 'BudgetAlertsContent' }
      ]
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      icon: '📈',
      subsections: [
        { id: 'expense-reports', title: 'Expense Reports', content: 'ExpenseReportsContent' },
        { id: 'category-breakdown', title: 'Category Breakdown', content: 'CategoryBreakdownContent' },
        { id: 'trends', title: 'Spending Trends', content: 'TrendsContent' }
      ]
    },
    {
      id: 'settings',
      title: 'Settings & Preferences',
      icon: '⚙️',
      subsections: [
        { id: 'profile-settings', title: 'Profile Settings', content: 'ProfileSettingsContent' },
        { id: 'notifications', title: 'Notifications', content: 'NotificationsContent' },
        { id: 'data-export', title: 'Data Export', content: 'DataExportContent' },
        { id: 'account-deletion', title: 'Account Management', content: 'AccountDeletionContent' }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: '🔧',
      subsections: [
        { id: 'common-issues', title: 'Common Issues', content: 'CommonIssuesContent' },
        { id: 'email-troubleshooting', title: 'Email Connection Issues', content: 'EmailTroubleshootingContent' },
        { id: 'support', title: 'Getting Help', content: 'SupportContent' }
      ]
    }
  ];

  // Search functionality
  const searchResults = sections.flatMap(section => 
    section.subsections.map(subsection => ({
      sectionId: section.id,
      sectionTitle: section.title,
      subsectionId: subsection.id,
      subsectionTitle: subsection.title,
      content: subsection.content
    }))
  ).filter(item => 
    item.subsectionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sectionTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (query) => {
    setSearchQuery(query);
    setShowSearchResults(query.length > 0);
  };

  const handleSearchResultClick = (sectionId, subsectionId) => {
    setActiveSection(sectionId);
    setActiveSubsection(subsectionId);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const renderContent = (contentId) => {
    switch (contentId) {
      case 'WelcomeContent':
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                <span className="text-4xl">🎯</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to ExpenseTracker
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Your comprehensive personal finance management tool that helps you track expenses, 
                manage budgets, and gain insights into your spending patterns.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">✨</span>
                  Key Features
                </h3>
                <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Automatic email transaction detection
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Smart budget tracking and alerts
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Multi-account management
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Detailed reports and analytics
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Secure cloud storage
                  </li>
                </ul>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">🎯</span>
                  What You Can Do
                </h3>
                <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">→</span>
                    Connect your email for automatic transaction detection
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">→</span>
                    Set up budgets and track spending
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">→</span>
                    Manage multiple bank accounts
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">→</span>
                    Generate detailed financial reports
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">→</span>
                    Export data for external analysis
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'SetupContent':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Initial Setup Guide</h2>
            
            <div className="space-y-6">
              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">1️⃣</span>
                  Create Your Account
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Start by creating your ExpenseTracker account. You can sign up using:
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 ml-6">
                  <li>• Email and password</li>
                  <li>• Google account (recommended)</li>
                  <li>• Facebook account</li>
                  <li>• GitHub account</li>
                </ul>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">2️⃣</span>
                  Set Up Your First Account
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Create your first financial account to start tracking transactions:
                </p>
                <ol className="space-y-2 text-gray-600 dark:text-gray-400 ml-6 list-decimal">
                  <li>Go to the Accounts section</li>
                  <li>Click "Add New Account"</li>
                  <li>Enter account details (name, type, initial balance)</li>
                  <li>Save and start adding transactions</li>
                </ol>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">3️⃣</span>
                  Configure Email Scanning (Optional)
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  For automatic transaction detection, set up email connections:
                </p>
                <ol className="space-y-2 text-gray-600 dark:text-gray-400 ml-6 list-decimal">
                  <li>Navigate to Email Scanning section</li>
                  <li>Add your email account (Gmail, Outlook, etc.)</li>
                  <li>Configure IMAP settings if needed</li>
                  <li>Test the connection and start scanning</li>
                </ol>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">4️⃣</span>
                  Set Up Your First Budget
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Create budgets to track your spending goals:
                </p>
                <ol className="space-y-2 text-gray-600 dark:text-gray-400 ml-6 list-decimal">
                  <li>Go to Budgets section</li>
                  <li>Click "Create New Budget"</li>
                  <li>Set budget amount and categories</li>
                  <li>Configure alerts for overspending</li>
                </ol>
              </div>
            </div>
          </div>
        );

      case 'NavigationContent':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">App Navigation</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">🏠</span>
                  Main Navigation
                </h3>
                <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                  <li><strong>Dashboard:</strong> Overview of your finances</li>
                  <li><strong>Transactions:</strong> View and manage all transactions</li>
                  <li><strong>Accounts:</strong> Manage your bank accounts</li>
                  <li><strong>Budgets:</strong> Set and track spending limits</li>
                  <li><strong>Reports:</strong> Generate financial reports</li>
                  <li><strong>Settings:</strong> Configure app preferences</li>
                </ul>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">📱</span>
                  Mobile Navigation
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  On mobile devices, use the hamburger menu (☰) to access all sections.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>• Tap the menu icon in the top-left</li>
                  <li>• Swipe through menu options</li>
                  <li>• Use quick action buttons on dashboard</li>
                </ul>
              </div>
            </div>

            <div className={`p-6 rounded-xl border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="text-2xl mr-3">🔍</span>
                Search & Filters
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Global Search</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Use the search bar to find transactions, categories, or accounts quickly.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Advanced Filters</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Filter by date range, category, amount, or account in most sections.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'SignupContent':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Creating Your Account</h2>
            
            <div className="space-y-6">
              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">📧</span>
                  Email Signup
                </h3>
                <ol className="space-y-3 text-gray-600 dark:text-gray-400 ml-6 list-decimal">
                  <li>Enter your email address</li>
                  <li>Choose a strong password (minimum 8 characters)</li>
                  <li>Confirm your password</li>
                  <li>Click "Sign Up" to create your account</li>
                  <li>Check your email for verification link</li>
                  <li>Click the verification link to activate your account</li>
                </ol>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">🌐</span>
                  Social Signup (Recommended)
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Social signup is faster and more secure. Choose from:
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-3xl mb-2">🔵</div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Google</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Quick setup with Google account</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-3xl mb-2">📘</div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Facebook</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Connect with Facebook</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-3xl mb-2">⚫</div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">GitHub</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">For developers</p>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">✅</span>
                  Account Verification
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  After signing up, you'll need to verify your email address:
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 ml-6">
                  <li>• Check your email inbox (and spam folder)</li>
                  <li>• Click the verification link in the email</li>
                  <li>• Your account will be activated automatically</li>
                  <li>• You can now log in and start using ExpenseTracker</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'LoginContent':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Logging In</h2>
            
            <div className="space-y-6">
              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">🔑</span>
                  Email Login
                </h3>
                <ol className="space-y-2 text-gray-600 dark:text-gray-400 ml-6 list-decimal">
                  <li>Enter your registered email address</li>
                  <li>Enter your password</li>
                  <li>Optionally check "Remember me" to stay logged in</li>
                  <li>Click "Sign In" to access your account</li>
                </ol>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">🌐</span>
                  Social Login
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  If you signed up with a social account, simply click the corresponding button:
                </p>
                <div className="flex flex-wrap gap-3">
                  <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg">
                    <span className="mr-2">🔵</span> Google
                  </button>
                  <button className="flex items-center px-4 py-2 bg-blue-700 text-white rounded-lg">
                    <span className="mr-2">📘</span> Facebook
                  </button>
                  <button className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg">
                    <span className="mr-2">⚫</span> GitHub
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'RememberMeContent':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Remember Me Feature</h2>
            
            <div className={`p-6 rounded-xl border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="text-2xl mr-3">💾</span>
                How It Works
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                The "Remember Me" feature keeps you logged in across browser sessions and devices.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">✅ Remember Me Enabled</h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                    <li>• Stay logged in for 30 days</li>
                    <li>• Works across browser sessions</li>
                    <li>• Works across different devices</li>
                    <li>• Automatic logout after 30 days</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">❌ Remember Me Disabled</h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                    <li>• Stay logged in for 8 hours</li>
                    <li>• Only for current browser session</li>
                    <li>• Must log in again after closing browser</li>
                    <li>• More secure for shared computers</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-xl border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="text-2xl mr-3">🌐</span>
                Works with All Login Methods
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                The Remember Me feature works consistently across all login methods:
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400 ml-6">
                <li>• Email and password login</li>
                <li>• Google social login</li>
                <li>• Facebook social login</li>
                <li>• GitHub social login</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400 mt-4 text-sm">
                <strong>Note:</strong> The Remember Me preference is set once during login and applies to all future sessions until you change it.
              </p>
            </div>
          </div>
        );

      case 'EmailSetupContent':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Setting Up Email Connections</h2>
            
            <div className="space-y-6">
              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">📧</span>
                  What is Email Scanning?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Email scanning automatically detects transaction receipts and bank statements in your emails, 
                  saving you time from manual data entry.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-blue-800 dark:text-blue-300 text-sm">
                    <strong>Supported Email Providers:</strong> Gmail, Outlook, Yahoo, and any IMAP-compatible email service
                  </p>
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">🔧</span>
                  Setting Up Gmail
                </h3>
                <ol className="space-y-3 text-gray-600 dark:text-gray-400 ml-6 list-decimal">
                  <li>Go to Email Scanning section</li>
                  <li>Click "Add Email Connection"</li>
                  <li>Select "Gmail" as provider</li>
                  <li>Enter your Gmail address</li>
                  <li>Use "App Password" (not your regular password)</li>
                  <li>Test the connection</li>
                  <li>Configure scan settings (frequency, folders, etc.)</li>
                </ol>
                
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                    <strong>Gmail App Password:</strong> You need to generate an App Password in your Google Account settings. 
                    Go to Security → 2-Step Verification → App passwords.
                  </p>
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">⚙️</span>
                  Custom IMAP Setup
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  For other email providers, use custom IMAP settings:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Common Settings</h4>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-400 text-sm">
                      <li><strong>Outlook:</strong> outlook.office365.com:993</li>
                      <li><strong>Yahoo:</strong> imap.mail.yahoo.com:993</li>
                      <li><strong>iCloud:</strong> imap.mail.me.com:993</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Security</h4>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-400 text-sm">
                      <li>• Use SSL/TLS encryption</li>
                      <li>• Port 993 for IMAP over SSL</li>
                      <li>• Use App Passwords when available</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">🔒</span>
                  Security & Privacy
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Data Protection</h4>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-400 text-sm">
                      <li>• Emails are processed securely</li>
                      <li>• No email content is stored permanently</li>
                      <li>• Only transaction data is extracted</li>
                      <li>• Connections are encrypted</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Your Control</h4>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-400 text-sm">
                      <li>• Delete connections anytime</li>
                      <li>• Choose which folders to scan</li>
                      <li>• Set scan frequency</li>
                      <li>• Review all detected transactions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'EmailBulkDeleteContent':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bulk Delete Email Transactions</h2>
            
            <div className="space-y-6">
              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">🗑️</span>
                  What is Bulk Delete?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Bulk delete allows you to remove multiple email transactions at once, saving time when cleaning up 
                  detected transactions or managing large numbers of email transactions.
                </p>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">✅</span>
                  How to Select Transactions
                </h3>
                <ol className="space-y-3 text-gray-600 dark:text-gray-400 ml-6 list-decimal">
                  <li>Go to Email Scanning section</li>
                  <li>Scroll to "Detected Transactions"</li>
                  <li>Use checkboxes to select individual transactions</li>
                  <li>Or use "Select All" to select all visible transactions</li>
                  <li>Use status filter to select specific types (pending, rejected, etc.)</li>
                </ol>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">🎯</span>
                  Bulk Delete Options
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">1. Selected Transactions Only</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Delete only the transactions you've selected with checkboxes.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">2. All from Email Connection</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Delete all transactions detected from a specific email account.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">3. All by Status</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Delete all transactions with a specific status (pending, rejected, approved, modified).
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">⚠️</span>
                  Important: Created Transactions Option
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  When deleting email transactions, you can choose whether to also delete actual transactions 
                  that were created from those email transactions.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">Delete Created Transactions</h4>
                    <p className="text-red-700 dark:text-red-400 text-sm">
                      This will remove both the email transaction AND any actual transaction created from it. 
                      Use this when you want to completely remove the transaction from your records.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Keep Created Transactions</h4>
                    <p className="text-green-700 dark:text-green-400 text-sm">
                      This will only remove the email transaction but keep the actual transaction in your records. 
                      Use this when you want to keep the transaction but remove the email detection data.
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">💡</span>
                  Best Practices
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 ml-6">
                  <li>• Use filters to select specific types of transactions</li>
                  <li>• Review the transaction count before confirming deletion</li>
                  <li>• Choose "Keep Created Transactions" for approved transactions</li>
                  <li>• Use bulk delete to clean up rejected or duplicate transactions</li>
                  <li>• Delete old email transactions periodically to keep your data clean</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'SocialLoginContent':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Social Login Options</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google Login
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Sign in with your Google account for quick and secure access.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• One-click authentication</li>
                  <li>• No need to remember passwords</li>
                  <li>• Secure OAuth 2.0 protocol</li>
                </ul>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
                  </svg>
                  Facebook Login
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Connect with Facebook for seamless social authentication.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• Quick social sign-in</li>
                  <li>• Trusted platform integration</li>
                  <li>• Easy account management</li>
                </ul>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" fill="#181717"/>
                  </svg>
                  GitHub Login
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Use your GitHub account for developer-friendly authentication.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• Developer-focused platform</li>
                  <li>• Open source friendly</li>
                  <li>• Secure authentication</li>
                </ul>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">🔒</span>
                  Security Benefits
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Social login provides enhanced security through trusted providers.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• Two-factor authentication support</li>
                  <li>• Regular security updates from providers</li>
                  <li>• No password storage on our servers</li>
                  <li>• Easy account recovery options</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'PasswordResetContent':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Password Reset</h2>
            
            <div className={`p-6 rounded-xl border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="text-2xl mr-3">🔑</span>
                How to Reset Your Password
              </h3>
              
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Step-by-Step Process</h4>
                    <ol className="space-y-3 text-gray-600 dark:text-gray-400">
                      <li className="flex items-start">
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium px-2 py-1 rounded-full mr-3 mt-0.5">1</span>
                        Click "Forgot Password?" on the login page
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium px-2 py-1 rounded-full mr-3 mt-0.5">2</span>
                        Enter your email address
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium px-2 py-1 rounded-full mr-3 mt-0.5">3</span>
                        Check your email for reset instructions
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium px-2 py-1 rounded-full mr-3 mt-0.5">4</span>
                        Click the reset link in the email
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium px-2 py-1 rounded-full mr-3 mt-0.5">5</span>
                        Create a new strong password
                      </li>
                    </ol>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Security Tips</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-green-800 dark:text-green-300 text-sm font-medium">✓ Use a strong password</p>
                        <p className="text-green-700 dark:text-green-400 text-xs">Include uppercase, lowercase, numbers, and symbols</p>
                      </div>
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-blue-800 dark:text-blue-300 text-sm font-medium">✓ Don't reuse passwords</p>
                        <p className="text-blue-700 dark:text-blue-400 text-xs">Use unique passwords for each account</p>
                      </div>
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <p className="text-yellow-800 dark:text-yellow-300 text-sm font-medium">⚠ Check spam folder</p>
                        <p className="text-yellow-700 dark:text-yellow-400 text-xs">Reset emails might end up in spam</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Troubleshooting</h4>
                  <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-1">
                    <li>• Didn't receive the email? Check your spam folder</li>
                    <li>• Link expired? Request a new password reset</li>
                    <li>• Still having issues? Contact support</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'AddingTransactionsContent':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Adding Transactions</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">➕</span>
                  Manual Entry
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Add transactions manually for complete control over your records.
                </p>
                <ol className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>1. Click "Add Transaction" button</li>
                  <li>2. Select account and transaction type</li>
                  <li>3. Enter amount and description</li>
                  <li>4. Choose category and date</li>
                  <li>5. Add notes or tags (optional)</li>
                  <li>6. Save the transaction</li>
                </ol>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">📧</span>
                  Email Detection
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Automatically detect transactions from your email receipts.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• Connect your email account</li>
                  <li>• Enable automatic scanning</li>
                  <li>• Review detected transactions</li>
                  <li>• Approve or reject suggestions</li>
                </ul>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">📁</span>
                  Bulk Import
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Import multiple transactions from CSV or bank files.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• Download CSV template</li>
                  <li>• Fill in transaction data</li>
                  <li>• Upload the file</li>
                  <li>• Review and confirm import</li>
                </ul>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">💡</span>
                  Pro Tips
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• Use consistent descriptions for easy searching</li>
                  <li>• Add tags for better categorization</li>
                  <li>• Set up recurring transactions for bills</li>
                  <li>• Review transactions regularly</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'CategoriesContent':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Categories & Tags</h2>
            
            <div className={`p-6 rounded-xl border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="text-2xl mr-3">🏷️</span>
                Understanding Categories
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Categories help you organize and analyze your spending patterns. 
                They're automatically assigned but can be customized to fit your needs.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Default Categories</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <span className="text-sm">🍔 Food & Dining</span>
                      <span className="text-xs text-gray-500">Essential</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                      <span className="text-sm">🚗 Transportation</span>
                      <span className="text-xs text-gray-500">Essential</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                      <span className="text-sm">🏠 Housing</span>
                      <span className="text-xs text-gray-500">Essential</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                      <span className="text-sm">🎬 Entertainment</span>
                      <span className="text-xs text-gray-500">Optional</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Creating Custom Categories</h4>
                  <ol className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                    <li>1. Go to Categories section</li>
                    <li>2. Click "Add New Category"</li>
                    <li>3. Enter category name and icon</li>
                    <li>4. Choose color and type</li>
                    <li>5. Set budget limit (optional)</li>
                  </ol>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Using Tags</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Tags provide additional context beyond categories. 
                    Use them for specific projects, locations, or special occasions.
                  </p>
                  <div className="space-y-1">
                    <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs mr-1">#business</span>
                    <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs mr-1">#vacation</span>
                    <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs mr-1">#urgent</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'AccountsContent':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Management</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">🏦</span>
                  Bank Accounts
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Track your checking, savings, and other bank accounts.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• Checking accounts for daily expenses</li>
                  <li>• Savings accounts for goals</li>
                  <li>• Money market accounts</li>
                  <li>• Certificates of Deposit (CDs)</li>
                </ul>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">💳</span>
                  Credit Cards
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Monitor credit card balances and payments.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• Track credit card balances</li>
                  <li>• Monitor payment due dates</li>
                  <li>• Track credit utilization</li>
                  <li>• Set up payment reminders</li>
                </ul>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">💰</span>
                  Investment Accounts
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Track your investment portfolio and returns.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• 401(k) and retirement accounts</li>
                  <li>• Individual brokerage accounts</li>
                  <li>• IRA and Roth IRA accounts</li>
                  <li>• Cryptocurrency wallets</li>
                </ul>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">💵</span>
                  Cash & Other
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Track cash, loans, and other financial accounts.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• Physical cash on hand</li>
                  <li>• Personal loans and debts</li>
                  <li>• Mortgage and home equity</li>
                  <li>• Digital wallets (PayPal, Venmo)</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'TransfersContent':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Transfers</h2>
            
            <div className={`p-6 rounded-xl border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="text-2xl mr-3">🔄</span>
                How Transfers Work
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Transfers represent money moving between your accounts. 
                They don't affect your net worth but help track money flow.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Common Transfer Types</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h5 className="font-medium text-blue-800 dark:text-blue-300">Checking to Savings</h5>
                      <p className="text-blue-700 dark:text-blue-400 text-sm">Building emergency fund or saving for goals</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h5 className="font-medium text-green-800 dark:text-green-300">Savings to Investment</h5>
                      <p className="text-green-700 dark:text-green-400 text-sm">Moving money to investment accounts</p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <h5 className="font-medium text-purple-800 dark:text-purple-300">Credit Card Payment</h5>
                      <p className="text-purple-700 dark:text-purple-400 text-sm">Paying off credit card balances</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Creating Transfers</h4>
                  <ol className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                    <li>1. Go to Transfers section</li>
                    <li>2. Click "Add Transfer"</li>
                    <li>3. Select source account</li>
                    <li>4. Select destination account</li>
                    <li>5. Enter amount and date</li>
                    <li>6. Add description (optional)</li>
                    <li>7. Save the transfer</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        );

      case 'BulkOperationsContent':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bulk Operations</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">📊</span>
                  Bulk Edit
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Edit multiple transactions at once to save time.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• Select multiple transactions</li>
                  <li>• Change category for all selected</li>
                  <li>• Update tags or descriptions</li>
                  <li>• Modify account assignments</li>
                </ul>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">🗑️</span>
                  Bulk Delete
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Remove multiple transactions efficiently.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• Select transactions to delete</li>
                  <li>• Confirm deletion action</li>
                  <li>• Review before confirming</li>
                  <li>• Undo option available</li>
                </ul>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">📁</span>
                  Bulk Import
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Import multiple transactions from files.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• Upload CSV or Excel files</li>
                  <li>• Map columns to fields</li>
                  <li>• Preview before importing</li>
                  <li>• Handle duplicate detection</li>
                </ul>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">📤</span>
                  Bulk Export
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Export your data for external analysis.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• Export to CSV format</li>
                  <li>• Filter by date range</li>
                  <li>• Include all transaction details</li>
                  <li>• Download or email results</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'ScanningProcessContent':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">How Email Scanning Works</h2>
            
            <div className={`p-6 rounded-xl border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="text-2xl mr-3">🔍</span>
                The Scanning Process
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Our AI-powered system automatically scans your emails to detect financial transactions 
                and receipts, making expense tracking effortless.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Step-by-Step Process</h4>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium px-2 py-1 rounded-full mr-3 mt-0.5">1</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Email Connection</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Connect your email account securely</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium px-2 py-1 rounded-full mr-3 mt-0.5">2</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Email Scanning</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">AI scans incoming and existing emails</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium px-2 py-1 rounded-full mr-3 mt-0.5">3</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Transaction Detection</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Identifies purchase receipts and transactions</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium px-2 py-1 rounded-full mr-3 mt-0.5">4</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Data Extraction</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Extracts amount, merchant, date, and category</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium px-2 py-1 rounded-full mr-3 mt-0.5">5</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Review & Approve</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">You review and approve detected transactions</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">What Gets Detected</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h5 className="font-medium text-green-800 dark:text-green-300">✅ Purchase Receipts</h5>
                      <p className="text-green-700 dark:text-green-400 text-sm">Online and in-store purchases</p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h5 className="font-medium text-blue-800 dark:text-blue-300">✅ Subscription Bills</h5>
                      <p className="text-blue-700 dark:text-blue-400 text-sm">Monthly recurring charges</p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <h5 className="font-medium text-purple-800 dark:text-purple-300">✅ Utility Bills</h5>
                      <p className="text-purple-700 dark:text-purple-400 text-sm">Electricity, water, internet bills</p>
                    </div>
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <h5 className="font-medium text-yellow-800 dark:text-yellow-300">✅ Bank Notifications</h5>
                      <p className="text-yellow-700 dark:text-yellow-400 text-sm">Account activity and transfers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'TransactionDetectionContent':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction Detection</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">🤖</span>
                  AI Detection
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Our advanced AI analyzes email content to identify financial transactions.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• Natural language processing</li>
                  <li>• Pattern recognition algorithms</li>
                  <li>• Merchant name extraction</li>
                  <li>• Amount and date parsing</li>
                </ul>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">📊</span>
                  Accuracy & Learning
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  The system learns from your corrections to improve accuracy over time.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• 95%+ accuracy rate</li>
                  <li>• Learns from your feedback</li>
                  <li>• Improves with more data</li>
                  <li>• Reduces false positives</li>
                </ul>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">🔒</span>
                  Privacy & Security
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Your email data is processed securely and never stored permanently.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• End-to-end encryption</li>
                  <li>• No permanent email storage</li>
                  <li>• Secure data processing</li>
                  <li>• GDPR compliant</li>
                </ul>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">⚙️</span>
                  Customization
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Customize detection rules to match your specific needs.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• Set detection sensitivity</li>
                  <li>• Add custom keywords</li>
                  <li>• Exclude specific senders</li>
                  <li>• Set minimum amounts</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'ApprovingTransactionsContent':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Approving & Managing Transactions</h2>
            
            <div className={`p-6 rounded-xl border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="text-2xl mr-3">✅</span>
                Review Process
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                All detected transactions require your approval before being added to your account. 
                This ensures accuracy and gives you full control over your financial data.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Review Options</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h5 className="font-medium text-green-800 dark:text-green-300">✓ Approve</h5>
                      <p className="text-green-700 dark:text-green-400 text-sm">Add transaction to your account</p>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <h5 className="font-medium text-red-800 dark:text-red-300">✗ Reject</h5>
                      <p className="text-red-700 dark:text-red-400 text-sm">Don't add this transaction</p>
                    </div>
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <h5 className="font-medium text-yellow-800 dark:text-yellow-300">✏️ Edit</h5>
                      <p className="text-yellow-700 dark:text-yellow-400 text-sm">Modify before approving</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Bulk Actions</h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                    <li>• Select multiple transactions</li>
                    <li>• Approve all selected</li>
                    <li>• Reject all selected</li>
                    <li>• Edit multiple at once</li>
                    <li>• Filter by date or amount</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Smart Suggestions</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    The system learns from your approval patterns to suggest:
                  </p>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400 text-sm">
                    <li>• Likely categories</li>
                    <li>• Account assignments</li>
                    <li>• Tag suggestions</li>
                    <li>• Duplicate detection</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'CreatingBudgetsContent':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Creating Budgets</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Monthly Budgets
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Set spending limits for each category on a monthly basis.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• Set monthly spending limits</li>
                  <li>• Track progress throughout the month</li>
                  <li>• Get alerts when approaching limits</li>
                  <li>• Roll over unused amounts (optional)</li>
                </ul>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Category Budgets
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Allocate specific amounts to different spending categories.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• Food & Dining: $500/month</li>
                  <li>• Transportation: $300/month</li>
                  <li>• Entertainment: $200/month</li>
                  <li>• Shopping: $400/month</li>
                </ul>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Quick Setup
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Use our smart suggestions to create budgets quickly.
                </p>
                <ol className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>1. Go to Budgets section</li>
                  <li>2. Click "Create Budget"</li>
                  <li>3. Choose category and amount</li>
                  <li>4. Set alert thresholds</li>
                  <li>5. Save and start tracking</li>
                </ol>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Best Practices
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• Start with essential categories</li>
                  <li>• Use historical spending data</li>
                  <li>• Set realistic but challenging goals</li>
                  <li>• Review and adjust monthly</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'BudgetTrackingContent':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tracking Progress</h2>
            
            <div className={`p-6 rounded-xl border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <svg className="w-6 h-6 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Visual Progress Tracking
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Monitor your budget performance with intuitive charts and progress indicators.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Progress Bars</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Food & Dining</span>
                        <span>$450 / $500</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{width: '90%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Transportation</span>
                        <span>$180 / $300</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '60%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Entertainment</span>
                        <span>$220 / $200</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{width: '110%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Status Indicators</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">On track</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Approaching limit</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Over budget</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Quick Actions</h4>
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
                      View detailed breakdown
                    </button>
                    <button className="w-full text-left px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-sm">
                      Adjust budget
                    </button>
                    <button className="w-full text-left px-3 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-sm">
                      Set up alerts
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'BudgetAlertsContent':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Budget Alerts</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Alert Types
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-300">80% Warning</h4>
                    <p className="text-yellow-700 dark:text-yellow-400 text-sm">Get notified when you reach 80% of your budget</p>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <h4 className="font-medium text-red-800 dark:text-red-300">100% Exceeded</h4>
                    <p className="text-red-700 dark:text-red-400 text-sm">Alert when you go over budget</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300">Weekly Summary</h4>
                    <p className="text-blue-700 dark:text-blue-400 text-sm">Weekly budget status report</p>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V1H4v4zM15 1h5v6h-5V1z" />
                  </svg>
                  Notification Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Email notifications</span>
                    <div className="w-12 h-6 bg-green-500 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Push notifications</span>
                    <div className="w-12 h-6 bg-green-500 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">SMS alerts</span>
                    <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'ExpenseReportsContent':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Expense Reports</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Monthly Reports
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Generate comprehensive monthly expense reports with detailed breakdowns.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• Total spending by category</li>
                  <li>• Month-over-month comparisons</li>
                  <li>• Budget vs actual spending</li>
                  <li>• Top merchants and transactions</li>
                </ul>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Custom Date Ranges
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Create reports for any custom time period to analyze specific spending patterns.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• Select start and end dates</li>
                  <li>• Compare different periods</li>
                  <li>• Holiday spending analysis</li>
                  <li>• Quarterly or yearly reports</li>
                </ul>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Options
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Export your reports in multiple formats for external analysis.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• PDF for presentations</li>
                  <li>• CSV for spreadsheet analysis</li>
                  <li>• Excel with charts</li>
                  <li>• Email reports automatically</li>
                </ul>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Key Insights
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Get actionable insights from your spending data.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• Spending trends and patterns</li>
                  <li>• Budget performance analysis</li>
                  <li>• Savings opportunities</li>
                  <li>• Financial health score</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'CategoryBreakdownContent':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Category Breakdown</h2>
            
            <div className={`p-6 rounded-xl border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <svg className="w-6 h-6 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                Visual Spending Analysis
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Understand your spending patterns with interactive pie charts and detailed breakdowns by category.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Category Distribution</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                        <span className="text-sm font-medium">Food & Dining</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">$1,250</div>
                        <div className="text-xs text-gray-500">35%</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-sm font-medium">Transportation</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">$800</div>
                        <div className="text-xs text-gray-500">22%</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
                        <span className="text-sm font-medium">Entertainment</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">$600</div>
                        <div className="text-xs text-gray-500">17%</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                        <span className="text-sm font-medium">Shopping</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">$500</div>
                        <div className="text-xs text-gray-500">14%</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                        <span className="text-sm font-medium">Other</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">$450</div>
                        <div className="text-xs text-gray-500">12%</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Analysis Tools</h4>
                  <div className="space-y-3">
                    <button className="w-full text-left p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                      <div className="font-medium">Compare with previous month</div>
                      <div className="text-sm opacity-75">See spending changes</div>
                    </button>
                    <button className="w-full text-left p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                      <div className="font-medium">Set category budgets</div>
                      <div className="text-sm opacity-75">Create spending limits</div>
                    </button>
                    <button className="w-full text-left p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                      <div className="font-medium">Export detailed report</div>
                      <div className="text-sm opacity-75">Download for analysis</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'TrendsContent':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Spending Trends</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Monthly Trends
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Track your spending patterns over time with interactive charts.
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">This Month</span>
                    <span className="font-semibold text-green-600">$3,200</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Last Month</span>
                    <span className="font-semibold text-red-600">$3,800</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Change</span>
                    <span className="font-semibold text-green-600">-15.8%</span>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Category Trends
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  See which categories are increasing or decreasing over time.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Food & Dining</span>
                    <span className="text-sm text-red-500">↗ +12%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Transportation</span>
                    <span className="text-sm text-green-500">↘ -8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Entertainment</span>
                    <span className="text-sm text-red-500">↗ +25%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'ProfileSettingsContent':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Personal Information
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Update your personal details and account information.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• Name and email address</li>
                  <li>• Profile picture upload</li>
                  <li>• Phone number and address</li>
                  <li>• Time zone preferences</li>
                </ul>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Security Settings
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Manage your account security and privacy settings.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• Change password</li>
                  <li>• Two-factor authentication</li>
                  <li>• Login activity monitoring</li>
                  <li>• Privacy controls</li>
                </ul>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Preferences
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Customize your app experience and display preferences.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• Theme selection (light/dark)</li>
                  <li>• Language and region</li>
                  <li>• Currency and date format</li>
                  <li>• Dashboard layout</li>
                </ul>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Account Status
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  View your account status and subscription details.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• Account type and limits</li>
                  <li>• Subscription status</li>
                  <li>• Storage usage</li>
                  <li>• Account verification</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'NotificationsContent':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h2>
            
            <div className={`p-6 rounded-xl border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <svg className="w-6 h-6 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V1H4v4zM15 1h5v6h-5V1z" />
                </svg>
                Notification Preferences
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Control how and when you receive notifications about your financial activity.
              </p>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Budget Alerts</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div>
                        <div className="font-medium text-yellow-800 dark:text-yellow-300">80% Budget Warning</div>
                        <div className="text-sm text-yellow-700 dark:text-yellow-400">Get notified when approaching budget limits</div>
                      </div>
                      <div className="w-12 h-6 bg-yellow-500 rounded-full relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div>
                        <div className="font-medium text-red-800 dark:text-red-300">Budget Exceeded</div>
                        <div className="text-sm text-red-700 dark:text-red-400">Alert when you go over budget</div>
                      </div>
                      <div className="w-12 h-6 bg-red-500 rounded-full relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Transaction Alerts</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div>
                        <div className="font-medium text-blue-800 dark:text-blue-300">Large Transactions</div>
                        <div className="text-sm text-blue-700 dark:text-blue-400">Notify for transactions over $500</div>
                      </div>
                      <div className="w-12 h-6 bg-blue-500 rounded-full relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div>
                        <div className="font-medium text-green-800 dark:text-green-300">Email Transactions</div>
                        <div className="text-sm text-green-700 dark:text-green-400">New transactions detected from email</div>
                      </div>
                      <div className="w-12 h-6 bg-green-500 rounded-full relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Delivery Methods</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-300">Email</span>
                      <div className="w-12 h-6 bg-green-500 rounded-full relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-300">Push</span>
                      <div className="w-12 h-6 bg-green-500 rounded-full relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-300">SMS</span>
                      <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'DataExportContent':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Data Export</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Formats
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Export your financial data in various formats for analysis.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• CSV for spreadsheet analysis</li>
                  <li>• PDF for reports and presentations</li>
                  <li>• Excel with charts and formatting</li>
                  <li>• JSON for developers</li>
                </ul>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Data Selection
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Choose what data to include in your export.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• All transactions or filtered</li>
                  <li>• Date range selection</li>
                  <li>• Specific categories only</li>
                  <li>• Include metadata and tags</li>
                </ul>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Scheduled Exports
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Set up automatic exports on a regular schedule.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• Monthly financial reports</li>
                  <li>• Weekly transaction summaries</li>
                  <li>• Quarterly tax reports</li>
                  <li>• Email delivery options</li>
                </ul>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Security & Privacy
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Your data is protected during export and transfer.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• Encrypted file downloads</li>
                  <li>• Secure email delivery</li>
                  <li>• Automatic file expiration</li>
                  <li>• Audit trail logging</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'AccountDeletionContent':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Management</h2>
            
            <div className={`p-6 rounded-xl border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <svg className="w-6 h-6 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Account Deletion
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              
              <div className="space-y-6">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">⚠️ Warning</h4>
                  <p className="text-red-700 dark:text-red-400 text-sm">
                    Deleting your account will permanently remove all your data including transactions, budgets, 
                    reports, and settings. This action cannot be undone.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">What will be deleted:</h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                    <li>• All transaction records</li>
                    <li>• Budget configurations</li>
                    <li>• Email connections and settings</li>
                    <li>• Reports and analytics data</li>
                    <li>• Account preferences</li>
                    <li>• Profile information</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Before deleting your account:</h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                    <li>• Export your data if you want to keep it</li>
                    <li>• Cancel any active subscriptions</li>
                    <li>• Download any important reports</li>
                    <li>• Consider deactivating instead of deleting</li>
                  </ul>
                </div>
                
                <div className="flex space-x-4">
                  <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    Delete Account
                  </button>
                  <button className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'CommonIssuesContent':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Common Issues</h2>
            
            <div className="space-y-6">
              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Login Problems
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">Can't log in to my account</h4>
                    <ul className="text-red-700 dark:text-red-400 text-sm space-y-1">
                      <li>• Check your email and password</li>
                      <li>• Try resetting your password</li>
                      <li>• Clear browser cache and cookies</li>
                      <li>• Try a different browser or incognito mode</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">Social login not working</h4>
                    <ul className="text-yellow-700 dark:text-yellow-400 text-sm space-y-1">
                      <li>• Check if pop-ups are blocked</li>
                      <li>• Try logging out and back in</li>
                      <li>• Check your social media account settings</li>
                      <li>• Contact support if issue persists</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Data Issues
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Transactions not showing</h4>
                    <ul className="text-blue-700 dark:text-blue-400 text-sm space-y-1">
                      <li>• Check your date filters</li>
                      <li>• Refresh the page</li>
                      <li>• Verify account selection</li>
                      <li>• Check if transactions are pending approval</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Incorrect transaction amounts</h4>
                    <ul className="text-green-700 dark:text-green-400 text-sm space-y-1">
                      <li>• Edit the transaction manually</li>
                      <li>• Check for duplicate entries</li>
                      <li>• Verify the original receipt</li>
                      <li>• Report the issue to support</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Performance Issues
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">App running slowly</h4>
                    <ul className="text-purple-700 dark:text-purple-400 text-sm space-y-1">
                      <li>• Clear browser cache and cookies</li>
                      <li>• Close other browser tabs</li>
                      <li>• Check your internet connection</li>
                      <li>• Try refreshing the page</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">Charts not loading</h4>
                    <ul className="text-yellow-700 dark:text-yellow-400 text-sm space-y-1">
                      <li>• Wait a few moments for data to load</li>
                      <li>• Check if you have enough data</li>
                      <li>• Try switching to a different time period</li>
                      <li>• Refresh the page if needed</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'EmailTroubleshootingContent':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Email Connection Issues</h2>
            
            <div className="space-y-6">
              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Connection Failed
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">Gmail Connection Issues</h4>
                    <ul className="text-red-700 dark:text-red-400 text-sm space-y-1">
                      <li>• Enable 2-factor authentication on Gmail</li>
                      <li>• Generate an App Password for this app</li>
                      <li>• Check if IMAP is enabled in Gmail settings</li>
                      <li>• Verify your Gmail credentials</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">Outlook Connection Issues</h4>
                    <ul className="text-yellow-700 dark:text-yellow-400 text-sm space-y-1">
                      <li>• Use your full email address as username</li>
                      <li>• Check if IMAP is enabled in Outlook</li>
                      <li>• Verify server settings (imap-mail.outlook.com)</li>
                      <li>• Try using OAuth2 authentication</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Scanning Problems
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">No transactions detected</h4>
                    <ul className="text-blue-700 dark:text-blue-400 text-sm space-y-1">
                      <li>• Check if email scanning is enabled</li>
                      <li>• Verify your email has transaction receipts</li>
                      <li>• Check spam folder for missed emails</li>
                      <li>• Adjust detection sensitivity settings</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Too many false positives</h4>
                    <ul className="text-green-700 dark:text-green-400 text-sm space-y-1">
                      <li>• Adjust detection sensitivity</li>
                      <li>• Add keywords to exclude list</li>
                      <li>• Block specific senders</li>
                      <li>• Set minimum transaction amounts</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'SupportContent':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Getting Help</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Contact Support
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Get help from our support team for any issues or questions.
                </p>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="font-medium text-blue-800 dark:text-blue-300">Email Support</div>
                    <div className="text-sm text-blue-700 dark:text-blue-400">support@expensetracker.com</div>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="font-medium text-green-800 dark:text-green-300">Live Chat</div>
                    <div className="text-sm text-green-700 dark:text-green-400">Available 24/7</div>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="font-medium text-purple-800 dark:text-purple-300">Phone Support</div>
                    <div className="text-sm text-purple-700 dark:text-purple-400">1-800-EXPENSE</div>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Resources
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Access helpful resources and documentation.
                </p>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                    <div className="font-medium">FAQ</div>
                    <div className="text-sm opacity-75">Frequently asked questions</div>
                  </button>
                  <button className="w-full text-left p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                    <div className="font-medium">Video Tutorials</div>
                    <div className="text-sm opacity-75">Step-by-step guides</div>
                  </button>
                  <button className="w-full text-left p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                    <div className="font-medium">Community Forum</div>
                    <div className="text-sm opacity-75">Connect with other users</div>
                  </button>
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Response Times
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Typical response times for different support channels.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Live Chat</span>
                    <span className="text-sm font-medium text-green-600">Immediate</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Email</span>
                    <span className="text-sm font-medium text-blue-600">Within 24 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Phone</span>
                    <span className="text-sm font-medium text-purple-600">Within 2 hours</span>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Report a Bug
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Found a bug? Help us improve by reporting it.
                </p>
                <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Report Bug
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Content Coming Soon</h3>
            <p className="text-gray-500 dark:text-gray-400">
              This section is being prepared. Check back soon for detailed information.
            </p>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0, -8px, 0);
          }
          70% {
            transform: translate3d(0, -4px, 0);
          }
          90% {
            transform: translate3d(0, -2px, 0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.4s ease-out;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.4s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        
        .animate-pulse {
          animation: pulse 2s infinite;
        }
        
        .animate-bounce {
          animation: bounce 1s infinite;
        }
        
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .dark .glass-effect {
          background: rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="animate-scaleIn">
            <div className="inline-flex items-center justify-center w-20 h-20 gradient-bg rounded-full mb-6 animate-pulse">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold gradient-text mb-4 animate-fadeIn">
              User Guide
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8 animate-slideInLeft">
              Everything you need to know about using ExpenseTracker effectively. 
              Learn about features, tips, and best practices.
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto animate-slideInRight">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search user guide..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className={`block w-full pl-12 pr-4 py-4 border-2 rounded-xl leading-5 transition-all duration-300 hover-lift ${
                  theme === 'dark' 
                    ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 glass-effect' 
                    : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 glass-effect'
                } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearch('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className={`absolute z-10 w-full mt-1 rounded-lg shadow-lg border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="py-1">
                  {searchResults.slice(0, 5).map((result, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchResultClick(result.sectionId, result.subsectionId)}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                      }`}
                    >
                      <div className="font-medium">{result.subsectionTitle}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{result.sectionTitle}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className={`lg:w-80 flex-shrink-0 ${isMobile ? 'order-2' : 'order-1'} animate-slideInLeft`}>
            <div className={`sticky top-8 rounded-2xl border-2 hover-lift ${
              theme === 'dark' ? 'bg-gray-800/80 border-gray-700 glass-effect' : 'bg-white/80 border-gray-200 glass-effect'
            }`}>
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold gradient-text">
                    Table of Contents
                  </h2>
                </div>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <div key={section.id}>
                      <button
                        onClick={() => {
                          setActiveSection(section.id);
                          setActiveSubsection(section.subsections[0]?.id || '');
                          toggleSection(section.id);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-between group hover-lift ${
                          activeSection === section.id
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="mr-3 text-xl transition-transform duration-200 group-hover:scale-110">
                            {section.icon}
                          </span>
                          <span className="font-semibold">{section.title}</span>
                        </div>
                        <svg 
                          className={`w-5 h-5 transition-all duration-300 ${
                            expandedSections.has(section.id) ? 'rotate-180 scale-110' : 'group-hover:scale-110'
                          }`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {expandedSections.has(section.id) && (
                        <div className="ml-6 mt-2 space-y-1 animate-fadeIn">
                          {section.subsections.map((subsection) => (
                            <button
                              key={subsection.id}
                              onClick={() => setActiveSubsection(subsection.id)}
                              className={`w-full text-left px-4 py-3 text-sm rounded-lg transition-all duration-300 flex items-center group hover-lift ${
                                activeSubsection === subsection.id
                                  ? 'text-blue-600 dark:text-blue-400 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 shadow-md border-l-4 border-blue-500'
                                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:shadow-sm'
                              }`}
                            >
                              <span className="flex-1 font-medium">{subsection.title}</span>
                              {activeSubsection === subsection.id && (
                                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className={`flex-1 ${isMobile ? 'order-1' : 'order-2'} animate-slideInRight`}>
            <div className={`rounded-2xl border-2 hover-lift ${
              theme === 'dark' ? 'bg-gray-800/80 border-gray-700 glass-effect' : 'bg-white/80 border-gray-200 glass-effect'
            }`}>
              {/* Breadcrumb Navigation */}
              {activeSection && activeSubsection && (
                <div className="px-8 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <nav className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">User Guide</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-gray-500 dark:text-gray-400">
                      {sections.find(s => s.id === activeSection)?.title}
                    </span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {sections
                        .find(s => s.id === activeSection)
                        ?.subsections.find(s => s.id === activeSubsection)
                        ?.title}
                    </span>
                  </nav>
                </div>
              )}
              
              <div className="p-8">
                {activeSection && activeSubsection && (
                  <div className="animate-fadeIn">
                    {renderContent(
                      sections
                        .find(s => s.id === activeSection)
                        ?.subsections.find(s => s.id === activeSubsection)
                        ?.content || ''
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserGuide;


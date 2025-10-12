// API Configuration
// Removed MOBILE_CONFIG import to force production API

// PRODUCTION API - Always use the production URL for ALL devices
const getApiBaseUrl = () => {
  const productionUrl = 'https://expenseapi.zatn.in';
  return productionUrl;
};

const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  ME: `${API_BASE_URL}/api/auth/me`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
  UPDATE_PASSWORD: `${API_BASE_URL}/api/auth/update-password`,
  RESEND_VERIFICATION: `${API_BASE_URL}/api/auth/resend-verification`,
  
  // Social auth endpoints
  SOCIAL_AUTH_STATUS: `${API_BASE_URL}/api/auth/status`,
  GOOGLE_AUTH: `${API_BASE_URL}/api/auth/google`,
  FACEBOOK_AUTH: `${API_BASE_URL}/api/auth/facebook`,
  GITHUB_AUTH: `${API_BASE_URL}/api/auth/github`,
  
  // User endpoints
  USER_PROFILE: (userId) => `${API_BASE_URL}/api/user/${userId}/profile`,
  USER_TRANSACTIONS: (userId) => `${API_BASE_URL}/api/user/${userId}/transactions`,
  USER_BUDGETS: (userId) => `${API_BASE_URL}/api/user/${userId}/budgets`,
  USER_GOALS: (userId) => `${API_BASE_URL}/api/user/${userId}/goals`,
  USER_CATEGORIES: (userId) => `${API_BASE_URL}/api/user/${userId}/categories`,
  USER_RECURRING_TRANSACTIONS: (userId) => `${API_BASE_URL}/api/user/${userId}/recurring-transactions`,
  USER_CHANGE_PASSWORD: (userId) => `${API_BASE_URL}/api/user/${userId}/change-password`,
USER_UPLOAD_PICTURE: (userId) => `${API_BASE_URL}/api/user/${userId}/upload-picture`,
  USERS: (userId) => `${API_BASE_URL}/api/user/${userId}`,
  USER_DELETE_ACCOUNT: (userId) => `${API_BASE_URL}/api/user/${userId}`,
  USER_BALANCE_PREFERENCES: (userId) => `${API_BASE_URL}/api/user/${userId}/balance-preferences`,
  
  // Account endpoints
  USER_ACCOUNTS: (userId) => `${API_BASE_URL}/api/user/${userId}/accounts`,
  USER_ACCOUNT: (userId, accountId) => `${API_BASE_URL}/api/user/${userId}/accounts/${accountId}`,
  USER_ACCOUNT_DEFAULT: (userId, accountId) => `${API_BASE_URL}/api/user/${userId}/accounts/${accountId}/default`,
  USER_ACCOUNT_BALANCE_HISTORY: (userId, accountId) => `${API_BASE_URL}/api/user/${userId}/accounts/${accountId}/balance-history`,
  USER_ACCOUNT_ADJUST_BALANCE: (userId, accountId) => `${API_BASE_URL}/api/user/${userId}/accounts/${accountId}/adjust-balance`,
  USER_ACCOUNT_STATS: (userId, accountId) => `${API_BASE_URL}/api/user/${userId}/accounts/${accountId}/stats`,
  USER_ACCOUNT_INTEGRATE: (userId) => `${API_BASE_URL}/api/user/${userId}/accounts/integrate`,
  USER_ACCOUNT_SYNC: (userId, accountId) => `${API_BASE_URL}/api/user/${userId}/accounts/${accountId}/sync`,
  USER_ACCOUNT_RECONCILIATION: (userId, accountId) => `${API_BASE_URL}/api/user/${userId}/accounts/${accountId}/reconciliation`,
  
  // Transaction endpoints
  USER_TRANSACTIONS_CATEGORY_EXPENSES: (userId, period = 'all') => `${API_BASE_URL}/api/user/${userId}/transactions/category-expenses/${period}`,
  USER_TRANSACTIONS_DAILY: (userId) => `${API_BASE_URL}/api/user/${userId}/transactions/daily`,
  USER_TRANSACTIONS_IMPORT_PREVIEW: (userId) => `${API_BASE_URL}/api/user/${userId}/transactions/import/preview`,
  USER_TRANSACTIONS_IMPORT: (userId, fileType) => `${API_BASE_URL}/api/user/${userId}/transactions/import/${fileType}`,
  USER_TRANSACTIONS_TEMPLATE: (userId, fileType) => `${API_BASE_URL}/api/user/${userId}/transactions/template/${fileType}`,
  USER_TRANSACTIONS_IMPORT_BATCH: (userId) => `${API_BASE_URL}/api/user/${userId}/transactions/import/batch`,
  
  // Category endpoints
  USER_CATEGORIES_TYPE: (userId, type) => `${API_BASE_URL}/api/user/${userId}/categories/${type}`,
  
  // Budget endpoints
  USER_BUDGETS_STATS_OVERVIEW: (userId, period) => `${API_BASE_URL}/api/user/${userId}/budgets/stats/overview?period=${period}`,
  USER_BUDGETS_ALERTS: (userId) => `${API_BASE_URL}/api/user/${userId}/budgets/alerts`,
  USER_BUDGETS_UPDATE: (userId, budgetId) => `${API_BASE_URL}/api/user/${userId}/budgets/${budgetId}`,
  
  // Goal endpoints
  USER_GOALS_CALCULATE_PROGRESS: (userId, goalId) => `${API_BASE_URL}/api/user/${userId}/goals/${goalId}/calculate-progress`,
  
  // Recurring transaction endpoints
  USER_RECURRING_TRANSACTIONS_PROCESS: (userId) => `${API_BASE_URL}/api/user/${userId}/recurring-transactions/process`,
  
  // Export endpoints
  USER_EXPORT_SUMMARY: (userId) => `${API_BASE_URL}/api/user/${userId}/summary`,
  USER_EXPORT_PDF: (userId) => `${API_BASE_URL}/api/user/${userId}/export/pdf`,
  USER_EXPORT_EXCEL: (userId) => `${API_BASE_URL}/api/user/${userId}/export/excel`,
  USER_EXPORT_ALL_DATA: (userId) => `${API_BASE_URL}/api/user/${userId}/export/all-data`,
  USER_EXPORT_ARCHIVE: (userId) => `${API_BASE_URL}/api/user/${userId}/export/archive`,
  USER_EXPORT_TRANSACTIONS_CSV: (userId) => `${API_BASE_URL}/api/user/${userId}/export/transactions-csv`,
  
  // Notification endpoints
  NOTIFICATIONS_SUBSCRIBE: `${API_BASE_URL}/api/notifications/subscribe`,
  NOTIFICATIONS_PREFERENCES: `${API_BASE_URL}/api/notifications/preferences`,
  
  // Notification test endpoints
  NOTIFICATIONS_TEST_BUDGET_ALERT: `${API_BASE_URL}/api/notifications/test/budget-alert`,
  NOTIFICATIONS_TEST_RECURRING_REMINDER: `${API_BASE_URL}/api/notifications/test/recurring-reminder`,
  NOTIFICATIONS_TEST_WEEKLY_REPORT: `${API_BASE_URL}/api/notifications/test/weekly-report`,
  NOTIFICATIONS_TEST_MONTHLY_REPORT: `${API_BASE_URL}/api/notifications/test/monthly-report`,
  NOTIFICATIONS_TEST_GOAL_UPDATE: `${API_BASE_URL}/api/notifications/test/goal-update`,
  
  // Transfer endpoints
  TRANSFERS: `${API_BASE_URL}/api/transfers`,
  TRANSFER: (transferId) => `${API_BASE_URL}/api/transfers/${transferId}`,
  TRANSFER_VALIDATE: `${API_BASE_URL}/api/transfers/validate`,
  TRANSFER_STATS: `${API_BASE_URL}/api/transfers/stats`,

  // Email Detection endpoints
  USER_EMAIL_CONNECTIONS: (userId) => `${API_BASE_URL}/api/user/${userId}/email-connections`,
  USER_EMAIL_CONNECTION: (userId, connectionId) => `${API_BASE_URL}/api/user/${userId}/email-connections/${connectionId}`,
  USER_EMAIL_CONNECTION_TEST: (userId, connectionId) => `${API_BASE_URL}/api/user/${userId}/email-connections/${connectionId}/test`,
  USER_EMAIL_CONNECTION_SCAN: (userId, connectionId) => `${API_BASE_URL}/api/user/${userId}/email-connections/${connectionId}/scan`,
  USER_EMAIL_SCAN: (userId, connectionId) => `${API_BASE_URL}/api/user/${userId}/email-connections/${connectionId}/scan`,
  USER_EMAIL_CONNECTION_REFRESH_TOKENS: (userId, connectionId) => `${API_BASE_URL}/api/user/${userId}/email-connections/${connectionId}/refresh-tokens`,
  USER_EMAIL_TRANSACTIONS: (userId) => `${API_BASE_URL}/api/user/${userId}/email-transactions`,
  USER_EMAIL_TRANSACTION: (userId, transactionId) => `${API_BASE_URL}/api/user/${userId}/email-transactions/${transactionId}`,
  USER_EMAIL_TRANSACTION_APPROVE: (userId, transactionId) => `${API_BASE_URL}/api/user/${userId}/email-transactions/${transactionId}/approve`,
  USER_EMAIL_TRANSACTION_REJECT: (userId, transactionId) => `${API_BASE_URL}/api/user/${userId}/email-transactions/${transactionId}/reject`,
  USER_EMAIL_TRANSACTION_MODIFY: (userId, transactionId) => `${API_BASE_URL}/api/user/${userId}/email-transactions/${transactionId}/modify`,
  USER_EMAIL_TRANSACTIONS_PROCESS_PENDING: (userId) => `${API_BASE_URL}/api/user/${userId}/email-transactions/process-pending`,
  USER_EMAIL_TRANSACTIONS_BULK_DELETE: (userId) => `${API_BASE_URL}/api/user/${userId}/email-transactions/bulk-delete`,
  USER_EMAIL_SCANNING_STATS: (userId) => `${API_BASE_URL}/api/user/${userId}/email-scanning/stats`,

  NOTIFICATIONS_TEST_LOW_BALANCE_ALERT: `${API_BASE_URL}/api/notifications/test/low-balance-alert`,
  
  // Setup endpoints
  SETUP: `${API_BASE_URL}/api/setup`,
  
  // Updates endpoints
  USER_UPDATES: (userId) => `${API_BASE_URL}/api/user/${userId}/updates`,
  USER_UPDATES_UNREAD_COUNT: (userId) => `${API_BASE_URL}/api/user/${userId}/updates/unread-count`,
  USER_UPDATES_STATS: (userId) => `${API_BASE_URL}/api/user/${userId}/updates/stats`,
  USER_UPDATE_MARK_AS_READ: (userId, updateId) => `${API_BASE_URL}/api/user/${userId}/updates/${updateId}/read`,
  USER_UPDATES_MARK_ALL_READ: (userId) => `${API_BASE_URL}/api/user/${userId}/updates/mark-all-read`,
  
  // User Preferences endpoints
  USER_PREFERENCES: (userId) => `${API_BASE_URL}/api/user/${userId}/preferences`,
  USER_PREFERENCES_SECTION: (userId, section) => `${API_BASE_URL}/api/user/${userId}/preferences/${section}`,
  USER_PREFERENCES_RESET: (userId) => `${API_BASE_URL}/api/user/${userId}/preferences/reset`,
  USER_PREFERENCES_EXPORT: (userId) => `${API_BASE_URL}/api/user/${userId}/preferences/export`,
  USER_PREFERENCES_IMPORT: (userId) => `${API_BASE_URL}/api/user/${userId}/preferences/import`,
  
  // Admin endpoints
  ADMIN_UPDATES: `${API_BASE_URL}/api/admin/updates`,
  ADMIN_UPDATES_STATS: `${API_BASE_URL}/api/admin/updates/stats`,
  
  // Upload endpoints
  UPLOAD_BASE: `${API_BASE_URL}/uploads`,
};

export default API_BASE_URL; 
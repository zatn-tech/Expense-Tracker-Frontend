// Notification trigger functions for different types of notifications
import { ensureNotificationPermission } from './budgetNotificationTrigger';

// Helper function to get user token
const getUserToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Helper function to get notification preferences
const getNotificationPreferences = () => {
  const saved = localStorage.getItem('notificationPreferences');
  return saved ? JSON.parse(saved) : {
    budgetAlerts: true,
    recurringReminders: true,
    weeklyReports: true,
    monthlyReports: true,
    goalUpdates: true,
    lowBalanceAlerts: true
  };
};

// Generic browser notification function
const sendBrowserNotification = (title, body, options = {}) => {
  console.log('🔔 sendBrowserNotification called:', { title, body, options });
  
  try {
    if (!('Notification' in window)) {
      console.log('❌ Browser notifications are not supported');
      return false;
    }

    console.log('✅ Browser supports notifications');
    console.log('📋 Current notification permission:', Notification.permission);

    if (Notification.permission !== 'granted') {
      console.log('❌ Notification permission not granted. Current permission:', Notification.permission);
      return false;
    }

    console.log('✅ Notification permission granted');

    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'expense-tracker',
      requireInteraction: false,
      silent: false,
      ...options
    });

    console.log('✅ Browser notification created:', notification);

    // Auto-close after 10 seconds
    setTimeout(() => {
      notification.close();
      console.log('✅ Notification auto-closed');
    }, 10000);

    // Handle click to navigate
    notification.onclick = () => {
      window.focus();
      notification.close();
      console.log('✅ Notification clicked, window focused');
    };

    console.log('✅ Browser notification triggered successfully');
    return true;
  } catch (error) {
    console.error('❌ Error sending browser notification:', error);
    return false;
  }
};

// Budget Alert Notifications
export const triggerBudgetBrowserNotification = (alert) => {
  console.log('🔔 triggerBudgetBrowserNotification called with alert:', alert);
  
  const preferences = getNotificationPreferences();
  if (!preferences.budgetAlerts) {
    console.log('❌ Budget alerts disabled in preferences');
    return false;
  }

  try {
    // The alert object from backend has: title, message, type, budgetId, alertType
    const title = alert.title || (alert.isExceeded ? 'Budget Exceeded!' : 'Budget Alert');
    const body = alert.message || 'Budget alert triggered';

    return sendBrowserNotification(title, body, {
      data: {
        url: '/budgets',
        budgetId: alert.budgetId,
        alertType: alert.alertType,
        type: alert.type
      }
    });
  } catch (error) {
    console.error('Error triggering budget browser notification:', error);
    return false;
  }
};

// Recurring Transaction Reminders
export const triggerRecurringReminder = async (recurringTransaction) => {
  console.log('🔔 triggerRecurringReminder called:', recurringTransaction);
  
  const preferences = getNotificationPreferences();
  if (!preferences.recurringReminders) {
    console.log('❌ Recurring reminders disabled in preferences');
    return false;
  }

  const title = 'Recurring Transaction Due';
  const body = `Your recurring ${recurringTransaction.type} of ₹${recurringTransaction.amount} for ${recurringTransaction.category} is due soon.`;

  return sendBrowserNotification(title, body, {
    data: {
      url: '/recurring-transactions',
      type: 'recurring-reminder',
      transactionId: recurringTransaction._id
    }
  });
};

// Weekly Report Notifications
export const triggerWeeklyReport = async (reportData) => {
  console.log('🔔 triggerWeeklyReport called:', reportData);
  
  const preferences = getNotificationPreferences();
  if (!preferences.weeklyReports) {
    console.log('❌ Weekly reports disabled in preferences');
    return false;
  }

  const title = 'Weekly Financial Report';
  const body = `Your weekly spending: ₹${reportData.totalSpent}. Income: ₹${reportData.totalIncome}. Net: ₹${reportData.netAmount}.`;

  return sendBrowserNotification(title, body, {
    data: {
      url: '/reports',
      type: 'weekly-report',
      reportId: reportData.reportId
    }
  });
};

// Monthly Report Notifications
export const triggerMonthlyReport = async (reportData) => {
  console.log('🔔 triggerMonthlyReport called:', reportData);
  
  const preferences = getNotificationPreferences();
  if (!preferences.monthlyReports) {
    console.log('❌ Monthly reports disabled in preferences');
    return false;
  }

  const title = 'Monthly Financial Report';
  const body = `Your monthly summary: Spent ₹${reportData.totalSpent}, Earned ₹${reportData.totalIncome}, Saved ₹${reportData.savings}.`;

  return sendBrowserNotification(title, body, {
    data: {
      url: '/reports',
      type: 'monthly-report',
      reportId: reportData.reportId
    }
  });
};

// Goal Update Notifications
export const triggerGoalUpdate = async (goalData) => {
  console.log('🔔 triggerGoalUpdate called:', goalData);
  
  const preferences = getNotificationPreferences();
  if (!preferences.goalUpdates) {
    console.log('❌ Goal updates disabled in preferences');
    return false;
  }

  const title = 'Goal Progress Update';
  const body = `Your ${goalData.name} goal: ${goalData.progress}% complete. ${goalData.message}`;

  return sendBrowserNotification(title, body, {
    data: {
      url: '/goals',
      type: 'goal-update',
      goalId: goalData._id
    }
  });
};

// Low Balance Alert Notifications
export const triggerLowBalanceAlert = async (balanceData) => {
  console.log('🔔 triggerLowBalanceAlert called:', balanceData);
  
  const preferences = getNotificationPreferences();
  if (!preferences.lowBalanceAlerts) {
    console.log('❌ Low balance alerts disabled in preferences');
    return false;
  }

  const title = 'Low Balance Alert';
  const body = `Your current balance is ₹${balanceData.currentBalance}. Consider adding funds soon.`;

  return sendBrowserNotification(title, body, {
    data: {
      url: '/dashboard',
      type: 'low-balance-alert',
      balance: balanceData.currentBalance
    }
  });
};



// Backend API calls for different notification types
export const triggerBudgetAlert = async (alertData) => {
  const token = getUserToken();
  if (!token) {
    return false;
  }

  try {
    const response = await fetch(API_ENDPOINTS.NOTIFICATIONS_TEST_BUDGET_ALERT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.ok;
  } catch (error) {
    return false;
  }
};

export const triggerRecurringReminderBackend = async (recurringData) => {
  const token = getUserToken();
  if (!token) {
    return false;
  }

  try {
    const response = await fetch(API_ENDPOINTS.NOTIFICATIONS_TEST_RECURRING_REMINDER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.ok;
  } catch (error) {
    return false;
  }
};

export const triggerWeeklyReportBackend = async (reportData) => {
  const token = getUserToken();
  if (!token) {
    return false;
  }

  try {
    const response = await fetch(API_ENDPOINTS.NOTIFICATIONS_TEST_WEEKLY_REPORT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.ok;
  } catch (error) {
    return false;
  }
};

export const triggerMonthlyReportBackend = async (reportData) => {
  const token = getUserToken();
  if (!token) {
    return false;
  }

  try {
    const response = await fetch(API_ENDPOINTS.NOTIFICATIONS_TEST_MONTHLY_REPORT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.ok;
  } catch (error) {
    return false;
  }
};

export const triggerGoalUpdateBackend = async (goalData) => {
  const token = getUserToken();
  if (!token) {
    return false;
  }

  try {
    const response = await fetch(API_ENDPOINTS.NOTIFICATIONS_TEST_GOAL_UPDATE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.ok;
  } catch (error) {
    return false;
  }
};

export const triggerLowBalanceAlertBackend = async (balanceData) => {
  const token = getUserToken();
  if (!token) {
    return false;
  }

  try {
    const response = await fetch(API_ENDPOINTS.NOTIFICATIONS_TEST_LOW_BALANCE_ALERT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.ok;
  } catch (error) {
    return false;
  }
}; 
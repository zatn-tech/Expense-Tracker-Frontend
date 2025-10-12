// Notification trigger functions for different types of notifications
import { ensureNotificationPermission } from './budgetNotificationTrigger';
import { API_ENDPOINTS } from '../config/api';

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
  
  try {
    if (!('Notification' in window)) {
      return false;
    }


    if (Notification.permission !== 'granted') {
      return false;
    }


    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'expense-tracker',
      requireInteraction: false,
      silent: false,
      ...options
    });


    // Auto-close after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);

    // Handle click to navigate
    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return true;
  } catch (error) {
    return false;
  }
};

// Budget Alert Notifications
export const triggerBudgetBrowserNotification = (alert) => {
  
  const preferences = getNotificationPreferences();
  if (!preferences.budgetAlerts) {
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
    return false;
  }
};

// Recurring Transaction Reminders
export const triggerRecurringReminder = async (recurringTransaction) => {
  
  const preferences = getNotificationPreferences();
  if (!preferences.recurringReminders) {
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
  
  const preferences = getNotificationPreferences();
  if (!preferences.weeklyReports) {
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
  
  const preferences = getNotificationPreferences();
  if (!preferences.monthlyReports) {
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
  
  const preferences = getNotificationPreferences();
  if (!preferences.goalUpdates) {
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
  
  const preferences = getNotificationPreferences();
  if (!preferences.lowBalanceAlerts) {
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
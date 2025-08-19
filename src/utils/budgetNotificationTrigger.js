// Utility to trigger browser notifications for budget alerts

export const triggerBudgetBrowserNotification = (alert) => {
  try {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      return false;
    }

    // Check if permission is granted
    if (Notification.permission !== 'granted') {
      return false;
    }

    // Create notification title and body
    // The alert object from backend has: title, message, type, budgetId, alertType
    const title = alert.title || (alert.isExceeded ? 'Budget Exceeded!' : 'Budget Alert');
    const body = alert.message || 'Budget alert triggered';

    // Create and show the notification
    const notification = new Notification(title, {
      body: body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'budget-alert',
      requireInteraction: false,
      data: {
        url: '/budgets',
        budgetId: alert.budgetId,
        alertType: alert.alertType,
        type: alert.type
      }
    });

    // Auto-close after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);

    // Handle notification click
    notification.onclick = () => {
      window.focus();
      notification.close();
      // Navigate to budgets page
      window.location.href = '/budgets';
    };

    return true;
  } catch (error) {
    return false;
  }
};

// Function to check and request notification permission
export const ensureNotificationPermission = async () => {
  try {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    return false;
  }
}; 
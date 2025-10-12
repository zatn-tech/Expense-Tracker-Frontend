// Goal notification trigger for browser notifications
export const triggerGoalBrowserNotification = (notification) => {
  
  try {
    // Check if browser notifications are supported
    if (!('Notification' in window)) {
      return false;
    }
    
    
    // Check if permission is granted
    if (Notification.permission !== 'granted') {
      return false;
    }
    
    
    // Create and show the notification
    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'goal-notification',
      data: {
        url: '/goals',
        type: 'goal-update',
        goalId: notification.goalId,
        goalName: notification.goalName,
        progress: notification.progress
      }
    });
    
    
    // Handle notification click
    browserNotification.onclick = () => {
      browserNotification.close();
      
      // Navigate to goals page
      window.focus();
      window.location.href = '/goals';
    };
    
    // Auto-close after 5 seconds
    setTimeout(() => {
      browserNotification.close();
    }, 5000);
    
    return true;
    
  } catch (error) {
    return false;
  }
}; 
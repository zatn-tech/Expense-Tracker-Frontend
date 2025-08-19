// Goal notification trigger for browser notifications
export const triggerGoalBrowserNotification = (notification) => {
  console.log('🔔 triggerGoalBrowserNotification called with:', notification);
  
  try {
    // Check if browser notifications are supported
    if (!('Notification' in window)) {
      console.log('❌ Browser notifications are not supported');
      return false;
    }
    
    console.log('✅ Browser supports notifications');
    console.log('📋 Current notification permission:', Notification.permission);
    
    // Check if permission is granted
    if (Notification.permission !== 'granted') {
      console.log('❌ Notification permission not granted. Current permission:', Notification.permission);
      return false;
    }
    
    console.log('✅ Notification permission granted');
    
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
    
    console.log('✅ Browser notification created:', browserNotification);
    
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
      console.log('✅ Goal notification auto-closed');
    }, 5000);
    
    console.log('✅ Goal browser notification triggered successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error sending goal browser notification:', error);
    return false;
  }
}; 
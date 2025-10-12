import React, { useState, useEffect, useContext } from 'react';
import { usePushNotification } from '../context/PushNotificationContext';
import { useNotification } from '../context/NotificationContext';
import { 
  triggerBudgetAlert, 
  triggerRecurringReminder, 
  triggerWeeklyReport, 
  triggerMonthlyReport, 
  triggerGoalUpdate, 
  triggerLowBalanceAlert
} from '../utils/notificationTriggers';
import { AuthContext } from '../context/AuthContext';

const NotificationSettings = () => {
  const {
    permission,
    subscription,
    isSupported,
    isLoading,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    initializePushNotifications,
    sendTestNotification,
    updateNotificationPreferences,
    sendSubscriptionToBackend
  } = usePushNotification();

  const { showSuccess, showError } = useNotification();
  const { user } = useContext(AuthContext);

  const [preferences, setPreferences] = useState({
    budgetAlerts: true,
    recurringReminders: true,
    weeklyReports: true,
    monthlyReports: true,
    goalUpdates: true,
    lowBalanceAlerts: true
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load saved preferences
    const savedPreferences = localStorage.getItem('notificationPreferences');
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const handlePermissionRequest = async () => {
    try {
      const result = await requestPermission();
      if (result === 'granted') {
        await initializePushNotifications();
        showSuccess('Push notifications enabled successfully!');
      } else {
        showError('Permission denied. Please enable notifications in your browser settings.');
      }
    } catch (error) {
      showError('Failed to enable push notifications: ' + error.message);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      await unsubscribeFromPush();
      showSuccess('Browser notifications disabled successfully!');
    } catch (error) {
      showError('Failed to disable browser notifications: ' + error.message);
    }
  };



  const handlePreferenceChange = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      await updateNotificationPreferences(preferences);
      localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
      showSuccess('Notification preferences saved successfully!');
    } catch (error) {
      if (error.message.includes('authentication') || error.message.includes('logged in')) {
        showError('Please log in first to save notification preferences.');
      } else {
        showError('Failed to save preferences: ' + error.message);
      }
    } finally {
      setIsSaving(false);
    }
  };









  const getPermissionStatus = () => {
    if (!isSupported) return 'Not Supported';
    switch (permission) {
      case 'granted': return 'Granted';
      case 'denied': return 'Denied';
      case 'default': return 'Not Requested';
      default: return 'Unknown';
    }
  };

  const getStatusColor = () => {
    if (!isSupported) return 'text-gray-500';
    switch (permission) {
      case 'granted': return 'text-green-600';
      case 'denied': return 'text-red-600';
      case 'default': return 'text-yellow-600';
      default: return 'text-gray-500';
    }
  };



  // Check if user is authenticated
  if (!user) {
    return (
      <div className="bg-white dark:bg-black shadow-lg rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🔐</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Authentication Required
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Please log in to manage your notification preferences.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black shadow-lg rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center mb-6">
        <span className="text-2xl mr-3">🔔</span>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Browser Notifications
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage your notification preferences using browser notifications
          </p>
        </div>
      </div>

      {/* Browser Support Status */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Browser Support</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isSupported ? 'Browser notifications are supported' : 'Browser notifications are not supported in this browser'}
            </p>
          </div>
          <div className={`text-sm font-medium ${isSupported ? 'text-green-600' : 'text-red-600'}`}>
            {isSupported ? '✅ Supported' : '❌ Not Supported'}
          </div>
        </div>
      </div>

      {/* Permission Status */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Permission Status</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Current notification permission status
            </p>
          </div>
          <div className={`text-sm font-medium ${getStatusColor()}`}>
            {getPermissionStatus()}
          </div>
        </div>
      </div>

      {/* Subscription Status */}
      {isSupported && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Notification Status</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Browser notification subscription
              </p>
            </div>
            <div className={`text-sm font-medium ${subscription ? 'text-green-600' : 'text-red-600'}`}>
              {subscription ? '✅ Enabled' : '❌ Not Enabled'}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mb-6 space-y-3">

        {isSupported && permission !== 'granted' && (
          <button
            onClick={handlePermissionRequest}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <span className="animate-spin mr-2">⏳</span>
            ) : (
              <span className="mr-2">🔔</span>
            )}
            Enable Push Notifications
          </button>
        )}

        {isSupported && permission === 'granted' && subscription && (
          <div className="space-y-2">
            <button
              onClick={handleUnsubscribe}
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              <span className="mr-2">🔕</span>
              Disable Browser Notifications
            </button>
          </div>
        )}

        {/* Show why buttons are not visible */}
        {isSupported && permission === 'granted' && !subscription && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-blue-800 dark:text-blue-200 text-sm">
              <div className="font-medium mb-1">Next Step:</div>
              <div>Permission granted! You need to subscribe to browser notifications.</div>
            </div>
            <button
              onClick={async () => {
                try {
                  const subscription = await subscribeToPush();
                  
                  if (subscription) {
                    await sendSubscriptionToBackend(subscription);
                    showSuccess('Browser notifications enabled successfully!');
                  }
                } catch (error) {
                  showError('Failed to enable browser notifications: ' + error.message);
                }
              }}
              disabled={isLoading}
              className="mt-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <span className="animate-spin mr-2">⏳</span>
              ) : (
                <span className="mr-2">🔔</span>
              )}
              Subscribe to Browser Notifications
            </button>
          </div>
        )}

        {isSupported && permission !== 'granted' && (
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-orange-800 dark:text-orange-200 text-sm">
              <div className="font-medium mb-1">Next Step:</div>
              <div>Grant notification permission to enable browser notifications.</div>
            </div>
          </div>
        )}

        {!isSupported && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-red-800 dark:text-red-200 text-sm">
              <div className="font-medium mb-1">Issue:</div>
              <div>Your browser doesn't support browser notifications. Try Chrome, Firefox, Safari, or Edge.</div>
            </div>
          </div>
        )}
      </div>



      {/* Notification Preferences */}
      {isSupported && permission === 'granted' && (
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 dark:text-white">Browser Notification Preferences</h3>
          
          <div className="space-y-3">
            {Object.entries(preferences).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {getPreferenceDescription(key)}
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => handlePreferenceChange(key)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>

          <button
            onClick={handleSavePreferences}
            disabled={isSaving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {isSaving ? (
              <span className="animate-spin mr-2">⏳</span>
            ) : (
              <span className="mr-2">💾</span>
            )}
            Save Preferences
          </button>


        </div>
      )}

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 How it works</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Enable push notifications to receive alerts about your finances</li>
          <li>• Get notified about budget limits, recurring transactions, and reports</li>
          <li>• Notifications work even when the app is closed</li>
          <li>• You can customize which notifications you want to receive</li>
        </ul>
      </div>
    </div>
  );
};

const getPreferenceDescription = (key) => {
  const descriptions = {
    budgetAlerts: 'Get notified when you exceed budget limits',
    recurringReminders: 'Reminders for upcoming recurring transactions',
    weeklyReports: 'Weekly spending summary notifications',
    monthlyReports: 'Monthly financial report notifications',
    goalUpdates: 'Updates on your financial goals progress',
    lowBalanceAlerts: 'Alerts when your balance is low'
  };
  return descriptions[key] || '';
};

export default NotificationSettings; 
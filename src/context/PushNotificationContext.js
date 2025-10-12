import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';

const PushNotificationContext = createContext();

export const usePushNotification = () => {
  const context = useContext(PushNotificationContext);
  if (!context) {
    throw new Error('usePushNotification must be used within a PushNotificationProvider');
  }
  return context;
};

export const PushNotificationProvider = ({ children }) => {
  const [permission, setPermission] = useState('default');
  const [subscription, setSubscription] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if browser notifications are supported
  useEffect(() => {
    const checkSupport = () => {
      const supported = 'Notification' in window;
      setIsSupported(supported);
      
      if (supported) {
        // Check current permission
        setPermission(Notification.permission);
      }
    };

    checkSupport();
  }, []);

  // Request notification permission
  const requestPermission = async () => {
    if (!isSupported) {
      throw new Error('Push notifications are not supported in this browser');
    }

    setIsLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register service worker - DISABLED to prevent hot reload issues
  const registerServiceWorker = async () => {
    // Service worker registration disabled to prevent hot reload issues
    return null;
  };

    // Subscribe to browser notifications (simplified approach)
  const subscribeToPush = async () => {
    setIsLoading(true);
    try {
      // Check if browser notifications are supported
      if (!('Notification' in window)) {
        throw new Error('Browser notifications are not supported in this browser');
      }

      // Check current permission status
      if (Notification.permission === 'granted') {
        // Permission already granted, create a mock subscription
        const mockSubscription = {
          endpoint: 'browser://notifications',
          keys: { p256dh: 'browser-key', auth: 'browser-auth' },
          toJSON: () => ({
            endpoint: 'browser://notifications',
            keys: { p256dh: 'browser-key', auth: 'browser-auth' }
          })
        };
        setSubscription(mockSubscription);
        return mockSubscription;
      } else if (Notification.permission === 'default') {
        // Permission not set, request it
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const mockSubscription = {
            endpoint: 'browser://notifications',
            keys: { p256dh: 'browser-key', auth: 'browser-auth' },
            toJSON: () => ({
              endpoint: 'browser://notifications',
              keys: { p256dh: 'browser-key', auth: 'browser-auth' }
            })
          };
          setSubscription(mockSubscription);
          return mockSubscription;
        } else {
          throw new Error('Permission denied for browser notifications');
        }
      } else {
        // Permission denied
        throw new Error('Browser notification permission denied. Please enable notifications in your browser settings.');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Unsubscribe from browser notifications
  const unsubscribeFromPush = async () => {
    if (subscription) {
      try {
        // For browser notifications, we just clear the subscription
        // No need to call unsubscribe() since it's a mock object
        setSubscription(null);
        return true;
      } catch (error) {
        throw error;
      }
    }
    return false;
  };

  // Send subscription to backend
  const sendSubscriptionToBackend = async (subscription) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in first.');
      }

      const response = await fetch(API_ENDPOINTS.NOTIFICATIONS_SUBSCRIBE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send subscription to backend');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  // Initialize push notifications
  const initializePushNotifications = async () => {
    if (!isSupported) {
      return false;
    }

    try {
      // Request permission if not granted
      if (permission !== 'granted') {
        const newPermission = await requestPermission();
        if (newPermission !== 'granted') {
          return false;
        }
      }

      // Subscribe to push notifications
      const newSubscription = await subscribeToPush();
      
      // Send subscription to backend
      await sendSubscriptionToBackend(newSubscription);
      
      return true;
    } catch (error) {
      return false;
    }
  };

  // Test notification using browser notifications
  const sendTestNotification = async () => {
    try {
      // Check if browser notifications are supported
      if (!('Notification' in window)) {
        throw new Error('Browser notifications are not supported in this browser');
      }

      // Check permission status
      if (Notification.permission === 'granted') {
        // Send browser notification
        new Notification('Expense Tracker', {
          body: 'This is a test notification from your expense tracker! 📊',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'expense-tracker-test',
          requireInteraction: false
        });
        return { success: true, message: 'Test notification sent successfully' };
      } else if (Notification.permission === 'default') {
        // Request permission first
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification('Expense Tracker', {
            body: 'This is a test notification from your expense tracker! 📊',
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'expense-tracker-test',
            requireInteraction: false
          });
          return { success: true, message: 'Test notification sent successfully' };
        } else {
          throw new Error('Permission denied for browser notifications');
        }
      } else {
        throw new Error('Browser notification permission denied. Please enable notifications in your browser settings.');
      }
    } catch (error) {
      throw error;
    }
  };

  // Update notification preferences
  const updateNotificationPreferences = async (preferences) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in first.');
      }

      const response = await fetch(API_ENDPOINTS.NOTIFICATIONS_PREFERENCES, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(preferences)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update notification preferences');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  const value = {
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
  };

  return (
    <PushNotificationContext.Provider value={value}>
      {children}
    </PushNotificationContext.Provider>
  );
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  try {
    
    // Remove any whitespace
    const cleanString = base64String.trim();
    
    // Add padding if needed
    const padding = '='.repeat((4 - cleanString.length % 4) % 4);
    const base64 = (cleanString + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  } catch (error) {
    throw new Error('Invalid VAPID key format: ' + error.message);
  }
} 
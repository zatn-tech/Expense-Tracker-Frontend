import React, { createContext, useContext, useState, useCallback } from 'react';
import Notification from '../components/ui/Notification';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);



  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showNotification = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      message,
      type,
      duration,
      show: true
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, [removeNotification]);

  const showSuccess = useCallback((message, duration = 5000) => {
    return showNotification(message, 'success', duration);
  }, [showNotification]);

  const showError = useCallback((message, duration = 5000) => {
    return showNotification(message, 'error', duration);
  }, [showNotification]);

  const showWarning = useCallback((message, duration = 5000) => {
    return showNotification(message, 'warning', duration);
  }, [showNotification]);

  const showInfo = useCallback((message, duration = 5000) => {
    return showNotification(message, 'info', duration);
  }, [showNotification]);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
    clearAllNotifications,
    notifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Render notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            className="pointer-events-auto"
            style={{
              transform: `translateY(${index * 80}px)`,
              zIndex: 1000 + index
            }}
          >
            <Notification
              message={notification.message}
              type={notification.type}
              duration={notification.duration}
              show={notification.show}
              onClose={() => removeNotification(notification.id)}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

 
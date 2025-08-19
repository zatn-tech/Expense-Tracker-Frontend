import React from 'react';
import { usePushNotification } from '../context/PushNotificationContext';

const NotificationBadge = () => {
  const { permission, subscription, isSupported } = usePushNotification();

  if (!isSupported) {
    return null;
  }

  const getStatusColor = () => {
    if (permission === 'granted' && subscription) {
      return 'bg-green-500';
    } else if (permission === 'denied') {
      return 'bg-red-500';
    } else {
      return 'bg-yellow-500';
    }
  };

  const getStatusText = () => {
    if (permission === 'granted' && subscription) {
      return 'Notifications enabled';
    } else if (permission === 'denied') {
      return 'Notifications blocked';
    } else {
      return 'Notifications not set up';
    }
  };

  return (
    <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
      <span className="text-xs text-gray-600 dark:text-gray-400">
        {getStatusText()}
      </span>
    </div>
  );
};

export default NotificationBadge; 
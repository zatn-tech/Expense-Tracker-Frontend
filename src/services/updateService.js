import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

// Helper function to make API calls with proper authentication
const apiCall = async (url, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await axios({
      url,
      ...defaultOptions,
      ...options
    });
    
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || `HTTP error! status: ${error.response.status}`);
    } else if (error.request) {
      throw new Error('Network error - please check your connection');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
};

// Get all updates for user with pagination
export const getUpdates = async (userId, params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.type) queryParams.append('type', params.type);
  if (params.priority) queryParams.append('priority', params.priority);
  
  const url = `${API_ENDPOINTS.USER_UPDATES(userId)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  return apiCall(url);
};

// Get unread count
export const getUnreadCount = async (userId) => {
  // Check if auth header is actually set
  if (!axios.defaults.headers.common['Authorization']) {
    throw new Error('No authentication token available');
  }
  
  return apiCall(API_ENDPOINTS.USER_UPDATES_UNREAD_COUNT(userId));
};


// Mark a single update as read
export const markUpdateAsRead = async (userId, updateId) => {
  return apiCall(API_ENDPOINTS.USER_UPDATE_MARK_AS_READ(userId, updateId), {
    method: 'PATCH',
  });
};

// Mark all updates as read
export const markAllUpdatesAsRead = async (userId) => {
  return apiCall(API_ENDPOINTS.USER_UPDATES_MARK_ALL_READ(userId), {
    method: 'PATCH',
  });
};

// Create a new update (for testing)
export const createUpdate = async (updateData) => {
  return apiCall(API_ENDPOINTS.UPDATES, {
    method: 'POST',
    body: JSON.stringify(updateData),
  });
};

// Helper function to get update type icon
export const getUpdateTypeIcon = (type) => {
  const icons = {
    feature: '✨',
    improvement: '🚀',
    bugfix: '🐛',
    announcement: '📢',
    security: '🔒',
  };
  return icons[type] || '📝';
};

// Helper function to get update type color
export const getUpdateTypeColor = (type) => {
  const colors = {
    feature: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20',
    improvement: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20',
    bugfix: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20',
    announcement: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20',
    security: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20',
  };
  return colors[type] || 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
};

// Helper function to get priority color
export const getPriorityColor = (priority) => {
  const colors = {
    low: 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20',
    medium: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20',
    high: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20',
    critical: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20',
  };
  return colors[priority] || 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
};

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getUnreadCount } from '../services/updateService';
import { AuthContext } from './AuthContext';

const UpdatesContext = createContext();

export const useUpdates = () => {
  const context = useContext(UpdatesContext);
  if (!context) {
    return {
      unreadCount: 0,
      loading: false,
      fetchUnreadCount: () => {},
      updateUnreadCount: () => {},
      decrementUnreadCount: () => {},
      clearUnreadCount: () => {},
    };
  }
  return context;
};

export const UpdatesProvider = ({ children }) => {
  const { user, isInitialized, token } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const hasInitialized = useRef(false);


  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    // Only fetch if user is authenticated, auth is initialized, and token is set
    if (!user || !isInitialized || !token) {
      return;
    }
    
    // Prevent multiple simultaneous calls
    if (loading) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await getUnreadCount(user._id);
      if (response.status === 'success') {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      // Silently handle error - don't show to user
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [user, isInitialized, token, loading]);

  // Update unread count (used when updates are marked as read)
  const updateUnreadCount = useCallback((count) => {
    setUnreadCount(count);
  }, []);

  // Decrement unread count by 1 (when a single update is marked as read)
  const decrementUnreadCount = useCallback(() => {
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Clear all unread (when all updates are marked as read)
  const clearUnreadCount = useCallback(() => {
    setUnreadCount(0);
  }, []);

  // Fetch unread count only after auth is complete and user is authenticated
  useEffect(() => {
    if (user && isInitialized && token && !hasInitialized.current) {
      hasInitialized.current = true;
      
      // Use requestIdleCallback for better performance, fallback to setTimeout
      const scheduleFetch = () => {
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => {
            fetchUnreadCount();
          }, { timeout: 100 });
        } else {
          setTimeout(() => {
            fetchUnreadCount();
          }, 100);
        }
      };
      
      scheduleFetch();
    }
  }, [user, isInitialized, token]);

  const value = {
    unreadCount,
    loading,
    fetchUnreadCount,
    updateUnreadCount,
    decrementUnreadCount,
    clearUnreadCount,
  };

  return (
    <UpdatesContext.Provider value={value}>
      {children}
    </UpdatesContext.Provider>
  );
};

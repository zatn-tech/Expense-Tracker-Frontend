import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getUserPreferences, updateUserPreferences, applyCSSVariables } from '../services/userPreferencesService';
import { AuthContext } from './AuthContext';

const UserPreferencesContext = createContext();

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};

export const UserPreferencesProvider = ({ children }) => {
  const { user, isInitialized: authInitialized, token } = useContext(AuthContext);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const hasInitialized = useRef(false);


  // Load user preferences
  const loadPreferences = useCallback(async () => {
    // Only load if user is authenticated, auth is initialized, token is set, and we haven't already loaded
    if (!user || !authInitialized || !token || isInitialized) {
      return;
    }
    
    // Prevent multiple simultaneous calls
    if (loading) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await getUserPreferences(user._id);
      if (response.status === 'success') {
        setPreferences(response.data.preferences);
        applyCSSVariables(response.data.preferences);
        setIsInitialized(true);
      }
    } catch (err) {
      setError(err.message);
      setIsInitialized(true); // Still mark as initialized even if failed
    } finally {
      setLoading(false);
    }
  }, [user, authInitialized, token, isInitialized, loading]);

  // Update preferences
  const updatePreferences = useCallback(async (newPreferences) => {
    if (!user || !authInitialized || !token) {
      return;
    }
    
    try {
      const response = await updateUserPreferences(user._id, newPreferences);
      if (response.status === 'success') {
        setPreferences(newPreferences);
        applyCSSVariables(newPreferences);
      }
    } catch (err) {
      setError(err.message);
    }
  }, [user, authInitialized, token]);

  // Reset preferences
  const resetPreferences = useCallback(() => {
    setPreferences(null);
    setError(null);
  }, []);

  const value = {
    preferences,
    loading,
    error,
    isInitialized,
    loadPreferences,
    updatePreferences,
    resetPreferences
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

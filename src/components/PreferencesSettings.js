import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function PreferencesSettings() {
  const { userId } = useParams();
  const { token, user } = useContext(AuthContext);
  const { theme, setThemeMode } = useTheme();
  const [preferences, setPreferences] = useState({
    currency: 'INR',
    notifications: true,
    theme: 'light'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Security check
  useEffect(() => {
    if (user && userId !== user._id) {
      alert('Access denied: You can only access your own preferences');
      return;
    }
  }, [userId, user]);

  useEffect(() => {
    if (userId && token) {
      fetchPreferences();
    }
  }, [userId, token]);

  // Sync theme context with preferences
  useEffect(() => {
    if (preferences.theme !== theme) {
      setPreferences(prev => ({ ...prev, theme }));
    }
  }, [theme]);

  const fetchPreferences = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.USER_PROFILE(userId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.preferences) {
        const userPreferences = res.data.preferences;
        setPreferences(userPreferences);
        
        // Apply the saved theme
        if (userPreferences.theme && userPreferences.theme !== theme) {
          setThemeMode(userPreferences.theme);
        }
      }
    } catch (err) {
      console.error('Error fetching preferences:', err);
      if (err.response?.status === 403) {
        alert('Access denied: You can only access your own data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));

    // Immediately apply theme change
    if (key === 'theme') {
      setThemeMode(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const res = await axios.put(API_ENDPOINTS.USER_PROFILE(userId), {
        preferences
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      

      
      // Show success feedback
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
      successMsg.innerHTML = '<span class="mr-2">✅</span>Preferences updated successfully!';
      document.body.appendChild(successMsg);
      setTimeout(() => document.body.removeChild(successMsg), 3000);
      
      // Update local preferences state with response
      if (res.data.preferences) {
        setPreferences(res.data.preferences);
      }
    } catch (err) {
      console.error('Error updating preferences:', err);
      alert('Error updating preferences: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* App Appearance */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center mb-6">
            <span className="text-xl mr-3">🎨</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">App Appearance</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Customize how the app looks and feels</p>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Theme Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Theme Preference
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { 
                    value: 'light', 
                    label: 'Light Mode', 
                    icon: '☀️',
                    description: 'Clean and bright interface',
                    preview: 'bg-white border-gray-200'
                  },
                  { 
                    value: 'dark', 
                    label: 'Dark Mode', 
                    icon: '🌙',
                    description: 'Easy on the eyes',
                    preview: 'bg-gray-800 border-gray-600'
                  }
                ].map((themeOption) => (
                  <label
                    key={themeOption.value}
                    className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      preferences.theme === themeOption.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="theme"
                      value={themeOption.value}
                      checked={preferences.theme === themeOption.value}
                      onChange={(e) => handleChange('theme', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{themeOption.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {themeOption.label}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {themeOption.description}
                        </div>
                      </div>
                    </div>
                    {preferences.theme === themeOption.value && (
                      <div className="absolute top-3 right-3">
                        <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Currency & Localization */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center mb-6">
            <span className="text-xl mr-3">💰</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Currency & Region</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Set your preferred currency and regional settings</p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Default Currency
            </label>
            <select
              value={preferences.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="block w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 rounded-lg transition-colors duration-200"
            >
              <option value="INR">🇮🇳 Indian Rupee (₹)</option>
              <option value="USD">🇺🇸 US Dollar ($)</option>
              <option value="EUR">🇪🇺 Euro (€)</option>
              <option value="GBP">🇬🇧 British Pound (£)</option>
              <option value="JPY">🇯🇵 Japanese Yen (¥)</option>
              <option value="CAD">🇨🇦 Canadian Dollar (C$)</option>
            </select>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center mb-6">
            <span className="text-xl mr-3">🔔</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage how you receive updates and alerts</p>
            </div>
          </div>
          
          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-start space-x-3">
                <span className="text-lg">📧</span>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Email Notifications
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Receive updates about your expenses, budget alerts, and monthly summaries
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleChange('notifications', !preferences.notifications)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                  preferences.notifications ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    preferences.notifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={saving}
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white transition-all duration-200 ${
              saving
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                : 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800'
            }`}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Saving Changes...
              </>
            ) : (
              <>
                <span className="mr-2">💾</span>
                Save Preferences
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PreferencesSettings;

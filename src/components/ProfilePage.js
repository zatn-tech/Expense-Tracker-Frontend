import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ProfileView from './ProfileView';
import EditProfile from './EditProfile';
import ChangePassword from './ChangePassword';
import PreferencesSettings from './PreferencesSettings';
import NotificationSettings from './NotificationSettings';
import DeleteAccount from './DeleteAccount';

function ProfilePage() {
  const { userId } = useParams();
  const { user } = useContext(AuthContext);
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);

  // Security check
  useEffect(() => {
    if (user && userId !== user._id) {
      navigate(`/user/${user._id}/profile`);
      return;
    }
  }, [userId, user, navigate]);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤', description: 'Personal information and bio' },
    { id: 'security', label: 'Security', icon: '🔒', description: 'Password and security settings' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️', description: 'App settings and customization' },
    { id: 'notifications', label: 'Notifications', icon: '🔔', description: 'Push notification settings' },
    { id: 'danger', label: 'Danger Zone', icon: '⚠️', description: 'Account deletion and danger actions' }
  ];



  return (
          <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-200">
      {/* Header with Back Button */}
              <header className="bg-white dark:bg-black shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">

              
              <div className="flex items-center">
                <span className="text-xl mr-2">⚙️</span>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Account Settings</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                {theme === 'dark' ? '🌙 Dark' : '☀️ Light'} Mode
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">
            Hello, {user?.name || 'User'}! 👋
          </h2>
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
            Manage your account information, security settings, and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="bg-white dark:bg-black rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsEditing(false);
                    }}
                    className={`w-full flex items-start p-4 rounded-lg text-left transition-all duration-200 ${
                      tab.id === 'danger'
                        ? activeTab === tab.id
                          ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'
                          : 'text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 hover:bg-red-50 dark:hover:bg-red-900/20'
                        : activeTab === tab.id
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <span className="text-xl mr-3 flex-shrink-0">{tab.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{tab.label}</div>
                      <div className="text-xs opacity-75 mt-1">{tab.description}</div>
                    </div>
                    {activeTab === tab.id && (
                      <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </button>
                ))}
              </div>
            </nav>

            {/* Quick Stats */}
            <div className="mt-6 bg-white dark:bg-black rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Account Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Profile Complete</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="w-9 h-full bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-xs font-medium text-gray-900 dark:text-white">75%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Security</span>
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">Strong</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-black rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
              {/* Tab Content Header */}
              <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{tabs.find(tab => tab.id === activeTab)?.icon}</span>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-200">
                        {tabs.find(tab => tab.id === activeTab)?.label}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                        {tabs.find(tab => tab.id === activeTab)?.description}
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'profile' && (
                  <>
                    {isEditing ? (
                      <EditProfile onCancel={() => setIsEditing(false)} />
                    ) : (
                      <ProfileView onEdit={() => setIsEditing(true)} />
                    )}
                  </>
                )}
                
                {activeTab === 'security' && (
                  <ChangePassword />
                )}
                
                {activeTab === 'preferences' && (
                  <PreferencesSettings />
                )}
                
                {activeTab === 'notifications' && (
                  <NotificationSettings />
                )}
                
                {activeTab === 'danger' && (
                  <DeleteAccount />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;

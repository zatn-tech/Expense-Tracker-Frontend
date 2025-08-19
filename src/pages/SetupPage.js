import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { API_ENDPOINTS } from '../config/api';
import { TYPOGRAPHY, TYPOGRAPHY_COMBINATIONS } from '../utils/typography';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import AccountManager from '../components/AccountManager';
import CategoryManager from '../components/CategoryManager';
import Notification from '../components/ui/Notification';

const SetupPage = () => {
  const { user, isInitialized, loading: authLoading, updateUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { userId } = useParams();
  
  const [setupStatus, setSetupStatus] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  const [hasCheckedStatus, setHasCheckedStatus] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  // Setup steps configuration with enhanced design
  const setupSteps = [
    {
      id: 'emailVerified',
      title: 'Verify Your Email',
      description: 'Secure your account with email verification',
      icon: '✉️',
      color: 'blue',
      component: 'EmailVerification',
      required: true
    },
    {
      id: 'accounts',
      title: 'Create Your First Account',
      description: 'Add an account to start tracking your finances',
      icon: '🏦',
      color: 'emerald',
      component: 'AccountManager',
      required: true
    },
    {
      id: 'categories',
      title: 'Organize Your Categories',
      description: 'Set up categories for better expense tracking',
      icon: '📂',
      color: 'purple',
      component: 'CategoryManager',
      required: true
    },
    {
      id: 'preferences',
      title: 'Customize Your Experience',
      description: 'Set your currency and personalize settings',
      icon: '⚙️',
      color: 'amber',
      component: 'Preferences',
      required: true
    }
  ];

  // Check setup status once
  useEffect(() => {
    if (user && user._id && !authLoading && !setupStatus && !hasCheckedStatus) {
      setHasCheckedStatus(true);
      checkSetupStatus();
    }
  }, [user, authLoading, setupStatus, hasCheckedStatus]);

  const refreshUserData = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.ME, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          updateUser(data.data.user);
          return data.data.user;
        }
      }
    } catch (err) {
      console.error('SetupPage - Error refreshing user data:', err);
    }
    return null;
  };

  const checkSetupStatus = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.SETUP}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to check setup status');
      }

      const data = await response.json();
      setSetupStatus(data.data);
      
      // If setup is complete, refresh user data and redirect
      if (data.data.isComplete) {
        const updatedUser = await refreshUserData();
        if (updatedUser?.isSetupComplete) {
          navigate(`/user/${user._id}/dashboard`);
        } else {
          updateUser({ isSetupComplete: true });
          setTimeout(() => {
            navigate(`/user/${user._id}/dashboard`);
          }, 100);
        }
        return;
      }
      
      // Find first incomplete step
      console.log('SetupPage - Setup status from API:', data.data.setupStatus);
      console.log('SetupPage - Setup steps:', setupSteps.map(s => ({ id: s.id, title: s.title })));
      
      const firstIncompleteIndex = setupSteps.findIndex(step => {
        const isCompleted = data.data.setupStatus[step.id]?.completed;
        console.log(`SetupPage - Step ${step.id} completed:`, isCompleted);
        return !isCompleted;
      });
      
      console.log('SetupPage - First incomplete step index:', firstIncompleteIndex);
      
      if (firstIncompleteIndex !== -1) {
        setCurrentStep(firstIncompleteIndex);
      } else {
        console.log('SetupPage - All steps completed, but setup not marked complete');
        // Fallback: if no incomplete steps found but setup not complete, 
        // set to last step (preferences)
        setCurrentStep(setupSteps.length - 1);
      }
    } catch (err) {
      console.error('SetupPage - Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    try {
      setIsResendingEmail(true);
      
      const response = await fetch(`${API_ENDPOINTS.RESEND_VERIFICATION}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: user?.email })
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setNotificationMessage('Verification email sent! Please check your inbox.');
        setNotificationType('success');
        setShowNotification(true);
        
        // Start cooldown
        setResendCooldown(60); // 60 seconds cooldown
        const cooldownInterval = setInterval(() => {
          setResendCooldown(prev => {
            if (prev <= 1) {
              clearInterval(cooldownInterval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        throw new Error(data.message || 'Failed to send verification email');
      }
    } catch (err) {
      console.error('Error resending verification email:', err);
      setNotificationMessage(err.message || 'Failed to send verification email. Please try again.');
      setNotificationType('error');
      setShowNotification(true);
    } finally {
      setIsResendingEmail(false);
    }
  };

  const completeSetupStep = async (stepId) => {
    try {
      console.log('SetupPage - Completing step:', stepId);
      setIsTransitioning(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch(`${API_ENDPOINTS.SETUP}/complete-step`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ step: stepId })
      });

      if (!response.ok) {
        throw new Error('Failed to complete setup step');
      }

      const data = await response.json();
      console.log('SetupPage - Step completion response:', data);
      
      // Show success notification
      setNotificationMessage('Step completed successfully!');
      setNotificationType('success');
      setShowNotification(true);
      
      // Wait for animation
      setTimeout(() => {
        console.log('SetupPage - Rechecking setup status after step completion');
        checkSetupStatus();
        setIsTransitioning(false);
      }, 500);
    } catch (err) {
      console.error('SetupPage - Error completing step:', err);
      setNotificationMessage(err.message);
      setNotificationType('error');
      setShowNotification(true);
      setIsTransitioning(false);
    }
  };

  const PreferencesStep = ({ onComplete, user }) => {
    const [formData, setFormData] = useState({
      currency: user?.preferences?.currency || 'USD',
      theme: user?.preferences?.theme || 'system',
      language: user?.preferences?.language || 'en'
    });

    const currencies = [
      { value: 'USD', label: '🇺🇸 US Dollar (USD)' },
      { value: 'EUR', label: '🇪🇺 Euro (EUR)' },
      { value: 'GBP', label: '🇬🇧 British Pound (GBP)' },
      { value: 'INR', label: '🇮🇳 Indian Rupee (INR)' },
      { value: 'CAD', label: '🇨🇦 Canadian Dollar (CAD)' },
      { value: 'AUD', label: '🇦🇺 Australian Dollar (AUD)' },
      { value: 'JPY', label: '🇯🇵 Japanese Yen (JPY)' }
    ];

    const themes = [
      { value: 'light', label: '☀️ Light Mode' },
      { value: 'dark', label: '🌙 Dark Mode' },
      { value: 'system', label: '💻 System Default' }
    ];

    const languages = [
      { value: 'en', label: '🇺🇸 English' },
      { value: 'es', label: '🇪🇸 Spanish' },
      { value: 'fr', label: '🇫🇷 French' },
      { value: 'de', label: '🇩🇪 German' }
    ];

    const handleSubmit = (e) => {
      e.preventDefault();
      onComplete(formData);
    };

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">⚙️</div>
          <h2 className={TYPOGRAPHY.H2}>Customize Your Experience</h2>
          <p className={TYPOGRAPHY.BODY_LG + ' mt-2 max-w-md mx-auto'}>
            Set your preferences to personalize your financial tracking experience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto px-4 sm:px-0">
          <div className="space-y-4">
            <div>
              <label className={TYPOGRAPHY.LABEL + ' block mb-2'}>
                Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-200"
              >
                {currencies.map(currency => (
                  <option key={currency.value} value={currency.value}>
                    {currency.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={TYPOGRAPHY.LABEL + ' block mb-2'}>
                Theme
              </label>
              <select
                name="theme"
                value={formData.theme}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-200"
              >
                {themes.map(theme => (
                  <option key={theme.value} value={theme.value}>
                    {theme.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={TYPOGRAPHY.LABEL + ' block mb-2'}>
                Language
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-200"
              >
                {languages.map(language => (
                  <option key={language.value} value={language.value}>
                    {language.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isTransitioning}
            className={`w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:transform-none shadow-lg hover:shadow-xl ${TYPOGRAPHY.BUTTON}`}
          >
            {isTransitioning ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <span className="mr-2">🎉</span>
                Complete Setup
              </div>
            )}
          </button>
        </form>
      </div>
    );
  };

  const renderStepContent = () => {
    const currentStepData = setupSteps[currentStep];
    
    switch (currentStepData.component) {
      case 'EmailVerification':
        // Check if user is already verified (social login users)
        if (user?.emailVerified) {
          return (
            <div className="text-center space-y-8">
              <div className="text-6xl mb-4 animate-bounce">✅</div>
              <div>
                <h2 className={TYPOGRAPHY.H2}>Email Already Verified</h2>
                <p className={TYPOGRAPHY.BODY_LG + ' mt-2 max-w-md mx-auto'}>
                  Your email is already verified! Let's continue with the setup.
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 max-w-md mx-4 sm:mx-auto">
                <p className={TYPOGRAPHY.BODY_SM + ' text-green-700 dark:text-green-300 break-all'}>
                  <strong>✓ Verified Email:</strong> {user?.email}
                </p>
              </div>
              <button
                onClick={() => completeSetupStep('email_verification')}
                disabled={isTransitioning}
                className={`bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 sm:px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:transform-none shadow-lg hover:shadow-xl ${TYPOGRAPHY.BUTTON}`}
              >
                {isTransitioning ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Continuing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span className="mr-2">👍</span>
                    Continue Setup
                  </div>
                )}
              </button>
            </div>
          );
        }
        
        // For users who need email verification
        return (
          <div className="text-center space-y-8">
            <div className="text-6xl mb-4 animate-pulse">✉️</div>
            <div>
              <h2 className={TYPOGRAPHY.H2}>Email Verification Required</h2>
              <p className={TYPOGRAPHY.BODY_LG + ' mt-2 max-w-md mx-auto'}>
                We've sent a verification link to your email. Please check your inbox and click the link to continue.
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 max-w-md mx-4 sm:mx-auto">
              <p className={TYPOGRAPHY.BODY_SM + ' text-blue-700 dark:text-blue-300 break-all'}>
                <strong>Email:</strong> {user?.email}
              </p>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => checkSetupStatus()}
                disabled={isTransitioning}
                className={`bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 sm:px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:transform-none shadow-lg hover:shadow-xl ${TYPOGRAPHY.BUTTON}`}
              >
                {isTransitioning ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Checking...
                  </div>
                ) : (
                  'I\'ve Verified My Email'
                )}
              </button>
              
              <div className="text-center">
                <p className={TYPOGRAPHY.BODY_SM + ' text-gray-500 dark:text-gray-400 mb-3'}>
                  Didn't receive the email?
                </p>
            <button
                  onClick={resendVerificationEmail}
                  disabled={isResendingEmail || isTransitioning || resendCooldown > 0}
                  className={`bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:transform-none ${TYPOGRAPHY.BUTTON_SM}`}
                >
                  {isResendingEmail ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 dark:border-gray-300 mr-2"></div>
                      Sending...
                    </div>
                  ) : resendCooldown > 0 ? (
                    <div className="flex items-center justify-center">
                      <span className="mr-2">⏱️</span>
                      Wait {resendCooldown}s
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span className="mr-2">📧</span>
                      Resend Email
                    </div>
                  )}
            </button>
              </div>
            </div>
          </div>
        );

      case 'AccountManager':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">🏦</div>
              <h2 className={TYPOGRAPHY.H2}>Create Your First Account</h2>
              <p className={TYPOGRAPHY.BODY_LG + ' mt-2 max-w-md mx-auto'}>
                Add your first financial account to start tracking your money
              </p>
            </div>
                        <div className="max-w-2xl mx-auto px-4 sm:px-0">
            <AccountManager 
                onAccountCreated={() => completeSetupStep('accounts')}
              isSetupMode={true}
            />
            </div>
          </div>
        );

      case 'CategoryManager':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">📂</div>
              <h2 className={TYPOGRAPHY.H2}>Organize Your Categories</h2>
              <p className={TYPOGRAPHY.BODY_LG + ' mt-2 max-w-md mx-auto'}>
                Set up categories to better organize and track your expenses
              </p>
            </div>
                        <div className="max-w-2xl mx-auto px-4 sm:px-0">
            <CategoryManager 
                onCategoriesSet={() => completeSetupStep('categories')}
              isSetupMode={true}
            />
            </div>
          </div>
        );

      case 'Preferences':
        return (
          <PreferencesStep 
            onComplete={() => completeSetupStep('preferences')}
            user={user}
          />
        );

      default:
        return <div className="text-center">Unknown step</div>;
    }
  };

  // Early return if setup is already complete
  if (user?.isSetupComplete === true) {
    navigate(`/user/${user._id}/dashboard`);
    return null;
  }

  // Loading states
  if (!isInitialized || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
        <LoadingSpinner size="lg" />
          <p className={TYPOGRAPHY.BODY_LG + ' mt-4'}>Setting up your account...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">😔</div>
          <h2 className={TYPOGRAPHY.H2 + ' mb-4 text-red-600 dark:text-red-400'}>Setup Error</h2>
          <p className={TYPOGRAPHY.BODY + ' mb-6 text-gray-600 dark:text-gray-400'}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  // Show completion redirect
  if (setupStatus?.isComplete) {
    navigate(`/user/${user._id}/dashboard`);
    return null;
  }

  const currentStepData = setupSteps[currentStep];
  const progress = setupStatus ? setupStatus.progress : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-indigo-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
      {/* Header */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3 mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <span className="text-xl sm:text-2xl">💰</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                  Welcome to Expense Tracker
                </h1>
              </div>
              <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto px-4">
                Let's get you set up with a personalized financial tracking experience
            </p>
          </div>
          
            {/* Enhanced Progress Bar */}
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="flex justify-between items-center mb-4">
                <span className={TYPOGRAPHY.BODY_SM + ' font-medium'}>
                Step {currentStep + 1} of {setupSteps.length}
              </span>
                <span className={TYPOGRAPHY.BODY_SM + ' font-medium'}>
                  {progress}% Complete
              </span>
            </div>
              
              {/* Progress bar with animation */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>

          {/* Step Indicators */}
              <div className="flex justify-between mt-6 px-2">
            {setupSteps.map((step, index) => (
              <div
                key={step.id}
                    className={`flex flex-col items-center space-y-2 transition-all duration-300 ${
                      index <= currentStep ? 'opacity-100' : 'opacity-50'
                    }`}
                  >
                    <div className={`
                      w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-sm sm:text-lg lg:text-xl transition-all duration-300
                      ${index < currentStep 
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white scale-110' 
                        : index === currentStep
                        ? `bg-gradient-to-r from-${step.color}-400 to-${step.color}-500 text-white scale-125 animate-pulse`
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }
                    `}>
                      {index < currentStep ? '✓' : step.icon}
                    </div>
                    <span className={`text-xs sm:text-sm text-center max-w-12 sm:max-w-16 lg:max-w-20 leading-tight ${
                      index === currentStep ? 'font-semibold' : ''
                    }`}>
                <span className="hidden sm:inline">{step.title}</span>
                      <span className="sm:hidden">{step.title.split(' ')[0]}</span>
                    </span>
                  </div>
                ))}
              </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className={`
            bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden
            transition-all duration-500 ${isTransitioning ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}
          `}>
            <div className="p-6 sm:p-8 lg:p-12">
              {renderStepContent()}
            </div>
            </div>
          </div>
          
        {/* Footer */}
        <div className="text-center pb-8">
          <p className={TYPOGRAPHY.BODY_XS + ' text-gray-500 dark:text-gray-400'}>
            Secure • Private • Built for You
          </p>
        </div>
      </div>

      {/* Notification */}
      {showNotification && (
        <Notification
          message={notificationMessage}
          type={notificationType}
          onClose={() => setShowNotification(false)}
        />
      )}

      {/* Custom styles */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        /* Additional smooth transitions for mobile */
        @media (max-width: 640px) {
          .transition-all {
            transition-duration: 0.3s;
          }
        }
      `}</style>
    </div>
  );
};

export default SetupPage; 
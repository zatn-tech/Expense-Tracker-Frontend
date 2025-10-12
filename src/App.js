// src/App.js
import React, { useContext, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { PushNotificationProvider } from './context/PushNotificationContext';
import { UpdatesProvider } from './context/UpdatesContext';
import { UserPreferencesProvider, useUserPreferences } from './context/UserPreferencesContext';

// Import customization CSS
import './styles/customization.css';

import LoadingSpinner from './components/ui/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import { ensureNotificationPermission } from './utils/budgetNotificationTrigger';

// Lazy load heavy components
const AuthPage = lazy(() => import('./components/AuthPage'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const ProfilePage = lazy(() => import('./components/ProfilePage'));
const EmailVerification = lazy(() => import('./components/EmailVerification'));
const ForgotPassword = lazy(() => import('./components/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/ResetPassword'));
const Login = lazy(() => import('./components/Login'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const MobileOptimizer = lazy(() => import('./components/MobileOptimizer'));
const MainLayout = lazy(() => import('./components/MainLayout'));

// Lazy load heavy page components
const BudgetPage = lazy(() => import('./pages/BudgetPage'));
const TransactionManagementPage = lazy(() => import('./pages/TransactionManagementPage'));
const ImportPage = lazy(() => import('./pages/ImportPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const RecurringTransactionsPage = lazy(() => import('./pages/RecurringTransactionsPage'));
const GoalsPage = lazy(() => import('./pages/GoalsPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const AccountsPage = lazy(() => import('./pages/AccountsPage'));
const TransfersPage = lazy(() => import('./pages/TransfersPage'));
const SetupPage = lazy(() => import('./pages/SetupPage'));
const UserGuide = lazy(() => import('./pages/UserGuide'));
const UpdatesPage = lazy(() => import('./pages/UpdatesPage'));
const CustomizationCenter = lazy(() => import('./pages/CustomizationCenter'));
const AdminUpdatesPage = lazy(() => import('./pages/AdminUpdatesPage'));

// UserPreferencesLoader Component
function UserPreferencesLoader() {
  const { user, isInitialized, token } = useContext(AuthContext);
  const { loadPreferences, isInitialized: preferencesInitialized } = useUserPreferences();


  // Load user preferences when user is authenticated
  useEffect(() => {
    if (user && isInitialized && token && !preferencesInitialized) {
      // Use requestIdleCallback for better performance, fallback to setTimeout
      const scheduleLoad = () => {
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => {
            loadPreferences();
          }, { timeout: 100 });
        } else {
          setTimeout(() => {
            loadPreferences();
          }, 100);
        }
      };
      
      scheduleLoad();
    }
  }, [user, isInitialized, token, preferencesInitialized]);

  return null; // This component doesn't render anything
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, isInitialized, loading } = useContext(AuthContext);
  
  // Show loading while authentication is being initialized
  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  // If no user after initialization, redirect to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // Check if email is verified
  if (!user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }
  
  // Get current path for route preservation
  const currentPath = window.location.pathname;
  const isSetupPage = currentPath.includes('/setup');
  
  // If setup is not complete and we're not on setup page, redirect to setup
  if (user.isSetupComplete !== true && !isSetupPage) {
    // Store current path so we can return to it after setup
    sessionStorage.setItem('returnToAfterSetup', currentPath);
    return <Navigate to={`/user/${user._id}/setup`} replace />;
  }
  
  // If user is on setup page but setup is complete, redirect to the stored destination or dashboard
  if (isSetupPage && user.isSetupComplete === true) {
    const returnTo = sessionStorage.getItem('returnToAfterSetup');
    sessionStorage.removeItem('returnToAfterSetup');
    return <Navigate to={returnTo || `/user/${user._id}/dashboard`} replace />;
  }
  
  // If user is fully authenticated and setup is complete, allow access to any route
  return children;
}

// Public Route Component (redirect to dashboard if authenticated)
function PublicRoute({ children }) {
  const { user, isInitialized, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  if(!isInitialized)
  {
    <Login/>
  }
  
  if (user && user.emailVerified) {
    return <Navigate to={`/user/${user._id}/dashboard`} replace />;
  }
  
  return children;
}

function App() {
  const { user, isInitialized } = useContext(AuthContext);

  // Request notification permission when app loads
  useEffect(() => {
    const requestNotificationPermission = async () => {
      try {
        await ensureNotificationPermission();
      } catch (error) {
  
      }
    };

    // Request permission after a short delay to let the app load
    const timer = setTimeout(requestNotificationPermission, 2000);
    return () => clearTimeout(timer);
  }, []);


  return (
    <ErrorBoundary>
      <ThemeProvider>
        <NotificationProvider>
          <PushNotificationProvider>
            <UpdatesProvider>
              <UserPreferencesProvider>
                <UserPreferencesLoader />
                <Router>
                <MobileOptimizer>
                  <div className="App">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/auth" element={<PublicRoute><Suspense fallback={<LoadingSpinner size="lg" />}><AuthPage /></Suspense></PublicRoute>} />
                    <Route path="/verify-email" element={<PublicRoute><Suspense fallback={<LoadingSpinner size="lg" />}><EmailVerification /></Suspense></PublicRoute>} />
                    <Route path="/forgot-password" element={<PublicRoute><Suspense fallback={<LoadingSpinner size="lg" />}><ForgotPassword /></Suspense></PublicRoute>} />
                    <Route path="/reset-password/:token" element={<PublicRoute><Suspense fallback={<LoadingSpinner size="lg" />}><ResetPassword /></Suspense></PublicRoute>} />
                    <Route path="/auth/callback" element={<Suspense fallback={<LoadingSpinner size="lg" />}><AuthCallback /></Suspense>} />
                    <Route path="/privacy-policy" element={<Suspense fallback={<LoadingSpinner size="lg" />}><PrivacyPolicy /></Suspense>} />
                    <Route path="/terms-of-service" element={<Suspense fallback={<LoadingSpinner size="lg" />}><TermsOfService /></Suspense>} />
                    
                    {/* Protected Routes */}
                    <Route 
                      path="/user/:userId/dashboard" 
                      element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingSpinner size="lg" />}>
                            <MainLayout>
                              <Dashboard />
                            </MainLayout>
                          </Suspense>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/user/:userId/profile" 
                      element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingSpinner size="lg" />}>
                            <MainLayout>
                              <ProfilePage />
                            </MainLayout>
                          </Suspense>
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* New Page Routes */}
                    <Route 
                      path="/user/:userId/budgets" 
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <Suspense fallback={<LoadingSpinner size="lg" />}>
                              <BudgetPage />
                            </Suspense>
                          </MainLayout>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/user/:userId/transactions" 
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <Suspense fallback={<LoadingSpinner size="lg" />}>
                              <TransactionManagementPage />
                            </Suspense>
                          </MainLayout>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/user/:userId/import" 
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <Suspense fallback={<LoadingSpinner size="lg" />}>
                              <ImportPage />
                            </Suspense>
                          </MainLayout>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/user/:userId/reports" 
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <Suspense fallback={<LoadingSpinner size="lg" />}>
                              <ReportsPage />
                            </Suspense>
                          </MainLayout>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/user/:userId/recurring-transactions" 
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <Suspense fallback={<LoadingSpinner size="lg" />}>
                              <RecurringTransactionsPage />
                            </Suspense>
                          </MainLayout>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/user/:userId/goals" 
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <Suspense fallback={<LoadingSpinner size="lg" />}>
                              <GoalsPage />
                            </Suspense>
                          </MainLayout>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/user/:userId/categories" 
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <Suspense fallback={<LoadingSpinner size="lg" />}>
                              <CategoriesPage />
                            </Suspense>
                          </MainLayout>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/user/:userId/accounts" 
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <Suspense fallback={<LoadingSpinner size="lg" />}>
                              <AccountsPage />
                            </Suspense>
                          </MainLayout>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/user/:userId/transfers" 
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <Suspense fallback={<LoadingSpinner size="lg" />}>
                              <TransfersPage />
                            </Suspense>
                          </MainLayout>
                        </ProtectedRoute>
                      } 
                    />
                    
                    
                    <Route 
                      path="/user/:userId/user-guide" 
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <Suspense fallback={<LoadingSpinner size="lg" />}>
                              <UserGuide />
                            </Suspense>
                          </MainLayout>
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/user/:userId/updates" 
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <Suspense fallback={<LoadingSpinner size="lg" />}>
                              <UpdatesPage />
                            </Suspense>
                          </MainLayout>
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/user/:userId/customization" 
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <Suspense fallback={<LoadingSpinner size="lg" />}>
                              <CustomizationCenter />
                            </Suspense>
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route 
                      path="/admin/updates" 
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <Suspense fallback={<LoadingSpinner size="lg" />}>
                              <AdminUpdatesPage />
                            </Suspense>
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Setup Route */}
                    <Route 
                      path="/user/:userId/setup" 
                      element={
                        <Suspense fallback={<LoadingSpinner size="lg" />}>
                          <SetupPage />
                        </Suspense>
                      } 
                    />
                    
                    {/* Default Redirect */}
                    <Route path="/" element={<Navigate to="/auth" replace />} />
                    {/* Catch-all for undefined routes */}
                    <Route path="*" element={<Navigate to="/auth" replace />} />
                  </Routes>
                  </div>
                </MobileOptimizer>
                </Router>
              </UserPreferencesProvider>
            </UpdatesProvider>
          </PushNotificationProvider>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

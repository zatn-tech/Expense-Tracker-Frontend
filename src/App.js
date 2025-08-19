// src/App.js
import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { PushNotificationProvider } from './context/PushNotificationContext';

import { ensureNotificationPermission } from './utils/budgetNotificationTrigger';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import ProfilePage from './components/ProfilePage';
import EmailVerification from './components/EmailVerification';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import LoadingSpinner from './components/ui/LoadingSpinner';
import Login from './components/Login';
import AuthCallback from './pages/AuthCallback';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import MobileOptimizer from './components/MobileOptimizer';
import ErrorBoundary from './components/ErrorBoundary';

// Import new page components
import BudgetPage from './pages/BudgetPage';
import TransactionManagementPage from './pages/TransactionManagementPage';
import ImportPage from './pages/ImportPage';
import ReportsPage from './pages/ReportsPage';
import RecurringTransactionsPage from './pages/RecurringTransactionsPage';
import GoalsPage from './pages/GoalsPage';
import CategoriesPage from './pages/CategoriesPage';
import AccountsPage from './pages/AccountsPage';
import TransfersPage from './pages/TransfersPage';
import EmailDetectionPage from './pages/EmailDetectionPage';
import SetupPage from './pages/SetupPage';
import MainLayout from './components/MainLayout';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, isInitialized, loading } = useContext(AuthContext);
  
  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // Check if email is verified
  if (!user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }
  
  // Check if setup is complete - default to false if field doesn't exist
  if (user.isSetupComplete !== true) {
    return <Navigate to={`/user/${user._id}/setup`} replace />;
  }
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
            <Router>
              <MobileOptimizer>
                <div className="App">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
                    <Route path="/verify-email" element={<PublicRoute><EmailVerification /></PublicRoute>} />
                    <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                    <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms-of-service" element={<TermsOfService />} />
                    
                    {/* Protected Routes */}
                    <Route 
                      path="/user/:userId/dashboard" 
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <Dashboard />
                          </MainLayout>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/user/:userId/profile" 
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <ProfilePage />
                          </MainLayout>
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* New Page Routes */}
                    <Route 
                      path="/user/:userId/budgets" 
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <BudgetPage />
                          </MainLayout>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/user/:userId/transactions" 
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <TransactionManagementPage />
                          </MainLayout>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/user/:userId/import" 
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <ImportPage />
                          </MainLayout>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/user/:userId/reports" 
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <ReportsPage />
                          </MainLayout>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/user/:userId/recurring-transactions" 
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <RecurringTransactionsPage />
                          </MainLayout>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/user/:userId/goals" 
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <GoalsPage />
                          </MainLayout>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/user/:userId/categories" 
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <CategoriesPage />
                          </MainLayout>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/user/:userId/accounts" 
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <AccountsPage />
                          </MainLayout>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/user/:userId/transfers" 
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <TransfersPage />
                          </MainLayout>
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/user/:userId/email-detection" 
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <EmailDetectionPage />
                          </MainLayout>
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Setup Route */}
                    <Route 
                      path="/user/:userId/setup" 
                      element={
                        <SetupPage />
                      } 
                    />
                    
                    {/* Default Redirect */}
                    <Route path="/" element={<Navigate to="/auth" replace />} />
                    <Route path="*" element={<Navigate to="/auth" replace />} />
                  </Routes>
                </div>
              </MobileOptimizer>
            </Router>
          </PushNotificationProvider>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

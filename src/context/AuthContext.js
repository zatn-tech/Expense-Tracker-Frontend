// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || sessionStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Set axios default header if token exists
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (token) {
        try {
          setLoading(true);
          const res = await axios.get(API_ENDPOINTS.ME);
          
          if (res.data.status === 'success') {
             setUser(res.data.data.user);
            
          } else {
            throw new Error('Failed to get user data');
          }
        } catch (err) {
          console.error('Auth check failed:', err);
          // Clear invalid token
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          setToken(null);
          setUser(null);
        } finally {
          setLoading(false);
          setIsInitialized(true);
        }
      }
      
    };

    checkAuthStatus();
  }, [token]);

  const login = async (email, password, rememberMe = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.post(API_ENDPOINTS.LOGIN, {
        email,
        password
      });

      if (res.data.status === 'success') {
        const { token: newToken, data: { user: userData } } = res.data;
        
        setToken(newToken);
        setUser(userData);
        
        // Store token based on remember me preference
        if (rememberMe) {
          localStorage.setItem('token', newToken);
          sessionStorage.removeItem('token');
        } else {
          sessionStorage.setItem('token', newToken);
          localStorage.removeItem('token');
        }
        
        return userData;
      } else {
        throw new Error(res.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response?.data) {
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.validationErrors?.length > 0) {
          errorMessage = err.response.data.validationErrors.map(e => e.msg).join(', ');
        }
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const socialLogin = async (token, userData, rememberMe = false) => {
    console.log('🔐 AuthContext: socialLogin called with:', { token: token.substring(0, 20) + '...', userData, rememberMe });
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔐 AuthContext: Setting token and user...');
      setToken(token);
      setUser(userData);
      
      // Store token based on remember me preference
      if (rememberMe) {
        localStorage.setItem('token', token);
        sessionStorage.removeItem('token');
        console.log('🔐 AuthContext: Token stored in localStorage');
      } else {
        sessionStorage.setItem('token', token);
        localStorage.removeItem('token');
        console.log('🔐 AuthContext: Token stored in sessionStorage');
      }
      
      console.log('🔐 AuthContext: socialLogin completed successfully');
      return userData;
    } catch (err) {
      console.error('❌ AuthContext: Social login error:', err);
      setError('Social login failed. Please try again.');
      throw new Error('Social login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.post(API_ENDPOINTS.SIGNUP, {
        name,
        email,
        password,
        passwordConfirm: password
      });

      if (res.data.status === 'success') {
        // Registration successful - user needs to verify email
        return {
          success: true,
          message: res.data.message || 'Registration successful! Please check your email to verify your account.'
        };
      } else {
        throw new Error(res.data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response?.data) {
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.validationErrors?.length > 0) {
          errorMessage = err.response.data.validationErrors.map(e => e.msg).join(', ');
        }
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.post(API_ENDPOINTS.FORGOT_PASSWORD, {
        email
      });

      if (res.data.status === 'success') {
        return {
          success: true,
          message: res.data.message || 'Password reset link sent to your email!'
        };
      } else {
        throw new Error(res.data.message || 'Failed to send reset email');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to send reset email. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, password, passwordConfirm) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.patch(`${API_ENDPOINTS.RESET_PASSWORD}/${token}`, {
        password,
        passwordConfirm
      });

      if (res.data.status === 'success') {
        const { token: newToken, data: { user: userData } } = res.data;
        
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
        
        return {
          success: true,
          message: 'Password reset successful! You are now logged in.'
        };
      } else {
        throw new Error(res.data.message || 'Password reset failed');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      const errorMessage = err.response?.data?.message || 'Password reset failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (currentPassword, newPassword, passwordConfirm) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.patch(API_ENDPOINTS.UPDATE_PASSWORD, {
        passwordCurrent: currentPassword,
        password: newPassword,
        passwordConfirm
      });

      if (res.data.status === 'success') {
        const { token: newToken, data: { user: userData } } = res.data;
        
        setToken(newToken);
        setUser(userData);
        
        // Update stored token
        if (localStorage.getItem('token')) {
          localStorage.setItem('token', newToken);
        } else {
          sessionStorage.setItem('token', newToken);
        }
        
        return {
          success: true,
          message: 'Password updated successfully!'
        };
      } else {
        throw new Error(res.data.message || 'Password update failed');
      }
    } catch (err) {
      console.error('Update password error:', err);
      const errorMessage = err.response?.data?.message || 'Password update failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async (email) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.post(API_ENDPOINTS.RESEND_VERIFICATION, {
        email
      });

      if (res.data.status === 'success') {
        return {
          success: true,
          message: res.data.message || 'Verification email sent!'
        };
      } else {
        throw new Error(res.data.message || 'Failed to send verification email');
      }
    } catch (err) {
      console.error('Resend verification error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to send verification email. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try {
      // Call logout endpoint to invalidate server-side session
      await axios.post(API_ENDPOINTS.LOGOUT);
    } catch (err) {
      // Don't throw error for logout - clear local state anyway
      console.error('Logout error:', err);
    } finally {
      // Clear local state
      setUser(null);
      setToken(null);
      setError(null);
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
  }, []);

  const updateUser = (userData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData
    }));
  };

  const value = {
    user,
    token,
    loading,
    error,
    isInitialized,
    login,
    socialLogin,
    register,
    logout,
    updateUser,
    clearError,
    forgotPassword,
    resetPassword,
    updatePassword,
    resendVerificationEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };

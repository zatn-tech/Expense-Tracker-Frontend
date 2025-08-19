// components/Login.jsx
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SocialLogin from './SocialLogin';

function Login({ onSwitchToRegister }) {
  const { login, loading, error, clearError } = useContext(AuthContext);
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerificationSuccess, setShowVerificationSuccess] = useState(false);

  useEffect(() => {
    clearError();
    
    // Check if user was redirected from email verification
    if (searchParams.get('verified') === 'true') {
      setShowVerificationSuccess(true);
      // Clear the URL parameter
      navigate('/auth', { replace: true });
      // Hide the success message after 5 seconds
      setTimeout(() => {
        setShowVerificationSuccess(false);
      }, 5000);
    }
  }, [clearError, searchParams, navigate]);

  const validateField = (name, value) => {
    const errors = { ...formErrors };
    if (name === 'email') {
      if (!value) errors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(value)) errors.email = 'Enter a valid email';
      else delete errors.email;
    }
    if (name === 'password') {
      if (!value) errors.password = 'Password is required';
      else if (value.length < 6) errors.password = 'At least 6 characters';
      else delete errors.password;
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (value) validateField(name, value);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    const validEmail = validateField('email', formData.email);
    const validPass = validateField('password', formData.password);
    if (!validEmail || !validPass) {
      setIsSubmitting(false);
      return;
    }
    try {
      await login(formData.email, formData.password);
    } catch (error) {
      // Check if the error is about email verification
      if (error.message && error.message.toLowerCase().includes('verify your email')) {
        // Store email for verification page and redirect
        sessionStorage.setItem('verificationEmail', formData.email);
        sessionStorage.setItem('fromLoginAttempt', 'true');
        navigate('/verify-email');
        return;
      }
      // For other errors, let the AuthContext handle them (error will be displayed)
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClassName = fieldName => {
    const base = "w-full px-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500";
    if (formErrors[fieldName]) {
      return `${base} border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-600 dark:focus:ring-red-800 bg-red-50 dark:bg-red-900/20`;
    } else if (formData[fieldName]) {
      return `${base} border-green-300 focus:border-green-500 focus:ring-green-200 dark:border-green-600 dark:focus:ring-green-800`;
    } else {
      return `${base} border-gray-300 focus:border-primary-500 focus:ring-primary-200 dark:border-gray-600 dark:focus:ring-primary-800`;
    }
  };

  // New: handle forgot password click
  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-3xl">💰</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Sign in to your expense tracker account</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 rounded-lg animate-in slide-in-from-top duration-300">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293..." clipRule="evenodd" />
              </svg>
              <p className="ml-3 text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Email Verification Success Alert */}
        {showVerificationSuccess && (
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 p-4 rounded-lg animate-in slide-in-from-top duration-300">
            <div className="flex">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="ml-3 text-sm text-green-700 dark:text-green-200">
                ✅ Email verified successfully! You can now log in to your account.
              </p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={`${getInputClassName('email')} pl-10`}
                />
              </div>
              {formErrors.email && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`${getInputClassName('password')} pl-10 pr-10`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {formErrors.password && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.password}</p>}
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={loading || isSubmitting || Object.keys(formErrors).length > 0}
                className={`w-full py-3.5 rounded-xl text-white transition-all duration-200 ${
                  loading || isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800'
                }`}
              >
                {loading || isSubmitting ? 'Signing in...' : 'Sign in to your account'}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 font-medium transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          </form>

                    {/* Social Login */}
          <SocialLogin 
            onSuccess={({ token, user }) => {
              // The social login component will handle the authentication
              console.log('Social login successful:', user);
            }}
            onError={(error) => {
              console.error('Social login error:', error);
            }}
          />
        </div>

        {/* Switch to Register */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <button onClick={onSwitchToRegister} className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
              Sign up now
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

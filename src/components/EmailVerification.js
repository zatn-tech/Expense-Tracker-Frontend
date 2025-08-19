// src/components/EmailVerification.js
import React, { useState, useContext, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import LoadingSpinner from './ui/LoadingSpinner';

function EmailVerification() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, resendVerificationEmail, loading } = useContext(AuthContext);
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (token) {
      // If there's a token in URL, verify it automatically
      verifyEmailToken();
    } else if (user?.emailVerified) {
      // If user is already verified, redirect to dashboard
      navigate(`/user/${user._id}/dashboard`);
    } else {
      // Check if user just signed up (email stored in sessionStorage)
      const signupEmail = sessionStorage.getItem('verificationEmail');
      if (signupEmail) {
        setEmail(signupEmail);
        // Check if user came from login attempt vs signup
        const fromLogin = sessionStorage.getItem('fromLoginAttempt');
        if (fromLogin) {
          setMessage('Your email needs to be verified before you can log in. Please check your email for a verification link.');
          sessionStorage.removeItem('fromLoginAttempt');
        } else {
          setMessage('Please check your email for a verification link. Click the link in your email to verify your account.');
        }
      }
    }
  }, [token, user, navigate]);

  const verifyEmailToken = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.RESEND_VERIFICATION.replace('/resend-verification', '')}/verify-email/${token}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setVerificationStatus('success');
        setMessage(data.message || 'Email verified successfully!');
        
        // Clear signup email from sessionStorage
        sessionStorage.removeItem('verificationEmail');
        
        // Redirect to login after 3 seconds with a success message
        setTimeout(() => {
          navigate('/auth?verified=true');
        }, 3000);
      } else {
        setVerificationStatus('error');
        setMessage(data.message || 'Email verification failed. The link may have expired.');
      }
    } catch (error) {
      setVerificationStatus('error');
      setMessage('Email verification failed. Please try again.');
    }
  };

  const handleResendEmail = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }

    setResendLoading(true);
    try {
      // For users not logged in (post-signup), make direct API call
      if (!user) {
        const response = await fetch(API_ENDPOINTS.RESEND_VERIFICATION, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setMessage(data.message || 'Verification email sent successfully!');
          setVerificationStatus('resent');
        } else {
          throw new Error(data.message || 'Failed to resend verification email');
        }
      } else {
        // For logged in users, use AuthContext method
        const result = await resendVerificationEmail(email);
        if (result.success) {
          setMessage(result.message);
          setVerificationStatus('resent');
        }
      }
    } catch (error) {
      setMessage(error.message || 'Failed to resend verification email');
      setVerificationStatus('error');
    } finally {
      setResendLoading(false);
    }
  };

  if (token && verificationStatus === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full mx-auto text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying your email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg">
            {verificationStatus === 'success' ? (
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : verificationStatus === 'error' ? (
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            )}
          </div>
          
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            {verificationStatus === 'success' ? 'Email Verified!' :
             verificationStatus === 'error' ? 'Verification Failed' :
             'Verify Your Email'}
          </h2>
          
          {!token && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Please check your email and click the verification link, or enter your email below to resend.
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700">
          {verificationStatus === 'success' && (
            <div className="text-center">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-600 dark:text-green-400 mb-4">{message}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Redirecting you to login page...
              </p>
              <Link
                to="/auth"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Go to Login
              </Link>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className="text-center">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-600 dark:text-red-400 mb-6">{message}</p>
              <div className="space-y-4">
                <Link
                  to="/auth"
                  className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Back to Login
                </Link>
                <button
                  onClick={() => setVerificationStatus('pending')}
                  className="block w-full text-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {(verificationStatus === 'pending' || verificationStatus === 'resent') && !token && (
            <form onSubmit={handleResendEmail} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {message && (
                <div className={`p-4 rounded-lg ${
                  verificationStatus === 'resent' 
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                }`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={resendLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white transition-all duration-200 ${
                  resendLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                }`}
              >
                {resendLoading ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" color="white" />
                    <span className="ml-2">Sending...</span>
                  </div>
                ) : (
                  'Resend Verification Email'
                )}
              </button>

              <div className="text-center">
                <Link
                  to="/auth"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmailVerification;

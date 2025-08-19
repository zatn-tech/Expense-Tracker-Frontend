import React, { useState, useContext } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function ChangePassword() {
  const { userId } = useParams();
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });

  const passwordRequirements = [
    { text: 'At least 6 characters', check: (pwd) => pwd.length >= 6 },
    { text: 'Contains uppercase letter', check: (pwd) => /[A-Z]/.test(pwd) },
    { text: 'Contains lowercase letter', check: (pwd) => /[a-z]/.test(pwd) },
    { text: 'Contains number', check: (pwd) => /\d/.test(pwd) },
    { text: 'Contains special character', check: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    
    try {
      await axios.put(API_ENDPOINTS.USER_CHANGE_PASSWORD(userId), {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Show success feedback
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
      successMsg.innerHTML = '<span class="mr-2">🔒</span>Password changed successfully!';
      document.body.appendChild(successMsg);
      setTimeout(() => document.body.removeChild(successMsg), 3000);
      
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      alert('Error changing password: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md">
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600 mb-6">
        <div className="flex items-center mb-4">
          <span className="text-xl mr-3">🔐</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Keep your account secure with a strong password</p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Password */}
        <div>
          <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.old ? 'text' : 'password'}
              id="oldPassword"
              name="oldPassword"
              required
              value={formData.oldPassword}
              onChange={handleChange}
              className="block w-full px-4 py-3 pr-12 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 rounded-lg transition-colors duration-200"
              placeholder="Enter your current password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('old')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
            >
              <span className="text-lg">
                {showPasswords.old ? '🙈' : '👁️'}
              </span>
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.new ? 'text' : 'password'}
              id="newPassword"
              name="newPassword"
              required
              value={formData.newPassword}
              onChange={handleChange}
              className="block w-full px-4 py-3 pr-12 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 rounded-lg transition-colors duration-200"
              placeholder="Enter your new password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
            >
              <span className="text-lg">
                {showPasswords.new ? '🙈' : '👁️'}
              </span>
            </button>
          </div>
          
          {/* Password Requirements */}
          {formData.newPassword && (
            <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Password Requirements:</h4>
              <div className="space-y-2">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center text-xs">
                    <span className={`mr-2 ${req.check(formData.newPassword) ? 'text-green-500' : 'text-red-500'}`}>
                      {req.check(formData.newPassword) ? '✅' : '❌'}
                    </span>
                    <span className={req.check(formData.newPassword) ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Confirm New Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="block w-full px-4 py-3 pr-12 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 rounded-lg transition-colors duration-200"
              placeholder="Confirm your new password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
            >
              <span className="text-lg">
                {showPasswords.confirm ? '🙈' : '👁️'}
              </span>
            </button>
          </div>
          
          {formData.confirmPassword && (
            <div className="mt-2 text-xs">
              <span className={`flex items-center ${formData.newPassword === formData.confirmPassword ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                <span className="mr-1">
                  {formData.newPassword === formData.confirmPassword ? '✅' : '❌'}
                </span>
                {formData.newPassword === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
              </span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || formData.newPassword !== formData.confirmPassword || formData.newPassword.length < 6}
          className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-base font-medium text-white transition-all duration-200 ${
            loading || formData.newPassword !== formData.confirmPassword || formData.newPassword.length < 6
              ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
              : 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800'
          }`}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Changing Password...
            </>
          ) : (
            <>
              <span className="mr-2">🔒</span>
              Change Password
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default ChangePassword;

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';

function DeleteAccount() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleDeleteAccount = async () => {
    // First confirmation
    const firstConfirm = window.confirm(
      `Are you absolutely sure you want to delete your account?

This action cannot be undone and will permanently delete:
• All transactions and financial records
• All budgets and goals  
• All categories and accounts
• All recurring transactions
• All email connections
• All notifications and preferences

Click OK to proceed to final confirmation.`
    );

    if (!firstConfirm) return;
    
    // Second confirmation with text input
    setShowConfirmDialog(true);
  };

  const handleFinalConfirmation = async () => {
    if (confirmText !== 'DELETE MY ACCOUNT') {
      setError('Please type "DELETE MY ACCOUNT" exactly to confirm deletion.');
      return;
    }

    setIsDeleting(true);
    setError('');
    setShowConfirmDialog(false);

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch(API_ENDPOINTS.USER_DELETE_ACCOUNT(user._id), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        // Account deleted successfully
        // Logout and redirect to auth page
        await logout();
        
        // Show success message
        alert('Your account has been permanently deleted. Thank you for using our service.');
        
        // Redirect to auth page
        navigate('/auth');
      } else {
        throw new Error(data.message || 'Failed to delete account');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Danger Zone</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Irreversible and destructive actions
        </p>
      </div>

      {/* Warning Section */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-red-500 text-xl">⚠️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Warning: This action is irreversible
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              Once you delete your account, all your data will be permanently removed from our servers.
              This includes all your transactions, budgets, goals, and other financial data.
            </p>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Account to be deleted:</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Member since:</strong> {new Date(user?.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* What will be deleted */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          The following data will be permanently deleted:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <span className="text-red-500">•</span>
            <span>All transactions</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-red-500">•</span>
            <span>All budgets and goals</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-red-500">•</span>
            <span>All accounts and balances</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-red-500">•</span>
            <span>All categories</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-red-500">•</span>
            <span>All recurring transactions</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-red-500">•</span>
            <span>All transfers</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-red-500">•</span>
            <span>All email connections</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-red-500">•</span>
            <span>All notifications</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-red-500">•</span>
            <span>Profile and preferences</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-red-500">•</span>
            <span>All exported reports</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-500">❌</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Button */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <div className="flex flex-col space-y-4">
          <button
            onClick={handleDeleteAccount}
            disabled={isDeleting || showConfirmDialog}
            className={`w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg text-sm font-medium transition-colors ${
              isDeleting || showConfirmDialog
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-white'
            }`}
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting Account...
              </>
            ) : (
              <>
                <span className="mr-2">🗑️</span>
                Delete My Account
              </>
            )}
          </button>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            This action cannot be undone. Please be certain before proceeding.
          </p>
        </div>
      </div>

      {/* Final Confirmation Modal */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-red-500 text-2xl">⚠️</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Final Confirmation
              </h3>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Type <strong>"DELETE MY ACCOUNT"</strong> exactly to confirm account deletion:
            </p>
            
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE MY ACCOUNT"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            
            {error && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-2">{error}</p>
            )}
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setConfirmText('');
                  setError('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalConfirmation}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeleteAccount;
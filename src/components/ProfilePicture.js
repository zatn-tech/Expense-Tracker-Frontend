import React, { useState, useContext } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useConfirmation } from '../hooks/useConfirmation';
import ConfirmationDialog from './ui/ConfirmationDialog';

function ProfilePicture({ currentImage, onUpdate }) {
  const { userId } = useParams();
  const { token, user } = useContext(AuthContext);
  const { showSuccess, showError } = useNotification();
  const { confirmation, showConfirmation, hideConfirmation } = useConfirmation();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  // Security check
  React.useEffect(() => {
    if (user && userId !== user._id) {
      console.warn('Access denied: Cannot modify another user\'s profile picture');
      return;
    }
  }, [userId, user]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);

      // Upload file
      uploadImage(file);
    }
  };

  const uploadImage = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const res = await axios.post(API_ENDPOINTS.USER_UPLOAD_PICTURE(userId), formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      onUpdate(res.data.profilePicture);
      setPreview(null);
      
      // Show success notification
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
      successMsg.innerHTML = '<span class="mr-2">📸</span>Profile picture updated successfully!';
      document.body.appendChild(successMsg);
      setTimeout(() => {
        if (document.body.contains(successMsg)) {
          document.body.removeChild(successMsg);
        }
      }, 3000);
      
    } catch (err) {
      console.error('Upload error:', err);
      let errorMessage = 'Error uploading image';
      
      if (err.response?.status === 403) {
        errorMessage = 'Access denied: You can only update your own profile picture';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert('Error uploading image: ' + errorMessage);
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async () => {
    showConfirmation({
      title: 'Remove Profile Picture',
      message: 'Are you sure you want to remove your profile picture? This action cannot be undone.',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      type: 'warning',
      onConfirm: async () => {
        try {
          setUploading(true);
          await axios.put(API_ENDPOINTS.USER_PROFILE(userId), {
            profilePicture: ''
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          onUpdate('');
          showSuccess('Profile picture removed successfully!');
        } catch (err) {
          console.error('Remove image error:', err);
          showError('Error removing profile picture: ' + (err.response?.data?.error || err.message));
        } finally {
          setUploading(false);
        }
      }
    });
  };

  const getImageSrc = () => {
    if (preview) return preview;
    if (currentImage) {
      if (currentImage.startsWith('http')) {
        return currentImage;
      }
      // Remove /uploads/ prefix from currentImage if it exists to avoid duplication
      let cleanPath = currentImage;
      if (cleanPath.startsWith('/uploads/')) {
        cleanPath = cleanPath.substring(8); // Remove '/uploads/'
      } else if (cleanPath.startsWith('uploads/')) {
        cleanPath = cleanPath.substring(8); // Remove 'uploads/'
      }
      return `${API_ENDPOINTS.UPLOAD_BASE}/${cleanPath}`;
    }
    return null;
  };

  const getInitials = () => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Profile Picture Container */}
      <div className="relative group">
        {/* Main Profile Picture Circle */}
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center border-4 border-white dark:border-gray-600 shadow-xl transition-all duration-300 group-hover:shadow-2xl">
          {getImageSrc() ? (
            <img
              src={getImageSrc()}
              alt="Profile"
              className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
              onError={(e) => {
                console.error('Error loading profile image:', e);
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 text-white text-3xl font-bold">
              {getInitials()}
            </div>
          )}
          
          {/* Loading Overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-60 rounded-full flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-white border-t-transparent mb-2"></div>
              <span className="text-white text-xs font-medium">Uploading...</span>
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full transition-all duration-300 flex items-center justify-center">
            <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Change Photo
            </span>
          </div>
        </div>

        {/* Upload Button - Better positioned */}
        <label className="absolute -bottom-2 -right-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 text-white rounded-full w-12 h-12 flex items-center justify-center cursor-pointer shadow-lg transition-all duration-300 transform hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-800 border-4 border-white dark:border-gray-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading || (user && userId !== user._id)}
          />
        </label>

        {/* Remove Button - Better positioned */}
        {currentImage && !uploading && (
          <button
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center cursor-pointer shadow-lg transition-all duration-300 transform hover:scale-110 opacity-0 group-hover:opacity-100 focus:outline-none focus:ring-4 focus:ring-red-200 dark:focus:ring-red-800 border-3 border-white dark:border-gray-800"
            title="Remove profile picture"
            disabled={user && userId !== user.id}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Upload Instructions and Actions */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-4">
          {/* Upload Button (Alternative) */}
          <label className="inline-flex items-center px-4 py-2 border border-primary-300 dark:border-primary-600 rounded-lg text-sm font-medium text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload Photo
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading || (user && userId !== user._id)}
            />
          </label>

          {/* Remove Button (Alternative) */}
          {currentImage && !uploading && (
            <button
              onClick={removeImage}
              className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-600 rounded-lg text-sm font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
              disabled={user && userId !== user._id}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remove
            </button>
          )}
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>Maximum file size: 5MB</p>
          <p>Supported formats: JPG, PNG, GIF, WebP</p>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmation.isOpen}
        onClose={hideConfirmation}
        onConfirm={confirmation.onConfirm}
        title={confirmation.title}
        message={confirmation.message}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        type={confirmation.type}
      />
    </div>
  );
}

export default ProfilePicture;

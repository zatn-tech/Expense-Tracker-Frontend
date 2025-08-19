import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { AuthContext } from '../context/AuthContext';
import { useParams } from 'react-router-dom';

// Date utility function for form input
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return '';
  }
};

function EditProfile({ onCancel }) {
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({ // This is where setFormData should be
    id:'',
    name: '',
    phone: '',
    bio: '',
    dateOfBirth: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const { userId } = useParams();

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_ENDPOINTS.USER_PROFILE(userId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profile = res.data;
      
      setFormData({ // This is correct - setFormData is defined above
        id:profile._id,
        name: profile.name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        dateOfBirth: formatDateForInput(profile.dateOfBirth)
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const dataToSend = {
      name: formData.name,
      phone: formData.phone,
      bio: formData.bio,
      dateOfBirth: formData.dateOfBirth || null
    };

    console.log('Sending profile data:', dataToSend);
    
    try {
      const response = await axios.put(API_ENDPOINTS.USER_PROFILE(formData.id), dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Profile update response:', response.data);
      alert('Profile updated successfully!');
      onCancel(); // Go back to view mode
    } catch (err) {
      console.error('Profile update error:', err);
      alert('Error updating profile: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself..."
            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
          <p className="mt-1 text-xs text-gray-500">
            {formData.bio.length}/500 characters
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              ${saving 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
              }`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProfile;

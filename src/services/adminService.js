import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

// Admin Updates Service
export const adminUpdatesService = {
  // Get all updates with pagination
  getUpdates: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.ADMIN_UPDATES}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch updates');
    }
  },

  // Create a new update
  createUpdate: async (updateData) => {
    try {
      const response = await axios.post(API_ENDPOINTS.ADMIN_UPDATES, updateData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create update');
    }
  },

  // Get a single update
  getUpdate: async (id) => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.ADMIN_UPDATES}/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch update');
    }
  },

  // Update an existing update
  updateUpdate: async (id, updateData) => {
    try {
      const response = await axios.put(`${API_ENDPOINTS.ADMIN_UPDATES}/${id}`, updateData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update update');
    }
  },

  // Delete an update
  deleteUpdate: async (id) => {
    try {
      const response = await axios.delete(`${API_ENDPOINTS.ADMIN_UPDATES}/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete update');
    }
  },

  // Toggle update status
  toggleUpdateStatus: async (id) => {
    try {
      const response = await axios.patch(`${API_ENDPOINTS.ADMIN_UPDATES}/${id}/toggle`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to toggle update status');
    }
  },

  // Get update statistics
  getStats: async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.ADMIN_UPDATES_STATS);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch update statistics');
    }
  }
};

// Admin authentication check
export const checkAdminAccess = async () => {
  try {
    const response = await axios.get(`${API_ENDPOINTS.ADMIN_UPDATES}/stats`);
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

export default adminUpdatesService;

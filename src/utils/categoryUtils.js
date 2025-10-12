import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useState } from 'react';

// Cache for categories to avoid repeated API calls
let categoryCache = {
  categories: [],
  lastFetched: null,
  userId: null
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const fetchCategories = async (userId, token, forceRefresh = false) => {
  // Check if we have valid cached data
  const now = Date.now();
  if (!forceRefresh && 
      categoryCache.userId === userId && 
      categoryCache.lastFetched && 
      (now - categoryCache.lastFetched) < CACHE_DURATION) {
    return categoryCache.categories;
  }

  try {
    const response = await axios.get(API_ENDPOINTS.USER_CATEGORIES(userId), {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Update cache
    categoryCache = {
      categories: response.data,
      lastFetched: now,
      userId
    };

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Hook for dynamic category loading based on type
export const useDynamicCategories = (userId, token) => {
  const [categories, setCategories] = useState({ expense: [], income: [] });
  const [loading, setLoading] = useState(false);

  const loadCategoriesByType = async (type) => {
    try {
      setLoading(true);
      const categoriesForType = await fetchCategoriesByType(userId, token, type);
      setCategories(prev => ({
        ...prev,
        [type]: categoriesForType
      }));
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const loadAllCategories = async () => {
    try {
      setLoading(true);
      const [expenseCategories, incomeCategories] = await Promise.all([
        fetchCategoriesByType(userId, token, 'expense'),
        fetchCategoriesByType(userId, token, 'income')
      ]);
      
      setCategories({
        expense: expenseCategories,
        income: incomeCategories
      });
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    loadCategoriesByType,
    loadAllCategories
  };
};

export const fetchCategoriesByType = async (userId, token, type) => {
  try {
    const response = await axios.get(API_ENDPOINTS.USER_CATEGORIES_TYPE(userId, type), {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCategorySubtypes = () => {
  return {
    income: [
      { value: 'employment', label: 'Employment' },
      { value: 'business', label: 'Business' },
      { value: 'investment', label: 'Investment' },
      { value: 'property', label: 'Property' },
      { value: 'other', label: 'Other' }
    ],
    expense: [
      { value: 'daily', label: 'Daily Living' },
      { value: 'transport', label: 'Transportation' },
      { value: 'retail', label: 'Shopping & Retail' },
      { value: 'utilities', label: 'Bills & Utilities' },
      { value: 'leisure', label: 'Entertainment & Leisure' },
      { value: 'health', label: 'Healthcare' },
      { value: 'education', label: 'Education' },
      { value: 'housing', label: 'Housing' },
      { value: 'insurance', label: 'Insurance' },
      { value: 'debt', label: 'Debt Payment' },
      { value: 'savings', label: 'Savings' },
      { value: 'investment', label: 'Investment' },
      { value: 'other', label: 'Other' }
    ]
  };
};

export const clearCategoryCache = () => {
  categoryCache = {
    categories: [],
    lastFetched: null,
    userId: null
  };
};

export const getCategoryIcon = (categoryName, categories) => {
  const category = categories.find(cat => cat.name === categoryName);
  return category?.icon || '📋';
};

export const getCategoryColor = (categoryName, categories) => {
  const category = categories.find(cat => cat.name === categoryName);
  return category?.color || '#3B82F6';
};

export const formatCategoryName = (categoryName, categories) => {
  const category = categories.find(cat => cat.name === categoryName);
  if (category) {
    return `${category.icon} ${category.name}`;
  }
  return categoryName;
}; 
import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';

const CategoryManager = ({ onCategoriesSet, isSetupMode = false }) => {
  const { userId } = useParams();
  const { token } = useContext(AuthContext);
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [filterType, setFilterType] = useState('all');
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    subtype: '',
    icon: '📋',
    color: '#3B82F6',
    description: ''
  });

  const categorySubtypes = {
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

  const iconOptions = [
    '📋', '💰', '💸', '🛒', '🚗', '🏠', '⚡', '🎮', '🏥', '📚', '🛡️', '💳', '💎', '📱', '🍔', '✈️', '🎬', '🏋️', '💊', '🎓'
  ];

  useEffect(() => {
    fetchCategories();
  }, [userId]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.USER_CATEGORIES(userId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data);
    } catch (error) {
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        await axios.put(`${API_ENDPOINTS.USER_CATEGORIES(userId)}/${editingCategory._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(API_ENDPOINTS.USER_CATEGORIES(userId), formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setShowAddForm(false);
      setEditingCategory(null);
      resetForm();
      await fetchCategories();
      setError(null);
      
      // In setup mode, don't auto-advance - let user add more categories
      // The continue button will call onCategoriesSet when ready
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save category');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'expense',
      subtype: '',
      icon: '📋',
      color: '#3B82F6',
      description: ''
    });
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      subtype: category.subtype,
      icon: category.icon,
      color: category.color,
      description: category.description || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`${API_ENDPOINTS.USER_CATEGORIES(userId)}/${categoryId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchCategories();
        setError(null);
      } catch (error) {
        setError('Failed to delete category');
      }
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingCategory(null);
    resetForm();
    setError(null);
  };

  const filteredCategories = categories.filter(category => {
    if (filterType === 'all') return true;
    return category.type === filterType;
  });

  if (loading) {
    return (
      <div className="bg-white dark:bg-black rounded-lg p-6">
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading categories...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black rounded-lg shadow-xl w-full">
      <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your income and expense categories
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-3 lg:px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-medium transition-colors shadow-modern hover:from-indigo-700 hover:to-indigo-800 text-sm lg:text-base"
        >
          Add Category
        </button>
      </div>

      {error && (
        <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Add/Edit Category Form */}
      {showAddForm && (
        <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 lg:p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter category name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => {
                      setFormData({ ...formData, type: e.target.value, subtype: '' });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subtype *
                  </label>
                  <select
                    required
                    value={formData.subtype}
                    onChange={(e) => setFormData({ ...formData, subtype: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select subtype</option>
                    {categorySubtypes[formData.type]?.map((subtype) => (
                      <option key={subtype.value} value={subtype.value}>
                        {subtype.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Icon
                  </label>
                  <div className="grid grid-cols-10 gap-2">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-lg transition-colors ${
                          formData.icon === icon
                            ? 'border-indigo-500 bg-indigo-100 dark:bg-indigo-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Color
                  </label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Optional description"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="p-4 lg:p-6">
        {/* Filter Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {['all', 'expense', 'income'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                filterType === type
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {filteredCategories.map((category) => (
            <div key={category._id} className="p-3 lg:p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                    style={{ backgroundColor: category.color + '20' }}
                  >
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm lg:text-base">{category.name}</h3>
                    <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                      {category.type} • {category.subtype}
                    </p>
                    {category.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    title="Edit category"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Delete category"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📂</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {filterType === 'all' ? 'No Categories Found' : `No ${filterType} Categories`}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {filterType === 'all' 
                ? 'Create your first category to start organizing your transactions'
                : `Create your first ${filterType} category`
              }
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create Category
            </button>
          </div>
        )}

        {/* Continue to Next Step button for setup mode */}
        {isSetupMode && categories.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 lg:p-6 bg-gray-50 dark:bg-gray-900/50">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Great! You've created {categories.length} categor{categories.length === 1 ? 'y' : 'ies'}. 
                You can add more categories or continue to the next step.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 border border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors font-medium"
                >
                  <span className="mr-2">➕</span>
                  Add Another Category
                </button>
                <button
                  onClick={() => onCategoriesSet && onCategoriesSet()}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <span className="mr-2">👍</span>
                  Continue to Next Step
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManager; 
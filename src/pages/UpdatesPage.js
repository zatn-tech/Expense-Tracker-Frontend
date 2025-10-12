import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  getUpdates, 
  markUpdateAsRead, 
  markAllUpdatesAsRead,
  getUpdateTypeIcon,
  getUpdateTypeColor,
  getPriorityColor
} from '../services/updateService';
import { useUpdates } from '../context/UpdatesContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const UpdatesPage = () => {
  const { userId } = useParams();
  const { unreadCount, updateUnreadCount, decrementUnreadCount, clearUnreadCount } = useUpdates();
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const hasInitialized = useRef(false);

  // Fetch updates data
  const fetchUpdates = useCallback(async (page = 1, type = '', priority = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit: 10,
        ...(type && { type }),
        ...(priority && { priority })
      };
      
      const response = await getUpdates(userId, params);
      
      if (response.status === 'success') {
        setUpdates(response.data.updates);
        // Don't call updateUnreadCount here - let the context handle it
        setTotalPages(response.data.pagination.pages);
        setCurrentPage(response.data.pagination.page);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);


  // Mark update as read
  const handleMarkAsRead = async (updateId) => {
    try {
      const response = await markUpdateAsRead(userId, updateId);
      if (response.status === 'success') {
        // Update local state
        setUpdates(prev => 
          prev.map(update => 
            update._id === updateId 
              ? { ...update, isRead: true }
              : update
          )
        );
        decrementUnreadCount();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const response = await markAllUpdatesAsRead(userId);
      if (response.status === 'success') {
        setUpdates(prev => prev.map(update => ({ ...update, isRead: true })));
        clearUnreadCount();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle filter changes
  const handleFilterChange = (newType, newPriority) => {
    setFilterType(newType);
    setFilterPriority(newPriority);
    setCurrentPage(1);
    fetchUpdates(1, newType, newPriority);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchUpdates(newPage, filterType, filterPriority);
  };

  // Initial load
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchUpdates();
    }
  }, [fetchUpdates]);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && updates.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Updates & Announcements
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Stay informed about new features, improvements, and important announcements
            </p>
          </div>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filter by Type
          </label>
          <select
            id="type-filter"
            value={filterType}
            onChange={(e) => handleFilterChange(e.target.value, filterPriority)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Types</option>
            <option value="feature">Features</option>
            <option value="improvement">Improvements</option>
            <option value="bugfix">Bug Fixes</option>
            <option value="announcement">Announcements</option>
            <option value="security">Security</option>
          </select>
        </div>
        
        <div className="flex-1">
          <label htmlFor="priority-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filter by Priority
          </label>
          <select
            id="priority-filter"
            value={filterPriority}
            onChange={(e) => handleFilterChange(filterType, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error loading updates
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Updates List */}
      <div className="space-y-4">
        {updates.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No updates found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filterType || filterPriority 
                ? 'Try adjusting your filters to see more updates.'
                : 'No updates have been published yet.'}
            </p>
          </div>
        ) : (
          updates.map((update) => (
            <div
              key={update._id}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 ${
                !update.isRead ? 'ring-2 ring-indigo-100 dark:ring-indigo-900/30 bg-gradient-to-r from-white to-indigo-50/30 dark:from-gray-800 dark:to-indigo-900/10' : ''
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-lg text-white">
                          {getUpdateTypeIcon(update.type)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold ${
                          !update.isRead 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {update.title}
                        </h3>
                        {!update.isRead && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 mt-1">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {update.description}
                    </p>
                    
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUpdateTypeColor(update.type)}`}>
                        {getUpdateTypeIcon(update.type)} {update.type}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(update.priority)}`}>
                        {update.priority} priority
                      </span>
                      {update.version && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600">
                          v{update.version}
                        </span>
                      )}
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(update.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  {!update.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(update._id)}
                      className="ml-4 p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                      aria-label="Mark as read"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-2 text-sm font-medium rounded-lg ${
                page === currentPage
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Loading overlay for pagination */}
      {loading && updates.length > 0 && (
        <div className="flex items-center justify-center py-4">
          <LoadingSpinner size="sm" />
        </div>
      )}
    </div>
  );
};

export default UpdatesPage;

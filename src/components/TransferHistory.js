import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { AuthContext } from '../context/AuthContext';
import { TYPOGRAPHY, TYPOGRAPHY_COMBINATIONS } from '../utils/typography';

const TransferHistory = ({ onTransferUpdate, className = '' }) => {
  const { token, user } = useContext(AuthContext);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTransfer, setEditingTransfer] = useState(null);
  const [editForm, setEditForm] = useState({
    description: '',
    notes: '',
    transferDate: ''
  });
  const [revertingTransfer, setRevertingTransfer] = useState(null);
  const [showConfirmRevert, setShowConfirmRevert] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    hasMore: true
  });

  useEffect(() => {
    fetchTransfers();
  }, [pagination.page]);

  const fetchTransfers = async () => {
    try {
      const skip = (pagination.page - 1) * pagination.limit;
      const response = await axios.get(`${API_ENDPOINTS.TRANSFERS}?limit=${pagination.limit}&skip=${skip}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status === 'success') {
        if (pagination.page === 1) {
          setTransfers(response.data.data);
        } else {
          setTransfers(prev => [...prev, ...response.data.data]);
        }
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          hasMore: response.data.pagination.hasMore
        }));
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (transfer) => {
    setEditingTransfer(transfer);
    setEditForm({
      description: transfer.description || '',
      notes: transfer.notes || '',
      transferDate: transfer.transferDate ? new Date(transfer.transferDate).toISOString().split('T')[0] : ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingTransfer) return;

    try {
      const response = await axios.put(API_ENDPOINTS.TRANSFER(editingTransfer._id), editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status === 'success') {
        // Update local state
        setTransfers(prev => prev.map(transfer => 
          transfer._id === editingTransfer._id 
            ? { ...transfer, ...editForm }
            : transfer
        ));

        setEditingTransfer(null);
        setEditForm({ description: '', notes: '', transferDate: '' });

        if (onTransferUpdate) {
          onTransferUpdate(response.data.data);
        }
      }
    } catch (error) {
    }
  };

  const handleRevert = async () => {
    if (!revertingTransfer) return;

    try {
      const response = await axios.delete(API_ENDPOINTS.TRANSFER(revertingTransfer._id), {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status === 'success') {
        // Update the transfer status to cancelled instead of removing it
        setTransfers(prev => prev.map(transfer => 
          transfer._id === revertingTransfer._id 
            ? { ...transfer, status: 'cancelled' }
            : transfer
        ));
        setRevertingTransfer(null);
        setShowConfirmRevert(false);

        if (onTransferUpdate) {
          onTransferUpdate(response.data.data);
        }
      }
    } catch (error) {
      
      // Show more detailed error information
      if (error.response) {
      } else if (error.request) {
      } else {
      }
      
      // Reset state on error
      setRevertingTransfer(null);
      setShowConfirmRevert(false);
    }
  };

  const confirmRevert = (transfer) => {
    setRevertingTransfer(transfer);
    setShowConfirmRevert(true);
  };

  const cancelRevert = () => {
    setRevertingTransfer(null);
    setShowConfirmRevert(false);
  };

  const loadMore = () => {
    setPagination(prev => ({ ...prev, page: prev.page + 1 }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'failed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  if (loading && transfers.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 ${className}`}>
      <div className="mb-6">
        <h3 className={TYPOGRAPHY_COMBINATIONS.cardHeader.title}>Transfer History</h3>
        <p className={TYPOGRAPHY.BODY_SM + " text-gray-600 dark:text-gray-400 mt-2"}>
          View and manage your account transfers
        </p>
      </div>

      {transfers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🏦</div>
          <h4 className={TYPOGRAPHY.BODY_LG + " font-medium text-gray-900 dark:text-white mb-2"}>
            No transfers yet
          </h4>
          <p className={TYPOGRAPHY.BODY_SM + " text-gray-600 dark:text-gray-400"}>
            Start transferring funds between your accounts to see them here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {transfers.map((transfer) => (
            <div
              key={transfer._id}
              className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 hover:shadow-md transition-all duration-200"
            >
              {editingTransfer?._id === transfer._id ? (
                // Edit Form
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={TYPOGRAPHY.BODY_XS + " font-medium text-gray-700 dark:text-gray-300 block mb-1"}>
                        Description
                      </label>
                      <input
                        type="text"
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className={TYPOGRAPHY.BODY_XS + " font-medium text-gray-700 dark:text-gray-300 block mb-1"}>
                        Transfer Date
                      </label>
                      <input
                        type="date"
                        value={editForm.transferDate}
                        onChange={(e) => setEditForm(prev => ({ ...prev, transferDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={TYPOGRAPHY.BODY_XS + " font-medium text-gray-700 dark:text-gray-300 block mb-1"}>
                      Notes
                    </label>
                    <textarea
                      value={editForm.notes}
                      onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditingTransfer(null)}
                      className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 rounded-lg transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </form>
              ) : (
                // Display Mode
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className={TYPOGRAPHY.BODY_LG + " font-semibold text-gray-900 dark:text-white"}>
                          {transfer.description || 'Transfer between accounts'}
                        </h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transfer.status)}`}>
                          {transfer.status}
                        </span>
                      </div>
                      <p className={TYPOGRAPHY.BODY_SM + " text-gray-600 dark:text-gray-400"}>
                        {formatDate(transfer.transferDate)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(transfer)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Edit transfer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => confirmRevert(transfer)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Revert transfer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Transfer Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <p className={TYPOGRAPHY.BODY_XS + " text-gray-500 dark:text-gray-400 mb-1"}>From</p>
                      <p className={TYPOGRAPHY.BODY_SM + " font-medium text-gray-900 dark:text-white"}>
                        {transfer.fromAccountId?.name || 'Unknown Account'}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <p className={TYPOGRAPHY.BODY_XS + " text-gray-500 dark:text-gray-400 mb-1"}>To</p>
                      <p className={TYPOGRAPHY.BODY_SM + " font-medium text-gray-900 dark:text-white"}>
                        {transfer.toAccountId?.name || 'Unknown Account'}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <p className={TYPOGRAPHY.BODY_XS + " text-gray-500 dark:text-gray-400 mb-1"}>Amount</p>
                      <p className={TYPOGRAPHY.BODY_SM + " font-semibold text-gray-900 dark:text-white"}>
                        {formatAmount(transfer.amount)}
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  {transfer.notes && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <p className={TYPOGRAPHY.BODY_XS + " text-blue-700 dark:text-blue-300"}>
                        <span className="font-medium">Notes:</span> {transfer.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Load More Button */}
          {pagination.hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={loadMore}
                className="px-6 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-colors"
              >
                Load More Transfers
              </button>
            </div>
          )}
        </div>
      )}

      {/* Revert Confirmation Modal */}
      {showConfirmRevert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className={TYPOGRAPHY.BODY_LG + " font-semibold text-gray-900 dark:text-white mb-4"}>
              Confirm Revert
            </h3>
            <p className={TYPOGRAPHY.BODY_SM + " text-gray-600 dark:text-gray-400 mb-6"}>
              Are you sure you want to revert this transfer? This action will reverse the transfer by moving the funds back to the original accounts and cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelRevert}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRevert}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 rounded-lg transition-colors"
              >
                Revert Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferHistory; 
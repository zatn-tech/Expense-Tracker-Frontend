import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useMobile } from '../hooks/useMobile';
import { useParams } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import AccountSelector from './AccountSelector';

const EmailConnectionManager = () => {
  const { user, token } = useAuth();
  const { theme } = useTheme();
  const isMobile = useMobile();
  const { userId } = useParams();
  
  const [connections, setConnections] = useState([]);
  const [emailTransactions, setEmailTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('custom'); // Only Custom IMAP option available

  const [editingConnection, setEditingConnection] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  
  // New states for transaction management
  const [rejectingTransaction, setRejectingTransaction] = useState(null);
  const [scanningEmails, setScanningEmails] = useState(false);
  const [modifyingTransaction, setModifyingTransaction] = useState(null);
  const [showModifyForm, setShowModifyForm] = useState(false);
  const [modifyFormData, setModifyFormData] = useState({});
  const [showInstructions, setShowInstructions] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    oauth2: {},
    imap: {},
    syncSettings: {
      enabled: true,
      frequency: 'daily',
      scanDays: 7,
      autoCreateTransactions: false,
      categories: [],
      minAmount: 0,
      maxAmount: 1000000
    }
  });

  // Security check: Ensure user can only access their own data
  useEffect(() => {
    if (user && userId !== user._id) {
      window.location.href = `/user/${user._id}/email-detection`;
      return;
    }
  }, [userId, user]);

  useEffect(() => {
    if (userId && token && user && userId === user._id) {
      fetchConnections();
      fetchEmailTransactions();
    }
  }, [userId, token, user]);

  const fetchConnections = async () => {
    if (!token || !userId || !user || userId !== user._id) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.USER_EMAIL_CONNECTIONS(userId), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setConnections(data.data);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const fetchEmailTransactions = async () => {
    if (!token || !userId || !user || userId !== user._id) return;
    
    try {
      const response = await fetch(`${API_ENDPOINTS.USER_EMAIL_TRANSACTIONS(userId)}?status=pending&limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setEmailTransactions(data.data.transactions);
      }
    } catch (error) {
      console.error('Error fetching email transactions:', error);
    }
  };

  const handleAddConnection = async (e) => {
    e.preventDefault();
    if (!token || !userId || !user || userId !== user._id) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(API_ENDPOINTS.USER_EMAIL_CONNECTIONS(userId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          provider: selectedProvider
        })
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setShowAddForm(false);
        setFormData({
          email: '',
          oauth2: {},
          imap: {},
          syncSettings: {
            enabled: true,
            frequency: 'daily',
            scanDays: 7,
            autoCreateTransactions: false,
            categories: [],
            minAmount: 0,
            maxAmount: 1000000
          }
        });

        setSelectedProvider('custom'); // Reset to custom provider
        fetchConnections();
        alert('Email connection added successfully!');
      } else {
        // Show error message to user
        alert(`Error: ${data.message || 'Failed to add connection'}`);
      }
    } catch (error) {
      console.error('Error adding connection:', error);
      alert('Error adding connection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleScanEmails = async () => {
    if (!token || !userId || !user || userId !== user._id) return;
    
    setScanningEmails(true);
    
    try {
      const response = await fetch(API_ENDPOINTS.USER_EMAIL_SCAN(userId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        fetchEmailTransactions();
        alert(`Scan completed! Found ${data.data.transactionsDetected} transactions.`);
      } else {
        alert(`Scan failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error scanning emails:', error);
      alert('Error scanning emails. Please try again.');
    } finally {
      setScanningEmails(false);
    }
  };

  const handleApproveTransaction = async (transactionId) => {
    if (!token || !userId || !user || userId !== user._id) return;
    
    // Show account selection modal for this transaction
    setModifyingTransaction({ _id: transactionId, action: 'approve' });
    setModifyFormData({
      accountId: ''
    });
    setShowModifyForm(true);
  };

  const handleRejectTransaction = async (transactionId) => {
    if (!token || !userId || !user || userId !== user._id) return;
    
    setRejectingTransaction(transactionId);
    
    try {
      const response = await fetch(API_ENDPOINTS.USER_EMAIL_TRANSACTION_REJECT(userId, transactionId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        fetchEmailTransactions();
        alert('Transaction rejected!');
      } else {
        alert(`Rejection failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      alert('Error rejecting transaction. Please try again.');
    } finally {
      setRejectingTransaction(null);
    }
  };

  const handleModifyTransaction = (transaction) => {
    setModifyingTransaction(transaction);
    setModifyFormData({
      amount: transaction.detectedAmount,
      type: transaction.detectedType,
      category: transaction.detectedCategory,
      description: transaction.detectedDescription,
      date: new Date(transaction.detectedDate).toISOString().split('T')[0],
      accountId: '' // This will be set by the AccountSelector in the modal
    });
    setShowModifyForm(true);
  };

  const handleSaveModification = async () => {
    if (!token || !userId || !user || userId !== user._id || !modifyingTransaction) return;
    
    if (!modifyFormData.accountId) {
      alert('Please select an account');
      return;
    }
    
    setLoading(true);
    
    try {
      if (modifyingTransaction.action === 'approve') {
        // Handle approval
        const response = await fetch(API_ENDPOINTS.USER_EMAIL_TRANSACTION_APPROVE(userId, modifyingTransaction._id), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ accountId: modifyFormData.accountId })
        });
        
        const data = await response.json();
        if (data.status === 'success') {
          setShowModifyForm(false);
          setModifyingTransaction(null);
          fetchEmailTransactions();
          alert('Transaction approved and created!');
        } else {
          alert(`Approval failed: ${data.message || 'Unknown error'}`);
        }
      } else {
        // Handle modification
        const response = await fetch(API_ENDPOINTS.USER_EMAIL_TRANSACTION_MODIFY(userId, modifyingTransaction._id), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(modifyFormData)
        });
        
        const data = await response.json();
        if (data.status === 'success') {
          setShowModifyForm(false);
          setModifyingTransaction(null);
          fetchEmailTransactions();
          alert('Transaction modified successfully!');
        } else {
          alert(`Modification failed: ${data.message || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Error processing transaction:', error);
      alert('Error processing transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditConnection = (connection) => {
    setEditingConnection(connection);
    setFormData({
      email: connection.email,
      oauth2: connection.oauth2 || {},
      imap: connection.imap || {},
      syncSettings: {
        enabled: connection.syncSettings?.enabled ?? true,
        frequency: connection.syncSettings?.frequency ?? 'daily',
        scanDays: connection.syncSettings?.scanDays ?? 7,
        autoCreateTransactions: connection.syncSettings?.autoCreateTransactions ?? false,
        categories: connection.syncSettings?.categories ?? [],
        minAmount: connection.syncSettings?.minAmount ?? 0,
        maxAmount: connection.syncSettings?.maxAmount ?? 1000000
      }
    });
    setSelectedProvider(connection.provider);
    
    setShowEditForm(true);
  };

  const handleUpdateConnection = async (e) => {
    e.preventDefault();
    if (!token || !userId || !user || userId !== user._id || !editingConnection) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(API_ENDPOINTS.USER_EMAIL_CONNECTION(userId, editingConnection._id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          provider: selectedProvider
        })
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setShowEditForm(false);
        setEditingConnection(null);
        setFormData({
          email: '',
          oauth2: {},
          imap: {},
          syncSettings: {
            enabled: true,
            frequency: 'daily',
            scanDays: 7,
            autoCreateTransactions: false,
            categories: [],
            minAmount: 0,
            maxAmount: 1000000
          }
        });
        setSelectedProvider('custom');
        fetchConnections();
        alert('Email connection updated successfully!');
      } else {
        alert(`Error: ${data.message || 'Failed to update connection'}`);
      }
    } catch (error) {
      console.error('Error updating connection:', error);
      alert('Error updating connection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConnection = async (connectionId) => {
    if (!token || !userId || !user || userId !== user._id) return;
    
    if (!window.confirm('Are you sure you want to delete this email connection? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(API_ENDPOINTS.USER_EMAIL_CONNECTION(userId, connectionId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        fetchConnections();
        alert('Email connection deleted successfully!');
      } else {
        alert(`Error: ${data.message || 'Failed to delete connection'}`);
      }
    } catch (error) {
      console.error('Error deleting connection:', error);
      alert('Error deleting connection. Please try again.');
    }
  };

  const renderProviderForm = () => {
    switch (selectedProvider) {
      case 'custom':
        return (
          <div className="space-y-6">
            {/* Email Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  theme === 'dark' 
                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="your.email@example.com"
                required
              />
            </div>
            
            {/* IMAP Settings Reference */}
            <div className={`p-6 rounded-xl border ${
              theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Common IMAP Settings</h4>
              <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700 dark:text-gray-300">
                <div className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-600' : 'bg-white'
                }`}>
                  <p className="font-medium text-gray-900 dark:text-white mb-2">Gmail</p>
                  <p className="font-mono text-sm">Host: imap.gmail.com</p>
                  <p className="font-mono text-sm">Port: 993, SSL: Enabled</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Use App Password if 2FA enabled</p>
                </div>
                <div className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-600' : 'bg-white'
                }`}>
                  <p className="font-medium text-gray-900 dark:text-white mb-2">Yahoo</p>
                  <p className="font-mono text-sm">Host: imap.mail.yahoo.com</p>
                  <p className="font-mono text-sm">Port: 993, SSL: Enabled</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Use App Password if 2FA enabled</p>
                </div>
                <div className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-600' : 'bg-white'
                }`}>
                  <p className="font-medium text-gray-900 dark:text-white mb-2">Outlook</p>
                  <p className="font-mono text-sm">Host: outlook.office365.com</p>
                  <p className="font-mono text-sm">Port: 993, SSL: Enabled</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Use App Password if 2FA enabled</p>
                </div>
                <div className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-600' : 'bg-white'
                }`}>
                  <p className="font-medium text-gray-900 dark:text-white mb-2">Other Providers</p>
                  <p className="text-sm">Check your email provider's IMAP settings</p>
                  <p className="text-sm">Usually Port 993 (SSL) or 143 (non-SSL)</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  💡 <strong>Need help?</strong> Click the "Setup Instructions" button above for complete step-by-step guidance!
                </p>
              </div>
            </div>
            
            {/* IMAP Host */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">IMAP Host</label>
              <input
                type="text"
                value={formData.imap.host || ''}
                onChange={(e) => setFormData({...formData, imap: {...formData.imap, host: e.target.value}})}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  theme === 'dark' 
                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="imap.gmail.com"
                required
              />
            </div>
            
            {/* Port and Security */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Port</label>
                <input
                  type="number"
                  value={formData.imap.port || ''}
                  onChange={(e) => setFormData({...formData, imap: {...formData.imap, port: parseInt(e.target.value)}})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    theme === 'dark' 
                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="993"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Security</label>
                <select
                  value={formData.imap.secure || 'true'}
                  onChange={(e) => setFormData({...formData, imap: {...formData.imap, secure: e.target.value === 'true'}})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    theme === 'dark' 
                      ? 'bg-gray-600 border-gray-500 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  required
                >
                  <option value="true">SSL/TLS (Recommended)</option>
                  <option value="false">None</option>
                </select>
              </div>
            </div>
            
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username</label>
              <input
                type="text"
                value={formData.imap.user || ''}
                onChange={(e) => setFormData({...formData, imap: {...formData.imap, user: e.target.value}})}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  theme === 'dark' 
                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="your.email@example.com"
                required
              />
            </div>
            
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={formData.imap.pass || ''}
                onChange={(e) => setFormData({...formData, imap: {...formData.imap, pass: e.target.value}})}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  theme === 'dark' 
                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Your email password or app password"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                💡 <strong>Tip:</strong> If you have 2FA enabled, use an App Password instead of your regular password
              </p>
            </div>
          </div>
        );
      
      default:
        return (
          <div className={`p-4 rounded-lg border ${
            theme === 'dark' ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              <strong>Provider Setup:</strong> Please select an email provider above to see setup instructions.
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-2">
              <strong>Recommendation:</strong> For testing, use the "Custom" provider with your email credentials.
            </p>
          </div>
        );
    }
  };

  const renderSyncSettings = () => (
    <div className="space-y-4">
      <div className="flex items-center">
        <input
          type="checkbox"
          id="enabled"
          checked={formData.syncSettings.enabled}
          onChange={(e) => setFormData({
            ...formData,
            syncSettings: {...formData.syncSettings, enabled: e.target.checked}
          })}
          className="mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <label htmlFor="enabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Enable automatic email scanning
        </label>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Scan Frequency</label>
        <select
          value={formData.syncSettings.frequency}
          onChange={(e) => setFormData({
            ...formData,
            syncSettings: {...formData.syncSettings, frequency: e.target.value}
          })}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            theme === 'dark' 
              ? 'bg-gray-600 border-gray-500 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Scan Days Back</label>
        <input
          type="number"
          min="1"
          max="30"
          value={formData.syncSettings.scanDays}
          onChange={(e) => setFormData({
            ...formData,
            syncSettings: {...formData.syncSettings, scanDays: parseInt(e.target.value)}
          })}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            theme === 'dark' 
              ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
          placeholder="7"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          How many days back to scan for emails (1-30 days)
        </p>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="autoCreate"
          checked={formData.syncSettings.autoCreateTransactions}
          onChange={(e) => setFormData({
            ...formData,
            syncSettings: {...formData.syncSettings, autoCreateTransactions: e.target.checked}
          })}
          className="mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <label htmlFor="autoCreate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Automatically create transactions (high confidence only)
        </label>
      </div>
    </div>
  );

  return (
    <div className={`p-4 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-6xl mx-auto">
        {/* Email Transaction Detection Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Email Transaction Detection
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Automatically detect and import transactions from your emails
              </p>
            </div>
            <button
              onClick={() => setShowInstructions(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Setup Instructions
            </button>
          </div>
        </div>

        {/* Email Connections */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Email Connections</h3>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Connection
            </button>
          </div>
          {connections.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No email connections yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Get started by adding your first email connection to detect transactions automatically.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Your First Connection
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {connections.map((connection) => (
                <div
                  key={connection._id}
                  className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-lg ${
                    theme === 'dark' 
                      ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        connection.isActive ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                      <span className={`text-sm font-medium ${
                        connection.isActive 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {connection.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleScanEmails(connection._id)}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                        title="Scan emails for this connection"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEditConnection(connection)}
                        className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                        title="Edit connection"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteConnection(connection._id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                        title="Delete connection"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{connection.email}</h4>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center justify-between">
                        <span>Last sync:</span>
                        <span className="font-medium">
                          {connection.lastSync ? new Date(connection.lastSync).toLocaleDateString() : 'Never'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Status:</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          connection.lastSyncStatus === 'success' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : connection.lastSyncStatus === 'error'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {connection.lastSyncStatus || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Email Transactions */}
        <div className="mt-12">
          <div className="mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Detected Transactions</h3>
              <p className="text-gray-600 dark:text-gray-400">Review and process transactions found in your emails</p>
            </div>
          </div>
          
          {emailTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No transactions detected yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Scan your email connections to find and process transaction receipts and statements.</p>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>💡 <strong>Tip:</strong> Use the scan button on your email connections above to detect transactions.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {emailTransactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-lg ${
                    theme === 'dark' 
                      ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        transaction.detectedType === 'expense' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : transaction.detectedType === 'income'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {transaction.detectedType}
                      </span>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        transaction.confidence.overall >= 80 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : transaction.confidence.overall >= 60 
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {transaction.confidence.overall}% confidence
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Amount</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{transaction.detectedAmount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Category</p>
                        <p className="font-medium text-gray-900 dark:text-white">{transaction.detectedCategory}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</p>
                        <p className="font-medium text-gray-900 dark:text-white">{transaction.detectedDescription}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Date</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(transaction.detectedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p><span className="font-medium">From:</span> {transaction.emailFrom}</p>
                      <p><span className="font-medium">Subject:</span> {transaction.emailSubject}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleApproveTransaction(transaction._id)}
                      className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approve
                    </button>
                    <button
                      onClick={() => handleModifyTransaction(transaction)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Modify
                    </button>
                    <button
                      onClick={() => handleRejectTransaction(transaction._id)}
                      className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Connection Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`w-full max-w-2xl ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto`}>
              <div className="sticky top-0 p-6 border-b border-gray-200 dark:border-gray-700 bg-inherit">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Add Email Connection</h3>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      // Reset form data
                      setFormData({
                        email: '',
                        oauth2: {},
                        imap: {},
                        syncSettings: {
                          enabled: true,
                          frequency: 'daily',
                          scanDays: 7,
                          autoCreateTransactions: false,
                          categories: [],
                          minAmount: 0,
                          maxAmount: 1000000
                        }
                      });
                      setSelectedProvider('custom');
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleAddConnection} className="space-y-6">
                  {/* Email Provider Selection */}
                  <div className={`p-4 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Provider</label>
                    <select
                      value={selectedProvider}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        theme === 'dark' 
                          ? 'bg-gray-600 border-gray-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      disabled
                    >
                      <option value="custom">Custom IMAP</option>
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      💡 All email providers (Gmail, Yahoo, Outlook, etc.) can be configured using IMAP settings
                    </p>
                  </div>
                  
                  {/* Provider Form */}
                  <div className="space-y-6">
                    {renderProviderForm()}
                  </div>
                  
                  {/* Sync Settings */}
                  <div className="space-y-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">Sync Settings</h4>
                    {renderSyncSettings()}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        // Reset form data
                        setFormData({
                          email: '',
                          oauth2: {},
                          imap: {},
                          syncSettings: {
                            enabled: true,
                            frequency: 'daily',
                            scanDays: 7,
                            autoCreateTransactions: false,
                            categories: [],
                            minAmount: 0,
                            maxAmount: 1000000
                          }
                        });
                        setSelectedProvider('custom');
                      }}
                      className={`flex-1 px-4 py-2 border rounded-lg transition-colors duration-200 ${
                        theme === 'dark'
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Adding...
                        </div>
                      ) : (
                        'Add Connection'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Connection Modal */}
        {showEditForm && editingConnection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`w-full max-w-2xl ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto`}>
              <div className="sticky top-0 p-6 border-b border-gray-200 dark:border-gray-700 bg-inherit">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Email Connection</h3>
                  <button
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingConnection(null);
                      // Reset form data
                      setFormData({
                        email: '',
                        oauth2: {},
                        imap: {},
                        syncSettings: {
                          enabled: true,
                          frequency: 'daily',
                          scanDays: 7,
                          autoCreateTransactions: false,
                          categories: [],
                          minAmount: 0,
                          maxAmount: 1000000
                        }
                      });
                      setSelectedProvider('custom');
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleUpdateConnection} className="space-y-6">
                  {/* Email Provider Selection */}
                  <div className={`p-4 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Provider</label>
                    <select
                      value={selectedProvider}
                      onChange={(e) => setSelectedProvider(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        theme === 'dark' 
                          ? 'bg-gray-600 border-gray-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="custom">Custom IMAP</option>
                    </select>
                  </div>
                  
                  {/* Provider Form */}
                  <div className="space-y-6">
                    {renderProviderForm()}
                  </div>
                  
                  {/* Sync Settings */}
                  <div className="space-y-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">Sync Settings</h4>
                    {renderSyncSettings()}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditForm(false);
                        setEditingConnection(null);
                        // Reset form data
                        setFormData({
                          email: '',
                          oauth2: {},
                          imap: {},
                          syncSettings: {
                            enabled: true,
                            frequency: 'daily',
                            scanDays: 7,
                            autoCreateTransactions: false,
                            categories: [],
                            minAmount: 0,
                            maxAmount: 1000000
                          }
                        });
                        setSelectedProvider('custom');
                      }}
                      className={`flex-1 px-4 py-2 border rounded-lg transition-colors duration-200 ${
                        theme === 'dark'
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Updating...
                        </div>
                      ) : (
                        'Update Connection'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modify/Approve Transaction Modal */}
        {showModifyForm && modifyingTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`w-full max-w-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-h-[90vh] overflow-y-auto`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {modifyingTransaction.action === 'approve' ? 'Approve Transaction' : 'Modify Transaction'}
                </h3>
                <button
                  onClick={() => {
                    setShowModifyForm(false);
                    setModifyingTransaction(null);
                    // Reset form data
                    setModifyFormData({});
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSaveModification} className="space-y-4">
                {modifyingTransaction.action === 'approve' ? (
                  // Approval form - only account selection
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Account</label>
                    <AccountSelector
                      selectedAccountId={modifyFormData.accountId}
                      onAccountChange={(accountId) => setModifyFormData({...modifyFormData, accountId: accountId})}
                      required={true}
                    />
                  </div>
                ) : (
                  // Modification form - all fields
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Amount</label>
                      <input
                        type="number"
                        value={modifyFormData.amount}
                        onChange={(e) => setModifyFormData({...modifyFormData, amount: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Type</label>
                      <select
                        value={modifyFormData.type}
                        onChange={(e) => setModifyFormData({...modifyFormData, type: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <input
                        type="text"
                        value={modifyFormData.category}
                        onChange={(e) => setModifyFormData({...modifyFormData, category: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <input
                        type="text"
                        value={modifyFormData.description}
                        onChange={(e) => setModifyFormData({...modifyFormData, description: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Date</label>
                      <input
                        type="date"
                        value={modifyFormData.date}
                        onChange={(e) => setModifyFormData({...modifyFormData, date: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Account</label>
                      <AccountSelector
                        selectedAccountId={modifyFormData.accountId}
                        onAccountChange={(accountId) => setModifyFormData({...modifyFormData, accountId: accountId})}
                        required={true}
                      />
                    </div>
                  </>
                )}
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModifyForm(false);
                      setModifyingTransaction(null);
                      // Reset form data
                      setModifyFormData({});
                    }}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : (modifyingTransaction.action === 'approve' ? 'Approve Transaction' : 'Save Modification')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${
            theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
          }`}>
            <div className="sticky top-0 p-6 border-b border-gray-200 dark:border-gray-700 bg-inherit">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  📧 Complete Email Transaction Detection Setup Guide
                </h2>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Step-by-Step Instructions */}
              <div className="space-y-6">
                {/* Step 1: Email Provider Setup */}
                <div className={`p-6 rounded-xl border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full mr-3 text-lg font-bold">1</span>
                    Prepare Your Email Account
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Gmail Setup */}
                    <div className={`border-l-4 border-red-400 pl-4 py-2 ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                    }`}>
                      <p className="font-semibold text-red-700 dark:text-red-400 mb-2">Gmail Setup:</p>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300 ml-2">
                        <li>Go to <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300">Google Account Security</a></li>
                        <li>Enable "2-Step Verification" if not already enabled</li>
                        <li>Go to "App passwords" (under 2-Step Verification)</li>
                        <li>Select "Mail" and "Other (Custom name)"</li>
                        <li>Enter "ExpenseTracker" as the name</li>
                        <li>Click "Generate" and copy the 16-character password</li>
                        <li><strong>Save this password</strong> - you'll need it for the connection</li>
                      </ol>
                    </div>
                    
                    {/* Yahoo Setup */}
                    <div className={`border-l-4 border-purple-400 pl-4 py-2 ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                    }`}>
                      <p className="font-semibold text-purple-700 dark:text-purple-400 mb-2">Yahoo Setup:</p>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300 ml-2">
                        <li>Go to <a href="https://login.yahoo.com/account/security" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300">Yahoo Account Security</a></li>
                        <li>Enable "2-step verification" if not already enabled</li>
                        <li>Go to "App passwords" (under 2-step verification)</li>
                        <li>Click "Generate app password"</li>
                        <li>Select "Mail" and enter "ExpenseTracker"</li>
                        <li>Click "Generate" and copy the password</li>
                        <li><strong>Save this password</strong> - you'll need it for the connection</li>
                      </ol>
                    </div>
                    
                    {/* Outlook Setup */}
                    <div className={`border-l-4 border-blue-400 pl-4 py-2 ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                    }`}>
                      <p className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Outlook/Hotmail Setup:</p>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300 ml-2">
                        <li>Go to <a href="https://account.microsoft.com/security" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300">Microsoft Account Security</a></li>
                        <li>Enable "Two-step verification" if not already enabled</li>
                        <li>Go to "Advanced security options"</li>
                        <li>Click "Create a new app password"</li>
                        <li>Enter "ExpenseTracker" as the name</li>
                        <li>Click "Next" and copy the generated password</li>
                        <li><strong>Save this password</strong> - you'll need it for the connection</li>
                      </ol>
                    </div>
                    
                    {/* Other Providers */}
                    <div className={`border-l-4 border-gray-400 pl-4 py-2 ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                    }`}>
                      <p className="font-semibold text-gray-700 dark:text-gray-400 mb-2">Other Email Providers:</p>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300 ml-2">
                        <li>Check your provider's security settings</li>
                        <li>Look for "App passwords" or "Application-specific passwords"</li>
                        <li>Generate a password for "ExpenseTracker" or "Mail"</li>
                        <li>If no app passwords available, use your regular password</li>
                        <li><strong>Note:</strong> Some providers may require enabling "Less secure app access"</li>
                      </ol>
                    </div>
                  </div>
                </div>
                
                {/* Step 2: Connection Setup */}
                <div className={`p-6 rounded-xl border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full mr-3 text-lg font-bold">2</span>
                    Add Email Connection
                  </h3>
                  <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                    <ol className="list-decimal list-inside space-y-2 ml-2">
                      <li>Click "Add Connection" button above</li>
                      <li>Enter your email address</li>
                      <li>Use the IMAP settings from the table below</li>
                      <li>Enter your username (usually your email address)</li>
                      <li>Enter the app password you generated in Step 1</li>
                      <li>Click "Add Connection" to test the connection</li>
                    </ol>
                  </div>
                </div>
                
                {/* Step 3: IMAP Settings Reference */}
                <div className={`p-6 rounded-xl border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full mr-3 text-lg font-bold">3</span>
                    IMAP Settings Reference
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse border border-gray-300 dark:border-gray-600">
                      <thead>
                        <tr className={`${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-medium">Provider</th>
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-medium">Host</th>
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-medium">Port</th>
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-medium">Security</th>
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-medium">Username</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-medium">Gmail</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono">imap.gmail.com</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">993</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">SSL/TLS</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">your.email@gmail.com</td>
                        </tr>
                        <tr className={theme === 'dark' ? 'bg-gray-800' : 'bg-white'}>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-medium">Yahoo</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono">imap.mail.yahoo.com</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">993</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">SSL/TLS</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">your.email@yahoo.com</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-medium">Outlook</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono">outlook.office365.com</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">993</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">SSL/TLS</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">your.email@outlook.com</td>
                        </tr>
                        <tr className={theme === 'dark' ? 'bg-gray-800' : 'bg-white'}>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-medium">ProtonMail</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono">127.0.0.1</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">1026</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">None</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">your.email@protonmail.com</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Step 4: Scan and Process */}
                <div className={`p-6 rounded-xl border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full mr-3 text-lg font-bold">4</span>
                    Scan and Process Transactions
                  </h3>
                  <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                    <ol className="list-decimal list-inside space-y-2 ml-2">
                      <li>After successful connection, click "Scan Emails"</li>
                      <li>Wait for the scan to complete (this may take a few minutes)</li>
                      <li>Review detected transactions with confidence scores</li>
                      <li>For each transaction, click "Approve" or "Modify"</li>
                      <li>Select the appropriate account for each transaction</li>
                      <li>Transactions will be created in your expense tracker</li>
                    </ol>
                  </div>
                </div>
                
                {/* Troubleshooting */}
                <div className={`p-6 rounded-xl border ${
                  theme === 'dark' ? 'bg-orange-900/20 border-orange-700' : 'bg-orange-50 border-orange-200'
                }`}>
                  <h3 className="text-xl font-semibold text-orange-800 dark:text-orange-400 mb-4 flex items-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full mr-3">🔧</span>
                    Troubleshooting Common Issues
                  </h3>
                  <div className="space-y-4 text-sm text-orange-700 dark:text-orange-300">
                    <div className="border-l-4 border-orange-400 pl-4 py-2">
                      <p className="font-medium mb-2">Connection Failed:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Verify your email and password are correct</li>
                        <li>Ensure you're using an app password (not regular password)</li>
                        <li>Check if your provider requires enabling "Less secure app access"</li>
                        <li>Verify IMAP is enabled in your email settings</li>
                      </ul>
                    </div>
                    <div className="border-l-4 border-orange-400 pl-4 py-2">
                      <p className="font-medium mb-2">No Transactions Detected:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Check if you have recent financial emails</li>
                        <li>Verify the scan completed successfully</li>
                        <li>Check connection status and last sync time</li>
                        <li>Try scanning again after a few minutes</li>
                      </ul>
                    </div>
                    <div className="border-l-4 border-orange-400 pl-4 py-2">
                      <p className="font-medium mb-2">Security Warnings:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Always use app passwords instead of your main password</li>
                        <li><strong>Enable 2FA</strong> on your email account for extra security</li>
                        <li><strong>Regularly review</strong> your app passwords and revoke unused ones</li>
                        <li><strong>Never share</strong> your app passwords with anyone</li>
                        <li><strong>Use strong passwords</strong> for your main email account</li>
                        <li><strong>Monitor your account</strong> for any suspicious activity</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* Security Tips */}
                <div className={`p-6 rounded-xl border ${
                  theme === 'dark' ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
                }`}>
                  <h3 className="text-xl font-semibold text-green-800 dark:text-green-400 mb-4 flex items-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full mr-3">🛡️</span>
                    Security Best Practices
                  </h3>
                  <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li><strong>Always use app passwords</strong> instead of your main password</li>
                      <li><strong>Enable 2FA</strong> on your email account for extra security</li>
                      <li><strong>Regularly review</strong> your app passwords and revoke unused ones</li>
                      <li><strong>Never share</strong> your app passwords with anyone</li>
                      <li><strong>Use strong passwords</strong> for your main email account</li>
                      <li><strong>Monitor your account</strong> for any suspicious activity</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="sticky bottom-0 p-6 border-t border-gray-200 dark:border-gray-700 bg-inherit">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowInstructions(false)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailConnectionManager; 
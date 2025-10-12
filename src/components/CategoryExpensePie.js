// components/CategoryExpensePie.jsx
import React, { useEffect, useState, useContext } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { AuthContext } from '../context/AuthContext';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function CategoryExpensePie() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});


  useEffect(() => {
    
    if (!user?._id) {
      setLoading(false);
      return;
    }

    const apiUrl = API_ENDPOINTS.USER_TRANSACTIONS_CATEGORY_EXPENSES(user._id);
    
    setLoading(true);
    setError(null);
    setDebugInfo({ apiUrl, userId: user._id });
    
    axios
      .get(apiUrl)
      .then(res => {
          success: res.data.success,
          hasData: !!res.data.data,
          dataType: typeof res.data.data,
          isArray: Array.isArray(res.data.data),
          dataLength: res.data.data?.length
        });
        
        const items = Array.isArray(res.data.data) ? res.data.data : [];
          category: item.category,
          total: item.total,
          type: typeof item.total
        })));
        
        if (items.length === 0) {
          setData({ labels: [], datasets: [] });
          setError('No expense data available');
          setDebugInfo(prev => ({ ...prev, itemsCount: 0, noData: true }));
        } else {
          const chartData = {
            labels: items.map(i => i.category || 'Unknown'),
            datasets: [
              {
                data: items.map(i => Number(i.total) || 0),
                backgroundColor: [
                  '#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF','#FF9F40',
                  '#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7','#DDA0DD'
                ],
                hoverOffset: 10
              }
            ]
          };
          
          
          setData(chartData);
          setError(null);
          setDebugInfo(prev => ({ 
            ...prev, 
            itemsCount: items.length, 
            chartData,
            hasData: true 
          }));
        }
      })
      .catch((err) => {
        setError(`Failed to load chart data: ${err.response?.data?.message || err.message}`);
        setData({ labels: [], datasets: [] });
        setDebugInfo(prev => ({ ...prev, error: err.message, hasError: true }));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      animateRotate: true,
      duration: 1000,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: { 
        position: 'right',
        labels: {
          padding: 20,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: ctx => {
            const val = ctx.parsed || 0;
            const total = data.datasets[0]?.data.reduce((sum, v) => sum + v, 0) || 1;
            const pct = ((val / total) * 100).toFixed(1);
            return `${ctx.label}: ₹${val.toLocaleString()} (${pct}%)`;
          }
        }
      }
    }
  };

  // Debug info display
  const showDebugInfo = process.env.NODE_ENV === 'development';

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading expense chart...</p>
          {showDebugInfo && (
            <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
              <p>Debug: Loading...</p>
              <p>User ID: {user?._id || 'None'}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">📊</div>
          <p className="text-red-600 dark:text-red-400 mb-2">Chart Error</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{error}</p>
          {showDebugInfo && (
            <div className="mt-4 p-2 bg-red-100 dark:bg-red-900/20 rounded text-xs">
              <p>Debug Info:</p>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data.labels || data.labels.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <p className="text-gray-600 dark:text-gray-400 mb-2">No Data Available</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm">Add some transactions to see your expense breakdown</p>
          {showDebugInfo && (
            <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
              <p>Debug Info:</p>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    );
  }


  // Test with hardcoded data if no real data
  const testData = {
    labels: ['Food', 'Transport', 'Entertainment', 'Shopping'],
    datasets: [{
      data: [300, 150, 100, 200],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      hoverOffset: 10
    }]
  };

  const finalData = data.labels.length > 0 ? data : testData;

  return (
    <div className="w-full h-96 relative">
      {showDebugInfo && (
        <div className="absolute top-0 left-0 z-10 p-2 bg-blue-100 dark:bg-blue-900/20 rounded text-xs">
          <p>Debug: Rendering Chart</p>
          <p>Labels: {finalData.labels.length}</p>
          <p>Values: {finalData.datasets[0]?.data?.length || 0}</p>
          <p>Using: {data.labels.length > 0 ? 'Real Data' : 'Test Data'}</p>
        </div>
      )}
      <Pie
        data={finalData}
        options={options}
      />
    </div>
  );
}

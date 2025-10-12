// ExpensePieCarousel.js - Modern redesign
import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { AuthContext } from '../context/AuthContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Ensure Chart.js is properly registered
ChartJS.register(ArcElement, Tooltip, Legend);

const periods = [
  { label: 'This Month', value: 'month', icon: '📅' },
  { label: 'This Year', value: 'year', icon: '🗓️' },
  { label: 'All Time', value: 'all', icon: '🕒' }
];

function PieChartSlide({ userId, period, isActive }) {
  const chartRef = useRef(null);
  const [data, setData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const isMountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!userId || !isActive) return;
    
    setLoading(true);
    try {
      const apiUrl = API_ENDPOINTS.USER_TRANSACTIONS_CATEGORY_EXPENSES(userId, period);
      const res = await axios.get(apiUrl);
      
      const items = Array.isArray(res.data.data) ? res.data.data : [];
      
      if (items.length === 0) {
        setData({ labels: [], datasets: [] });
      } else {
        const total = items.reduce((sum, i) => sum + Number(i.total || 0), 0);
        const chartData = {
          labels: items.map(i => {
            const amount = Number(i.total) || 0;
            const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : '0';
            return `${i.category || 'Unknown'} (${percentage}%)`;
          }),
          datasets: [{
            data: items.map(i => Number(i.total) || 0),
            backgroundColor: [
              '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
              '#10b981', '#3b82f6', '#ef4444', '#8b5cf6'
            ],
            borderColor: 'rgba(255, 255, 255, 0.8)',
            borderWidth: 2,
            hoverOffset: 8
          }]
        };
        
        setData(chartData);
        setHasLoaded(true);
      }
    } catch (error) {
      setData({ labels: [], datasets: [] });
    } finally {
      setLoading(false);
    }
  }, [userId, period]);

  useEffect(() => {
    if (userId && isActive) {
      fetchData();
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [userId, period, isActive]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { 
      padding: window.innerWidth < 768 ? 10 : 15 
    },
    animation: {
      animateRotate: true,
      duration: 1000,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: {
        display: false // We'll create a custom legend below
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.98)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#6366f1',
        borderWidth: 2,
        cornerRadius: 12,
        displayColors: true,
        titleFont: {
          size: window.innerWidth < 768 ? 13 : 15,
          weight: '600'
        },
        bodyFont: {
          size: window.innerWidth < 768 ? 12 : 14
        },
        padding: 16,
        callbacks: {
          title: (items) => {
            return `📊 ${items[0].label}`;
          },
          label: ctx => {
            const val = ctx.parsed || 1;
            const total = data.datasets[0]?.data.reduce((sum, v) => sum + v, 0) || 1;
            const pct = ((val / total) * 100).toFixed(1);
            return [
              `💰 Amount: ₹${val.toLocaleString()}`,
              `📈 Percentage: ${pct}%`,
              `📊 Total: ₹${total.toLocaleString()}`
            ];
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-64 sm:h-72 md:h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-3"></div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (data.labels.length === 0) {
    return (
      <div className="space-y-3">
        <div className="h-64 sm:h-72 md:h-80 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
          <span className="text-4xl mb-2">📊</span>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center px-4">
            No expense data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Compact Chart Container */}
      <div className="h-64 sm:h-72 md:h-80 relative">
        <Pie ref={chartRef} data={data} options={options} />
      </div>
      
      {/* Simple Compact Legend */}
      {data.labels.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {data.labels.map((label, index) => {
            const value = data.datasets[0].data[index];
            const total = data.datasets[0].data.reduce((sum, v) => sum + v, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            const backgroundColor = data.datasets[0].backgroundColor[index];
            
            return (
              <div 
                key={index}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                onClick={() => {
                  if (chartRef.current && chartRef.current.chartInstance) {
                    const chart = chartRef.current.chartInstance;
                    const meta = chart.getDatasetMeta(0);
                    meta.data[index].active = !meta.data[index].active;
                    chart.update();
                  }
                }}
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor }}
                />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {label.replace(/ \(\d+\.?\d*%\)/, '')}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ExpensePieCarousel() {
  const { user } = useContext(AuthContext);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  return (
    <div className="relative">
      {/* Period Indicator */}
      <div className="flex justify-center mb-4">
        <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-1 flex space-x-1">
          {periods.map((period, index) => (
            <button
              key={period.value}
              onClick={() => setCurrentSlide(index)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                index === currentSlide
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600'
              }`}
            >
              <span className="mr-1">{period.icon}</span>
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative px-2 sm:px-8">
        {periods.map((period, index) => {
          const isActive = currentSlide === index;
          
          if (!isActive) return null; // Only render the active slide
        
          return (
            <div key={period.value} className="outline-none">
              <div className="text-center mb-4">
                <h4 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-200">
                  {period.icon} {period.label} Expenses
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Breakdown by category
                </p>
              </div>
              <PieChartSlide 
                userId={user?._id} 
                period={period.value} 
                isActive={isActive}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

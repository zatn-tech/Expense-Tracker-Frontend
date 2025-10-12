import React, { useEffect, useState, useContext } from 'react';
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { AuthContext } from '../context/AuthContext';

ChartJS.register(
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function MonthlyTransactionsChart() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;

    setLoading(true);
    axios
      .get(API_ENDPOINTS.USER_TRANSACTIONS_DAILY(user._id))
      .then((res) => {
        const days = Array.isArray(res.data.data) ? res.data.data : [];
        setData({
          labels: days.map((d) => d.date),
          datasets: [
            {
              label: 'Income',
              data: days.map((d) => d.income),
              borderColor: '#14b8a6',
              backgroundColor: 'rgba(20,184,166,0.1)',
              fill: true,
              tension: window.innerWidth < 768 ? 0.2 : 0.4,
              pointRadius: window.innerWidth < 768 ? 3 : 2,
              pointHoverRadius: window.innerWidth < 768 ? 5 : 4,
              borderWidth: window.innerWidth < 768 ? 2 : 0.5
            },
            {
              label: 'Expense',
              data: days.map((d) => d.expense),
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239,68,68,0.1)',
              fill: true,
              tension: window.innerWidth < 768 ? 0.2 : 0.4,
              pointRadius: window.innerWidth < 768 ? 3 : 2,
              pointHoverRadius: window.innerWidth < 768 ? 5 : 4,
              borderWidth: window.innerWidth < 768 ? 2 : 0.5
            }
          ]
        });

      })
      .catch((err) => {
        setData({ labels: [], datasets: [] });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'dd MMM yyyy',
          displayFormats: { day: window.innerWidth < 768 ? 'dd' : 'dd MMM' }
        },
        ticks: {
          maxTicksLimit: window.innerWidth < 768 ? 5 : 7,
          color: '#6b7280',
          font: { size: window.innerWidth < 768 ? 10 : 11 }
        },
        grid: {
          color: 'rgba(156,163,175,0.1)'
        },
        title: {
          display: true,
          text: 'Date',
          color: '#9ca3af',
          font: { size: window.innerWidth < 768 ? 11 : 13 }
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (val) => `₹${val}`,
          color: '#6b7280',
          font: { size: window.innerWidth < 768 ? 10 : 11 },
          maxTicksLimit: window.innerWidth < 768 ? 4 : 6
        },
        title: {
          display: true,
          text: 'Amount (₹)',
          color: '#9ca3af',
          font: { size: window.innerWidth < 768 ? 11 : 13 }
        },
        grid: {
          color: 'rgba(156,163,175,0.1)'
        }
      }
    },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f9fafb',
        bodyColor: '#d1d5db',
        borderColor: '#4b5563',
        borderWidth: 1,
        titleFont: { 
          size: window.innerWidth < 768 ? 12 : 14, 
          weight: 'bold' 
        },
        bodyFont: { 
          size: window.innerWidth < 768 ? 11 : 13 
        },
        footerFont: { 
          size: window.innerWidth < 768 ? 11 : 13, 
          weight: 'bold' 
        },
        padding: window.innerWidth < 768 ? 8 : 12,
        callbacks: {
          label: (ctx) => {
            const val = ctx.parsed.y || 0;
            return `${ctx.dataset.label}: ₹${val.toLocaleString()}`;
          },
          footer: (items) => {
            const income = items.find(i => i.dataset.label === 'Income')?.parsed.y || 0;
            const expense = items.find(i => i.dataset.label === 'Expense')?.parsed.y || 0;
            const net = income - expense;
            return `Net: ₹${net.toLocaleString()}`;
          }
        }
      },
      legend: {
        position: window.innerWidth < 768 ? 'bottom' : 'top',
        labels: {
          color: '#374151',
          boxWidth: window.innerWidth < 768 ? 12 : 16,
          font: { 
            size: window.innerWidth < 768 ? 11 : 13 
          },
          padding: window.innerWidth < 768 ? 15 : 20
        }
      },
      title: {
        display: false
      }
    }
  };


  if (loading) {
    return (
      <div className="bg-white dark:bg-black rounded-xl shadow-sm dark:shadow-none border dark:border-gray-700 p-3 sm:p-6">
        <h2 className="text-lg sm:text-xl text-center font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4">
          Daily Income vs. Expense
        </h2>
        <div className="flex justify-center items-center h-64 sm:h-80 md:h-96 text-sm text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-2 sm:mb-3"></div>
            <span className="text-xs sm:text-sm">Loading daily transactions...</span>
          </div>
        </div>
      </div>
    );
  }

  if (data.labels.length === 0) {
    return (
      <div className="bg-white dark:bg-black rounded-xl shadow-sm dark:shadow-none border dark:border-gray-700 p-3 sm:p-6">
        <h2 className="text-lg sm:text-xl text-center font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4">
          Daily Income vs. Expense
        </h2>
        <div className="flex justify-center items-center h-64 sm:h-80 md:h-96 text-sm text-gray-400 dark:text-gray-500">
          <div className="text-center">
            <span className="text-3xl sm:text-4xl mb-2">📊</span>
            <p className="text-xs sm:text-sm">No transaction data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black rounded-xl shadow-sm dark:shadow-none border dark:border-gray-700 p-3 sm:p-6">
      <h2 className="text-lg sm:text-xl text-center font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4">
        Daily Income vs. Expense
      </h2>
      <div className="h-64 sm:h-80 md:h-96">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

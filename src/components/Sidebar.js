// components/Sidebar.jsx
import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ProfileMenu from './ProfileMenu';
import NotificationBadge from './NotificationBadge';

export default function Sidebar({ onShowReports, onShowExport }) {
  const { user } = useContext(AuthContext);

  return (
    <aside className="w-20 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col items-center py-6 space-y-6">
      {/* Logo */}
      <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
        <span className="text-white text-xl">💰</span>
      </div>
      {/* Quick Links */}
      <nav className="flex flex-col space-y-4">
        <NavLink
          to={`/user/${user._id}/dashboard`}
          className="p-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-slate-800 text-2xl"
        >
          🏠
        </NavLink>
        <NavLink
          to={`/user/${user._id}/transactions`}
          className="p-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-slate-800 text-2xl"
        >
          📜
        </NavLink>
        <NavLink
          to={`/user/${user._id}/accounts`}
          className="p-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-slate-800 text-2xl"
        >
          🏦
        </NavLink>
        <NavLink
          to={`/user/${user._id}/transfers`}
          className="p-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-slate-800 text-2xl"
        >
          💸
        </NavLink>
        <button
          onClick={onShowReports}
          className="p-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-slate-800 text-2xl"
        >
          📊
        </button>
        <button
          onClick={onShowExport}
          className="p-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-slate-800 text-2xl"
        >
          📤
        </button>
      </nav>
      <div className="mt-auto space-y-4">
        <NotificationBadge />
        <ProfileMenu />
      </div>
    </aside>
  );
}

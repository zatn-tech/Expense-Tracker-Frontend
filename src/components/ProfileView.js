import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ProfilePicture from './ProfilePicture';

// Date utility functions
const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'Not provided';

    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return 'Invalid date';
    }
};

const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;

    try {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    } catch (error) {
        return null;
    }
};

function ProfileView({ onEdit }) {
    const { userId } = useParams();
    const { token } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showExportData, setShowExportData] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get(API_ENDPOINTS.USER_PROFILE(userId), {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(res.data);
        } catch (err) {
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <ProfilePicture
                    currentImage={profile?.profilePicture}
                    onUpdate={(newImage) => setProfile({ ...profile, profilePicture: newImage })}
                />
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white truncate">{profile?.name}</h2>
                    <p className="text-gray-600 dark:text-gray-400 flex items-center mt-1">
                        <span className="mr-2">📧</span>
                        {profile?.email}
                    </p>
                    {profile?.bio && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <p className="text-gray-700 dark:text-gray-300 text-sm italic">"{profile.bio}"</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center mb-4">
                        <span className="text-lg mr-2">👤</span>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Full Name</span>
                            <span className="text-sm text-gray-900 dark:text-white font-medium">{profile?.name || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</span>
                            <span className="text-sm text-gray-900 dark:text-white">{profile?.email}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone</span>
                            <span className="text-sm text-gray-900 dark:text-white">{profile?.phone || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Date of Birth</span>
                            <span className="text-sm text-gray-900 dark:text-white">{formatDateForDisplay(profile?.dateOfBirth)}</span>
                        </div>
                        {profile?.dateOfBirth && (
                            <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Age</span>
                                <span className="text-sm text-gray-900 dark:text-white">
                                    {calculateAge(profile?.dateOfBirth) ? `${calculateAge(profile?.dateOfBirth)} years` : 'Not calculated'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Account Information */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center mb-4">
                        <span className="text-lg mr-2">🏦</span>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account Details</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Member Since</span>
                            <span className="text-sm text-gray-900 dark:text-white">
                                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN') : 'Not available'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Login</span>
                            <span className="text-sm text-gray-900 dark:text-white">
                                {profile?.lastLogin ? new Date(profile.lastLogin).toLocaleDateString('en-IN') : 'Not available'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Account Status</span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
                                Active
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">User ID</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                                {profile?._id?.slice(-8) || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center mb-4">
                        <span className="text-lg mr-2">⚙️</span>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Preferences</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Currency</span>
                            <span className="text-sm text-gray-900 dark:text-white font-medium">
                                {profile?.preferences?.currency || 'INR'}
                                {profile?.preferences?.currency === 'INR' && ' (₹)'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Theme</span>
                            <span className="inline-flex items-center text-sm text-gray-900 dark:text-white">
                                <span className="mr-1">
                                    {profile?.preferences?.theme === 'dark' ? '🌙' : '☀️'}
                                </span>
                                {profile?.preferences?.theme === 'dark' ? 'Dark' : 'Light'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Notifications</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${profile?.preferences?.notifications
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                    : 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300'
                                }`}>
                                {profile?.preferences?.notifications ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Activity Summary */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center mb-4">
                        <span className="text-lg mr-2">📊</span>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activity Summary</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Profile Views</span>
                            <span className="text-sm text-gray-900 dark:text-white font-medium">12 this month</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Settings Changes</span>
                            <span className="text-sm text-gray-900 dark:text-white font-medium">3 this week</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Security Score</span>
                            <div className="flex items-center space-x-2">
                                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                                    <div className="w-12 h-full bg-green-500 rounded-full"></div>
                                </div>
                                <span className="text-sm font-medium text-green-600 dark:text-green-400">Strong</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={onEdit}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 transition-all duration-200"
                >
                    <span className="mr-2">✏️</span>
                    Edit Profile
                </button>
                <button
                    onClick={() => setShowExportData(true)} // You'll need to add this state and import
                    className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 transition-all duration-200"
                >
                    <span className="mr-2">📱</span>
                    Export Data
                </button>
            </div>

        </div>
    );
}

export default ProfileView;

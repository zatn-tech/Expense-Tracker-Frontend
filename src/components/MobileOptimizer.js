import React, { useEffect, useState } from 'react';
import { useMobile } from '../hooks/useMobile';

const MobileOptimizer = ({ children }) => {
  const { isMobile, isPWA, isOnline, vibrate, share } = useMobile();
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Handle online/offline status
    const handleOnline = () => {
      setShowOfflineBanner(false);
      if (isMobile) {
        vibrate([100, 50, 100]); // Success vibration
      }
    };

    const handleOffline = () => {
      setShowOfflineBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for install prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      setShowInstallPrompt(true);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isMobile, vibrate]);

  const handleInstall = async () => {
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      const { outcome } = await window.deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
        window.deferredPrompt = null;
      }
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'ExpenseTracker',
      text: 'Check out this amazing expense tracking app!',
      url: window.location.href
    };

    const success = await share(shareData);
    if (success && isMobile) {
      vibrate(100); // Success vibration
    }
  };

  if (!isMobile) {
    return children;
  }

  return (
    <div className="mobile-optimized">
      {/* Offline Banner */}
      {showOfflineBanner && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 px-4 z-50">
          <div className="flex items-center justify-center space-x-2">
            <span>📡</span>
            <span>You're offline. Some features may not work.</span>
          </div>
        </div>
      )}

      {/* Install Prompt */}
      {showInstallPrompt && !isPWA && (
        <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white text-center py-3 px-4 z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>📱</span>
              <span>Install ExpenseTracker for a better experience</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleInstall}
                className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium"
              >
                Install
              </button>
              <button
                onClick={() => setShowInstallPrompt(false)}
                className="text-white hover:text-blue-200"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - No top padding needed since status bar is removed */}
      <div>
        {children}
      </div>
    </div>
  );
};

export default MobileOptimizer; 
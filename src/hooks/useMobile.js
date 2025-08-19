import { useState, useEffect } from 'react';

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsLandscape(width > height);
    };

    // Initial check
    checkDevice();

    // Add event listeners
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  const isTouchDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  };

  const isPWA = () => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  };

  const isOnline = () => {
    return navigator.onLine;
  };

  const vibrate = (pattern = 100) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const share = async (data) => {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.log('Error sharing:', error);
        return false;
      }
    }
    return false;
  };

  const addToHomeScreen = () => {
    // Add to Home Screen functionality disabled to prevent hot reload issues
    console.log('Add to Home Screen functionality disabled');
  };

  return {
    isMobile,
    isTablet,
    isLandscape,
    screenSize,
    isTouchDevice: isTouchDevice(),
    isPWA: isPWA(),
    isOnline: isOnline(),
    vibrate,
    share,
    addToHomeScreen
  };
}; 
// Mobile Development Configuration
export const MOBILE_CONFIG = {
  // Your computer's IP address for mobile access
  COMPUTER_IP: '192.168.0.105',
  
  // Backend port
  BACKEND_PORT: '2003',
  
  // Frontend port
  FRONTEND_PORT: '3000',
  
  // Safely get the full backend URL for mobile
  getBackendUrl: () => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || !window.location) {
        return 'https://expenseapi.zatn.in';
      }
      
      // FIRST: Check if REACT_APP_API_URL environment variable is set
      if (process.env.REACT_APP_API_URL) {
        console.log('🔗 Using API URL from environment:', process.env.REACT_APP_API_URL);
        return process.env.REACT_APP_API_URL;
      }
      
      const hostname = window.location.hostname;
      
      // Production environment - use live API
      if (process.env.NODE_ENV === 'production' || 
          hostname.includes('netlify.app') || 
          hostname.includes('vercel.app') || 
          hostname.includes('github.io') ||
          (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.includes('192.168'))) {
        return 'https://expenseapi.zatn.in';
      }
      
      // If accessing from mobile (not localhost), use computer's IP
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return `http://${MOBILE_CONFIG.COMPUTER_IP}:${MOBILE_CONFIG.BACKEND_PORT}`;
      }
      
      // If accessing from localhost, use localhost
      return `http://localhost:${MOBILE_CONFIG.BACKEND_PORT}`;
    } catch (error) {
      console.warn('⚠️ Error getting backend URL, using fallback:', error);
      return 'https://expenseapi.zatn.in';
    }
  },
  
  // Safely get the full frontend URL for mobile
  getFrontendUrl: () => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || !window.location) {
        return `http://localhost:${MOBILE_CONFIG.FRONTEND_PORT}`;
      }
      
      const hostname = window.location.hostname;
      
      // If accessing from mobile (not localhost), use computer's IP
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return `http://${MOBILE_CONFIG.COMPUTER_IP}:${MOBILE_CONFIG.FRONTEND_PORT}`;
      }
      
      // If accessing from localhost, use localhost
      return `http://localhost:${MOBILE_CONFIG.FRONTEND_PORT}`;
    } catch (error) {
      console.warn('⚠️ Error getting frontend URL, using fallback:', error);
      return `http://localhost:${MOBILE_CONFIG.FRONTEND_PORT}`;
    }
  },
  
  // Safely check if we're accessing from mobile
  isMobileAccess: () => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || !window.location) {
        return false;
      }
      
      const hostname = window.location.hostname;
      return hostname !== 'localhost' && hostname !== '127.0.0.1';
    } catch (error) {
      console.warn('⚠️ Error checking mobile access, assuming false:', error);
      return false;
    }
  },
  
  // Safe debug information
  debug: () => {
    try {
      if (typeof window !== 'undefined' && window.console) {
        console.log('🔧 Mobile Configuration Debug:');
        console.log('📍 Current Hostname:', window.location?.hostname || 'N/A');
        console.log('📱 Is Mobile Access:', MOBILE_CONFIG.isMobileAccess());
        console.log('🌐 Backend URL:', MOBILE_CONFIG.getBackendUrl());
        console.log('🖥️ Frontend URL:', MOBILE_CONFIG.getFrontendUrl());
        console.log('💻 Computer IP:', MOBILE_CONFIG.COMPUTER_IP);
      }
    } catch (error) {
      console.warn('⚠️ Error in debug function:', error);
    }
  }
};

export default MOBILE_CONFIG; 
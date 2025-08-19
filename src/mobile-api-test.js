// Mobile API Test - Add this to any component to test mobile API calls
import { API_ENDPOINTS } from './config/api';

const MobileApiTest = () => {
  console.log('🔥 COMPREHENSIVE API TEST:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🌐 Current hostname:', window.location.hostname);
  console.log('📍 Full URL:', window.location.href);
  console.log('🔗 API_ENDPOINTS.LOGIN:', API_ENDPOINTS.LOGIN);
  console.log('🔗 API_ENDPOINTS.ME:', API_ENDPOINTS.ME);
  console.log('🔗 API_ENDPOINTS.SOCIAL_AUTH_STATUS:', API_ENDPOINTS.SOCIAL_AUTH_STATUS);
  console.log('📱 User Agent:', navigator.userAgent.substring(0, 100) + '...');
  console.log('📱 Is Mobile:', /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  console.log('📱 Screen Size:', window.innerWidth + 'x' + window.innerHeight);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Test the social auth status API (the one mentioned by user)
  console.log('🧪 Testing Social Auth Status API...');
  fetch(API_ENDPOINTS.SOCIAL_AUTH_STATUS, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('📱 Social Auth API Status:', response.status);
    console.log('📱 Social Auth API URL:', response.url);
    console.log('✅ Social Auth calling:', response.url.includes('expenseapi.zatn.in') ? '🎉 PRODUCTION API' : '❌ LOCAL/OTHER API');
    return response.json();
  })
  .then(data => {
    console.log('📄 Social Auth Response:', data);
  })
  .catch(error => {
    console.log('❌ Social Auth API Error:', error.message);
  });

  // Test the ME endpoint
  console.log('🧪 Testing ME API...');
  fetch(API_ENDPOINTS.ME, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('📱 ME API Status:', response.status);
    console.log('📱 ME API URL:', response.url);
    console.log('✅ ME API calling:', response.url.includes('expenseapi.zatn.in') ? '🎉 PRODUCTION API' : '❌ LOCAL/OTHER API');
  })
  .catch(error => {
    console.log('❌ ME API Error:', error.message);
  });
};

// Auto-run the test
MobileApiTest();

export default MobileApiTest;
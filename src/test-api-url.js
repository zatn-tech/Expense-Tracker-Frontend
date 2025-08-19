// Test file to check what API URL is being used
import { API_ENDPOINTS } from './config/api';

console.log('🔍 API Configuration Test:');
console.log('API_ENDPOINTS.LOGIN:', API_ENDPOINTS.LOGIN);
console.log('API_ENDPOINTS.ME:', API_ENDPOINTS.ME);
console.log('process.env.REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Test a simple API call
fetch(API_ENDPOINTS.ME, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('📡 API Response Status:', response.status);
  console.log('📡 API Response URL:', response.url);
  return response.text();
})
.then(data => {
  console.log('📄 Response Data:', data.substring(0, 200));
})
.catch(error => {
  console.log('❌ API Call Error:', error.message);
}); 
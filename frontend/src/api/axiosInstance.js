import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:4000/api', // base for all API calls
  withCredentials: true, // allows sending cookies (important for JWT)
});

// 🚨 Response Interceptor for handling auth failures
axiosInstance.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      // Unauthorized or token expired — auto logout
      console.warn('Session expired or unauthorized. Logging out...');

      // Optional: clear local storage or context
      localStorage.clear();

      // Optional: redirect to login or homepage
      window.location.href = '/login'; // or your actual login route
    }

    return Promise.reject(error); // still allow error handling
  }
);

export default axiosInstance;

import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // e.g., http://localhost:5000/api
  withCredentials: true, // send cookies (refreshToken + accessToken)
  timeout: 10000,
});

// Optional: intercept request (for debugging)
api.interceptors.request.use(
  (config) => {
    console.log("API Request:", config.method.toUpperCase(), config.url);
    if (config.showErrorToast === false) {
      config._skipErrorToast = true;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Backend error message
    const msg = error.response?.data?.message;
    if (msg) {
      console.error("API Error:", msg);
    }
    if (!error.config?._skipErrorToast) {
      handleToastError(error);
    }
    // You can later add refresh token handling here (important for production)
    // if (error.response?.status === 401) {
    //   // Attempt refresh token here...
    // }

    return Promise.reject(error);
  }
);

export default api;

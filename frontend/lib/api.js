import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    if (config.showErrorToast === false) {
      config._skipErrorToast = true;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const msg = error.response?.data?.message || error.message;
    const config = error.config || {};

    const isAuthProbe = error.response?.status === 401;

    if (msg && !config._skipErrorToast && !isAuthProbe) {
      const { useErrorStore } = await import("@/store/useErrorStore.js");
      useErrorStore.getState().setError(msg);
    }

    return Promise.reject(error);
  }
);

export default api;

import axios from "axios";
import { logoutUser } from "./auth";

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const isProduction = import.meta.env.PROD;

// Razorpay Key automatically switched based on environment (GowMithra style)
export const RAZORPAY_KEY_ID = isProduction
  ? (import.meta.env.VITE_RAZORPAY_KEY_ID_PROD || 'rzp_live_TXuoLRdM8VWBrC')
  : (import.meta.env.VITE_RAZORPAY_KEY_ID_TEST || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TUJt0fwUv206Vf');

const API = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers && token !== 'customer-session' && token !== 'auth-cookie-set') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      error.config &&
      !error.config.url?.includes("/auth/")
    ) {
      logoutUser();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default API;

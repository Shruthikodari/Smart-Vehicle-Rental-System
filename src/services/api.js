import axios from "axios";

const API = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Admin endpoints use the admin session token, everything else uses the customer token
API.interceptors.request.use(
  (config) => {
    const isAdminCall = config.url?.startsWith("/admin");
    const token = localStorage.getItem(isAdminCall ? "adminToken" : "token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Expired or invalid session: send the user back to the right login page
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    if ((status === 401 || status === 403) && url.startsWith("/admin")) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      window.location.href = "/admin-login";
    } else if (status === 401 && !url.startsWith("/auth")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Turns an axios error into a message that can be shown to the user
export const errorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  if (error.response?.data?.message) return error.response.data.message;
  if (!error.response) return "Cannot reach the server. Is the backend running on port 8080?";
  return fallback;
};

export default API;

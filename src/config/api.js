// API Configuration
// Change this to switch between FastAPI and Node.js backends

const API_CONFIG = {
  // Backend selection: 'fastapi', 'nodejs', or 'deployed'
  BACKEND: "nodejs", // Options: "fastapi", "nodejs", "deployed"

  // Backend URLs
  FASTAPI_URL: "http://localhost:8000",
  NODEJS_URL: "http://localhost:5003",
  // Hardcoded deployed backend URL
  DEPLOYED_URL: "https://backend-1-kohl.vercel.app",

  // Get custom VR backend URL from localStorage (for network connections)
  getCustomVRBackendUrl: () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("vr_backend_url");
  },

  // Set custom VR backend URL (for network connections - VR only)
  setCustomVRBackendUrl: (url) => {
    if (typeof window === "undefined") return;
    if (url) {
      localStorage.setItem("vr_backend_url", url);
    } else {
      localStorage.removeItem("vr_backend_url");
    }
  },

  // Get custom backend URL from localStorage (for network connections - DEPRECATED, kept for backwards compatibility)
  getCustomBackendUrl: () => {
    // For VR connections only
    return API_CONFIG.getCustomVRBackendUrl();
  },

  // Set custom backend URL (for network connections - DEPRECATED, kept for backwards compatibility)
  setCustomBackendUrl: (url) => {
    // For VR connections only
    API_CONFIG.setCustomVRBackendUrl(url);
  },

  // Get VR backend URL (for Socket.IO connections only)
  getVRBackendUrl: () => {
    // Check for custom VR backend URL first (for network connections)
    const customUrl = API_CONFIG.getCustomVRBackendUrl();
    if (customUrl) {
      return customUrl;
    }

    // Otherwise use the standard backend URL
    return API_CONFIG.getCurrentBackendUrl();
  },

  // Get current backend URL (for REST API calls)
  getCurrentBackendUrl: () => {
    // Prefer localhost Node backend when frontend is running on localhost
    const isLocal =
      typeof window !== "undefined" &&
      /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);

    if (isLocal) {
      return API_CONFIG.NODEJS_URL;
    }

    switch (API_CONFIG.BACKEND) {
      case "fastapi":
        return API_CONFIG.FASTAPI_URL;
      case "nodejs":
        return API_CONFIG.NODEJS_URL;
      case "deployed":
        return API_CONFIG.DEPLOYED_URL;
      default:
        return API_CONFIG.DEPLOYED_URL;
    }
  },

  // API endpoints
  getApiUrl: (endpoint) => {
    const baseUrl = (API_CONFIG.getCurrentBackendUrl() || "").replace(
      /\/+$/,
      ""
    );

    const path = String(endpoint || "").replace(/^\/+/, "");
    return `${baseUrl}/${path}`;
  },

  // Helper to check if using deployed backend
  isDeployed: () => API_CONFIG.BACKEND === "deployed",
};

export default API_CONFIG;

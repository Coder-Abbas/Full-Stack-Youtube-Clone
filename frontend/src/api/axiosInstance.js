import axios from "axios";

const emitToast = (message) => {
    if (typeof window === "undefined") return;

    window.dispatchEvent(
        new CustomEvent("app-toast", {
            detail: { message },
        })
    );
};

const getBaseURL = () => {
    if (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }
    if (typeof process !== "undefined" && process.env?.VITE_API_BASE_URL) {
        return process.env.VITE_API_BASE_URL;
    }
    // Fall back to the same origin the frontend is served from.
    // In production the Express backend serves both the UI and /api on one domain,
    // and in dev Vite proxies /api to the local backend. So using window.location
    // avoids the hardcoded "http://localhost:8000" that breaks on deployed hosts.
    if (typeof window !== "undefined" && window.location?.origin) {
        return `${window.location.origin}/api/v1`;
    }
    return "http://localhost:8000/api/v1";
};

const axiosInstance = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true,
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message;

        if (status === 401) {
            emitToast("Login required");
        } else if (message) {
            emitToast(message);
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
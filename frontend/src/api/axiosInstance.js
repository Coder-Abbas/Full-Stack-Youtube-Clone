import axios from "axios";

const emitToast = (message) => {
    if (typeof window === "undefined") return;

    window.dispatchEvent(
        new CustomEvent("app-toast", {
            detail: { message },
        })
    );
};


const axiosInstance = axios.create({
    baseURL: "http://localhost:8000/api/v1",
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
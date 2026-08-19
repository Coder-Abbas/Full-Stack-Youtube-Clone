import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";

const useAuthStore = create((set) => ({
    authUser: null,
    isCheckingAuth: true,
    isLoggingIn: false,
    isSigningUp: false,
    error: null,

    clearError: () => set({ error: null }),

    register: async (userData) => {
        set({ isSigningUp: true, error: null });

        try {
            const response = await axiosInstance.post("/users/register", userData, {
                headers: userData instanceof FormData
                    ? { "Content-Type": "multipart/form-data" }
                    : undefined,
            });

            set({ isSigningUp: false, error: null });

            return {
                success: true,
                data: response?.data?.data || response?.data,
            };
        } catch (error) {
            const message = error?.response?.data?.message || "Registration failed";

            set({
                isSigningUp: false,
                error: message,
            });

            return {
                success: false,
                message,
            };
        }
    },

    login: async (credentials) => {
        set({ isLoggingIn: true, error: null });

        try {
            const identifier = credentials?.identifier?.trim();
            const password = credentials?.password;

            if (!identifier || !password) {
                throw new Error("Email/username and password are required");
            }

            const payload = identifier.includes("@")
                ? { email: identifier, password }
                : { username: identifier, password };

            const response = await axiosInstance.post("/users/login", payload);
            const user = response?.data?.data?.user || response?.data?.user || null;

            set({
                authUser: user,
                isLoggingIn: false,
                error: null,
            });

            return {
                success: true,
                data: response?.data?.data || response?.data,
            };
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || "Login failed";

            set({
                authUser: null,
                isLoggingIn: false,
                error: message,
            });

            return {
                success: false,
                message,
            };
        }
    },

    getMe: async () => {
        set({ isCheckingAuth: true, error: null });

        try {
            const response = await axiosInstance.get("/users/current-user");
            const user = response?.data?.data || response?.data?.user || null;

            set({ authUser: user, isCheckingAuth: false, error: null });
            return user;
        } catch (error) {
            set({
                authUser: null,
                isCheckingAuth: false,
                error: null,
            });
            return null;
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/users/logout");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            set({ authUser: null, error: null });
        }
    },
  updateAvatar: async (avatarFile) => {
    try {
        const formData = new FormData();

        formData.append("avatar", avatarFile);

        const response = await axiosInstance.patch(
            "/users/update-avatar",
            formData
        );

        const updatedUser =
            response?.data?.data ||
            response?.data?.user ||
            null;

        if (!updatedUser) {
            throw new Error("Updated user data was not returned");
        }

        set({
            authUser: updatedUser,
            error: null,
        });

        return {
            success: true,
            data: updatedUser,
        };

    } catch (error) {

        const message =
            error?.response?.data?.message ||
            error?.message ||
            "Failed to update avatar";

        console.error("Update avatar error:", error);

        set({
            error: message,
        });

        return {
            success: false,
            message,
        };
    }
},
}));

export default useAuthStore;
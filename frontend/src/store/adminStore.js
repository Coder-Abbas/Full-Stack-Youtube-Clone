import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";

const useAdminStore = create((set) => ({
    // Overview
    overview: null,

    // Users
    users: [],
    selectedUser: null,
    usersMeta: { total: 0, page: 1, limit: 10, totalPages: 0 },

    // Videos
    videos: [],
    selectedVideo: null,
    videosMeta: { total: 0, page: 1, limit: 10, totalPages: 0 },

    // Comments
    comments: [],
    selectedComment: null,
    commentsMeta: { total: 0, page: 1, limit: 10, totalPages: 0 },

    // Loading / Error
    isLoading: false,
    error: null,

    // ==========================================
    // Overview
    // ==========================================

    getOverview: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get("/admin/overview");
            set({ overview: response?.data?.data || null, isLoading: false });
        } catch (error) {
            set({ error: error?.response?.data?.message || "Failed to load overview", isLoading: false });
        }
    },

    // ==========================================
    // Users
    // ==========================================

    getUsers: async ({ query = "", page = 1, limit = 10 } = {}) => {
        set({ isLoading: true, error: null });
        try {
            const params = new URLSearchParams();
            if (query) params.set("query", query);
            params.set("page", String(page));
            params.set("limit", String(limit));

            const response = await axiosInstance.get(`/admin/users?${params.toString()}`);
            const data = response?.data?.data || {};

            set({
                users: data.users || [],
                usersMeta: {
                    total: data.total || 0,
                    page: data.page || page,
                    limit: data.limit || limit,
                    totalPages: data.totalPages || 0,
                },
                isLoading: false,
            });
        } catch (error) {
            set({ error: error?.response?.data?.message || "Failed to load users", isLoading: false });
        }
    },

    getUserById: async (userId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get(`/admin/users/${userId}`);
            set({ selectedUser: response?.data?.data || null, isLoading: false });
        } catch (error) {
            set({ error: error?.response?.data?.message || "Failed to load user", isLoading: false });
        }
    },

    deleteUser: async (userId) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.delete(`/admin/users/${userId}`);
            set((prev) => ({
                users: prev.users.filter((u) => u._id !== userId),
                isLoading: false,
            }));
            return { success: true };
        } catch (error) {
            set({ error: error?.response?.data?.message || "Failed to delete user", isLoading: false });
            return { success: false, message: error?.response?.data?.message };
        }
    },

    resetUserPassword: async (userId, newPassword) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.patch(`/admin/users/${userId}/password`, { newPassword });
            set({ isLoading: false });
            return { success: true };
        } catch (error) {
            set({ error: error?.response?.data?.message || "Failed to reset password", isLoading: false });
            return { success: false, message: error?.response?.data?.message };
        }
    },

    // ==========================================
    // Videos
    // ==========================================

    getVideos: async ({ query = "", page = 1, limit = 10 } = {}) => {
        set({ isLoading: true, error: null });
        try {
            const params = new URLSearchParams();
            if (query) params.set("query", query);
            params.set("page", String(page));
            params.set("limit", String(limit));

            const response = await axiosInstance.get(`/admin/videos?${params.toString()}`);
            const data = response?.data?.data || {};

            set({
                videos: data.videos || [],
                videosMeta: {
                    total: data.total || 0,
                    page: data.page || page,
                    limit: data.limit || limit,
                    totalPages: data.totalPages || 0,
                },
                isLoading: false,
            });
        } catch (error) {
            set({ error: error?.response?.data?.message || "Failed to load videos", isLoading: false });
        }
    },

    getVideoById: async (videoId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get(`/admin/videos/${videoId}`);
            set({ selectedVideo: response?.data?.data || null, isLoading: false });
        } catch (error) {
            set({ error: error?.response?.data?.message || "Failed to load video", isLoading: false });
        }
    },

    updateVideo: async (videoId, updateData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.patch(`/admin/videos/${videoId}`, updateData);
            const updated = response?.data?.data;

            set((prev) => ({
                videos: prev.videos.map((v) => (v._id === updated._id ? updated : v)),
                selectedVideo: prev.selectedVideo?._id === updated._id ? updated : prev.selectedVideo,
                isLoading: false,
            }));

            return { success: true, data: updated };
        } catch (error) {
            set({ error: error?.response?.data?.message || "Failed to update video", isLoading: false });
            return { success: false, message: error?.response?.data?.message };
        }
    },

    deleteVideo: async (videoId) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.delete(`/admin/videos/${videoId}`);
            set((prev) => ({
                videos: prev.videos.filter((v) => v._id !== videoId),
                selectedVideo: prev.selectedVideo?._id === videoId ? null : prev.selectedVideo,
                isLoading: false,
            }));
            return { success: true };
        } catch (error) {
            set({ error: error?.response?.data?.message || "Failed to delete video", isLoading: false });
            return { success: false, message: error?.response?.data?.message };
        }
    },

    // ==========================================
    // Comments
    // ==========================================

    getComments: async ({ query = "", page = 1, limit = 10 } = {}) => {
        set({ isLoading: true, error: null });
        try {
            const params = new URLSearchParams();
            if (query) params.set("query", query);
            params.set("page", String(page));
            params.set("limit", String(limit));

            const response = await axiosInstance.get(`/admin/comments?${params.toString()}`);
            const data = response?.data?.data || {};

            set({
                comments: data.comments || [],
                commentsMeta: {
                    total: data.total || 0,
                    page: data.page || page,
                    limit: data.limit || limit,
                    totalPages: data.totalPages || 0,
                },
                isLoading: false,
            });
        } catch (error) {
            set({ error: error?.response?.data?.message || "Failed to load comments", isLoading: false });
        }
    },

    getCommentById: async (commentId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get(`/admin/comments/${commentId}`);
            set({ selectedComment: response?.data?.data || null, isLoading: false });
        } catch (error) {
            set({ error: error?.response?.data?.message || "Failed to load comment", isLoading: false });
        }
    },

    updateComment: async (commentId, content) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.patch(`/admin/comments/${commentId}`, { content });
            const updated = response?.data?.data;

            set((prev) => ({
                comments: prev.comments.map((c) => (c._id === updated._id ? updated : c)),
                selectedComment: prev.selectedComment?._id === updated._id ? updated : prev.selectedComment,
                isLoading: false,
            }));

            return { success: true, data: updated };
        } catch (error) {
            set({ error: error?.response?.data?.message || "Failed to update comment", isLoading: false });
            return { success: false, message: error?.response?.data?.message };
        }
    },

    deleteComment: async (commentId) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.delete(`/admin/comments/${commentId}`);
            set((prev) => ({
                comments: prev.comments.filter((c) => c._id !== commentId),
                selectedComment: prev.selectedComment?._id === commentId ? null : prev.selectedComment,
                isLoading: false,
            }));
            return { success: true };
        } catch (error) {
            set({ error: error?.response?.data?.message || "Failed to delete comment", isLoading: false });
            return { success: false, message: error?.response?.data?.message };
        }
    },
}));

export default useAdminStore;

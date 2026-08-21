import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";

const usePlaylistStore = create((set) => ({
    userPlaylists: [],
    currentPlaylist: null,
    randomPlaylists: [],
    recommendedPlaylists: [],
    // The playlist currently being watched (drives the watch-page
    // "Up next in playlist" sidebar). Persists across video switches
    // within the same SPA session.
    activePlaylist: null,
    isLoading: false,
    isActionLoading: false,
    error: null,

    setActivePlaylist: (id, name) =>
        set({ activePlaylist: { _id: id, name } }),

    clearActivePlaylist: () => set({ activePlaylist: null }),

    // ==========================================
    // Create
    // ==========================================

    createPlaylist: async ({ name, description, isPublic }) => {
        try {
            set({ isActionLoading: true, error: null });

            const response = await axiosInstance.post("/playlists", {
                name,
                description,
                isPublic,
            });

            const playlist = response.data.data;

            set((state) => ({
                userPlaylists: [playlist, ...state.userPlaylists],
                isActionLoading: false,
            }));

            return { success: true, playlist };
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                "Failed to create playlist";

            set({ isActionLoading: false, error: message });

            return { success: false, message };
        }
    },

    // ==========================================
    // List current user's playlists
    // ==========================================

    fetchUserPlaylists: async () => {
        try {
            set({ isLoading: true, error: null });

            const response = await axiosInstance.get("/playlists");

            set({
                userPlaylists: response.data.data || [],
                isLoading: false,
            });
        } catch (error) {
            set({
                isLoading: false,
                error:
                    error?.response?.data?.message ||
                    "Failed to fetch playlists",
            });
        }
    },

    // ==========================================
    // Single playlist
    // ==========================================

    fetchPlaylist: async (playlistId) => {
        try {
            set({ isLoading: true, error: null });

            const response = await axiosInstance.get(
                `/playlists/${playlistId}`
            );

            set({ currentPlaylist: response.data.data, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error:
                    error?.response?.data?.message ||
                    "Failed to fetch playlist",
            });
        }
    },

    clearCurrentPlaylist: () => set({ currentPlaylist: null }),

    // ==========================================
    // Random playlists (homepage)
    // ==========================================

    fetchRandomPlaylists: async (limit = 10) => {
        try {
            const response = await axiosInstance.get(
                `/playlists/random?limit=${limit}`
            );

            set({ randomPlaylists: response.data.data || [] });
        } catch (error) {
            set({ randomPlaylists: [] });
        }
    },

    // ==========================================
    // Recommended playlists (watch page)
    // ==========================================

    fetchRecommendedPlaylists: async (videoId) => {
        try {
            const response = await axiosInstance.get(
                `/playlists/recommended?videoId=${videoId}`
            );

            set({ recommendedPlaylists: response.data.data || [] });
        } catch (error) {
            set({ recommendedPlaylists: [] });
        }
    },

    // ==========================================
    // Add / remove video
    // ==========================================

    addVideo: async (playlistId, videoId) => {
        try {
            set({ isActionLoading: true });

            const response = await axiosInstance.patch(
                `/playlists/${playlistId}/add/${videoId}`
            );

            const updated = response.data.data;

            set((state) => ({
                isActionLoading: false,
                userPlaylists: state.userPlaylists.map((p) =>
                    p._id === playlistId ? updated : p
                ),
                currentPlaylist:
                    state.currentPlaylist?._id === playlistId
                        ? updated
                        : state.currentPlaylist,
            }));

            return { success: true };
        } catch (error) {
            set({ isActionLoading: false });

            return {
                success: false,
                message:
                    error?.response?.data?.message ||
                    "Failed to add video to playlist",
            };
        }
    },

    removeVideo: async (playlistId, videoId) => {
        try {
            const response = await axiosInstance.patch(
                `/playlists/${playlistId}/remove/${videoId}`
            );

            const updated = response.data.data;

            set((state) => ({
                userPlaylists: state.userPlaylists.map((p) =>
                    p._id === playlistId ? updated : p
                ),
                currentPlaylist:
                    state.currentPlaylist?._id === playlistId
                        ? updated
                        : state.currentPlaylist,
            }));

            return { success: true };
        } catch (error) {
            return { success: false };
        }
    },

    // ==========================================
    // Update + delete
    // ==========================================

    updatePlaylist: async (playlistId, data) => {
        try {
            const response = await axiosInstance.patch(
                `/playlists/${playlistId}`,
                data
            );

            const updated = response.data.data;

            set((state) => ({
                userPlaylists: state.userPlaylists.map((p) =>
                    p._id === playlistId ? updated : p
                ),
                currentPlaylist: updated,
            }));

            return { success: true };
        } catch (error) {
            return { success: false };
        }
    },

    deletePlaylist: async (playlistId) => {
        try {
            await axiosInstance.delete(`/playlists/${playlistId}`);

            set((state) => ({
                userPlaylists: state.userPlaylists.filter(
                    (p) => p._id !== playlistId
                ),
                currentPlaylist:
                    state.currentPlaylist?._id === playlistId
                        ? null
                        : state.currentPlaylist,
            }));

            return { success: true };
        } catch (error) {
            return { success: false };
        }
    },
}));

export default usePlaylistStore;

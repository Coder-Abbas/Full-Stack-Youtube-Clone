import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";

const useSearchStore = create((set) => ({
    searchResults: {
        videos: [],
        channels: [],
    },

    isSearching: false,
    searchError: null,

    search: async (query) => {
        const searchQuery = query.trim();

        if (!searchQuery) {
            set({
                searchResults: {
                    videos: [],
                    channels: [],
                },
                searchError: null,
            });

            return;
        }

        try {
            set({
                isSearching: true,
                searchError: null,
            });

            const response = await axiosInstance.get(
                `/search?q=${encodeURIComponent(searchQuery)}`
            );

            set({
                searchResults: {
                    videos: response.data?.data?.videos || [],
                    channels: response.data?.data?.channels || [],
                },
                isSearching: false,
            });
        } catch (error) {
            

            set({
                isSearching: false,
                searchError:
                    error.response?.data?.message ||
                    "Failed to search",
            });
        }
    },

    clearSearch: () => {
        set({
            searchResults: {
                videos: [],
                channels: [],
            },
            searchError: null,
            isSearching: false,
        });
    },
}));

export default useSearchStore;
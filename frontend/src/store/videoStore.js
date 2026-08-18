import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";

// Helper to convert http:// to https:// for Cloudinary URLs
const toHttps = (url = "") => {
    if (!url) return url;
    return url.startsWith("http://") ? url.replace("http://", "https://") : url;
};

const useVideoStore = create((set) => ({
    // ==========================================
    // Home Page Videos
    // ==========================================

    videos: [],

    isLoading: false,

    error: null,


    // ==========================================
    // Selected Video
    // ==========================================

    selectedVideoId: null,

    selectedVideo: null,

    isSelectedVideoLoading: false,

    selectedVideoError: null,

    isLiked: false,


    // ==========================================
    // Subscription
    // ==========================================

    subscription: {
        isSubscribed: false,
        subscribersCount: 0,
    },


    // ==========================================
    // Comments
    // ==========================================

    comments: [],


    // ==========================================
    // Get All Videos
    // ==========================================

    getVideos: async () => {

        try {

            set({
                isLoading: true,
                error: null,
            });


            const response = await axiosInstance.get(
                "/videos/published"
            );


            // Convert all http:// Cloudinary URLs to https:// for better browser compatibility
            const videos = (response.data.data.videos || []).map((video) => ({
                ...video,
                thumbnail: toHttps(video.thumbnail),
                videoFile: toHttps(video.videoFile),
                owner: {
                    ...video.owner,
                    avatar: toHttps(video.owner?.avatar),
                },
            }));

            set({
                videos,
                isLoading: false,
            });


        } catch (error) {

            console.error(
                "Error fetching videos:",
                error
            );


            set({
                error:
                    error.response?.data?.message ||
                    "Failed to fetch videos",

                isLoading: false,
            });
        }
    },


    // ==========================================
    // Open Selected Video
    // ==========================================

    openSelectedVideo: (videoId) => {
        set({
            selectedVideoId: videoId,
            selectedVideo: null,
            selectedVideoError: null,
        });
    },


    // ==========================================
    // Toggle Subscription
    // ==========================================

    toggleSubscription: async () => {

        try {

            // Get the current selected video's owner ID from the store state
            const state = useVideoStore.getState();
            const ownerId = state.selectedVideo?.owner?._id;

            if (!ownerId) return;

            await axiosInstance.post(
                `/subscription/${ownerId}/subscribed`
            );

            // Toggle subscription state locally
            const current = state.subscription;
            set({
                subscription: {
                    ...current,
                    isSubscribed: !current.isSubscribed,
                    subscribersCount: current.isSubscribed
                        ? Math.max(0, current.subscribersCount - 1)
                        : current.subscribersCount + 1,
                },
            });

        } catch (error) {

            console.error(
                "Error toggling subscription:",
                error
            );
        }
    },


    // ==========================================
    // Get Selected Video
    // ==========================================

    getSelectedVideo: async (videoId) => {

        try {

            set({
                isSelectedVideoLoading: true,
                selectedVideoError: null,
            });


            const response = await axiosInstance.get(
                `/videos/${videoId}`
            );


            const rawVideo = response.data.data.video;
            const rawComments = response.data.data.comments || [];

            // Convert all http:// Cloudinary URLs to https:// for better security/compatibility
            const selectedVideo = rawVideo ? {
                ...rawVideo,
                thumbnail: toHttps(rawVideo.thumbnail),
                videoFile: toHttps(rawVideo.videoFile),
                owner: {
                    ...rawVideo.owner,
                    avatar: toHttps(rawVideo.owner?.avatar),
                },
            } : null;

            // Convert comment owner avatars too
            const comments = rawComments.map((comment) => ({
                ...comment,
                owner: {
                    ...comment.owner,
                    avatar: toHttps(comment.owner?.avatar),
                },
            }));

            set({

                // Video
                selectedVideo,

                // Like
                isLiked: response.data.data.isLiked,

                // Subscription
                subscription: response.data.data.subscription,

                // Comments
                comments,

                // Loading
                isSelectedVideoLoading: false,

            });


        } catch (error) {

            console.error(
                "Error fetching selected video:",
                error
            );


            set({

                selectedVideoError:
                    error.response?.data?.message ||
                    "Failed to fetch video",

                isSelectedVideoLoading: false,

            });
        }
    },


    // ==========================================
    // Clear Selected Video
    // ==========================================

    clearSelectedVideo: () => {

        set({

            selectedVideo: null,

            isLiked: false,

            subscription: {
                isSubscribed: false,
                subscribersCount: 0,
            },

            comments: [],

            selectedVideoError: null,

        });
    },
}));


export default useVideoStore;
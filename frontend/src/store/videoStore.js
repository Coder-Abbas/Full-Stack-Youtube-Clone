import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";
import { joinVideoRoom, leaveVideoRoom, subscribeToChannel, unsubscribeFromChannel } from "../api/socket";

// Helper to convert http:// to https:// for Cloudinary URLs
const toHttps = (url = "") => {
    if (!url) return url;
    return url.startsWith("http://") ? url.replace("http://", "https://") : url;
};

const useVideoStore = create((set, get) => ({

    videos: [],

    isLoading: false,

    isLoadingMore: false,

    error: null,

    currentPage: 1,

    hasNextPage: true,



    // Used to notify other components that a new video was published
    videoPublishedVersion: 0,

    notifyVideoPublished: () => {
        set((state) => ({
            videoPublishedVersion: state.videoPublishedVersion + 1,
        }));
    },

    publishVideo: async (videoId) => {
        try {
            const response = await axiosInstance.patch(
                `/videos/toggle/publish/${videoId}`
            );

            const publishedVideo = response?.data?.data;

            // Notify Home and other pages
            if (publishedVideo?.isPublished) {
                get().notifyVideoPublished();
            }

            return {
                success: true,
                data: publishedVideo,
            };

        } catch (error) {
            console.error("Publish video error:", error);

            return {
                success: false,
                message:
                    error?.response?.data?.message ||
                    "Failed to publish video",
            };
        }
    },

    selectedVideoId: null,

    selectedVideo: null,

    isSelectedVideoLoading: false,

    selectedVideoError: null,

    isLiked: false,

    subscription: {
        isSubscribed: false,
        subscribersCount: 0,
    },

    comments: [],

    // Real-time setters
    setComments: (updater) => {
        if (typeof updater === "function") {
            set((prev) => ({ comments: updater(prev.comments) }));
        } else {
            set({ comments: updater });
        }
    },

    setSelectedVideoData: (video) => {
        set({ selectedVideo: video });
    },

    setSubscription: (subscription) => {
        set({ subscription });
    },

    setIsLiked: (isLiked) => {
        set({ isLiked });
    },


    // page = 1 means "fresh load" (replaces the list, used on mount
    // or when videoPublishedVersion/channelUpdatedVersion change).
    // page > 1 means "load more" (appends, used by infinite scroll).
    getVideos: async (page = 1, limit = 12) => {

        try {

            const state = get();

            // Don't fire a duplicate "load more" while one is in flight,
            // and don't bother once we know there's no next page.
            if (page > 1 && (state.isLoadingMore || !state.hasNextPage)) {
                return;
            }

            set({
                isLoading: page === 1,
                isLoadingMore: page > 1,
                error: null,
            });

            const response = await axiosInstance.get(
                `/videos/published?page=${page}&limit=${limit}`
            );

            const rawVideos = response.data.data.videos || [];
            const pagination = response.data.data.Pagination || {};

            // Convert all http:// Cloudinary URLs to https:// for better browser compatibility
            const videos = rawVideos.map((video) => ({
                ...video,
                thumbnail: toHttps(video.thumbnail),
                videoFile: toHttps(video.videoFile),
                owner: {
                    ...video.owner,
                    avatar: toHttps(video.owner?.avatar),
                },
            }));

            set((prev) => ({
                videos: page === 1
                    ? videos
                    : [...prev.videos, ...videos],
                currentPage: pagination.currentPage || page,
                hasNextPage: pagination.hasNextPage ?? false,
                isLoading: false,
                isLoadingMore: false,
            }));


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
                isLoadingMore: false,
            });
        }
    },

    // Convenience action for the infinite-scroll sentinel to call
    loadMoreVideos: () => {
        const { currentPage, getVideos } = get();
        getVideos(currentPage + 1);
    },

    // ==========================================
    // Liked Videos
    // ==========================================

    likedVideos: [],

    isLikedVideosLoading: false,

    likedVideosError: null,


    // ==========================================
    // Get Liked Videos
    // GET /likes/liked-videos
    // ==========================================

    getLikedVideos: async () => {

        try {

            set({
                isLikedVideosLoading: true,
                likedVideosError: null,
            });

            const response = await axiosInstance.get(
                "/likes/liked-videos"
            );
            // Backend returns array of { video: {...} } objects
            const rawLiked = response.data.data || [];
            // Extract the video from each like object and convert URLs
            const likedVideos = rawLiked.map((item) => {
                const video = item.video || item;
                return {
                    ...video,
                    thumbnail: toHttps(video.thumbnail),
                    videoFile: toHttps(video.videoFile),
                    owner: {
                        ...video.owner,
                        avatar: toHttps(video.owner?.avatar),
                    },
                };
            });

            set({
                likedVideos,
                isLikedVideosLoading: false,
            });

        } catch (error) {



            set({
                likedVideosError:
                    error.response?.data?.message ||
                    "Failed to fetch liked videos",
                isLikedVideosLoading: false,
                likedVideos: [],
            });
        }
    },


    // ==========================================
    // Subscribed Channels + Their Videos
    // GET /videos/subscribed-videos
    //
    // Backend shape:
    // data.videos        -> array of video docs
    // data.subscriptions -> array of subscription docs:
    //   { _id: subscriptionId, subscriber, channel: { _id, username, fullName, avatar }, ... }
    //
    // The channel's own data lives under `.channel`, NOT at the
    // top level of the subscription doc — so we map/flatten it here.
    // ==========================================

    subscribedChannels: [],
    subscriptionVideos: [],

    isSubscriptionDataLoading: false,
    subscriptionDataError: null,

    getSubscriptionData: async () => {
        try {
            set({
                isSubscriptionDataLoading: true,
                subscriptionDataError: null,
            });

            const response = await axiosInstance.get(
                "/videos/subscribed-videos"
            );

            const data = response.data.data;

            const rawSubscriptions = data?.subscriptions || [];
            const rawVideos = data?.videos || [];

            // Flatten each subscription doc down to its channel,
            // carrying the subscription's own _id along in case
            // it's ever needed (e.g. to unsubscribe by subscription id).
            const subscribedChannels = rawSubscriptions
                .filter((sub) => sub?.channel)
                .map((sub) => ({
                    ...sub.channel,
                    avatar: toHttps(sub.channel.avatar),
                    subscriptionId: sub._id,
                }));

            const subscriptionVideos = rawVideos.map((video) => ({
                ...video,
                thumbnail: toHttps(video.thumbnail),
                videoFile: toHttps(video.videoFile),
                owner: {
                    ...video.owner,
                    avatar: toHttps(video.owner?.avatar),
                },
            }));

            set({
                subscribedChannels,
                subscriptionVideos,
                isSubscriptionDataLoading: false,
            });

        } catch (error) {
            console.error(
                "Error fetching subscription data:",
                error
            );

            set({
                subscribedChannels: [],
                subscriptionVideos: [],
                isSubscriptionDataLoading: false,
                subscriptionDataError:
                    error?.response?.data?.message ||
                    "Failed to fetch subscription data",
            });
        }
    },

    // ==========================================
    // Recommended Videos (shown in the Watch page sidebar)
    // Reuses /videos/published since there's no dedicated
    // recommendation endpoint yet — just excludes the video
    // currently being watched.
    // ==========================================

    recommendedVideos: [],
    isRecommendedLoading: false,

    getRecommendedVideos: async (excludeVideoId) => {
        try {
            set({ isRecommendedLoading: true });

            const response = await axiosInstance.get(
                "/videos/published?page=1&limit=15"
            );

            const rawVideos = response.data.data.videos || [];

            const recommendedVideos = rawVideos
                .filter((video) => video._id !== excludeVideoId)
                .map((video) => ({
                    ...video,
                    thumbnail: toHttps(video.thumbnail),
                    videoFile: toHttps(video.videoFile),
                    owner: {
                        ...video.owner,
                        avatar: toHttps(video.owner?.avatar),
                    },
                }));

            set({
                recommendedVideos,
                isRecommendedLoading: false,
            });

        } catch (error) {
            console.error(
                "Error fetching recommended videos:",
                error
            );

            set({
                recommendedVideos: [],
                isRecommendedLoading: false,
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
    // Toggle Subscription (from a video's owner page)
    // Returns true/false so callers doing an optimistic UI
    // update know whether to keep it or revert it.
    // ==========================================

    toggleSubscription: async () => {
        try {
            // Get the state from the store
            const state = useVideoStore.getState();
            const ownerId = state.selectedVideo?.owner?._id;

            if (!ownerId) return false;

            // Subscribe/unsubscribe to the channel room for real-time updates
            if (!state.subscription.isSubscribed) {
                subscribeToChannel(ownerId);
            } else {
                unsubscribeFromChannel(ownerId);
            }

            await axiosInstance.post(
                `/subscription/${ownerId}/subscribed`
            );

            // Toggle subscription state locally
            const current = state.subscription;
            const newIsSubscribed = !current.isSubscribed;
            const newCount = current.isSubscribed
                ? Math.max(0, current.subscribersCount - 1)
                : current.subscribersCount + 1;

            set({
                subscription: {
                    ...current,
                    isSubscribed: newIsSubscribed,
                    subscribersCount: newCount,
                },
            });

            // Keep socket room in sync with actual subscription state
            if (newIsSubscribed) {
                subscribeToChannel(ownerId);
            } else {
                unsubscribeFromChannel(ownerId);
            }

            return true;

        } catch (error) {
            console.error(
                "Error toggling subscription:",
                error
            );

            return false;
        }
    },

    // ==========================================
    // Toggle Channel Subscription (from the Subscriptions page)
    // POST /subscription/:channelId/subscribed
    //
    // Unlike toggleSubscription above, this always means "unsubscribe"
    // in context, since this page only lists channels already
    // subscribed to — so we just remove it from the list on success.
    // ==========================================

    toggleChannelSubscription: async (channelId) => {
        if (!channelId) return;

        try {
            await axiosInstance.post(
                `/subscription/${channelId}/subscribed`
            );

            set((prev) => ({
                subscribedChannels: prev.subscribedChannels.filter(
                    (c) => c._id !== channelId
                ),
            }));

            unsubscribeFromChannel(channelId);

        } catch (error) {
            console.error(
                "Error toggling channel subscription:",
                error
            );
        }
    },

    getWatchHistory: async () => {
        try {

            set({
                isLoading: true,
                error: null,
            });

            const response = await axiosInstance.get(
                "/users/history"
            );

            set({
                watchHistory: response.data.data,
                isLoading: false,
            });
        } catch (error) {
            console.error(
                "Error fetching watch history:",
                error
            );

            set({
                watchHistory: [],
                isLoading: false,
                error:
                    error.response?.data?.message ||
                    "Failed to fetch watch history",
            });
        }
    },


    // ==========================================
    // Get Selected Video
    // ==========================================

    getSelectedVideo: async (videoId) => {
        // Join the video room for real-time updates
        if (videoId) {
            joinVideoRoom(videoId);
        }

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

                // Updated Channel
                updatedChannel: response.data.data.updatedChannel,

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
    // Toggle Video Like
    // POST /likes/:videoId/like
    // ==========================================

    // Returns true/false so callers doing an optimistic UI
    // update know whether to keep it or revert it.
    toggleVideoLike: async () => {

        try {

            const state = useVideoStore.getState();
            const videoId = state.selectedVideoId;

            if (!videoId) return false;

            const response = await axiosInstance.post(
                `/likes/${videoId}/like`
            );

            const liked = response.data.data.like;
            const likesCount = response.data.data.likesCount;

            set((prev) => ({
                isLiked: liked,
                selectedVideo: prev.selectedVideo
                    ? {
                        ...prev.selectedVideo,
                        likesCount: liked
                            ? prev.selectedVideo.likesCount + 1
                            : Math.max(0, prev.selectedVideo.likesCount - 1),
                    }
                    : prev.selectedVideo,
            }));

            return true;

        } catch (error) {

            console.error(
                "Error toggling video like:",
                error
            );

            return false;
        }
    },


    // ==========================================
    // Add Comment
    // POST /comments/:videoId/Addcomment
    // ==========================================

    addComment: async (content) => {

        try {

            const state = useVideoStore.getState();
            const videoId = state.selectedVideoId;

            if (!videoId || !content.trim()) return false;

            const response = await axiosInstance.post(
                `/comments/${videoId}/Addcomment`,
                { content }
            );

            const newComment = response.data.data;

            // Convert avatar to https
            const comment = {
                ...newComment,
                owner: {
                    ...newComment.owner,
                    avatar: toHttps(newComment.owner?.avatar),
                },
            };

            set((prev) => ({
                comments: [comment, ...prev.comments],
            }));

            return true;

        } catch (error) {

            console.error(
                "Error adding comment:",
                error
            );

            return false;
        }
    },


    // ==========================================
    // Update Comment
    // PATCH /comments/:commentId/updatecomment
    // ==========================================

    updateComment: async (commentId, content) => {

        try {

            if (!commentId || !content.trim()) return false;

            const response = await axiosInstance.patch(
                `/comments/${commentId}/updatecomment`,
                { content }
            );

            const updatedComment = response.data.data;

            set((prev) => ({
                comments: prev.comments.map((c) =>
                    c._id === commentId
                        ? {
                            ...updatedComment,
                            owner: {
                                ...updatedComment.owner,
                                avatar: toHttps(
                                    updatedComment.owner?.avatar
                                ),
                            },
                        }
                        : c
                ),
            }));

            return true;

        } catch (error) {

            console.error(
                "Error updating comment:",
                error
            );

            return false;
        }
    },


    // ==========================================
    // Delete Comment
    // DELETE /comments/:commentId/deletecomment
    // ==========================================

    deleteComment: async (commentId) => {

        try {

            if (!commentId) return false;

            await axiosInstance.delete(
                `/comments/${commentId}/deletecomment`
            );

            set((prev) => ({
                comments: prev.comments.filter(
                    (c) => c._id !== commentId
                ),
            }));

            return true;

        } catch (error) {

            console.error(
                "Error deleting comment:",
                error
            );

            return false;
        }
    },


    // ==========================================
    // Toggle Comment Like
    // POST /likes/:commentId/Commentlike
    // ==========================================

    toggleCommentLike: async (commentId) => {

        try {

            if (!commentId) return;

            const response = await axiosInstance.post(
                `/likes/${commentId}/Commentlike`
            );

            const liked = response.data.data.like;

            set((prev) => ({
                comments: prev.comments.map((c) =>
                    c._id === commentId
                        ? {
                            ...c,
                            isLiked: liked,
                            commentLikesCount: liked
                                ? (c.commentLikesCount || 0) + 1
                                : Math.max(0, (c.commentLikesCount || 0) - 1),
                        }
                        : c
                ),
            }));

        } catch (error) {

            console.error(
                "Error toggling comment like:",
                error
            );
        }
    },


    // ==========================================
    // Clear Selected Video
    // ==========================================

    clearSelectedVideo: () => {
        // Leave the video room
        if (get().selectedVideoId) {
            leaveVideoRoom(get().selectedVideoId);
        }

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
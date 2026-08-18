import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";

// Helper to convert http:// to https:// for Cloudinary URLs
const toHttps = (url = "") => {
    if (!url) return url;
    return url.startsWith("http://") ? url.replace("http://", "https://") : url;
};

const useChannelStore = create((set, get) => ({

    // ==========================================
    // Channel
    // ==========================================

    channel: null,

    channelVideos: [],

    isLoading: false,

    error: null,


    // ==========================================
    // Update Account
    // ==========================================

    isUpdatingChannel: false,

    updateError: null,


    // ==========================================
    // Update Avatar
    // ==========================================

    isUpdatingAvatar: false,

    avatarError: null,


    // ==========================================
    // Change Password
    // ==========================================

    isChangingPassword: false,

    passwordError: null,


    // ==========================================
    // Delete Video
    // ==========================================

    isDeletingVideo: false,

    deleteError: null,


    // ==========================================
    // Get My Channel
    // GET /users/current-user
    // ==========================================

    getMyChannel: async () => {

        try {

            set({
                isLoading: true,
                error: null,
            });

            const response = await axiosInstance.get(
                "/users/current-user"
            );

            // Backend returns: new ApiResponse(200, req.user, ...)
            // So response.data.data is the user directly
            const rawUser = response.data.data;

            // Convert avatar to https
            const channelBase =
                rawUser && typeof rawUser === "object"
                    ? {
                          ...rawUser,
                          avatar: toHttps(rawUser.avatar),
                          coverImage: toHttps(rawUser.coverImage),
                      }
                    : rawUser;

            // Fetch channel profile to get subscribersCount and isSubscribed
            let channel = channelBase;
            try {
                if (channelBase?.username) {
                    const channelResponse = await axiosInstance.get(
                        `/users/c/${channelBase.username}`
                    );
                    const channelData = channelResponse.data.data;

                    // Merge channel stats into the channel object
                    if (channelData && typeof channelData === "object") {
                        channel = {
                            ...channelBase,
                            ...channelData,
                            avatar: toHttps(channelData.avatar || channelBase.avatar),
                            coverImage: toHttps(channelData.coverImage || channelBase.coverImage),
                            subscribersCount: channelData.subscribersCount || 0,
                            subscribedToCount: channelData.subscribedToCount || 0,
                            isSubscribed: channelData.isSubscribed || false,
                        };
                    }
                }
            } catch (channelErr) {
                console.error("Fetch channel stats error:", channelErr);
                // If channel profile fetch fails, keep the base user data
            }

            set({
                channel,
                isLoading: false,
            });

        } catch (error) {

            console.error(
                "Get channel error:",
                error
            );

            set({
                channel: null,
                isLoading: false,

                error:
                    error.response?.data?.message ||
                    "Failed to load channel",
            });
        }
    },


    // ==========================================
    // Get My Videos
    // GET /videos/my-videos
    // ==========================================

    getMyVideos: async () => {

        try {

            const response = await axiosInstance.get(
                "/videos/my-videos"
            );

            const data = response.data.data;
            const rawVideos = data?.videos || data || [];

            // Convert http:// to https:// for video thumbnails and video files
            const videos = (Array.isArray(rawVideos) ? rawVideos : []).map(
                (video) => ({
                    ...video,
                    thumbnail: toHttps(video.thumbnail),
                    videoFile: toHttps(video.videoFile),
                    // Give fallback owner data if not populated from backend
                    owner: video.owner || {
                        avatar: "",
                        fullName: "Unknown",
                        username: "unknown",
                    },
                })
            );

            set({
                channelVideos: videos,
            });

        } catch (error) {

            console.error(
                "Get my videos error:",
                error
            );

            set({
                channelVideos: [],
            });
        }
    },


    // ==========================================
    // Update Account Details
    // PATCH /users/update-account
    // Sends JSON: { fullName, email, username }
    // ==========================================

    updateChannel: async (details) => {

        try {

            set({
                isUpdatingChannel: true,
                updateError: null,
            });

            const response = await axiosInstance.patch(
                "/users/update-account",
                details
            );

            // Backend returns: new ApiResponse(200, user, ...)
            // So response.data.data is the updated user directly
            const updatedUser = response.data.data;
            const currentChannel = get().channel;

            set({
                channel: {
                    ...(currentChannel || {}),
                    ...(updatedUser || {}),
                    avatar: toHttps(
                        updatedUser?.avatar || currentChannel?.avatar
                    ),
                },
                isUpdatingChannel: false,
            });

            return {
                success: true,
                data: updatedUser || response.data.data,
            };

        } catch (error) {

            console.error(
                "Update channel error:",
                error
            );

            const message =
                error.response?.data?.message ||
                "Failed to update account";

            set({
                isUpdatingChannel: false,
                updateError: message,
            });

            return {
                success: false,
                message,
            };
        }
    },


    // ==========================================
    // Update Avatar
    // PATCH /users/update-avatar
    // Sends: avatar (file) as multipart/form-data
    // ==========================================

    updateAvatar: async (avatarFile) => {

        try {

            set({
                isUpdatingAvatar: true,
                avatarError: null,
            });

            const formData = new FormData();
            formData.append("avatar", avatarFile);

            const response = await axiosInstance.patch(
                "/users/update-avatar",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            const updatedUser = response.data.data;
            const currentChannel = get().channel;

            set({
                channel: {
                    ...(currentChannel || {}),
                    ...(updatedUser || {}),
                    avatar: toHttps(
                        updatedUser?.avatar ||
                            currentChannel?.avatar
                    ),
                },
                isUpdatingAvatar: false,
            });

            return {
                success: true,
                data: updatedUser || response.data.data,
            };

        } catch (error) {

            console.error(
                "Update avatar error:",
                error
            );

            const message =
                error.response?.data?.message ||
                "Failed to update avatar";

            set({
                isUpdatingAvatar: false,
                avatarError: message,
            });

            return {
                success: false,
                message,
            };
        }
    },


    // ==========================================
    // Change Password
    // POST /users/change-password
    // Sends: oldPassword, newPassword, confPassword
    // ==========================================

    changePassword: async (oldPassword, newPassword, confPassword) => {

        try {

            set({
                isChangingPassword: true,
                passwordError: null,
            });

            const response = await axiosInstance.post(
                "/users/change-password",
                {
                    oldPassword,
                    newPassword,
                    confPassword,
                }
            );

            set({
                isChangingPassword: false,
            });

            return {
                success: true,
                data: response.data.data,
            };

        } catch (error) {

            console.error(
                "Change password error:",
                error
            );

            const message =
                error.response?.data?.message ||
                "Failed to change password";

            set({
                isChangingPassword: false,
                passwordError: message,
            });

            return {
                success: false,
                message,
            };
        }
    },


    // ==========================================
    // Delete Video
    // DELETE /videos/:videoId
    // ==========================================

    deleteVideo: async (videoId) => {

        try {

            set({
                isDeletingVideo: true,
                deleteError: null,
            });

            await axiosInstance.delete(
                `/videos/${videoId}`
            );

            // Remove deleted video immediately
            set((state) => ({
                channelVideos:
                    state.channelVideos.filter(
                        (video) =>
                            video._id !== videoId
                    ),

                isDeletingVideo: false,
            }));

            return {
                success: true,
            };

        } catch (error) {

            console.error(
                "Delete video error:",
                error
            );

            const message =
                error.response?.data?.message ||
                "Failed to delete video";

            set({
                isDeletingVideo: false,
                deleteError: message,
            });

            return {
                success: false,
                message,
            };
        }
    },

}));


export default useChannelStore;
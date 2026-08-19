import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";
import useAuthStore from "./authStore";

// ==========================================
// Helpers
// ==========================================

const toHttps = (url = "") => {
    if (!url) return url;

    return url.startsWith("http://")
        ? url.replace("http://", "https://")
        : url;
};

// Prevent browser/CDN from showing an old cached avatar
const addCacheBuster = (url = "") => {
    if (!url) return "";

    const separator = url.includes("?") ? "&" : "?";

    return `${url}${separator}v=${Date.now()}`;
};


const useChannelStore = create((set, get) => ({

    // ==========================================
    // Channel
    // ==========================================

    channel: null,

    channelVideos: [],

    isLoading: false,

    error: null,

    // Used to notify other components that the channel was updated
    channelUpdatedVersion: 0,

    notifyChannelUpdated: () => {
        set((state) => ({
            channelUpdatedVersion: state.channelUpdatedVersion + 1,
        }));
    },


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

            // ======================================
            // Get current authenticated user
            // ======================================

            const response = await axiosInstance.get(
                "/users/current-user"
            );

            const rawUser = response?.data?.data;

            if (!rawUser) {
                throw new Error("User data not found");
            }


            // ======================================
            // Base channel data
            // ======================================

            const channelBase = {
                ...rawUser,

                avatar: toHttps(rawUser?.avatar),

                coverImage: toHttps(rawUser?.coverImage),
            };


            // ======================================
            // Get channel profile
            // For subscribersCount etc.
            // ======================================

            let channel = channelBase;

            try {

                if (channelBase?.username) {

                    const channelResponse =
                        await axiosInstance.get(
                            `/users/c/${channelBase.username}`
                        );

                    const channelData =
                        channelResponse?.data?.data;


                    if (
                        channelData &&
                        typeof channelData === "object"
                    ) {

                        channel = {

                            ...channelBase,

                            ...channelData,

                            avatar: toHttps(
                                channelData?.avatar ||
                                channelBase?.avatar
                            ),

                            coverImage: toHttps(
                                channelData?.coverImage ||
                                channelBase?.coverImage
                            ),

                            subscribersCount:
                                channelData?.subscribersCount ?? 0,

                            subscribedToCount:
                                channelData?.subscribedToCount ?? 0,

                            isSubscribed:
                                channelData?.isSubscribed ?? false,
                        };
                    }
                }

            } catch (channelError) {

                console.error(
                    "Fetch channel profile error:",
                    channelError
                );

                // Keep current-user data
                channel = channelBase;
            }


            // ======================================
            // Update Zustand
            // ======================================

            set({
                channel,
                isLoading: false,
                error: null,
            });

            // Sync authUser in authStore so Navbar and other components update
            useAuthStore.setState({
                authUser: channel,
            });

            return channel;

        } catch (error) {

            console.error(
                "Get channel error:",
                error
            );

            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to load channel";


            set({
                channel: null,
                isLoading: false,
                error: message,
            });

            return null;
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


            const data = response?.data?.data;

            const rawVideos =
                data?.videos ||
                data ||
                [];


            const videos = (
                Array.isArray(rawVideos)
                    ? rawVideos
                    : []
            ).map((video) => ({

                ...video,

                thumbnail: toHttps(
                    video?.thumbnail
                ),

                videoFile: toHttps(
                    video?.videoFile
                ),

                owner: video?.owner
                    ? {
                        ...video.owner,

                        avatar: toHttps(
                            video.owner.avatar
                        ),
                    }
                    : {
                        avatar: "",
                        fullName: "Unknown",
                        username: "unknown",
                    },
            }));


            set({
                channelVideos: videos,
            });

            return videos;

        } catch (error) {

            console.error(
                "Get my videos error:",
                error
            );

            set({
                channelVideos: [],
            });

            return [];
        }
    },


    // ==========================================
    // Update Account Details
    // PATCH /users/update-account
    // ==========================================

    updatedChannel: false,
    updateChannel: async (details) => {

        try {

            set({
                isUpdatingChannel: true,
                updateError: null,
                updatedChannel: false,
            });


            const response =
                await axiosInstance.patch(
                    "/users/update-account",
                    details
                );


            const updatedUser =
                response?.data?.data;


            const currentChannel =
                get().channel;


            const updatedChannel = {

                ...(currentChannel || {}),

                ...(updatedUser || {}),

                avatar: toHttps(
                    updatedUser?.avatar ||
                    currentChannel?.avatar
                ),

                coverImage: toHttps(
                    updatedUser?.coverImage ||
                    currentChannel?.coverImage
                ),
            };


            set({

                channel: updatedChannel,

                isUpdatingChannel: false,
                updatedChannel: true,
                updateError: null,
            });

            // Sync authUser in authStore so Navbar and other components update
            useAuthStore.setState({
                authUser: updatedChannel,
            });

            // Notify other components that channel was updated
            get().notifyChannelUpdated();


            return {

                success: true,

                data: updatedChannel,
            };

        } catch (error) {

            console.error(
                "Update channel error:",
                error
            );


            const message =
                error?.response?.data?.message ||
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
    // ==========================================

    updateAvatar: async (avatarFile) => {

        try {

            if (!avatarFile) {

                return {
                    success: false,
                    message: "Avatar image is required",
                };
            }


            set({

                isUpdatingAvatar: true,

                avatarError: null,
            });


            // ======================================
            // Create FormData
            // ======================================

            const formData = new FormData();

            formData.append(
                "avatar",
                avatarFile
            );


           

            const response =
                await axiosInstance.patch(
                    "/users/update-avatar",
                    formData
                );


           

            const updatedUser =
                response?.data?.data;


            if (!updatedUser) {

                throw new Error(
                    "Updated user data was not returned"
                );
            }


            // ======================================
            // Current channel
            // ======================================

            const currentChannel =
                get().channel;


            // ======================================
            // New avatar URL
            // ======================================

            const avatarUrl =
                toHttps(
                    updatedUser?.avatar
                );


            // ======================================
            // Add cache buster
            //
            // Example:
            // https://cloudinary.../avatar.jpg?v=123456
            //
            // This prevents browser/CDN cache
            // from showing the old avatar.
            // ======================================

            const freshAvatarUrl =
                addCacheBuster(
                    avatarUrl
                );


            // ======================================
            // Update channel immediately
            // ======================================

            const updatedChannel = {

                ...(currentChannel || {}),

                ...updatedUser,

                avatar: freshAvatarUrl,
            };


            set({

                channel: updatedChannel,

                isUpdatingAvatar: false,

                avatarError: null,
            });

            // Sync authUser in authStore so Navbar and other components update
            useAuthStore.setState({
                authUser: updatedChannel,
            });

            // Notify other components that channel was updated
            get().notifyChannelUpdated();


            return {

                success: true,

                data: {

                    ...updatedUser,

                    avatar: freshAvatarUrl,
                },
            };

        } catch (error) {

            console.error(
                "Update avatar error:",
                error
            );


            const message =
                error?.response?.data?.message ||
                error?.message ||
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
    // ==========================================

    changePassword: async (
        oldPassword,
        newPassword,
        confPassword
    ) => {

        try {

            set({

                isChangingPassword: true,

                passwordError: null,
            });


            const response =
                await axiosInstance.post(
                    "/users/change-password",
                    {
                        oldPassword,
                        newPassword,
                        confPassword,
                    }
                );


            set({

                isChangingPassword: false,

                passwordError: null,
            });


            return {

                success: true,

                data: response?.data?.data,
            };

        } catch (error) {

            console.error(
                "Change password error:",
                error
            );


            const message =
                error?.response?.data?.message ||
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


            // ======================================
            // Remove deleted video immediately
            // ======================================

            set((state) => ({

                channelVideos:
                    state.channelVideos.filter(
                        (video) =>
                            video._id !== videoId
                    ),

                isDeletingVideo: false,

                deleteError: null,
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
                error?.response?.data?.message ||
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
import { io } from "socket.io-client";
import useAuthStore from "../store/authStore";

let socket = null;

/**
 * Get the current auth token from localStorage or useAuthStore
 * Note: The access token is stored in httpOnly cookies on the backend,
 * but the login response may include it. Try to use it if available.
 */
const getAuthToken = () => {
    // Try to get from authStore first
    const { accessToken } = useAuthStore.getState();
    if (accessToken) return accessToken;
    
    // Try localStorage as backup
    try {
        const stored = localStorage.getItem("accessToken");
        if (stored) return stored;
    } catch (e) {}
    
    // No token available - socket will connect without auth
    return null;
};

/**
 * Initialize the Socket.io client connection
 */
export const initSocket = () => {
    if (socket) return socket;

    const token = getAuthToken();

    // Store token in localStorage for later use
    if (token) {
        try {
            localStorage.setItem("accessToken", token);
        } catch (e) {}
    }

    socket = io("http://localhost:8000", {
        withCredentials: true,
        auth: token ? { token } : {},
        transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error.message);
    });

    return socket;
};

/**
 * Get the existing socket instance
 */
export const getSocket = () => {
    if (!socket) {
        return initSocket();
    }
    return socket;
};

/**
 * Disconnect the socket
 */
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

/**
 * Join the room for a specific video
 */
export const joinVideoRoom = (videoId) => {
    const s = getSocket();
    if (s?.connected && videoId) {
        s.emit("join-video-room", videoId);
    }
};

/**
 * Leave the room for a specific video
 */
export const leaveVideoRoom = (videoId) => {
    const s = getSocket();
    if (s?.connected && videoId) {
        s.emit("leave-video-room", videoId);
    }
};

/**
 * Subscribe to a channel room
 */
export const subscribeToChannel = (channelId) => {
    const s = getSocket();
    if (s?.connected && channelId) {
        s.emit("subscribe-channel", channelId);
    }
};

/**
 * Unsubscribe from a channel room
 */
export const unsubscribeFromChannel = (channelId) => {
    const s = getSocket();
    if (s?.connected && channelId) {
        s.emit("unsubscribe-channel", channelId);
    }
};

export default getSocket;
import { io } from "socket.io-client";
import useAuthStore from "../store/authStore";

let socket = null;

// Queue of room-join events to emit once the socket connects
let pendingRoomJoins = new Set();
let pendingChannelJoins = new Set();

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
 * Flush pending room joins once the socket is connected
 */
const flushPendingJoins = () => {
    if (!socket?.connected) return;

    // Join all pending video rooms
    pendingRoomJoins.forEach((videoId) => {
        socket.emit("join-video-room", videoId);
    });
    pendingRoomJoins.clear();

    // Join all pending channel rooms
    pendingChannelJoins.forEach((channelId) => {
        socket.emit("subscribe-channel", channelId);
    });
    pendingChannelJoins.clear();
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
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
    });

    socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
        // Emit any pending room joins now that we're connected
        flushPendingJoins();
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
        pendingRoomJoins.clear();
        pendingChannelJoins.clear();
    }
};

/**
 * Join the room for a specific video
 * If socket isn't connected yet, queue it for after connection
 */
export const joinVideoRoom = (videoId) => {
    const s = getSocket();
    if (!videoId) return;

    if (s?.connected) {
        s.emit("join-video-room", videoId);
    } else {
        // Queue it until the socket connects
        pendingRoomJoins.add(videoId);
        // Make sure the socket is trying to connect
        if (!s?.connected) {
            s?.connect?.();
        }
    }
};

/**
 * Leave the room for a specific video
 */
export const leaveVideoRoom = (videoId) => {
    const s = getSocket();
    if (!videoId) return;

    // Remove from pending queue
    pendingRoomJoins.delete(videoId);

    if (s?.connected) {
        s.emit("leave-video-room", videoId);
    }
};

/**
 * Subscribe to a channel room
 * If socket isn't connected yet, queue it for after connection
 */
export const subscribeToChannel = (channelId) => {
    const s = getSocket();
    if (!channelId) return;

    if (s?.connected) {
        s.emit("subscribe-channel", channelId);
    } else {
        // Queue it until the socket connects
        pendingChannelJoins.add(channelId);
        if (!s?.connected) {
            s?.connect?.();
        }
    }
};

/**
 * Unsubscribe from a channel room
 */
export const unsubscribeFromChannel = (channelId) => {
    const s = getSocket();
    if (!channelId) return;

    // Remove from pending queue
    pendingChannelJoins.delete(channelId);

    if (s?.connected) {
        s.emit("unsubscribe-channel", channelId);
    }
};

export default getSocket;
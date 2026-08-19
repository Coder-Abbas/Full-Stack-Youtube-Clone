import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "../models/users.models.js";

let io = null;

// Map to store userId -> Set of socketIds
// Map to store socketId -> userId
const userSockets = new Map(); // userId -> Set of socketIds
const socketToUser = new Map(); // socketId -> userId

/**
 * Create & initialize the Socket.io server
 * @param {http.Server} httpServer - The HTTP server instance
 */
export const initializeSocketIO = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: [
                process.env.FRONTEND_URL,
                "http://localhost:5173",
                "http://127.0.0.1:5173",
            ].filter(Boolean),
            credentials: true,
        },
    });

    // Authentication middleware for Socket.io (optional auth - allows unauthenticated
    // connections to receive real-time updates on public rooms)
    io.use(async (socket, next) => {
        try {
            const token =
                socket.handshake.auth?.token ||
                socket.handshake.headers?.authorization?.replace("Bearer ", "") ||
                null;

            if (!token) {
                // Allow unauthenticated connections - they can still join public rooms
                socket.user = null;
                socket.userId = null;
                return next();
            }

            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

            const user = await User.findById(decodedToken._id).select(
                "-password -refreshToken"
            );

            if (!user) {
                socket.user = null;
                socket.userId = null;
                return next();
            }

            socket.user = user;
            socket.userId = user._id.toString();

            next();
        } catch (error) {
            // Allow connection but don't authenticate
            socket.user = null;
            socket.userId = null;
            next();
        }
    });

    // Connection handler
    io.on("connection", (socket) => {
        const userId = socket.userId;

        // Register user connection (only for authenticated users)
        if (userId) {
            if (!userSockets.has(userId)) {
                userSockets.set(userId, new Set());
            }
            userSockets.get(userId).add(socket.id);
            socketToUser.set(socket.id, userId);

            // Join a personal room for direct events to this user
            socket.join(`user:${userId}`);
        }

        console.log(`⚡ User ${socket.user?.username || "anonymous"} connected: ${socket.id}`);

        // Handle joining video rooms (for real-time comments on a video)
        socket.on("join-video-room", (videoId) => {
            if (!videoId) return;
            socket.join(`video:${videoId}`);
            console.log(`  Socket ${socket.id} joined video room: ${videoId}`);
        });

        // Handle leaving a video room
        socket.on("leave-video-room", (videoId) => {
            if (!videoId) return;
            socket.leave(`video:${videoId}`);
            console.log(`  Socket ${socket.id} left video room: ${videoId}`);
        });

        // Handle subscribing to a channel room (get notifications when channel publishes)
        socket.on("subscribe-channel", (channelId) => {
            if (!channelId) return;
            socket.join(`channel:${channelId}`);
            console.log(`  Socket ${socket.id} joined channel room: ${channelId}`);
        });

        // Handle unsubscribing from a channel room
        socket.on("unsubscribe-channel", (channelId) => {
            if (!channelId) return;
            socket.leave(`channel:${channelId}`);
            console.log(`  Socket ${socket.id} left channel room: ${channelId}`);
        });

        // Disconnect handler
        socket.on("disconnect", (reason) => {
            console.log(`❌ User ${socket.user?.username || "anonymous"} disconnected: ${socket.id} (${reason})`);

            // Clean up mappings (only for authenticated users)
            if (userId) {
                const sockets = userSockets.get(userId);
                if (sockets) {
                    sockets.delete(socket.id);
                    if (sockets.size === 0) {
                        userSockets.delete(userId);
                    }
                }
                socketToUser.delete(socket.id);
            }
        });
    });

    return io;
};

/**
 * Get the Socket.io instance
 */
export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
};

/**
 * Emit a new comment event to everyone watching a video
 * @param {string} videoId - The video ID
 * @param {Object} comment - The comment data
 */
export const emitNewComment = (videoId, comment) => {
    if (io) {
        io.to(`video:${videoId}`).emit("new-comment", { videoId, comment });
    }
};

/**
 * Emit comment update event
 * @param {string} videoId - The video ID
 * @param {Object} comment - Updated comment data
 */
export const emitUpdateComment = (videoId, comment) => {
    if (io) {
        io.to(`video:${videoId}`).emit("update-comment", { videoId, comment });
    }
};

/**
 * Emit comment delete event
 * @param {string} videoId - The video ID
 * @param {string} commentId - The deleted comment ID
 */
export const emitDeleteComment = (videoId, commentId) => {
    if (io) {
        io.to(`video:${videoId}`).emit("delete-comment", { videoId, commentId });
    }
};

/**
 * Emit video like update event
 * @param {string} videoId - The video ID
 * @param {number} likesCount - Updated likes count
 * @param {boolean} like - Whether it was liked or unliked
 * @param {string} userId - The user who toggled the like
 */
export const emitVideoLikeUpdate = (videoId, likesCount, like, userId) => {
    if (io) {
        io.to(`video:${videoId}`).emit("video-like-update", {
            videoId,
            likesCount,
            like,
            userId,
        });
    }
};

/**
 * Emit comment like update event
 * @param {string} videoId - The video ID
 * @param {string} commentId - The comment ID
 * @param {number} likesCount - Updated likes count
 * @param {boolean} like - Whether it was liked or unliked
 */
export const emitCommentLikeUpdate = (videoId, commentId, likesCount, like) => {
    if (io) {
        io.to(`video:${videoId}`).emit("comment-like-update", {
            videoId,
            commentId,
            likesCount,
            like,
        });
    }
};

/**
 * Emit subscription update event to a specific channel
 * @param {string} channelId - The channel ID
 * @param {number} subscribersCount - Updated subscriber count
 */
export const emitSubscriptionUpdate = (channelId, subscribersCount) => {
    if (io) {
        io.to(`channel:${channelId}`).emit("subscription-update", {
            channelId,
            subscribersCount,
        });
        // Also send to the channel owner's personal room
        io.to(`user:${channelId}`).emit("subscription-update", {
            channelId,
            subscribersCount,
        });
    }
};

/**
 * Emit new video published event to all subscribers of a channel
 * @param {string} channelId - The channel ID (owner user ID)
 * @param {Object} video - The published video
 */
export const emitVideoPublished = (channelId, video) => {
    if (io) {
        io.to(`channel:${channelId}`).emit("video-published", {
            channelId,
            video,
        });
    }
};

/**
 * Emit video upload event (when a creator uploads a new video)
 * @param {string} channelId - The channel ID (owner user ID)
 * @param {Object} video - The uploaded video
 */
export const emitVideoUploaded = (channelId, video) => {
    if (io) {
        io.to(`user:${channelId}`).emit("video-uploaded", { video });
    }
};

/**
 * Emit video update (views, title, description etc.)
 * @param {string} videoId - The video ID
 * @param {Object} video - Updated video data
 */
export const emitVideoUpdate = (videoId, video) => {
    if (io) {
        io.to(`video:${videoId}`).emit("video-update", { videoId, video });
    }
};

/**
 * Emit video deleted event
 * @param {string} videoId - The video ID
 * @param {string} channelId - The owner channel ID
 */
export const emitVideoDeleted = (videoId, channelId) => {
    if (io) {
        io.to(`channel:${channelId}`).emit("video-deleted", { videoId });
    }
};

/**
 * Emit a notification to a specific user's room
 * @param {string} userId - The user ID to notify
 * @param {string} eventName - The event name
 * @param {Object} data - The event data
 */
export const emitToUser = (userId, eventName, data) => {
    if (io) {
        io.to(`user:${userId}`).emit(eventName, data);
    }
};

export { userSockets, socketToUser };
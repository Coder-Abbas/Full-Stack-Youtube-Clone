import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "../models/users.models.js";

let io = null;

// ==========================================
// Connected user tracking
// ==========================================

// userId -> Set of socket IDs
const userSockets = new Map();

// socketId -> userId
const socketToUser = new Map();


// ==========================================
// Initialize Socket.IO
// ==========================================

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


    // ==========================================
    // Socket Authentication
    // ==========================================

    io.use(async (socket, next) => {

        try {

            const token =
                socket.handshake.auth?.token ||
                socket.handshake.headers?.authorization?.replace(
                    "Bearer ",
                    ""
                );

            // Allow guest users
            if (!token) {

                socket.user = null;
                socket.userId = null;

                return next();
            }


            const decodedToken = jwt.verify(
                token,
                process.env.ACCESS_TOKEN_SECRET
            );


            const user = await User.findById(
                decodedToken._id
            ).select("-password -refreshToken");


            if (!user) {

                socket.user = null;
                socket.userId = null;

                return next();
            }


            socket.user = user;
            socket.userId = user._id.toString();


            next();

        } catch (error) {

            console.log(
                "Socket authentication failed:",
                error.message
            );

            // Guest connection
            socket.user = null;
            socket.userId = null;

            next();
        }

    });


    // ==========================================
    // Connection
    // ==========================================

    io.on("connection", (socket) => {

        const userId = socket.userId;


        console.log(
            `Socket connected: ${socket.id}`,
            userId
                ? `User: ${socket.user?.username}`
                : "Guest"
        );


        // ==========================================
        // Register authenticated user
        // ==========================================

        if (userId) {

            if (!userSockets.has(userId)) {

                userSockets.set(
                    userId,
                    new Set()
                );

            }


            userSockets
                .get(userId)
                .add(socket.id);


            socketToUser.set(
                socket.id,
                userId
            );


            // Personal room
            socket.join(`user:${userId}`);

        }


        // ==========================================
        // Join video room
        // ==========================================

        socket.on(
            "join-video-room",
            (videoId) => {

                if (!videoId) return;

                socket.join(
                    `video:${videoId}`
                );

                console.log(
                    `${socket.id} joined video:${videoId}`
                );

            }
        );


        // ==========================================
        // Leave video room
        // ==========================================

        socket.on(
            "leave-video-room",
            (videoId) => {

                if (!videoId) return;

                socket.leave(
                    `video:${videoId}`
                );

            }
        );


        // ==========================================
        // Join channel room
        // ==========================================

        socket.on(
            "subscribe-channel",
            (channelId) => {

                if (!channelId) return;

                socket.join(
                    `channel:${channelId}`
                );

                console.log(
                    `${socket.id} joined channel:${channelId}`
                );

            }
        );


        // ==========================================
        // Leave channel room
        // ==========================================

        socket.on(
            "unsubscribe-channel",
            (channelId) => {

                if (!channelId) return;

                socket.leave(
                    `channel:${channelId}`
                );

            }
        );


        // ==========================================
        // Disconnect
        // ==========================================

        socket.on(
            "disconnect",
            (reason) => {

                console.log(
                    `Socket disconnected: ${socket.id}`,
                    reason
                );


                if (userId) {

                    const sockets =
                        userSockets.get(userId);


                    if (sockets) {

                        sockets.delete(
                            socket.id
                        );


                        if (sockets.size === 0) {

                            userSockets.delete(
                                userId
                            );

                        }

                    }


                    socketToUser.delete(
                        socket.id
                    );

                }

            }
        );

    });


    console.log("Socket.IO initialized successfully");

    return io;
};


// ==========================================
// Get Socket.IO instance
// ==========================================

export const getIO = () => {

    if (!io) {

        throw new Error(
            "Socket.IO has not been initialized"
        );

    }

    return io;
};


// ==========================================
// COMMENTS
// ==========================================

export const emitNewComment = (
    videoId,
    comment
) => {

    if (!io) return;

    io.to(`video:${videoId}`).emit(
        "new-comment",
        {
            videoId,
            comment,
        }
    );

};


export const emitUpdateComment = (
    videoId,
    comment
) => {

    if (!io) return;

    io.to(`video:${videoId}`).emit(
        "update-comment",
        {
            videoId,
            comment,
        }
    );

};


export const emitDeleteComment = (
    videoId,
    commentId
) => {

    if (!io) return;

    io.to(`video:${videoId}`).emit(
        "delete-comment",
        {
            videoId,
            commentId,
        }
    );

};


// ==========================================
// VIDEO LIKE
// ==========================================

export const emitVideoLikeUpdate = (
    videoId,
    likesCount,
    isLiked,
    userId
) => {

    if (!io) return;

    io.to(`video:${videoId}`).emit(
        "video-like-update",
        {
            videoId,
            likesCount,
            isLiked,
            userId,
        }
    );

};


// ==========================================
// COMMENT LIKE
// ==========================================

export const emitCommentLikeUpdate = (
    videoId,
    commentId,
    likesCount,
    isLiked,
    userId
) => {

    if (!io) return;

    io.to(`video:${videoId}`).emit(
        "comment-like-update",
        {
            videoId,
            commentId,
            likesCount,
            isLiked,
            userId,
        }
    );

};


// ==========================================
// SUBSCRIPTION
// ==========================================

export const emitSubscriptionUpdate = (
    channelId,
    subscribersCount
) => {

    if (!io) return;


    // People currently inside channel room
    io.to(`channel:${channelId}`).emit(
        "subscription-update",
        {
            channelId,
            subscribersCount,
        }
    );


    // Channel owner
    io.to(`user:${channelId}`).emit(
        "subscription-update",
        {
            channelId,
            subscribersCount,
        }
    );

};


// ==========================================
// NEW VIDEO PUBLISHED
// ==========================================

export const emitVideoPublished = (
    channelId,
    video
) => {

    if (!io) return;


    // Send to everyone who subscribed
    // to this channel
    io.to(`channel:${channelId}`).emit(
        "video-published",
        {
            channelId,
            video,
        }
    );

};


// ==========================================
// VIDEO UPLOADED
// ==========================================

export const emitVideoUploaded = (
    channelId,
    video
) => {

    if (!io) return;


    // Notify channel owner
    io.to(`user:${channelId}`).emit(
        "video-uploaded",
        {
            channelId,
            video,
        }
    );

};


// ==========================================
// VIDEO UPDATED
// ==========================================

export const emitVideoUpdate = (
    videoId,
    video
) => {

    if (!io) return;


    io.to(`video:${videoId}`).emit(
        "video-update",
        {
            videoId,
            video,
        }
    );

};


// ==========================================
// VIDEO DELETED
// ==========================================

export const emitVideoDeleted = (
    videoId,
    channelId
) => {

    if (!io) return;


    io.to(`channel:${channelId}`).emit(
        "video-deleted",
        {
            videoId,
        }
    );

};


// ==========================================
// SEND EVENT TO SPECIFIC USER
// ==========================================

export const emitToUser = (
    userId,
    eventName,
    data
) => {

    if (!io) return;


    io.to(`user:${userId}`).emit(
        eventName,
        data
    );

};


// ==========================================
// Export maps
// ==========================================

export {
    userSockets,
    socketToUser,
};
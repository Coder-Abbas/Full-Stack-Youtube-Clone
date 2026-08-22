import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/users.models.js";
import { Video } from "../models/video.models.js";
import { Comment } from "../models/comment.models.js";
import { Like } from "../models/like.models.js";

// ==========================================
// Admin Overview
// ==========================================

const getAdminOverview = asyncHandler(async (req, res) => {
    const [totalUsers, totalVideos, totalComments, totalViews] = await Promise.all([
        User.countDocuments(),
        Video.countDocuments(),
        Comment.countDocuments(),
        Video.aggregate([
            { $group: { _id: null, totalViews: { $sum: "$views" } } },
        ]),
    ]);

    const recentUsers = await User.find()
        .select("-password -refreshToken")
        .sort({ createdAt: -1 })
        .limit(5);

    const recentVideos = await Video.find()
        .populate("owner", "fullName username avatar")
        .sort({ createdAt: -1 })
        .limit(5);

    const recentComments = await Comment.find()
        .populate("owner", "fullName username avatar")
        .populate("video", "title thumbnail")
        .sort({ createdAt: -1 })
        .limit(5);

    return res.status(200).json(
        new ApiResponse(200, {
            totalUsers,
            totalVideos,
            totalComments,
            totalViews: totalViews[0]?.totalViews || 0,
            recentUsers,
            recentVideos,
            recentComments,
        }, "Admin overview fetched successfully")
    );
});

// ==========================================
// Users
// ==========================================

const getAllUsers = asyncHandler(async (req, res) => {
    const { query = "", page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const searchFilter = query
        ? {
            $or: [
                { username: { $regex: query, $options: "i" } },
                { fullName: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } },
            ],
        }
        : {};

    const [users, total] = await Promise.all([
        User.find(searchFilter)
            .select("-password -refreshToken")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        User.countDocuments(searchFilter),
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            users,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        }, "Users fetched successfully")
    );
});

const getUserById = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new APIError(400, "Invalid user id");
    }

    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) {
        throw new APIError(404, "User not found");
    }

    const [totalVideos, totalSubscribers, subscribedTo, totalViews, totalLikes, totalComments] =
        await Promise.all([
            Video.countDocuments({ owner: userId }),
            User.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(userId) } },
                { $lookup: { from: "subscriptions", localField: "_id", foreignField: "channel", as: "subscribers" } },
                { $addFields: { subscribersCount: { $size: "$subscribers" } } },
                { $project: { subscribersCount: 1 } },
            ]),
            User.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(userId) } },
                { $lookup: { from: "subscriptions", localField: "_id", foreignField: "subscriber", as: "subscribedTo" } },
                { $addFields: { subscribedToCount: { $size: "$subscribedTo" } } },
                { $project: { subscribedToCount: 1 } },
            ]),
            Video.aggregate([
                { $match: { owner: new mongoose.Types.ObjectId(userId) } },
                { $group: { _id: null, totalViews: { $sum: "$views" } } },
            ]),
            Video.aggregate([
                { $match: { owner: new mongoose.Types.ObjectId(userId) } },
                { $group: { _id: null, totalLikes: { $sum: "$likesCount" } } },
            ]),
            Comment.countDocuments({ owner: userId }),
        ]);

    const enrichedUser = {
        ...user.toObject(),
        stats: {
            totalVideos,
            totalSubscribers: totalSubscribers[0]?.subscribersCount || 0,
            subscribedTo: subscribedTo[0]?.subscribedToCount || 0,
            totalViews: totalViews[0]?.totalViews || 0,
            totalLikes: totalLikes[0]?.totalLikes || 0,
            totalComments,
        },
    };

    return res.status(200).json(
        new ApiResponse(200, enrichedUser, "User fetched successfully")
    );
});

const deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new APIError(400, "Invalid user id");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new APIError(404, "User not found");
    }

    if (req.user._id.toString() === userId.toString()) {
        throw new APIError(403, "You cannot delete your own account");
    }

    const userVideos = await Video.find({ owner: userId }).select("_id");
    const videoIds = userVideos.map((v) => v._id);

    await Promise.all([
        Comment.deleteMany({ video: { $in: videoIds } }),
        Comment.deleteMany({ owner: userId }),
        Like.deleteMany({ video: { $in: videoIds } }),
        Like.deleteMany({ comment: { $in: await Comment.find({ owner: userId }).select("_id") } }),
        Video.deleteMany({ owner: userId }),
        User.findByIdAndDelete(userId),
    ]);

    return res.status(200).json(
        new ApiResponse(200, null, "User deleted successfully")
    );
});

const resetUserPassword = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!isValidObjectId(userId)) {
        throw new APIError(400, "Invalid user id");
    }

    if (!newPassword || newPassword.trim().length < 6) {
        throw new APIError(400, "Password must be at least 6 characters long");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new APIError(404, "User not found");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, null, "Password reset successfully")
    );
});

// ==========================================
// Videos
// ==========================================

const getAllVideos = asyncHandler(async (req, res) => {
    const { query = "", page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const searchFilter = query
        ? {
            $or: [
                { title: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } },
            ],
        }
        : {};

    const [videos, total] = await Promise.all([
        Video.find(searchFilter)
            .populate("owner", "fullName username avatar")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        Video.countDocuments(searchFilter),
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            videos,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        }, "Videos fetched successfully")
    );
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new APIError(400, "Invalid video id");
    }

    const video = await Video.findById(videoId).populate("owner", "fullName username avatar");

    if (!video) {
        throw new APIError(404, "Video not found");
    }

    return res.status(200).json(
        new ApiResponse(200, video, "Video fetched successfully")
    );
});

const updateVideoByAdmin = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description, isPublished } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new APIError(400, "Invalid video id");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new APIError(404, "Video not found");
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: updateData },
        { new: true }
    ).populate("owner", "fullName username avatar");

    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "Video updated successfully")
    );
});

const deleteVideoByAdmin = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new APIError(400, "Invalid video id");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new APIError(404, "Video not found");
    }

    const videoIds = [videoId];
    const commentIds = await Comment.find({ video: videoId }).select("_id").then((c) => c.map((c) => c._id));

    await Promise.all([
        Comment.deleteMany({ video: videoId }),
        Like.deleteMany({ video: { $in: videoIds } }),
        Like.deleteMany({ comment: { $in: commentIds } }),
        Video.findByIdAndDelete(videoId),
    ]);

    return res.status(200).json(
        new ApiResponse(200, null, "Video deleted successfully")
    );
});

// ==========================================
// Comments
// ==========================================

const getAllComments = asyncHandler(async (req, res) => {
    const { query = "", page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const searchFilter = query
        ? { content: { $regex: query, $options: "i" } }
        : {};

    const [comments, total] = await Promise.all([
        Comment.find(searchFilter)
            .populate("owner", "fullName username avatar")
            .populate("video", "title thumbnail")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        Comment.countDocuments(searchFilter),
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            comments,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        }, "Comments fetched successfully")
    );
});

const getCommentById = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new APIError(400, "Invalid comment id");
    }

    const comment = await Comment.findById(commentId)
        .populate("owner", "fullName username avatar")
        .populate("video", "title thumbnail");

    if (!comment) {
        throw new APIError(404, "Comment not found");
    }

    return res.status(200).json(
        new ApiResponse(200, comment, "Comment fetched successfully")
    );
});

const updateCommentByAdmin = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(commentId)) {
        throw new APIError(400, "Invalid comment id");
    }

    if (!content || content.trim().length === 0) {
        throw new APIError(400, "Comment content is required");
    }

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        { content },
        { new: true }
    ).populate("owner", "fullName username avatar")
     .populate("video", "title thumbnail");

    if (!comment) {
        throw new APIError(404, "Comment not found");
    }

    return res.status(200).json(
        new ApiResponse(200, comment, "Comment updated successfully")
    );
});

const deleteCommentByAdmin = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new APIError(400, "Invalid comment id");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new APIError(404, "Comment not found");
    }

    await Like.deleteMany({ comment: commentId });
    await Comment.findByIdAndDelete(commentId);

    return res.status(200).json(
        new ApiResponse(200, null, "Comment deleted successfully")
    );
});

export {
    getAdminOverview,
    getAllUsers,
    getUserById,
    deleteUser,
    resetUserPassword,
    getAllVideos,
    getVideoById,
    updateVideoByAdmin,
    deleteVideoByAdmin,
    getAllComments,
    getCommentById,
    updateCommentByAdmin,
    deleteCommentByAdmin,
};

import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/users.models.js";
import { Video } from "../models/video.models.js";
import { Comment } from "../models/comment.models.js";
import { Like } from "../models/like.models.js";
import { Subscription } from "../models/subscription.models.js";
import { PlayList } from "../models/playlist.models.js";
import { Tweet } from "../models/tweet.models.js";

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

    // ==========================================
    // Collect everything owned by this user
    // ==========================================

    // 1. All videos the user uploaded
    const userVideos = await Video.find({ owner: userId }).select("_id");
    const videoIds = userVideos.map((v) => v._id);

    // 2. All comments the user WROTE (on anyone's videos)
    const userComments = await Comment.find({ owner: userId }).select("_id");

    // 3. All comments posted ON the user's videos
    const commentIdsOnHisVideos = await Comment.distinct("_id", {
        video: { $in: videoIds },
    });

    const allCommentIds = [
        ...new Set([...userComments.map((c) => c._id), ...commentIdsOnHisVideos]),
    ];

    // ==========================================
    // Cascade-delete in dependency order
    // ==========================================

    // A. Likes — every like that touches this user:
    //    • likes the user GAVE (videos / comments / tweets)
    //    • likes ON the user's videos
    //    • likes ON comments written by the user
    //    • likes ON comments living on the user's videos
    await Like.deleteMany({
        $or: [
            { likedBy: userId },
            { video: { $in: videoIds } },
            { comment: { $in: allCommentIds } },
        ],
    });

    // B. Comments — both authored by the user and posted on his videos
    await Comment.deleteMany({
        $or: [
            { owner: userId },
            { video: { $in: videoIds } },
        ],
    });

    // C. Subscriptions in BOTH directions:
    //    • channels this user subscribed to
    //    • subscribers of this user's channel
    //      (removes him from their "recent subscribers" lists)
    await Subscription.deleteMany({
        $or: [{ channel: userId }, { subscriber: userId }],
    });

    // D. Scrub deleted video references from OTHER users' documents
    if (videoIds.length > 0) {
        // watch history & watch later entries pointing at his videos
        await User.updateMany(
            { _id: { $ne: user._id } },
            {
                $pull: {
                    watchHistory: { video: { $in: videoIds } },
                    watchLater: { $in: videoIds },
                },
            }
        );

        // remove his videos from other users' playlists
        await PlayList.updateMany(
            { createdBy: { $ne: user._id } },
            { $pull: { videos: { $in: videoIds } } }
        );
    }

    // E. Playlists owned by the user
    await PlayList.deleteMany({ createdBy: userId });

    // F. Tweets authored by the user + likes on them
    const userTweetIds = await Tweet.distinct("_id", { owner: userId });
    if (userTweetIds.length > 0) {
        await Like.deleteMany({ tweet: { $in: userTweetIds } });
        await Tweet.deleteMany({ owner: userId });
    }

    // G. The user's videos themselves
    await Video.deleteMany({ owner: userId });

    // H. Finally, delete the user account
    await User.findByIdAndDelete(userId);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                deletedUserId: userId,
                deletedVideos: videoIds.length,
                deletedComments: allCommentIds.length,
                deletedSubscriptions: true,
            },
            "User and all associated data deleted successfully"
        )
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

import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.models.js"
import { APIError } from "../utils/APIError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Like } from "../models/like.models.js"
import { Comment } from "../models/comment.models.js"
import { Tweet } from "../models/tweet.models.js"
import {Subscription} from "../models/subscription.models.js"



const getOverviewData = asyncHandler(async (req, res, next) => {
    const userId = req.user?._id;

    if (!userId || !isValidObjectId(userId)) {
        return next(new APIError("Invalid user ID", 400));
    }

    // Total subscribers
    const totalSubscribers = await Subscription.countDocuments({
        channel: userId
    });

    // Total videos
    const totalVideos = await Video.countDocuments({
        owner: userId
    });

    // Total views
    const viewsResult = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
                isPublished: true
            }
        },
        {
            $group: {
                _id: null,
                totalViews: {
                    $sum: "$views"
                }
            }
        }
    ]);

    const totalViews = viewsResult[0]?.totalViews || 0;

    // Get user's videos first
    const videos = await Video.find({
        owner: userId
    }).select("_id");

    const videoIds = videos.map(video => video._id);

    // Total likes received on channel videos
    const totalLikes = await Like.countDocuments({
        video: { $in: videoIds }
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalSubscribers,
                totalVideos,
                totalLikes,
                totalViews
            },
            "Overview data fetched successfully"
        )
    );
});

const getTopVideos = asyncHandler(async (req, res, next) => {
    const userId = req.user?._id;

    if (!userId || !isValidObjectId(userId)) {
        return next(new APIError("Invalid user ID", 400));
    }

    const topVideos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
                isPublished: true,
            },
        },
        { $sort: { views: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "commentDocs",
            },
        },
        {
            $addFields: {
                likes: { $ifNull: ["$likesCount", 0] },
                comments: { $size: "$commentDocs" },
            },
        },
        {
            $project: {
                _id: 1,
                title: 1,
                thumbnail: 1,
                views: 1,
                duration: 1,
                createdAt: 1,
                likes: 1,
                comments: 1,
            },
        },
    ]);

    return res.status(200).json(
        new ApiResponse(200, topVideos, "Top videos fetched successfully")
    );
});


const getRecentSubscribers = asyncHandler(async (req, res, next) => {
    const userId = req.user?._id;

    if (!userId || !isValidObjectId(userId)) {
        return next(new APIError("Invalid user ID", 400));
    }

    // Use aggregation with $lookup into the users collection so that
    // subscribers whose accounts have been deleted are automatically
    // filtered out (orphaned subscription docs are skipped) and only
    // subscribers that still exist in the DB are returned.
    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(userId),
            },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDoc",
            },
        },
        { $unwind: "$subscriberDoc" },
        {
            $addFields: {
                "subscriber.username": "$subscriberDoc.username",
                "subscriber.fullName": "$subscriberDoc.fullName",
                "subscriber.avatar": "$subscriberDoc.avatar",
            },
        },
        {
            $project: {
                _id: 1,
                createdAt: 1,
                updatedAt: 1,
                subscriber: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                },
            },
        },
    ]);

    // Correct subscriber count from live subscriptions
    const totalSubscribers = await Subscription.countDocuments({
        channel: userId,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            { subscribers, totalSubscribers },
            "Recent subscribers fetched successfully"
        )
    );
});

const getRecentVideos = asyncHandler(async (req, res, next) => {
    const userId = req.user?._id;

    if (!userId || !isValidObjectId(userId)) {
        return next(new APIError("Invalid user ID", 400));
    }

    const recentVideos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
                isPublished: true,
            },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "commentDocs",
            },
        },
        {
            $addFields: {
                likes: { $ifNull: ["$likesCount", 0] },
                comments: { $size: "$commentDocs" },
            },
        },
        {
            $project: {
                _id: 1,
                title: 1,
                thumbnail: 1,
                views: 1,
                duration: 1,
                createdAt: 1,
                likes: 1,
                comments: 1,
            },
        },
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            recentVideos,
            "Recent videos fetched successfully"
        )
    );
});

const getAnalytics = asyncHandler(async (req, res, next) => {
    const userId = req.user?._id;

    if (!userId || !isValidObjectId(userId)) {
        return next(new APIError("Invalid user ID", 400));
    }

    // Build a cumulative views/likes time-series from the channel's
    // videos (grouped by upload date). VideoAnalytics snapshots are
    // not populated by the app, so we derive the series from real data.
    const videos = await Video.find({
        owner: new mongoose.Types.ObjectId(userId),
        isPublished: true,
    })
        .sort({ createdAt: 1 })
        .select("createdAt views likesCount");

    let cumulativeViews = 0;
    let cumulativeLikes = 0;
    const byDate = {};

    for (const v of videos) {
        const date = v.createdAt
            ? v.createdAt.toISOString().slice(0, 10)
            : "unknown";

        cumulativeViews += v.views || 0;
        cumulativeLikes += v.likesCount || 0;

        byDate[date] = {
            _id: date,
            views: cumulativeViews,
            likes: cumulativeLikes,
            comments: 0,
        };
    }

    const analytics = Object.values(byDate).sort((a, b) =>
        a._id < b._id ? -1 : a._id > b._id ? 1 : 0
    );

    return res.status(200).json(
        new ApiResponse(200, analytics, "Analytics fetched successfully")
    );
});

export {
    getOverviewData,
    getTopVideos,
    getRecentSubscribers,
    getRecentVideos,
    getAnalytics
}


import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.models.js"
import { APIError } from "../utils/APIError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Like } from "../models/like.models.js"
import { Comment } from "../models/comment.models.js"
import { Tweet } from "../models/tweet.models.js"
import {Subscription} from "../models/subscription.models.js"
import { VideoAnalytics } from "../models/dashboard.models.js"



const getOverviewData = asyncHandler(async (req, res, next) => {
    const userId = req.user?._id;

    if (!userId || !isValidObjectId(userId)) {
        return next(new APIError("Invalid user ID", 400));
    }

    // Total subscribers
    const totalSubscribers = await Subscription.countDocuments({
        subscribedTo: userId
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

    const topVideos = await Video.find({
        owner: userId,
        isPublished: true
    })
        .sort({ views: -1 })
        .limit(10)
        .select("title thumbnail views createdAt duration");

    return res.status(200).json(
        new ApiResponse(
            200,
            topVideos,
            "Top videos fetched successfully"
        )
    );
});


const getRecentSubscribers = asyncHandler(async (req, res, next) => {
    const userId = req.user?._id;

    if (!userId || !isValidObjectId(userId)) {
        return next(new APIError("Invalid user ID", 400));
    }

    const subscribers = await Subscription.find({
        subscribedTo: userId
    })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate(
            "subscriber",
            "username fullName avatar"
        );

    return res.status(200).json(
        new ApiResponse(
            200,
            subscribers,
            "Recent subscribers fetched successfully"
        )
    );
});

const getRecentVideos = asyncHandler(async (req, res, next) => {
    const userId = req.user?._id;

    if (!userId || !isValidObjectId(userId)) {
        return next(new APIError("Invalid user ID", 400));
    }

    const recentVideos = await Video.find({
        owner: userId,
        isPublished: true
    })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("title thumbnail views createdAt duration");

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

    const analytics = await VideoAnalytics.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: "$date",

                views: {
                    $sum: "$views"
                },

                likes: {
                    $sum: "$likes"
                },

                comments: {
                    $sum: "$comments"
                }
            }
        },
        {
            $sort: {
                _id: 1
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            analytics,
            "Analytics fetched successfully"
        )
    );
});

export {
    getOverviewData,
    getTopVideos,
    getRecentSubscribers,
    getRecentVideos,
    getAnalytics
}


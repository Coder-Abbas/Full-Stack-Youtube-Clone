import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { APIError } from "../utils/APIError.js";

import { Video } from "../models/video.models.js";
import { User } from "../models/users.models.js";
import { Subscription } from "../models/subscription.models.js";

const search = asyncHandler(async (req, res) => {
    const { q } = req.query;

    const searchQuery = (q || "").toString().trim();

    if (!searchQuery) {
        throw new APIError(
            400,
            "Search query is required"
        );
    }

    if (searchQuery.length > 100) {
        throw new APIError(
            400,
            "Search query is too long"
        );
    }

    // Escape regex special characters
    const escapedQuery = searchQuery.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );

    const searchRegex = new RegExp(
        escapedQuery,
        "i"
    );

    const [videos, channels] = await Promise.all([

        // ==========================================
        // SEARCH VIDEOS
        // ==========================================

        Video.find({
            isPublished: true,

            $or: [
                {
                    title: {
                        $regex: searchRegex,
                    },
                },
                {
                    description: {
                        $regex: searchRegex,
                    },
                },
            ],
        })
            .populate(
                "owner",
                "username fullName avatar"
            )
            .sort({
                createdAt: -1,
            })
            .limit(20),


        // ==========================================
        // SEARCH CHANNELS
        // ==========================================

        User.aggregate([
            {
                $match: {
                    $or: [
                        {
                            username: {
                                $regex: searchRegex,
                            },
                        },
                        {
                            fullName: {
                                $regex: searchRegex,
                            },
                        },
                    ],
                },
            },

            // Find subscriptions where this user
            // is the channel
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscriptions",
                },
            },

            // Count subscribers
            {
                $addFields: {
                    subscriberCount: {
                        $size: "$subscriptions",
                    },
                },
            },

            // Only return fields required by frontend
            {
                $project: {
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                    subscriberCount: 1,
                },
            },

            {
                $limit: 20,
            },
        ]),
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                videos,
                channels,
            },
            "Search results fetched successfully"
        )
    );
});

export {
    search,
};
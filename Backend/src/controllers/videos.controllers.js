import { asyncHandler } from "../utils/asyncHandler.js";
import { isValidObjectId } from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { APIError } from "../utils/APIError.js";
import { User } from "../models/users.models.js"
import { uploadOnCloudinary } from "../utils/Cloudinary.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { Video } from "../models/video.models.js";
import cloudinary from "cloudinary";
import { Like } from "../models/like.models.js"
import { Comment } from "../models/comment.models.js";
import { Subscription } from "../models/subscription.models.js";




const deletepicold = async (imageUrl) => {
    try {
        const publicId = imageUrl
            .split("/")
            .pop()
            .split(".")[0];

        

        await cloudinary.uploader.destroy(publicId);

    } catch (error) {
        
    }
};

const deleteOldVideo = async (videoUrl) => {
    try {
        const publicId = videoUrl
            .split("/")
            .pop()
            .split(".")[0];

        

        await cloudinary.uploader.destroy(publicId, {
            resource_type: "video"
        });

    } catch (error) {
        
    }
};


const uploadvideo = asyncHandler(async (req, res) => {

    //1. get the information
    const { title, description } = req.body;


    //2. validation
    if (!title || !description) {
        throw new APIError(400, "Title and description are required")
    }

    //3. get the files
    const videoFile = req.files?.videoFile?.[0]?.path;
    const thumbnailFile = req.files?.thumbnail?.[0]?.path;

    //4. validation
    if (!videoFile || !thumbnailFile) {
        throw new APIError(400, "Video and thumbnail are required")
    }

    //5. upload to cloudinary
    const video = await uploadOnCloudinary(videoFile);
    const thumbnail = await uploadOnCloudinary(thumbnailFile);

    //6. validation if upload failed
    if (!video || !thumbnail) {
        throw new APIError(500, "Video or thumbnail upload failed")
    }

    //7. get the video information
    const videoInformation = await Video.create({
        videoFile: video.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: video.duration,
        owner: req.user._id,
        views: 0,
        isPublished: false
    })


    //8. validation is correctly uploaded
    if (!videoInformation) {
        throw new APIError(500, "Video upload failed")
    }

    //9. return the response
    return res.status(201)
        .json(
            new ApiResponse(201, videoInformation, "Video uploaded successfully")
        )

})


const isPublished = asyncHandler(async (req, res) => {

    //1. get the information
    const { videoId } = req.params;

    //2. validation
    if (!videoId) {
        throw new APIError(400, "Video ID is required")
    }

    //3. find the video 
    const findVideo = await Video.findById(videoId);

    //4. validation if video not found
    if (!findVideo) {
        throw new APIError(404, "Video not found")
    }

    //5. check ownership
    if (findVideo.owner.toString() !== req.user._id.toString()) {
        throw new APIError(403, "You are not authorized to update this video")
    }

    //6. toggle it published
    findVideo.isPublished = !findVideo.isPublished;

    //7. save the video
    await findVideo.save();

    //8. return the response
    return res.status(200)
        .json(
            new ApiResponse(200, findVideo, "Video published status updated successfully")
        )
})


const getSubscribedVideos = asyncHandler(async (req, res) => {
    //1. get the user id from req.user

    const userId = req.user?._id;

    //validate 
    if (!userId || !isValidObjectId(userId)) {
        throw new APIError(400, "Invalid user ID");
    }

    //2. find the subscriptions of the user
    const subscriptions = await Subscription.find({
        subscriber: userId
    })
        .populate("channel", "username fullName avatar")
        .sort({ createdAt: -1 });

    //3. get the channel ids
    const channelIds = subscriptions.map(sub => sub.channel?._id);

    //validate
    if (channelIds.length === 0) {
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    videos: [],
                    subscriptions: [],
                },
                "No subscriptions found"
            )
        );
    }

    const videos = await Video.find({
        owner: { $in: channelIds },
        isPublished: true
    })
        .populate("owner", "username fullName avatar")
        .sort({ createdAt: -1 });


    const data = {
        videos,
        subscriptions
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Subscribed videos fetched successfully"
        )
    );



})


const toggleWatchLater = asyncHandler(async (req, res) => {
 
    // 1. get the user id from req.user
    const userId = req.user?._id;
 
    // validate
    if (!userId || !isValidObjectId(userId)) {
        throw new APIError(400, "Invalid user ID");
    }
 
    // 2. get the video id
    const { videoId } = req.params;
 
    if (!isValidObjectId(videoId)) {
        throw new APIError(400, "Invalid video ID");
    }
 
    // 3. confirm the video actually exists
    const video = await Video.findById(videoId);
 
    if (!video) {
        throw new APIError(404, "Video not found");
    }
 
    // 4. check whether it's already in the user's watch-later list
    const user = await User.findById(userId);
 
    if (!user) {
        throw new APIError(404, "User not found");
    }
 
    const alreadySaved = user.watchLater?.some(
        (id) => id.toString() === videoId
    );
 
    if (alreadySaved) {
        // remove it
        await User.findByIdAndUpdate(userId, {
            $pull: { watchLater: videoId },
        });
    } else {
        // add it
        await User.findByIdAndUpdate(userId, {
            $addToSet: { watchLater: videoId },
        });
    }
 
    // 5. send response
    return res.status(200).json(
        new ApiResponse(
            200,
            { saved: !alreadySaved },
            alreadySaved
                ? "Removed from watch later"
                : "Added to watch later"
        )
    );
});
 
 
// ==========================================
// Get Watch Later Videos
// GET /videos/watch-later
// ==========================================
 
const getWatchLaterVideos = asyncHandler(async (req, res) => {
 
    // 1. get the user id from req.user
    const userId = req.user?._id;
 
    // validate
    if (!userId || !isValidObjectId(userId)) {
        throw new APIError(400, "Invalid user ID");
    }
 
    // 2. populate the watchLater list with full video docs
    const user = await User.findById(userId).populate({
        path: "watchLater",
        populate: {
            path: "owner",
            select: "avatar fullName username",
        },
    });
 
    if (!user) {
        throw new APIError(404, "User not found");
    }
 
    // 3. send response
    return res.status(200).json(
        new ApiResponse(
            200,
            user.watchLater || [],
            "Watch later videos fetched successfully"
        )
    );
});

const getAllPublishedVideos = asyncHandler(async (req, res) => {

    // 1. Get pagination information
    const { page, limit } = req.query;

    // 2. Validate pagination
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;

    // 3. Calculate skip
    const skip = (pageNumber - 1) * limitNumber;


    // 4. Get published videos
    const videos = await Video
        .find({ isPublished: true })
        .populate(
            "owner",
            "username avatar fullName"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber);


    // 5. Count published videos
    const totalVideos = await Video.countDocuments({
        isPublished: true
    });


    // 6. Calculate total pages
    const totalPages = Math.ceil(
        totalVideos / limitNumber
    );


    // 7. Return response
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    videos,

                    Pagination: {
                        currentPage: pageNumber,
                        limit: limitNumber,
                        totalVideos,
                        totalPages,
                        hasNextPage:
                            pageNumber < totalPages,
                        hasPrevPage:
                            pageNumber > 1
                    }
                },
                "Published videos fetched successfully"
            )
        );
});


const getSelectedVideo = asyncHandler(async (req, res) => {

    // ==========================================
    // 1. Get video ID
    // ==========================================

    const { videoId } = req.params;


    // ==========================================
    // 2. Validate video ID
    // ==========================================

    if (!videoId || !isValidObjectId(videoId)) {
        throw new APIError(
            400,
            "Invalid video ID"
        );
    }


    // ==========================================
    // 3. Find video + populate owner
    // ==========================================

    const video = await Video
        .findById(videoId)
        .populate(
            "owner",
            "username fullName avatar"
        );


    // ==========================================
    // 4. Check video
    // ==========================================

    if (!video || !video.isPublished) {
        throw new APIError(
            404,
            "Video not found or not published"
        );
    }


    // ==========================================
    // 4b. Add to watch history (logged-in users only)
    // ==========================================

    if (req.user) {
        // Remove any existing entry for this video first,
        // so re-watching moves it back to the top instead
        // of creating a duplicate
        await User.findByIdAndUpdate(req.user._id, {
            $pull: { watchHistory: { video: videoId } }
        });

        // Push to the front (position 0) since the frontend
        // will want newest-first ordering
        await User.findByIdAndUpdate(req.user._id, {
            $push: {
                watchHistory: {
                    $each: [{ video: videoId, watchedAt: new Date() }],
                    $position: 0
                }
            }
        });
    }


    // ==========================================
    // 5. Check if current user liked video
    // ==========================================

    let isLiked = false;

    if (req.user) {

        const videoLike = await Like.exists({
            video: videoId,
            likedBy: req.user._id
        });

        isLiked = Boolean(videoLike);
    }


    // ==========================================
    // 6. Get total video likes
    // ==========================================

    const likesCount = await Like.countDocuments({
        video: videoId
    });


    // ==========================================
    // 7. Check subscription
    // ==========================================

    let isSubscribed = false;

    if (req.user) {

        const subscription = await Subscription.exists({
            subscriber: req.user._id,
            channel: video.owner._id
        });

        isSubscribed = Boolean(subscription);
    }


    // ==========================================
    // 8. Get subscriber count
    // ==========================================

    const subscribersCount =
        await Subscription.countDocuments({
            channel: video.owner._id
        });


    // ==========================================
    // 9. Get comments
    // ==========================================

    const comments = await Comment
        .find({
            video: videoId
        })
        .populate(
            "owner",
            "username fullName avatar"
        )
        .sort({
            createdAt: -1
        });


    // ==========================================
    // 10. Add comment likes
    // ==========================================

    const commentsWithLikes = await Promise.all(

        comments.map(async (comment) => {

            // Check comment like
            let isCommentLiked = false;

            if (req.user) {

                const commentLike =
                    await Like.exists({
                        comment: comment._id,
                        likedBy: req.user._id
                    });

                isCommentLiked =
                    Boolean(commentLike);
            }


            // Get comment likes count
            const commentLikesCount =
                await Like.countDocuments({
                    comment: comment._id
                });


            return {
                ...comment.toObject(),

                likesCount: commentLikesCount,

                isLiked: isCommentLiked
            };
        })
    );


    // ==========================================
    // 11. Prepare video data
    // ==========================================

    const videoData = {

        video: {
            ...video.toObject(),

            likesCount
        },

        isLiked,

        subscription: {
            isSubscribed,
            subscribersCount
        },

        comments: commentsWithLikes
    };


    // ==========================================
    // 12. Send response
    // ==========================================

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                videoData,
                "Video fetched successfully"
            )
        );
});

const deleteVideo = asyncHandler(async (req, res) => {
    //1. get the video id from params
    const { videoId } = req.params;

    const video = await Video.findById(videoId);

    //2. validation
    if (!video) {
        throw new APIError(404, "Video is not found")
    }

    //3. check ownership 
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new APIError(403, "You are not authorized to delete this video")
    }

    //4. delete the video from database
    const oldVideo = video.videoFile;
    const oldThumbnail = video.thumbnail;

    await video.deleteOne();

    await deleteOldVideo(oldVideo);
    await deletepicold(oldThumbnail);

    //5. return response
    return res.status(200)
        .json(
            new ApiResponse(200, null, "Video deleted successfully")
        )

})


const updateVideo = asyncHandler(async (req, res) => {
    //1. get the data
    const { videoId } = req.params;
    const { title, description } = req.body;

    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoId) {
        throw new APIError(403, "Video ID is required")
    }
    //find the video by id
    const video = await Video.findById(videoId);

    //validation
    if (!video) {
        throw new APIError(404, "Video not found")
    }

    //check ownership

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new APIError(403, "You are not authorized to update this video")
    }


    //update the title
    if (title !== undefined) {
        video.title = title;
    }

    // Update description
    if (description !== undefined) {
        video.description = description;
    }

    const oldVideoFile = video.videoFile;
    const oldThumbnail = video.thumbnail;

    //update the thumbnail if provided
    if (thumbnailLocalPath) {
        const thumbnailCloudinary = await uploadOnCloudinary(thumbnailLocalPath);

        if (!thumbnailCloudinary) {
            throw new APIError(500, "Failed to upload thumbnail")
        }
        video.thumbnail = thumbnailCloudinary.url;
    }

    //update the video file if provided
    if (videoFileLocalPath) {
        const videoFileCloudinary = await uploadOnCloudinary(videoFileLocalPath);

        if (!videoFileCloudinary) {
            throw new APIError(500, "Failed to upload video file")
        }
        video.videoFile = videoFileCloudinary.url;
        // Update duration because video changed
        video.duration = videoFileCloudinary.duration;
    }

    //save the video
    await video.save();

    // Delete OLD thumbnail
    if (thumbnailLocalPath) {
        await deletepicold(oldThumbnail);
    }
    //Delete OLD video
    if (videoFileLocalPath) {
        await deleteOldVideo(oldVideoFile);
    }

    //return the response
    return res.status(200)
        .json(
            new ApiResponse(200, video, "Video updated successfully")
        )

})


const getViews = asyncHandler(async (req, res) => {
    //1. get the video id from params
    const { videoId } = req.params;

    //2. validate ID
    if (!videoId) {
        throw new APIError(400, "Video ID is required")
    }

    //3. find the video

    const video = await Video.findById(videoId);

    //4. validatin + isPublished
    if (!video || !video.isPublished) {
        throw new APIError(404, "Video not found or not published")
    }

    //5 increement the views
    video.views += 1;

    //6. save the video
    await video.save();

    //7. return video
    return res.status(200)
        .json(
            new ApiResponse(200, video, "Video views updated successfully")
        )
})


const getMyVideos = asyncHandler(async (req, res) => {

    const userId = req.user?._id;
    if (!userId || !isValidObjectId(userId)) {
        throw new APIError(400, "Invalid user ID");
    }

    const videos = await Video.find({
        owner: req.user._id
    })
        .populate(
            "owner",
            "username avatar fullName"
        )
        .sort({
            createdAt: -1
        });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                videos
            },
            "My videos fetched successfully"
        )
    );
});



export {
    uploadvideo,
    isPublished,
    getMyVideos,
    getAllPublishedVideos,
    getSelectedVideo,
    deleteVideo,
    updateVideo,
    getViews,
    getSubscribedVideos,
    toggleWatchLater,
    getWatchLaterVideos

}

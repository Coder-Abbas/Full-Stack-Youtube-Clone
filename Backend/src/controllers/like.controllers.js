import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.models.js"
import { APIError } from "../utils/APIError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Like } from "../models/like.models.js"
import { Comment } from "../models/comment.models.js"
import { Tweet } from "../models/tweet.models.js"



const toggleVideoLike = asyncHandler(async (req, res) => {

    //1. get the video id
    const { videoId } = req.params;

    //2. validate the video id
    if (!isValidObjectId(videoId)) {
        throw new APIError(401, "Invalid video id");
    }

    //3. get the authenticated User id
    const userId = req.user._id;

    //4. check if the video exists
    const video = await Video.findById(videoId);
    if (!video) {
        throw new APIError(404, "Video not found")
    }


    //5. check if the user has already liked the video
    const existingLikes = await Like.find({
        video: videoId,
        likedBy: userId
    }).sort({ createdAt: 1 });

    //let a like for true or false
    let like = false;

    if (existingLikes.length > 0) {
        // remove every duplicate like record for this user/video pair
        await Like.deleteMany({
            video: videoId,
            likedBy: userId
        });
        like = false;
    } else {
        //if the user has not liked the video, add a like
        await Like.create({
            video: videoId,
            likedBy: userId
        })
        like = true;
    }

    //6. update the likesCount in the video document
    const likeCount = await Like.countDocuments({ video: videoId });
    await Video.findByIdAndUpdate(videoId, { likesCount: likeCount }, { new: true });


    //7. send response
    return res.status(200)
        .json(
            new ApiResponse(200, { like }, "Video like toggled successfully")
        )


})



const toggleCommentLike = asyncHandler(async (req, res) => {

    //1. get the comment id
    const { commentId } = req.params;

    //2. validate the comment id
    if (!isValidObjectId(commentId)) {
        throw new APIError(400, "Invalid comment id")
    }

    //3. get the authenticated User id
    const userId = req.user?._id;


    //4. check if the video exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new APIError(404, "Comment not found")
    }


    //5. check if the user has already liked the video
    const existingLikes = await Like.find({
        comment: commentId,
        likedBy: userId
    }).sort({ createdAt: 1 });

    //let a like for true or false
    let like = false;

    if (existingLikes.length > 0) {
        // remove every duplicate like record for this user/comment pair
        await Like.deleteMany({
            comment: commentId,
            likedBy: userId
        });
        like = false;
    } else {
        //if the user has not liked the video, add a like
        await Like.create({
            comment: commentId,
            likedBy: userId
        })
        like = true;
    }


    //6. count the likes
    const LikeCount = await Like.countDocuments({ comment: commentId });
    await Comment.findByIdAndUpdate(commentId, { commentLikesCount: LikeCount }, { new: true });

    //7. send response
    return res.status(200)
        .json(
            new ApiResponse(200, { like }, "comment like toggled successfully")
        )


})



const toggleTweetLike = asyncHandler(async (req, res) => {

    //1. get the comment id
    const { tweetId } = req.params;

    //2. validate the comment id
    if (!isValidObjectId(tweetId)) {
        throw new APIError(400, "Invalid Tweet id")
    }

    //3. get the authenticated User id
    const userId = req.user._id;

    //4. check if the video exists
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new APIError(404, "Tweet not found")
    }


    //5. check if the user has already liked the video
    const existingLikes = await Like.find({
        tweet: tweetId,
        likedBy: userId
    }).sort({ createdAt: 1 });

    //let a like for true or false
    let like = false;

    if (existingLikes.length > 0) {
        // remove every duplicate like record for this user/tweet pair
        await Like.deleteMany({
            tweet: tweetId,
            likedBy: userId
        });
        like = false;
    } else {
        //if the user has not liked the video, add a like
        await Like.create({
            tweet: tweetId,
            likedBy: userId
        })
        like = true;
    }


    //6. count the likes
    const LikeCount = await Like.countDocuments({ tweet: tweetId });

    //save in db
    await Tweet.findByIdAndUpdate(tweetId, { likeCount: LikeCount }, { new: true });

    //7. send response
    return res.status(200)
        .json(
            new ApiResponse(200, { likeCount: LikeCount, like }, "Tweet like toggled successfully")
        )


})



const getLikeVideos = asyncHandler(async (req, res) => {
    //1. get the user id
    const userId = req.user._id;

    //2. get the liked videos
    const likedVideos = await Like.find(
        {
            likedBy: userId,
        }).populate({
            path: "video",
            populate: {
                path: "owner",
                select: "username avatar fullName"
            }
        })
        .sort({ createdAt: -1 })


    //validate
    if (!likedVideos) {
        throw new APIError(404, "No liked videos found")
    }

    if (likedVideos.length === 0) {
        return res.status(200)
            .json(
                new ApiResponse(200, [], "No liked videos found")
            )
    }

    //return response
    return res.status(200)
        .json(
            new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
        )
})



export {
    toggleVideoLike,
    toggleTweetLike,
    toggleCommentLike,
    getLikeVideos
}
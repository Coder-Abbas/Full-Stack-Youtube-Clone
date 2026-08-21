import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.models.js"
import { APIError } from "../utils/APIError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Like } from "../models/like.models.js"
import { Comment } from "../models/comment.models.js"




const addComment = asyncHandler(async (req, res) => {

    //1. get the video id from params
    const { videoId } = req.params;

    //2. validate video id
    if (!isValidObjectId(videoId)) {
        throw new APIError(400, "Invalid video id");
    }

    //3. get authenticated user id
    const userId = req.user?._id;

    //validate user id
    if (!isValidObjectId(userId)) {
        throw new APIError(400, "Invalid user id");
    }

    //5. get the comment content from request body
    const content = req.body?.content;

    //6. validate comment content
    if (!content || content.trim().length === 0) {
        throw new APIError(400, "Comment content is required");
    }

    //7. check video exists
    const video = await Video.findById(videoId);

    if (!video) {
        throw new APIError(404, "Video not found");
    }

    //8. create comment
    const comment = await Comment.create(
        {
            content: content,
            owner: userId,
            video: videoId
        }
    );
    await comment.populate("owner", "fullName avatar");

    //return response
    return res.status(201)
        .json(
            new ApiResponse(201, comment, "Comment added successfully")
        )
})

const updateComment = asyncHandler(async (req, res) => {
    //1. get the comment id
    const { commentId } = req.params;

    //validate
    if (!isValidObjectId(commentId)) {
        throw new APIError(400, "Invalid comment id");
    }

    //2. get the authenticated user id
    const userId = req.user?._id;
    if (!isValidObjectId(userId)) {
        throw new APIError(400, "Invalid user id");
    }

    //3. get the comment content from request body
    const content = req.body?.content;

    //4. validate comment content
    if (!content || content.trim().length === 0) {
        throw new APIError(400, "Comment content is required");
    }

    //5. update the comment
    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            content: content
        },
        { new: true }
    );

    if (!comment) {
        throw new APIError(404, "Comment not found");
    }

    //6. return response
    return res.status(200)
        .json(
            new ApiResponse(200, comment, "Comment updated successfully")
        )

})


const getTotalCommentsOfVideo = asyncHandler(async (req, res) => {
    //1. get the video id from params
    const { videoId } = req.params;
    //2. validate video id
    if (!isValidObjectId(videoId)) {
        throw new APIError(400, "Invalid video id");
    }

    //3. check video exists
    const video = await Video.findById(videoId);
    if (!video) {
        throw new APIError(404, "Video not found");
    }

    //4. get the total comments of the video
    const totalComments = await Comment.countDocuments({ video: videoId });

    //5. send response
    return res.status(200)
        .json(
            new ApiResponse(200, { totalComments }, "Total comments fetched successfully")
        )
})

const deleteComment = asyncHandler(async (req, res) => {

    //1. get the comment id
    const { commentId } = req.params;
    if (!isValidObjectId(commentId)) {
        throw new APIError(400, "Invalid comment id");
    }

    //2. get the authenticated user id
    const userId = req.user?._id;
    if (!isValidObjectId(userId)) {
        throw new APIError(400, "Invalid user id");
    }


    //3. check if the comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new APIError(404, "Comment not found");
    }

    if (userId.toString() !== comment.owner.toString()) {
        throw new APIError(403, "You are not authorized to delete this comment");
    }

    //delete the comment. 
    await Comment.findByIdAndDelete(commentId);
    await Like.deleteMany({ comment: commentId });

    //return response
    return res.status(200)
        .json(
            new ApiResponse(200, null, "Comment deleted successfully")
        )
})

export {
    addComment,
    updateComment,
    deleteComment,
    getTotalCommentsOfVideo

}
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { APIError } from "../utils/APIError.js";
import { User } from "../models/users.models.js"
import { uploadOnCloudinary } from "../utils/Cloudinary.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { Video } from "../models/video.models.js";
import cloudinary from "cloudinary";

const deletepicold = async (imageUrl) => {
    try {
        const publicId = imageUrl
            .split("/")
            .pop()
            .split(".")[0];

        console.log("Image Public ID:", publicId);

        await cloudinary.uploader.destroy(publicId);

    } catch (error) {
        console.error(
            "Error deleting old image from Cloudinary:",
            error
        );
    }
};

const deleteOldVideo = async (videoUrl) => {
    try {
        const publicId = videoUrl
            .split("/")
            .pop()
            .split(".")[0];

        console.log("Video Public ID:", publicId);

        await cloudinary.uploader.destroy(publicId, {
            resource_type: "video"
        });

    } catch (error) {
        console.error(
            "Error deleting old video from Cloudinary:",
            error
        );
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


const getAllPublishedVideos = asyncHandler(async (req, res) => {
    //1. for pagination get the info
    const { page, limit } = req.query;

    //2. validation
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;

    //3. calculate skip
    const skip = (pageNumber - 1) * limitNumber;

    //4. get the videos from db
    const videos = await Video
        .find({ isPublished: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)


    //5. count publish video
    const totalVideos = await Video.countDocuments({ isPublished: true });

    //6. calculate total pages
    const totalPages = Math.ceil(totalVideos / limitNumber);

    //7. return the response
    return res.status(200)
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
                        hasNextPage: pageNumber < totalPages,
                        hasPrevPage: pageNumber > 1
                    }
                },
                "Published videos fetched successfully"
            )
        )

})


const getSelectedVideo = asyncHandler(async (req, res) => {
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
    //5. return video
    return res.status(200)
        .json(
            new ApiResponse(200, video, "Video fetched successfully")
        )
})


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
export {
    uploadvideo,
    isPublished,
    getAllPublishedVideos,
    getSelectedVideo,
    deleteVideo,
    updateVideo,
    getViews
}
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { isValidObjectId } from "mongoose";
import mongoose from "mongoose";
import { PlayList } from "../models/playlist.models.js";
import { Video } from "../models/video.models.js";
import { User } from "../models/users.models.js";

// ==========================================
// Create a playlist
// POST /api/v1/playlists
// ==========================================

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description, isPublic } = req.body;

    if (!name || !name.trim()) {
        throw new APIError(400, "Playlist name is required");
    }

    const playlist = await PlayList.create({
        name: name.trim(),
        description: description?.trim() || "",
        isPublic: isPublic === undefined ? true : Boolean(isPublic),
        createdBy: req.user._id,
    });

    return res
        .status(201)
        .json(
            new ApiResponse(201, playlist, "Playlist created successfully")
        );
});

// ==========================================
// Get current user's playlists
// GET /api/v1/playlists
// ==========================================

const getUserPlaylists = asyncHandler(async (req, res) => {
    const playlists = await PlayList.find({ createdBy: req.user._id })
        .populate("videos", "thumbnail title duration")
        .sort({ updatedAt: -1 });

    const data = playlists.map((p) => ({
        ...p.toObject(),
        totalVideos: p.videos?.length || 0,
    }));

    return res
        .status(200)
        .json(
            new ApiResponse(200, data, "Playlists fetched successfully")
        );
});

// ==========================================
// Get a single playlist (with populated videos)
// GET /api/v1/playlists/:playlistId
// ==========================================

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
        throw new APIError(400, "Invalid playlist id");
    }

    const playlist = await PlayList.findById(playlistId)
        .populate("createdBy", "username fullName avatar")
        .populate({
            path: "videos",
            populate: {
                path: "owner",
                select: "username fullName avatar",
            },
        });

    if (!playlist) {
        throw new APIError(404, "Playlist not found");
    }

    // Only the owner can view a private playlist
    if (
        !playlist.isPublic &&
        playlist.createdBy?._id?.toString() !== req.user?._id?.toString()
    ) {
        throw new APIError(403, "This playlist is private");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "Playlist fetched successfully")
        );
});

// ==========================================
// Update playlist details
// PATCH /api/v1/playlists/:playlistId
// ==========================================

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
        throw new APIError(400, "Invalid playlist id");
    }

    const playlist = await PlayList.findById(playlistId);

    if (!playlist) {
        throw new APIError(404, "Playlist not found");
    }

    if (playlist.createdBy.toString() !== req.user._id.toString()) {
        throw new APIError(403, "You are not authorized to update this playlist");
    }

    const { name, description, isPublic } = req.body;

    if (name !== undefined) playlist.name = name.trim();
    if (description !== undefined) playlist.description = description;
    if (isPublic !== undefined) playlist.isPublic = Boolean(isPublic);

    await playlist.save();

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist updated successfully"));
});

// ==========================================
// Add a video to a playlist
// PATCH /api/v1/playlists/:playlistId/add/:videoId
// ==========================================

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new APIError(400, "Invalid playlist or video id");
    }

    const playlist = await PlayList.findById(playlistId);

    if (!playlist) {
        throw new APIError(404, "Playlist not found");
    }

    if (playlist.createdBy.toString() !== req.user._id.toString()) {
        throw new APIError(403, "You are not authorized to modify this playlist");
    }

    const alreadyIn = playlist.videos.some(
        (id) => id.toString() === videoId
    );

    if (alreadyIn) {
        return res
            .status(200)
            .json(
                new ApiResponse(200, playlist, "Video is already in the playlist")
            );
    }

    playlist.videos.push(videoId);

    // Derive a thumbnail from the first video when none is set
    if (!playlist.thumbnail) {
        const video = await Video.findById(videoId).select("thumbnail");
        if (video?.thumbnail) playlist.thumbnail = video.thumbnail;
    }

    await playlist.save();

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Video added to playlist"));
});

// ==========================================
// Remove a video from a playlist
// PATCH /api/v1/playlists/:playlistId/remove/:videoId
// ==========================================

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new APIError(400, "Invalid playlist or video id");
    }

    const playlist = await PlayList.findById(playlistId);

    if (!playlist) {
        throw new APIError(404, "Playlist not found");
    }

    if (playlist.createdBy.toString() !== req.user._id.toString()) {
        throw new APIError(403, "You are not authorized to modify this playlist");
    }

    const removed = playlist.videos.find(
        (id) => id.toString() === videoId
    );

    playlist.videos = playlist.videos.filter(
        (id) => id.toString() !== videoId
    );

    // Refresh the thumbnail if the removed video was the source
    if (removed && playlist.thumbnail) {
        const firstVideo = await Video.findById(playlist.videos[0]).select(
            "thumbnail"
        );
        playlist.thumbnail = firstVideo?.thumbnail || "";
    }

    await playlist.save();

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Video removed from playlist"));
});

// ==========================================
// Delete a playlist
// DELETE /api/v1/playlists/:playlistId
// ==========================================

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
        throw new APIError(400, "Invalid playlist id");
    }

    const playlist = await PlayList.findById(playlistId);

    if (!playlist) {
        throw new APIError(404, "Playlist not found");
    }

    if (playlist.createdBy.toString() !== req.user._id.toString()) {
        throw new APIError(403, "You are not authorized to delete this playlist");
    }

    await playlist.deleteOne();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});

// ==========================================
// Random public playlists (homepage)
// GET /api/v1/playlists/random?limit=10
// ==========================================

const getRandomPlaylists = asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 10, 20);

    const playlists = await PlayList.aggregate([
        { $match: { isPublic: true } },
        { $sample: { size: limit } },
        {
            $lookup: {
                from: "users",
                localField: "createdBy",
                foreignField: "_id",
                as: "createdBy",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                createdBy: { $arrayElemAt: ["$createdBy", 0] },
                totalVideos: { $size: "$videos" },
                hasVideos: { $gt: [{ $size: "$videos" }, 0] },
            },
        },
        // Prefer playlists that actually contain videos
        { $sort: { hasVideos: -1, updatedAt: -1 } },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlists, "Random playlists fetched successfully")
        );
});

// ==========================================
// Recommended playlists (content-based)
// Suggests public playlists from the SAME creator
// as the currently watched video, surfacing those
// that already include the video first.
// GET /api/v1/playlists/recommended?videoId=...
// ==========================================

const getRecommendedPlaylists = asyncHandler(async (req, res) => {
    const { videoId } = req.query;

    if (!isValidObjectId(videoId)) {
        throw new APIError(400, "Invalid video id");
    }

    const video = await Video.findById(videoId).select("owner");

    if (!video) {
        throw new APIError(404, "Video not found");
    }

    const playlists = await PlayList.aggregate([
        {
            $match: {
                isPublic: true,
                createdBy: video.owner,
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "createdBy",
                foreignField: "_id",
                as: "createdBy",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                createdBy: { $arrayElemAt: ["$createdBy", 0] },
                totalVideos: { $size: "$videos" },
                containsVideo: {
                    $in: [
                        new mongoose.Types.ObjectId(videoId),
                        "$videos",
                    ],
                },
            },
        },
        // Playlists that include the current video rank first
        { $sort: { containsVideo: -1, updatedAt: -1 } },
        { $limit: 5 },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlists,
                "Recommended playlists fetched successfully"
            )
        );
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    updatePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    getRandomPlaylists,
    getRecommendedPlaylists,
};

import { Router } from "express";
import { verifyJWT, optionalVerifyJWT } from "../middlewares/auth.middlewares.js";
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    updatePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    getRandomPlaylists,
    getRecommendedPlaylists,
} from "../controllers/playlist.controllers.js";

const router = Router();

// Create + list current user's playlists
router.route("/").post(verifyJWT, createPlaylist).get(verifyJWT, getUserPlaylists);

// Public discovery endpoints (must be declared BEFORE /:playlistId)
router.route("/random").get(optionalVerifyJWT, getRandomPlaylists);
router
    .route("/recommended")
    .get(optionalVerifyJWT, getRecommendedPlaylists);

// Single playlist (must be declared BEFORE the add/remove sub-routes
// so the static "/random" and "/recommended" above still win)
router
    .route("/:playlistId")
    .get(optionalVerifyJWT, getPlaylistById)
    .patch(verifyJWT, updatePlaylist)
    .delete(verifyJWT, deletePlaylist);

// Add / remove a video
router
    .route("/:playlistId/add/:videoId")
    .patch(verifyJWT, addVideoToPlaylist);
router
    .route("/:playlistId/remove/:videoId")
    .patch(verifyJWT, removeVideoFromPlaylist);

export default router;

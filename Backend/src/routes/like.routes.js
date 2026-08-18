import {Router} from "express";
import {verifyJWT} from "../middlewares/auth.middlewares.js";
import {
    toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikeVideos} from "../controllers/like.controllers.js";




const router = Router();


router.route("/:videoId/like").post(verifyJWT, toggleVideoLike);
router.route("/:tweetId/like").post(verifyJWT, toggleTweetLike);
router.route("/:commentId/Commentlike").post(verifyJWT, toggleCommentLike);
router.route("/liked-videos").get(verifyJWT, getLikeVideos);






export default router;
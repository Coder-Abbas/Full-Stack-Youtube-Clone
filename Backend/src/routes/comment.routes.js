import {verifyJWT} from "../middlewares/auth.middlewares.js";
import {addComment, updateComment, deleteComment, getTotalCommentsOfVideo} from "../controllers/comment.controllers.js";
import {Router} from "express";



const router = Router();

router.route("/:videoId/Addcomment").post(
    verifyJWT,
    addComment
)

router.route("/:commentId/updatecomment").patch(
    verifyJWT,
    updateComment
)

router.route("/:commentId/deletecomment").delete(
    verifyJWT,
    deleteComment
)

router.route("/:videoId/total-comments").get(
    getTotalCommentsOfVideo
)



export default router;
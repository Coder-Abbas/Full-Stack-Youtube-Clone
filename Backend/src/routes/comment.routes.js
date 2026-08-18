import {verifyJWT} from "../middlewares/auth.middlewares.js";
import {addComment, updateComment, deleteComment} from "../controllers/comment.controllers.js";
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




export default router;
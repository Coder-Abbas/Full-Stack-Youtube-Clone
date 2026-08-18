import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT, optionalVerifyJWT } from "../middlewares/auth.middlewares.js";
import {
    uploadvideo,
    isPublished,
    getAllPublishedVideos,
    getSelectedVideo,
    deleteVideo,
    updateVideo,
    getViews
} from "../controllers/videos.controllers.js";




const router = Router();



router.route("/upload").post(
    verifyJWT,
    upload.fields(
        [
            {
                name: "videoFile",
                maxCount: 1

            },
            {
                name: "thumbnail",
                maxCount: 1
            }
        ]
    ),
    uploadvideo
)

router.route("/toggle/publish/:videoId").patch(
    verifyJWT,
    isPublished
)

router.route("/published").get(
    getAllPublishedVideos
)

router.route("/:videoId").get(
    optionalVerifyJWT,
    getSelectedVideo
)

router.route("/:videoId").delete(
    verifyJWT,
    deleteVideo
)


router.route("/update/:videoId").patch(
    verifyJWT,
    upload.fields(
        [
            {
                name: "videoFile",
                maxCount: 1
            },
            {
                name: "thumbnail",
                maxCount: 1
            }

        ]
    ),
    updateVideo
)


router.route("/:videoId/view").patch(
    getViews
)



export default router;
import { Router } from "express";
import {
    getAdminOverview,
    getAllUsers,
    getUserById,
    deleteUser,
    resetUserPassword,
    getAllVideos,
    getVideoById,
    updateVideoByAdmin,
    deleteVideoByAdmin,
    getAllComments,
    getCommentById,
    updateCommentByAdmin,
    deleteCommentByAdmin,
} from "../controllers/admin.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

// All admin routes require authentication + admin role
router.use(verifyJWT, verifyAdmin);

// Overview
router.get("/overview", getAdminOverview);

// Users
router.get("/users", getAllUsers);
router.get("/users/:userId", getUserById);
router.delete("/users/:userId", deleteUser);
router.patch("/users/:userId/password", resetUserPassword);

// Videos
router.get("/videos", getAllVideos);
router.get("/videos/:videoId", getVideoById);
router.patch("/videos/:videoId", updateVideoByAdmin);
router.delete("/videos/:videoId", deleteVideoByAdmin);

// Comments
router.get("/comments", getAllComments);
router.get("/comments/:commentId", getCommentById);
router.patch("/comments/:commentId", updateCommentByAdmin);
router.delete("/comments/:commentId", deleteCommentByAdmin);

export default router;

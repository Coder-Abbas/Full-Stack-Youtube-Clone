import { Router } from "express";

import {
    getOverviewData,
    getTopVideos,
    getRecentVideos,
    getRecentSubscribers,
    getAnalytics
} from "../controllers/dashboard.controllers.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT);

router.get("/overview", getOverviewData);

router.get("/top-videos", getTopVideos);

router.get("/recent-videos", getRecentVideos);

router.get("/recent-subscribers", getRecentSubscribers);

router.get("/analytics", getAnalytics);

export default router;
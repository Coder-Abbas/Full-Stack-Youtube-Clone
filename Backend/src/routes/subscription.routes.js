import { Router } from "express";
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} from "../controllers/subscription.controllers.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";


const router = Router();


router.route("/:channelId/subscribed").post(
    verifyJWT,
    toggleSubscription
)

router.route("/c/:channelId").get(
    verifyJWT,
    getUserChannelSubscribers
)

router.route("/u/:subscriberId").get(
    verifyJWT,
    getSubscribedChannels
)



export default router;
import { Router } from "express";
import { optionalVerifyJWT } from "../middlewares/auth.middlewares.js";
import { streamEvents } from "../controllers/realtime.controllers.js";

const router = Router();

// SSE endpoint: GET /api/v1/events
router.route("/").get(optionalVerifyJWT, streamEvents);

export default router;

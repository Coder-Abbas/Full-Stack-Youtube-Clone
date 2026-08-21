import { Router } from "express";

import {
    search,
} from "../controllers/search.controllers.js";

const router = Router();

router.get("/", search);

export default router;
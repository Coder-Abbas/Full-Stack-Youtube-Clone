import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import { User } from "../models/users.models.js";

export const verifyAdmin = asyncHandler(async (req, _, next) => {
    const user = req.user;

    if (!user) {
        throw new APIError(401, "Unauthorized access");
    }

    if (user.role !== "admin") {
        throw new APIError(403, "Access denied. Admin privileges required.");
    }

    next();
});

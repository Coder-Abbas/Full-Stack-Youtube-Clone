import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/users.models.js";



//add underscore in parameters because the response is not used in this middleware
export const verifyJWT = asyncHandler(async (req, _, next) => {


    try {

        //Authorizatin: Bearer <token>

        //1. get the token from the request header or cookie
        const token = req.cookies?.accessToken || req.headers("Authorization")?.replace("Bearer ", "");


        //2. if token is not present then throw error
        if (!token) {
            throw APIError(401, "Unauthorized access")
        }

        //3. verify the token

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);


        //4. find the user

        const user = await User.findById(decodedToken._id).select("-password -refreshToken");

        //5. if user not found then throw error
        if (!user) {
            throw new APIError(404, "Invalid token, user not found")
        }

        req.user = user;
        next();




    } catch (error) {
        throw new APIError(401, error.message || "Unauthorized access")
    }

})
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import { User } from "../models/users.models.js"
import { uploadOnCloudinary } from "../utils/Cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

import jwt from "jsonwebtoken";

//request, response, next , error 

const generateAccessAndRefreshTokens = async (userId) => {

    try {

        //1. find the user by id
        const user = await User.findById(userId);


        //because of it is not used because i send the request from where the user exists
        // 2. if user not found then throw error
        if (!user) {
            throw new APIError(404, "User not found")
        }


        //3. add the function form users.models.js to generate access token and refresh token
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()


        //add the refresh token to the user document and save it to the database
        user.refreshToken = refreshToken;
        await user.save(
            {
                validateBeforeSave: false
            });



        //return the access token and refresh token
        return { accessToken, refreshToken };



    } catch (error) {
        throw new APIError(500, error.message || "Error generating tokens");
    }

}


const registerUser = asyncHandler(async (req, res) => {

    //1. get the data from the request body
    const { fullName, email, username, password } = req.body


    //2. validate the data
    if (
        [fullName, email, username, password].some((field) =>
            field?.trim() === "" || field?.trim() === undefined || field?.trim() === null)
    ) {
        throw new APIError(400, "All fields are required")
    }


    //3. check if the user already exists

    const existedUser = await User.findOne(
        {
            $or: [
                { email: email },
                { username: username }
            ]
        }
    )

    if (existedUser) {
        throw new APIError(409, "User already exists")
    }


    //4. check for images in the request files

    //middleware add more requests
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;


    /*
    alternative way

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0) {
    coverImageLocalPath = req.files.coverImage[0].path;
    }

    */


    if (!avatarLocalPath) {
        throw new APIError(400, "Avatar image is required")
    }


    //5. upload to cloudinary


    const avatar = await uploadOnCloudinary(avatarLocalPath);

    const coverImage = coverImageLocalPath
        ? await uploadOnCloudinary(coverImageLocalPath)
        : null;

    //6. check avatar hai ya nahi
    if (!avatar) {
        throw new APIError(400, "Error uploading avatar image")
    }


    //7. add in database entry.
    const user = await User.create(
        {
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            username: username.toLowerCase(),
            password
        }
    )

    //8. remove the password and refresh token from the response
    const createdUser = await User.findByIdAndUpdate(user._id).select(
        "-password -refreshToken"
    )

    //9. check user creation
    if (!createdUser) {
        throw new APIError(500, "something went wrong while creating the user")
    }



    //10. send the response

    return res.status(201).json(
        new ApiResponse(200, "User created successfully", createdUser)
    )

})


const loginUser = asyncHandler(async (req, res) => {


    //1. get the data from the request body
    const { email, username, password } = req.body;

    //2. validate the data
    if (!(email || username)) {
        throw new APIError(400, "Email or username is required")
    }

    //3. check if the user exists by using email or username
    const user = await User.findOne({
        $or: [
            { email: email },
            { username: username }
        ]
    })


    //4. if user not found then throw error
    if (!user) {
        throw new APIError(404, "User not found")
    }


    //5. check if the password is correct
    const isPasswordValid = await user.isPasswordCorrect(password)


    //6. if password is not correct then throw error
    if (!isPasswordValid) {
        throw new APIError(401, "Invalid user password")
    }


    //7. generate access token and refresh token

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    //8. add the details to variable to send in the response
    const loggedInuser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    //return the response


    return res.
        status(200).cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInuser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"

            )
        )


})


const logoutUser = asyncHandler(async (req, res) => {

    //1. cookies clear
    //2. remove the refresh token from the database
    //3. send the response

    //1.find by ID
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }

        },
        {
            new: true
        }
    )


    //add options for cookies
    const options = {
        httpOnly: true,
        secure: true
    }

    //return response

    return res
        .status(200)
        .cookie("accessToken", options)
        .cookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "User logged out successfully"
            )
        )
})



const refreshToken = asyncHandler(async (req, res) => {

    try {


        //1. get the refresh token from the request cookies or body
        const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

        //2. check validation
        if (!incomingRefreshToken) {
            throw new APIError(401, "Refresh token is required")
        }


        //3. verify the refresh token
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)


        //4. find the user by id and refresh token
        const user = await User.findById(decodedToken?._id);

        //5. if user not found then throw error
        if (!user) {
            throw new APIError(401, "invalid refresh token, user not found")
        }

        //6 match the refresh token with the one in the database

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new APIError(401, "Refresh token is Expired or Used, please login again")
        }

        //7. if matched then generate new access token and refresh token

        const options = {
            httpsOnly: true,
            secure: true
        }

        const { accessToken, newrefreshToken } = await generateAccessAndRefreshTokens(user._id)


        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newrefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken: newrefreshToken
                    },
                    "Token refreshed successfully"
                )
            )




    } catch (error) {
        throw new APIError(401, error?.message || "Failed to refresh token")
    }


})






export {
    registerUser,
    loginUser,
    logoutUser,
    refreshToken
}
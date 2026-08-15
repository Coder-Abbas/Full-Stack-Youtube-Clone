import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import { User } from "../models/users.models.js"
import { uploadOnCloudinary } from "../utils/Cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"


//request, response, next , error 

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



export { registerUser }
import {asyncHandler} from "../utils/asyncHandler.js";


//request, response, next , error 

const registerUser = asyncHandler( async (req, res) => {

   res.status(200).json({
        message: "User registered successfully"
    })
})



export {registerUser}
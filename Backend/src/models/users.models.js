import mongoose, {Schema} from 'mongoose';
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"



//bcrypt -> help to convert hash password into normal password and vice versa. It is a library that provides a way to securely hash and verify passwords. It is commonly used in authentication systems to store passwords in a secure manner.
//bcryptjs is a library that allows you to hash passwords and compare them securely. It is commonly used in authentication systems to store passwords in a secure manner.


//difference -> bcrypt is a native Node.js library for hashing passwords, while bcryptjs is a JavaScript implementation that can be used in both Node.js and browser environments.


//JWT -> JSON Web Token is a compact, URL-safe means of representing claims to be transferred between two parties. It is commonly used for authentication and authorization in web applications. JWTs are digitally signed, allowing the recipient to verify the authenticity of the claims contained within the token.




const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true   //field ko searchable banane ke liye index lagaya hai
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true //for searching purpose
        },
        avatar: {
            type: String, //cloudinary url
            required: true,

        },
        coverImage: {
            type: String, //cloudinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video",

            }
        ],
        password: {
            type: String,
            required: [true, "Password is required"],
           // minlength: [6, "Password must be at least 6 characters long"],
            //maxlength: [20, "Password must be at most 20 characters long"],
        },
        refreshToken: {
            type: String,
        }

        


    },
    {
        timestamps: true,
    }
)


userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) {
    
        next(); //if password is not modified then move to next middleware
    }

    this.password = await bcrypt.hash(this.password, 10); //hashing the password before saving it to the database
 
});

userSchema.methods.isPasswordCorrect = async function(password){

    //here check the password is correct or not by comparing the hashed password with the plain password


    return await bcrypt.compare(password, this.password);

}



userSchema.methods.generateAccessToken = function () {

  return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName,


    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRE
    }
)
}


userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id, 
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRE
    }
)
    
}

export const User = mongoose.model("User", userSchema);
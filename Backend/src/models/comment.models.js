import mongoose from "mongoose";


const commentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
            maxlength: 500,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
            required: true,
        },
        commentLikesCount: {
            type: Number,
            default: 0
        }

    },
    {
        timestamps: true,
    }
);


export const Comment = mongoose.model("Comment", commentSchema);

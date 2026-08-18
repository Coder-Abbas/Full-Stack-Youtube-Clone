import mongoose, { Schema } from "mongoose";


const likeSchema = new Schema(
    {
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
        },
        comment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
        },
        tweet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tweet",
        },
        likedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

likeSchema.index(
    { video: 1, likedBy: 1 },
    {
        unique: true,
        sparse: true,
        partialFilterExpression: {
            video: { $type: "objectId" },
            likedBy: { $exists: true },
        },
    }
);

likeSchema.index(
    { comment: 1, likedBy: 1 },
    {
        unique: true,
        sparse: true,
        partialFilterExpression: {
            comment: { $type: "objectId" },
            likedBy: { $exists: true },
        },
    }
);

likeSchema.index(
    { tweet: 1, likedBy: 1 },
    {
        unique: true,
        sparse: true,
        partialFilterExpression: {
            tweet: { $type: "objectId" },
            likedBy: { $exists: true },
        },
    }
);


export const Like = mongoose.model("Like", likeSchema);
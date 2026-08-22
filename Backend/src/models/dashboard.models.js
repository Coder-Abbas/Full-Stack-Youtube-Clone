import mongoose from "mongoose";



const videoAnalyticsSchema = new mongoose.Schema(
    {
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
            required: true
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        date: {
            type: Date,
            required: true
        },

        views: {
            type: Number,
            default: 0
        },

        likes: {
            type: Number,
            default: 0
        },

        comments: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);


export const VideoAnalytics = mongoose.model("VideoAnalytics", videoAnalyticsSchema);
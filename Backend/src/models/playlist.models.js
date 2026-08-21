import mongoose, { Schema } from "mongoose";

const playListSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        thumbnail: {
            // Cloudinary URL derived from the first video.
            // Stored for fast display on cards/grids.
            type: String,
            default: "",
        },
        isPublic: {
            type: Boolean,
            default: true,
        },
        videos: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video",
            },
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

// Virtual: number of videos in the playlist
playListSchema.virtual("totalVideos").get(function () {
    return this.videos?.length || 0;
});

export const PlayList = mongoose.model("PlayList", playListSchema);

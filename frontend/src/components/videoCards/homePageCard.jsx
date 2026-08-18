import React from "react";
import { MoreVertical } from "lucide-react";

const HomePageCard = ({ video }) => {
    return (
        <div
            className="
        group
        w-full
        p-3
        rounded-xl
        cursor-pointer
        transition-all
        duration-200
        hover:bg-gray-200
      "
        >
            {/* ================= Thumbnail ================= */}
            <div className="relative w-full aspect-video overflow-hidden rounded-xl bg-gray-200">
                <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="
            w-full
            h-full
            object-cover
            transition-transform
            duration-300
          "
                />

                {/* Duration */}
                <span
                    className="
            absolute
            bottom-2
            right-2
            bg-black/80
            text-white
            text-xs
            font-medium
            px-1.5
            py-0.5
            rounded-2xl
            flex
            justify-center
            items-center
          "
                >
                    {video.duration}
                </span>
            </div>

            {/* ================= Video Information ================= */}
            <div className="flex gap-3 mt-3">
                {/* Channel Avatar */}
                <div className="flex-shrink-0">
                    <img
                        src={video.channelAvatar}
                        alt={video.channelName}
                        className="
              w-10
              h-10
              rounded-full
              object-cover
              border
              border-gray-200
            "
                    />
                </div>

                {/* Text Information */}
                <div className="flex-1 min-w-0">
                    {/* Title + Menu */}
                    <div className="flex justify-between gap-2">
                        <h3
                            className="
                text-sm
                font-semibold
                text-gray-900
                line-clamp-2
                leading-5
                group-hover:text-black
              "
                        >
                            {video.title}
                        </h3>

                    </div>

                    {/* Channel Name */}
                    <p className="text-sm text-gray-600 mt-1 hover:text-gray-900">
                        {video.channelName}
                    </p>

                    {/* Views + Date */}
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                        <span>{video.views} views</span>
                        <span>•</span>
                        <span>{video.uploadedAt}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePageCard;


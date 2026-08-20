import React from "react";
import { useNavigate } from "react-router-dom";
import useVideoStore from "../../store/videoStore";

const formatViews = (views = 0) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return `${views}`;
};

const formatDuration = (seconds = 0) => {
    const total = Math.floor(seconds);
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const RecommendedVideoCard = ({ video }) => {

    const navigate = useNavigate();
    const openSelectedVideo = useVideoStore((state) => state.openSelectedVideo);

    if (!video) return null;

    const handleClick = () => {
        // Same handoff HomePageCard does: set the store's
        // selectedVideoId (and the sessionStorage fallback the
        // watch page checks on mount/refresh) BEFORE navigating,
        // so SelectVideo actually fetches this video instead of
        // re-rendering with the previous one still selected.
        openSelectedVideo(video._id);
        sessionStorage.setItem("selectedVideoId", video._id);

        navigate(`/watch/`);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className="
                flex
                gap-3
                w-full
                text-left
                rounded-xl
                p-1.5
                -m-1.5
                cursor-pointer
                transition
                duration-200
                hover:bg-gray-100
                group
            "
        >

            <div className="relative w-40 h-24 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="
                        w-full
                        h-full
                        object-cover
                        transition
                        duration-300
                        group-hover:scale-105
                    "
                />

                {video.duration != null && (
                    <span
                        className="
                            absolute
                            bottom-1
                            right-1
                            bg-black/80
                            text-white
                            text-[11px]
                            font-medium
                            px-1.5
                            py-0.5
                            rounded
                        "
                    >
                        {formatDuration(video.duration)}
                    </span>
                )}
            </div>

            <div className="flex-1 min-w-0">

                <h3
                    className="
                        text-sm
                        font-medium
                        text-gray-900
                        line-clamp-2
                        transition
                        duration-200
                        group-hover:text-black
                    "
                >
                    {video.title}
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                    {video.owner?.fullName}
                </p>

                <p className="text-xs text-gray-400">
                    {formatViews(video.views)} views
                </p>

            </div>

        </button>
    );
};

export default RecommendedVideoCard;
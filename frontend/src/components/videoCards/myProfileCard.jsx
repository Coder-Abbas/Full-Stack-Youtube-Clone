import React from "react";
import { useNavigate } from "react-router-dom";
import useVideoStore from "../../store/videoStore";
import axiosInstance from "../../api/axiosInstance";

const HomePageCard = ({ video }) => {
    const navigate = useNavigate();
    const openSelectedVideo = useVideoStore(
        (state) => state.openSelectedVideo
    );

    const handleOpenVideo = () => {
        openSelectedVideo(video._id);
        axiosInstance.patch(`/videos/${video._id}/view`).catch(() => { });
        navigate("/watch");
    };

    // =========================
    // Format Video Duration
    // =========================
    const formatDuration = (seconds) => {

        if (!seconds || seconds < 0) {
            return "0:00";
        }

        const totalSeconds = Math.floor(seconds);

        const hours = Math.floor(totalSeconds / 3600);

        const minutes = Math.floor(
            (totalSeconds % 3600) / 60
        );

        const remainingSeconds = totalSeconds % 60;

        // If video is longer than 1 hour
        if (hours > 0) {
            return `${hours}:${minutes
                .toString()
                .padStart(2, "0")}:${remainingSeconds
                    .toString()
                    .padStart(2, "0")}`;
        }

        // Normal video
        return `${minutes}:${remainingSeconds
            .toString()
            .padStart(2, "0")}`;
    };


    // =========================
    // Format Upload Date
    // =========================
    const formatUploadDate = (date) => {

        if (!date) {
            return "";
        }

        const uploadDate = new Date(date);
        const now = new Date();

        const difference =
            now.getTime() - uploadDate.getTime();

        const seconds = Math.floor(
            difference / 1000
        );

        const minutes = Math.floor(
            seconds / 60
        );

        const hours = Math.floor(
            minutes / 60
        );

        const days = Math.floor(
            hours / 24
        );

        const weeks = Math.floor(
            days / 7
        );

        const months = Math.floor(
            days / 30
        );

        const years = Math.floor(
            days / 365
        );


        if (seconds < 60) {
            return "just now";
        }

        if (minutes < 60) {
            return `${minutes} ${minutes === 1 ? "minute" : "minutes"
                } ago`;
        }

        if (hours < 24) {
            return `${hours} ${hours === 1 ? "hour" : "hours"
                } ago`;
        }

        if (days < 7) {
            return `${days} ${days === 1 ? "day" : "days"
                } ago`;
        }

        if (weeks < 5) {
            return `${weeks} ${weeks === 1 ? "week" : "weeks"
                } ago`;
        }

        if (months < 12) {
            return `${months} ${months === 1 ? "month" : "months"
                } ago`;
        }

        return `${years} ${years === 1 ? "year" : "years"
            } ago`;
    };


    return (
        <div className="group w-full rounded-2xl cursor-pointer text-left transition duration-200 p-3 hover:bg-gray-200">
            <div className="w-full">
                {/* Thumbnail - click to open video */}
                <button
                    type="button"
                    onClick={handleOpenVideo}
                    className="block cursor-pointer w-full"
                >
                    <div className="relative w-full aspect-video overflow-hidden rounded-2xl bg-gray-200">
                        <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="h-full w-full object-cover transition duration-300"
                        />

                        <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-1.5 py-0.5 text-[11px] font-medium text-white">
                            {formatDuration(video.duration)}
                        </span>
                    </div>
                </button>

                {/* Info row */}
                <div className="mt-3 flex gap-3">
                   

                    <div className="min-w-0 pl-2 flex-1">
                        {/* Title - click to open video */}
                        <button
                            type="button"
                            onClick={handleOpenVideo}
                            className="block cursor-pointer w-full text-left"
                        >
                            <h3 className="line-clamp-2 text-[15px] font-medium leading-5 text-gray-900">
                                {video.title}
                            </h3>
                        </button>

                        {/* Channel name - click to open channel */}
                        

                        <div className="mt-1 pl-1 flex flex-wrap items-center gap-1 text-xs text-gray-500 ">
                            <span>{video.views} views</span>
                            <span>•</span>
                            <span>{formatUploadDate(video.createdAt)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePageCard;
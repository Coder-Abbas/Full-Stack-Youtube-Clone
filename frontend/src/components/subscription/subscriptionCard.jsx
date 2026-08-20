import React from "react";
import { Link } from "react-router-dom";

const SubscriptionChannelCard = ({ channel }) => {
    if (!channel) return null;

    return (
        <div className="flex flex-col items-center text-center w-30 mt-5 ml-3">
            <Link
                to={`/channel/${channel.username}`}
                className="
                    flex
                    flex-col
                items-center
                text-center
                w-20
                group
            "
        >
            <img
                src={channel?.avatar || "/default-avatar.jpg"}
                alt={channel?.fullName || "Channel"}
                className="
                    w-17
                    h-17
                    rounded-full
                    object-cover
                    mb-1.5
                    ring-1
                    ring-gray-200
                    group-hover:ring-2
                    group-hover:ring-gray-300
                    transition-all
                    duration-200
                "
            />

            <h3
                className="
                    w-full
                    text-sm
                    font-medium
                    text-gray-800
                    group-hover:text-black
                    transition-colors
                    duration-200
                "
                title={channel?.fullName}
            >
                {channel?.fullName}
            </h3>
        </Link>
        </div>
    );
};

export default SubscriptionChannelCard;
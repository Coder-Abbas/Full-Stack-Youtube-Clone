import React from "react";
import { Link } from "react-router-dom";

const SubscriptionChannelCard = ({ channel, onToggleSubscription }) => {

    if (!channel) return null;

    return (
        <div
            className="
                flex
                flex-col
                items-center
                text-center
                p-5
                border
                border-gray-100
                rounded-xl
                hover:shadow-md
                transition
                duration-200
            "
        >

            <Link to={`/channel/${channel.username}`}>
                <img
                    src={
                        channel.avatar ||
                        "/default-avatar.png"
                    }
                    alt={channel.fullName}
                    className="
                        w-20
                        h-20
                        rounded-full
                        object-cover
                        mb-3
                    "
                />
            </Link>

            <Link to={`/channel/${channel.username}`}>
                <h3
                    className="
                        font-semibold
                        text-gray-900
                        hover:underline
                    "
                >
                    {channel.fullName}
                </h3>
            </Link>

            <p className="text-sm text-gray-500 mb-1">
                @{channel.username}
            </p>

            <p className="text-xs text-gray-400 mb-4">
                {channel.subscribersCount ?? 0}{" "}
                {channel.subscribersCount === 1
                    ? "subscriber"
                    : "subscribers"}
            </p>

            <button
                type="button"
                onClick={() =>
                    onToggleSubscription(channel._id)
                }
                className="
                    px-4
                    py-1.5
                    text-sm
                    font-medium
                    rounded-full
                    bg-gray-900
                    text-white
                    hover:bg-gray-700
                    transition
                    cursor-pointer
                "
            >
                Subscribed
            </button>

        </div>
    );
};

export default SubscriptionChannelCard;
import React from "react";
import { Link } from "react-router-dom";
import searchStore from "../store/searchStore";

const ChannelCard = ({ channel }) => {
    const { setSelectedChannel } = searchStore();

    return (
        <Link
            to={`/channel/${channel.username}`}
            onClick={() => setSelectedChannel(channel)}
            className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
            {/* Avatar */}
            <img
                src={channel.avatar}
                alt={channel.username}
                className="w-20 h-20 rounded-full object-cover"
            />

            {/* Channel Info */}
            <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {channel.fullName || channel.username}
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                    @{channel.username}
                </p>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {channel.subscriberCount || 0} subscribers
                </p>
            </div>
        </Link>
    );
};

export default ChannelCard;

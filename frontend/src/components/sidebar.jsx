import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Home,
    ThumbsUp,
    History,
    User,
    PlaySquare,
    Clock,
    ListVideo,
    ChevronRight,
} from "lucide-react";

const Sidebar = ({ isSidebarOpen }) => {

    const location = useLocation();

    const menuItems = [
        {
            name: "Home",
            path: "/",
            icon: Home,
        },
        {
            name: "Liked Videos",
            path: "/liked-videos",
            icon: ThumbsUp,
        },
        {
            name: "Subscriptions",
            path: "/subscriptions",
            icon: PlaySquare,
        },
        {
            name: "Watch History",
            path: "/watch-history",
            icon: History,
        },
        {
            name: "Profile",
            path: "/profile",
            icon: User,
        },
    ];

    return (
        <aside
            className={`
                h-screen
                flex-shrink-0
                bg-white
                border-r
                border-gray-200
                transition-all
                duration-300
                ease-in-out
                ${isSidebarOpen ? "w-58" : "w-20"}
            `}
        >

            <div className="h-full overflow-y-auto px-3 py-4">

                {/* Main Menu */}
                <div className="space-y-1">

                    {menuItems.map((item) => {

                        const Icon = item.icon;

                        const isActive =
                            location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`
                                    group
                                    flex
                                    items-center
                                    ${isSidebarOpen ? "gap-5 px-4" : "justify-center px-2"}
                                    py-3
                                    rounded-xl
                                    cursor-pointer
                                    transition-all
                                    duration-200

                                    ${isActive
                                        ? "bg-gray-100 text-black font-semibold"
                                        : "text-gray-700 hover:bg-gray-100 hover:text-black"
                                    }
                                `}
                            >

                                <Icon
                                    size={22}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className="
                                        flex-shrink-0
                                        transition-transform
                                        duration-200
                                        group-hover:scale-110
                                    "
                                />

                                {/* Text */}
                                {isSidebarOpen && (
                                    <span className="text-sm whitespace-nowrap">
                                        {item.name}
                                    </span>
                                )}

                            </Link>
                        );
                    })}

                </div>

                {/* Divider */}
                <div className="my-4 border-t border-gray-200"></div>


                {/* Secondary Menu */}
                <div className="space-y-1">

                    <Link
                        to="/playlists"
                        className={`
                            group
                            flex
                            items-center
                            ${isSidebarOpen ? "gap-5 px-4" : "justify-center px-2"}
                            py-3
                            rounded-xl
                            text-gray-700
                            hover:bg-gray-100
                            hover:text-black
                            cursor-pointer
                            transition-all
                            duration-200
                        `}
                    >

                        <ListVideo
                            size={22}
                            className="
                                flex-shrink-0
                                transition-transform
                                duration-200
                                group-hover:scale-110
                            "
                        />

                        {isSidebarOpen && (
                            <span className="text-sm whitespace-nowrap">
                                Playlists
                            </span>
                        )}

                    </Link>

                    <Link
                        to="/watch-later"
                        className={`
                            group
                            flex
                            items-center
                            ${isSidebarOpen ? "gap-5 px-4" : "justify-center px-2"}
                            py-3
                            rounded-xl
                            text-gray-700
                            hover:bg-gray-100
                            hover:text-black
                            cursor-pointer
                            transition-all
                            duration-200
                        `}
                    >

                        <Clock
                            size={22}
                            className="
                                flex-shrink-0
                                transition-transform
                                duration-200
                                group-hover:scale-110
                            "
                        />

                        {isSidebarOpen && (
                            <span className="text-sm whitespace-nowrap">
                                Watch Later
                            </span>
                        )}

                    </Link>

                </div>

            </div>

        </aside>
    );
};

export default Sidebar;
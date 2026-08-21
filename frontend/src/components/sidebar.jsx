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
    Settings,
    LogIn,
} from "lucide-react";

import useAuthStore from "../store/authStore";

const Sidebar = ({ isSidebarOpen }) => {
    const location = useLocation();

    const { authUser, isCheckingAuth } = useAuthStore();

    // ==========================================
    // Main menu for logged-in users
    // ==========================================

    const authenticatedMenuItems = [
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
            path: "/subscription",
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

    // ==========================================
    // Secondary menu
    // ==========================================

    const secondaryMenuItems = [
        {
            name: "Playlists",
            path: "/playlists",
            icon: ListVideo,
        },
        {
            name: "Watch Later",
            path: "/watch-later",
            icon: Clock,
        },
    ];

    // ==========================================
    // Check active route
    // ==========================================

    const isActiveRoute = (path) => {
        if (path === "/") {
            return location.pathname === "/";
        }

        return location.pathname === path;
    };

    // ==========================================
    // Menu item component
    // ==========================================

    const MenuItem = ({ item }) => {
        const Icon = item.icon;
        const isActive = isActiveRoute(item.path);

        return (
            <Link
                to={item.path}
                className={`
                    group
                    flex
                    items-center
                    ${isSidebarOpen
                        ? "gap-5 px-9"
                        : "justify-center px-3"
                    }
                    py-3
                    rounded-xl
                    cursor-pointer
                    transition-all
                    duration-200

                    ${
                        isActive
                            ? "bg-gray-100 text-black font-semibold"
                            : "text-gray-700 hover:bg-gray-100 hover:text-black"
                    }
                `}
            >
                <Icon
                    size={22}
                    className="
                        flex shrink-0
                        transition-transform
                    "
                />

                {isSidebarOpen && (
                    <span className="text-sm whitespace-nowrap">
                        {item.name}
                    </span>
                )}
            </Link>
        );
    };

 

    return (
        <aside
            className={`
                h-full
                flex shrink-0
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

                {/* ==========================================
                    HOME
                ========================================== */}

                <div className="space-y-1">

                    <MenuItem
                        item={{
                            name: "Home",
                            path: "/",
                            icon: Home,
                        }}
                    />

                </div>

                {/* ==========================================
                    AUTHENTICATED USER MENU
                ========================================== */}

                {authUser && (
                    <>
                        {/* Main Menu */}

                        <div className="mt-2 space-y-1">

                            {authenticatedMenuItems
                                .filter((item) => item.path !== "/")
                                .map((item) => (
                                    <MenuItem
                                        key={item.path}
                                        item={item}
                                    />
                                ))}
                        </div>

                        {/* Divider */}

                        <div className="my-4 border-t border-gray-200" />

                        {/* Secondary Menu */}

                        <div className="space-y-1">

                            {secondaryMenuItems.map((item) => (
                                <MenuItem
                                    key={item.path}
                                    item={item}
                                />
                            ))}

                        </div>

                        {/* Divider */}

                        <div className="my-4 border-t border-gray-200" />

                        {/* Settings */}

                        <div className="space-y-1">

                            <MenuItem
                                item={{
                                    name: "Settings",
                                    path: "/settings",
                                    icon: Settings,
                                }}
                            />

                        </div>
                    </>
                )}

                {/* ==========================================
                    NOT LOGGED IN
                ========================================== */}

                {!authUser && (
                    <>
                        {/* Divider */}

                        <div className="my-4 border-t border-gray-200" />

                        {/* Login */}

                        <Link
                            to="/login"
                            className="
                                group
                                flex
                                items-center
                                justify-center
                                gap-3
                                w-full
                                py-2.5
                                px-3
                                rounded-xl
                                border
                                border-blue-500
                                text-blue-500
                                font-medium
                                transition-all
                                duration-200
                                hover:bg-blue-500
                                hover:text-white
                            "
                        >
                            <LogIn
                                size={21}
                                className="
                                    flex shrink-0
                                    transition-transform
                                    duration-200
                                    group-hover:scale-110
                                "
                            />

                            {isSidebarOpen && (
                                <span className="text-sm">
                                    Login
                                </span>
                            )}
                        </Link>
                    </>
                )}

            </div>
        </aside>
    );
};

export default Sidebar;
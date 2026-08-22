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
    LayoutDashboard,
    Shield,
} from "lucide-react";

import useAuthStore from "../store/authStore";

const Sidebar = ({ isSidebarOpen }) => {
    const location = useLocation();

    const { authUser, isCheckingAuth } = useAuthStore();

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
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: LayoutDashboard,
        },
    ];

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

    const isActiveRoute = (path) => {
        if (path === "/") {
            return location.pathname === "/";
        }
        return location.pathname === path;
    };

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
                        ? "gap-5 px-5"
                        : "justify-center px-1"
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
                ${isSidebarOpen ? "w-50" : "w-15"}
            `}
        >
            <div className="h-full overflow-y-auto px-3 py-4">

                {/* Home */}
                <div className="space-y-1">
                    <MenuItem
                        item={{
                            name: "Home",
                            path: "/",
                            icon: Home,
                        }}
                    />
                </div>

                {/* Admin Link */}
                {authUser && authUser.role === "admin" && (
                    <>
                        <div className="my-4 border-t border-gray-200" />
                        <Link
                            to="/admin"
                            className={`
                                group
                                flex
                                items-center
                                ${isSidebarOpen
                                    ? "gap-5 px-5"
                                    : "justify-center px-1"
                                }
                                py-3
                                rounded-xl
                                cursor-pointer
                                transition-all
                                duration-200
                                ${
                                    location.pathname.startsWith("/admin")
                                        ? "bg-red-50 text-red-600 font-semibold"
                                        : "text-red-600 hover:bg-red-50 hover:text-red-700"
                                }
                            `}
                        >
                            <Shield
                                size={22}
                                className="
                                    flex shrink-0
                                    transition-transform
                                "
                            />

                            {isSidebarOpen && (
                                <span className="text-sm whitespace-nowrap">
                                    Admin Panel
                                </span>
                            )}
                        </Link>
                    </>
                )}

                {/* Authenticated User Menu */}
                {authUser && (
                    <>
                        <div className="my-4 border-t border-gray-200" />

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

                        <div className="my-4 border-t border-gray-200" />

                        <div className="space-y-1">
                            {secondaryMenuItems.map((item) => (
                                <MenuItem
                                    key={item.path}
                                    item={item}
                                />
                            ))}
                        </div>

                        <div className="my-4 border-t border-gray-200" />

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

                {/* Not Logged In */}
                {!authUser && (
                    <>
                        <div className="my-4 border-t border-gray-200" />

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
                                cursor-pointer
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
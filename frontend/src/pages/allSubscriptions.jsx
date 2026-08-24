import React, { useEffect, useState } from "react";
import { Users, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../components/navbar/navbar";
import Sidebar from "../components/sidebar";
import LoadingCards from "../components/loadingCards";
import SubscriptionChannelCard from "../components/subscription/subscriptionCard";

import useVideoStore from "../store/videoStore";
import useAuthStore from "../store/authStore";

const AllSubscriptions = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(
        typeof window !== "undefined" ? window.innerWidth >= 750 : false
    );
    const navigate = useNavigate();

    // ==========================================
    // Auth Store
    // ==========================================

    const { authUser, isCheckingAuth } = useAuthStore();

    // ==========================================
    // Video Store
    // ==========================================

    const {
        subscribedChannels,
        isSubscribedChannelsLoading,
        subscribedChannelsError,
        hasFetchedSubscribedChannels,
        getSubscribedChannels,
        toggleChannelSubscription,
        videoPublishedVersion,
    } = useVideoStore();

    // ==========================================
    // Sidebar
    // ==========================================

    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

    // ==========================================
    // Fetch Subscribed Channels
    // (only re-fetch if the list hasn't been
    // loaded yet — e.g. user landed here directly
    // via URL instead of coming from subscription.jsx)
    // ==========================================

    useEffect(() => {
        if (isCheckingAuth) return;
        if (!authUser) return;
        if (hasFetchedSubscribedChannels) return;

        getSubscribedChannels();
    }, [
        authUser,
        isCheckingAuth,
        hasFetchedSubscribedChannels,
        getSubscribedChannels,
        videoPublishedVersion,
    ]);

    const channelList = Array.isArray(subscribedChannels)
        ? subscribedChannels
        : [];

    // ==========================================
    // Not Logged In
    // ==========================================

    if (!isCheckingAuth && !authUser) {
        return (
            <div className="h-screen overflow-hidden bg-gray-50">
                <header className="fixed top-0 left-0 right-0 z-50 h-16">
                    <Navbar toggleSidebar={toggleSidebar} />
                </header>

                <aside
                    className={`
                        fixed
                        left-0
                        top-16
                        bottom-0
                        z-40 max-[750px]:z-[9999]!
                        transition-all
                        duration-300
                        ${isSidebarOpen ? "w-50" : "w-14 sm:w-20"}
                    `}
                >
                    <Sidebar isSidebarOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                </aside>

                <main
                    className={`
                        absolute
                        top-16
                        bottom-0
                        right-0
                        overflow-y-auto
                        transition-all
                        duration-300
                        left-14 sm:left-20 ${isSidebarOpen ? "min-[750px]:left-50!" : ""}
                    `}
                >
                    <div className="flex flex-col items-center justify-center h-full">
                        <Users size={70} className="text-gray-300 mb-4" />
                        <p className="text-gray-700 text-lg mb-4">
                            Please log in to view your subscriptions.
                        </p>
                        <Link
                            to="/login"
                            className="
                                px-6
                                py-2
                                font-medium
                                text-lg
                                border
                                border-blue-500
                                text-blue-500
                                rounded-lg
                                transition
                                duration-300
                                hover:bg-blue-500
                                hover:text-white
                            "
                        >
                            Login
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    // ==========================================
    // Main Page
    // ==========================================

    return (
        <div className="h-screen overflow-hidden bg-gray-50">

            <header className="fixed top-0 left-0 right-0 z-50 h-16">
                <Navbar toggleSidebar={toggleSidebar} />
            </header>

            <aside
                className={`
                    fixed
                    left-0
                    top-16
                    bottom-0
                    z-40 max-[750px]:z-[9999]!
                    transition-all
                    duration-300
                    ${isSidebarOpen ? "w-50" : "w-14 sm:w-20"}
                `}
            >
                <Sidebar isSidebarOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            </aside>

            <main
                className={`
                    absolute
                    top-16
                    bottom-0
                    right-0
                    overflow-y-auto
                    transition-all
                    duration-300
                    left-14 sm:left-20 ${isSidebarOpen ? "min-[750px]:left-50!" : ""}
                `}
            >
                <div className="p-6">

                    <div className="flex items-center gap-3 mb-6">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="
                                p-2
                                rounded-full
                                hover:bg-gray-200
                                transition
                                cursor-pointer
                            "
                        >
                            <ArrowLeft size={20} />
                        </button>

                        <h1 className="text-2xl font-bold text-gray-900">
                            All Subscriptions
                        </h1>

                        {!isSubscribedChannelsLoading && (
                            <span className="text-sm text-gray-500 ml-auto">
                                {channelList.length}{" "}
                                {channelList.length === 1
                                    ? "channel"
                                    : "channels"}
                            </span>
                        )}
                    </div>

                    {isSubscribedChannelsLoading && (
                        <LoadingCards count={12} />
                    )}

                    {!isSubscribedChannelsLoading &&
                        subscribedChannelsError && (
                            <div className="flex flex-col items-center justify-center py-20">
                                <p className="text-red-500 text-center">
                                    {subscribedChannelsError}
                                </p>
                                <button
                                    type="button"
                                    onClick={getSubscribedChannels}
                                    className="
                                        mt-4
                                        px-5
                                        py-2
                                        bg-black
                                        text-white
                                        rounded-lg
                                        hover:bg-gray-800
                                        transition
                                        cursor-pointer
                                    "
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                    {!isSubscribedChannelsLoading &&
                        !subscribedChannelsError &&
                        channelList.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <Users size={80} className="text-gray-300 mb-4" />
                                <h3 className="font-semibold text-xl text-gray-800">
                                    No subscriptions yet
                                </h3>
                                <p className="text-gray-500 mt-2">
                                    Channels you subscribe to will appear here.
                                </p>
                            </div>
                        )}

                    {!isSubscribedChannelsLoading &&
                        !subscribedChannelsError &&
                        channelList.length > 0 && (
                            <div
                                className="
                                    grid
                                    grid-cols-2
                                    sm:grid-cols-3
                                    lg:grid-cols-4
                                    xl:grid-cols-5
                                    gap-4
                                "
                            >
                                {channelList.map((channel) => (
                                    <SubscriptionChannelCard
                                        key={channel._id}
                                        channel={channel}
                                        onToggleSubscription={
                                            toggleChannelSubscription
                                        }
                                    />
                                ))}
                            </div>
                        )}

                </div>
            </main>

        </div>
    );
};

export default AllSubscriptions;

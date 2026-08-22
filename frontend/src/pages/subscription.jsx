import React, { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { Link } from "react-router-dom";

import Navbar from "../components/navbar/navbar";
import Sidebar from "../components/sidebar";
import LoadingCards from "../components/loadingCards";
import SubscriptionChannelCard from "../components/subscription/subscriptionCard";
import HomePageCard from "../components/videoCards/homePageCard";

import useVideoStore from "../store/videoStore";
import useAuthStore from "../store/authStore";

// How many channels to show before the "View More" button appears
const PREVIEW_LIMIT = 8;

// ==========================================
// Channel row skeleton (matches SubscriptionChannelCard layout)
// ==========================================

const ChannelSkeleton = () => (
    <div
        className="
            flex
            flex-col
            items-center
            text-center
            p-8
            border
            border-gray-100
            rounded-xl
            animate-pulse
        "
    >
        <div className="w-17 h-17 rounded-full bg-gray-200 mb-3" />
        <div className="h-3 w-20 bg-gray-200 rounded mb-2" />
    </div>
);

const Subscription = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(
        typeof window !== "undefined" ? window.innerWidth >= 750 : false
    );

    // ==========================================
    // Auth Store
    // ==========================================

    const { authUser, isCheckingAuth } = useAuthStore();

    // ==========================================
    // Video Store
    // ==========================================

    const {
        subscribedChannels,
        subscriptionVideos,
        isSubscriptionDataLoading,
        subscriptionDataError,
        getSubscriptionData,
        videoPublishedVersion,
    } = useVideoStore();

    // ==========================================
    // Sidebar
    // ==========================================

    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

    // ==========================================
    // Fetch Subscribed Channels
    // ==========================================

    useEffect(() => {
        if (isCheckingAuth) return;
        if (!authUser) return;

        getSubscriptionData();
    }, [
        authUser,
        isCheckingAuth,
        getSubscriptionData,
        videoPublishedVersion,
    ]);

    // ==========================================
    // Safe Arrays + Preview Slice
    // ==========================================

    const channelList = Array.isArray(subscribedChannels)
        ? subscribedChannels
        : [];

    const videoList = Array.isArray(subscriptionVideos)
        ? subscriptionVideos
        : [];

    const previewChannels = channelList.slice(0, PREVIEW_LIMIT);
    const hasMore = channelList.length > PREVIEW_LIMIT;

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
                        z-40
                        transition-all
                        duration-300
                        ${isSidebarOpen ? "w-50" : "w-20"}
                    `}
                >
                    <Sidebar isSidebarOpen={isSidebarOpen} />
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
                        ${isSidebarOpen ? "left-50" : "left-20"}
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
                    z-40
                    transition-all
                    duration-300
                    ${isSidebarOpen ? "w-50" : "w-20"}
                `}
            >
                <Sidebar isSidebarOpen={isSidebarOpen} />
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
                    ${isSidebarOpen ? "left-50" : "left-20"}
                `}
            >
                <div className="p-6">

                    {/* ==========================================
                        LOADING — channel row skeleton on top,
                        video grid skeleton (LoadingCards) below
                    ========================================== */}
                    {isSubscriptionDataLoading && (
                        <>
                            <div
                                className="
                                    grid
                                    grid-cols-4
                                    sm:grid-cols-6
                                    lg:grid-cols-10
                                    gap-3
                                    mb-2
                                    ml-10
                                "
                            >
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <ChannelSkeleton key={i} />
                                ))}
                            </div>

                            <LoadingCards />
                        </>
                    )}

                    {/* ==========================================
                        ERROR
                    ========================================== */}
                    {!isSubscriptionDataLoading &&
                        subscriptionDataError && (
                            <div className="flex flex-col items-center justify-center py-20">
                                <p className="text-red-500 text-center">
                                    {subscriptionDataError}
                                </p>
                                <button
                                    type="button"
                                    onClick={getSubscriptionData}
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

                    {/* ==========================================
                        EMPTY
                    ========================================== */}
                    {!isSubscriptionDataLoading &&
                        !subscriptionDataError &&
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

                    {/* ==========================================
                        LOADED — Channels + Videos
                    ========================================== */}
                    {!isSubscriptionDataLoading &&
                        !subscriptionDataError &&
                        channelList.length > 0 && (
                            <>
                                <div
                                    className="
                                        grid
                                        grid-cols-4
                                        sm:grid-cols-10
                                        lg:grid-cols-10
                                        gap-1
                                    "
                                >
                                    {previewChannels.map((channel) => (
                                        <SubscriptionChannelCard
                                            key={channel._id}
                                            channel={channel}
                                        />
                                    ))}
                                </div>

                                {hasMore && (
                                    <div className="flex justify-center mt-8">
                                        <Link
                                            to="/subscriptions/all"
                                            className="
                                                px-6
                                                py-2
                                                font-medium
                                                border
                                                border-gray-300
                                                text-gray-800
                                                rounded-full
                                                hover:bg-gray-100
                                                transition
                                                duration-200
                                            "
                                        >
                                            View More
                                        </Link>
                                    </div>
                                )}

                                {videoList.length === 0 ? (
                                    <div className="text-center py-16">
                                        <p className="text-gray-500">
                                            No videos from your subscriptions yet.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="mt-10">
                                        <div
                                            className="video-grid-responsive"
                                        >
                                            {videoList.map((video) => (
                                                <HomePageCard
                                                    key={video._id}
                                                    video={video}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                </div>
            </main>

        </div>
    );
};

export default Subscription;
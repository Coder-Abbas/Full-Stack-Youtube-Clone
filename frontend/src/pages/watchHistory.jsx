import React, { useEffect, useState } from "react";
import { History } from "lucide-react";
import { Link } from "react-router-dom";

import Navbar from "../components/navbar/navbar";
import Sidebar from "../components/sidebar";
import HomePageCard from "../components/videoCards/homePageCard";
import LoadingCards from "../components/loadingCards";

import useVideoStore from "../store/videoStore";
import useAuthStore from "../store/authStore";

// ==========================================
// Helpers: group watch-history entries by the
// day they were watched, YouTube style
// (Today / Yesterday / Month Day, Year)
// ==========================================

const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

const getDateLabel = (dateString) => {
    if (!dateString) return "Earlier";

    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (isSameDay(date, today)) return "Today";
    if (isSameDay(date, yesterday)) return "Yesterday";

    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

// Assumes the backend returns entries newest-first.
// Each entry should carry a timestamp for when it was
// watched (watchedAt), falling back to updatedAt/createdAt
// if your API names it differently.
const groupByDate = (videos) => {
    const map = new Map();

    videos.forEach((entry) => {
        const watchedAt =
            entry.watchedAt || entry.updatedAt || entry.createdAt;
        const label = getDateLabel(watchedAt);

        if (!map.has(label)) {
            map.set(label, []);
        }
        map.get(label).push(entry);
    });

    return Array.from(map.entries()).map(([label, videos]) => ({
        label,
        videos,
    }));
};

const WatchHistory = () => {
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
        watchHistory,
        isLoading,
        error,
        getWatchHistory,
        videoPublishedVersion,
    } = useVideoStore();

    // ==========================================
    // Sidebar
    // ==========================================

    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

    // ==========================================
    // Fetch Watch History
    // ==========================================

    useEffect(() => {
        // Wait until authentication check is complete
        if (isCheckingAuth) return;

        // Don't fetch history if user is not logged in
        if (!authUser) return;

        getWatchHistory();
    }, [
        authUser,
        isCheckingAuth,
        getWatchHistory,
        videoPublishedVersion,
    ]);

    // ==========================================
    // Safe Array + Grouping
    // ==========================================

    const videoList = Array.isArray(watchHistory) ? watchHistory : [];
    const groupedHistory = groupByDate(videoList);

    // ==========================================
    // Auth Loading
    // ==========================================

    if (isCheckingAuth) {
        return (
            <div className="h-screen overflow-hidden bg-gray-50">

                {/* Navbar */}
                <header className="fixed top-0 left-0 right-0 z-50 h-16">
                    <Navbar
                        toggleSidebar={toggleSidebar}
                    />
                </header>

                {/* Sidebar */}
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
                    <Sidebar
                        isSidebarOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}
                    />
                </aside>

                {/* Loading Skeleton */}
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
                        <LoadingCards count={8} />
                    </div>
                </main>

            </div>
        );
    }

    // ==========================================
    // Not Logged In
    // ==========================================

    if (!authUser) {
        return (
            <div className="h-screen overflow-hidden bg-gray-50">

                {/* Navbar */}
                <header className="fixed top-0 left-0 right-0 z-50 h-16">
                    <Navbar
                        toggleSidebar={toggleSidebar}
                    />
                </header>

                {/* Sidebar */}
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
                    <Sidebar
                        isSidebarOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}
                    />
                </aside>

                {/* Main */}
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
                    <div
                        className="
                            flex
                            flex-col
                            items-center
                            justify-center
                            h-full
                        "
                    >
                        <History
                            size={70}
                            className="text-gray-300 mb-4"
                        />

                        <p className="text-gray-700 text-lg mb-4">
                            Please log in to view your watch history.
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

            {/* ======================================
                NAVBAR
            ====================================== */}

            <header className="fixed top-0 left-0 right-0 z-50 h-16">
                <Navbar
                    toggleSidebar={toggleSidebar}
                />
            </header>


            {/* ======================================
                SIDEBAR
            ====================================== */}

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
                <Sidebar
                    isSidebarOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}
                />
            </aside>


            {/* ======================================
                MAIN CONTENT
            ====================================== */}

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

                    {/* Header */}

                    <div className="flex items-center justify-between mb-6">

                        <h1 className="text-2xl font-bold text-gray-900">
                            Watch History
                        </h1>

                        {!isLoading && (
                            <span className="text-sm text-gray-500">
                                {videoList.length}{" "}
                                {videoList.length === 1
                                    ? "video"
                                    : "videos"}
                            </span>
                        )}

                    </div>


                    {/* ======================================
                        LOADING SKELETON
                    ====================================== */}

                    {isLoading && (
                        <LoadingCards count={8} />
                    )}


                    {/* ======================================
                        ERROR
                    ====================================== */}

                    {!isLoading &&
                        error && (
                            <div
                                className="
                                    flex
                                    flex-col
                                    items-center
                                    justify-center
                                    py-20
                                "
                            >

                                <p className="text-red-500 text-center">
                                    {error}
                                </p>

                                <button
                                    type="button"
                                    onClick={getWatchHistory}
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


                    {/* ======================================
                        EMPTY STATE
                    ====================================== */}

                    {!isLoading &&
                        !error &&
                        videoList.length === 0 && (
                            <div
                                className="
                                    flex
                                    flex-col
                                    items-center
                                    justify-center
                                    py-20
                                    text-center
                                "
                            >

                                <History
                                    size={80}
                                    className="text-gray-300 mb-4"
                                />

                                <h3
                                    className="
                                        font-semibold
                                        text-xl
                                        text-gray-800
                                    "
                                >
                                    No watch history
                                </h3>

                                <p className="text-gray-500 mt-2">
                                    Videos you watch will appear here.
                                </p>

                            </div>
                        )}


                    {/* ======================================
                        WATCH HISTORY GROUPED BY DATE
                        (Today / Yesterday / older dates)
                    ====================================== */}

                    {!isLoading &&
                        !error &&
                        groupedHistory.map((group) => (
                            <div
                                key={group.label}
                                className="mb-10"
                            >
                                <h2
                                    className="
                                        text-lg
                                        font-semibold
                                        text-gray-800
                                        mb-4
                                        px-1
                                    "
                                >
                                    {group.label}
                                </h2>

                                <div
                                    className="video-grid-responsive"
                                >
                                    {group.videos.map((entry) => (
                                        <HomePageCard
                                            key={`${entry.video?._id}-${entry.watchedAt}`}
                                            video={entry.video}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}

                </div>
            </main>

        </div>
    );
};


export default WatchHistory;
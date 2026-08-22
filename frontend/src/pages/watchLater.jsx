import React, { useEffect, useState } from "react";
import { Video, Clock } from "lucide-react";
import { Link } from "react-router-dom";

import Navbar from "../components/navbar/navbar";
import Sidebar from "../components/sidebar";
import HomePageCard from "../components/videoCards/homePageCard";
import LoadingCards from "../components/loadingCards";

import useVideoStore from "../store/videoStore";
import useAuthStore from "../store/authStore";


const WatchLater = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(
        typeof window !== "undefined" ? window.innerWidth >= 750 : false
    );


    // ==========================================
    // Auth Store
    // ==========================================

    const {
        authUser,
        isCheckingAuth,
    } = useAuthStore();


    // ==========================================
    // Video Store
    // ==========================================

    const {
        watchLaterVideos,
        isWatchLaterLoading,
        watchLaterError,
        getWatchLaterVideos,
        videoPublishedVersion,
    } = useVideoStore();


    // ==========================================
    // Sidebar
    // ==========================================

    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);


    // ==========================================
    // Fetch Watch Later Videos
    // ==========================================

    useEffect(() => {
        // Wait until authentication check is complete
        if (isCheckingAuth) return;

        // Don't fetch if user is not logged in
        if (!authUser) return;

        getWatchLaterVideos();
    }, [
        authUser,
        isCheckingAuth,
        getWatchLaterVideos,
        videoPublishedVersion,
    ]);


    // ==========================================
    // Safe Array
    // ==========================================

    const videoList = Array.isArray(watchLaterVideos)
        ? watchLaterVideos
        : [];


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
                        z-40
                        transition-all
                        duration-300
                        ${isSidebarOpen ? "w-50" : "w-20"}
                    `}
                >
                    <Sidebar
                        isSidebarOpen={isSidebarOpen}
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
                        ${isSidebarOpen ? "left-50" : "left-20"}
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
                        z-40
                        transition-all
                        duration-300
                        ${isSidebarOpen ? "w-50" : "w-20"}
                    `}
                >
                    <Sidebar
                        isSidebarOpen={isSidebarOpen}
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
                        ${isSidebarOpen ? "left-50" : "left-20"}
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
                        <Clock
                            size={70}
                            className="text-gray-300 mb-4"
                        />

                        <p className="text-gray-700 text-lg mb-4">
                            Please log in to view your watch later videos.
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
                    z-40
                    transition-all
                    duration-300
                    ${isSidebarOpen ? "w-50" : "w-20"}
                `}
            >
                <Sidebar
                    isSidebarOpen={isSidebarOpen}
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
                    ${isSidebarOpen ? "left-50" : "left-20"}
                `}
            >
                <div className="p-6">

                    {/* Header */}

                    <div className="flex items-center justify-between mb-6">

                        <div className="flex items-center gap-3">
                            <Clock size={26} className="text-gray-700" />
                            <h1 className="text-2xl font-bold text-gray-900">
                                Watch Later
                            </h1>
                        </div>

                        {!isWatchLaterLoading && (
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

                    {isWatchLaterLoading && (
                        <LoadingCards count={8} />
                    )}


                    {/* ======================================
                        ERROR
                    ====================================== */}

                    {!isWatchLaterLoading &&
                        watchLaterError && (
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
                                    {watchLaterError}
                                </p>

                                <button
                                    type="button"
                                    onClick={getWatchLaterVideos}
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

                    {!isWatchLaterLoading &&
                        !watchLaterError &&
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

                                <Clock
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
                                    No videos saved
                                </h3>

                                <p className="text-gray-500 mt-2">
                                    Videos you save for later will appear here.
                                </p>

                            </div>
                        )}


                    {/* ======================================
                        WATCH LATER VIDEOS
                    ====================================== */}

                    {!isWatchLaterLoading &&
                        !watchLaterError &&
                        videoList.length > 0 && (
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
                        )}

                </div>
            </main>

        </div>
    );
};


export default WatchLater;
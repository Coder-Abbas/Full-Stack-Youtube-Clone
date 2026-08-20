import React, { useEffect, useState, useRef, useCallback } from "react";

import Navbar from "../components/navbar/navbar";
import Sidebar from "../components/sidebar";
import HomePageCard from "../components/videoCards/homePageCard";
import LoadingCards from "../components/loadingCards";

import useVideoStore from "../store/videoStore";
import useChannelStore from "../store/channelStore";


const Home = () => {

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const {
        videos,
        isLoading,
        isLoadingMore,
        hasNextPage,
        error,
        getVideos,
        loadMoreVideos,
        videoPublishedVersion,
    } = useVideoStore();

    const {
        channelUpdatedVersion,
    } = useChannelStore();


    // ==========================================
    // Sidebar
    // ==========================================

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };


    // ==========================================
    // Initial videos (page 1 — replaces the list)
    // ==========================================

    // Initial load + refresh when a video is published or channel is updated
    useEffect(() => {

        getVideos(1);

    }, [getVideos, videoPublishedVersion, channelUpdatedVersion]);


    // ==========================================
    // Infinite scroll — IntersectionObserver on a
    // sentinel div at the bottom of the video grid
    // ==========================================

    const sentinelRef = useRef(null);

    const handleIntersect = useCallback(
        (entries) => {
            const [entry] = entries;

            if (
                entry.isIntersecting &&
                hasNextPage &&
                !isLoading &&
                !isLoadingMore
            ) {
                loadMoreVideos();
            }
        },
        [hasNextPage, isLoading, isLoadingMore, loadMoreVideos]
    );

    useEffect(() => {

        const node = sentinelRef.current;
        if (!node) return;

        const observer = new IntersectionObserver(handleIntersect, {
            root: null,
            rootMargin: "300px", // start fetching a bit before it's visible
            threshold: 0,
        });

        observer.observe(node);

        return () => observer.disconnect();

    }, [handleIntersect]);


    // ==========================================
    // Safety
    // ==========================================

    const videoList = Array.isArray(videos)
        ? videos
        : [];


    return (

        <div className="h-screen overflow-hidden bg-gray-50">


            {/* ==========================================
                NAVBAR
            ========================================== */}

            <header
                className="
                    fixed
                    top-0
                    left-0
                    right-0
                    z-50
                    h-16
                "
            >

                <Navbar
                    toggleSidebar={toggleSidebar}
                />

            </header>


            {/* ==========================================
                SIDEBAR
            ========================================== */}

            <aside
                className={`
                    fixed
                    left-0
                    top-16
                    bottom-0
                    z-40
                    transition-all
                    duration-300

                    ${isSidebarOpen
                        ? "w-64"
                        : "w-20"
                    }
                `}
            >

                <Sidebar
                    isSidebarOpen={isSidebarOpen}
                />

            </aside>


            {/* ==========================================
                MAIN
            ========================================== */}

            <main
                className={`
                    absolute
                    top-16
                    bottom-0
                    right-0
                    overflow-y-auto
                    transition-all
                    duration-300

                    ${isSidebarOpen
                        ? "left-64"
                        : "left-20"
                    }
                `}
            >

                <div className="p-6">


                    {/* ==========================================
                        INITIAL LOADING (page 1 only)
                    ========================================== */}

                    {isLoading && (

                        <LoadingCards />

                    )}


                    {/* ==========================================
                        ERROR
                    ========================================== */}

                    {!isLoading && error && (

                        <div className="flex flex-col items-center justify-center py-10">

                            <p className="text-red-500 mb-4">

                                {error}

                            </p>

                            <button
                                type="button"
                                onClick={() => getVideos(1)}
                                className="
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

                    {!isLoading &&
                        !error &&
                        videoList.length === 0 && (

                            <div className="text-center py-10">

                                <p className="text-gray-500">

                                    No videos found.

                                </p>

                            </div>

                        )}


                    {/* ==========================================
                        VIDEOS
                    ========================================== */}

                    {!isLoading &&
                        !error &&
                        videoList.length > 0 && (

                            <>

                                <div
                                    className="
                                        grid
                                        grid-cols-1
                                        sm:grid-cols-2
                                        lg:grid-cols-3
                                        xl:grid-cols-3
                                        gap-x-0
                                        gap-y-2
                                    "
                                >

                                    {videoList.map((video) => (

                                        <HomePageCard
                                            key={video._id}
                                            video={video}
                                        />

                                    ))}

                                </div>


                                {/* Sentinel — observed to trigger the next page */}
                                <div ref={sentinelRef} className="h-1" />


                                {/* ==========================================
                                    LOADING MORE
                                ========================================== */}

                                {isLoadingMore && (

                                    <div className="mt-2">
                                        <LoadingCards count={3} />
                                    </div>

                                )}


                                {/* ==========================================
                                    END OF FEED
                                ========================================== */}

                                {!hasNextPage &&
                                    !isLoadingMore &&
                                    videoList.length > 0 && (

                                        <p className="text-center text-gray-400 text-sm py-6">
                                            You're all caught up.
                                        </p>

                                    )}

                            </>

                        )}

                </div>

            </main>

        </div>

    );

};


export default Home;
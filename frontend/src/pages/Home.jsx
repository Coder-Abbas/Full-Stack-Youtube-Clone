import React, { useEffect, useState } from "react";

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
        error,
        getVideos,
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
    // Initial videos
    // ==========================================

    // Initial load + refresh when a video is published or channel is updated
    useEffect(() => {

        getVideos();

    }, [getVideos, videoPublishedVersion, channelUpdatedVersion]);


    // ==========================================
    // Safety
    // ==========================================

    const videoList = Array.isArray(videos)
        ? videos
        : [];


    const visibleVideos = videoList.slice(0, 6);


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
                        LOADING
                    ========================================== */}

                    {isLoading && (

                        <LoadingCards />

                    )}


                    {/* ==========================================
                        ERROR
                    ========================================== */}

                    {!isLoading && error && (

                        <div className="flex justify-center py-10">

                            <p className="text-red-500">

                                {error}

                            </p>

                        </div>

                    )}


                    {/* ==========================================
                        EMPTY
                    ========================================== */}

                    {!isLoading &&
                        !error &&
                        visibleVideos.length === 0 && (

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
                        visibleVideos.length > 0 && (

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

                                {visibleVideos.map((video) => (

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


export default Home;
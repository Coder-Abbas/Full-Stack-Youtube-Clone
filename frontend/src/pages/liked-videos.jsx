import React, { useEffect, useState } from "react";
import { Video } from "lucide-react";

import Navbar from "../components/navbar/navbar";
import Sidebar from "../components/sidebar";
import HomePageCard from "../components/videoCards/homePageCard";
import useVideoStore from "../store/videoStore";

const LikedVideos = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const {
        likedVideos,
        isLikedVideosLoading,
        likedVideosError,
        getLikedVideos,
    } = useVideoStore();

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    useEffect(() => {
        getLikedVideos();
    }, [getLikedVideos]);

    return (
        <div className="h-screen overflow-hidden bg-gray-50">
            {/* Navbar */}
            <header className="fixed top-0 left-0 right-0 z-50 h-16">
                <Navbar toggleSidebar={toggleSidebar} />
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
                    ${isSidebarOpen ? "w-64" : "w-20"}
                `}
            >
                <Sidebar isSidebarOpen={isSidebarOpen} />
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
                    ${isSidebarOpen ? "left-64" : "left-20"}
                `}
            >
                <div className="p-6">
                    {/* Header */}
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        Liked Videos
                    </h1>

                    {/* Loading */}
                    {isLikedVideosLoading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="aspect-video bg-gray-200 rounded-xl" />
                                    <div className="flex gap-3 mt-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-full" />
                                            <div className="h-3 bg-gray-200 rounded w-2/3" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Error */}
                    {!isLikedVideosLoading && likedVideosError && (
                        <div className="text-center py-10">
                            <p className="text-red-500">{likedVideosError}</p>
                        </div>
                    )}

                    {/* Empty state */}
                    {!isLikedVideosLoading &&
                        !likedVideosError &&
                        likedVideos.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Video size={80} className="text-gray-300 mb-4" />
                                <h3 className="font-semibold text-xl text-gray-800">
                                    No videos liked
                                </h3>
                                <p className="text-gray-500 mt-2">
                                    Videos you like will appear here.
                                </p>
                            </div>
                        )}

                    {/* Liked Videos */}
                    {!isLikedVideosLoading &&
                        !likedVideosError &&
                        likedVideos.length > 0 && (
                            <div
                                className="
                                    grid
                                    grid-cols-1
                                    sm:grid-cols-2
                                    lg:grid-cols-3
                                    xl:grid-cols-4
                                    gap-4
                                "
                            >
                                {likedVideos.map((video) => (
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

export default LikedVideos;

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Video, Settings, PlayCircle } from "lucide-react";

import Navbar from "../components/navbar/navbar";
import Sidebar from "../components/sidebar";
import ProfileVideoCard from "../components/videoCards/homePageCard";
import ProfileSkeleton from "../components/ProfileSkeleton";
import useChannelStore from "../store/channelStore";

const Profile = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState("videos");

    const { channel, channelVideos, isLoading, error, getMyChannel, getMyVideos } = useChannelStore();

    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

    useEffect(() => {
        getMyChannel();
        getMyVideos();
    }, [getMyChannel, getMyVideos]);

    // Show skeleton while loading
    if (isLoading && !channel) {
        return (
            <div>
                <header className="fixed top-0 left-0 right-0 z-50 h-16">
                    <Navbar toggleSidebar={toggleSidebar} />
                </header>
                <aside className={`fixed left-0 top-16 bottom-0 z-40 transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-20"}`}>
                    <Sidebar isSidebarOpen={isSidebarOpen} />
                </aside>
                <main className={`pt-16 transition-all duration-300 ${isSidebarOpen ? "pl-64" : "pl-20"}`}>
                    <ProfileSkeleton />
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f9f9f9]">
            {/* Navbar */}
            <header className="fixed top-0 left-0 right-0 z-50 h-16">
                <Navbar toggleSidebar={toggleSidebar} />
            </header>

            {/* Sidebar */}
            <aside className={`fixed left-0 top-16 bottom-0 z-40 transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-20"}`}>
                <Sidebar isSidebarOpen={isSidebarOpen} />
            </aside>

            {/* Main Content */}
            <main className={`pt-16 transition-all duration-300 ${isSidebarOpen ? "pl-64" : "pl-20"}`}>
                <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
                    {/* Channel Header - YouTube Style */}
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <img
                                src={channel?.avatar || "/default-avatar.png"}
                                alt={channel?.username || "Profile"}
                                className="w-28 h-28 md:w-40 md:h-40 rounded-full object-cover border border-gray-200"
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900">{channel?.fullName}</h1>
                            <p className="text-gray-600 mt-1">@{channel?.username}</p>
                            <p className="text-gray-600 mt-1">
                                {channel?.subscribersCount ?? 0} subscribers • {channelVideos.length} videos
                            </p>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-4">
                                <Link
                                    to="/profile/edit"
                                    className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition"
                                >
                                    <Settings size={18} />
                                    Edit Profile
                                </Link>

                                <span className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-900 rounded-full font-medium">
                                    <PlayCircle size={18} />
                                    {channelVideos.length} videos
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs - YouTube Style */}
                    <div className="flex gap-6 mt-10 border-b border-gray-200 pb-3">
                        <button
                            onClick={() => setActiveTab("videos")}
                            className={`pb-1 font-medium ${activeTab === "videos"
                                    ? "text-gray-900 border-b-2 border-gray-900"
                                    : "text-gray-500 hover:text-gray-900"
                                }`}
                        >
                            Videos
                        </button>
                        <a
                            href="/liked-videos"
                            className="pb-1 font-medium text-gray-500 hover:text-gray-900"
                        >
                            Liked Videos
                        </a>
                        <button
                            className="pb-1 font-medium text-gray-500 hover:text-gray-900"
                            disabled
                        >
                            Shorts
                        </button>
                        <button
                            className="pb-1 font-medium text-gray-500 hover:text-gray-900"
                            disabled
                        >
                            About
                        </button>
                    </div>

                    {/* Videos */}
                    {channelVideos.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-200 py-20 text-center mt-8">
                            <Video size={60} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="font-semibold text-xl text-gray-800">No videos yet</h3>
                            <p className="text-gray-500 mt-2">Upload your first video.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6 max-h-[600px] overflow-y-auto pr-2">
                            {channelVideos.map((video) => (
                                <ProfileVideoCard
                                    key={video._id}
                                    video={video}
                                    onUpdate={() => getMyVideos()}
                                />
                            ))}
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="text-center py-10">
                            <p className="text-red-500">{error}</p>
                        </div>
                    )}
                </div>
            </main>

        </div>
    );
};

export default Profile;
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Video, PlayCircle, Bell } from "lucide-react";

import Navbar from "../components/navbar/navbar";
import Sidebar from "../components/sidebar";
import HomePageCard from "../components/videoCards/homePageCard";
import ProfileSkeleton from "../components/ProfileSkeleton";
import axiosInstance from "../api/axiosInstance";
import useAuthStore from "../store/authStore";

const ChannelPage = () => {
    const { username } = useParams();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [channel, setChannel] = useState(null);
    const [videos, setVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isSubscribing, setIsSubscribing] = useState(false);

    const { authUser } = useAuthStore();

    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

    useEffect(() => {
        const fetchChannel = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch channel profile by username
                const channelRes = await axiosInstance.get(`/users/c/${username}`);
                const channelData = channelRes.data.data;

                // Convert avatar to https
                if (channelData?.avatar) {
                    channelData.avatar = channelData.avatar.startsWith("http://")
                        ? channelData.avatar.replace("http://", "https://")
                        : channelData.avatar;
                }

                setChannel(channelData);
                setIsSubscribed(channelData?.isSubscribed || false);

                // Fetch channel videos (all published videos by this user)
                const videosRes = await axiosInstance.get("/videos/published");
                const allVideos = videosRes.data.data?.videos || [];
                const channelVideos = allVideos.filter(
                    (v) => v.owner?._id === channelData?._id
                );

                // Convert thumbnail URLs to https
                const convertedVideos = channelVideos.map((v) => ({
                    ...v,
                    thumbnail: v.thumbnail?.startsWith("http://")
                        ? v.thumbnail.replace("http://", "https://")
                        : v.thumbnail,
                    videoFile: v.videoFile?.startsWith("http://")
                        ? v.videoFile.replace("http://", "https://")
                        : v.videoFile,
                }));

                setVideos(convertedVideos);
            } catch (err) {
                console.error("Fetch channel error:", err);
                setError(err.response?.data?.message || "Channel not found");
            } finally {
                setIsLoading(false);
            }
        };

        if (username) {
            fetchChannel();
        }
    }, [username]);

    const handleSubscribe = async () => {
        if (!channel?._id || isSubscribing) return;
        setIsSubscribing(true);
        try {
            await axiosInstance.post(`/subscription/${channel._id}/subscribed`);
            setIsSubscribed((prev) => !prev);
        } catch (err) {
            console.error("Subscribe error:", err);
        } finally {
            setIsSubscribing(false);
        }
    };

    // Show skeleton while loading
    if (isLoading) {
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

    // Error state
    if (error || !channel) {
        return (
            <div>
                <header className="fixed top-0 left-0 right-0 z-50 h-16">
                    <Navbar toggleSidebar={toggleSidebar} />
                </header>
                <aside className={`fixed left-0 top-16 bottom-0 z-40 transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-20"}`}>
                    <Sidebar isSidebarOpen={isSidebarOpen} />
                </aside>
                <main className={`pt-16 transition-all duration-300 ${isSidebarOpen ? "pl-64" : "pl-20"}`}>
                    <div className="max-w-6xl mx-auto px-4 py-16 text-center">
                        <p className="text-red-500">{error || "Channel not found"}</p>
                    </div>
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
                                src={channel.avatar || "/default-avatar.png"}
                                alt={channel.username || "Channel"}
                                className="w-28 h-28 md:w-40 md:h-40 rounded-full object-cover border border-gray-200"
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900">{channel.fullName}</h1>
                            <p className="text-gray-600 mt-1">@{channel.username}</p>
                            <p className="text-gray-600 mt-1">
                                {channel.subscribersCount ?? 0} subscribers • {videos.length} videos
                            </p>

                            {/* Subscribe Button - only show for other users' channels */}
                            {authUser?._id !== channel?._id && (
                                <div className="flex gap-3 mt-4">
                                    <button
                                        type="button"
                                        onClick={handleSubscribe}
                                        disabled={isSubscribing}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition ${
                                            isSubscribed
                                                ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
                                                : "bg-black text-white hover:bg-gray-800"
                                        }`}
                                    >
                                        <Bell size={18} />
                                        {isSubscribed ? "Subscribed" : "Subscribe"}
                                    </button>

                                    <span className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-900 rounded-full font-medium">
                                        <PlayCircle size={18} />
                                        {videos.length} videos
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-6 mt-10 border-b border-gray-200 pb-3">
                        <span className="pb-1 font-medium text-gray-900 border-b-2 border-gray-900">
                            Videos
                        </span>
                        <span className="pb-1 font-medium text-gray-500">Shorts</span>
                        <span className="pb-1 font-medium text-gray-500">About</span>
                    </div>

                    {/* Videos */}
                    {videos.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-200 py-20 text-center mt-8">
                            <Video size={60} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="font-semibold text-xl text-gray-800">No videos yet</h3>
                            <p className="text-gray-500 mt-2">This channel has no published videos.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                            {videos.map((video) => (
                                <HomePageCard key={video._id} video={video} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ChannelPage;
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Video,
    Search,
    X,
    FileText,
    Eye,
    Bell,
} from "lucide-react";

import Navbar from "../components/navbar/navbar";
import Sidebar from "../components/sidebar";
import ProfileVideoCard from "../components/videoCards/myProfileCard";
import ProfileSkeleton from "../components/ProfileSkeleton";
import axiosInstance from "../api/axiosInstance";
import useAuthStore from "../store/authStore";
import { useResponsiveSidebar } from "../hooks/useResponsiveSidebar";

const ChannelPage = () => {
    const { username } = useParams();
    const { isSidebarOpen, toggleSidebar, getSidebarWidthClass, getMainLeftClass, getSidebarAdditionalClass } = useResponsiveSidebar(true);
    const [activeTab, setActiveTab] = useState("videos");
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [showAvatar, setShowAvatar] = useState(false);

    const [channel, setChannel] = useState(null);
    const [videos, setVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [totalSubscribers, setTotalSubscribers] = useState(0);

    const { authUser } = useAuthStore();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchOpen && !event.target.closest(".search-container")) {
                setSearchOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [searchOpen]);

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
                setTotalSubscribers(channelData?.subscribersCount ?? 0);

                // Fetch channel videos (all published videos by this user)
                const videosRes = await axiosInstance.get("/videos/published");
                const allVideos = videosRes.data.data?.videos || [];
                const channelVideos = allVideos.filter(
                    (v) => v.owner?._id === channelData?._id
                );

                // Convert thumbnail/videoFile URLs to https
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

        // optimistic update
        const wasSubscribed = isSubscribed;
        setIsSubscribed(!wasSubscribed);
        setTotalSubscribers((prev) => (wasSubscribed ? Math.max(0, prev - 1) : prev + 1));

        try {
            const res = await axiosInstance.post(
                `/subscription/${channel._id}/subscribed`
            );
            // Sync subscriber count from server (single source of truth)
            const subscribersCount = res?.data?.data?.subscribersCount;
            if (typeof subscribersCount === "number") {
                setTotalSubscribers(subscribersCount);
            }
        } catch (err) {
            
            // rollback on failure
            setIsSubscribed(wasSubscribed);
            setTotalSubscribers((prev) => (wasSubscribed ? prev + 1 : Math.max(0, prev - 1)));
        } finally {
            setIsSubscribing(false);
        }
    };

    // Search videos (read-only, client side filter)
    const filteredVideos = useMemo(() => {
        if (!searchQuery.trim()) {
            return videos;
        }

        return videos.filter((video) =>
            video.title?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [videos, searchQuery]);

    const isOwnChannel = authUser?._id === channel?._id;

    // Loading
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f9f9f9]">
                <header className="fixed top-0 left-0 right-0 z-50 h-16">
                    <Navbar toggleSidebar={toggleSidebar} />
                </header>
                <aside
                    className={`
                        fixed left-0 top-16 bottom-0 z-40 transition-all duration-300 ${getSidebarWidthClass(isSidebarOpen)}
                        ${getSidebarAdditionalClass(isSidebarOpen)}
                        overflow-hidden
                    `}
                >
                    <Sidebar isSidebarOpen={isSidebarOpen} />
                </aside>
                <main
                    className={`absolute top-16 bottom-0 right-0 transition-all duration-300 ${getMainLeftClass(isSidebarOpen)}`}
                >
                    <ProfileSkeleton />
                </main>
            </div>
        );
    }

    // Error state
    if (error || !channel) {
        return (
            <div className="min-h-screen bg-[#f9f9f9]">
                <header className="fixed top-0 left-0 right-0 z-50 h-16">
                    <Navbar toggleSidebar={toggleSidebar} />
                </header>
                <aside
                    className={`
                        fixed left-0 top-16 bottom-0 z-40 transition-all duration-300 ${getSidebarWidthClass(isSidebarOpen)}
                        ${getSidebarAdditionalClass(isSidebarOpen)}
                        overflow-hidden
                    `}
                >
                    <Sidebar isSidebarOpen={isSidebarOpen} />
                </aside>
                <main
                    className={`absolute top-16 bottom-0 right-0 transition-all duration-300 ${getMainLeftClass(isSidebarOpen)}`}
                >
                    <div className="max-w-6xl mx-auto px-4 py-16 text-center">
                        <p className="text-red-500">{error || "Channel not found"}</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="h-screen overflow-hidden bg-[#f9f9f9]">
            {/* ================= NAVBAR ================= */}
            <header className="fixed top-0 left-0 right-0 z-50 h-16">
                <Navbar toggleSidebar={toggleSidebar} />
            </header>

            {/* ================= SIDEBAR ================= */}
            <aside
                className={`
                    fixed left-0 top-16 bottom-0 z-40 transition-all duration-300 ${getSidebarWidthClass(isSidebarOpen)}
                    ${getSidebarAdditionalClass(isSidebarOpen)}
                    overflow-hidden
                `}
            >
                <Sidebar isSidebarOpen={isSidebarOpen} />
            </aside>

            {/* ================= MAIN ================= */}
            <main
                className={`absolute top-16 bottom-0 right-0 transition-all duration-300 ${getMainLeftClass(isSidebarOpen)}`}
            >
                <div className="h-full max-w-7xl mx-auto flex flex-col">
                    <section className="flex-shrink-0 px-6 md:px-10 pt-8 pb-6 bg-[#f9f9f9]">
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            {/* Avatar - read only, no edit menu */}
                            <div className="relative flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setShowAvatar(true)}
                                    className="relative group cursor-pointer rounded-full focus:outline-none"
                                >
                                    <img
                                        src={channel.avatar || "/default-avatar.png"}
                                        alt={channel.username || "Channel"}
                                        className="
                                            w-28 h-28
                                            md:w-36 md:h-36
                                            rounded-full
                                            object-cover
                                            border border-gray-200
                                        "
                                    />

                                    {/* Hover Eye */}
                                    <div
                                        className="
                                            absolute inset-0
                                            rounded-full
                                            bg-black/50
                                            flex items-center justify-center
                                            opacity-0
                                            group-hover:opacity-100
                                            transition-opacity
                                        "
                                    >
                                        <Eye size={32} className="text-white" />
                                    </div>
                                </button>
                            </div>

                            {/* Channel Details */}
                            <div className="flex-1 min-w-0">
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 truncate">
                                    {channel.fullName}
                                </h1>

                                <p className="text-gray-600 mt-1">@{channel.username}</p>

                                {/* Stats */}
                                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-sm md:text-base text-gray-700">
                                    <span>
                                        <strong className="text-gray-900">
                                            {totalSubscribers}
                                        </strong>{" "}
                                        subscribers
                                    </span>

                                    <span>
                                        <strong className="text-gray-900">
                                            {videos.length}
                                        </strong>{" "}
                                        videos
                                    </span>
                                </div>

                                {/* Subscribe - only for other users' channels */}
                                {!isOwnChannel && (
                                    <div className="mt-5">
                                        <button
                                            type="button"
                                            onClick={handleSubscribe}
                                            disabled={isSubscribing}
                                            className={`
                                                inline-flex
                                                items-center
                                                gap-2
                                                px-5
                                                py-2.5
                                                rounded-full
                                                font-medium
                                                transition
                                                ${
                                                    isSubscribed
                                                        ? "bg-gray-200 text-gray-900 cursor-pointer hover:bg-gray-300"
                                                        : "bg-black text-white cursor-pointer hover:bg-gray-800"
                                                }
                                            `}
                                        >
                                            <Bell size={18} />
                                            {isSubscribed ? "Subscribed" : "Subscribe"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="mt-7 border-b border-gray-200" />
                    </section>

                    {/* =====================================================
                        SECTION 2 - CONTENT
                    ====================================================== */}
                    <section className="flex-1 min-h-0 px-6 md:px-10">
                        {/* Tabs + Search */}
                        <div className="flex items-center justify-between border-b border-gray-200">
                            {/* Tabs */}
                            <div className="flex items-center gap-6">
                                {/* Videos */}
                                <button
                                    onClick={() => setActiveTab("videos")}
                                    className={`
                                        relative
                                        py-4
                                        font-medium
                                        cursor-pointer
                                        whitespace-nowrap
                                        transition
                                        ${
                                            activeTab === "videos"
                                                ? "text-black"
                                                : "text-gray-500 hover:text-gray-900"
                                        }
                                    `}
                                >
                                    <span className="flex items-center gap-2">
                                        <Video size={18} />
                                        Videos
                                    </span>

                                    {activeTab === "videos" && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full" />
                                    )}
                                </button>

                                {/* Posts */}
                                <button
                                    onClick={() => setActiveTab("posts")}
                                    className={` 
                                        relative
                                        py-4
                                        cursor-pointer
                                        font-medium
                                        whitespace-nowrap
                                        transition
                                        ${
                                            activeTab === "posts"
                                                ? "text-black"
                                                : "text-gray-500 hover:text-gray-900"
                                        }
                                    `}
                                >
                                    <span className="flex items-center gap-2">
                                        <FileText size={18} />
                                        Posts
                                    </span>

                                    {activeTab === "posts" && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full" />
                                    )}
                                </button>
                            </div>

                             {/* Search */}
                             <div className="search-container flex items-center ml-4">
                                 {!searchOpen ? (
                                     <button
                                         onClick={() => setSearchOpen(true)}
                                         className="
                                             p-2.5
                                             rounded-full
                                             hover:bg-gray-200
                                             transition
                                             text-gray-700
                                         "
                                         title="Search videos"
                                     >
                                         <Search size={21} />
                                     </button>
                                 ) : (
                                     <div className="search-dropdown open flex items-center gap-2">
                                         <div className="relative">
                                             <Search
                                                 size={18}
                                                 className="
                                                     absolute
                                                     left-3
                                                     top-1/2
                                                     -translate-y-1/2
                                                     text-gray-400
                                                 "
                                             />

                                             <input
                                                 type="text"
                                                 value={searchQuery}
                                                 onChange={(e) => setSearchQuery(e.target.value)}
                                                 placeholder="Search videos..."
                                                 autoFocus
                                                 className="
                                                     w-48
                                                     md:w-64
                                                     pl-10
                                                     pr-4
                                                     py-2.5
                                                     bg-white
                                                     border
                                                     border-gray-300
                                                     rounded-full
                                                     outline-none
                                                     focus:border-gray-500
                                                     transition
                                                 "
                                             />
                                         </div>

                                         <button
                                             onClick={() => {
                                                 setSearchOpen(false);
                                                 setSearchQuery("");
                                             }}
                                             className="
                                                 p-2
                                                 rounded-full
                                                 hover:bg-gray-200
                                                 transition
                                             "
                                         >
                                             <X size={20} />
                                         </button>
                                     </div>
                                 )}
                             </div>
                        </div>

                        {/* =================================================
                            SCROLLABLE CONTENT AREA
                        ================================================== */}
                        <div className="h-full overflow-y-auto pb-10">
                            {/* ================= VIDEOS (read-only) ================= */}
                            {activeTab === "videos" && (
                                <div className="pt-6">
                                    {filteredVideos.length === 0 ? (
                                        <div className="rounded-2xl py-10 text-center">
                                            <Video
                                                size={46}
                                                className="mx-auto text-gray-300 mb-4"
                                            />

                                            <h3 className="font-semibold text-xl text-gray-800">
                                                {searchQuery ? "No videos found" : "No videos yet"}
                                            </h3>

                                            <p className="text-gray-500 mt-2">
                                                {searchQuery
                                                    ? "Try a different search."
                                                    : "This channel has no published videos."}
                                            </p>
                                        </div>
                                    ) : (
                                        <div
                                            className="
                                                video-grid-responsive
                                                grid
                                                grid-cols-1
                                                sm:grid-cols-2
                                                lg:grid-cols-3
                                                xl:grid-cols-3
                                                gap-2
                                            "
                                        >
                                            {filteredVideos.map((video) => (
                                                <ProfileVideoCard
                                                    key={video._id}
                                                    video={video}
                                                    readOnly
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ================= POSTS ================= */}
                            {activeTab === "posts" && (
                                <div className="flex flex-col items-center py-13 justify-center text-center">
                                    <div className="w-16 h-16 flex items-center justify-center rounded-full mb-4">
                                        <FileText size={30} className="text-gray-400" />
                                    </div>

                                    <h3 className="text-xl font-semibold text-gray-800">
                                        No posts yet
                                    </h3>

                                    <p className="text-gray-500 mt-2">
                                        This channel hasn't posted anything yet.
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>

            {/* Avatar Preview Dialog (read-only, no edit option) */}
            {showAvatar && (
                <div
                    className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center"
                    onClick={() => setShowAvatar(false)}
                >
                    <div
                        className="relative cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowAvatar(false)}
                            className="
                                absolute
                                -top-12
                                right-0
                                w-10
                                h-10
                                rounded-full
                                bg-white/20
                                text-white
                                flex
                                items-center
                                justify-center
                                hover:bg-white/30 cursor-pointer
                            "
                        >
                            <X size={22} />
                        </button>

                        <img
                            src={channel.avatar || "/default-avatar.png"}
                            alt="Channel"
                            className="
                                w-72 h-72
                                md:w-96 md:h-96
                                rounded-full
                                object-cover
                                border-4
                                border-gray-900
                                shadow-2xl
                            "
                        />
                    </div>
                </div>
            )}
        </div>
    );
}; 


export default ChannelPage;
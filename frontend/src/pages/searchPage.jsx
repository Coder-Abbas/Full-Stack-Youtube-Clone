import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Users, Play, ChevronDown } from "lucide-react";

import Navbar from "../components/navbar/navbar";
import Sidebar from "../components/sidebar";
import HomePageCard from "../components/videoCards/homePageCard";
import LoadingCards from "../components/loadingCards";

import axiosInstance from "../api/axiosInstance";
import ChannelCards from "../components/channelCard";


const SearchPage = () => {
    const [searchParams] = useSearchParams();

    const query = searchParams.get("q") || "";

    // ==========================================
    // Sidebar
    // ==========================================

    const [isSidebarOpen, setIsSidebarOpen] = useState(
        typeof window !== "undefined" ? window.innerWidth >= 750 : false
    );

    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

    // ==========================================
    // Search
    // ==========================================

    const [activeTab, setActiveTab] = useState("videos");
    const [sortBy, setSortBy] = useState("relevance");
    const [menuOpen, setMenuOpen] = useState(false);

    const [videos, setVideos] = useState([]);
    const [channels, setChannels] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // ==========================================
    // Fetch Search Results
    // ==========================================

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!query.trim()) {
                setVideos([]);
                setChannels([]);
                return;
            }

            try {
                setIsLoading(true);
                setError("");

                const response = await axiosInstance.get(
                    `/search?q=${encodeURIComponent(query.trim())}`
                );

                const data = response.data?.data;

                setVideos(
                    Array.isArray(data?.videos)
                        ? data.videos
                        : []
                );

                setChannels(
                    Array.isArray(data?.channels)
                        ? data.channels
                        : []
                );
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Something went wrong while searching."
                );

                setVideos([]);
                setChannels([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSearchResults();
    }, [query]);

    // ==========================================
    // Reset tab when query changes
    // ==========================================

    useEffect(() => {
        setActiveTab("videos");
        setSortBy("relevance");
        setMenuOpen(false);
    }, [query]);

    // ==========================================
    // Sort videos based on menu selection
    // ==========================================

    const sortedVideos = useMemo(() => {
        if (!Array.isArray(videos)) return [];

        const list = [...videos];

        if (sortBy === "newest") {
            list.sort(
                (a, b) =>
                    new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
            );
        } else if (sortBy === "views") {
            list.sort((a, b) => (b.views || 0) - (a.views || 0));
        }

        return list;
    }, [videos, sortBy]);

    const sortOptions = [
        { value: "relevance", label: "Relevance" },
        { value: "newest", label: "Newest" },
        { value: "views", label: "Most viewed" },
    ];

    const activeSortLabel =
        sortOptions.find((o) => o.value === sortBy)?.label || "Relevance";

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

                    ${
                        isSidebarOpen
                            ? "w-50"
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

                    ${
                        isSidebarOpen
                            ? "left-50"
                            : "left-20"
                    }
                `}
            >
                <div className="p-6">

                    {/* ==========================================
                        SEARCH TITLE
                    ========================================== */}

                    <div className="mb-6">

                        <h1
                            className="
                                text-xl
                                md:text-2xl
                                font-semibold
                                text-gray-900
                            "
                        >
                            Search results for{" "}

                            <span className="text-pink-500">
                                "{query}"
                            </span>
                        </h1>

                    </div>

                    {/* ==========================================
                        TABS
                    ========================================== */}

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            border-b
                            border-gray-200
                            mb-6
                        "
                    >
                        <div className="flex items-center gap-3">
                            {/* VIDEOS TAB */}

                            <button
                                type="button"
                                onClick={() =>
                                    setActiveTab("videos")
                                }
                                className={`
                                    flex
                                    items-center
                                    gap-2
                                    px-4
                                    py-3
                                    text-sm
                                    font-medium
                                    border-b-2
                                    transition
                                    cursor-pointer

                                    ${
                                        activeTab === "videos"
                                            ? "border-pink-500 text-pink-500"
                                            : "border-transparent text-gray-600 hover:text-gray-900"
                                    }
                                `}
                            >
                                <Play size={17} />

                                Videos

                                <span className="text-xs opacity-70">
                                    {videos.length}
                                </span>
                            </button>

                            {/* CHANNELS TAB */}

                            <button
                                type="button"
                                onClick={() =>
                                    setActiveTab("channels")
                                }
                                className={`
                                    flex
                                    items-center
                                    gap-2
                                    px-4
                                    py-3
                                    text-sm
                                    font-medium
                                    border-b-2
                                    transition
                                    cursor-pointer

                                    ${
                                        activeTab === "channels"
                                            ? "border-pink-500 text-pink-500"
                                            : "border-transparent text-gray-600 hover:text-gray-900"
                                    }
                                `}
                            >
                                <Users size={17} />

                                Channels

                                <span className="text-xs opacity-70">
                                    {channels.length}
                                </span>
                            </button>
                        </div>

                        {/* ==========================================
                            SORT / FILTER MENU (videos only)
                        ========================================== */}

                        {activeTab === "videos" && (
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setMenuOpen((prev) => !prev)
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        px-4
                                        py-2
                                        text-sm
                                        font-medium
                                        rounded-full
                                        border
                                        border-gray-300
                                        bg-white
                                        cursor-pointer
                                        hover:bg-gray-100
                                        transition
                                    "
                                >
                                    {activeSortLabel}
                                    <ChevronDown size={16} />
                                </button>

                                {menuOpen && (
                                    <div
                                        className="
                                            absolute
                                            right-0
                                            top-12
                                            z-50
                                            w-44
                                            rounded-xl
                                            border
                                            border-gray-200
                                            bg-white
                                            py-2
                                            shadow-lg
                                        "
                                    >
                                        {sortOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => {
                                                    setSortBy(option.value);
                                                    setMenuOpen(false);
                                                }}
                                                className={`
                                                    w-full
                                                    flex
                                                    items-center
                                                    justify-between
                                                    px-4
                                                    py-2
                                                    text-left
                                                    text-sm
                                                    cursor-pointer
                                                    transition
                                                    hover:bg-gray-100
                                                    ${
                                                        sortBy === option.value
                                                            ? "text-pink-500 font-medium"
                                                            : "text-gray-700"
                                                    }
                                                `}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

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
                        <div
                            className="
                                flex
                                flex-col
                                items-center
                                justify-center
                                py-20
                            "
                        >
                            <p className="text-red-500 mb-3">
                                {error}
                            </p>

                            <p className="text-sm text-gray-500">
                                Please try searching again.
                            </p>
                        </div>
                    )}

                    {/* ==========================================
                        VIDEO RESULTS
                    ========================================== */}

                    {!isLoading &&
                        !error &&
                        activeTab === "videos" && (
                            <VideoResults
                                videos={sortedVideos}
                            />
                        )}

                    {/* ==========================================
                        CHANNEL RESULTS
                    ========================================== */}

                    {!isLoading &&
                        !error &&
                        activeTab === "channels" && (
                            <ChannelResults
                                channels={channels}
                            />
                        )}

                </div>
            </main>
        </div>
    );
};


// ======================================================
// VIDEO RESULTS
// ======================================================

const VideoResults = ({ videos }) => {

    if (!videos.length) {
        return (
            <EmptyResults
                icon={<Play size={28} />}
                message="No videos found"
            />
        );
    }

    return (
        <div
            className="video-grid-responsive"
        >
            {videos.map((video) => (
                <HomePageCard
                    key={video._id}
                    video={video}
                />
            ))}
        </div>
    );
};


// ======================================================
// CHANNEL RESULTS
// ======================================================

const ChannelResults = ({ channels }) => {

    if (!channels.length) {
        return (
            <EmptyResults
                icon={<Users size={28} />}
                message="No channels found"
            />
        );
    }

    return (
        <div
            className="
                w-full
                max-w-3xl
                flex
                flex-col
                gap-2
            "
        >
            {channels.map((channel) => (
                <ChannelCards
                    key={channel._id}
                    channel={channel}
                />
            ))}
        </div>
    );
};


// ======================================================
// EMPTY RESULTS
// ======================================================

const EmptyResults = ({
    icon,
    message,
}) => {

    return (
        <div
            className="
                flex
                flex-col
                items-center
                justify-center
                py-20
                text-gray-500
            "
        >

            <div
                className="
                    w-14
                    h-14
                    rounded-full
                    bg-gray-100
                    flex
                    items-center
                    justify-center
                    mb-4
                "
            >
                {icon}
            </div>

            <p className="text-sm">
                {message}
            </p>

        </div>
    );
};


export default SearchPage;

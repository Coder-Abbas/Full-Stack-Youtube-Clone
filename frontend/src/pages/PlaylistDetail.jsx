import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Trash2, ArrowLeft, Loader2, Play } from "lucide-react";
import toast from "react-hot-toast";

import Navbar from "../components/navbar/navbar";
import Sidebar from "../components/sidebar";
import VideoPlayer from "../components/Home/videoPlayer";
import usePlaylistStore from "../store/playlistStore";
import useAuthStore from "../store/authStore";

const toHttps = (url) =>
    url ? url.replace(/^http:\/\//i, "https://") : url;

const formatDuration = (seconds = 0) => {
    const total = Math.floor(seconds);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
};

const PlaylistDetail = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(
        typeof window !== "undefined" ? window.innerWidth >= 750 : false
    );
    const { playlistId } = useParams();
    const navigate = useNavigate();
    const { authUser } = useAuthStore();

    const {
        currentPlaylist,
        isLoading,
        error,
        fetchPlaylist,
        deletePlaylist,
        clearCurrentPlaylist,
    } = usePlaylistStore();

    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

    const videos = Array.isArray(currentPlaylist?.videos)
        ? currentPlaylist.videos
        : [];

    // Currently playing video (defaults to the first)
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (playlistId) fetchPlaylist(playlistId);
        return () => clearCurrentPlaylist();
    }, [playlistId, fetchPlaylist, clearCurrentPlaylist]);

    // Reset to the first video whenever a different playlist loads
    useEffect(() => {
        if (currentPlaylist?._id) setCurrentIndex(0);
    }, [currentPlaylist?._id]);

    const currentVideo = videos[currentIndex];

    const playVideo = (index) => setCurrentIndex(index);

    const playNext = () => {
        if (videos.length === 0) return;
        setCurrentIndex((i) => (i + 1) % videos.length);
    };

    const handleDelete = async () => {
        const ok = window.confirm(
            "Delete this playlist? This cannot be undone."
        );
        if (!ok) return;

        const result = await deletePlaylist(playlistId);
        if (result.success) {
            toast.success("Playlist deleted");
            navigate("/playlists");
        } else {
            toast.error("Failed to delete playlist");
        }
    };

    const isOwner =
        authUser &&
        currentPlaylist?.createdBy?._id?.toString() ===
            authUser._id?.toString();

    return (
        <div className="h-screen overflow-hidden bg-[#f9f9f9]">
            <header className="fixed top-0 left-0 right-0 z-50 h-16">
                <Navbar toggleSidebar={toggleSidebar} />
            </header>

            <aside
                className={`
                    fixed left-0 top-16 bottom-0 z-40 transition-all duration-300
                    ${isSidebarOpen ? "w-50" : "w-14 sm:w-20"}
                `}
            >
                <Sidebar isSidebarOpen={isSidebarOpen} />
            </aside>

            <main
                className={`
                    absolute top-16 bottom-0 right-0 overflow-y-auto transition-all duration-300
                    ${isSidebarOpen ? "left-50" : "left-14 sm:left-20"}
                `}
            >
                <div className="max-w-[1500px] mx-auto px-3 py-4 sm:px-4 sm:py-6">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 cursor-pointer"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </button>

                    {isLoading && (
                        <div className="flex justify-center py-20">
                            <Loader2 size={32} className="animate-spin text-gray-400" />
                        </div>
                    )}

                    {!isLoading && error && (
                        <p className="text-red-500 text-center py-20">
                            {error}
                        </p>
                    )}

                    {!isLoading && currentPlaylist && (
                        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6">
                            {/* ================================================= */}
                            {/* LEFT — VIDEO PLAYER */}
                            {/* ================================================= */}

                            <div className="min-w-0">
                                {currentVideo && (
                                    <div
                                        key={currentVideo._id}
                                        className="animate-[fadeIn_0.3s_ease-out]"
                                    >
                                        <VideoPlayer
                                            videoFile={toHttps(currentVideo.videoFile)}
                                            thumbnail={toHttps(currentVideo.thumbnail)}
                                            onNext={playNext}
                                            hasNext={videos.length > 1}
                                        />
                                    </div>
                                )}

                                <h1 className="mt-4 text-xl md:text-2xl font-bold text-gray-900">
                                    {currentVideo?.title}
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    {currentVideo?.views || 0} views
                                </p>
                            </div>

                            {/* ================================================= */}
                            {/* RIGHT — PLAYLIST LIST (YouTube style) */}
                            {/* ================================================= */}

                            <aside className="mt-8 lg:mt-0">
                                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                    {/* Playlist header */}
                                    <div className="px-4 py-3 border-b border-gray-200">
                                        <h2 className="font-bold text-gray-900 truncate">
                                            {currentPlaylist.name}
                                        </h2>
                                        <p className="text-xs text-gray-500">
                                            {videos.length} videos
                                        </p>
                                    </div>

                                    {/* Video list */}
                                    <div className="max-h-[70vh] overflow-y-auto">
                                        {videos.map((video, index) => (
                                            <button
                                                key={video._id}
                                                type="button"
                                                onClick={() => playVideo(index)}
                                                className={`
                                                    flex gap-2 w-full text-left p-2 transition
                                                    ${index === currentIndex
                                                        ? "bg-gray-100"
                                                        : "hover:bg-gray-50"
                                                    }
                                                `}
                                            >
                                                <div className="relative w-24 h-14 flex-shrink-0 rounded overflow-hidden bg-gray-200">
                                                    <img
                                                        src={toHttps(video.thumbnail)}
                                                        alt={video.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-white text-[10px] px-1 rounded">
                                                        {formatDuration(video.duration)}
                                                    </span>
                                                    <span className="absolute top-0.5 left-1 text-[11px] font-medium text-white drop-shadow">
                                                        {index + 1}
                                                    </span>
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                                        {video.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {video.owner?.fullName ||
                                                            video.owner?.username}
                                                    </p>
                                                </div>

                                                {index === currentIndex && (
                                                    <Play
                                                        size={16}
                                                        className="self-center text-gray-700 flex-shrink-0"
                                                    />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {isOwner && (
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        className="mt-3 flex items-center gap-2 px-4 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 transition cursor-pointer"
                                    >
                                        <Trash2 size={16} />
                                        Delete playlist
                                    </button>
                                )}
                            </aside>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default PlaylistDetail;

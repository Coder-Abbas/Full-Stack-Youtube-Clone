import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ListVideo, Loader2 } from "lucide-react";

import Navbar from "../components/navbar/navbar";
import Sidebar from "../components/sidebar";
import PlaylistCard from "../components/playlist/PlaylistCard";
import usePlaylistStore from "../store/playlistStore";
import useAuthStore from "../store/authStore";

const Playlists = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(
        typeof window !== "undefined" ? window.innerWidth >= 750 : false
    );
    const navigate = useNavigate();
    const { authUser } = useAuthStore();

    const {
        userPlaylists,
        isLoading,
        isActionLoading,
        fetchUserPlaylists,
        createPlaylist,
    } = usePlaylistStore();

    const [showCreate, setShowCreate] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

    useEffect(() => {
        if (authUser) fetchUserPlaylists();
    }, [authUser, fetchUserPlaylists]);

    const handleCreate = async () => {
        if (!name.trim()) return;

        const result = await createPlaylist({ name, description });

        if (result.success) {
            setName("");
            setDescription("");
            setShowCreate(false);
            if (result.playlist) {
                navigate(`/playlist/${result.playlist._id}`);
            }
        }
    };

    return (
        <div className="h-screen overflow-hidden bg-gray-50">
            <header className="fixed top-0 left-0 right-0 z-50 h-16">
                <Navbar toggleSidebar={toggleSidebar} />
            </header>

            <aside
                className={`
                    fixed left-0 top-16 bottom-0 z-40 max-[750px]:z-[9999]! transition-all duration-300
                    ${isSidebarOpen ? "w-50" : "w-14 sm:w-20"}
                `}
            >
                <Sidebar isSidebarOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            </aside>

            <main
                className={`
                    absolute top-16 bottom-0 right-0 overflow-y-auto transition-all duration-300
                    left-14 sm:left-20 ${isSidebarOpen ? "min-[750px]:left-50!" : ""}
                `}
            >
                <div className="p-6 max-w-[1400px] mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Your Playlists
                        </h1>
                        <button
                            type="button"
                            onClick={() => setShowCreate(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition cursor-pointer"
                        >
                            <Plus size={18} />
                            New playlist
                        </button>
                    </div>

                    {/* Loading */}
                    {isLoading && (
                        <div className="flex justify-center py-20">
                            <Loader2 size={32} className="animate-spin text-gray-400" />
                        </div>
                    )}

                    {/* Empty */}
                    {!isLoading && userPlaylists.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <ListVideo size={56} className="text-gray-300 mb-4" />
                            <h3 className="font-semibold text-lg text-gray-800">
                                No playlists yet
                            </h3>
                            <p className="text-gray-500 mt-2">
                                Create your first playlist to organize videos.
                            </p>
                        </div>
                    )}

                    {/* Grid */}
                    {!isLoading && userPlaylists.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {userPlaylists.map((playlist) => (
                                <PlaylistCard
                                    key={playlist._id}
                                    playlist={playlist}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Create modal */}
            {showCreate && (
                <div
                    className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4 cursor-pointer"
                    onClick={() => setShowCreate(false)}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-5 cursor-default"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Create playlist
                        </h3>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Playlist name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 mb-3"
                        />
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description (optional)"
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 resize-none mb-4"
                        />

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowCreate(false)}
                                className="px-5 py-2.5 rounded-full hover:bg-gray-100 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleCreate}
                                disabled={isActionLoading || !name.trim()}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                            >
                                {isActionLoading && (
                                    <Loader2 size={16} className="animate-spin" />
                                )}
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Playlists;

import React, { useEffect, useState } from "react";
import { X, Check, Plus, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import usePlaylistStore from "../../store/playlistStore";
import useAuthStore from "../../store/authStore";

const SaveToPlaylist = ({ videoId, isOpen, onClose }) => {
    const { authUser } = useAuthStore();
    const {
        userPlaylists,
        isLoading,
        isActionLoading,
        fetchUserPlaylists,
        createPlaylist,
        addVideo,
        removeVideo,
    } = usePlaylistStore();

    const [showCreate, setShowCreate] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (isOpen && authUser) {
            fetchUserPlaylists();
            setShowCreate(false);
        }
    }, [isOpen, authUser, fetchUserPlaylists]);

    if (!isOpen) return null;

    const isInPlaylist = (playlist) => {
        const videos = playlist.videos || [];
        return videos.some(
            (v) => (v._id || v).toString() === videoId
        );
    };

    const handleToggle = async (playlist) => {
        if (isInPlaylist(playlist)) {
            await removeVideo(playlist._id, videoId);
            return;
        }

        const result = await addVideo(playlist._id, videoId);

        if (result.success) {
            toast.success(`Added to ${playlist.name} playlist`);
            onClose();
        }
    };

    const handleCreate = async () => {
        if (!name.trim()) return;

        const result = await createPlaylist({ name, description });

        if (result.success && result.playlist) {
            // Auto-add the current video to the new playlist
            const addResult = await addVideo(result.playlist._id, videoId);

            if (addResult.success) {
                toast.success(`Added to ${result.playlist.name} playlist`);
                onClose();
            }
        }
    };

    return (
        <div
            className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4 cursor-pointer"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl cursor-default"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                    <h3 className="text-base font-semibold text-gray-900">
                        Save to playlist
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-4 space-y-3">
                    {/* Create new playlist */}
                    {!showCreate ? (
                        <button
                            type="button"
                            onClick={() => setShowCreate(true)}
                            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border border-dashed border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                        >
                            <Plus size={18} />
                            New playlist
                        </button>
                    ) : (
                        <div className="space-y-2 rounded-xl border border-gray-200 p-3">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Playlist name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                            />
                            <textarea
                                value={description}
                                onChange={(e) =>
                                    setDescription(e.target.value)
                                }
                                placeholder="Description (optional)"
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 resize-none text-sm"
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreate(false)}
                                    className="px-3 py-1.5 rounded-full text-sm hover:bg-gray-100 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCreate}
                                    disabled={isActionLoading || !name.trim()}
                                    className="px-3 py-1.5 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                                >
                                    {isActionLoading ? (
                                        <Loader2 size={15} className="animate-spin" />
                                    ) : (
                                        "Create"
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Existing playlists */}
                    {isLoading ? (
                        <div className="flex justify-center py-6">
                            <Loader2 size={28} className="animate-spin text-gray-400" />
                        </div>
                    ) : userPlaylists.length === 0 && !showCreate ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                            You have no playlists yet.
                        </p>
                    ) : (
                        <div className="space-y-1">
                            {userPlaylists.map((playlist) => {
                                const active = isInPlaylist(playlist);
                                return (
                                    <button
                                        key={playlist._id}
                                        type="button"
                                        onClick={() => handleToggle(playlist)}
                                        disabled={isActionLoading}
                                        className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl hover:bg-gray-100 transition cursor-pointer text-left disabled:opacity-60"
                                    >
                                        <div className="min-w-0">
                                            <p className="font-medium text-gray-900 text-sm truncate">
                                                {playlist.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {playlist.totalVideos ||
                                                    playlist.videos?.length ||
                                                    0}{" "}
                                                videos
                                            </p>
                                        </div>
                                        <div
                                            className={`
                                                flex items-center justify-center w-6 h-6 rounded-md border
                                                ${
                                                    active
                                                        ? "bg-blue-600 border-blue-600 text-white"
                                                        : "border-gray-300 text-transparent"
                                                }
                                            `}
                                        >
                                            <Check size={14} />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SaveToPlaylist;

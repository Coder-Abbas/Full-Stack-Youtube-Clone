import React from "react";
import { useNavigate } from "react-router-dom";
import { ListVideo } from "lucide-react";
import useVideoStore from "../../store/videoStore";
import usePlaylistStore from "../../store/playlistStore";

const PlaylistCard = ({ playlist, className = "" }) => {
    const navigate = useNavigate();
    const openSelectedVideo = useVideoStore((state) => state.openSelectedVideo);
    const setActivePlaylist = usePlaylistStore(
        (state) => state.setActivePlaylist
    );

    if (!playlist) return null;

    const handleClick = () => {
        const firstVideo = playlist.videos?.[0];
        const firstId = firstVideo?._id || firstVideo;

        if (firstId) {
            // Open the playlist through the full watch experience
            // (same as selectVideo.jsx) and remember the playlist
            // context so the sidebar can show the rest of the list.
            setActivePlaylist(playlist._id, playlist.name);
            openSelectedVideo(firstId);
            sessionStorage.setItem("selectedVideoId", firstId);
            navigate("/watch");
        } else {
            navigate(`/playlist/${playlist._id}`);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`
                group
                flex
                flex-col
                w-full
                text-left
                rounded-2xl
                overflow-hidden
                bg-white
                border border-gray-200
                hover:shadow-md
                transition
                duration-200
                cursor-pointer
                ${className}
            `}
        >
            {/* Thumbnail */}
            <div className="relative w-full aspect-video bg-gray-200 overflow-hidden">
                {playlist.thumbnail ? (
                    <img
                        src={playlist.thumbnail}
                        alt={playlist.name}
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ListVideo size={40} />
                    </div>
                )}

                <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] font-medium px-1.5 py-0.5 rounded">
                    {playlist.totalVideos || playlist.videos?.length || 0} videos
                </span>
            </div>

            {/* Info */}
            <div className="p-3">
                <h3 className="font-medium text-gray-900 line-clamp-1 group-hover:text-black">
                    {playlist.name}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                    {playlist.createdBy?.fullName ||
                        playlist.createdBy?.username ||
                        "Unknown"}
                </p>
            </div>
        </button>
    );
};

export default PlaylistCard;

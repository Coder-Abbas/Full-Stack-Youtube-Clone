import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    ThumbsUp,
    ThumbsDown,
    Share2,
    Download,
    MoreHorizontal,
    Bell,
    Send,
    X,
    Copy,
    Check,
} from "lucide-react";

import useVideoStore from "../store/videoStore";
import useAuthStore from "../store/authStore";
import Navbar from "../components/navbar/navbar";
import { getSocket } from "../api/socket";

import WatchPageSkeleton from "../components/home/watchPageSkelton";
import VideoPlayer from "../components/Home/videoPlayer";
import RecommendedVideoCard from "../components/Home/RecomendedVideoCard";


const SelectVideo = () => {

    // ==========================================
    // Zustand
    // ==========================================

    const {
        selectedVideo,
        isSelectedVideoLoading,
        selectedVideoError,

        isLiked,
        subscription,
        comments,
        selectedVideoId,

        recommendedVideos,
        isRecommendedLoading,

        getSelectedVideo,
        getRecommendedVideos,
        toggleVideoLike,
        toggleSubscription,
        addComment,
        updateComment,
        deleteComment,
        toggleCommentLike,
    } = useVideoStore();

    // Get store setters for real-time updates
    const setComments = useVideoStore((state) => state.setComments);
    const setSelectedVideoData = useVideoStore((state) => state.setSelectedVideoData);

    const navigate = useNavigate();

    const { authUser } = useAuthStore();


    // ==========================================
    // Comment input
    // ==========================================

    const [comment, setComment] = useState("");
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentValue, setEditingCommentValue] = useState("");


    // ==========================================
    // Share modal
    // ==========================================

    const [isShareOpen, setIsShareOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);


    const [localIsLiked, setLocalIsLiked] = useState(false);
    const [localLikesCount, setLocalLikesCount] = useState();

    const [localSubscription, setLocalSubscription] = useState({
        isSubscribed: false,
        subscribersCount: 0,
    });

    useEffect(() => {
        setLocalIsLiked(isLiked);
    }, [isLiked, selectedVideo?._id]);

    useEffect(() => {
        setLocalLikesCount(selectedVideo?.likesCount ?? 0);
    }, [selectedVideo?._id, selectedVideo?.likesCount]);

    useEffect(() => {
        setLocalSubscription(subscription);
    }, [subscription, selectedVideo?._id]);

    const handleLikeClick = async () => {
        const previousLiked = localIsLiked;
        const previousCount = localLikesCount;

        // Flip instantly
        setLocalIsLiked(!previousLiked);
        setLocalLikesCount(
            previousLiked
                ? Math.max(0, previousCount - 1)
                : previousCount + 1
        );

        const success = await toggleVideoLike();

        // Revert only if the request actually failed
        if (!success) {
            setLocalIsLiked(previousLiked);
            setLocalLikesCount(previousCount);
        }
    };

    const handleSubscribeClick = async () => {
        const previous = localSubscription;

        // Flip instantly
        setLocalSubscription({
            isSubscribed: !previous.isSubscribed,
            subscribersCount: previous.isSubscribed
                ? Math.max(0, previous.subscribersCount - 1)
                : previous.subscribersCount + 1,
        });

        const success = await toggleSubscription();

        // Revert only if the request actually failed
        if (!success) {
            setLocalSubscription(previous);
        }
    };


    // ==========================================
    // Fetch selected video
    // ==========================================

    const storedVideoId =
        typeof window !== "undefined"
            ? sessionStorage.getItem("selectedVideoId")
            : null;

    const activeVideoId = selectedVideoId || storedVideoId;

    const shouldShowSkeleton =
        isSelectedVideoLoading ||
        (activeVideoId && !selectedVideo && !selectedVideoError);

    useEffect(() => {
        getSelectedVideo(selectedVideoId);
    }, [selectedVideoId, getSelectedVideo]);


    // ==========================================
    // Recommended videos — refetch whenever the
    // watched video changes, excluding itself
    // ==========================================

    useEffect(() => {
        if (selectedVideo?._id) {
            getRecommendedVideos(selectedVideo._id);
        }
    }, [selectedVideo?._id, getRecommendedVideos]);


    // ==========================================
    // Next video (keyboard "N" + auto-advance on end)
    // ==========================================

    const openSelectedVideo = useVideoStore((state) => state.openSelectedVideo);

    const handleNextVideo = () => {
        if (recommendedVideos.length === 0) return;

        const next = recommendedVideos[0];

        openSelectedVideo(next._id);
        sessionStorage.setItem("selectedVideoId", next._id);

        navigate(`/watch/${next._id}`);
    };


    // ==========================================
    // Real-time updates via Socket.io
    // ==========================================
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        // Handle real-time video like updates from other users
        const handleVideoLikeUpdate = (data) => {
            if (data?.videoId === selectedVideoId && selectedVideo) {
                setSelectedVideoData({
                    ...selectedVideo,
                    likesCount: data.likesCount,
                });
            }
        };

        // Handle real-time comment like updates from other users
        const handleCommentLikeUpdate = (data) => {
            if (data?.videoId === selectedVideoId) {
                setComments((prev) =>
                    prev.map((c) =>
                        c._id === data.commentId
                            ? {
                                ...c,
                                commentLikesCount: data.likesCount,
                            }
                            : c
                    )
                );
            }
        };

        // Handle real-time new comments from other users
        const handleNewComment = (data) => {
            if (data?.videoId === selectedVideoId && data?.comment) {
                const { comment: newComment } = data;
                // Convert avatar to https
                const converted = {
                    ...newComment,
                    owner: {
                        ...newComment.owner,
                        avatar: newComment.owner?.avatar ?
                            (newComment.owner.avatar.startsWith("http://")
                                ? newComment.owner.avatar.replace("http://", "https://")
                                : newComment.owner.avatar)
                            : newComment.owner?.avatar,
                    },
                };

                setComments((prev) => {
                    // Avoid duplicates
                    if (prev.some((c) => c._id === converted._id)) {
                        return prev;
                    }
                    return [converted, ...prev];
                });
            }
        };

        // Handle comment updates from other users
        const handleUpdateComment = (data) => {
            if (data?.videoId === selectedVideoId && data?.comment) {
                const { comment: updatedComment } = data;
                setComments((prev) =>
                    prev.map((c) =>
                        c._id === updatedComment._id
                            ? {
                                ...c,
                                ...updatedComment,
                            }
                            : c
                    )
                );
            }
        };

        // Handle comment deletions from other users
        const handleDeleteComment = (data) => {
            if (data?.videoId === selectedVideoId && data?.commentId) {
                setComments((prev) =>
                    prev.filter((c) => c._id !== data.commentId)
                );
            }
        };

        // Handle video updates (title, description, views)
        const handleVideoUpdate = (data) => {
            if (data?.videoId === selectedVideoId && data?.video) {
                setSelectedVideoData(data.video);
            }
        };

        // Register socket event listeners
        socket.on("video-like-update", handleVideoLikeUpdate);
        socket.on("comment-like-update", handleCommentLikeUpdate);
        socket.on("new-comment", handleNewComment);
        socket.on("update-comment", handleUpdateComment);
        socket.on("delete-comment", handleDeleteComment);
        socket.on("video-update", handleVideoUpdate);

        // Cleanup
        return () => {
            socket.off("video-like-update", handleVideoLikeUpdate);
            socket.off("comment-like-update", handleCommentLikeUpdate);
            socket.off("new-comment", handleNewComment);
            socket.off("update-comment", handleUpdateComment);
            socket.off("delete-comment", handleDeleteComment);
            socket.off("video-update", handleVideoUpdate);
        };
    }, [selectedVideoId, selectedVideo]);


    // ==========================================
    // Loading
    // ==========================================

    if (shouldShowSkeleton) {
        return <WatchPageSkeleton />;
    }


    // ==========================================
    // Error
    // ==========================================

    if (selectedVideoError) {

        return (
            <div className="min-h-screen bg-[#f9f9f9]">
                <header className="fixed top-0 left-0 right-0 z-50 h-16">
                    <Navbar />
                </header>

                <main className="pt-20">
                    <div className="max-w-[1500px] mx-auto px-4 py-16">
                        <div className="flex justify-center">
                            <div className="rounded-2xl border border-red-100 bg-white px-6 py-4 text-red-500 shadow-sm">
                                {selectedVideoError}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }


    // ==========================================
    // No video
    // ==========================================

    if (!selectedVideo) {

        return (
            <div className="min-h-screen bg-[#f9f9f9]">
                <header className="fixed top-0 left-0 right-0 z-50 h-16">
                    <Navbar />
                </header>

                <main className="pt-20">
                    <div className="max-w-[1500px] mx-auto px-4 py-16">
                        <div className="flex justify-center">
                            <p className="rounded-2xl border border-gray-200 bg-white px-6 py-4 text-gray-500 shadow-sm">
                                Video not found.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }


    // ==========================================
    // Add comment
    // ==========================================

    const handleComment = async () => {
        if (!comment.trim()) return;

        const ok = await addComment(comment);

        if (ok) {
            setComment("");
        }
    };

    const isCommentOwner = (commentItem) => {
        const currentUserId = authUser?._id || authUser?.id;
        const ownerId = commentItem?.owner?._id || commentItem?.owner?.id;

        if (currentUserId && ownerId) {
            return currentUserId === ownerId;
        }

        return authUser?.username ? authUser.username === commentItem?.owner?.username : false;
    };

    const handleDeleteComment = async (commentId) => {
        const ok = await deleteComment(commentId);

        if (ok) {
            if (editingCommentId === commentId) {
                setEditingCommentId(null);
                setEditingCommentValue("");
            }
        }
    };

    const handleSaveEditedComment = async (commentId) => {
        if (!editingCommentValue.trim()) return;

        const ok = await updateComment(commentId, editingCommentValue);

        if (ok) {
            setEditingCommentId(null);
            setEditingCommentValue("");
        }
    };


    // ==========================================
    // Share
    // ==========================================

    const shareUrl = `${window.location.origin}/watch/${selectedVideo._id}`;

    const handleOpenShare = () => {
        setIsCopied(false);
        setIsShareOpen(true);
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy link:", err);
        }
    };


    // ==========================================
    // Download
    // ==========================================

    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = selectedVideo.videoFile;
        link.download = `${selectedVideo.title || "video"}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (

        <div className="min-h-screen bg-[#f9f9f9]">
            <header className="fixed top-0 left-0 right-0 z-50 h-16">
                <Navbar />
            </header>

            <main className="pt-20">
                <div className="max-w-[1500px] mx-auto px-4 py-6">

                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">


                        {/* ================================================= */}
                        {/* LEFT SIDE */}
                        {/* ================================================= */}

                        <main className="min-w-0">

                            {/* Fades in on video change */}
                            <div
                                key={selectedVideo._id}
                                className="animate-[fadeIn_0.3s_ease-out]"
                            >

                                <VideoPlayer
                                    videoFile={selectedVideo.videoFile}
                                    thumbnail={selectedVideo.thumbnail}
                                    onNext={handleNextVideo}
                                    hasNext={recommendedVideos.length > 0}
                                />

                                {/* ================= TITLE ================= */}

                                <h1 className="mt-4 text-xl md:text-2xl font-bold text-gray-900">
                                    {selectedVideo.title}
                                </h1>

                            </div>


                            {/* ================= OWNER + ACTIONS ================= */}

                            <div className="flex flex-wrap items-center justify-between gap-4 py-4">

                                {/* Owner Information - click to open channel */}
                                <div className="flex items-center gap-3">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(`/channel/${selectedVideo.owner.username}`)
                                        }
                                        className="flex-shrink-0"
                                    >
                                        <img
                                            src={selectedVideo.owner.avatar}
                                            alt={selectedVideo.owner.username}
                                            className="w-11 h-11 rounded-full object-cover hover:opacity-80 transition"
                                        />
                                    </button>

                                    <div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate(`/channel/${selectedVideo.owner.username}`)
                                            }
                                            className="font-semibold text-gray-900 hover:text-gray-600 transition"
                                        >
                                            {selectedVideo.owner.fullName}
                                        </button>

                                        <p className="text-sm text-gray-500">
                                            {localSubscription.subscribersCount} subscribers
                                        </p>

                                    </div>

                                    {/* Subscribe - Hide if this is the video owner's own video */}
                                    {authUser?._id !== selectedVideo.owner?._id && (
                                        <button
                                            type="button"
                                            onClick={handleSubscribeClick}
                                            className={`
                                                flex
                                                items-center
                                                gap-2
                                                px-5
                                                py-2.5
                                                ml-2
                                                rounded-full
                                                font-medium
                                                text-sm
                                                cursor-pointer
                                                transition
                                                duration-200
                                                ${localSubscription.isSubscribed
                                                    ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
                                                    : "bg-black text-white hover:bg-gray-800"
                                                }
                                            `}
                                        >
                                            {localSubscription.isSubscribed ? (
                                                <>
                                                    <Bell size={16} />
                                                    Subscribed
                                                </>
                                            ) : (
                                                "Subscribe"
                                            )}
                                        </button>
                                    )}

                                </div>


                                {/* ================= ACTION BUTTONS ================= */}

                                <div className="flex flex-wrap items-center gap-2">

                                    {/* Like */}
                                    <div className="flex items-center bg-gray-100 rounded-full overflow-hidden">

                                        <button
                                            type="button"
                                            onClick={handleLikeClick}
                                            className={`
                                                flex
                                                items-center
                                                gap-2
                                                px-4
                                                py-2.5
                                                cursor-pointer
                                                transition
                                                duration-200
                                                ${localIsLiked ? "bg-gray-300" : "hover:bg-gray-200"}
                                            `}
                                        >
                                            <ThumbsUp
                                                size={18}
                                                fill={localIsLiked ? "currentColor" : "none"}
                                                className="transition-transform duration-200"
                                            />
                                            <span>{localLikesCount}</span>
                                        </button>

                                        <div className="w-px h-6 bg-gray-300" />

                                        <button
                                            type="button"
                                            className="px-4 py-2.5 cursor-pointer hover:bg-gray-200 transition duration-200"
                                        >
                                            <ThumbsDown size={18} />
                                        </button>

                                    </div>

                                    {/* Share */}
                                    <button
                                        type="button"
                                        onClick={handleOpenShare}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-full text-sm font-medium cursor-pointer hover:bg-gray-200 transition duration-200"
                                    >
                                        <Share2 size={18} />
                                        Share
                                    </button>

                                    {/* Download */}
                                    <button
                                        type="button"
                                        onClick={handleDownload}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-full text-sm font-medium cursor-pointer hover:bg-gray-200 transition duration-200"
                                    >
                                        <Download size={18} />
                                        Download
                                    </button>

                                    {/* More */}
                                    <button
                                        type="button"
                                        className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 transition duration-200"
                                    >
                                        <MoreHorizontal size={20} />
                                    </button>

                                </div>

                            </div>


                            {/* ================= DESCRIPTION ================= */}

                            <div className="bg-gray-100 rounded-xl p-4">

                                <div className="font-semibold text-sm mb-2">
                                    {selectedVideo.views} views
                                    {" • "}
                                    {formatDate(selectedVideo.createdAt)}
                                </div>

                                <p className="text-sm text-gray-800 whitespace-pre-line">
                                    {selectedVideo.description}
                                </p>

                            </div>


                            {/* ================= COMMENTS ================= */}

                            <div className="mt-8">

                                <h2 className="text-xl font-bold mb-6">
                                    {comments.length} Comments
                                </h2>

                                {/* Add Comment */}
                                <div className="flex gap-3 mb-8">

                                    <img
                                        src={selectedVideo.owner.avatar}
                                        alt="User"
                                        className="w-10 h-10 rounded-full object-cover"
                                    />

                                    <div className="flex-1">

                                        <input
                                            type="text"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    handleComment();
                                                }
                                            }}
                                            placeholder="Add a comment..."
                                            className="w-full border-b border-gray-300 outline-none py-2 focus:border-black transition duration-150"
                                        />

                                        {comment.trim() && (
                                            <div className="flex justify-end mt-3">
                                                <button
                                                    type="button"
                                                    onClick={handleComment}
                                                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full cursor-pointer hover:bg-gray-800 transition duration-200"
                                                >
                                                    <Send size={16} />
                                                    Comment
                                                </button>
                                            </div>
                                        )}

                                    </div>

                                </div>

                                {/* Comments */}
                                <div className="space-y-7">

                                    {comments.length === 0 ? (

                                        <p className="text-gray-500">
                                            No comments yet. Be the first to comment!
                                        </p>

                                    ) : (

                                        comments.map((commentItem) => (

                                            <div key={commentItem._id} className="flex gap-3">

                                                <img
                                                    src={commentItem.owner.avatar}
                                                    alt={commentItem.owner.username}
                                                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                                />

                                                <div className="flex-1">

                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-sm">
                                                            @{commentItem.owner.username}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {formatDate(commentItem.createdAt)}
                                                        </span>
                                                    </div>

                                                    {editingCommentId === commentItem._id ? (
                                                        <div className="mt-2 space-y-2">
                                                            <input
                                                                type="text"
                                                                value={editingCommentValue}
                                                                onChange={(e) => setEditingCommentValue(e.target.value)}
                                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black transition duration-150"
                                                            />
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleSaveEditedComment(commentItem._id)}
                                                                    className="rounded-full bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 transition duration-200"
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setEditingCommentId(null);
                                                                        setEditingCommentValue("");
                                                                    }}
                                                                    className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition duration-200"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-gray-800 mt-1">
                                                            {commentItem.content}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center gap-4 mt-2">

                                                        <button
                                                            type="button"
                                                            onClick={() => toggleCommentLike(commentItem._id)}
                                                            className={`
                                                                flex
                                                                items-center
                                                                gap-1
                                                                text-sm
                                                                cursor-pointer
                                                                px-2
                                                                py-1
                                                                rounded-full
                                                                transition
                                                                duration-200
                                                                ${commentItem.isLiked ? "bg-gray-200" : "hover:bg-gray-100"}
                                                            `}
                                                        >
                                                            <ThumbsUp size={16} />
                                                            {commentItem.likesCount}
                                                        </button>

                                                        {isCommentOwner(commentItem) && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setEditingCommentId(commentItem._id);
                                                                        setEditingCommentValue(commentItem.content);
                                                                    }}
                                                                    className="text-sm font-medium cursor-pointer hover:bg-gray-100 px-3 py-1 rounded-full transition duration-200"
                                                                >
                                                                    Edit
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteComment(commentItem._id)}
                                                                    className="text-sm font-medium cursor-pointer hover:bg-red-50 px-3 py-1 rounded-full text-red-600 transition duration-200"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </>
                                                        )}

                                                        <button
                                                            type="button"
                                                            className="text-sm font-medium cursor-pointer hover:bg-gray-100 px-3 py-1 rounded-full transition duration-200"
                                                        >
                                                            Reply
                                                        </button>

                                                    </div>

                                                </div>

                                            </div>

                                        ))

                                    )}

                                </div>

                            </div>

                        </main>


                        {/* ================================================= */}
                        {/* RIGHT SIDE — RECOMMENDED */}
                        {/* ================================================= */}

                        <aside className="hidden lg:block">

                            <h2 className="font-bold text-lg mb-4">
                                Recommended
                            </h2>

                            {isRecommendedLoading && (
                                <div className="space-y-3">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div key={i} className="flex gap-3 animate-pulse">
                                            <div className="w-40 h-24 rounded-xl bg-gray-200 flex-shrink-0" />
                                            <div className="flex-1 space-y-2 pt-1">
                                                <div className="h-4 w-full bg-gray-200 rounded" />
                                                <div className="h-3.5 w-2/3 bg-gray-200 rounded" />
                                                <div className="h-3.5 w-1/2 bg-gray-200 rounded" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!isRecommendedLoading && recommendedVideos.length === 0 && (
                                <p className="text-sm text-gray-500">
                                    No recommendations right now.
                                </p>
                            )}

                            {!isRecommendedLoading && recommendedVideos.length > 0 && (
                                <div className="grid grid-cols-1 gap-4">
                                    {recommendedVideos.map((video) => (
                                        <RecommendedVideoCard
                                            key={video._id}
                                            video={video}
                                        />
                                    ))}
                                </div>
                            )}

                        </aside>

                    </div>

                </div>
            </main>


            {/* ================================================= */}
            {/* SHARE MODAL */}
            {/* ================================================= */}

            {isShareOpen && (

                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-[fadeIn_0.15s_ease-out]"
                    onClick={() => setIsShareOpen(false)}
                >

                    <div
                        className="w-full max-w-md bg-white rounded-2xl p-5 shadow-xl animate-[fadeIn_0.2s_ease-out]"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-gray-900">
                                Share
                            </h3>

                            <button
                                type="button"
                                onClick={() => setIsShareOpen(false)}
                                className="p-1.5 rounded-full hover:bg-gray-100 cursor-pointer transition duration-150"
                                aria-label="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 bg-gray-100 rounded-full pl-4 pr-1.5 py-1.5">

                            <input
                                type="text"
                                readOnly
                                value={shareUrl}
                                className="flex-1 bg-transparent text-sm text-gray-700 outline-none truncate"
                                onFocus={(e) => e.target.select()}
                            />

                            <button
                                type="button"
                                onClick={handleCopyLink}
                                className={`
                                    flex
                                    items-center
                                    gap-1.5
                                    px-4
                                    py-2
                                    rounded-full
                                    text-sm
                                    font-medium
                                    cursor-pointer
                                    transition
                                    duration-200
                                    flex-shrink-0
                                    ${isCopied
                                        ? "bg-green-600 text-white"
                                        : "bg-black text-white hover:bg-gray-800"
                                    }
                                `}
                            >
                                {isCopied ? (
                                    <>
                                        <Check size={15} />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy size={15} />
                                        Copy
                                    </>
                                )}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};


// ==========================================
// Date Formatter
// ==========================================

const formatDate = (date) => {

    const uploadDate = new Date(date);
    const now = new Date();

    const difference = now.getTime() - uploadDate.getTime();
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));

    if (days < 1) return "Today";
    if (days === 1) return "1 day ago";
    if (days < 7) return `${days} days ago`;

    if (days < 30) {
        const weeks = Math.floor(days / 7);
        return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
    }

    if (days < 365) {
        const months = Math.floor(days / 30);
        return `${months} ${months === 1 ? "month" : "months"} ago`;
    }

    const years = Math.floor(days / 365);
    return `${years} ${years === 1 ? "year" : "years"} ago`;
};


export default SelectVideo;
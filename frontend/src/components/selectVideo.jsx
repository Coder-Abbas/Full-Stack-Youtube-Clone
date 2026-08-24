import React, { useEffect, useRef, useState } from "react";
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
    Clock,
    Clock3,
    ListVideo,
} from "lucide-react";

import useVideoStore from "../store/videoStore";
import useAuthStore from "../store/authStore";
import Navbar from "../components/navbar/navbar";

import WatchPageSkeleton from "../components/Home/watchPageSkelton";
import VideoPlayer from "../components/Home/videoPlayer";
import RecommendedVideoCard from "../components/Home/RecomendedVideoCard";
import SaveToPlaylist from "../components/playlist/SaveToPlaylist";
import usePlaylistStore from "../store/playlistStore";

const toHttps = (url) =>
    url ? url.replace(/^http:\/\//i, "https://") : url;

// How long to wait after the last click before we actually hit the backend.
const DEBOUNCE_MS = 500;

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
        toggleWatchLater,
        watchLaterVideos,
    } = useVideoStore();

    const {
        activePlaylist,
        currentPlaylist,
        fetchPlaylist,
    } = usePlaylistStore();

    // Get store setters
    const setComments = useVideoStore((state) => state.setComments);

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
    const [localLikesCount, setLocalLikesCount] = useState(0);

    const [localSubscription, setLocalSubscription] = useState({
        isSubscribed: false,
        subscribersCount: 0,
    });

    const [isSaveOpen, setIsSaveOpen] = useState(false);

    // ==========================================
    // Debounce plumbing
    // ==========================================
    // "confirmed*" refs hold the last value we know the BACKEND actually
    // has (seeded from the initial fetch, then updated only after a
    // successful toggle call returns real numbers). Local state is
    // allowed to run ahead of this instantly on every click.
    //
    // When the debounce timer fires, we only call the backend if local
    // state still disagrees with the confirmed value — click an even
    // number of times and land back where you started, and NO network
    // call happens at all (important: these are toggle endpoints, so an
    // extra call would actually flip the backend the wrong way).
    //
    // On success, local state is snapped to whatever the STORE reports
    // back (which is itself the real backend number) — never to our own
    // optimistic guess. That's what prevents double-counting.

    const likeConfirmedRef = useRef({ liked: false, count: 0 });
    const likeTimerRef = useRef(null);

    const subscribeConfirmedRef = useRef({ isSubscribed: false, subscribersCount: 0 });
    const subscribeTimerRef = useRef(null);

    // Per-comment: commentId -> { liked, count }
    const commentLikeConfirmedRef = useRef({});
    // Per-comment: commentId -> timeout id
    const commentLikeTimersRef = useRef({});

    useEffect(() => {
        setLocalIsLiked(isLiked);
        likeConfirmedRef.current = {
            liked: isLiked,
            count: selectedVideo?.likesCount ?? 0,
        };
    }, [isLiked, selectedVideo?._id]);

    useEffect(() => {
        setLocalLikesCount(selectedVideo?.likesCount ?? 0);
    }, [selectedVideo?._id, selectedVideo?.likesCount]);

    useEffect(() => {
        setLocalSubscription(subscription);
        subscribeConfirmedRef.current = subscription ?? {
            isSubscribed: false,
            subscribersCount: 0,
        };
    }, [subscription, selectedVideo?._id]);

    // Clean up any in-flight timers when we navigate away
    useEffect(() => {
        return () => {
            if (likeTimerRef.current) clearTimeout(likeTimerRef.current);
            if (subscribeTimerRef.current) clearTimeout(subscribeTimerRef.current);
            Object.values(commentLikeTimersRef.current).forEach((t) => clearTimeout(t));
        };
    }, []);

    // ==========================================
    // Like (debounced)
    // ==========================================

    const handleLikeClick = () => {
        const previousLiked = localIsLiked;
        const previousCount = localLikesCount;

        const nextLiked = !previousLiked;
        const nextCount = nextLiked
            ? previousCount + 1
            : Math.max(0, previousCount - 1);

        // Flip instantly, every click, no matter how fast
        setLocalIsLiked(nextLiked);
        setLocalLikesCount(nextCount);

        if (likeTimerRef.current) clearTimeout(likeTimerRef.current);

        likeTimerRef.current = setTimeout(async () => {
            const confirmed = likeConfirmedRef.current;

            // Net-zero: user clicked back to the state the backend
            // already has. Nothing to send.
            if (nextLiked === confirmed.liked) return;

            const result = await toggleVideoLike();

            if (result.success) {
                // Snap to whatever the BACKEND actually says. The store
                // already applied this exact number internally — we're
                // just mirroring it here instead of waiting on the sync
                // effect, and critically, NOT adding our own +/-1 on top.
                likeConfirmedRef.current = {
                    liked: result.liked,
                    count: result.likesCount,
                };
                setLocalIsLiked(result.liked);
                setLocalLikesCount(result.likesCount);
            } else {
                // Revert UI to the last known-good backend state
                setLocalIsLiked(confirmed.liked);
                setLocalLikesCount(confirmed.count);
            }
        }, DEBOUNCE_MS);
    };

    // ==========================================
    // Subscribe (debounced)
    // ==========================================

    const handleSubscribeClick = () => {
        const previous = localSubscription;

        const nextIsSubscribed = !previous.isSubscribed;
        const nextCount = nextIsSubscribed
            ? previous.subscribersCount + 1
            : Math.max(0, previous.subscribersCount - 1);

        setLocalSubscription({
            isSubscribed: nextIsSubscribed,
            subscribersCount: nextCount,
        });

        if (subscribeTimerRef.current) clearTimeout(subscribeTimerRef.current);

        subscribeTimerRef.current = setTimeout(async () => {
            const confirmed = subscribeConfirmedRef.current;

            if (nextIsSubscribed === confirmed.isSubscribed) return;

            const result = await toggleSubscription();

            if (result.success) {
                const next = {
                    isSubscribed: result.isSubscribed,
                    subscribersCount: result.subscribersCount,
                };
                subscribeConfirmedRef.current = next;
                setLocalSubscription(next);
            } else {
                setLocalSubscription(confirmed);
            }
        }, DEBOUNCE_MS);
    };

    // ==========================================
    // Comment like (debounced, per comment)
    // ==========================================

    const handleCommentLikeClick = (commentItem) => {
        const commentId = commentItem._id;

        // Lazily seed the "confirmed" backend value for this comment the
        // first time it's clicked.
        if (!commentLikeConfirmedRef.current[commentId]) {
            commentLikeConfirmedRef.current[commentId] = {
                liked: commentItem.isLiked,
                count: commentItem.likesCount,
            };
        }

        const nextLiked = !commentItem.isLiked;
        const nextCount = nextLiked
            ? commentItem.likesCount + 1
            : Math.max(0, commentItem.likesCount - 1);

        // Flip instantly in the comments list
        setComments((prev) =>
            prev.map((c) =>
                c._id === commentId
                    ? { ...c, isLiked: nextLiked, likesCount: nextCount }
                    : c
            )
        );

        if (commentLikeTimersRef.current[commentId]) {
            clearTimeout(commentLikeTimersRef.current[commentId]);
        }

        commentLikeTimersRef.current[commentId] = setTimeout(async () => {
            const confirmed = commentLikeConfirmedRef.current[commentId];

            if (nextLiked === confirmed.liked) return;

            const result = await toggleCommentLike(commentId);

            if (result.success) {
                const next = { liked: result.liked, count: result.likesCount };
                commentLikeConfirmedRef.current[commentId] = next;

                // Snap this comment to the authoritative backend count
                setComments((prev) =>
                    prev.map((c) =>
                        c._id === commentId
                            ? { ...c, isLiked: result.liked, likesCount: result.likesCount }
                            : c
                    )
                );
            } else {
                setComments((prev) =>
                    prev.map((c) =>
                        c._id === commentId
                            ? { ...c, isLiked: confirmed.liked, likesCount: confirmed.count }
                            : c
                    )
                );
            }
        }, DEBOUNCE_MS);
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

    // When a playlist is being watched, load its video list so the
    // right sidebar can show the rest of the videos.
    useEffect(() => {
        if (activePlaylist?._id) {
            fetchPlaylist(activePlaylist._id);
        }
    }, [activePlaylist?._id, fetchPlaylist]);


    // ==========================================
    // Next video
    // ==========================================

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
            delete commentLikeConfirmedRef.current[commentId];
            if (commentLikeTimersRef.current[commentId]) {
                clearTimeout(commentLikeTimersRef.current[commentId]);
                delete commentLikeTimersRef.current[commentId];
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
            
        }
    };


    // ==========================================
    // Watch Later
    // ==========================================

    const isInWatchLater = watchLaterVideos.some(
        (v) => (v._id || v) === selectedVideo._id
    );

    const handleWatchLaterClick = async () => {
        if (!authUser) {
            navigate("/login");
            return;
        }

        await toggleWatchLater(selectedVideo._id);
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
                <div className="max-w-[1500px] mx-auto px-3 py-4 sm:px-4 sm:py-6">

                        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6">


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

                                    {/* Watch Later */}
                                    <button
                                        type="button"
                                        onClick={handleWatchLaterClick}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium cursor-pointer transition duration-200 ${isInWatchLater
                                            ? "bg-gray-300 text-gray-900 hover:bg-gray-400"
                                            : "bg-gray-100 hover:bg-gray-200"
                                            }`}
                                    >
                                        {isInWatchLater ? (
                                            <>
                                                <Clock3 size={18} fill="currentColor" />
                                                Saved
                                            </>
                                        ) : (
                                            <>
                                                <Clock size={18} />
                                                Watch Later
                                            </>
                                        )}
                                    </button>

                                    {/* Save to playlist */}
                                    {authUser && (
                                        <button
                                            type="button"
                                            onClick={() => setIsSaveOpen(true)}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-full text-sm font-medium cursor-pointer hover:bg-gray-200 transition duration-200"
                                        >
                                            <ListVideo size={18} />
                                            Save
                                        </button>
                                    )}

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
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCommentLikeClick(commentItem);
                                                            }}
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

                        <aside className="mt-8 lg:mt-0">

                            {/* Up next in playlist — same card style as recommendations */}
                            {activePlaylist && currentPlaylist?.videos?.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="font-bold text-lg mb-1">
                                        Up next in playlist
                                    </h2>
                                    <p className="text-sm text-gray-500 mb-4">
                                        {activePlaylist.name}
                                    </p>
                                    <div className="space-y-2">
                                        {currentPlaylist.videos.map((video) => (
                                            <div
                                                key={video._id}
                                                className={
                                                    video._id === selectedVideo?._id
                                                        ? "opacity-60 pointer-events-none"
                                                        : ""
                                                }
                                            >
                                                <RecommendedVideoCard
                                                    video={{
                                                        ...video,
                                                        thumbnail: toHttps(video.thumbnail),
                                                        videoFile: toHttps(video.videoFile),
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

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

            {/* ================================================= */}
            {/* SAVE TO PLAYLIST MODAL */}
            {/* ================================================= */}

            {isSaveOpen && selectedVideo && (
                <SaveToPlaylist
                    videoId={selectedVideo._id}
                    isOpen={isSaveOpen}
                    onClose={() => setIsSaveOpen(false)}
                />
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
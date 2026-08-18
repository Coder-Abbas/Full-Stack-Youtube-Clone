import React, { useEffect, useState } from "react";

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


const WatchPageSkeleton = () => {

    return (

        <div className="min-h-screen bg-[#f9f9f9]">
            <header className="fixed top-0 left-0 right-0 z-50 h-16">
                <Navbar />
            </header>

            <main className="pt-20">
                <div className="max-w-[1500px] mx-auto px-4 py-6">

                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 animate-pulse">

                        <main className="min-w-0">

                            <div className="w-full aspect-video rounded-xl bg-gray-200" />

                            <div className="mt-4 h-7 w-4/5 bg-gray-200 rounded" />

                            <div className="flex flex-wrap items-center justify-between gap-4 py-4">

                                <div className="flex items-center gap-3 flex-1 min-w-0">

                                    <div className="w-11 h-11 rounded-full bg-gray-200 flex-shrink-0" />

                                    <div className="space-y-2 flex-1">

                                        <div className="h-4 w-40 bg-gray-200 rounded" />

                                        <div className="h-3.5 w-24 bg-gray-200 rounded" />

                                    </div>

                                    <div className="w-28 h-10 bg-gray-200 rounded-full" />

                                </div>

                                <div className="flex flex-wrap items-center gap-2">

                                    <div className="w-28 h-10 bg-gray-200 rounded-full" />

                                    <div className="w-24 h-10 bg-gray-200 rounded-full" />

                                    <div className="w-24 h-10 bg-gray-200 rounded-full" />

                                    <div className="w-10 h-10 bg-gray-200 rounded-full" />

                                </div>

                            </div>

                            <div className="bg-gray-100 rounded-xl p-4 space-y-3">

                                <div className="h-4 w-36 bg-gray-200 rounded" />

                                <div className="h-3.5 w-full bg-gray-200 rounded" />

                                <div className="h-3.5 w-11/12 bg-gray-200 rounded" />

                                <div className="h-3.5 w-10/12 bg-gray-200 rounded" />

                            </div>

                            <div className="mt-8 space-y-5">

                                <div className="h-6 w-40 bg-gray-200 rounded" />

                                <div className="flex gap-3">

                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />

                                    <div className="flex-1 space-y-3 pt-1">

                                        <div className="h-4 w-full bg-gray-200 rounded" />

                                        <div className="flex justify-end">

                                            <div className="w-28 h-10 bg-gray-200 rounded-full" />

                                        </div>

                                    </div>

                                </div>

                                <div className="space-y-4">

                                    <div className="flex gap-3">

                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />

                                        <div className="flex-1 space-y-2 pt-1">

                                            <div className="h-4 w-32 bg-gray-200 rounded" />

                                            <div className="h-4 w-full bg-gray-200 rounded" />

                                        </div>

                                    </div>

                                    <div className="flex gap-3">

                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />

                                        <div className="flex-1 space-y-2 pt-1">

                                            <div className="h-4 w-28 bg-gray-200 rounded" />

                                            <div className="h-4 w-11/12 bg-gray-200 rounded" />

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </main>

                        <aside className="hidden lg:block space-y-4">

                            <div className="h-6 w-36 bg-gray-200 rounded" />

                            <div className="space-y-3">

                                <div className="flex gap-3">

                                    <div className="w-40 h-24 rounded-xl bg-gray-200 flex-shrink-0" />

                                    <div className="flex-1 space-y-2 pt-1">

                                        <div className="h-4 w-full bg-gray-200 rounded" />

                                        <div className="h-3.5 w-2/3 bg-gray-200 rounded" />

                                        <div className="h-3.5 w-1/2 bg-gray-200 rounded" />

                                    </div>

                                </div>

                                <div className="flex gap-3">

                                    <div className="w-40 h-24 rounded-xl bg-gray-200 flex-shrink-0" />

                                    <div className="flex-1 space-y-2 pt-1">

                                        <div className="h-4 w-full bg-gray-200 rounded" />

                                        <div className="h-3.5 w-2/3 bg-gray-200 rounded" />

                                        <div className="h-3.5 w-1/2 bg-gray-200 rounded" />

                                    </div>

                                </div>

                            </div>

                        </aside>

                    </div>

                </div>
            </main>
        </div>

    );
};


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

        getSelectedVideo,
        toggleVideoLike,
        toggleSubscription,
        addComment,
        updateComment,
        deleteComment,
        toggleCommentLike,
    } = useVideoStore();

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


                            {/* ================= VIDEO ================= */}

                            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">

                                <video
                                    src={selectedVideo.videoFile}
                                    poster={selectedVideo.thumbnail}
                                    controls
                                    className="
                                    w-full
                                    h-full
                                    object-contain
                                "
                                />

                            </div>


                            {/* ================= TITLE ================= */}

                            <h1
                                className="
                                mt-4
                                text-xl
                                md:text-2xl
                                font-bold
                                text-gray-900
                            "
                            >
                                {selectedVideo.title}
                            </h1>


                            {/* ================= OWNER + ACTIONS ================= */}

                            <div
                                className="
                                flex
                                flex-wrap
                                items-center
                                justify-between
                                gap-4
                                py-4
                            "
                            >

                                {/* Owner Information */}

                                <div className="flex items-center gap-3">

                                    <img
                                        src={
                                            selectedVideo.owner.avatar
                                        }
                                        alt={
                                            selectedVideo.owner.username
                                        }
                                        className="
                                        w-11
                                        h-11
                                        rounded-full
                                        object-cover
                                    "
                                    />


                                    <div>

                                        <h2
                                            className="
                                            font-semibold
                                            text-gray-900
                                        "
                                        >
                                            {
                                                selectedVideo.owner
                                                    .fullName
                                            }
                                        </h2>


                                        <p
                                            className="
                                            text-sm
                                            text-gray-500
                                        "
                                        >
                                            {
                                                subscription.subscribersCount
                                            }{" "}
                                            subscribers
                                        </p>

                                    </div>


                                    {/* Subscribe - Hide if this is the video owner's own video */}
                                    {authUser?._id !== selectedVideo.owner?._id && (
                                        <button
                                            type="button"
                                            onClick={toggleSubscription}
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
                                                        ${
                                                            subscription.isSubscribed
                                                                ? `
                                                                    bg-gray-200
                                                                    text-gray-900
                                                                    hover:bg-gray-300
                                                                `
                                                                : `
                                                                    bg-black
                                                                    text-white
                                                                    hover:bg-gray-800
                                                                `
                                                        }
                                                    `}
                                        >

                                            {subscription.isSubscribed ? (
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

                                <div
                                    className="
                                    flex
                                    flex-wrap
                                    items-center
                                    gap-2
                                "
                                >

                                    {/* Like */}

                                    <div
                                        className="
                                        flex
                                        items-center
                                        bg-gray-100
                                        rounded-full
                                        overflow-hidden
                                    "
                                    >

                                        <button
                                            type="button"
                                            onClick={toggleVideoLike}
                                            className={`
                                            flex
                                            items-center
                                            gap-2
                                            px-4
                                            py-2.5
                                            cursor-pointer
                                            transition
                                            ${isLiked
                                                    ? "bg-gray-300"
                                                    : "hover:bg-gray-200"
                                                }
                                        `}
                                        >

                                            <ThumbsUp
                                                size={18}
                                                fill={
                                                    isLiked
                                                        ? "currentColor"
                                                        : "none"
                                                }
                                            />

                                            <span>
                                                {
                                                    selectedVideo.likesCount
                                                }
                                            </span>

                                        </button>


                                        <div className="w-px h-6 bg-gray-300" />


                                        <button
                                            type="button"
                                            className="
                                            px-4
                                            py-2.5
                                            cursor-pointer
                                            hover:bg-gray-200
                                        "
                                        >
                                            <ThumbsDown size={18} />
                                        </button>

                                    </div>


                                    {/* Share */}

                                    <button
                                        type="button"
                                        onClick={handleOpenShare}
                                        className="
                                        flex
                                        items-center
                                        gap-2
                                        px-4
                                        py-2.5
                                        bg-gray-100
                                        rounded-full
                                        text-sm
                                        font-medium
                                        cursor-pointer
                                        hover:bg-gray-200
                                    "
                                    >

                                        <Share2 size={18} />

                                        Share

                                    </button>


                                    {/* Download */}

                                    <button
                                        type="button"
                                        onClick={handleDownload}
                                        className="
                                        flex
                                        items-center
                                        gap-2
                                        px-4
                                        py-2.5
                                        bg-gray-100
                                        rounded-full
                                        text-sm
                                        font-medium
                                        cursor-pointer
                                        hover:bg-gray-200
                                    "
                                    >

                                        <Download size={18} />

                                        Download

                                    </button>


                                    {/* More */}

                                    <button
                                        type="button"
                                        className="
                                        flex
                                        items-center
                                        justify-center
                                        w-10
                                        h-10
                                        bg-gray-100
                                        rounded-full
                                        cursor-pointer
                                        hover:bg-gray-200
                                    "
                                    >

                                        <MoreHorizontal size={20} />

                                    </button>

                                </div>

                            </div>


                            {/* ================= DESCRIPTION ================= */}

                            <div
                                className="
                                bg-gray-100
                                rounded-xl
                                p-4
                            "
                            >

                                <div
                                    className="
                                    font-semibold
                                    text-sm
                                    mb-2
                                "
                                >

                                    {selectedVideo.views} views

                                    {" • "}

                                    {formatDate(
                                        selectedVideo.createdAt
                                    )}

                                </div>


                                <p
                                    className="
                                    text-sm
                                    text-gray-800
                                    whitespace-pre-line
                                "
                                >
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
                                        src={
                                            selectedVideo.owner.avatar
                                        }
                                        alt="User"
                                        className="
                                        w-10
                                        h-10
                                        rounded-full
                                        object-cover
                                    "
                                    />


                                    <div className="flex-1">

                                        <input
                                            type="text"
                                            value={comment}
                                            onChange={(e) =>
                                                setComment(
                                                    e.target.value
                                                )
                                            }
                                            onKeyDown={(e) => {

                                                if (
                                                    e.key === "Enter"
                                                ) {
                                                    handleComment();
                                                }

                                            }}
                                            placeholder="Add a comment..."
                                            className="
                                            w-full
                                            border-b
                                            border-gray-300
                                            outline-none
                                            py-2
                                            focus:border-black
                                        "
                                        />


                                        {comment.trim() && (

                                            <div
                                                className="
                                                flex
                                                justify-end
                                                mt-3
                                            "
                                            >

                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleComment
                                                    }
                                                    className="
                                                    flex
                                                    items-center
                                                    gap-2
                                                    px-4
                                                    py-2
                                                    bg-black
                                                    text-white
                                                    rounded-full
                                                    cursor-pointer
                                                    hover:bg-gray-800
                                                "
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

                                            No comments yet.

                                            Be the first to comment!

                                        </p>

                                    ) : (

                                        comments.map((comment) => (

                                            <div
                                                key={comment._id}
                                                className="
                                                flex
                                                gap-3
                                            "
                                            >

                                                {/* Avatar */}

                                                <img
                                                    src={
                                                        comment.owner
                                                            .avatar
                                                    }
                                                    alt={
                                                        comment.owner
                                                            .username
                                                    }
                                                    className="
                                                    w-10
                                                    h-10
                                                    rounded-full
                                                    object-cover
                                                    flex-shrink-0
                                                "
                                                />


                                                {/* Comment Content */}

                                                <div className="flex-1">

                                                    <div
                                                        className="
                                                        flex
                                                        items-center
                                                        gap-2
                                                    "
                                                    >

                                                        <span
                                                            className="
                                                            font-semibold
                                                            text-sm
                                                        "
                                                        >
                                                            @
                                                            {
                                                                comment.owner
                                                                    .username
                                                            }
                                                        </span>


                                                        <span
                                                            className="
                                                            text-xs
                                                            text-gray-500
                                                        "
                                                        >
                                                            {
                                                                formatDate(
                                                                    comment.createdAt
                                                                )
                                                            }
                                                        </span>

                                                    </div>


                                                    {editingCommentId === comment._id ? (
                                                        <div className="mt-2 space-y-2">
                                                            <input
                                                                type="text"
                                                                value={editingCommentValue}
                                                                onChange={(e) => setEditingCommentValue(e.target.value)}
                                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                                                            />

                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleSaveEditedComment(comment._id)}
                                                                    className="rounded-full bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setEditingCommentId(null);
                                                                        setEditingCommentValue("");
                                                                    }}
                                                                    className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p
                                                            className="
                                                            text-sm
                                                            text-gray-800
                                                            mt-1
                                                        "
                                                        >
                                                            {
                                                                comment.content
                                                            }
                                                        </p>
                                                    )}


                                                    <div
                                                        className="
                                                        flex
                                                        items-center
                                                        gap-4
                                                        mt-2
                                                    "
                                                    >

                                                        <button
                                                            type="button"
                                                            onClick={() => toggleCommentLike(comment._id)}
                                                            className={`
                                                            flex
                                                            items-center
                                                            gap-1
                                                            text-sm
                                                            cursor-pointer
                                                            px-2
                                                            py-1
                                                            rounded-full
                                                            ${comment.isLiked
                                                                    ? "bg-gray-200"
                                                                    : "hover:bg-gray-100"
                                                                }
                                                        `}
                                                        >

                                                            <ThumbsUp
                                                                size={16}
                                                            />

                                                            {
                                                                comment.likesCount
                                                            }

                                                        </button>

                                                        {isCommentOwner(comment) && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setEditingCommentId(comment._id);
                                                                        setEditingCommentValue(comment.content);
                                                                    }}
                                                                    className="text-sm font-medium cursor-pointer hover:bg-gray-100 px-3 py-1 rounded-full"
                                                                >
                                                                    Edit
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteComment(comment._id)}
                                                                    className="text-sm font-medium cursor-pointer hover:bg-red-50 px-3 py-1 rounded-full text-red-600"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </>
                                                        )}


                                                        <button
                                                            type="button"
                                                            className="
                                                            text-sm
                                                            font-medium
                                                            cursor-pointer
                                                            hover:bg-gray-100
                                                            px-3
                                                            py-1
                                                            rounded-full
                                                        "
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
                        {/* RIGHT SIDE */}
                        {/* ================================================= */}

                        <aside className="hidden lg:block">

                            <h2 className="font-bold text-lg mb-4">
                                Recommended
                            </h2>


                            {/* You can later populate this
                            using your videos API */}

                            <div className="space-y-4">

                                <p className="text-sm text-gray-500">
                                    Recommended videos will appear here.
                                </p>

                            </div>

                        </aside>

                    </div>

                </div>
            </main>


            {/* ================================================= */}
            {/* SHARE MODAL */}
            {/* ================================================= */}

            {isShareOpen && (

                <div
                    className="
                        fixed
                        inset-0
                        z-50
                        flex
                        items-center
                        justify-center
                        bg-black/50
                        px-4
                    "
                    onClick={() => setIsShareOpen(false)}
                >

                    <div
                        className="
                            w-full
                            max-w-md
                            bg-white
                            rounded-2xl
                            p-5
                            shadow-xl
                        "
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                mb-4
                            "
                        >

                            <h3 className="text-base font-semibold text-gray-900">
                                Share
                            </h3>

                            <button
                                type="button"
                                onClick={() => setIsShareOpen(false)}
                                className="
                                    p-1.5
                                    rounded-full
                                    hover:bg-gray-100
                                    cursor-pointer
                                "
                                aria-label="Close"
                            >
                                <X size={18} />
                            </button>

                        </div>


                        <div
                            className="
                                flex
                                items-center
                                gap-2
                                bg-gray-100
                                rounded-full
                                pl-4
                                pr-1.5
                                py-1.5
                            "
                        >

                            <input
                                type="text"
                                readOnly
                                value={shareUrl}
                                className="
                                    flex-1
                                    bg-transparent
                                    text-sm
                                    text-gray-700
                                    outline-none
                                    truncate
                                "
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

    const difference =
        now.getTime() - uploadDate.getTime();

    const days = Math.floor(
        difference / (1000 * 60 * 60 * 24)
    );


    if (days < 1) {
        return "Today";
    }


    if (days === 1) {
        return "1 day ago";
    }


    if (days < 7) {
        return `${days} days ago`;
    }


    if (days < 30) {

        const weeks = Math.floor(
            days / 7
        );

        return `${weeks} ${weeks === 1 ? "week" : "weeks"
            } ago`;
    }


    if (days < 365) {

        const months = Math.floor(
            days / 30
        );

        return `${months} ${months === 1 ? "month" : "months"
            } ago`;
    }


    const years = Math.floor(
        days / 365
    );

    return `${years} ${years === 1 ? "year" : "years"
        } ago`;
};


export default SelectVideo;
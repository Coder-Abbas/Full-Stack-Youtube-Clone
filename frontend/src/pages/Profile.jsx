import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    Video,
    Settings,
    Search,
    X,
    FileText,
    Heart,
    Eye,
} from "lucide-react";
import Cropper from "react-easy-crop";
import toast from "react-hot-toast";

import Navbar from "../components/navbar/navbar";
import Sidebar from "../components/sidebar";
import ProfileVideoCard from "../components/videoCards/myProfileCard";
import ProfileSkeleton from "../components/ProfileSkeleton";
import useChannelStore from "../store/channelStore";
import useAuthStore from "../store/authStore";





const Profile = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState("videos");
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
    const [showAvatar, setShowAvatar] = useState(false);
    const [showAvatarEditor, setShowAvatarEditor] = useState(false);

    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
    const [isAvatarLoading, setIsAvatarLoading] = useState(true);

    const [totalSubscribers, setTotalSubscribers] = useState(0);
    const [totalVideos, setTotalVideos] = useState(0);


    const {
        authUser,
        isCheckingAuth,
    } = useAuthStore();

    const {
        channel,
        channelVideos,
        isLoading,
        error,
        subscribersCount,
        channelUpdatedVersion,
        getMyChannel,
        getMyVideos,
        updateAvatar,
    } = useChannelStore();

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    useEffect(() => {
        // Only fetch channel data if user is logged in
        if (!authUser || isCheckingAuth) return;

        getMyChannel();
        getMyVideos();
        setTotalSubscribers(subscribersCount || 0);
        setTotalVideos(channelVideos?.length || 0);
    }, [getMyChannel, getMyVideos, subscribersCount, channelVideos, channelUpdatedVersion, authUser, isCheckingAuth]);

    // Search videos
    const filteredVideos = useMemo(() => {
        if (!searchQuery.trim()) {
            return channelVideos;
        }

        return channelVideos.filter((video) =>
            video.title?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [channelVideos, searchQuery]);

    // Loading
    if (isLoading && !channel) {
        return (
            <div className="min-h-screen bg-[#f9f9f9]">
                <header className="fixed top-0 left-0 right-0 z-50 h-16">
                    <Navbar toggleSidebar={toggleSidebar} />
                </header>

                <aside
                    className={`fixed left-0 top-16 bottom-0 z-40 transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-20"
                        }`}
                >
                    <Sidebar isSidebarOpen={isSidebarOpen} />
                </aside>

                <main
                    className={`pt-16 transition-all duration-300 ${isSidebarOpen ? "pl-64" : "pl-20"
                        }`}
                >
                    <ProfileSkeleton />
                </main>
            </div>
        );
    }

    if (!authUser && !isCheckingAuth) {
        return (
            <div className="h-screen overflow-hidden bg-gray-50">

                {/* Navbar */}
                <header className="fixed top-0 left-0 right-0 z-50 h-16">
                    <Navbar toggleSidebar={toggleSidebar} />
                </header>

                {/* Sidebar */}
                <aside
                    className={`
                    fixed
                    left-0
                    top-16
                    bottom-0
                    z-40
                    transition-all
                    duration-300
                    ${isSidebarOpen ? "w-64" : "w-20"}
                `}
                >
                    <Sidebar isSidebarOpen={isSidebarOpen} />
                </aside>
                {/* Main */}
                <main
                    className={`
                    absolute
                    top-16
                    bottom-0
                    right-0
                    overflow-y-auto
                    transition-all
                    duration-300
                    ${isSidebarOpen ? "left-64" : "left-20"}
                `}
                >
                    <div className="flex flex-col items-center justify-center h-full">
                        <p className="text-gray-700 text-lg mb-4">
                            Please log in to view your liked videos.
                        </p>

                        <Link
                            to="/login"
                            className="px-6 py-1 font-medium text-[22px] border border-blue-500  text-blue-500 rounded-lg transition duration-400 hover:bg-blue-400 hover:text-white transition"
                        >
                            Login
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    const createCroppedImage = async (imageSrc, pixelCrop) => {
        const image = new Image();

        image.src = imageSrc;

        await new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = reject;
        });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
            throw new Error("Could not create canvas context");
        }

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error("Failed to crop image"));
                        return;
                    }

                    const file = new File(
                        [blob],
                        "avatar.jpg",
                        {
                            type: "image/jpeg",
                        }
                    );

                    resolve(file);
                },
                "image/jpeg",
                0.9
            );
        });
    };


   const handleUpdateAvatar = async () => {
    if (!selectedFile) {
        toast.error("Please select an image.");
        return;
    }

    if (!selectedImage) {
        toast.error("Image preview is missing.");
        return;
    }

    if (!croppedAreaPixels) {
        toast.error("Please select the area of the image.");
        return;
    }

    try {
        setIsUpdatingAvatar(true);

        // Create cropped image
        const croppedFile = await createCroppedImage(
            selectedImage,
            croppedAreaPixels
        );

        // Upload avatar
        const result = await updateAvatar(croppedFile);

        // Check response
        if (!result?.success) {
            toast.error(
                result?.message || "Failed to update profile picture."
            );
            return;
        }

        // Close editor
        setShowAvatarEditor(false);

        // Reset
        setSelectedImage(null);
        setSelectedFile(null);
        setCroppedAreaPixels(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);

        // Success message
        toast.success("Profile picture updated successfully!");

        // Wait 2 seconds, then reload
        setTimeout(() => {
            window.location.reload();
        }, 2000);

    } catch (error) {
        console.error("Avatar update error:", error);

        toast.error(
            error?.message || "Failed to update profile picture."
        );

    } finally {
        setIsUpdatingAvatar(false);
    }
};

    return (
        <div className="h-screen overflow-hidden bg-[#f9f9f9]">
            {/* ================= NAVBAR ================= */}
            <header className="fixed top-0 left-0 right-0 z-50 h-16">
                <Navbar toggleSidebar={toggleSidebar} />
            </header>

            {/* ================= SIDEBAR ================= */}
            <aside
                className={`fixed left-0 top-16 bottom-0 z-40 transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-20"
                    }`}
            >
                <Sidebar isSidebarOpen={isSidebarOpen} />
            </aside>

            {/* ================= MAIN ================= */}
            <main
                className={`pt-16 h-screen transition-all duration-300 ${isSidebarOpen ? "pl-64" : "pl-20"
                    }`}
            >
                <div className="h-full max-w-7xl mx-auto flex flex-col">
                    <section className="flex-shrink-0 px-6 md:px-10 pt-8 pb-6 bg-[#f9f9f9]">

                        <div className="flex flex-col md:flex-row md:items-center gap-6">

                            {/* Avatar */}
                            <div className="relative flex-shrink-0">

                                <button
                                    type="button"
                                    onClick={() => setAvatarMenuOpen((prev) => !prev)}
                                    className="relative group cursor-pointer rounded-full focus:outline-none"
                                >
                                    <img
                                        src={authUser?.avatar || "/default-avatar.png"}
                                        alt={channel?.username || "Profile"}
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

                                {/* Avatar Menu */}
                                {avatarMenuOpen && (
                                    <div
                                        className="
                absolute
                left-1/2
                top-full
                -translate-x-1/2
                mt-3
                w-48
                bg-white
                rounded-xl
                shadow-xl
                border
                border-gray-200
                overflow-hidden
                z-50
            "
                                    >
                                        <button
                                            onClick={() => {
                                                setShowAvatar(true);
                                                setAvatarMenuOpen(false);
                                            }}
                                            className="
                    w-full
                    px-4
                    py-3
                    text-left
                    hover:bg-gray-100
                    flex
                    items-center
                    gap-3 cursor-pointer
                "
                                        >
                                            <Eye size={18} />
                                            Show image
                                        </button>

                                        <button
                                            onClick={() => {
                                                setShowAvatarEditor(true);
                                                setAvatarMenuOpen(false);
                                            }}
                                            className="
                    w-full
                    px-4
                    py-3
                    text-left
                    hover:bg-gray-100
                    flex
                    items-center
                    gap-3
                    cursor-pointer
                "
                                        >
                                            <Settings size={18} />
                                            Update image
                                        </button>
                                    </div>
                                )}
                            </div>
                            {/* Profile Details */}
                            <div className="flex-1 min-w-0">

                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 truncate">
                                    {channel?.fullName || "User"}
                                </h1>

                                <p className="text-gray-600 mt-1">
                                    @{channel?.username || "username"}
                                </p>

                                {/* Stats */}
                                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-sm md:text-base text-gray-700">
                                    <span>
                                        <strong className="text-gray-900">
                                            {channel?.subscribersCount ?? 0}
                                        </strong>{" "}
                                        subscribers
                                    </span>

                                    <span>
                                        <strong className="text-gray-900">
                                            {channelVideos.length}
                                        </strong>{" "}
                                        videos
                                    </span>
                                </div>

                                {/* Edit Profile */}
                                <div className="mt-5">
                                    <Link
                                        to="/settings"
                                        className="
                                            inline-flex
                                            items-center
                                            gap-2
                                            px-5
                                            py-2.5
                                            bg-black
                                            text-white
                                            rounded-full
                                            font-medium
                                            hover:bg-gray-800
                                            transition
                                        "
                                    >
                                        <Settings size={18} />
                                        Edit Profile
                                    </Link>
                                </div>
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
                                        ${activeTab === "videos"
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
                                        ${activeTab === "posts"
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

                                {/* Liked Videos */}
                                <Link
                                    to="/liked-videos"
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        py-4
                                        font-medium
                                        text-gray-500
                                        hover:text-gray-900
                                        whitespace-nowrap
                                        transition
                                    "
                                >
                                    <Heart size={18} />
                                    Liked Videos
                                </Link>
                            </div>

                            {/* Search */}
                            <div className="flex items-center ml-4">

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
                                    <div className="flex items-center gap-2">

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
                                                onChange={(e) =>
                                                    setSearchQuery(
                                                        e.target.value
                                                    )
                                                }
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

                            {/* ================= VIDEOS ================= */}
                            {activeTab === "videos" && (
                                <div className="pt-6">

                                    {filteredVideos.length === 0 ? (
                                        <div className="
                                            rounded-2xl
                                            py-10
                                            text-center
                                        ">
                                            <Video
                                                size={56}
                                                className="mx-auto text-gray-300 mb-4"
                                            />

                                            <h3 className="font-semibold text-xl text-gray-800">
                                                {searchQuery
                                                    ? "No videos found"
                                                    : "No videos yet"}
                                            </h3>

                                            <p className="text-gray-500 mt-2">
                                                {searchQuery
                                                    ? "Try a different search."
                                                    : "Upload your first video."}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="
                                            grid
                                            grid-cols-1
                                            sm:grid-cols-2
                                            lg:grid-cols-3
                                            xl:grid-cols-3
                                            gap-2
                                        ">
                                            {filteredVideos.map((video) => (
                                                <ProfileVideoCard
                                                    key={video._id}
                                                    video={video}
                                                    onUpdate={getMyVideos}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ================= POSTS ================= */}
                            {activeTab === "posts" && (
                                <div className="
                                    flex
                                    flex-col
                                    items-center
                                    py-13
                                    justify-center
                                    text-center
                                ">
                                    <div className="
                                        w-16
                                        h-16
                                        flex
                                        items-center
                                        justify-center
                                        rounded-full
                                        mb-4
                                    ">
                                        <FileText
                                            size={30}
                                            className="text-gray-400"
                                        />
                                    </div>

                                    <h3 className="text-xl font-semibold text-gray-800">
                                        No posts yet
                                    </h3>

                                    <p className="text-gray-500 mt-2">
                                        Your posts will appear here.
                                    </p>
                                </div>
                            )}

                        </div>
                    </section>

                    {/* ================= ERROR ================= */}
                    {error && (
                        <div className="flex justify-center py-4">
                            <p className="text-red-500">{error}</p>
                        </div>
                    )}
                </div>
            </main>
            {/* Avatar Preview Dialog */}
            {showAvatar && (
                <div
                    className="fixed  inset-0 z-[100] bg-black/70 flex items-center justify-center"
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
                            src={channel?.avatar || "/default-avatar.png"}
                            alt="Profile"
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

            {showAvatarEditor && (
                <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">

                    <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden">

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b">
                            <h2 className="text-xl font-semibold">
                                Update profile picture
                            </h2>

                            <button
                                onClick={() => {
                                    setShowAvatarEditor(false);
                                    setSelectedImage(null);
                                }}
                                className="p-2 rounded-full hover:bg-gray-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Select Image */}
                        {!selectedImage ? (
                            <div className="p-8 text-center">

                                <label
                                    htmlFor="avatar-upload"
                                    className="
                            inline-flex
                            px-6
                            py-3
                            bg-black
                            text-white
                            rounded-full
                            cursor-pointer
                            hover:bg-gray-800
                        "
                                >
                                    Select image
                                </label>

                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];

                                        if (!file) return;

                                        // Check file type
                                        if (!file.type.startsWith("image/")) {
                                            toast.error("Please select a valid image.");
                                            return;
                                        }

                                        // Save the actual File
                                        setSelectedFile(file);

                                        // Create preview URL for Cropper
                                        const previewUrl = URL.createObjectURL(file);

                                        setSelectedImage(previewUrl);

                                        // Reset crop settings
                                        setCrop({ x: 0, y: 0 });
                                        setZoom(1);
                                        setCroppedAreaPixels(null);
                                    }}
                                />
                                <p className="text-sm text-gray-500 mt-4">
                                    JPG, PNG or WEBP
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Crop Area */}
                                <div className="relative h-80 bg-black">

                                    <Cropper
                                        image={selectedImage}
                                        crop={crop}
                                        zoom={zoom}
                                        aspect={1}
                                        cropShape="round"
                                        showGrid={false}
                                        onCropChange={setCrop}
                                        onZoomChange={setZoom}
                                        onCropComplete={(_, croppedPixels) => {
                                            setCroppedAreaPixels(croppedPixels);
                                        }}
                                    />

                                </div>

                                {/* Zoom */}
                                <div className="px-6 py-4">

                                    <label className="text-sm text-gray-600">
                                        Zoom
                                    </label>

                                    <input
                                        type="range"
                                        min={1}
                                        max={3}
                                        step={0.1}
                                        value={zoom}
                                        onChange={(e) =>
                                            setZoom(Number(e.target.value))
                                        }
                                        className="w-full mt-2"
                                    />

                                </div>

                                {/* Buttons */}
                                <div className="flex justify-end gap-3 px-6 pb-6">

                                    <button
                                        onClick={() => {
                                            setSelectedImage(null);
                                            setSelectedFile(null);
                                            setCroppedAreaPixels(null);
                                            setZoom(1);
                                            setCrop({ x: 0, y: 0 });
                                        }}
                                        className="
                                px-5
                                py-2.5
                                rounded-full
                                border
                                border-gray-300
                                hover:bg-gray-100 cursor-pointer
                            "
                                    >
                                        Change image
                                    </button>

                                    <button
                                        disabled={isUpdatingAvatar}
                                        onClick={handleUpdateAvatar}
                                        className="
                                px-5
                                py-2.5
                                rounded-full cursor-pointer
                                bg-black
                                text-white
                                hover:bg-gray-800
                                disabled:opacity-50
                            "
                                    >
                                        {isUpdatingAvatar
                                            ? "Updating..."
                                            : "Update"}
                                    </button>

                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
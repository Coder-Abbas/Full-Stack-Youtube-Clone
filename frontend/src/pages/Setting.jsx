import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    UserRound,
    Camera,
    Eye,
    EyeOff,
    Settings,
    X,
    Lock,
    Save,
} from "lucide-react";
import Cropper from "react-easy-crop";
import toast from "react-hot-toast";

import Navbar from "../components/navbar/navbar";
import Sidebar from "../components/sidebar";
import useChannelStore from "../store/channelStore";
import useAuthStore from "../store/authStore";

const Setting = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Avatar states
    const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
    const [showAvatar, setShowAvatar] = useState(false);
    const [showAvatarEditor, setShowAvatarEditor] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);

    // Account details states
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [isSavingDetails, setIsSavingDetails] = useState(false);

    // Password states
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confPassword, setConfPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Password visibility states
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfPassword, setShowConfPassword] = useState(false);

    const { authUser, isCheckingAuth, getMe } = useAuthStore();

    const {
        channel,
        channelUpdatedVersion,
        getMyChannel,
        updateChannel,
        updateAvatar,
        changePassword,
        updateError,
        avatarError,
        passwordError,
    } = useChannelStore();

    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

    // Load channel data on mount + when channel is updated
    useEffect(() => {
        if (!authUser || isCheckingAuth) return;
        getMyChannel();
    }, [getMyChannel, authUser, isCheckingAuth, channelUpdatedVersion]);

    // Populate form when channel data arrives
    useEffect(() => {
        if (channel) {
            setFullName(channel.fullName || "");
            setEmail(channel.email || "");
            setUsername(channel.username || "");
        }
    }, [channel]);

    // ==========================================
    // Avatar Cropper
    // ==========================================

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
                        { type: "image/jpeg" }
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

            const croppedFile = await createCroppedImage(
                selectedImage,
                croppedAreaPixels
            );

            const result = await updateAvatar(croppedFile);

            if (!result?.success) {
                toast.error(
                    result?.message || "Failed to update profile picture."
                );
                return;
            }

            setShowAvatarEditor(false);
            setSelectedImage(null);
            setSelectedFile(null);
            setCroppedAreaPixels(null);
            setCrop({ x: 0, y: 0 });
            setZoom(1);

            toast.success("Profile picture updated successfully!");

            // Refresh channel data
            getMyChannel();

        } catch (error) {
            console.error("Avatar update error:", error);
            toast.error(
                error?.message || "Failed to update profile picture."
            );
        } finally {
            setIsUpdatingAvatar(false);
        }
    };

    // ==========================================
    // Save Account Details
    // ==========================================

    const handleSaveDetails = async (e) => {
        e.preventDefault();

        if (!fullName.trim() || !email.trim() || !username.trim()) {
            toast.error("All fields are required.");
            return;
        }

        setIsSavingDetails(true);

        const result = await updateChannel({ fullName, email, username });

        if (result.success) {
            toast.success("Account details updated successfully!");

            // Refresh both channel and auth user data
            await getMyChannel();
            await getMe();
        } else {
            toast.error(result.message || "Failed to update account details.");
        }

        setIsSavingDetails(false);
    };

    // ==========================================
    // Change Password
    // ==========================================

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (!oldPassword || !newPassword || !confPassword) {
            toast.error("All password fields are required.");
            return;
        }

        if (newPassword !== confPassword) {
            toast.error("New password and confirm password do not match.");
            return;
        }

        setIsChangingPassword(true);

        const result = await changePassword(oldPassword, newPassword, confPassword);

        if (result.success) {
            toast.success("Password changed successfully!");
            setOldPassword("");
            setNewPassword("");
            setConfPassword("");
        } else {
            toast.error(result.message || "Failed to change password.");
        }

        setIsChangingPassword(false);
    };

    // ==========================================
    // Not logged in
    // ==========================================

    if (!authUser && !isCheckingAuth) {
        return (
            <div className="h-screen overflow-hidden bg-gray-50">
                <header className="fixed top-0 left-0 right-0 z-50 h-16">
                    <Navbar toggleSidebar={toggleSidebar} />
                </header>

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
                            Please log in to view settings.
                        </p>

                        <Link
                            to="/login"
                            className="px-6 py-1 font-medium text-[22px] border border-blue-500 text-blue-500 rounded-lg transition duration-400 hover:bg-blue-400 hover:text-white"
                        >
                            Login
                        </Link>
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

            {/* ================= MAIN ================= */}
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
                <div className="max-w-2xl mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Link
                                to="/"
                                className="p-2 rounded-full hover:bg-gray-100 cursor-pointer"
                                title="Back to Home"
                            >
                                <ArrowLeft size={22} className="text-gray-700" />
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Settings
                            </h1>
                        </div>
                    </div>

                    {/* ==========================================
                        SECTION 1 - AVATAR
                    ========================================== */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                            <Camera size={18} />
                            Profile Picture
                        </h2>

                        <div className="flex items-center gap-6">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setAvatarMenuOpen((prev) => !prev)}
                                    className="relative group cursor-pointer rounded-full focus:outline-none"
                                >
                                    <img
                                        src={channel?.avatar || authUser?.avatar || "/default-avatar.png"}
                                        alt={channel?.username || "Profile"}
                                        className="
                                            w-28 h-28
                                            md:w-32 md:h-32
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
                                                gap-3
                                                cursor-pointer
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

                            <div>
                                <p className="text-gray-700 font-medium">
                                    {channel?.fullName || "User"}
                                </p>
                                <p className="text-gray-500 text-sm">
                                    @{channel?.username || "username"}
                                </p>
                                <p className="text-gray-400 text-xs mt-1">
                                    Click the avatar to show or update your profile picture.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ==========================================
                        SECTION 2 - ACCOUNT DETAILS
                    ========================================== */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                            <UserRound size={18} />
                            Account Details
                        </h2>

                        <form onSubmit={handleSaveDetails} className="space-y-5">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Enter your full name"
                                    className="
                                        w-full
                                        px-4
                                        py-3
                                        border
                                        border-gray-300
                                        rounded-xl
                                        outline-none
                                        focus:border-blue-500
                                    "
                                />
                            </div>

                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter your username"
                                    className="
                                        w-full
                                        px-4
                                        py-3
                                        border
                                        border-gray-300
                                        rounded-xl
                                        outline-none
                                        focus:border-blue-500
                                    "
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="
                                        w-full
                                        px-4
                                        py-3
                                        border
                                        border-gray-300
                                        rounded-xl
                                        outline-none
                                        focus:border-blue-500
                                    "
                                />
                            </div>

                            {/* Error */}
                            {updateError && (
                                <p className="text-sm text-red-500">
                                    {updateError}
                                </p>
                            )}

                            {/* Save Button */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSavingDetails}
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        px-6
                                        py-3
                                        bg-black
                                        text-white
                                        rounded-full
                                        font-medium
                                        hover:bg-gray-800
                                        disabled:opacity-50
                                        cursor-pointer
                                    "
                                >
                                    <Save size={16} />
                                    {isSavingDetails ? "Saving..." : "Save Details"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* ==========================================
                        SECTION 3 - CHANGE PASSWORD
                    ========================================== */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                            <Lock size={18} />
                            Change Password
                        </h2>

                        <form onSubmit={handleChangePassword} className="space-y-5">
                            {/* Old Password */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showOldPassword ? "text" : "password"}
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        placeholder="Enter current password"
                                        className="
                                            w-full
                                            px-4
                                            pr-12
                                            py-3
                                            border
                                            border-gray-300
                                            rounded-xl
                                            outline-none
                                            focus:border-blue-500
                                        "
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowOldPassword((prev) => !prev)}
                                        className="
                                            absolute
                                            right-3
                                            top-1/2
                                            -translate-y-1/2
                                            p-1
                                            text-gray-500
                                            hover:text-gray-700
                                            cursor-pointer
                                        "
                                    >
                                        {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        className="
                                            w-full
                                            px-4
                                            pr-12
                                            py-3
                                            border
                                            border-gray-300
                                            rounded-xl
                                            outline-none
                                            focus:border-blue-500
                                        "
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword((prev) => !prev)}
                                        className="
                                            absolute
                                            right-3
                                            top-1/2
                                            -translate-y-1/2
                                            p-1
                                            text-gray-500
                                            hover:text-gray-700
                                            cursor-pointer
                                        "
                                    >
                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm New Password */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfPassword ? "text" : "password"}
                                        value={confPassword}
                                        onChange={(e) => setConfPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        className="
                                            w-full
                                            px-4
                                            pr-12
                                            py-3
                                            border
                                            border-gray-300
                                            rounded-xl
                                            outline-none
                                            focus:border-blue-500
                                        "
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfPassword((prev) => !prev)}
                                        className="
                                            absolute
                                            right-3
                                            top-1/2
                                            -translate-y-1/2
                                            p-1
                                            text-gray-500
                                            hover:text-gray-700
                                            cursor-pointer
                                        "
                                    >
                                        {showConfPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Error */}
                            {passwordError && (
                                <p className="text-sm text-red-500">
                                    {passwordError}
                                </p>
                            )}

                            {/* Change Password Button */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isChangingPassword}
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        px-6
                                        py-3
                                        bg-black
                                        text-white
                                        rounded-full
                                        font-medium
                                        hover:bg-gray-800
                                        disabled:opacity-50
                                        cursor-pointer
                                    "
                                >
                                    <Lock size={16} />
                                    {isChangingPassword ? "Changing..." : "Change Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            {/* ================= AVATAR PREVIEW ================= */}
            {showAvatar && (
                <div
                    className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center cursor-pointer"
                    onClick={() => setShowAvatar(false)}
                >
                    <div
                        className="relative cursor-default"
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
                                hover:bg-white/30
                                cursor-pointer
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

            {/* ================= AVATAR EDITOR ================= */}
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
                                    setSelectedFile(null);
                                    setCroppedAreaPixels(null);
                                    setZoom(1);
                                    setCrop({ x: 0, y: 0 });
                                }}
                                className="p-2 rounded-full hover:bg-gray-100 cursor-pointer"
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

                                        if (!file.type.startsWith("image/")) {
                                            toast.error("Please select a valid image.");
                                            return;
                                        }

                                        setSelectedFile(file);
                                        const previewUrl = URL.createObjectURL(file);
                                        setSelectedImage(previewUrl);
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
                                            hover:bg-gray-100
                                            cursor-pointer
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
                                            rounded-full
                                            cursor-pointer
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

export default Setting;
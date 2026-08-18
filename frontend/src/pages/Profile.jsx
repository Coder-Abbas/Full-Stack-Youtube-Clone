import React, { useEffect, useState } from "react";

import {
    Settings,
    Video,
    Trash2,
    X,
    Edit3,
    MoreVertical,
} from "lucide-react";

import Navbar from "../components/navbar/navbar";
import Sidebar from "../components/sidebar";
import HomePageCard from "../components/videoCards/homePageCard";

import useChannelStore from "../store/channelStore";


const Profile = () => {

    // ==========================================
    // Sidebar
    // ==========================================

    const [isSidebarOpen, setIsSidebarOpen] =
        useState(true);


    // ==========================================
    // Manage Video Modal
    // ==========================================

    const [isManageOpen, setIsManageOpen] =
        useState(false);


    // ==========================================
    // Delete Confirmation
    // ==========================================

    const [videoToDelete, setVideoToDelete] =
        useState(null);


    // ==========================================
    // Update Channel Modal
    // ==========================================

    const [isUpdateOpen, setIsUpdateOpen] =
        useState(false);


    // ==========================================
    // Zustand
    // ==========================================

    const {
        channel,
        channelVideos,

        isLoading,
        error,

        getMyChannel,
        getMyVideos,

        deleteVideo,
        isDeletingVideo,

    } = useChannelStore();


    // ==========================================
    // Toggle Sidebar
    // ==========================================

    const toggleSidebar = () => {

        setIsSidebarOpen(
            (prev) => !prev
        );

    };


    // ==========================================
    // Load Profile
    // ==========================================

    useEffect(() => {

        getMyChannel();
        getMyVideos();

    }, [
        getMyChannel,
        getMyVideos,
    ]);


    // ==========================================
    // Delete Video
    // ==========================================

    const handleDeleteVideo = async () => {

        if (!videoToDelete) return;


        const result =
            await deleteVideo(
                videoToDelete._id
            );


        if (result.success) {

            setVideoToDelete(null);

        }

    };


    // ==========================================
    // Loading
    // ==========================================

    if (isLoading) {

        return (

            <div className="min-h-screen flex items-center justify-center">

                <p className="text-gray-500">
                    Loading channel...
                </p>

            </div>

        );

    }


    // ==========================================
    // Error
    // ==========================================

    if (error) {

        return (

            <div className="min-h-screen flex items-center justify-center">

                <p className="text-red-500">
                    {error}
                </p>

            </div>

        );

    }


    return (

        <div
            className="
                h-screen
                overflow-hidden
                bg-[#f9f9f9]
            "
        >


            {/* ================================================= */}
            {/* NAVBAR */}
            {/* ================================================= */}

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
                    toggleSidebar={
                        toggleSidebar
                    }
                />

            </header>


            {/* ================================================= */}
            {/* SIDEBAR */}
            {/* ================================================= */}

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
                            ? "w-64"
                            : "w-20"
                    }
                `}
            >

                <Sidebar
                    isSidebarOpen={
                        isSidebarOpen
                    }
                />

            </aside>


            {/* ================================================= */}
            {/* MAIN */}
            {/* ================================================= */}

            <main
                className={`
                    fixed
                    top-16
                    bottom-0
                    right-0
                    overflow-y-auto
                    transition-all
                    duration-300

                    ${
                        isSidebarOpen
                            ? "left-64"
                            : "left-20"
                    }
                `}
            >

                <div
                    className="
                        max-w-[1500px]
                        mx-auto
                        px-4
                        md:px-8
                        py-8
                    "
                >


                    {/* ================================================= */}
                    {/* CHANNEL HEADER */}
                    {/* ================================================= */}

                    <section
                        className="
                            bg-white
                            rounded-2xl
                            border
                            border-gray-200
                            p-6
                            md:p-8
                        "
                    >

                        <div
                            className="
                                flex
                                flex-col
                                md:flex-row
                                md:items-center
                                gap-6
                            "
                        >


                            {/* Avatar */}

                            <div className="flex-shrink-0">

                                <img
                                    src={
                                        channel?.avatar ||
                                        "/default-avatar.png"
                                    }
                                    alt={
                                        channel?.username ||
                                        "Profile"
                                    }
                                    className="
                                        w-28
                                        h-28
                                        md:w-36
                                        md:h-36
                                        rounded-full
                                        object-cover
                                        border
                                        border-gray-200
                                    "
                                />

                            </div>


                            {/* Channel Information */}

                            <div className="flex-1">

                                {/* Full Name */}

                                <h1
                                    className="
                                        text-2xl
                                        md:text-3xl
                                        font-bold
                                        text-gray-900
                                    "
                                >
                                    {
                                        channel?.fullName
                                    }
                                </h1>


                                {/* Username */}

                                <p
                                    className="
                                        text-gray-600
                                        mt-1
                                    "
                                >
                                    @
                                    {
                                        channel?.username
                                    }
                                </p>


                                {/* Statistics */}

                                <div
                                    className="
                                        flex
                                        flex-wrap
                                        items-center
                                        gap-5
                                        mt-4
                                        text-sm
                                        text-gray-600
                                    "
                                >

                                    <div>

                                        <span
                                            className="
                                                font-bold
                                                text-gray-900
                                            "
                                        >
                                            {
                                                channel?.subscribersCount ??
                                                0
                                            }
                                        </span>

                                        {" "}

                                        subscribers

                                    </div>


                                    <div>

                                        <span
                                            className="
                                                font-bold
                                                text-gray-900
                                            "
                                        >
                                            {
                                                channelVideos.length
                                            }
                                        </span>

                                        {" "}

                                        videos

                                    </div>

                                </div>


                                {/* Buttons */}

                                <div
                                    className="
                                        flex
                                        flex-wrap
                                        gap-3
                                        mt-5
                                    "
                                >

                                    {/* Update Channel */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsUpdateOpen(
                                                true
                                            )
                                        }
                                        className="
                                            flex
                                            items-center
                                            gap-2
                                            px-5
                                            py-2.5
                                            bg-black
                                            text-white
                                            rounded-full
                                            font-medium
                                            cursor-pointer
                                            hover:bg-gray-800
                                            transition
                                        "
                                    >

                                        <Edit3 size={18} />

                                        Update Channel

                                    </button>


                                    {/* Manage Videos */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsManageOpen(
                                                true
                                            )
                                        }
                                        className="
                                            flex
                                            items-center
                                            gap-2
                                            px-5
                                            py-2.5
                                            bg-gray-100
                                            text-gray-900
                                            rounded-full
                                            font-medium
                                            cursor-pointer
                                            hover:bg-gray-200
                                            transition
                                        "
                                    >

                                        <Video size={18} />

                                        Manage Videos

                                    </button>

                                </div>

                            </div>

                        </div>

                    </section>


                    {/* ================================================= */}
                    {/* VIDEOS HEADER */}
                    {/* ================================================= */}

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            mt-10
                            mb-5
                        "
                    >

                        <h2
                            className="
                                text-2xl
                                font-bold
                                text-gray-900
                            "
                        >
                            Videos
                        </h2>


                        <span
                            className="
                                text-sm
                                text-gray-500
                            "
                        >
                            {channelVideos.length} videos
                        </span>

                    </div>


                    {/* ================================================= */}
                    {/* VIDEOS */}
                    {/* ================================================= */}

                    {channelVideos.length === 0 ? (

                        <div
                            className="
                                bg-white
                                rounded-2xl
                                border
                                border-gray-200
                                py-20
                                text-center
                            "
                        >

                            <Video
                                size={45}
                                className="
                                    mx-auto
                                    text-gray-300
                                    mb-4
                                "
                            />

                            <h3
                                className="
                                    font-semibold
                                    text-lg
                                    text-gray-800
                                "
                            >
                                No videos yet
                            </h3>

                            <p
                                className="
                                    text-gray-500
                                    mt-1
                                "
                            >
                                Upload your first video.
                            </p>

                        </div>

                    ) : (

                        <div
                            className="
                                grid
                                grid-cols-1
                                sm:grid-cols-2
                                lg:grid-cols-3
                                xl:grid-cols-4
                                gap-4
                            "
                        >

                            {channelVideos.map(
                                (video) => (

                                    <HomePageCard
                                        key={
                                            video._id
                                        }
                                        video={
                                            video
                                        }
                                    />

                                )
                            )}

                        </div>

                    )}

                </div>

            </main>


            {/* ================================================= */}
            {/* MANAGE VIDEOS MODAL */}
            {/* ================================================= */}

            {isManageOpen && (

                <div
                    className="
                        fixed
                        inset-0
                        z-[100]
                        bg-black/50
                        flex
                        items-center
                        justify-center
                        p-4
                    "
                    onClick={() =>
                        setIsManageOpen(false)
                    }
                >

                    <div
                        className="
                            bg-white
                            w-full
                            max-w-3xl
                            max-h-[85vh]
                            overflow-y-auto
                            rounded-2xl
                            shadow-xl
                            p-6
                        "
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        {/* Header */}

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                mb-6
                            "
                        >

                            <h2
                                className="
                                    text-xl
                                    font-bold
                                "
                            >
                                Manage Videos
                            </h2>


                            <button
                                type="button"
                                onClick={() =>
                                    setIsManageOpen(
                                        false
                                    )
                                }
                                className="
                                    w-9
                                    h-9
                                    flex
                                    items-center
                                    justify-center
                                    rounded-full
                                    hover:bg-gray-100
                                    cursor-pointer
                                "
                            >

                                <X size={20} />

                            </button>

                        </div>


                        {/* Videos */}

                        <div className="space-y-4">

                            {channelVideos.map(
                                (video) => (

                                    <div
                                        key={
                                            video._id
                                        }
                                        className="
                                            flex
                                            gap-4
                                            p-3
                                            border
                                            border-gray-200
                                            rounded-xl
                                            hover:bg-gray-50
                                        "
                                    >

                                        {/* Thumbnail */}

                                        <img
                                            src={
                                                video.thumbnail
                                            }
                                            alt={
                                                video.title
                                            }
                                            className="
                                                w-40
                                                aspect-video
                                                object-cover
                                                rounded-lg
                                                flex-shrink-0
                                            "
                                        />


                                        {/* Info */}

                                        <div className="flex-1 min-w-0">

                                            <h3
                                                className="
                                                    font-semibold
                                                    line-clamp-2
                                                "
                                            >
                                                {
                                                    video.title
                                                }
                                            </h3>


                                            <p
                                                className="
                                                    text-sm
                                                    text-gray-500
                                                    mt-1
                                                "
                                            >
                                                {
                                                    video.views
                                                }{" "}
                                                views
                                            </p>


                                            <p
                                                className="
                                                    text-sm
                                                    text-gray-500
                                                "
                                            >
                                                {
                                                    video.isPublished
                                                        ? "Published"
                                                        : "Private"
                                                }
                                            </p>

                                        </div>


                                        {/* Delete */}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setVideoToDelete(
                                                    video
                                                )
                                            }
                                            className="
                                                flex
                                                items-center
                                                justify-center
                                                w-10
                                                h-10
                                                rounded-full
                                                text-red-500
                                                hover:bg-red-50
                                                cursor-pointer
                                                flex-shrink-0
                                            "
                                        >

                                            <Trash2
                                                size={20}
                                            />

                                        </button>

                                    </div>

                                )
                            )}

                        </div>

                    </div>

                </div>

            )}


            {/* ================================================= */}
            {/* DELETE CONFIRMATION */}
            {/* ================================================= */}

            {videoToDelete && (

                <div
                    className="
                        fixed
                        inset-0
                        z-[110]
                        bg-black/50
                        flex
                        items-center
                        justify-center
                        p-4
                    "
                >

                    <div
                        className="
                            bg-white
                            rounded-2xl
                            p-6
                            w-full
                            max-w-md
                        "
                    >

                        <h2
                            className="
                                text-xl
                                font-bold
                                text-gray-900
                            "
                        >
                            Delete video?
                        </h2>


                        <p
                            className="
                                text-gray-600
                                mt-2
                            "
                        >
                            Are you sure you want to
                            delete{" "}
                            <strong>
                                {videoToDelete.title}
                            </strong>
                            ?
                        </p>


                        <p
                            className="
                                text-sm
                                text-red-500
                                mt-3
                            "
                        >
                            This action cannot be undone.
                        </p>


                        <div
                            className="
                                flex
                                justify-end
                                gap-3
                                mt-6
                            "
                        >

                            <button
                                type="button"
                                onClick={() =>
                                    setVideoToDelete(
                                        null
                                    )
                                }
                                className="
                                    px-5
                                    py-2.5
                                    rounded-full
                                    bg-gray-100
                                    hover:bg-gray-200
                                    cursor-pointer
                                "
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                disabled={
                                    isDeletingVideo
                                }
                                onClick={
                                    handleDeleteVideo
                                }
                                className="
                                    px-5
                                    py-2.5
                                    rounded-full
                                    bg-red-600
                                    text-white
                                    hover:bg-red-700
                                    cursor-pointer
                                    disabled:opacity-50
                                    disabled:cursor-not-allowed
                                "
                            >

                                {isDeletingVideo
                                    ? "Deleting..."
                                    : "Delete"}

                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* ================================================= */}
            {/* UPDATE CHANNEL MODAL */}
            {/* ================================================= */}

            {isUpdateOpen && (

                <UpdateChannelModal
                    channel={channel}
                    onClose={() =>
                        setIsUpdateOpen(false)
                    }
                />

            )}

        </div>
    );
};


// =====================================================
// Update Channel Modal
// =====================================================

const UpdateChannelModal = ({
    channel,
    onClose,
}) => {

    const {
        updateChannel,
        isUpdatingChannel,
        updateError,
        updateAvatar,
        isUpdatingAvatar,
        avatarError,
        changePassword,
        isChangingPassword,
        passwordError,
    } = useChannelStore();


    const [fullName, setFullName] =
        useState(channel?.fullName || "");

    const [email, setEmail] =
        useState(channel?.email || "");

    const [username, setUsername] =
        useState(channel?.username || "");

    const [avatar, setAvatar] =
        useState(null);

    // Password fields
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confPassword, setConfPassword] = useState("");
    const [passwordMessage, setPasswordMessage] = useState(null);
    const [passwordMessageType, setPasswordMessageType] = useState("success");


    const handleSubmit = async (e) => {

        e.preventDefault();

        // 1) Update account details (fullName, email, username)
        const result =
            await updateChannel({
                fullName,
                email,
                username,
            });

        if (!result.success) return;

        // 2) If avatar selected, update avatar separately
        if (avatar) {

            const avatarResult =
                await updateAvatar(avatar);

            if (!avatarResult.success) return;
        }

        onClose();
    };


    const handleChangePassword = async () => {

        setPasswordMessage(null);

        const result =
            await changePassword(
                oldPassword,
                newPassword,
                confPassword
            );

        if (result.success) {

            setPasswordMessage(
                "Password changed successfully!"
            );
            setPasswordMessageType("success");

            setOldPassword("");
            setNewPassword("");
            setConfPassword("");
        } else {

            setPasswordMessage(result.message);
            setPasswordMessageType("error");
        }
    };


    return (

        <div
            className="
                fixed
                inset-0
                z-[100]
                bg-black/50
                flex
                items-center
                justify-center
                p-4
            "
            onClick={onClose}
        >

            <div
                className="
                    bg-white
                    rounded-2xl
                    w-full
                    max-w-lg
                    max-h-[90vh]
                    overflow-y-auto
                    p-6
                "
                onClick={(e) =>
                    e.stopPropagation()
                }
            >

                <div
                    className="
                        flex
                        justify-between
                        items-center
                        mb-6
                    "
                >

                    <h2
                        className="
                            text-xl
                            font-bold
                        "
                    >
                        Update Channel
                    </h2>


                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            w-9
                            h-9
                            flex
                            items-center
                            justify-center
                            rounded-full
                            hover:bg-gray-100
                            cursor-pointer
                        "
                    >

                        <X size={20} />

                    </button>

                </div>


                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    {/* Full Name */}

                    <div>

                        <label
                            className="
                                block
                                text-sm
                                font-medium
                                mb-2
                            "
                        >
                            Full Name
                        </label>

                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) =>
                                setFullName(
                                    e.target.value
                                )
                            }
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

                        <label
                            className="
                                block
                                text-sm
                                font-medium
                                mb-2
                            "
                        >
                            Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(
                                    e.target.value
                                )
                            }
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

                        <label
                            className="
                                block
                                text-sm
                                font-medium
                                mb-2
                            "
                        >
                            Username
                        </label>

                        <input
                            type="text"
                            value={username}
                            onChange={(e) =>
                                setUsername(
                                    e.target.value
                                )
                            }
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


                    {/* Avatar */}

                    <div>

                        <label
                            className="
                                block
                                text-sm
                                font-medium
                                mb-2
                            "
                        >
                            Channel Avatar
                        </label>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setAvatar(
                                    e.target.files[0]
                                )
                            }
                            className="
                                w-full
                                text-sm
                                cursor-pointer
                            "
                        />

                    </div>


                    {/* Error */}

                    {updateError && (

                        <p
                            className="
                                text-sm
                                text-red-500
                            "
                        >
                            {updateError}
                        </p>

                    )}

                    {avatarError && (

                        <p
                            className="
                                text-sm
                                text-red-500
                            "
                        >
                            {avatarError}
                        </p>

                    )}


                    {/* Buttons */}

                    <div
                        className="
                            flex
                            justify-end
                            gap-3
                        "
                    >

                        <button
                            type="button"
                            onClick={onClose}
                            className="
                                px-5
                                py-2.5
                                bg-gray-100
                                rounded-full
                                cursor-pointer
                                hover:bg-gray-200
                            "
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            disabled={
                                isUpdatingChannel
                            }
                            className="
                                px-5
                                py-2.5
                                bg-black
                                text-white
                                rounded-full
                                cursor-pointer
                                hover:bg-gray-800
                                disabled:opacity-50
                            "
                        >

                            {isUpdatingChannel
                                ? "Updating..."
                                : "Save Changes"}

                        </button>

                    </div>

                </form>


                {/* ===================== */}
                {/* CHANGE PASSWORD */}
                {/* ===================== */}

                <hr className="my-8 border-gray-200" />

                <h3
                    className="
                        text-lg
                        font-bold
                        mb-4
                    "
                >
                    Change Password
                </h3>


                <div className="space-y-5">

                    {/* Old Password */}

                    <div>

                        <label
                            className="
                                block
                                text-sm
                                font-medium
                                mb-2
                            "
                        >
                            Old Password
                        </label>

                        <input
                            type="password"
                            value={oldPassword}
                            onChange={(e) =>
                                setOldPassword(
                                    e.target.value
                                )
                            }
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


                    {/* New Password */}

                    <div>

                        <label
                            className="
                                block
                                text-sm
                                font-medium
                                mb-2
                            "
                        >
                            New Password
                        </label>

                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) =>
                                setNewPassword(
                                    e.target.value
                                )
                            }
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


                    {/* Confirm New Password */}

                    <div>

                        <label
                            className="
                                block
                                text-sm
                                font-medium
                                mb-2
                            "
                        >
                            Confirm New Password
                        </label>

                        <input
                            type="password"
                            value={confPassword}
                            onChange={(e) =>
                                setConfPassword(
                                    e.target.value
                                )
                            }
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


                    {/* Password message */}
                    {passwordMessage && (
                        <p
                            className={`text-sm ${
                                passwordMessageType === "success"
                                    ? "text-green-600"
                                    : "text-red-500"
                            }`}
                        >
                            {passwordMessage}
                        </p>
                    )}

                    {passwordError && (
                        <p className="text-sm text-red-500">
                            {passwordError}
                        </p>
                    )}


                    {/* Buttons */}

                    <div
                        className="
                            flex
                            justify-end
                        "
                    >

                        <button
                            type="button"
                            onClick={handleChangePassword}
                            disabled={
                                isChangingPassword
                            }
                            className="
                                px-5
                                py-2.5
                                bg-black
                                text-white
                                rounded-full
                                cursor-pointer
                                hover:bg-gray-800
                                disabled:opacity-50
                            "
                        >

                            {isChangingPassword
                                ? "Changing..."
                                : "Change Password"}

                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

};


export default Profile;
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, UserRound, Camera } from "lucide-react";

import Navbar from "../components/navbar/navbar";
import Sidebar from "../components/sidebar";
import useChannelStore from "../store/channelStore";

const EditProfile = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(
        typeof window !== "undefined" ? window.innerWidth >= 750 : false
    );

    const {
        channel,
        getMyChannel,
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

    // Form states
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");

    // Password states
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confPassword, setConfPassword] = useState("");
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState("success");

    // Load channel data on mount
    useEffect(() => {
        getMyChannel();
    }, [getMyChannel]);

    // Populate form when channel data arrives
    useEffect(() => {
        if (channel) {
            setFullName(channel.fullName || "");
            setEmail(channel.email || "");
            setUsername(channel.username || "");
            setAvatarPreview(channel.avatar || "");
        }
    }, [channel]);

    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

    // Handle avatar selection
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    // Save account details
    const handleSaveDetails = async (e) => {
        e.preventDefault();
        setMessage(null);

        // 1) Update account details
        const result = await updateChannel({ fullName, email, username });
        if (!result.success) return;

        // 2) Update avatar if selected
        if (avatar) {
            const avatarResult = await updateAvatar(avatar);
            if (!avatarResult.success) return;
        }

        setMessage("Profile updated successfully!");
        setMessageType("success");
    };

    // Change password
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setMessage(null);

        const result = await changePassword(oldPassword, newPassword, confPassword);
        if (result.success) {
            setMessage("Password changed successfully!");
            setMessageType("success");
            setOldPassword("");
            setNewPassword("");
            setConfPassword("");
        } else {
            setMessage(result.message);
            setMessageType("error");
        }
    };

    return (
        <div className="min-h-screen bg-[#f9f9f9]">
            {/* Navbar */}
            <header className="fixed top-0 left-0 right-0 z-50 h-16">
                <Navbar toggleSidebar={toggleSidebar} />
            </header>

            {/* Sidebar */}
            <aside className={`fixed left-0 top-16 bottom-0 z-40 transition-all duration-300 ${isSidebarOpen ? "w-50" : "w-20"}`}>
                <Sidebar isSidebarOpen={isSidebarOpen} />
            </aside>

            {/* Main Content */}
            <main className={`pt-16 overflow-y-auto transition-all duration-300 ${isSidebarOpen ? "pl-50" : "pl-20"}`}>
                <div className="max-w-2xl mx-auto px-4 py-8">
                    <div className="flex items-center gap-4 mb-8">
                        <Link to="/profile" className="p-2 rounded-full hover:bg-gray-100">
                            <ArrowLeft size={22} className="text-gray-700" />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
                    </div>

                    {/* Success/Error Message */}
                    {message && (
                        <div className={`mb-6 p-4 rounded-xl text-sm ${
                            messageType === "success"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                        }`}>
                            {message}
                        </div>
                    )}

                    {/* Account Details */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                            <UserRound size={18} />
                            Channel Details
                        </h2>

                        <form onSubmit={handleSaveDetails} className="space-y-5">
                            {/* Avatar Preview */}
                            <div className="flex items-center gap-4">
                                <img
                                    src={avatarPreview || "/default-avatar.png"}
                                    alt="Avatar"
                                    className="w-20 h-20 rounded-full object-cover border border-gray-200"
                                />

                                <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-900 rounded-full cursor-pointer hover:bg-gray-200 text-sm font-medium">
                                    <Camera size={16} />
                                    Change Avatar
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Errors */}
                            {updateError && (
                                <p className="text-sm text-red-500">{updateError}</p>
                            )}
                            {avatarError && (
                                <p className="text-sm text-red-500">{avatarError}</p>
                            )}

                            {/* Save Details */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isUpdatingChannel || isUpdatingAvatar}
                                    className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {isUpdatingChannel || isUpdatingAvatar
                                        ? "Saving..."
                                        : "Save Details"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Change Password */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h2 className="text-gray-900 font-bold mb-6">Change Password</h2>

                        <form onSubmit={handleChangePassword} className="space-y-5">
                            {/* Old Password */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Current Password</label>
                                <input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="block text-sm font-medium mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Confirm New Password */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confPassword}
                                    onChange={(e) => setConfPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Password Error */}
                            {passwordError && (
                                <p className="text-sm text-red-500">{passwordError}</p>
                            )}

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isChangingPassword}
                                    className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {isChangingPassword ? "Changing..." : "Change Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EditProfile;
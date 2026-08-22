import React, { useEffect, useState } from "react";
import { Shield, Lock, KeyRound } from "lucide-react";

import AdminLayout from "../../components/admin/AdminLayout";
import useAuthStore from "../../store/authStore";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";

const AdminSettings = () => {
    const { authUser, getMe } = useAuthStore();

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confPassword, setConfPassword] = useState("");
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfPassword, setShowConfPassword] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    useEffect(() => {
        getMe();
    }, [getMe]);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordError("");

        if (!oldPassword || !newPassword || !confPassword) {
            setPasswordError("All password fields are required");
            return;
        }

        if (newPassword !== confPassword) {
            setPasswordError("New password and confirm password do not match");
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError("Password must be at least 6 characters long");
            return;
        }

        try {
            setIsChangingPassword(true);
            await axiosInstance.patch("/users/change-password", {
                oldPassword,
                newPassword,
                confPassword,
            });
            toast.success("Password changed successfully!");
            setOldPassword("");
            setNewPassword("");
            setConfPassword("");
        } catch (error) {
            setPasswordError(error?.response?.data?.message || "Failed to change password");
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-500 mt-1">Manage your admin account settings.</p>
                </div>

                {/* Admin Profile */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="text-pink-500" size={20} />
                        <h2 className="text-lg font-bold text-gray-900">Admin Profile</h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <img
                            src={authUser?.avatar || "/default-avatar.png"}
                            alt={authUser?.fullName || "Admin"}
                            className="h-16 w-16 rounded-full object-cover border border-gray-200"
                        />
                        <div>
                            <p className="font-semibold text-gray-900">{authUser?.fullName}</p>
                            <p className="text-sm text-gray-500">@{authUser?.username}</p>
                            <p className="text-sm text-gray-500">{authUser?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Change Password */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Lock className="text-pink-500" size={20} />
                        <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                            <div className="relative">
                                <input
                                    type={showOldPassword ? "text" : "password"}
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    placeholder="Enter current password"
                                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-pink-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowOldPassword((p) => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 cursor-pointer"
                                >
                                    {showOldPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-pink-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword((p) => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 cursor-pointer"
                                >
                                    {showNewPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                            <div className="relative">
                                <input
                                    type={showConfPassword ? "text" : "password"}
                                    value={confPassword}
                                    onChange={(e) => setConfPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-pink-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfPassword((p) => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 cursor-pointer"
                                >
                                    {showConfPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>

                        {passwordError && (
                            <p className="text-sm text-red-500">{passwordError}</p>
                        )}

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isChangingPassword}
                                className="flex items-center gap-2 px-6 py-2.5 bg-pink-600 text-white rounded-full font-medium hover:bg-pink-700 disabled:opacity-50 cursor-pointer"
                            >
                                <KeyRound size={16} />
                                {isChangingPassword ? "Changing..." : "Change Password"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminSettings;

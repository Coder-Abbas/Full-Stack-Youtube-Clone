import React, { useEffect, useState } from "react";
import {
    Search,
    Trash2,
    KeyRound,
    X,
    Eye,
    Users as UsersIcon,
} from "lucide-react";

import AdminLayout from "../../components/admin/AdminLayout";
import useAdminStore from "../../store/adminStore";
import useAuthStore from "../../store/authStore";
import toast from "react-hot-toast";

const AdminUsers = () => {
    const { authUser } = useAuthStore();
    const {
        users,
        usersMeta,
        getUsers,
        deleteUser,
        resetUserPassword,
        isLoading,
        error,
    } = useAdminStore();

    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [resetPasswordConfirm, setResetPasswordConfirm] = useState(null);
    const [newPassword, setNewPassword] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    // Debounce search so we don't fire a request on every keystroke
    useEffect(() => {
        const timeout = setTimeout(() => {
            setPage(1);
            getUsers({ query: searchQuery, page: 1, limit: 10 });
        }, 400);
        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    useEffect(() => {
        getUsers({ query: searchQuery, page, limit: 10 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    // Surface fetch errors as a toast (was previously written directly
    // inside JSX as plain text, so it rendered literally instead of firing)
    useEffect(() => {
        if (error) toast.error(error || "Failed to load users");
    }, [error]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        getUsers({ query: searchQuery, page: 1, limit: 10 });
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        setIsDeleting(true);
        const result = await deleteUser(deleteConfirm._id);
        setIsDeleting(false);
        if (result?.success) {
            toast.success("User deleted successfully");
            setDeleteConfirm(null);
        } else {
            toast.error(result?.message || "Failed to delete user");
        }
    };

    const handleResetPassword = async () => {
        if (!resetPasswordConfirm || !newPassword) return;
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        setIsResetting(true);
        const result = await resetUserPassword(resetPasswordConfirm._id, newPassword);
        setIsResetting(false);
        if (result?.success) {
            toast.success("Password reset successfully");
            setResetPasswordConfirm(null);
            setNewPassword("");
        } else {
            toast.error(result?.message || "Failed to reset password");
        }
    };

    // Guard against usersMeta being undefined on first render
    const total = usersMeta?.total || 0;
    const totalPages = usersMeta?.totalPages || 1;
    const userList = users || [];

    const isCurrentUser = (userId) => authUser && authUser._id === userId;

    return (
        <AdminLayout>
            <div className="w-full space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                        <p className="text-gray-500 mt-1">
                            Total Users: {total.toLocaleString()}
                        </p>
                    </div>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="relative w-full sm:w-auto">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search users..."
                            className="w-full sm:w-80 pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-500 transition"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                title="Clear search"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </form>
                </div>

                {/* Error (toast now handles the message; this stays as a lightweight inline fallback) */}
                {error && !isLoading && (
                    <div className="text-center py-10 text-red-500">
                        <p>{error}</p>
                    </div>
                )}

                {/* Loading */}
                {isLoading && userList.length === 0 && !error && (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-gray-300 border-t-red-600 rounded-full animate-spin" />
                    </div>
                )}

                {/* Empty state */}
                {!isLoading && !error && userList.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
                        <UsersIcon size={32} className="text-gray-300" />
                        <p className="text-gray-500">
                            {searchQuery ? `No users match "${searchQuery}"` : "No users yet."}
                        </p>
                    </div>
                )}

                {/* Table (desktop) + Card list (mobile) */}
                {!error && userList.length > 0 && (
                    <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        {/* Desktop table, hidden below md */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
                                        <th className="py-3 px-4 font-medium">User</th>
                                        <th className="py-3 px-4 font-medium">Email</th>
                                        <th className="py-3 px-4 font-medium">Role</th>
                                        <th className="py-3 px-4 font-medium">Joined</th>
                                        <th className="py-3 px-4 text-right font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {userList.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={user.avatar}
                                                        alt={user.fullName}
                                                        className="h-9 w-9 rounded-full object-cover shrink-0"
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
                                                        <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${user.role === "admin" ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-600"}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-500">
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedUser(user)}
                                                        title="View"
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                                                    >
                                                        <Eye size={15} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setResetPasswordConfirm(user)}
                                                        title="Reset Password"
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-yellow-50 hover:text-yellow-600 cursor-pointer"
                                                    >
                                                        <KeyRound size={15} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => !isCurrentUser(user._id) && setDeleteConfirm(user)}
                                                        title={isCurrentUser(user._id) ? "Cannot delete yourself" : "Delete"}
                                                        disabled={isCurrentUser(user._id)}
                                                        className={`
                                                            flex h-8 w-8 items-center justify-center rounded-lg transition
                                                            ${isCurrentUser(user._id)
                                                                ? "text-gray-300 cursor-not-allowed"
                                                                : "text-gray-400 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                                                            }
                                                        `}
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile card list, hidden md and up */}
                        <div className="md:hidden divide-y divide-gray-100">
                            {userList.map((user) => (
                                <div key={user._id} className="p-4">
                                    <div className="flex items-start gap-3">
                                        <img
                                            src={user.avatar}
                                            alt={user.fullName}
                                            className="h-10 w-10 rounded-full object-cover shrink-0"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
                                                <span className={`shrink-0 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${user.role === "admin" ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-600"}`}>
                                                    {user.role}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                                            <p className="text-xs text-gray-500 truncate mt-1">{user.email}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedUser(user)}
                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                                        >
                                            <Eye size={15} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setResetPasswordConfirm(user)}
                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-yellow-50 hover:text-yellow-600 cursor-pointer"
                                        >
                                            <KeyRound size={15} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => !isCurrentUser(user._id) && setDeleteConfirm(user)}
                                            title={isCurrentUser(user._id) ? "Cannot delete yourself" : "Delete"}
                                            disabled={isCurrentUser(user._id)}
                                            className={`
                                                flex h-8 w-8 items-center justify-center rounded-lg transition
                                                ${isCurrentUser(user._id)
                                                    ? "text-gray-300 cursor-not-allowed"
                                                    : "text-gray-400 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                                                }
                                            `}
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
                                <button
                                    type="button"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    className="w-full sm:w-auto px-4 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer transition"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-gray-500 order-first sm:order-none">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    type="button"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    className="w-full sm:w-auto px-4 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer transition"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* User Details Modal */}
                {selectedUser && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                        onClick={() => setSelectedUser(null)}
                    >
                        <div
                            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
                                <button
                                    type="button"
                                    onClick={() => setSelectedUser(null)}
                                    className="p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={selectedUser.avatar}
                                        alt={selectedUser.fullName}
                                        className="h-16 w-16 rounded-full object-cover shrink-0"
                                    />
                                    <div className="min-w-0">
                                        <p className="text-lg font-semibold text-gray-900 truncate">{selectedUser.fullName}</p>
                                        <p className="text-sm text-gray-500 truncate">@{selectedUser.username}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div className="min-w-0">
                                        <p className="text-gray-500">Email</p>
                                        <p className="font-medium text-gray-900 truncate">{selectedUser.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Role</p>
                                        <p className="font-medium text-gray-900 capitalize">{selectedUser.role}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Created</p>
                                        <p className="font-medium text-gray-900">
                                            {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Last Updated</p>
                                        <p className="font-medium text-gray-900">
                                            {selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleDateString() : "—"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setSelectedUser(null)}
                                    className="px-4 py-2 text-sm rounded-full border border-gray-200 hover:bg-gray-50 cursor-pointer transition"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                        onClick={() => !isDeleting && setDeleteConfirm(null)}
                    >
                        <div
                            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-semibold text-gray-900">Delete User?</h3>
                            <p className="text-gray-500 mt-2">
                                Are you sure you want to delete <strong>{deleteConfirm.fullName}</strong>'s account?
                                This action cannot be undone.
                            </p>
                            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setDeleteConfirm(null)}
                                    disabled={isDeleting}
                                    className="px-4 py-2 text-sm rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50 cursor-pointer transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="px-4 py-2 text-sm rounded-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 cursor-pointer transition"
                                >
                                    {isDeleting ? "Deleting..." : "Delete User"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reset Password Modal */}
                {resetPasswordConfirm && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                        onClick={() => { if (!isResetting) { setResetPasswordConfirm(null); setNewPassword(""); } }}
                    >
                        <div
                            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-semibold text-gray-900">Reset User Password</h3>
                            <p className="text-gray-500 mt-2">
                                Set a new password for <strong>{resetPasswordConfirm.fullName}</strong>.
                            </p>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                                    placeholder="Enter new password"
                                    autoFocus
                                    className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-red-500 transition"
                                />
                            </div>
                            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setResetPasswordConfirm(null); setNewPassword(""); }}
                                    disabled={isResetting}
                                    className="px-4 py-2 text-sm rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50 cursor-pointer transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResetPassword}
                                    disabled={isResetting}
                                    className="px-4 py-2 text-sm rounded-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 cursor-pointer transition"
                                >
                                    {isResetting ? "Resetting..." : "Reset Password"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminUsers;
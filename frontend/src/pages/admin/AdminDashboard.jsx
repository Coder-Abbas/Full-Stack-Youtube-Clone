import React, { useEffect } from "react";
import {
    Users,
    Video,
    MessageSquare,
    Eye,
    TrendingUp,
    Link as LinkIcon,
} from "lucide-react";

import AdminLayout from "../../components/admin/AdminLayout";
import useAdminStore from "../../store/adminStore";
import useAuthStore from "../../store/authStore";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
    const { authUser } = useAuthStore();
    const { overview, getOverview, isLoading, error } = useAdminStore();

    useEffect(() => {
        getOverview();
    }, [getOverview]);

    if (isLoading && !overview) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-gray-300 border-t-red-600 rounded-full animate-spin" />
                </div>
            </AdminLayout>
        );
    }

    if (error && !overview) {
        return (
            <AdminLayout>
                <div className="text-center py-20 text-red-500">
                    <p>{error}</p>
                </div>
            </AdminLayout>
        );
    }

    const stats = [
        {
            label: "Total Users",
            value: overview?.totalUsers || 0,
            icon: Users,
            color: "bg-blue-50 text-blue-600",
            change: "+12.4%",
        },
        {
            label: "Total Videos",
            value: overview?.totalVideos || 0,
            icon: Video,
            color: "bg-green-50 text-green-600",
            change: "+8.2%",
        },
        {
            label: "Total Comments",
            value: overview?.totalComments || 0,
            icon: MessageSquare,
            color: "bg-purple-50 text-purple-600",
            change: "+5.1%",
        },
        {
            label: "Total Views",
            value: overview?.totalViews || 0,
            icon: Eye,
            color: "bg-orange-50 text-orange-600",
            change: "+18.7%",
        },
    ];

    const maxValue = Math.max(
        overview?.totalUsers || 0,
        overview?.totalVideos || 0,
        overview?.totalComments || 0,
        1
    );

    const chartData = [
        { label: "Users", value: overview?.totalUsers || 0, color: "bg-blue-500" },
        { label: "Videos", value: overview?.totalVideos || 0, color: "bg-green-500" },
        { label: "Comments", value: overview?.totalComments || 0, color: "bg-purple-500" },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Welcome */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome back, {authUser?.fullName || "Admin"}
                    </h1>
                    <p className="text-gray-500 mt-1">Here's what's happening on your platform.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.color}`}>
                                    <stat.icon size={22} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-gray-500">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="mt-3 flex items-center gap-1 text-sm text-green-600">
                                <TrendingUp size={16} />
                                <span>{stat.change}</span>
                                <span className="text-gray-400 ml-1">from last month</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Bar Chart */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-6">Platform Overview</h3>
                        <div className="space-y-4">
                            {chartData.map((item) => (
                                <div key={item.label}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-gray-600">{item.label}</span>
                                        <span className="text-sm font-semibold text-gray-900">{item.value.toLocaleString()}</span>
                                    </div>
                                    <div className="h-3 w-full rounded-full bg-gray-100">
                                        <div
                                            className={`h-3 rounded-full ${item.color} transition-all duration-500`}
                                            style={{
                                                width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Views Card */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-4">Total Views</h3>
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                                <Eye size={32} />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-900">
                                    {(overview?.totalViews || 0).toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    +18.7% from last month
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 h-3 w-full rounded-full bg-gray-100">
                            <div
                                className="h-3 rounded-full bg-orange-500 transition-all duration-500"
                                style={{
                                    width: `${Math.min(((overview?.totalViews || 0) / Math.max(overview?.totalViews || 1, 1)) * 100, 100)}%`,
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Recent */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Recent Users */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Recent Users</h3>
                            <Link to="/admin/users" className="text-sm text-red-600 hover:text-red-700 cursor-pointer">
                                View all
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {overview?.recentUsers?.length > 0 ? (
                                overview.recentUsers.map((user) => (
                                    <div key={user._id} className="flex items-center gap-3">
                                        <img
                                            src={user.avatar}
                                            alt={user.fullName}
                                            className="h-8 w-8 rounded-full object-cover"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-gray-900">{user.fullName}</p>
                                            <p className="text-xs text-gray-500">@{user.username}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">No users yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Videos */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Recent Videos</h3>
                            <Link to="/admin/videos" className="text-sm text-red-600 hover:text-red-700 cursor-pointer">
                                View all
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {overview?.recentVideos?.length > 0 ? (
                                overview.recentVideos.map((video) => (
                                    <div key={video._id} className="flex items-center gap-3">
                                        <img
                                            src={video.thumbnail}
                                            alt={video.title}
                                            className="h-10 w-16 rounded-lg object-cover"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-gray-900">{video.title}</p>
                                            <p className="text-xs text-gray-500">{video.owner?.fullName}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">No videos yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Comments */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Recent Comments</h3>
                            <Link to="/admin/comments" className="text-sm text-red-600 hover:text-red-700 cursor-pointer">
                                View all
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {overview?.recentComments?.length > 0 ? (
                                overview.recentComments.map((comment) => (
                                    <div key={comment._id} className="flex items-start gap-3">
                                        <img
                                            src={comment.owner?.avatar}
                                            alt={comment.owner?.fullName}
                                            className="h-8 w-8 rounded-full object-cover"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-gray-900">{comment.owner?.fullName}</p>
                                            <p className="text-xs text-gray-500 line-clamp-2">{comment.content}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">No comments yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
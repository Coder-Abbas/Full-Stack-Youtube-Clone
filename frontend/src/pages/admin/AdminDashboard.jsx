import React, { useEffect } from "react";
import {
    Users,
    Video,
    MessageSquare,
    Eye,
    TrendingUp,
} from "lucide-react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";

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

    // Data for the bar chart (Users / Videos / Comments)
    const barData = [
        { name: "Users", value: overview?.totalUsers || 0, fill: "#3b82f6" },
        { name: "Videos", value: overview?.totalVideos || 0, fill: "#22c55e" },
        { name: "Comments", value: overview?.totalComments || 0, fill: "#a855f7" },
    ];

    // Data for the pie/donut chart showing platform composition
    const pieData = [
        { name: "Users", value: overview?.totalUsers || 0 },
        { name: "Videos", value: overview?.totalVideos || 0 },
        { name: "Comments", value: overview?.totalComments || 0 },
        { name: "Views", value: overview?.totalViews || 0 },
    ];
    const PIE_COLORS = ["#3b82f6", "#22c55e", "#a855f7", "#f97316"];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md text-sm">
                    <p className="font-medium text-gray-900">{label ?? payload[0].name}</p>
                    <p className="text-gray-600">
                        {payload[0].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

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
                            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
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
                        <h3 className="font-semibold text-gray-900 mb-4">Platform Overview</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                                    <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={56}>
                                        {barData.map((entry, index) => (
                                            <Cell key={`bar-cell-${index}`} fill={entry.fill} className="cursor-pointer" />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Donut Chart */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-4">Platform Composition</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius="55%"
                                        outerRadius="80%"
                                        paddingAngle={3}
                                        className="cursor-pointer"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`pie-cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={32}
                                        iconType="circle"
                                        wrapperStyle={{ fontSize: 12, color: "#6b7280" }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
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
                        <div className="space-y-1">
                            {overview?.recentUsers?.length > 0 ? (
                                overview.recentUsers.map((user) => (
                                    <div
                                        key={user._id}
                                        className="flex items-center gap-3 rounded-xl p-2 -mx-2 cursor-pointer transition-colors hover:bg-gray-50"
                                    >
                                        <img
                                            src={user.avatar}
                                            alt={user.fullName}
                                            className="h-8 w-8 rounded-full object-cover ring-2 ring-transparent transition group-hover:ring-red-100"
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
                        <div className="space-y-1">
                            {overview?.recentVideos?.length > 0 ? (
                                overview.recentVideos.map((video) => (
                                    <div
                                        key={video._id}
                                        className="flex items-center gap-3 rounded-xl p-2 -mx-2 cursor-pointer transition-colors hover:bg-gray-50"
                                    >
                                        <img
                                            src={video.thumbnail}
                                            alt={video.title}
                                            className="h-10 w-16 rounded-lg object-cover transition-transform duration-200 hover:scale-105"
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
                        <div className="space-y-1">
                            {overview?.recentComments?.length > 0 ? (
                                overview.recentComments.map((comment) => (
                                    <div
                                        key={comment._id}
                                        className="flex items-start gap-3 rounded-xl p-2 -mx-2 cursor-pointer transition-colors hover:bg-gray-50"
                                    >
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
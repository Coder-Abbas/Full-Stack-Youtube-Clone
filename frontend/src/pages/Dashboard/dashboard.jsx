import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    LayoutDashboard,
    Eye,
    Users,
    Video as VideoIcon,
    ThumbsUp,
    UserPlus,
    TrendingUp,
    PlayCircle,
    CalendarDays,
    Loader2,
    AlertCircle,
    ArrowUpRight,
} from "lucide-react";

import Navbar from "../../components/navbar/navbar";
import Sidebar from "../../components/sidebar";
import useAuthStore from "../../store/authStore";
import axiosInstance from "../../api/axiosInstance";

// ----------------------------------------------------------
// Helpers
// ----------------------------------------------------------

const toHttps = (url) =>
    url ? url.replace(/^http:\/\//i, "https://") : url;

const formatCount = (n = 0) => {
    const num = Number(n) || 0;

    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;

    return `${num}`;
};

const formatDate = (value) => {
    if (!value) return "—";

    const d = new Date(value);

    if (isNaN(d.getTime())) return "—";

    return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const shortDate = (value) => {
    if (!value) return "";

    const d = new Date(value);

    if (isNaN(d.getTime())) return "";

    return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
};

// ----------------------------------------------------------
// Sub-components
// ----------------------------------------------------------

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
        <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}
        >
            <Icon size={22} />
        </div>

        <div className="min-w-0">
            <p className="truncate text-sm text-gray-500">{label}</p>

            <p className="text-2xl font-bold text-gray-900">
                {formatCount(value)}
            </p>
        </div>
    </div>
);

const SectionCard = ({ title, icon: Icon, action, children }) => (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
                {Icon && <Icon size={18} className="text-gray-500" />}
                {title}
            </h2>

            {action}
        </div>

        {children}
    </div>
);

const VideoRow = ({ video }) => (
    <div className="flex items-center gap-3 py-2.5">
        <img
            src={toHttps(video.thumbnail)}
            alt={video.title}
            className="h-14 w-24 shrink-0 rounded-lg bg-gray-100 object-cover"
        />

        <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">
                {video.title}
            </p>

            <p className="mt-0.5 text-xs text-gray-500">
                {formatCount(video.views)} views ·{" "}
                {formatDate(video.createdAt)}
            </p>
        </div>

        {typeof video.duration === "number" && (
            <span className="shrink-0 text-xs text-gray-400">
                {Math.floor(video.duration / 60)}:
                {(video.duration % 60).toString().padStart(2, "0")}
            </span>
        )}
    </div>
);

const SubscriberAvatar = ({ sub }) => {
    const subscriber = sub.subscriber || {};

    return (
        <Link
            to={`/channel/${subscriber.username}`}
            title={subscriber.fullName || subscriber.username}
            className="group flex flex-col items-center gap-1.5 text-center"
        >
            <img
                src={toHttps(subscriber.avatar)}
                alt={subscriber.fullName || subscriber.username}
                className="h-12 w-12 rounded-full bg-gray-100 object-cover ring-2 ring-transparent transition group-hover:ring-blue-400"
            />

            <span className="w-16 truncate text-xs text-gray-600 group-hover:text-gray-900">
                {subscriber.fullName || subscriber.username}
            </span>
        </Link>
    );
};

const EmptyState = ({ message }) => (
    <p className="py-8 text-center text-sm text-gray-400">{message}</p>
);

// ----------------------------------------------------------
// Analytics bars
// ----------------------------------------------------------

const AnalyticsChart = ({ analytics }) => {
    const maxViews = analytics.reduce(
        (max, a) => Math.max(max, a.views || 0),
        0
    );

    const totalLikes = analytics.reduce((sum, a) => sum + (a.likes || 0), 0);
    const totalComments = analytics.reduce(
        (sum, a) => sum + (a.comments || 0),
        0
    );

    if (!analytics.length) {
        return <EmptyState message="No analytics data yet." />;
    }

    return (
        <div>
            <div className="mb-4 flex flex-wrap gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                    Total likes: {formatCount(totalLikes)}
                </span>

                <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                    Total comments: {formatCount(totalComments)}
                </span>
            </div>

            <div className="flex h-40 items-end gap-2 overflow-x-auto">
                {analytics.map((a) => {
                    const height = maxViews
                        ? Math.max(6, ((a.views || 0) / maxViews) * 100)
                        : 6;

                    return (
                        <div
                            key={a._id}
                            className="flex min-w-[28px] flex-1 flex-col items-center justify-end gap-1"
                            title={`${formatCount(a.views)} views`}
                        >
                            <div
                                className="w-full rounded-t-md bg-gradient-to-t from-blue-500 to-blue-400 transition-all"
                                style={{ height: `${height}%` }}
                            />

                            <span className="text-[10px] text-gray-400">
                                {shortDate(a._id)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ----------------------------------------------------------
// Page
// ----------------------------------------------------------

const Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(
        typeof window !== "undefined" ? window.innerWidth >= 750 : false
    );

    const { authUser, isCheckingAuth } = useAuthStore();

    const [overview, setOverview] = useState(null);
    const [topVideos, setTopVideos] = useState([]);
    const [recentVideos, setRecentVideos] = useState([]);
    const [recentSubscribers, setRecentSubscribers] = useState([]);
    const [analytics, setAnalytics] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

    useEffect(() => {
        if (!authUser) {
            setIsLoading(false);
            return;
        }

        const fetchDashboard = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const [overviewRes, topRes, recentRes, subsRes, analyticsRes] =
                    await Promise.all([
                        axiosInstance.get("/dashboard/overview"),
                        axiosInstance.get("/dashboard/top-videos"),
                        axiosInstance.get("/dashboard/recent-videos"),
                        axiosInstance.get("/dashboard/recent-subscribers"),
                        axiosInstance.get("/dashboard/analytics"),
                    ]);

                setOverview(overviewRes.data.data);
                setTopVideos(topRes.data.data || []);
                setRecentVideos(recentRes.data.data || []);
                setRecentSubscribers(subsRes.data.data || []);
                setAnalytics(analyticsRes.data.data || []);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                        "Failed to load dashboard data"
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboard();
    }, [authUser?._id]);

    const stats = overview
        ? [
              {
                  label: "Total Views",
                  value: overview.totalViews,
                  icon: Eye,
                  color: "bg-blue-50 text-blue-600",
              },
              {
                  label: "Subscribers",
                  value: overview.totalSubscribers,
                  icon: Users,
                  color: "bg-pink-50 text-pink-600",
              },
              {
                  label: "Videos",
                  value: overview.totalVideos,
                  icon: VideoIcon,
                  color: "bg-green-50 text-green-600",
              },
              {
                  label: "Likes",
                  value: overview.totalLikes,
                  icon: ThumbsUp,
                  color: "bg-purple-50 text-purple-600",
              },
          ]
        : [];

    let content;

    if (isCheckingAuth || isLoading) {
        content = (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                <Loader2 size={36} className="animate-spin" />
                <p className="mt-4 text-sm">Loading dashboard…</p>
            </div>
        );
    } else if (!authUser) {
        content = (
            <div className="flex flex-col items-center justify-center py-32 text-center">
                <LayoutDashboard size={40} className="text-gray-300" />
                <h2 className="mt-4 text-lg font-semibold text-gray-700">
                    Sign in to view your dashboard
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    Track views, subscribers and your video performance.
                </p>
                <Link
                    to="/login"
                    className="mt-6 rounded-full border border-blue-500 px-6 py-2 font-medium text-blue-500 transition hover:bg-blue-50"
                >
                    Login
                </Link>
            </div>
        );
    } else if (error) {
        content = (
            <div className="flex flex-col items-center justify-center py-32 text-center text-red-500">
                <AlertCircle size={36} />
                <p className="mt-4 text-sm">{error}</p>
            </div>
        );
    } else {
        content = (
            <div className="space-y-6">
                {/* Stat cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((s) => (
                        <StatCard key={s.label} {...s} />
                    ))}
                </div>

                {/* Top videos + Recent uploads */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <SectionCard
                        title="Top Videos"
                        icon={TrendingUp}
                        action={
                            <span className="text-xs text-gray-400">
                                By views
                            </span>
                        }
                    >
                        {topVideos.length ? (
                            <div className="divide-y divide-gray-100">
                                {topVideos.map((v) => (
                                    <VideoRow key={v._id} video={v} />
                                ))}
                            </div>
                        ) : (
                            <EmptyState message="No videos uploaded yet." />
                        )}
                    </SectionCard>

                    <SectionCard
                        title="Recent Uploads"
                        icon={PlayCircle}
                        action={
                            <span className="text-xs text-gray-400">
                                Latest
                            </span>
                        }
                    >
                        {recentVideos.length ? (
                            <div className="divide-y divide-gray-100">
                                {recentVideos.map((v) => (
                                    <VideoRow key={v._id} video={v} />
                                ))}
                            </div>
                        ) : (
                            <EmptyState message="No videos uploaded yet." />
                        )}
                    </SectionCard>
                </div>

                {/* Subscribers + Analytics */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <SectionCard
                        title="Recent Subscribers"
                        icon={UserPlus}
                        action={
                            <Link
                                to="/subscription"
                                className="flex items-center gap-1 text-xs font-medium text-blue-500 transition hover:text-blue-600"
                            >
                                View all <ArrowUpRight size={14} />
                            </Link>
                        }
                    >
                        {recentSubscribers.length ? (
                            <div className="flex flex-wrap gap-4 pt-1">
                                {recentSubscribers.map((s) => (
                                    <SubscriberAvatar key={s._id} sub={s} />
                                ))}
                            </div>
                        ) : (
                            <EmptyState message="No subscribers yet." />
                        )}
                    </SectionCard>

                    <SectionCard
                        title="Views Analytics"
                        icon={CalendarDays}
                        action={
                            <span className="text-xs text-gray-400">
                                Views over time
                            </span>
                        }
                    >
                        <AnalyticsChart analytics={analytics} />
                    </SectionCard>
                </div>
            </div>
        );
    }

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
                    ${isSidebarOpen ? "w-50" : "w-20"}
                `}
            >
                <Sidebar isSidebarOpen={isSidebarOpen} />
            </aside>

            {/* Main content */}
            <main
                className={`
                    absolute
                    top-16
                    bottom-0
                    right-0
                    overflow-y-auto
                    transition-all
                    duration-300
                    ${isSidebarOpen ? "left-50" : "left-20"}
                `}
            >
                <div className="p-6">
                    <div className="mb-6">
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                            <LayoutDashboard size={24} className="text-gray-700" />
                            Dashboard
                        </h1>

                        {authUser?.fullName && (
                            <p className="mt-1 text-sm text-gray-500">
                                Welcome back, {authUser.fullName}
                            </p>
                        )}
                    </div>

                    {content}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;

import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Eye,
    Users,
    Video as VideoIcon,
    ThumbsUp,
    MessageCircle,
    UserPlus,
    TrendingUp,
    TrendingDown,
    PlayCircle,
    Loader2,
    AlertCircle,
    ArrowUpRight,
    Pencil,
    Trash2,
} from "lucide-react";

import Navbar from "../../components/navbar/navbar";
import Sidebar from "../../components/sidebar";
import useAuthStore from "../../store/authStore";
import useVideoStore from "../../store/videoStore";
import axiosInstance from "../../api/axiosInstance";

// ----------------------------------------------------------
// Helpers
// ----------------------------------------------------------

const toHttps = (url) => (url ? url.replace(/^http:\/\//i, "https://") : url);

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
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// "3 hours ago" / "5 days ago" style relative time
const timeAgo = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "";

    const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
    if (seconds < 60) return "just now";

    const units = [
        { label: "y", secs: 31536000 },
        { label: "mo", secs: 2592000 },
        { label: "d", secs: 86400 },
        { label: "h", secs: 3600 },
        { label: "m", secs: 60 },
    ];

    for (const u of units) {
        const val = Math.floor(seconds / u.secs);
        if (val >= 1) return `${val}${u.label} ago`;
    }
    return "just now";
};

// Percentage change helper — returns null when there's nothing to compare against
const getChange = (current, previous) => {
    if (previous === undefined || previous === null) return null;
    const cur = Number(current) || 0;
    const prev = Number(previous) || 0;
    if (prev === 0) {
        if (cur === 0) return 0;
        return 100;
    }
    return ((cur - prev) / prev) * 100;
};

const ChangeBadge = ({ change, size = "xs" }) => {
    if (typeof change !== "number" || Number.isNaN(change)) return null;
    const isUp = change > 0;
    const isFlat = change === 0;
    return (
        <span
            className={`flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium ${
                size === "xs" ? "text-[11px]" : "text-xs"
            } ${
                isFlat
                    ? "bg-gray-100 text-gray-500"
                    : isUp
                    ? "bg-green-50 text-green-600"
                    : "bg-red-50 text-red-600"
            }`}
        >
            {!isFlat && (isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />)}
            {isUp && "+"}
            {change.toFixed(1)}%
        </span>
    );
};

// ----------------------------------------------------------
// Stat card
// ----------------------------------------------------------

const StatCard = ({ icon: Icon, label, value, color, change }) => (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
        <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}
        >
            <Icon size={22} />
        </div>

        <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm text-gray-500">{label}</p>
                <ChangeBadge change={change} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCount(value)}</p>
        </div>
    </div>
);

const SectionCard = ({ title, icon: Icon, action, children, className = "" }) => (
    <div
        className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}
    >
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

const EmptyState = ({ message }) => (
    <p className="py-8 text-center text-sm text-gray-400">{message}</p>
);

// ----------------------------------------------------------
// Top Videos — compact ranked list (sits beside the graph)
// ----------------------------------------------------------

const TopVideoRow = ({ video, rank, onVideoClick }) => {
    return (
        <button
            type="button"
            onClick={() => onVideoClick?.(video)}
            className="flex w-full items-center gap-3 py-2.5 text-left transition hover:bg-gray-50"
        >
            <span className="w-4 shrink-0 text-center text-xs font-semibold text-gray-400">
                {rank}
            </span>

            <img
                src={toHttps(video.thumbnail)}
                alt={video.title}
                className="h-11 w-[70px] shrink-0 rounded-lg bg-gray-100 object-cover"
            />

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                    {video.title}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                    {formatCount(video.views)} views
                </p>
            </div>
        </button>
    );
};

// ----------------------------------------------------------
// Recent Videos — table with thumbnail, likes, comments, actions
// ----------------------------------------------------------

const RecentVideosTable = ({ videos, onUpdate, onDelete }) => {
    if (!videos.length) {
        return <EmptyState message="No videos uploaded yet." />;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
                <thead>
                    <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
                        <th className="py-2 pr-3 font-medium">Video</th>
                        <th className="py-2 px-3 font-medium">Uploaded</th>
                        <th className="py-2 px-3 font-medium">
                            <span className="flex items-center gap-1">
                                <ThumbsUp size={12} /> Likes
                            </span>
                        </th>
                        <th className="py-2 px-3 font-medium">
                            <span className="flex items-center gap-1">
                                <MessageCircle size={12} /> Comments
                            </span>
                        </th>
                        <th className="py-2 pl-3 text-right font-medium">Actions</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                    {videos.map((v) => (
                        <tr key={v._id} className="group">
                            <td className="py-2.5 pr-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <img
                                        src={toHttps(v.thumbnail)}
                                        alt={v.title}
                                        className="h-12 w-20 shrink-0 rounded-lg bg-gray-100 object-cover"
                                    />
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-gray-900">
                                            {v.title}
                                        </p>
                                        <p className="mt-0.5 text-xs text-gray-500">
                                            {formatCount(v.views)} views
                                        </p>
                                    </div>
                                </div>
                            </td>

                            <td className="whitespace-nowrap py-2.5 px-3 text-sm text-gray-500">
                                {formatDate(v.createdAt)}
                            </td>

                            <td className="whitespace-nowrap py-2.5 px-3 text-sm font-medium text-gray-700">
                                {formatCount(v.likes)}
                            </td>

                            <td className="whitespace-nowrap py-2.5 px-3 text-sm font-medium text-gray-700">
                                {formatCount(v.comments)}
                            </td>

                            <td className="py-2.5 pl-3">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => onUpdate(v)}
                                        title="Edit video"
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                                    >
                                        <Pencil size={15} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDelete(v)}
                                        title="Delete video"
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600"
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
    );
};

// ----------------------------------------------------------
// Recent Subscribers — horizontal scroll row with "time ago"
// ----------------------------------------------------------

const SubscriberCard = ({ sub }) => {
    const subscriber = sub.subscriber || {};
    return (
        <Link
            to={`/channel/${subscriber.username}`}
            className="flex shrink-0 items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2.5 transition hover:border-blue-200 hover:bg-blue-50/50"
        >
            <img
                src={toHttps(subscriber.avatar)}
                alt={subscriber.fullName || subscriber.username}
                className="h-10 w-10 shrink-0 rounded-full bg-gray-100 object-cover"
            />
            <div className="min-w-0">
                <p className="max-w-[140px] truncate text-sm font-medium text-gray-900">
                    {subscriber.fullName || subscriber.username}
                </p>
                <p className="text-xs text-gray-400">
                    Subscribed {timeAgo(sub.createdAt)}
                </p>
            </div>
        </Link>
    );
};

// ----------------------------------------------------------
// Views chart — YouTube-Studio-style line/area chart
// ----------------------------------------------------------

const ViewsChart = ({ analytics }) => {
    const [hoverIdx, setHoverIdx] = useState(null);

    const width = 760;
    const height = 260;
    const padX = 8;
    const padTop = 20;
    const padBottom = 30;

    const { points, totalViews, totalLikes, totalComments, changePct } = useMemo(() => {
        const maxV = analytics.reduce((m, a) => Math.max(m, a.views || 0), 0);
        const n = analytics.length;
        const step = n > 1 ? (width - padX * 2) / (n - 1) : 0;

        const pts = analytics.map((a, i) => {
            const x = n > 1 ? padX + step * i : width / 2;
            const y =
                maxV > 0
                    ? padTop + (1 - (a.views || 0) / maxV) * (height - padTop - padBottom)
                    : height - padBottom;
            return { x, y, ...a };
        });

        const tViews = analytics.reduce((s, a) => s + (a.views || 0), 0);
        const tLikes = analytics.reduce((s, a) => s + (a.likes || 0), 0);
        const tComments = analytics.reduce((s, a) => s + (a.comments || 0), 0);

        const first = analytics[0]?.views || 0;
        const last = analytics[analytics.length - 1]?.views || 0;

        return {
            points: pts,
            totalViews: tViews,
            totalLikes: tLikes,
            totalComments: tComments,
            changePct: getChange(last, first),
        };
    }, [analytics]);

    if (!analytics.length) {
        return <EmptyState message="No analytics data yet." />;
    }

    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const areaPath =
        `M ${points[0].x} ${height - padBottom} ` +
        points.map((p) => `L ${p.x} ${p.y}`).join(" ") +
        ` L ${points[points.length - 1].x} ${height - padBottom} Z`;

    const labelStep = Math.max(1, Math.ceil(points.length / 7));

    return (
        <div>
            {/* Big current-total header, YouTube-Studio style */}
            <div className="mb-5">
                <p className="text-xs font-medium text-gray-500">Views</p>
                <div className="mt-1 flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-gray-900">
                        {formatCount(totalViews)}
                    </span>
                    <ChangeBadge change={changePct} size="sm" />
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                        <ThumbsUp size={12} className="text-gray-400" />
                        {formatCount(totalLikes)} likes
                    </span>
                    <span className="flex items-center gap-1.5">
                        <MessageCircle size={12} className="text-gray-400" />
                        {formatCount(totalComments)} comments
                    </span>
                </div>
            </div>

            <div className="relative">
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full overflow-visible"
                    preserveAspectRatio="none"
                >
                    <defs>
                        <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FF0000" stopOpacity="0.18" />
                            <stop offset="100%" stopColor="#FF0000" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {[0, 0.33, 0.66, 1].map((f) => (
                        <line
                            key={f}
                            x1={0}
                            x2={width}
                            y1={padTop + f * (height - padTop - padBottom)}
                            y2={padTop + f * (height - padTop - padBottom)}
                            stroke="#f1f5f9"
                            strokeWidth="1"
                        />
                    ))}

                    <path d={areaPath} fill="url(#viewsFill)" stroke="none" />
                    <path
                        d={linePath}
                        fill="none"
                        stroke="#FF0000"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {points.map((p, i) => (
                        <g key={i}>
                            <rect
                                x={p.x - width / points.length / 2}
                                y={0}
                                width={width / points.length}
                                height={height}
                                fill="transparent"
                                onMouseEnter={() => setHoverIdx(i)}
                                onMouseLeave={() =>
                                    setHoverIdx((cur) => (cur === i ? null : cur))
                                }
                            />
                            {hoverIdx === i && (
                                <line
                                    x1={p.x}
                                    x2={p.x}
                                    y1={padTop}
                                    y2={height - padBottom}
                                    stroke="#cbd5e1"
                                    strokeWidth="1"
                                    strokeDasharray="3 3"
                                />
                            )}
                            <circle
                                cx={p.x}
                                cy={p.y}
                                r={hoverIdx === i ? 5 : 3}
                                fill="#fff"
                                stroke="#FF0000"
                                strokeWidth="2"
                            />
                        </g>
                    ))}
                </svg>

                {hoverIdx !== null && points[hoverIdx] && (
                    <div
                        className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs shadow-md"
                        style={{
                            left: `${(points[hoverIdx].x / width) * 100}%`,
                            top: `${(points[hoverIdx].y / height) * 100}%`,
                        }}
                    >
                        <p className="font-semibold text-gray-900">
                            {formatCount(points[hoverIdx].views)} views
                        </p>
                        <p className="text-gray-400">{shortDate(points[hoverIdx]._id)}</p>
                    </div>
                )}
            </div>

            <div className="mt-1 flex justify-between text-[10px] text-gray-400">
                {points.map((p, i) =>
                    i % labelStep === 0 || i === points.length - 1 ? (
                        <span key={i}>{shortDate(p._id)}</span>
                    ) : null
                )}
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
    const navigate = useNavigate();
    const openSelectedVideo = useVideoStore((state) => state.openSelectedVideo);

    const [overview, setOverview] = useState(null);
    const [topVideos, setTopVideos] = useState([]);
    const [recentVideos, setRecentVideos] = useState([]);
    const [recentSubscribers, setRecentSubscribers] = useState([]);
    const [analytics, setAnalytics] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingVideo, setEditingVideo] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editVideoFile, setEditVideoFile] = useState(null);
    const [editThumbnail, setEditThumbnail] = useState(null);
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [editError, setEditError] = useState(null);

    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

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
                err.response?.data?.message || "Failed to load dashboard data"
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!authUser) {
            setIsLoading(false);
            return;
        }

        fetchDashboard();
    }, [authUser?._id]);

    const handleVideoClick = (video) => {
        openSelectedVideo(video._id);
        axiosInstance.patch(`/videos/${video._id}/view`).catch(() => {});
        navigate("/watch");
    };

    // Table action handlers — wire these to your real video routes
    const handleUpdateVideo = (video) => {
        // Adjust the route to match your video-edit page/endpoint
        window.location.href = `/video/edit/${video._id}`;
    };

    const handleDeleteVideo = async (video) => {
        const confirmed = window.confirm(
            `Delete "${video.title}"? This can't be undone.`
        );
        if (!confirmed) return;

        const prev = recentVideos;
        setRecentVideos((cur) => cur.filter((v) => v._id !== video._id)); // optimistic

        try {
            await axiosInstance.delete(`/videos/${video._id}`);
        } catch (err) {
            setRecentVideos(prev); // roll back on failure
            alert(
                err.response?.data?.message || "Failed to delete video. Try again."
            );
        }
    };

    const stats = overview
        ? [
              {
                  label: "Total Views",
                  value: overview.totalViews,
                  icon: Eye,
                  color: "bg-blue-50 text-blue-600",
                  change: getChange(overview.totalViews, overview.totalViewsLastPeriod),
              },
              {
                  label: "Subscribers",
                  value: overview.totalSubscribers,
                  icon: UserPlus,
                  color: "bg-pink-50 text-pink-600",
                  change: getChange(
                      overview.totalSubscribers,
                      overview.totalSubscribersLastPeriod
                  ),
              },
              {
                  label: "Videos",
                  value: overview.totalVideos,
                  icon: VideoIcon,
                  color: "bg-green-50 text-green-600",
                  change: getChange(overview.totalVideos, overview.totalVideosLastPeriod),
              },
              {
                  label: "Likes",
                  value: overview.totalLikes,
                  icon: ThumbsUp,
                  color: "bg-purple-50 text-purple-600",
                  change: getChange(overview.totalLikes, overview.totalLikesLastPeriod),
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

                {/* Graph (center/left, big) + Top Videos (right rail) */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <SectionCard title="Views Analytics" className="lg:col-span-2">
                        <ViewsChart analytics={analytics} />
                    </SectionCard>

                    <SectionCard
                        title="Top Videos"
                        icon={TrendingUp}
                        action={<span className="text-xs text-gray-400">By views</span>}
                    >
                        {topVideos.length ? (
                            <div className="divide-y divide-gray-100">
                                {topVideos.map((v, i) => (
                                    <TopVideoRow key={v._id} video={v} rank={i + 1} />
                                ))}
                            </div>
                        ) : (
                            <EmptyState message="No videos uploaded yet." />
                        )}
                    </SectionCard>
                </div>

                {/* Recent videos table */}
                <SectionCard
                    title="Recent Uploads"
                    icon={PlayCircle}
                    action={<span className="text-xs text-gray-400">Latest</span>}
                >
                    <RecentVideosTable
                        videos={recentVideos}
                        onUpdate={handleUpdateVideo}
                        onDelete={handleDeleteVideo}
                    />
                </SectionCard>

                {/* Recent subscribers — horizontal row */}
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
                        <div className="flex gap-3 overflow-x-auto pb-1">
                            {recentSubscribers.map((s) => (
                                <SubscriberCard key={s._id} sub={s} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState message="No subscribers yet." />
                    )}
                </SectionCard>
            </div>
        );
    }

    return (
        <div className="h-screen overflow-hidden bg-gray-50">
            <header className="fixed top-0 left-0 right-0 z-50 h-16">
                <Navbar toggleSidebar={toggleSidebar} />
            </header>

            <aside
                className={`fixed left-0 top-16 bottom-0 z-40 transition-all duration-300 ${
                    isSidebarOpen ? "w-50" : "w-20"
                }`}
            >
                <Sidebar isSidebarOpen={isSidebarOpen} />
            </aside>

            <main
                className={`absolute top-16 bottom-0 right-0 overflow-y-auto transition-all duration-300 ${
                    isSidebarOpen ? "left-50" : "left-20"
                }`}
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
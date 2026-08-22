import React, { useEffect, useState } from "react";
import {
    Search,
    Trash2,
    X,
    Edit3,
    Eye,
} from "lucide-react";

import AdminLayout from "../../components/admin/AdminLayout";
import useAdminStore from "../../store/adminStore";
import toast from "react-hot-toast";

const AdminVideos = () => {
    const {
        videos,
        videosMeta,
        getVideos,
        getVideoById,
        updateVideo,
        deleteVideo,
        error,
    } = useAdminStore();

    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [viewVideo, setViewVideo] = useState(null);
    const [editVideo, setEditVideo] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editIsPublished, setEditIsPublished] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        getVideos({ query: searchQuery, page, limit: 10 });
    }, [page, searchQuery, getVideos]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        getVideos({ query: searchQuery, page: 1, limit: 10 });
    };

    const handleView = (video) => {
        getVideoById(video._id);
        setViewVideo(video);
    };

    const handleEdit = (video) => {
        setEditVideo(video);
        setEditTitle(video.title || "");
        setEditDescription(video.description || "");
        setEditIsPublished(video.isPublished || false);
    };

    const handleSaveEdit = async () => {
        if (!editVideo) return;
        setIsSaving(true);
        const result = await updateVideo(editVideo._id, {
            title: editTitle,
            description: editDescription,
            isPublished: editIsPublished,
        });
        setIsSaving(false);
        if (result.success) {
            toast.success("Video updated successfully");
            setEditVideo(null);
        } else {
            toast.error(result.message || "Failed to update video");
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        setIsDeleting(true);
        const result = await deleteVideo(deleteConfirm._id);
        setIsDeleting(false);
        if (result.success) {
            toast.success("Video deleted successfully");
            setDeleteConfirm(null);
        } else {
            toast.error(result.message || "Failed to delete video");
        }
    };

    const totalPages = videosMeta.totalPages || 1;

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Videos</h1>
                        <p className="text-gray-500 mt-1">
                            Total Videos: {videosMeta.total.toLocaleString()}
                        </p>
                    </div>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="relative">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search videos..."
                            className="w-full sm:w-80 pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-500"
                        />
                    </form>
                </div>

                {/* Error */}
                {error && (
                    <div className="text-center py-10 text-red-500">
                        <p>{error}</p>
                    </div>
                )}

                {/* Table */}
                {!error && (
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px] text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
                                        <th className="py-3 px-4 font-medium">Thumbnail</th>
                                        <th className="py-3 px-4 font-medium">Title</th>
                                        <th className="py-3 px-4 font-medium">Owner</th>
                                        <th className="py-3 px-4 font-medium">Views</th>
                                        <th className="py-3 px-4 font-medium">Status</th>
                                        <th className="py-3 px-4 text-right font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {videos.map((video) => (
                                        <tr key={video._id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <img
                                                    src={video.thumbnail}
                                                    alt={video.title}
                                                    className="h-12 w-20 rounded-lg object-cover"
                                                />
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="text-sm font-medium text-gray-900 line-clamp-1">{video.title}</p>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {video.owner?.fullName || "Unknown"}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {video.views?.toLocaleString() || 0}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${video.isPublished ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-600"}`}>
                                                    {video.isPublished ? "Published" : "Draft"}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleView(video)}
                                                        title="View"
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                                                    >
                                                        <Eye size={15} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEdit(video)}
                                                        title="Edit"
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-yellow-50 hover:text-yellow-600 cursor-pointer"
                                                    >
                                                        <Edit3 size={15} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteConfirm(video)}
                                                        title="Delete"
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600 cursor-pointer"
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

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
                                <button
                                    type="button"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    className="px-4 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50 cursor-pointer"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-gray-500">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    type="button"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    className="px-4 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50 cursor-pointer"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* View Video Modal */}
                {viewVideo && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                        onClick={() => setViewVideo(null)}
                    >
                        <div
                            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Video Details</h3>
                                <button
                                    type="button"
                                    onClick={() => setViewVideo(null)}
                                    className="p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <img
                                    src={viewVideo.thumbnail}
                                    alt={viewVideo.title}
                                    className="w-full h-48 object-cover rounded-xl"
                                />
                                <div>
                                    <p className="text-sm text-gray-500">Title</p>
                                    <p className="font-medium text-gray-900">{viewVideo.title}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Description</p>
                                    <p className="text-sm text-gray-700 line-clamp-3">{viewVideo.description}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Owner</p>
                                        <p className="font-medium text-gray-900">{viewVideo.owner?.fullName}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Views</p>
                                        <p className="font-medium text-gray-900">{viewVideo.views?.toLocaleString() || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Duration</p>
                                        <p className="font-medium text-gray-900">{viewVideo.duration ? `${Math.floor(viewVideo.duration / 60)}:${String(viewVideo.duration % 60).padStart(2, "0")}` : "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Status</p>
                                        <p className="font-medium text-gray-900">{viewVideo.isPublished ? "Published" : "Draft"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Created</p>
                                        <p className="font-medium text-gray-900">{new Date(viewVideo.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setViewVideo(null); handleEdit(viewVideo); }}
                                    className="px-4 py-2 text-sm rounded-full bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewVideo(null)}
                                    className="px-4 py-2 text-sm rounded-full border border-gray-200 hover:bg-gray-50 cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Video Modal */}
                {editVideo && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                        onClick={() => setEditVideo(null)}
                    >
                        <div
                            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Edit Video</h3>
                                <button
                                    type="button"
                                    onClick={() => setEditVideo(null)}
                                    className="p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-red-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        rows={3}
                                        className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-red-500"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isPublished"
                                        checked={editIsPublished}
                                        onChange={(e) => setEditIsPublished(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                    />
                                    <label htmlFor="isPublished" className="text-sm text-gray-700">Published</label>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditVideo(null)}
                                    className="px-4 py-2 text-sm rounded-full border border-gray-200 hover:bg-gray-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveEdit}
                                    disabled={isSaving}
                                    className="px-4 py-2 text-sm rounded-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                                >
                                    {isSaving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                        onClick={() => setDeleteConfirm(null)}
                    >
                        <div
                            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-semibold text-gray-900">Delete Video?</h3>
                            <p className="text-gray-500 mt-2">
                                Are you sure you want to delete <strong>"{deleteConfirm.title}"</strong>? This action cannot be undone.
                            </p>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setDeleteConfirm(null)}
                                    className="px-4 py-2 text-sm rounded-full border border-gray-200 hover:bg-gray-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="px-4 py-2 text-sm rounded-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                                >
                                    {isDeleting ? "Deleting..." : "Delete Video"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminVideos;

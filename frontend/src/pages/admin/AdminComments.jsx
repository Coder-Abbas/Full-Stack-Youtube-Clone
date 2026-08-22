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

const AdminComments = () => {
    const {
        comments,
        commentsMeta,
        getComments,
        getCommentById,
        updateComment,
        deleteComment,
        error,
    } = useAdminStore();

    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [viewComment, setViewComment] = useState(null);
    const [editComment, setEditComment] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        getComments({ query: searchQuery, page, limit: 10 });
    }, [page, searchQuery, getComments]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        getComments({ query: searchQuery, page: 1, limit: 10 });
    };

    const handleView = (comment) => {
        getCommentById(comment._id);
        setViewComment(comment);
    };

    const handleEdit = (comment) => {
        setEditComment(comment);
        setEditContent(comment.content || "");
    };

    const handleSaveEdit = async () => {
        if (!editComment || !editContent.trim()) return;
        setIsSaving(true);
        const result = await updateComment(editComment._id, editContent);
        setIsSaving(false);
        if (result.success) {
            toast.success("Comment updated successfully");
            setEditComment(null);
        } else {
            toast.error(result.message || "Failed to update comment");
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        setIsDeleting(true);
        const result = await deleteComment(deleteConfirm._id);
        setIsDeleting(false);
        if (result.success) {
            toast.success("Comment deleted successfully");
            setDeleteConfirm(null);
        } else {
            toast.error(result.message || "Failed to delete comment");
        }
    };

    const totalPages = commentsMeta.totalPages || 1;

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Comments</h1>
                        <p className="text-gray-500 mt-1">
                            Total Comments: {commentsMeta.total.toLocaleString()}
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
                            placeholder="Search comments..."
                            className="w-full sm:w-80 pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-pink-500"
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
                                        <th className="py-3 px-4 font-medium">User</th>
                                        <th className="py-3 px-4 font-medium">Comment</th>
                                        <th className="py-3 px-4 font-medium">Video</th>
                                        <th className="py-3 px-4 font-medium">Created</th>
                                        <th className="py-3 px-4 text-right font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {comments.map((comment) => (
                                        <tr key={comment._id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={comment.owner?.avatar}
                                                        alt={comment.owner?.fullName}
                                                        className="h-8 w-8 rounded-full object-cover"
                                                    />
                                                    <span className="text-sm font-medium text-gray-900">{comment.owner?.fullName}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">{comment.content}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="text-sm text-gray-600 line-clamp-1">{comment.video?.title || "Unknown"}</p>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-500">
                                                {new Date(comment.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleView(comment)}
                                                        title="View"
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                                                    >
                                                        <Eye size={15} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEdit(comment)}
                                                        title="Edit"
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-yellow-50 hover:text-yellow-600"
                                                    >
                                                        <Edit3 size={15} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteConfirm(comment)}
                                                        title="Delete"
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

                {/* View Comment Modal */}
                {viewComment && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                        onClick={() => setViewComment(null)}
                    >
                        <div
                            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Comment Details</h3>
                                <button
                                    type="button"
                                    onClick={() => setViewComment(null)}
                                    className="p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={viewComment.owner?.avatar}
                                        alt={viewComment.owner?.fullName}
                                        className="h-10 w-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900">{viewComment.owner?.fullName}</p>
                                        <p className="text-xs text-gray-500">@{viewComment.owner?.username}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Video</p>
                                    <p className="font-medium text-gray-900">{viewComment.video?.title || "Unknown"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Comment</p>
                                    <p className="text-gray-700 bg-gray-50 rounded-xl p-3">{viewComment.content}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Likes</p>
                                        <p className="font-medium text-gray-900">{viewComment.commentLikesCount || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Created</p>
                                        <p className="font-medium text-gray-900">{new Date(viewComment.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setViewComment(null); handleEdit(viewComment); }}
                                    className="px-4 py-2 text-sm rounded-full bg-pink-600 text-white hover:bg-pink-700 cursor-pointer"
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewComment(null)}
                                    className="px-4 py-2 text-sm rounded-full border border-gray-200 hover:bg-gray-50 cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Comment Modal */}
                {editComment && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                        onClick={() => setEditComment(null)}
                    >
                        <div
                            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Edit Comment</h3>
                                <button
                                    type="button"
                                    onClick={() => setEditComment(null)}
                                    className="p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    rows={4}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-pink-500"
                                />
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditComment(null)}
                                    className="px-4 py-2 text-sm rounded-full border border-gray-200 hover:bg-gray-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveEdit}
                                    disabled={isSaving}
                                    className="px-4 py-2 text-sm rounded-full bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-50 cursor-pointer"
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
                            <h3 className="text-lg font-semibold text-gray-900">Delete Comment?</h3>
                            <p className="text-gray-500 mt-2">
                                Are you sure you want to delete this comment? This action cannot be undone.
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
                                    {isDeleting ? "Deleting..." : "Delete Comment"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminComments;

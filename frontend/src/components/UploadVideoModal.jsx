import React, { useState } from "react";
import { X, Upload, Video, Image, CheckCircle, Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import useVideoStore from "../store/videoStore";

const UploadVideoModal = ({ onClose }) => {
    const getVideos = useVideoStore((state) => state.getVideos);
    const [step, setStep] = useState(1);
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [videoPreview, setVideoPreview] = useState("");
    const [thumbnailPreview, setThumbnailPreview] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedVideo, setUploadedVideo] = useState(null);
    const [isPublishing, setIsPublishing] = useState(false);
    const [error, setError] = useState(null);

    // Handle video file selection
    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVideoFile(file);
            setVideoPreview(URL.createObjectURL(file));
        }
    };

    // Handle thumbnail selection
    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setThumbnailFile(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    // Step 1: Validate and go to step 2
    const handleNext = () => {
        setError(null);
        if (!videoFile) {
            setError("Please select a video file");
            return;
        }
        if (!thumbnailFile) {
            setError("Please select a thumbnail image");
            return;
        }
        if (!title.trim()) {
            setError("Please enter a video title");
            return;
        }
        if (!description.trim()) {
            setError("Please enter a video description");
            return;
        }
        setStep(2);
    };

    // Step 2: Upload video to backend
    const handleUpload = async () => {
        setError(null);
        setIsUploading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append("videoFile", videoFile);
            formData.append("thumbnail", thumbnailFile);
            formData.append("title", title);
            formData.append("description", description);

            const response = await axiosInstance.post("/videos/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(percent);
                },
            });

            setUploadedVideo(response.data.data);
            setUploadProgress(100);
            setIsUploading(false);
            setStep(3);
        } catch (err) {
            console.error("Upload error:", err);
            setError(err.response?.data?.message || "Failed to upload video");
            setIsUploading(false);
        }
    };

    // Step 3: Publish video
    const handlePublish = async () => {
        setError(null);
        setIsPublishing(true);

        try {
            if (uploadedVideo?._id) {
                await axiosInstance.patch(`/videos/toggle/publish/${uploadedVideo._id}`);
            }
            setIsPublishing(false);
            // Refresh videos after publish
            getVideos();
            onClose();
        } catch (err) {
            console.error("Publish error:", err);
            setError(err.response?.data?.message || "Failed to publish video");
            setIsPublishing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Upload Video</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 px-6 py-4 border-b border-gray-200">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                    step >= s
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-200 text-gray-500"
                                }`}
                            >
                                {step > s ? <CheckCircle size={16} /> : s}
                            </div>
                            <span
                                className={`text-sm ${
                                    step >= s ? "text-gray-900 font-medium" : "text-gray-400"
                                }`}
                            >
                                {s === 1 ? "Details" : s === 2 ? "Upload" : "Publish"}
                            </span>
                            {s < 3 && <ChevronRight size={16} className="text-gray-400" />}
                        </div>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-200">
                        {error}
                    </div>
                )}

                {/* Step 1: Video Details */}
                {step === 1 && (
                    <div className="p-6 space-y-6">
                        {/* Video File */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Video File</label>
                            {videoPreview ? (
                                <div className="relative">
                                    <video
                                        src={videoPreview}
                                        controls
                                        className="w-full aspect-video bg-black rounded-xl"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setVideoFile(null);
                                            setVideoPreview("");
                                        }}
                                        className="absolute top-2 right-2 p-2 bg-black/70 text-white rounded-full hover:bg-black"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                                    <Video size={40} className="text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-500">Click to select video</span>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={handleVideoChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>

                        {/* Thumbnail */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Thumbnail</label>
                            {thumbnailPreview ? (
                                <div className="relative w-64">
                                    <img
                                        src={thumbnailPreview}
                                        alt="Thumbnail"
                                        className="w-full aspect-video object-cover rounded-xl"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setThumbnailFile(null);
                                            setThumbnailPreview("");
                                        }}
                                        className="absolute top-2 right-2 p-2 bg-black/70 text-white rounded-full hover:bg-black"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-64 aspect-video border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                                    <Image size={32} className="text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-500">Select thumbnail</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleThumbnailChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter video title"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter video description"
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 resize-none"
                            />
                        </div>

                        {/* Next Button */}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleNext}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition"
                            >
                                Next
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Upload */}
                {step === 2 && (
                    <div className="p-6 space-y-6">
                        <div className="text-center py-8">
                            {isUploading ? (
                                <div className="space-y-4">
                                    <Loader2 size={48} className="mx-auto text-blue-600 animate-spin" />
                                    <p className="text-gray-600">Uploading video...</p>
                                    <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                    <p className="text-sm text-gray-500">{uploadProgress}%</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <Upload size={48} className="mx-auto text-gray-400" />
                                    <p className="text-gray-600">Ready to upload your video</p>
                                    <p className="text-sm text-gray-500">
                                        Title: <strong>{title}</strong>
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                disabled={isUploading}
                                className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 disabled:opacity-50"
                            >
                                <ChevronLeft size={18} />
                                Back
                            </button>
                            <button
                                type="button"
                                onClick={handleUpload}
                                disabled={isUploading}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={18} />
                                        Upload Video
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Publish */}
                {step === 3 && uploadedVideo && (
                    <div className="p-6 space-y-6">
                        <div className="text-center py-4">
                            <CheckCircle size={48} className="mx-auto text-green-500" />
                            <h3 className="text-xl font-bold text-gray-900 mt-3">Video Uploaded!</h3>
                            <p className="text-gray-500 mt-1">Your video has been uploaded successfully.</p>
                        </div>

                        {/* Video Details */}
                        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                            <div className="flex items-center gap-4">
                                <img
                                    src={uploadedVideo.thumbnail}
                                    alt={uploadedVideo.title}
                                    className="w-40 aspect-video object-cover rounded-lg"
                                />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 line-clamp-2">
                                        {uploadedVideo.title}
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {uploadedVideo.description}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Duration: {Math.floor(uploadedVideo.duration / 60)}:
                                        {Math.floor(uploadedVideo.duration % 60).toString().padStart(2, "0")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                disabled={isPublishing}
                                className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 disabled:opacity-50"
                            >
                                <ChevronLeft size={18} />
                                Back
                            </button>
                            <button
                                type="button"
                                onClick={handlePublish}
                                disabled={isPublishing}
                                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 disabled:opacity-50"
                            >
                                {isPublishing ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Publishing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={18} />
                                        Publish
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadVideoModal;
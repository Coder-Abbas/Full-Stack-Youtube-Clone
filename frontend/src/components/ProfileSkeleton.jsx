import React from "react";

const ProfileSkeleton = () => {
    return (
        <div className="min-h-screen bg-[#f9f9f9]">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Channel Header Skeleton */}
                <div className="flex flex-col md:flex-row md:items-center gap-6 animate-pulse">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        <div className="w-28 h-28 md:w-40 md:h-40 rounded-full bg-gray-200" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-3">
                        <div className="h-8 w-56 bg-gray-200 rounded" />
                        <div className="h-4 w-32 bg-gray-200 rounded" />
                        <div className="h-4 w-48 bg-gray-200 rounded" />
                        <div className="flex gap-3 pt-2">
                            <div className="h-10 w-32 bg-gray-200 rounded-full" />
                            <div className="h-10 w-32 bg-gray-200 rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Tabs Skeleton */}
                <div className="flex gap-6 mt-10 border-b border-gray-200 pb-3">
                    <div className="h-5 w-16 bg-gray-200 rounded" />
                    <div className="h-5 w-20 bg-gray-200 rounded" />
                </div>

                {/* Videos Grid Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="aspect-video bg-gray-200 rounded-2xl" />
                            <div className="flex gap-3 mt-3">
                                <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-full" />
                                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProfileSkeleton;
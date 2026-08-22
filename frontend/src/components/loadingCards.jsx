import React from "react";

const HomePageCardSkeleton = () => {
  return (
    <div className="w-full animate-pulse ml-3">
      {/* ================= Thumbnail ================= */}
      <div className="relative w-full aspect-video overflow-hidden rounded-xl bg-gray-200" />

      {/* ================= Video Information ================= */}
      <div className="flex gap-3 mt-3">
        {/* Channel Avatar */}
        <div className="shrink-0">
          <div className="w-10 h-10 rounded-full bg-gray-200" />
        </div>

        {/* Text Information */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Title lines */}
          <div className="h-3.5 bg-gray-200 rounded w-full" />
          <div className="h-3.5 bg-gray-200 rounded w-3/4" />

          {/* Channel name */}
          <div className="h-3 bg-gray-200 rounded w-1/2 mt-2" />

          {/* Views + Date */}
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
};

const LoadingCards = () => {
  return (
    <div className="video-grid-responsive">
      {Array.from({ length: 6 }).map((_, index) => (
        <HomePageCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default LoadingCards;

import React, { useEffect, useState } from "react";
import Navbar from "../components/navbar/navbar";
import Sidebar from "../components/sidebar";
import HomePageCard from "../components/videoCards/homePageCard";
import useVideoStore from "../store/videoStore";
import LoadingCards from "../components/loadingCards";

const LikedVideos = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { videos, isLoading, error, getVideos } = useVideoStore();

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    getVideos();
  }, [getVideos]);

  // Guard: make sure we always have an array to map over,
  // even if the store or API returns something unexpected.
  const videoList = Array.isArray(videos) ? videos : [];

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
                    ${isSidebarOpen ? "w-64" : "w-20"}
                `}
      >
        <Sidebar isSidebarOpen={isSidebarOpen} />
      </aside>

      {/* Main */}
      <main
        className={`
                    absolute
                    top-16
                    bottom-0
                    right-0
                    overflow-y-auto
                    transition-all
                    duration-300
                    ${isSidebarOpen ? "left-64" : "left-20"}
                `}
      >
        <div className="p-6">
          {/* Loading */}
          {isLoading && <LoadingCards />}

          {/* Error */}
          {!isLoading && error && (
            <div className="text-center py-10">
              <p className="text-red-500">{error}</p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && videos.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">No videos found.</p>
            </div>
          )}

          {/* Videos */}
          {!isLoading && !error && videos.length > 0 && (
            <div
              className="
                                grid
                                grid-cols-1
                                sm:grid-cols-2
                                lg:grid-cols-3
                                xl:grid-cols-3
                                gap-x-2
                                gap-y-1
                            "
            >
              {videos.map((video) => (
                <HomePageCard key={video._id} video={video} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LikedVideos;
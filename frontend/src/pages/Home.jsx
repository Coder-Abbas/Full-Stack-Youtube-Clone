import React, { useState } from "react";
import Navbar from "../components/navbar/navbar";
import Sidebar from "../components/sidebar";
import HomePageCard from "../components/videoCards/homePageCard";

const videos = [
    {
        id: 1,
        title: "Build a Full Stack MERN Application From Scratch",
        thumbnail: "https://picsum.photos/640/360?random=1",
        channelName: "Code With Abbas",
        channelAvatar: "https://i.pravatar.cc/100?img=1",
        views: "125K",
        uploadedAt: "2 days ago",
        duration: "12:45",
    },
    {
        id: 2,
        title: "React JS Complete Tutorial for Beginners",
        thumbnail: "https://picsum.photos/640/360?random=2",
        channelName: "Programming Hub",
        channelAvatar: "https://i.pravatar.cc/100?img=2",
        views: "85K",
        uploadedAt: "1 week ago",
        duration: "18:32",
    },
    {
        id: 3,
        title: "MongoDB and Express REST API Tutorial",
        thumbnail: "https://picsum.photos/640/360?random=3",
        channelName: "Web Dev Academy",
        channelAvatar: "https://i.pravatar.cc/100?img=3",
        views: "54K",
        uploadedAt: "3 days ago",
        duration: "25:10",
    },
    {
        id: 4,
        title: "Tailwind CSS Modern UI Design Tutorial",
        thumbnail: "https://picsum.photos/640/360?random=4",
        channelName: "Frontend Masters",
        channelAvatar: "https://i.pravatar.cc/100?img=4",
        views: "210K",
        uploadedAt: "5 days ago",
        duration: "10:25",
    },
    {
        id: 5,
        title: "Build a Full Stack MERN Application From Scratch",
        thumbnail: "https://picsum.photos/640/360?random=1",
        channelName: "Code With Abbas",
        channelAvatar: "https://i.pravatar.cc/100?img=1",
        views: "125K",
        uploadedAt: "2 days ago",
        duration: "12:45",
    },
    {
        id: 6,
        title: "React JS Complete Tutorial for Beginners",
        thumbnail: "https://picsum.photos/640/360?random=2",
        channelName: "Programming Hub",
        channelAvatar: "https://i.pravatar.cc/100?img=2",
        views: "85K",
        uploadedAt: "1 week ago",
        duration: "18:32",
    },
    {
        id: 7,
        title: "MongoDB and Express REST API Tutorial",
        thumbnail: "https://picsum.photos/640/360?random=3",
        channelName: "Web Dev Academy",
        channelAvatar: "https://i.pravatar.cc/100?img=3",
        views: "54K",
        uploadedAt: "3 days ago",
        duration: "25:10",
    },
    {
        id: 8,
        title: "Tailwind CSS Modern UI Design Tutorial",
        thumbnail: "https://picsum.photos/640/360?random=4",
        channelName: "Frontend Masters",
        channelAvatar: "https://i.pravatar.cc/100?img=4",
        views: "210K",
        uploadedAt: "5 days ago",
        duration: "10:25",
    },
];



const Home = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    return (
        <div className="h-screen overflow-hidden bg-gray-50">

            {/* ================= NAVBAR ================= */}
            <header className="fixed top-0 left-0 right-0 z-50 h-16">
                <Navbar toggleSidebar={toggleSidebar} />
            </header>


            {/* ================= SIDEBAR ================= */}
            <aside
                className={`
                    fixed
                    left-0
                    top-16
                    bottom-0
                    z-40
                    transition-all
                    duration-300
                    ease-in-out
                    ${isSidebarOpen ? "w-58" : "w-20"}
                `}
            >
                <Sidebar isSidebarOpen={isSidebarOpen} />
            </aside>


            {/* ================= HOME CONTENT ================= */}
            <main
                className={`
                    absolute
                    top-16
                    bottom-0
                    right-0
                    overflow-y-auto
                    transition-all
                    duration-300
                    ease-in-out
                    ${isSidebarOpen ? "left-54" : "left-20"}
                `}
            >

                <div className="p-6">

                    <div className="
    grid
    grid-cols-1
    sm:grid-cols-2
    lg:grid-cols-3
    xl:grid-cols-3
    gap-x-4
    gap-y-1
">
                        {videos.map((video) => (
                            <HomePageCard
                                key={video.id}
                                video={video}
                            />
                        ))}
                    </div>



                </div>

            </main>

        </div>
    );
};

export default Home;
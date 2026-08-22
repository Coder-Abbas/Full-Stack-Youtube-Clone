import React, { useEffect } from 'react'
import Home from './pages/Home'
import { Routes, Route } from "react-router-dom"
import LikedVideos from './pages/liked-videos'
import SelectVideo from './components/selectVideo'
import Login from './pages/Auth/login'
import Register from './pages/Auth/register'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import ChannelPage from './pages/ChannelPage'
import { Toaster } from "react-hot-toast";
import Setting from './pages/Setting'
import WatchHistory from './pages/watchHistory'
import Subscription from "./pages/subscription"
import WatchLater from './pages/watchLater'
import SearchPage from "./pages/searchPage";
import Playlists from "./pages/Playlists";
import PlaylistDetail from "./pages/PlaylistDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import useVideoStore from "./store/videoStore";
import useChannelStore from "./store/channelStore";
import axiosInstance from "./api/axiosInstance";

// Routes that require an authenticated user
const protectedRoutes = [
    { path: "/liked-videos", element: <LikedVideos /> },
    { path: "/profile", element: <Profile /> },
    { path: "/profile/edit", element: <EditProfile /> },
    { path: "/settings", element: <Setting /> },
    { path: "/watch-history", element: <WatchHistory /> },
    { path: "/subscription", element: <Subscription /> },
    { path: "/watch-later", element: <WatchLater /> },
    { path: "/playlists", element: <Playlists /> },
];

const App = () => {
  // ==========================================
  // Real-time updates (Server-Sent Events)
  // On a new video upload (or channel update) the backend pushes an
  // event; we bump the store version counters so only the components
  // that depend on them (Home feed, channel/profile) re-render and
  // refetch — no full-page reload.
  // ==========================================

  useEffect(() => {
    const base = axiosInstance.defaults.baseURL || "http://localhost:8000/api/v1";
    const es = new EventSource(`${base}/events`);

    const onVideoPublished = () => {
      useVideoStore.getState().notifyVideoPublished();
      useChannelStore.getState().notifyChannelUpdated();
    };

    es.addEventListener("video-published", onVideoPublished);

    return () => {
      es.removeEventListener("video-published", onVideoPublished);
      es.close();
    };
  }, []);

  return (
    <div>
      <Toaster />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/watch" element={<SelectVideo />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/channel/:username" element={<ChannelPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/playlist/:playlistId" element={<PlaylistDetail />} />

        {protectedRoutes.map(({ path, element }) => (
            <Route
                key={path}
                path={path}
                element={<ProtectedRoute>{element}</ProtectedRoute>}
            />
        ))}
      </Routes>
    </div>
  )
}

export default App

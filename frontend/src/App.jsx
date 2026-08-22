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
import Dashboard from "./pages/Dashboard/dashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminVideos from "./pages/admin/AdminVideos";
import AdminComments from "./pages/admin/AdminComments";
import AdminSettings from "./pages/admin/AdminSettings";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import useAuthStore from "./store/authStore";
import useVideoStore from "./store/videoStore";
import useChannelStore from "./store/channelStore";
import axiosInstance from "./api/axiosInstance";

const adminRoutes = [
    { path: "/admin", element: <AdminDashboard /> },
    { path: "/admin/users", element: <AdminUsers /> },
    { path: "/admin/videos", element: <AdminVideos /> },
    { path: "/admin/comments", element: <AdminComments /> },
    { path: "/admin/settings", element: <AdminSettings /> },
];

const App = () => {
  const getMe = useAuthStore((state) => state.getMe);

  // ==========================================
  // Bootstrap auth state on app startup
  // ==========================================
  useEffect(() => {
    getMe();
  }, [getMe]);

  // ==========================================
  // Real-time updates (Server-Sent Events)
  // ==========================================
  useEffect(() => {
    const base = axiosInstance.defaults.baseURL || "http://localhost:8000/api/v1";
    const es = new EventSource(`${base}/events`);

    const onVideoPublished = () => {
      useVideoStore.getState().notifyVideoPublished();
      useChannelStore.getState().notifyChannelUpdated();
    };

    es.addEventListener("video-published", onVideoPublished);

    es.onerror = () => {
      es.close();
    };

    return () => {
      es.removeEventListener("video-published", onVideoPublished);
      es.close();
    };
  }, []);

  return (
    <div>
      <Toaster />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Protected routes - require authentication */}
        
        <Route path="/watch" element={<ProtectedRoute><SelectVideo /></ProtectedRoute>} />
        <Route path="/channel/:username" element={<ProtectedRoute><ChannelPage /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
        <Route path="/playlist/:playlistId" element={<ProtectedRoute><PlaylistDetail /></ProtectedRoute>} />
        <Route path="/liked-videos" element={<ProtectedRoute><LikedVideos /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Setting /></ProtectedRoute>} />
        <Route path="/watch-history" element={<ProtectedRoute><WatchHistory /></ProtectedRoute>} />
        <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
        <Route path="/watch-later" element={<ProtectedRoute><WatchLater /></ProtectedRoute>} />
        <Route path="/playlists" element={<ProtectedRoute><Playlists /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        {/* Admin routes - require admin role */}
        {adminRoutes.map(({ path, element }) => (
            <Route
                key={path}
                path={path}
                element={<ProtectedRoute roles={["admin"]}>{element}</ProtectedRoute>}
            />
        ))}
      </Routes>
    </div>
  )
}

export default App

import React from 'react'
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

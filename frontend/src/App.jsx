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
import { initSocket, disconnectSocket, getSocket } from './api/socket'
import useAuthStore from './store/authStore'
import useVideoStore from './store/videoStore'
import useChannelStore from './store/channelStore'

const App = () => {
  const { authUser } = useAuthStore();
  const { notifyVideoPublished, getVideos } = useVideoStore();
  const { notifyChannelUpdated } = useChannelStore();

  // Initialize Socket.io connection when user is authenticated
  useEffect(() => {
    if (authUser) {
      initSocket();
    } else {
      disconnectSocket();
    }
  }, [authUser]);

  // Set up global socket event listeners
  useEffect(() => {
    const socket = typeof window !== "undefined" ? getSocket() : null;
    if (!socket) return;

    // Listen for video published events
    const onVideoPublished = (data) => {
      notifyVideoPublished();
      getVideos();
    };

    // Listen for video deleted events
    const onVideoDeleted = (data) => {
      notifyVideoPublished();
      getVideos();
    };

    // Listen for video like updates
    const onVideoLikeUpdate = (data) => {
      // This is handled per-component since we need videoId context
      window.dispatchEvent(
        new CustomEvent("socket-video-like", { detail: data })
      );
    };

    // Listen for comment like updates
    const onCommentLikeUpdate = (data) => {
      window.dispatchEvent(
        new CustomEvent("socket-comment-like", { detail: data })
      );
    };

    // Listen for new comments
    const onNewComment = (data) => {
      window.dispatchEvent(
        new CustomEvent("socket-new-comment", { detail: data })
      );
    };

    // Listen for comment updates
    const onUpdateComment = (data) => {
      window.dispatchEvent(
        new CustomEvent("socket-update-comment", { detail: data })
      );
    };

    // Listen for comment deletions
    const onDeleteComment = (data) => {
      window.dispatchEvent(
        new CustomEvent("socket-delete-comment", { detail: data })
      );
    };

    // Listen for subscription updates
    const onSubscriptionUpdate = (data) => {
      notifyChannelUpdated();
      window.dispatchEvent(
        new CustomEvent("socket-subscription-update", { detail: data })
      );
    };

    if (socket) {
      socket.on("video-published", onVideoPublished);
      socket.on("video-deleted", onVideoDeleted);
      socket.on("video-like-update", onVideoLikeUpdate);
      socket.on("comment-like-update", onCommentLikeUpdate);
      socket.on("new-comment", onNewComment);
      socket.on("update-comment", onUpdateComment);
      socket.on("delete-comment", onDeleteComment);
      socket.on("subscription-update", onSubscriptionUpdate);
    }

    return () => {
      if (socket) {
        socket.off("video-published", onVideoPublished);
        socket.off("video-deleted", onVideoDeleted);
        socket.off("video-like-update", onVideoLikeUpdate);
        socket.off("comment-like-update", onCommentLikeUpdate);
        socket.off("new-comment", onNewComment);
        socket.off("update-comment", onUpdateComment);
        socket.off("delete-comment", onDeleteComment);
        socket.off("subscription-update", onSubscriptionUpdate);
      }
    };
  }, [authUser]);

  return (
    <div>
      <Toaster />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/liked-videos" element={<LikedVideos />} />
        <Route path="/watch" element={<SelectVideo />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/channel/:username" element={<ChannelPage />} />
        <Route path="/settings" element={<Setting />} />
      </Routes>
    </div>
  )
}

export default App
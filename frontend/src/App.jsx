import React from 'react'
import Home from './pages/Home'
import { Routes, Route } from "react-router-dom"
import LikedVideos from './pages/liked-videos'
import SelectVideo from './components/selectVideo'
import Login from './pages/Auth/login'
import Register from './pages/Auth/register'
import Profile from './pages/Profile'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/liked-videos" element={<LikedVideos />} />
        <Route path="/watch" element={<SelectVideo />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  )
}

export default App
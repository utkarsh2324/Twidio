// App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './component/navbar';
import Login from './component/login';
import Signup from './component/signup';
import Profile from './component/profile';
import EditProfile from './page/edit';
import Account from './page/account';
import AvatarAndCover from './page/avatarandcover';
import Password from './page/password';
import UploadVideo from './component/uploadvideo';
import WatchVideo from './component/watchvideo';
import UpdateVideo from './page/updatevideo';
import DeleteVideo from './page/deletevideo';
import OtherProfile from './page/otheruserprofile';
import Playlist from './component/playlist';
import ParticularPlaylist from './component/displayplaylist';
import AddToPlaylist from './page/addtoplaylist';
import HomePage from './component/home';
import LikedVideos from './component/likevideos';
import EditPlaylist from './page/updateplaylist';
import History from './component/history';
import Tweet from './component/tweet';
import Dashboard from './component/dashboard';
import SearchResults from './component/search';
import './index.css';

export default function App() {
  return (
    <>
      <Navbar />
      
      <Routes>
        {/* Default route to homepage */}
        <Route path="/" element={<HomePage />} />

        {/* Other routes */}
        <Route path="/home" element={<Navigate to="/" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/edit" element={<EditProfile />} />
        <Route path="/edit/account" element={<Account />} />
        <Route path="/edit/photo" element={<AvatarAndCover />} />
        <Route path="/edit/password" element={<Password />} />
        <Route path="/upload" element={<UploadVideo />} />
        <Route path="/like" element={<LikedVideos />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/watch/:videoId" element={<WatchVideo />} />
        <Route path="/delete-video/:videoId" element={<DeleteVideo />} />
        <Route path="/edit-video/:videoId" element={<UpdateVideo />} />
        <Route path="/channel/:userName" element={<OtherProfile />} />

        <Route path="/create-playlist" element={<Playlist />} />
        <Route path="/playlist/:playlistId" element={<ParticularPlaylist />} />
        <Route path="/history" element={<History />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tweet" element={<Tweet/>} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/add-to-playlist/:videoId" element={<AddToPlaylist />} />
        <Route path="/edit-playlist/:playlistId" element={<EditPlaylist />} />
        
      </Routes>
    </>
  );
}
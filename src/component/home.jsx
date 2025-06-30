import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo1.png'; // ✅ update path if needed

export default function HomePage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMenuId, setShowMenuId] = useState(null);
  const [showSplash, setShowSplash] = useState(true); // 🌟 Splash screen state

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';

    const formattedDate = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);

    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `${formattedDate} at ${formattedTime}`;
  };

  useEffect(() => {
    const fetchAllVideos = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/v1/videos/public');
        setVideos(res.data.data || []);
      } catch (err) {
        console.error('Error fetching videos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllVideos();
  }, []);

  // 🌟 Show splash screen for 2 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowSplash(false);
    }, 1200); // adjust duration as needed (in milliseconds)

    return () => clearTimeout(timeout);
  }, []);

  // 🌟 Splash screen
  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <img src={logo} alt="Logo" className="h-20 sm:h-32 animate-pulse" />
      </div>
    );
  }

  if (loading) return <div className="text-white p-10">Loading videos...</div>;

  return (
    <div className="bg-black min-h-screen text-white px-6 py-10">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Videos</h1>

      {videos.length === 0 ? (
        <p className="text-gray-400">No videos available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <div
              key={video._id}
              className="relative bg-gray-900 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition transform hover:-translate-y-1 duration-300 group cursor-pointer"
            >
              <Link to={`/watch/${video._id}`}>
                <div className="w-full h-48 bg-gray-800">
                  <img
                    src={video.thumbnail || 'https://via.placeholder.com/320x180'}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>

              <div className="p-4 relative">
                {/* 3-dot menu */}
                <div className="absolute top-2 right-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setShowMenuId((prev) => (prev === video._id ? null : video._id));
                    }}
                    className="text-gray-300 hover:text-white text-xl cursor-pointer"
                  >
                    ⋯
                  </button>
                  {showMenuId === video._id && (
                    <div className="absolute right-0 mt-2 bg-gray-800 text-white rounded shadow-md z-10">
                      <Link
                        to={`/add-to-playlist/${video._id}`}
                        className="block px-4 py-2 text-sm hover:bg-gray-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        ➕ Add to Playlist
                      </Link>
                    </div>
                  )}
                </div>

                <Link to={`/watch/${video._id}`}>
                  <h3 className="text-lg font-semibold truncate">{video.title}</h3>

                  {/* Avatar + Creator */}
                  <div className="flex items-center gap-2 mt-2">
                    <img
                      src={video.owner?.avatar || 'https://via.placeholder.com/32'}
                      alt="avatar"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <p className="text-sm text-gray-400 truncate">
                      {video.owner?.fullName || 'Unknown Creator'}
                    </p>
                  </div>

                  {/* Views + Upload Date */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <span>👁️ {video.view || 0} views</span>
                    <span>{formatDate(video.createdAt)}</span>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from './authcontext';
import axios from 'axios';

export default function ProfilePage() {
  const { user } = useAuth();
  const { userName } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Videos');
  const [videos, setVideos] = useState([]);
  const [subscribedTo, setSubscribedTo] = useState([]);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    if (!user || !user._id) {
      setError('No user data available. Please log in.');
      setLoading(false);
      navigate('/login');
      return;
    }

    const token = localStorage.getItem('token');
    const profileToFetch = userName || user?.userName;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/users/channel/${user.userName}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          const text = await res.text();
          let errorMessage = `HTTP ${res.status}: Failed to fetch profile`;
          try {
            const result = JSON.parse(text);
            errorMessage = result.message || errorMessage;
          } catch {
            errorMessage = res.status === 404 ? 'Channel does not exist' : 'Server returned non-JSON response';
          }
          throw new Error(errorMessage);
        }

        const result = await res.json();
        setProfile(result.data);
        setIsOwnProfile(result.data._id === user._id);
      } catch (err) {
        console.error('❌ Profile fetch error:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchVideos = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/v1/videos/`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { userId: user._id, sortBy: 'createdAt', sortType: 'desc' },
        });
        setVideos(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch videos', err);
      }
    };

    const fetchSubscribedChannels = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/v1/subscriptions/c/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubscribedTo(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch subscribed channels', err);
      }
    };
    const fetchPlaylists = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/v1/playlist/user/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            userId: userName ? profile?._id : user._id,
          },
        });
        setPlaylists(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch playlists', err);
      }
    };

    fetchProfile();
    fetchSubscribedChannels();
    fetchVideos();
    fetchPlaylists();
  }, [user, navigate, userName]);

  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm("Are you sure you want to delete this playlist?")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/v1/playlist/${playlistId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlaylists((prev) => prev.filter((pl) => pl._id !== playlistId));
      alert("✅ Playlist deleted.");
    } catch (err) {
      console.error("❌ Failed to delete playlist:", err);
      alert("❌ Could not delete playlist.");
    }
  };

  if (!user) return <div className="text-white p-10">Please log in to view your profile.</div>;
  if (loading || !profile) return <div className="text-white p-10">Loading profile...</div>;

  return (
    <div className="bg-black min-h-screen text-white">
      <div
        className="h-48 sm:h-60 md:h-72 bg-cover bg-center"
        style={{ backgroundImage: `url(${profile.coverImage || 'https://via.placeholder.com/1280x300'})` }}
      />

      <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 sm:-mt-20 w-full px-6 sm:px-12">
        <div className="flex items-center space-x-4">
          <img
            src={profile.avatar || 'https://via.placeholder.com/128'}
            alt="Avatar"
            className="h-32 w-32 rounded-full border-4 border-white object-cover"
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{profile.fullName}</h1>
            <p className="text-gray-400 text-sm">{profile.email}</p>
            <p className="text-sm text-gray-300 mt-1">
              {profile.subscribersCount} Subscribers • {profile.channelsSubscribedToCount} Subscribed
            </p>
          </div>
        </div>

        {isOwnProfile ? (
          <Link
            to="/edit"
            className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white border border-white rounded-full text-sm sm:text-base shadow-md transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M9 13l6-6 3 3-6 6H9v-3z" />
            </svg>
            <span>Edit</span>
          </Link>
        ) : (
          <button
            disabled
            className="mt-4 sm:mt-0 px-4 py-2 rounded-full text-sm sm:text-base font-semibold border border-gray-600 bg-gray-800 text-gray-400 cursor-not-allowed"
          >
            Subscribe
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b border-gray-700 px-6 sm:px-12">
        <div className="flex space-x-6 text-gray-400 text-sm font-medium overflow-x-auto">
          {['Videos', 'Following', 'Playlist'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${activeTab === tab ? 'border-b-2 border-purple-500 text-white' : 'hover:text-white'} pb-2`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 sm:px-12 py-12 text-gray-300">
        {activeTab === 'Videos' && (
          <div>
            {isOwnProfile && (
              <div className="flex justify-end mb-6">
                <Link
                  to="/upload"
                  className="bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 px-4 rounded-full transition"
                >
                  Upload Video
                </Link>
              </div>
            )}

            {videos.length === 0 ? (
              <div className="text-center">
                <p className="text-lg mb-4">No videos uploaded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {videos.map((video) => (
                  <div key={video._id} className="bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-300">
                    <Link to={`/watch/${video._id}`}>
                      <div className="w-full h-48 bg-black">
                        <img
                          src={video.thumbnail || 'https://via.placeholder.com/320x180'}
                          alt={video.title}
                          className="w-full h-full rounded-t-lg object-contain"
                        />
                      </div>
                    </Link>
                    <div className="p-4">
                      <h3 className="text-white font-semibold text-lg truncate">{video.title}</h3>
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">{video.description}</p>
                      {isOwnProfile && (
                        <div className="mt-4 flex justify-between">
                          <Link to={`/edit-video/${video._id}`}>
                            <button className="flex items-center gap-2 border border-blue-400 bg-blue-600 hover:bg-blue-500 text-white text-sm px-5 py-2.5 rounded-full">Update</button>
                          </Link>
                          <Link to={`/delete-video/${video._id}`}>
                            <button className="flex items-center gap-2 border border-red-400 bg-red-600 hover:bg-red-500 text-white text-sm px-5 py-2.5 rounded-full">Delete</button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'Following' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Channels You Follow</h2>
            {subscribedTo.length === 0 ? (
              <p>You haven’t followed any channels yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {subscribedTo.map((s) => (
                  <Link
                    to={`/channel/${s.channel.userName}`}
                    key={s.channel._id}
                    className="flex items-center bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition"
                  >
                    <img
                      src={s.channel.avatar || 'https://via.placeholder.com/64'}
                      alt="Avatar"
                      className="h-14 w-14 rounded-full object-cover mr-4 border border-white"
                    />
                    <div>
                      <p className="text-white font-semibold">{s.channel.fullName}</p>
                      <p className="text-sm text-gray-400">{s.channel.email}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'Playlist' && (
  playlists.length === 0 ? (
    <div className="text-center">
      <p className="text-lg mb-4">No playlists created yet.</p>
      {isOwnProfile && (
        <Link
          to="/create-playlist"
          className="inline-block bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 px-4 rounded-full transition"
        >
          Create Playlist
        </Link>
      )}
    </div>
  ) : (
    <div>
      {isOwnProfile && (
        <div className="flex justify-end mb-4">
          <Link to="/create-playlist" className="bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 px-4 rounded-full transition">
            Create Playlist
          </Link>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {playlists.map((playlist) => (
          <div key={playlist._id} className="bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-xl transition">
            <Link to={`/playlist/${playlist._id}`}>
              <h3 className="text-white font-semibold text-lg truncate hover:underline">
                {playlist.name}
              </h3>
            </Link>
            <p className="text-gray-400 text-sm mt-1 line-clamp-2 mb-4">{playlist.description}</p>

            {playlist.videos && playlist.videos.length > 0 ? (
              <div className="space-y-3 mb-4">
                {playlist.videos.map((video) => (
                  <Link to={`/watch/${video._id}`} key={video._id} className="block group">
                    <div className="flex items-center gap-3">
                      <img
                        src={video.thumbnail || 'https://via.placeholder.com/120x80'}
                        alt={video.title}
                        className="h-20 w-32 object-cover rounded-md border border-gray-700"
                      />
                      <span className="text-white text-sm font-medium group-hover:underline">{video.title}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic mb-4">No videos in this playlist</p>
            )}

{isOwnProfile && (
  <div className="mt-4 flex justify-between">
    <Link to={`/edit-playlist/${playlist._id}`}>
      <button className="cursor-pointer flex items-center gap-2 border border-blue-400 bg-blue-600 hover:bg-blue-500 text-white text-sm px-5 py-2.5 rounded-full">
        Edit
      </button>
    </Link>
    <button
      onClick={() => handleDeletePlaylist(playlist._id)}
      className="cursor-pointer flex items-center gap-2 border border-red-400 bg-red-600 hover:bg-red-500 text-white text-sm px-5 py-2.5 rounded-full"
    >
      Delete
    </button>
  </div>
)}
          </div>
        ))}
      </div>
    </div>
  )
)}
 
      </div>
    </div>
  );
}
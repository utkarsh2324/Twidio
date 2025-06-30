import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function ParticularPlaylist() {
  const { playlistId } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);

  const fetchPlaylist = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:8000/api/v1/playlist/${playlistId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlaylist(res.data.data);
    } catch (err) {
      console.error('Failed to fetch playlist:', err);
      setError('Unable to fetch playlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylist();
  }, [playlistId]);

  const handleDelete = async (videoId) => {
    setDeleting(videoId);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:8000/api/v1/playlist/remove/${videoId}/${playlistId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPlaylist((prev) => ({
        ...prev,
        videos: prev.videos.filter((v) => v._id !== videoId),
      }));
      alert('Video removed successfully.');
    } catch (err) {
      console.error('Failed to remove video:', err);
      alert('Failed to remove video.');
    } finally {
      setDeleting(null);
      setShowModal(false);
      setVideoToDelete(null);
    }
  };

  if (loading) return <div className="text-white p-10">Loading playlist...</div>;
  if (error) return <div className="text-red-500 p-10">{error}</div>;
  if (!playlist) return null;

  return (
    <div className="bg-black min-h-screen text-white px-6 py-10 relative">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">{playlist.name}</h1>
        <p className="text-gray-400 mb-6">{playlist.description}</p>

        {playlist.videos.length === 0 ? (
          <p className="text-gray-500">No videos in this playlist.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {playlist.videos.map((video) => (
              <div
                key={video._id}
                className="bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition"
              >
                <Link to={`/watch/${video._id}`}>
                  <img
                    src={video.thumbnail || 'https://via.placeholder.com/320x180'}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                </Link>
                <div className="p-4">
                  <h3 className="text-white font-semibold text-lg truncate">{video.title}</h3>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">{video.description}</p>

                  <div className="mt-4 flex justify-between">
                    <button
                      onClick={() => {
                        setShowModal(true);
                        setVideoToDelete(video._id);
                      }}
                      disabled={deleting === video._id}
                      className={`flex items-center gap-2 border border-red-400 text-sm px-5 py-2.5 rounded-full transition-all ${
                        deleting === video._id
                          ? 'bg-red-800 text-gray-300 cursor-not-allowed'
                          : 'bg-red-600 hover:bg-red-500 text-white cursor-pointer'
                      }`}
                    >
                      {deleting === video._id ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm text-center">
            <h2 className="text-white text-xl font-semibold mb-4">Remove Video</h2>
            <p className="text-gray-300 mb-6">Are you sure you want to remove this video from the playlist?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleDelete(videoToDelete)}
                className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-full"
              >
                Yes, Remove
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setVideoToDelete(null);
                }}
                className="bg-gray-600 hover:bg-gray-500 text-white font-semibold px-4 py-2 rounded-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
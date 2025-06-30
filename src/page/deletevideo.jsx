import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function DeleteVideo() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:8000/api/v1/videos/${videoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVideo(res.data.data);
      } catch (err) {
        setError('Failed to fetch video details');
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [videoId]);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/v1/videos/${videoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/profile');
    } catch (err) {
      console.error(err);
      setError('Failed to delete video');
    }
  };

  if (loading) return <div className="text-white p-10">Loading...</div>;
  if (error) return <div className="text-red-500 p-10">{error}</div>;

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="bg-gray-900 p-8 rounded-xl shadow-xl border border-gray-700 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Delete Video</h1>
        <p className="text-center text-gray-300 mb-6">
          Are you sure you want to delete <span className="font-semibold text-white">"{video.title}"</span>?
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-500 border border-red-400 text-white px-6 py-2 rounded-full transition"
          >
            Yes, Delete
          </button>
          <Link
            to="/profile"
            className="bg-gray-700 hover:bg-gray-600 border border-gray-500 text-white px-6 py-2 rounded-full transition"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function History() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem('token');

      try {
        const res = await axios.get('http://localhost:8000/api/v1/users/watchHistory', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setVideos(res.data.data || []);
      } catch (err) {
        console.error('❌ Failed to fetch watch history:', err);
        setError('Please login to watch history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) return <div className="text-white p-10">Loading watch history...</div>;
  if (error) return <div className="text-red-500 p-10">{error}</div>;

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Watch History</h1>

      {videos.length === 0 ? (
        <p className="text-gray-400">No watch history available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {videos.map((video) => (
            <div
              key={video._id}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-300"
            >
              <Link to={`/watch/${video._id}`}>
                <div className="w-full h-48 bg-black">
                  <img
                    src={video.thumbnail || 'https://via.placeholder.com/320x180'}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>
              <div className="p-4">
                <h3 className="text-white font-semibold text-lg truncate">{video.title}</h3>
                <p className="text-gray-400 text-sm mt-1 line-clamp-2">{video.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  By {video.owner?.fullName || 'Unknown'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
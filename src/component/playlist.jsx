import React, { useState } from 'react';
import axios from 'axios';

export default function Playlist() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to create a playlist.');
      return;
    }

    try {
      const res = await axios.post(
        'http://localhost:8000/api/v1/playlist/',
        { name, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message);
      setName('');
      setDescription('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create playlist.');
    }
  };

  return (
    <div className="bg-black text-white min-h-screen flex items-center justify-center px-4">
      <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-white">Create Playlist</h2>

        {error && <p className="text-red-500 mb-3 text-sm text-center">{error}</p>}
        {message && <p className="text-green-500 mb-3 text-sm text-center">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-300 mb-1">
              Playlist Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="e.g. My Chill Vibes"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="What is this playlist about?"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 shadow-md"
          >
            Create Playlist
          </button>
        </form>
      </div>
    </div>
  );
}
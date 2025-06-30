import React, { useState } from 'react';
import axios from 'axios';

export default function UploadVideo() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [video, setVideo] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!video || !thumbnail || !title || !description) {
      alert('Please fill in all fields and select files.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('videoFile', video);
    formData.append('thumbnail', thumbnail);

    try {
      setUploading(true);
      const token = localStorage.getItem('token');

      await axios.post('http://localhost:8000/api/v1/videos/', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Video uploaded successfully!');
      setTitle('');
      setDescription('');
      setVideo(null);
      setThumbnail(null);
    } catch (err) {
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <form
        onSubmit={handleUpload}
        className="bg-gray-900 p-8 rounded-xl shadow-xl space-y-6 max-w-xl w-full border border-gray-700"
      >
        <h2 className="text-2xl font-bold text-center">Upload a Video</h2>

        {/* Title */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded"
            placeholder="Enter video title"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded resize-none"
            placeholder="Write a short description..."
          />
        </div>

        {/* Video File */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Video File</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideo(e.target.files[0])}
            required
            className="w-full text-sm text-gray-400 file:bg-indigo-600 file:text-white file:px-4 file:py-2 file:rounded bg-gray-800 border border-gray-700 rounded"
          />
        </div>

        {/* Thumbnail File */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Thumbnail Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnail(e.target.files[0])}
            required
            className="w-full text-sm text-gray-400 file:bg-indigo-600 file:text-white file:px-4 file:py-2 file:rounded bg-gray-800 border border-gray-700 rounded"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading}
          className={`w-full py-2 rounded font-semibold transition ${
            uploading
              ? 'bg-gray-700 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-500'
          } text-white`}
        >
          {uploading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>
    </div>
  );
}

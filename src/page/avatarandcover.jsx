import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../component/authcontext';

export default function PhotoUpload() {
  const [avatar, setAvatar] = useState(null);
  const [cover, setCover] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const { user } = useAuth();

  const uploadAvatar = async () => {
    if (!avatar) return alert("Please select an avatar image.");
    setUploadingAvatar(true);

    const form = new FormData();
    form.append('avatar', avatar);

    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:8000/api/v1/users/avatar`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      alert('Avatar uploaded successfully!');
    } catch (err) {
      console.error(err);
      alert('Avatar upload failed.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const uploadCover = async () => {
    if (!cover) return alert("Please select a cover image.");
    setUploadingCover(true);

    const form = new FormData();
    form.append('coverImage', cover);

    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:8000/api/v1/users/coverImage`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      alert('Cover image uploaded successfully!');
    } catch (err) {
      console.error(err);
      alert('Cover image upload failed.');
    } finally {
      setUploadingCover(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-gray-900 p-6 rounded-lg shadow-lg space-y-6 border border-gray-700">
      <h2 className="text-xl font-semibold text-white">Upload Avatar and Cover Photo</h2>

      {/* Avatar Upload */}
      <div>
        <label className="block text-sm text-gray-300 mb-1">Avatar Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setAvatar(e.target.files[0])}
          className="w-full text-sm text-gray-400 file:bg-indigo-600 file:text-white file:rounded file:px-4 file:py-2 bg-gray-800 border border-gray-700 rounded"
        />
        <button
          onClick={uploadAvatar}
          disabled={uploadingAvatar}
          className={`mt-2 w-full px-4 py-2 rounded font-semibold transition ${
            uploadingAvatar ? 'bg-gray-700 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500'
          } text-white`}
        >
          {uploadingAvatar ? 'Uploading Avatar...' : 'Upload Avatar'}
        </button>
      </div>

      {/* Cover Upload */}
      <div>
        <label className="block text-sm text-gray-300 mb-1">Cover Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCover(e.target.files[0])}
          className="w-full text-sm text-gray-400 file:bg-indigo-600 file:text-white file:rounded file:px-4 file:py-2 bg-gray-800 border border-gray-700 rounded"
        />
        <button
          onClick={uploadCover}
          disabled={uploadingCover}
          className={`mt-2 w-full px-4 py-2 rounded font-semibold transition ${
            uploadingCover ? 'bg-gray-700 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500'
          } text-white`}
        >
          {uploadingCover ? 'Uploading Cover...' : 'Upload Cover'}
        </button>
      </div>
    </div>
  );
}
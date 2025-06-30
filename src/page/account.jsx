import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../component/authcontext';

export default function PersonalInfo() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:8000/api/v1/users/current-user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFullName(res.data.data.fullName);
        setEmail(res.data.data.email);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetch();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        'http://localhost:8000/api/v1/users/update-account',
        { fullName, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Profile updated!');
    } catch (err) {
      alert('Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto bg-gray-900 p-6 rounded-lg shadow-lg space-y-6 border border-gray-700"
    >
      <h2 className="text-xl font-semibold text-white">Update Account Information</h2>

      <div>
        <label className="block text-sm text-gray-300 mb-1">Full Name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className={`w-full px-4 py-2 rounded font-semibold transition ${
          saving ? 'bg-gray-700 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500'
        } text-white`}
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}
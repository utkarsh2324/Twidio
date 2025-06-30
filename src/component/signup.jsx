import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar: null,
    coverImage: null,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const data = new FormData();
      data.append('fullName', formData.name);
      data.append('userName', formData.username);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('avatar', formData.avatar);
      data.append('coverImage', formData.cover);

      const res = await fetch('http://localhost:8000/api/v1/users/register', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Signup failed');
      }

      alert('Signup successful!');
      navigate('/login');
    } catch (err) {
      console.error('Signup error:', err);
      alert(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black px-4">
      <div className="w-full max-w-xl bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-700">
        <h2 className="text-3xl font-bold text-white text-center mb-6">Create an Account</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5" encType="multipart/form-data">
          {/* Left fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Full Name</label>
              <input
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Username</label>
              <input
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="johndoe123"
                className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Email Address</label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2 text-xs text-indigo-400 hover:text-indigo-300"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-2 top-2 text-xs text-indigo-400 hover:text-indigo-300"
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          </div>

          {/* Right side - File Uploads */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Avatar Image</label>
              <input
                type="file"
                name="avatar"
                accept="image/*"
                onChange={handleChange}
                className="w-full text-sm text-gray-400 file:bg-indigo-600 file:text-white file:rounded file:px-4 file:py-2 bg-gray-800 border border-gray-700 rounded"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Cover Image</label>
              <input
                type="file"
                name="cover"
                accept="image/*"
                onChange={handleChange}
                className="w-full text-sm text-gray-400 file:bg-indigo-600 file:text-white file:rounded file:px-4 file:py-2 bg-gray-800 border border-gray-700 rounded"
              />
            </div>

            <div className="mt-10">
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-semibold py-2 rounded hover:bg-indigo-500 transition"
              >
                Sign Up
              </button>
            </div>

            <p className="text-sm text-gray-400 mt-4 text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 underline transition">
                Log in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
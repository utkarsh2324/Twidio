import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../component/authcontext';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

export default function Tweet() {
  const { user } = useAuth();
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTweetContent, setNewTweetContent] = useState('');
  const [creating, setCreating] = useState(false);
  const [updatingTweetId, setUpdatingTweetId] = useState(null);
  const [updatedContent, setUpdatedContent] = useState('');

  const token = localStorage.getItem('token');

  const fetchTweets = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/v1/tweets/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTweets(res.data.data);
    } catch (err) {
      console.error('Failed to fetch tweets:', err);
      setError('Please login to view blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTweets();
  }, []);

  const handleCreateTweet = async (e) => {
    e.preventDefault();
    if (!newTweetContent.trim()) return;
    setCreating(true);
    try {
      const res = await axios.post(
        'http://localhost:8000/api/v1/tweets',
        { content: newTweetContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTweets((prev) => [res.data.data, ...prev]);
      setNewTweetContent('');
    } catch (err) {
      console.error('❌ Failed to create tweet:', err);
      alert('Failed to post tweet');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTweet = async (tweetId) => {
    try {
      await axios.delete(`http://localhost:8000/api/v1/tweets/${tweetId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTweets((prev) => prev.filter((tweet) => tweet._id !== tweetId));
    } catch (err) {
      console.error('❌ Failed to delete tweet:', err);
      alert('Delete failed');
    }
  };

  const handleUpdateTweet = async (tweetId) => {
    try {
      const res = await axios.patch(
        `http://localhost:8000/api/v1/tweets/${tweetId}`,
        { content: updatedContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTweets((prev) =>
        prev.map((t) => (t._id === tweetId ? { ...t, content: res.data.data.content } : t))
      );
      setUpdatingTweetId(null);
      setUpdatedContent('');
    } catch (err) {
      console.error('❌ Failed to update tweet:', err);
      alert('Update failed');
    }
  };
  const handleToggleLike = async (tweetId) => {
    try {
      const response = await axios.post(
        `http://localhost:8000/api/v1/likes/toggle/t/${tweetId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const { tweetId: returnedId, liked, totalLikes } = response.data.data;
  
      setTweets((prevTweets) =>
        prevTweets.map((tweet) =>
          tweet._id === returnedId
            ? { ...tweet, likedByMe: liked, likesCount: totalLikes }
            : tweet
        )
      );
    } catch (err) {
      console.error('❌ Failed to toggle like:', err);
    }
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  if (loading) return <div className="text-white p-6">Loading tweets...</div>;
  if (error) return <div className="text-red-500 p-6">{error}</div>;

  return (
    <div className="bg-black min-h-screen text-white p-4 sm:p-6 max-w-2xl mx-auto">
      {/* New Tweet Form */}
      <form
        onSubmit={handleCreateTweet}
        className="mb-6 flex flex-col gap-3 bg-gray-900 p-4 rounded-lg border border-gray-700"
      >
        <textarea
          className="w-full p-3 rounded text-white bg-gray-800 focus:outline-none resize-none"
          rows="3"
          placeholder="What is happening?!"
          value={newTweetContent}
          onChange={(e) => setNewTweetContent(e.target.value)}
        />
        <button
          type="submit"
          className="self-end bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-500 transition"
          disabled={creating}
        >
          {creating ? 'Posting...' : 'Post'}
        </button>
      </form>

      {/* Tweets List */}
      {tweets.length === 0 ? (
        <p className="text-center text-gray-400">No tweets yet.</p>
      ) : (
        tweets.map((tweet) => (
          <div
            key={tweet._id}
            className="bg-gray-900 p-4 rounded-lg mb-4 border border-gray-700"
          >
            {/* Owner Info */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <img
                  src={tweet.owner?.avatar || '/default-avatar.png'}
                  alt="avatar"
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white">{tweet.owner?.fullName || 'Unknown'}</p>
                    <span className="text-xs text-gray-400">
                      • {formatDateTime(tweet.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{tweet.owner?.email}</p>
                </div>
              </div>
            </div>

            {/* Tweet Content */}
            {updatingTweetId === tweet._id ? (
              <>
                <textarea
                  className="w-full p-2 rounded text-white bg-gray-800 focus:outline-none"
                  rows="3"
                  value={updatedContent}
                  onChange={(e) => setUpdatedContent(e.target.value)}
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleUpdateTweet(tweet._id)}
                    className="bg-green-600 px-3 py-1 rounded hover:bg-green-500"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setUpdatingTweetId(null)}
                    className="bg-red-600 px-3 py-1 rounded hover:bg-red-500"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-lg text-white">{tweet.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDateTime(tweet.createdAt)}
                </p>

                <div className="mt-2 text-sm text-gray-400 flex items-center gap-4">
                  {/* Like/Unlike Button */}
                  <button
  onClick={() => handleToggleLike(tweet._id)}
  className="hover:underline text-white flex items-center gap-1"
>
  {tweet.likedByMe ? (
    <>
      <ThumbsDown size={16} /> Unlike ({tweet.likesCount || 0})
    </>
  ) : (
    <>
      <ThumbsUp size={16} /> Like ({tweet.likesCount || 0})
    </>
  )}
</button>

                  {/* Edit/Delete Buttons */}
                  {tweet.owner?._id === user._id && (
                    <>
                      <button
                        onClick={() => {
                          setUpdatingTweetId(tweet._id);
                          setUpdatedContent(tweet.content);
                        }}
                        className="hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTweet(tweet._id)}
                        className="hover:underline text-red-400"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}
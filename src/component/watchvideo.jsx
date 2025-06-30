import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../component/authcontext'; // or wherever your `useAuth` is defined
import axios from 'axios';

export default function WatchVideo() {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [error, setError] = useState('');
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [upNextVideos, setUpNextVideos] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const {user}=useAuth();
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [commentLikes, setCommentLikes] = useState({});
  const [showMobileComments, setShowMobileComments] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subCheckDone, setSubCheckDone] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
  
    if (!token) {
      setError("You must be logged in to view this video.");
      return;
    }
  
    const fetchVideo = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/v1/videos/${videoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const videoData = res.data.data;
        setVideo(videoData);
        setLikeCount(videoData.likeCount || 0);
        setIsLiked(videoData.isLikedByCurrentUser);
      } catch (err) {
        console.error("❌ Failed to load video:", err);
        setError("Failed to load video.");
      }
    };
  
    const fetchUpNextVideos = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/v1/videos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const others = res.data.data.filter((v) => v._id !== videoId);
        setUpNextVideos(others);
      } catch (err) {
        console.error("❌ Failed to load up next videos:", err);
      }
    };
  
    const fetchComments = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/v1/comments/${videoId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { page: 1, limit: 20 },
        });
  
        setComments(res.data.data);
        setCommentLikes(
          res.data.data.reduce((acc, comment) => {
            acc[comment._id] = {
              likedByUser: comment.isLikedByCurrentUser || false,
              count: comment.likeCount || 0,
            };
            return acc;
          }, {})
        );
      } catch (err) {
        console.error("❌ Failed to fetch comments:", err.response?.data || err.message);
        setError("No comments found");
      } finally {
        setLoadingComments(false);
      }
    };
  
    const fetchSubscriptionStatus = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/subscriptions/status/${video?.owner?._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        setIsSubscribed(res.data?.data?.isSubscribed);
      } catch (err) {
        console.error("❌ Failed to check subscription status:", err.response?.data || err.message);
      } finally {
        setSubCheckDone(true);
      }
    };
  
    // Fetch all
    fetchVideo();
    fetchUpNextVideos();
    fetchComments();
  
    // Check subscription after video is fetched
    // using separate useEffect to wait for video?.owner?.id
  }, [videoId]);
  useEffect(() => {
    if (!video?.owner?._id || !user?._id) return;
  
    const token = localStorage.getItem('token');
  
    const checkIfSubscribed = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/subscriptions/c/${user._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
  
        const alreadySubscribed = res.data.data.some(
          (s) => s.channel._id === video.owner._id
        );
        setIsSubscribed(alreadySubscribed);
      } catch (err) {
        console.error('Subscription check failed:', err);
      } finally {
        setSubCheckDone(true);
      }
    };
  
    checkIfSubscribed();
  }, [video?.owner?._id, user?._id]); 
  useEffect(() => {
    const token = localStorage.getItem("token");
    const addToHistory = async () => {
      try {
        await axios.post(
          `http://localhost:8000/api/v1/users/watch/${videoId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (err) {
        console.error("❌ Failed to add to watch history", err);
      }
    };
  
    if (videoId) {
      addToHistory();
    }
  }, [videoId]);

  const handleLikeToggle = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `http://localhost:8000/api/v1/likes/toggle/v/${videoId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.message.includes('unliked')) {
        setIsLiked(false);
        setLikeCount(prev => Math.max(prev - 1, 0));
      } else {
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Like toggle failed:', err);
    }
  };
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
  
    try {
      setIsPosting(true);
      const token = localStorage.getItem("token");
  
      const res = await axios.post(
        `http://localhost:8000/api/v1/comments/${videoId}`,
        { content: commentText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const newComment = res.data.data;
      // Optimistically update UI
      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
    } catch (err) {
      console.error("❌ Failed to post comment:", err.response?.data || err);
      alert("Failed to post comment");
    } finally {
      setIsPosting(false);
    }
  };
  const handleUpdateComment = async (commentId) => {
    if (!editedContent.trim()) return;
  
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `http://localhost:8000/api/v1/comments/c/${commentId}`,
        { content: editedContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const updated = res.data.data;
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? { ...c, content: updated.content } : c))
      );
      setEditingCommentId(null);
      setEditedContent("");
    } catch (err) {
      console.error("Failed to update comment:", err.response?.data || err);
      alert("Failed to update comment");
    }
  };
  
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
  
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/api/v1/comments/c/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error("Failed to delete comment:", err.response?.data || err);
      alert("Failed to delete comment");
    }
  };
  
  const handleToggleSubscription = async () => {
    const token = localStorage.getItem("token");
    setSubscribing(true);
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/subscriptions/c/${video.owner._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const msg = res.data.message.toLowerCase();
      if (msg.includes("unsubscribed")) {
        setIsSubscribed(false);
        alert("Unsubscribed successfully");
      } else if (msg.includes("subscribed")) {
        setIsSubscribed(true);
        alert("Subscribed successfully");
      }
    } catch (err) {
      console.error("❌ Failed to toggle subscription:", err);
      alert("Something went wrong");
    } finally {
      setSubscribing(false);
    }
  };
  if (error) return <div className="text-white p-10">{error}</div>;
  if (!video) return <div className="text-white p-10">Loading...</div>;

  return (
    <div className="bg-black text-white min-h-screen p-4 md:p-6 flex flex-col md:flex-row gap-6">
      {/* Left: Video */}
      <div className="flex-1 relative">
        <div className="w-full aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
          <video
            src={video.videoFile}
            controls
            autoPlay
            className="w-full h-full object-contain"
            onContextMenu={(e) => e.preventDefault()} // Disable right-click
          />

          {/* Custom 3-dot menu */}
          <div className="absolute top-3 right-4 z-10">
            <div className="relative">
             
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 text-white rounded-lg shadow-lg">
                  <button className="block w-full text-left px-4 py-2 hover:bg-gray-700">Speed</button>
                  <Link
                    to="/"
                    className="block w-full text-left px-4 py-2 hover:bg-gray-700"
                  >
                    Picture-in-Picture
                  </Link>
                  <Link
                    to={`/add-to-playlist/${video._id}`}
                    title="Add to your playlist"
                    className="text-white text-xs px-3 py-1 rounded-full font-semibold cursor-pointer border-2 border-white bg-transparent hover:bg-blue-600 transition duration-300"
                  >
                ➕ Add to Playlist
              </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <h1 className="text-xl font-bold mt-4 flex items-center gap-4">
  {video.title}
  <span className="text-sm text-gray-400 font-medium">
     {video.view || 0} views
  </span>
</h1>

        {/* Description + Add to Playlist + Like */}
        <div className="text-sm text-gray-300 mt-2 whitespace-pre-wrap flex flex-wrap items-center justify-between">
          <span className="pr-2 max-w-[80%]">{video.description}</span>

          <div className="flex items-center gap-4">
            {/* Add to Playlist Button */}
            <Link
  to={`/add-to-playlist/${video._id}`}
  title="Add to your playlist"
  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-full font-semibold cursor-pointer"
>
  ➕ Add to Playlist
</Link>

            {/* Like Button */}
            <button
              onClick={handleLikeToggle}
              className="flex items-center gap-1 text-white hover:text-gray-300 transition cursor-pointer"
              title={isLiked ? "Unlike" : "Like"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill={isLiked ? 'white' : 'none'}
                viewBox="0 0 24 24"
                stroke="white"
                strokeWidth={2}
              >
                <path d="M14 9V5a3 3 0 00-6 0v4H5a1 1 0 00-1 1v10a1 1 0 001 1h13.28a2 2 0 001.99-1.78l.7-7A2 2 0 0019 9h-5z" />
              </svg>
              <span>{likeCount}</span>
            </button>
          </div>
        </div>

        {/* Channel Info */}
       <div className="flex items-center justify-between mt-6 border-t border-gray-700 pt-4">
  <Link
    to={`/channel/${video.owner?.userName}`}
    className="flex items-center gap-3 hover:underline"
  >
    <img
      src={video.owner?.avatar || 'https://via.placeholder.com/40'}
      className="w-10 h-10 rounded-full"
      alt="Channel"
    />
    <div>
      <h2 className="font-semibold">{video.owner?.fullName}</h2>
      <p className="text-sm text-gray-400">{video.owner?.email}</p>
    </div>
  </Link>

  {subCheckDone && user?._id !== video.owner?._id && (
    <button
      onClick={handleToggleSubscription}
      disabled={subscribing}
      className={`${
        isSubscribed ? "bg-gray-600 hover:bg-gray-700" : "bg-red-600 hover:bg-red-700"
      } text-white px-4 py-2 rounded-full font-semibold cursor-pointer`}
    >
      {subscribing ? "Processing..." : isSubscribed ? "Unsubscribe" : "Subscribe"}
    </button>
  )}
</div>
        <hr className="border-t border-gray-600 my-6" />


        <form onSubmit={handleAddComment} className="mt-6 space-y-2">
  <label htmlFor="comment" className="block text-sm font-medium text-gray-300">
    Add a comment
  </label>
  <textarea
    id="comment"
    name="comment"
    rows={3}
    className="w-full p-3 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
    placeholder="Write your thoughts..."
    value={commentText}
    onChange={(e) => setCommentText(e.target.value)}
    disabled={isPosting}
  />
  <button
    type="submit"
    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-semibold disabled:opacity-50"
    disabled={isPosting || !commentText.trim()}
  >
    {isPosting ? "Posting..." : "Post Comment"}
  </button>
</form>
{/* Comment Section */}
{/* Toggle button for small screens */}
<div className="block md:hidden mb-4">
  <button
    onClick={() => setShowMobileComments(prev => !prev)}
    className="w-full text-left text-purple-400 hover:text-purple-300 font-semibold py-2"
  >
    {showMobileComments ? 'Hide Comments' : 'Show Comments'}
  </button>
</div>

{/* Comment section container */}
<div className={`space-y-6 ${!showMobileComments ? 'hidden md:block' : ''}`}>
  {comments.map((comment) => (
    <div key={comment._id} className="flex items-start gap-1 pb-1">
      <img
        src={comment.owner?.avatar || 'https://via.placeholder.com/48'}
        alt="User Avatar"
        className="w-10 h-10 rounded-full object-cover"
      />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">
            {comment.owner?.fullName || 'Anonymous'}
          </p>

          
        </div>

        {editingCommentId === comment._id ? (
          <>
            <textarea
              className="w-full bg-gray-800 text-white p-2 rounded mt-1 border border-gray-600"
              rows={2}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleUpdateComment(comment._id)}
                className="text-xs bg-green-600 px-4 py-1 rounded hover:bg-green-700 transition"
              >
                Save
              </button>
              <button
                onClick={() => setEditingCommentId(null)}
                className="text-xs bg-gray-600 px-4 py-1 rounded hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-300 text-sm mt-1">{comment.content}</p>
            <p className="text-gray-500 text-xs">
              {new Date(comment.createdAt).toLocaleString()}
            </p>

            {user?._id === comment.owner?._id && (
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => {
                    setEditingCommentId(comment._id);
                    setEditedContent(comment.content);
                  }}
                  className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-500 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M17.414 2.586a2 2 0 010 2.828l-9.9 9.9a1 1 0 01-.455.26l-4 1a1 1 0 01-1.213-1.213l1-4a1 1 0 01.26-.455l9.9-9.9a2 2 0 012.828 0z" />
                  </svg>
                  Edit
                </button>

                <button
                  onClick={() => handleDeleteComment(comment._id)}
                  className="flex items-center gap-1 text-sm text-red-400 hover:text-red-500 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Delete
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  ))}
</div>
      </div>

      {/* Right: Up Next */}
      <div className="w-full md:w-1/3 space-y-4">
  <h3 className="text-lg font-semibold border-b border-gray-700 pb-2">Up Next</h3>
  {upNextVideos.map((v) => (
    <div
      key={v._id}
      className="flex items-start gap-3 hover:bg-gray-800 p-2 rounded transition-all group"
    >
      <Link to={`/watch/${v._id}`} className="flex-shrink-0">
        <div className="w-32 h-20 bg-gray-700 rounded overflow-hidden">
          <img
            src={v.thumbnail || 'https://via.placeholder.com/160x90'}
            alt="Related"
            className="w-full h-full object-cover"
          />
        </div>
      </Link>

      <div className="flex flex-col justify-between flex-1">
        <Link to={`/watch/${v._id}`}>
          <p className="font-medium text-sm text-white line-clamp-2">{v.title}</p>
        </Link>
        <p className="text-xs text-gray-400 mt-1">
          {v.owner?.fullName || 'Unknown'}
        </p>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
          {v.description || 'No description'}
        </p>

        <Link
          to={`/add-to-playlist/${v._id}`}
          className="text-xs text-purple-400 hover:underline mt-2"
        >
          + Add to Playlist
        </Link>
      </div>
    </div>
  ))}
</div>
    </div>
  );
}
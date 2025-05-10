import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { signoutSuccess } from '../redux/slices/userSlice';
import { FaCode, FaBell, FaHeart, FaComment, FaChevronLeft, FaChevronRight, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';
import { AiOutlineUser } from 'react-icons/ai';
import axios from 'axios';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

function Feed() {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userName = currentUser?.email?.split('@')[0] || 'Guest';
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mediaIndices, setMediaIndices] = useState({});
  const [likedPosts, setLikedPosts] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [commentCounts, setCommentCounts] = useState({});
  const [likedUsersModalOpen, setLikedUsersModalOpen] = useState(false);
  const [likedUsers, setLikedUsers] = useState([]);
  const [selectedPostForLikes, setSelectedPostForLikes] = useState(null);
  const [postCreatorFollowers, setPostCreatorFollowers] = useState([]);
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');

  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  };

  const handleAuthError = async (message = 'Session expired. Please log in again.') => {
    console.warn('Authentication error - signing out');
    toast.error(message, { position: 'top-right', autoClose: 3000 });
    dispatch(signoutSuccess());
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const validateAuth = () => {
    const storedToken = localStorage.getItem('token');
    if (!currentUser?.id || !storedToken) {
      console.warn('No currentUser.id or token, redirecting to login');
      handleAuthError('Missing user ID or token. Please log in again.');
      return false;
    }
    if (isTokenExpired(storedToken)) {
      console.warn('Token is expired');
      return false; // Will be handled by refresh logic
    }
    return true;
  };

  const refreshTokenRequest = async () => {
    try {
      const response = await axios.post('http://localhost:8081/api/auth/refresh', { refreshToken }, {
        headers: { 'Content-Type': 'application/json' },
      });
      const { token: newToken, refreshToken: newRefreshToken } = response.data;
      localStorage.setItem('token', newToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      dispatch({ type: 'REFRESH_TOKEN_SUCCESS', payload: { token: newToken } });
      console.log('Token refreshed successfully');
      return newToken;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      handleAuthError('Failed to refresh session. Please log in again.');
      return null;
    }
  };

  const withAuthRetry = async (apiCall, ...args) => {
    const attemptCall = async (retryCount = 0) => {
      if (retryCount > 1) {
        handleAuthError();
        return;
      }

      try {
        const authToken = localStorage.getItem('token');
        const response = await apiCall(authToken, ...args);
        return response;
      } catch (error) {
        if (error.response?.status === 401 && refreshToken && retryCount === 0) {
          const newToken = await refreshTokenRequest();
          if (newToken) {
            return attemptCall(retryCount + 1);
          }
        } else {
          throw error;
        }
      }
    };

    return attemptCall();
  };

  const fetchFeedPosts = async () => {
    if (!validateAuth()) {
      if (refreshToken) {
        const newToken = await refreshTokenRequest();
        if (newToken) return fetchFeedPosts(); // Retry after refresh
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await withAuthRetry((token) =>
        axios.get('http://localhost:8081/api/posts/feed?page=0&size=10', {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        })
      );
      const data = response.data;
      setPosts(data);

      const initialIndices = {};
      const initialLiked = {};
      const initialLikeCounts = {};
      const initialCommentCounts = {};

      for (const post of data) {
        initialIndices[post.id] = 0;
        initialLiked[post.id] = post.likes?.includes(currentUser?.id) || false;
        initialLikeCounts[post.id] = post.likes?.length || 0;

        try {
          const commentsResponse = await withAuthRetry((token) =>
            axios.get(`http://localhost:8081/api/posts/${post.id}/comments`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          );
          initialCommentCounts[post.id] = commentsResponse.data.length;
        } catch (err) {
          console.error(`Failed to fetch comments for post ${post.id}:`, err);
          initialCommentCounts[post.id] = 0;
        }
      }

      setMediaIndices(initialIndices);
      setLikedPosts(initialLiked);
      setLikeCounts(initialLikeCounts);
      setCommentCounts(initialCommentCounts);
    } catch (error) {
      console.error('Failed to fetch feed posts:', error.message);
      const errorMessage = error.response?.data?.error || error.response?.data || error.message;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId) => {
    if (!validateAuth()) {
      if (refreshToken) {
        const newToken = await refreshTokenRequest();
        if (newToken) return fetchComments(postId); // Retry after refresh
      }
      return;
    }

    try {
      const response = await withAuthRetry((token) =>
        axios.get(`http://localhost:8081/api/posts/${postId}/comments`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      setComments(response.data);
      setCommentCounts((prev) => ({ ...prev, [postId]: response.data.length }));
    } catch (error) {
      console.error('Error fetching comments:', error);
      const errorMessage = error.response?.data?.error || error.response?.data || error.message;
      toast.error(`Failed to load comments: ${errorMessage}`, { position: 'top-right', autoClose: 3000 });
    }
  };

  const fetchPostCreatorFollowers = async (creatorId) => {
    if (!validateAuth()) {
      if (refreshToken) {
        const newToken = await refreshTokenRequest();
        if (newToken) return fetchPostCreatorFollowers(creatorId); // Retry after refresh
      }
      return;
    }

    try {
      const response = await withAuthRetry((token) =>
        axios.get(`http://localhost:8081/api/network/followers/${creatorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      setPostCreatorFollowers(response.data);
    } catch (error) {
      console.error('Error fetching post creator followers:', error);
    }
  };

  const fetchLikedUsers = async (postId) => {
    if (!validateAuth()) {
      if (refreshToken) {
        const newToken = await refreshTokenRequest();
        if (newToken) return fetchLikedUsers(postId); // Retry after refresh
      }
      return;
    }

    try {
      const post = posts.find((p) => p.id === postId);
      if (!post || !post.likes || post.likes.length === 0) {
        setLikedUsers([]);
        return;
      }

      const users = [];
      for (const userId of post.likes) {
        try {
          const response = await withAuthRetry((token) =>
            axios.get(`http://localhost:8081/api/auth/users/${userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          );
          users.push(response.data);
        } catch (err) {
          console.error(`Failed to fetch user ${userId}:`, err);
          const userFromPost = posts.flatMap(p => p.comments || []).find(c => c.creatorId === userId);
          if (userFromPost) {
            users.push({ id: userId, fullName: userFromPost.creatorName });
          }
        }
      }
      setLikedUsers(users);
    } catch (error) {
      console.error('Error fetching liked users:', error);
      const errorMessage = error.response?.data?.error || error.response?.data || error.message;
      toast.error(`Failed to load liked users: ${errorMessage}`, { position: 'top-right', autoClose: 3000 });
    }
  };

  const handlePrevMedia = (postId, mediaLength) => {
    setMediaIndices((prev) => {
      const currentIndex = prev[postId];
      const newIndex = currentIndex > 0 ? currentIndex - 1 : mediaLength - 1;
      return { ...prev, [postId]: newIndex };
    });
  };

  const handleNextMedia = (postId, mediaLength) => {
    setMediaIndices((prev) => {
      const currentIndex = prev[postId];
      const newIndex = currentIndex < mediaLength - 1 ? currentIndex + 1 : 0;
      return { ...prev, [postId]: newIndex };
    });
  };

  const handleLike = async (postId) => {
    if (!validateAuth()) {
      if (refreshToken) {
        const newToken = await refreshTokenRequest();
        if (newToken) return handleLike(postId); // Retry after refresh
      }
      return;
    }

    try {
      const response = await withAuthRetry((token) =>
        axios.post(
          `http://localhost:8081/api/posts/${postId}/like`,
          {},
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        )
      );
      if (response.status === 200) {
        const post = posts.find((p) => p.id === postId);
        const isCurrentlyLiked = likedPosts[postId];
        const newLikedState = !isCurrentlyLiked;
        const updatedLikes = newLikedState
          ? [...(post.likes || []), currentUser?.id]
          : (post.likes || []).filter((id) => id !== currentUser?.id);
        setLikedPosts((prev) => ({ ...prev, [postId]: newLikedState }));
        setLikeCounts((prev) => ({ ...prev, [postId]: updatedLikes.length }));
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, likes: updatedLikes } : p))
        );
        toast.success(newLikedState ? 'Liked the post!' : 'Unliked the post!', {
          position: 'top-right',
          autoClose: 3000,
        });

        if (newLikedState && post.creatorId !== currentUser?.id) {
          await withAuthRetry((token) =>
            axios.post(
              `http://localhost:8081/api/network/notifications`,
              {
                userId: post.creatorId,
                postId: postId,
                type: 'LIKE',
                message: `${currentUser?.email?.split('@')[0]} liked your post`,
              },
              { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            )
          );
        }

        if (likedUsersModalOpen && selectedPostForLikes === postId) {
          fetchLikedUsers(postId);
        }
      }
    } catch (error) {
      console.error('Error liking post:', error);
      const errorMessage = error.response?.data?.error || error.response?.data || error.message;
    }
  };

  const handleComment = async (postId) => {
    if (!validateAuth()) {
      if (refreshToken) {
        const newToken = await refreshTokenRequest();
        if (newToken) return handleComment(postId); // Retry after refresh
      }
      return;
    }

    setSelectedPostId(postId);
    setCommentModalOpen(true);
    fetchComments(postId);

    const post = posts.find((p) => p.id === postId);
    if (post && post.creatorId !== currentUser?.id) {
      try {
        await withAuthRetry((token) =>
          axios.post(
            `http://localhost:8081/api/network/notifications`,
            {
              userId: post.creatorId,
              postId: postId,
              type: 'COMMENT',
              message: `${currentUser?.email?.split('@')[0]} commented on your post`,
            },
            { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
          )
        );
      } catch (error) {
        console.error('Error sending comment notification:', error);
      }
    }
  };

  const handleLikesClick = (postId) => {
    if (!validateAuth()) {
      if (refreshToken) {
        const newToken = refreshTokenRequest();
        if (newToken) return handleLikesClick(postId); // Retry after refresh
      }
      return;
    }

    setSelectedPostForLikes(postId);
    setLikedUsersModalOpen(true);
    fetchLikedUsers(postId);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!validateAuth()) {
      if (refreshToken) {
        const newToken = await refreshTokenRequest();
        if (newToken) return handleCommentSubmit(e); // Retry after refresh
      }
      return;
    }
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty!', { position: 'top-right', autoClose: 3000 });
      return;
    }

    try {
      const response = await withAuthRetry((token) =>
        axios.post(
          `http://localhost:8081/api/posts/${selectedPostId}/comments`,
          { text: newComment, userId: currentUser?.id },
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        )
      );
      setComments((prev) => [...prev, response.data]);
      setCommentCounts((prev) => ({ ...prev, [selectedPostId]: prev[selectedPostId] + 1 }));
      setNewComment('');
      toast.success('Comment added!', { position: 'top-right', autoClose: 3000 });
    } catch (error) {
      console.error('Error adding comment:', error);
      const errorMessage = error.response?.data?.error || error.response?.data || error.message;
      toast.error(`Failed to add comment: ${errorMessage}`, { position: 'top-right', autoClose: 3000 });
    }
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.text);
  };

  const handleUpdateComment = async (e) => {
    e.preventDefault();
    if (!validateAuth()) {
      if (refreshToken) {
        const newToken = await refreshTokenRequest();
        if (newToken) return handleUpdateComment(e); // Retry after refresh
      }
      return;
    }
    if (!editCommentText.trim()) {
      toast.error('Comment cannot be empty!', { position: 'top-right', autoClose: 3000 });
      return;
    }

    try {
      await withAuthRetry((token) =>
        axios.put(
          `http://localhost:8081/api/posts/${selectedPostId}/comments/${editingCommentId}`,
          { userId: currentUser?.id, text: editCommentText },
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        )
      );
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === editingCommentId ? { ...comment, text: editCommentText } : comment
        )
      );
      setEditingCommentId(null);
      setEditCommentText('');
      toast.success('Comment updated!', { position: 'top-right', autoClose: 3000 });
    } catch (error) {
      console.error('Error updating comment:', error);
      const errorMessage = error.response?.data?.error || error.response?.data || error.message;
      toast.error(`Failed to update comment: ${errorMessage}`, { position: 'top-right', autoClose: 3000 });
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!validateAuth()) {
      if (refreshToken) {
        const newToken = await refreshTokenRequest();
        if (newToken) return handleDeleteComment(commentId); // Retry after refresh
      }
      return;
    }

    try {
      await withAuthRetry((token) =>
        axios.delete(`http://localhost:8081/api/posts/${selectedPostId}/comments/${commentId}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { userId: currentUser?.id },
        })
      );
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      setCommentCounts((prev) => ({ ...prev, [selectedPostId]: prev[selectedPostId] - 1 }));
      toast.success('Comment deleted!', { position: 'top-right', autoClose: 3000 });
    } catch (error) {
      console.error('Error deleting comment:', error);
      const errorMessage = error.response?.data?.error || error.response?.data || error.message;
      toast.error(`Failed to delete comment: ${errorMessage}`, { position: 'top-right', autoClose: 3000 });
    }
  };

  const closeModal = () => {
    setCommentModalOpen(false);
    setSelectedPostId(null);
    setComments([]);
    setNewComment('');
    setEditingCommentId(null);
    setEditCommentText('');
    setPostCreatorFollowers([]);
  };

  const closeLikedUsersModal = () => {
    setLikedUsersModalOpen(false);
    setSelectedPostForLikes(null);
    setLikedUsers([]);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken && !currentUser?.id) {
      // Attempt to restore user from token if Redux state is empty
      try {
        const decoded = jwtDecode(storedToken);
        dispatch({ type: 'RESTORE_USER', payload: { email: decoded.sub, id: decoded.userId, token: storedToken } });
      } catch (error) {
        console.error('Failed to restore user from token:', error);
      }
    }
    if ((currentUser?.id && storedToken) || (refreshToken && isTokenExpired(storedToken))) {
      fetchFeedPosts();
    } else {
      console.warn('No currentUser.id or token, redirecting to login');
      handleAuthError();
    }
  }, [currentUser?.id, token, refreshToken]);

  useEffect(() => {
    if (commentModalOpen && selectedPostId) {
      fetchComments(selectedPostId);
      const post = posts.find((p) => p.id === selectedPostId);
      if (post) {
        fetchPostCreatorFollowers(post.creatorId);
      }
    }
  }, [commentModalOpen, selectedPostId]);

  useEffect(() => {
    if (likedUsersModalOpen && selectedPostForLikes) {
      fetchLikedUsers(selectedPostForLikes);
    }
  }, [likedUsersModalOpen, selectedPostForLikes]);

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex justify-center items-center">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600"></div>
  </div>;

  if (error) return <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex justify-center items-center">
    <p className="text-red-600 text-2xl font-serif font-semibold tracking-wide">Error: {error}</p>
  </div>;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 font-sans">
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 bg-white shadow-lg p-6 overflow-y-auto">
          <h3 className="text-2xl font-extrabold text-indigo-600 mb-8 border-b-2 border-indigo-200 pb-2">CodeHub</h3>
          <ul className="space-y-6">
            <li>
              <Link to="/" className="text-gray-700 hover:text-indigo-600 text-lg font-medium transition duration-300 flex items-center hover:bg-indigo-50 p-2 rounded-lg">
                <span className="mr-3">💻</span> Home
              </Link>
            </li>
            <li>
              <Link to="/feed" className="text-indigo-600 font-medium text-lg flex items-center bg-indigo-50 p-2 rounded-lg">
                <span className="mr-3">📡</span> Feed
              </Link>
            </li>
            <li>
              <Link to="/create-post" className="text-gray-700 hover:text-indigo-600 text-lg font-medium transition duration-300 flex items-center hover:bg-indigo-50 p-2 rounded-lg">
                <span className="mr-3">📝</span> Share Code
              </Link>
            </li>
            <li>
              <Link to="/profile" className="text-gray-700 hover:text-indigo-600 text-lg font-medium transition duration-300 flex items-center hover:bg-indigo-50 p-2 rounded-lg">
                <AiOutlineUser className="mr-3" /> Profile
              </Link>
            </li>
            <li>
              <Link to="/network" className="text-gray-700 hover:text-indigo-600 text-lg font-medium transition duration-300 flex items-center hover:bg-indigo-50 p-2 rounded-lg">
                <span className="mr-3">🌐</span> Network
              </Link>
            </li>
            <li>
              <Link to="/notifications" className="text-gray-700 hover:text-indigo-600 text-lg font-medium transition duration-300 flex items-center hover:bg-indigo-50 p-2 rounded-lg">
                <FaBell className="mr-3" /> Notifications
              </Link>
            </li>
          </ul>
        </aside>

        <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-3xl font-serif font-semibold text-gray-900 mb-8 flex items-center">
                <FaCode className="text-indigo-600 mr-3" /> Community Feed
              </h2>
              {posts.length === 0 ? (
                <p className="text-gray-600 text-lg font-sans">No posts available in your feed.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-2xl mr-4">
                          {post.creatorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{post.creatorName}</h3>
                          <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <h3 className="text-xl font-serif font-semibold text-gray-900 mb-3">{post.title}</h3>
                      <p className="text-gray-600 mb-4 font-sans leading-relaxed">{post.text}</p>
                      {post.media && post.media.length > 0 && (
                        <div className="relative mt-4">
                          <div className="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden">
                            {post.media.map((mediaItem, index) => (
                              <div
                                key={index}
                                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                                  mediaIndices[post.id] === index ? 'opacity-100' : 'opacity-0'
                                }`}
                              >
                                {mediaItem.type === 'IMAGE' ? (
                                  <img
                                    src={`http://localhost:8081/api/posts/uploads/${mediaItem.path}`}
                                    alt={`Post media ${index}`}
                                    className="w-full h-64 object-cover rounded-xl"
                                    loading="lazy"
                                  />
                                ) : mediaItem.type === 'VIDEO' ? (
                                  <video
                                    controls
                                    className="w-full h-64 object-cover rounded-xl"
                                  >
                                    <source
                                      src={`http://localhost:8081/api/posts/uploads/${mediaItem.path}`}
                                      type="video/mp4"
                                    />
                                    Your browser does not support the video tag.
                                  </video>
                                ) : null}
                              </div>
                            ))}
                          </div>
                          {post.media.length > 1 && (
                            <>
                              <button
                                onClick={() => handlePrevMedia(post.id, post.media.length)}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/90 text-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 transition duration-200"
                              >
                                <FaChevronLeft className="text-lg" />
                              </button>
                              <button
                                onClick={() => handleNextMedia(post.id, post.media.length)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/90 text-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 transition duration-200"
                              >
                                <FaChevronRight className="text-lg" />
                              </button>
                              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                {post.media.map((_, index) => (
                                  <div
                                    key={index}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                      mediaIndices[post.id] === index ? 'bg-indigo-600 scale-125' : 'bg-gray-400'
                                    }`}
                                  ></div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center space-x-2 ${
                              likedPosts[post.id] ? 'text-red-500' : 'text-gray-600'
                            } hover:text-red-600 transition duration-200`}
                          >
                            <FaHeart className="text-lg" />
                            <span className="text-sm font-sans font-medium">
                              {likeCounts[post.id]} {likeCounts[post.id] === 1 ? 'Like' : 'Likes'}
                            </span>
                          </button>
                          {likeCounts[post.id] > 0 && (
                            <button
                              onClick={() => handleLikesClick(post.id)}
                              className="text-sm font-sans font-medium text-indigo-600 hover:underline"
                            >
                              See who liked
                            </button>
                          )}
                          <button
                            onClick={() => handleComment(post.id)}
                            className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition duration-200"
                          >
                            <FaComment className="text-lg" />
                            <span className="text-sm font-sans font-medium">
                              {commentCounts[post.id] || 0} {commentCounts[post.id] === 1 ? 'Comment' : 'Comments'}
                            </span>
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 text-gray-600 text-sm space-y-1 font-sans">
                        <p>
                          Category: <span className="font-medium">{post.category}</span>
                        </p>
                        <p>
                          Tags: <span className="font-medium">{post.tags.join(', ')}</span>
                        </p>
                        <p>
                          Created: <span className="font-medium">{new Date(post.createdAt).toLocaleDateString()}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {commentModalOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300"
                onClick={closeModal}
              >
                <div
                  className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-300 scale-100 border border-gray-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
                    <h3 className="text-xl font-serif font-semibold text-gray-800">Comments</h3>
                    <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 transition duration-200">
                      <FaTimes className="text-lg" />
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto mb-6 space-y-4 pr-2">
                    {comments.length === 0 ? (
                      <p className="text-gray-500 text-center font-sans text-sm">No comments yet.</p>
                    ) : (
                      comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="flex items-start space-x-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl shadow-md hover:shadow-lg transition duration-300"
                        >
                          <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                            {comment.creatorName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            {editingCommentId === comment.id ? (
                              <form onSubmit={handleUpdateComment} className="space-y-3">
                                <textarea
                                  value={editCommentText}
                                  onChange={(e) => setEditCommentText(e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans text-sm resize-none bg-white"
                                  rows="3"
                                />
                                <div className="flex space-x-2">
                                  <button
                                    type="submit"
                                    className="bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition duration-200 font-sans text-sm"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingCommentId(null)}
                                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300 transition duration-200 font-sans text-sm"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </form>
                            ) : (
                              <>
                                <p className="text-gray-800 font-sans text-sm leading-relaxed break-words">{comment.text}</p>
                                <p className="text-gray-500 text-xs mt-1 font-sans">
                                  {comment.creatorName} - {new Date(comment.createdAt).toLocaleString()}
                                </p>
                                {comment.creatorId === currentUser?.id && (
                                  <div className="flex space-x-2 mt-2">
                                    <button
                                      onClick={() => handleEditComment(comment)}
                                      className="text-indigo-600 hover:text-indigo-800 transition duration-200 flex items-center space-x-1 text-xs"
                                    >
                                      <FaEdit className="text-xs" />
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteComment(comment.id)}
                                      className="text-red-600 hover:text-red-800 transition duration-200 flex items-center space-x-1 text-xs"
                                    >
                                      <FaTrash className="text-xs" />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <form onSubmit={handleCommentSubmit} className="space-y-4">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write your comment..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans text-sm resize-none bg-white shadow-inner"
                      rows="3"
                    />
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition duration-300 font-sans text-sm font-medium shadow-md"
                    >
                      Submit Comment
                    </button>
                  </form>
                </div>
              </div>
            )}

            {likedUsersModalOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300"
                onClick={closeLikedUsersModal}
              >
                <div
                  className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-300 scale-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
                    <h3 className="text-xl font-serif font-semibold text-gray-800">Liked by</h3>
                    <button onClick={closeLikedUsersModal} className="text-gray-500 hover:text-gray-700 transition duration-200">
                      <FaTimes className="text-lg" />
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto pr-2">
                    {likedUsers.length === 0 ? (
                      <p className="text-gray-500 text-center font-sans text-sm">No likes yet.</p>
                    ) : (
                      likedUsers.map((user) => (
                        <div key={user.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200">
                          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <p className="text-gray-800 font-sans text-sm">{user.fullName.split(' ')[0]}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Feed;
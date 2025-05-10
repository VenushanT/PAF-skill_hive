import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signoutSuccess } from '../redux/slices/userSlice';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaTrash } from 'react-icons/fa';

function CommentNotifications() {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  const fetchNotifications = async () => {
    if (!currentUser?.id || !token) {
      console.warn('Missing currentUser.id or token, redirecting to login', { currentUser, token });
      toast.error('Please log in to view notifications');
      dispatch(signoutSuccess());
      localStorage.removeItem('token');
      navigate('/login');
      return;
    }

    console.log('Fetching comment notifications for user ID:', currentUser.id);
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8081/api/post-interactions', {
        headers: { Authorization: `Bearer ${token}` },
        params: { recipientId: currentUser.id },
      });
      console.log('Comment notifications response:', response.data);
      const commentNotifications = response.data.filter((interaction) => {
        if (interaction.type !== 'COMMENT') return false;
        if (!interaction.commentId) {
          console.warn('Found COMMENT interaction without commentId:', interaction);
          return false;
        }
        return true;
      });
      setNotifications(commentNotifications);
    } catch (error) {
      console.error('Error fetching comment notifications:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        console.warn('401 Unauthorized - signing out');
        toast.error('Session expired. Please log in again.');
        dispatch(signoutSuccess());
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        console.warn('Non-401 error fetching comment notifications:', error.response?.data?.error || error.message);
        toast.warn('Failed to load comment notifications: ' + (error.response?.data?.error || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (!currentUser?.id || !token) {
      console.warn('Missing user ID or token for marking notifications');
      toast.error('Please log in to perform this action');
      dispatch(signoutSuccess());
      localStorage.removeItem('token');
      navigate('/login');
      return;
    }

    console.log('Marking all comment notifications as read for user ID:', currentUser.id);
    try {
      await axios.post('http://localhost:8081/api/post-interactions/mark-read', {
        recipientId: currentUser.id,
        type: 'COMMENT',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications([]);
      toast.success('All comment notifications marked as read');
    } catch (error) {
      console.error('Error marking comment notifications as read:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        console.warn('401 Unauthorized - signing out');
        toast.error('Session expired. Please log in again.');
        dispatch(signoutSuccess());
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error('Failed to mark comment notifications as read: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleDeleteComment = async (notification) => {
    if (!currentUser?.id || !token) {
      console.warn('Missing user ID or token for deleting comment');
      toast.error('Please log in to perform this action');
      dispatch(signoutSuccess());
      localStorage.removeItem('token');
      navigate('/login');
      return;
    }

    if (!notification.commentId) {
      toast.error('Cannot delete: No comment associated with this notification');
      return;
    }

    console.log('Deleting comment:', notification.commentId, 'from post:', notification.postId);
    try {
      await axios.delete(`http://localhost:8081/api/posts/${notification.postId}/comments/${notification.commentId}/creator`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      toast.success('Comment and notification deleted');
    } catch (error) {
      console.error('Error deleting comment and notification:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        console.warn('401 Unauthorized - signing out');
        toast.error('Session expired. Please log in again.');
        dispatch(signoutSuccess());
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        const errorMessage = error.response?.data?.error || error.response?.data || error.message;
        toast.error(`Failed to delete comment: ${errorMessage}`);
      }
    }
  };

  const handleNotificationClick = (postId) => {
    console.log('Navigating to post:', postId);
    navigate(`/feed?postId=${postId}`);
  };

  useEffect(() => {
    console.log('CommentNotifications useEffect - currentUser:', currentUser, 'token:', token);
    if (currentUser?.id && token) {
      fetchNotifications();
    } else {
      console.warn('No currentUser.id or token, redirecting to login');
      toast.error('Please log in to view notifications');
      dispatch(signoutSuccess());
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [currentUser, token, navigate, dispatch]);

  if (loading) return <div className="text-center p-10 font-sans text-gray-600">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-6">
      <h1 className="text-3xl font-serif font-semibold text-gray-800 mb-6">Comment Notifications</h1>
      <div className="max-w-2xl mx-auto">
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center font-sans text-lg">No comment notifications yet.</p>
        ) : (
          <>
            <button
              onClick={handleMarkAllRead}
              className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 font-sans"
            >
              Mark All as Read
            </button>
            {notifications.map((notif) => (
              <div key={notif.id} className="bg-white p-4 mb-4 rounded-lg shadow-md flex justify-between items-center">
                <div
                  className="cursor-pointer"
                  onClick={() => handleNotificationClick(notif.postId)}
                >
                  <p className="text-gray-800 font-sans text-sm">{notif.message}</p>
                  <p className="text-gray-500 text-xs mt-1 font-sans">{new Date(notif.createdAt).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => handleDeleteComment(notif)}
                  className="text-red-600 hover:text-red-800 transition duration-200 flex items-center space-x-1 text-sm font-sans"
                >
                  <FaTrash className="text-sm" />
                  <span>Delete Comment</span>
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default CommentNotifications;
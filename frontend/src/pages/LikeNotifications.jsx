import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signoutSuccess } from '../redux/slices/userSlice';
import axios from 'axios';
import { toast } from 'react-toastify';

function LikeNotifications() {
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
      navigate('/login');
      return;
    }

    console.log('Fetching like notifications for user ID:', currentUser.id);
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8081/api/post-interactions', {
        headers: { Authorization: `Bearer ${token}` },
        params: { recipientId: currentUser.id },
      });
      console.log('Like notifications response:', response.data);
      const likeNotifications = response.data.filter((interaction) => interaction.type === 'LIKE');
      setNotifications(likeNotifications);
    } catch (error) {
      console.error('Error fetching like notifications:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        console.warn('401 Unauthorized - signing out');
        toast.error('Session expired. Please log in again.');
        dispatch(signoutSuccess());
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        console.warn('Non-401 error fetching like notifications:', error.response?.data?.error || error.message);
        toast.warn('Failed to load like notifications: ' + (error.response?.data?.error || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (!currentUser?.id || !token) {
      console.warn('Missing user ID or token for marking notifications');
      toast.error('Please log in to perform this action');
      navigate('/login');
      return;
    }

    console.log('Marking all like notifications as read for user ID:', currentUser.id);
    try {
      await axios.post('http://localhost:8081/api/post-interactions/mark-read', {
        recipientId: currentUser.id,
        type: 'LIKE',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications([]);
      toast.success('All like notifications marked as read');
    } catch (error) {
      console.error('Error marking like notifications as read:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        console.warn('401 Unauthorized - signing out');
        toast.error('Session expired. Please log in again.');
        dispatch(signoutSuccess());
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error('Failed to mark like notifications as read: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleNotificationClick = (postId) => {
    console.log('Navigating to post:', postId);
    navigate(`/feed?postId=${postId}`);
  };

  useEffect(() => {
    console.log('LikeNotifications useEffect - currentUser:', currentUser, 'token:', token);
    if (currentUser?.id && token) {
      fetchNotifications();
    } else {
      console.warn('No currentUser.id or token, redirecting to login');
      toast.error('Please log in to view notifications');
      navigate('/login');
    }
  }, [currentUser, token]);

  if (loading) return <div className="text-center p-10 font-sans text-gray-600">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-6">
      <h1 className="text-3xl font-serif font-semibold text-gray-800 mb-6">Like Notifications</h1>
      <div className="max-w-2xl mx-auto">
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center font-sans text-lg">No like notifications yet.</p>
        ) : (
          <>
            <button
              onClick={handleMarkAllRead}
              className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 font-sans"
            >
              Mark All as Read
            </button>
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="bg-white p-4 mb-4 rounded-lg shadow-md cursor-pointer"
                onClick={() => handleNotificationClick(notif.postId)}
              >
                <p className="text-gray-800 font-sans text-sm">{notif.message}</p>
                <p className="text-gray-500 text-xs mt-1 font-sans">{new Date(notif.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default LikeNotifications;
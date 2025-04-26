import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import api from '../services/api';
import { 
  Home, Users, Bell, Search, User, MessageSquare, 
  Heart, Share2, Calendar, Globe, Store, Video, Clock, 
  Brain
} from "lucide-react";

// Sample data for posts
const posts = [
  {
    id: "1",
    author: "Sarah Johnson",
    content: "Just finished a great hike! 🏞️ Feeling refreshed!",
    timestamp: "2 hours ago",
    likes: 42,
    comments: 15,
    icon: Globe,
  },
  {
    id: "2",
    author: "Michael Chen",
    content: "Check out my new project! #coding #react",
    timestamp: "Yesterday",
    likes: 28,
    comments: 10,
    icon: Video,
  },
];

// Sample data for stories
const stories = [
  {
    title: "Sarah's Adventure",
    author: "Sarah Johnson",
    time: "3h ago",
    icon: Clock,
  },
  {
    title: "Michael's Coding Vlog",
    author: "Michael Chen",
    time: "1h ago",
    icon: Video,
  },
];

// Sample data for friend suggestions
const friendSuggestions = [
  { label: "Sarah Johnson", value: "Mutual: 12 friends", icon: Users },
  { label: "Emma Rodriguez", value: "Mutual: 8 friends", icon: Users },
];

// Post Card
function PostCard({ post }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
          {post.author.charAt(0)}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{post.author}</h3>
          <p className="text-xs text-gray-400">{post.timestamp}</p>
        </div>
      </div>
      <p className="text-gray-700 text-sm">{post.content}</p>
      <div className="flex justify-between text-gray-500 text-sm pt-3 border-t">
        <button className="flex items-center gap-2 hover:text-red-500">
          <Heart className="h-5 w-5" />
          {post.likes}
        </button>
        <button className="flex items-center gap-2 hover:text-blue-500">
          <MessageSquare className="h-5 w-5" />
          {post.comments}
        </button>
        <button className="flex items-center gap-2 hover:text-green-500">
          <Share2 className="h-5 w-5" />
          Share
        </button>
      </div>
    </div>
  );
}

// Tab Group
function TabGroup({ tabs, activeTab, onChange }) {
  return (
    <div className="flex space-x-6 border-b mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`pb-2 text-sm font-semibold ${
            activeTab === tab.value 
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// Friend Suggestion Card
function FriendSuggestionCard({ suggestion }) {
  return (
    <div className="bg-white rounded-xl shadow hover:shadow-md transition-all p-3 flex items-center gap-4">
      <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
        {suggestion.label.charAt(0)}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold">{suggestion.label}</p>
        <p className="text-xs text-gray-400">{suggestion.value}</p>
      </div>
      <button className="text-blue-600 text-xs font-semibold hover:underline">
        Add
      </button>
    </div>
  );
}

// Story Card
function StoryCard({ story }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-all">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-full text-blue-600">
          <story.icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">{story.title}</p>
          <p className="text-xs text-gray-400">{story.author}</p>
        </div>
      </div>
      <p className="text-xs text-gray-400">{story.time}</p>
    </div>
  );
}

// Main Component
export default function FacebookLandingPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/user/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setUser(res.data);
      } catch (err) {
        setError('Unable to load user');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-4">
        <h1 className="text-2xl font-bold text-red-500">{error}</h1>
        <a href="/" className="text-blue-600 underline">Back Home</a>
      </div>
    );
  }

  if (!user) return null;

  const tabs = [
    { label: 'All', value: 'all' },
    { label: 'Friends', value: 'friends' },
    { label: 'Groups', value: 'groups' },
  ];

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 bg-white shadow-md z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="/" className="text-2xl font-bold text-blue-600">facebook</a>
            <div className="relative">
              <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Facebook"
                className="pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full"><Users className="h-5 w-5" /></button>
            <button className="p-2 hover:bg-gray-100 rounded-full"><MessageSquare className="h-5 w-5" /></button>
            <button className="p-2 hover:bg-gray-100 rounded-full"><Bell className="h-5 w-5" /></button>
            <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
              {user.username?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Layout */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Left Sidebar */}
        <aside className="hidden lg:block w-64 space-y-4">
          <nav className="bg-white rounded-2xl p-4 shadow space-y-3">
          {[
              { label: "Home", icon: Home, path: "/" },
              { label: "Friends", icon: Users, path: "/" },
              { label: "Groups", icon: Users, path: "/" },
              { label: "myskillShares", icon: Brain, path: "/quizzes" }, // <-- Added path to quizzes
              { label: "Marketplace", icon: Store, path: "/" },
              { label: "Events", icon: Calendar, path: "/" },
              { label: "Profile", icon: User, path: "/" },
            ].map((item, idx) => (
              <Link 
                key={idx} 
                to={item.path} 
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-all text-gray-700"
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* News Feed */}
        <section className="flex-1 space-y-6">
          {/* Create Post */}
          <div className="bg-white rounded-2xl shadow p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                {user.username?.charAt(0)}
              </div>
              <input
                type="text"
                placeholder={`What's on your mind, ${user.username}?`}
                className="flex-1 bg-gray-100 rounded-full py-2 px-4 outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex justify-around mt-4 text-gray-500">
              <button className="flex items-center gap-2 hover:text-blue-600"><Video className="h-4 w-4" /> Live Video</button>
              <button className="flex items-center gap-2 hover:text-blue-600"><Globe className="h-4 w-4" /> Photo/Video</button>
              <button className="flex items-center gap-2 hover:text-blue-600"><Heart className="h-4 w-4" /> Feeling/Activity</button>
            </div>
          </div>

          {/* Stories */}
          <div className="bg-white rounded-2xl shadow p-5">
            <h2 className="text-lg font-bold mb-4">Stories</h2>
            <div className="space-y-3">
              {stories.map((story, idx) => (
                <StoryCard key={idx} story={story} />
              ))}
            </div>
          </div>

          {/* Posts */}
          <div>
            <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
            <div className="space-y-5">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>

        {/* Right Sidebar */}
        <aside className="hidden lg:block w-64 space-y-4">
          <div className="bg-white rounded-2xl shadow p-4">
            <h2 className="text-lg font-bold mb-4">People You May Know</h2>
            <div className="space-y-3">
              {friendSuggestions.map((suggestion, idx) => (
                <FriendSuggestionCard key={idx} suggestion={suggestion} />
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

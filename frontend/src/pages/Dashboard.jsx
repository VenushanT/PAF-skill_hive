import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import api from '../services/api';
import { 
  Home, Users, Bell, Search, User, MessageSquare, 
  Heart, Share2, Calendar, Globe, Code, Terminal, Clock, 
  Brain, PlusCircle, ThumbsUp, GitBranch, Bookmark, MessageCircle
} from "lucide-react";

// Sample data for posts - now coding focused
const posts = [
  {
    id: "1",
    author: "Alex Chen",
    content: "Just pushed my new React component library to GitHub! Check it out: github.com/alexchen/react-components 🚀 #reactjs #opensource",
    timestamp: "2 hours ago",
    likes: 42,
    comments: 15,
    icon: Code,
  },
  {
    id: "2",
    author: "Taylor Singh",
    content: "Solved that nasty recursive algorithm problem on LeetCode today. Pro tip: Always consider your base cases carefully. #dsa #algorithms #javascript",
    timestamp: "Yesterday",
    likes: 28,
    comments: 10,
    icon: Terminal,
  },
];

// Sample data for stories - now coding focused
const stories = [
  {
    title: "React Router v7 Preview",
    author: "David Lee",
    time: "3h ago",
    icon: Code,
  },
  {
    title: "Building with Next.js",
    author: "Sophia Williams",
    time: "1h ago",
    icon: Terminal,
  },
];

// Sample data for developer suggestions
const developerSuggestions = [
  { label: "Julia Greene", value: "Full Stack Developer • Python, React", icon: Users },
  { label: "Marco Rossi", value: "ML Engineer • TensorFlow, PyTorch", icon: Users },
];

// Post Card
function PostCard({ post }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  
  const handleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setLiked(!liked);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 space-y-4">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
          {post.author.charAt(0)}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{post.author}</h3>
          <p className="text-xs text-gray-400">{post.timestamp}</p>
        </div>
      </div>
      <p className="text-gray-700 text-sm">{post.content}</p>
      <div className="flex justify-between text-gray-500 text-sm pt-4 border-t">
        <button 
          onClick={handleLike}
          className={`flex items-center gap-2 py-2 px-4 rounded-lg transition-all ${
            liked 
              ? "text-blue-600 bg-blue-50" 
              : "hover:text-blue-600 hover:bg-blue-50"
          }`}
        >
          <ThumbsUp className="h-5 w-5" />
          <span className="font-medium">{likeCount}</span>
        </button>
        <button className="flex items-center gap-2 hover:text-indigo-600 py-2 px-4 rounded-lg hover:bg-indigo-50 transition-all">
          <MessageCircle className="h-5 w-5" />
          <span className="font-medium">{post.comments}</span>
        </button>
        <button className="flex items-center gap-2 hover:text-green-600 py-2 px-4 rounded-lg hover:bg-green-50 transition-all">
          <GitBranch className="h-5 w-5" />
          <span className="font-medium">Fork</span>
        </button>
        <button 
          onClick={() => setSaved(!saved)}
          className={`flex items-center gap-2 py-2 px-4 rounded-lg transition-all ${
            saved 
              ? "text-amber-600 bg-amber-50" 
              : "hover:text-amber-600 hover:bg-amber-50"
          }`}
        >
          <Bookmark className={`h-5 w-5 ${saved ? "fill-amber-600" : ""}`} />
          <span className="font-medium">Save</span>
        </button>
      </div>
    </div>
  );
}

// Tab Group
function TabGroup({ tabs, activeTab, onChange }) {
  return (
    <div className="flex space-x-8 border-b mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`pb-3 text-sm font-semibold transition-all ${
            activeTab === tab.value 
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// Developer Suggestion Card
function DeveloperSuggestionCard({ suggestion }) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-4 flex items-center gap-4">
      <div className="h-12 w-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
        {suggestion.label.charAt(0)}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold">{suggestion.label}</p>
        <p className="text-xs text-gray-400">{suggestion.value}</p>
      </div>
      <button className="text-indigo-600 text-sm font-semibold hover:bg-indigo-50 px-4 py-2 rounded-lg transition-all">
        Connect
      </button>
    </div>
  );
}

// Story Card
function StoryCard({ story }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-all">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
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
export default function DevHubLandingPage() {
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
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-5 bg-gray-50">
        <h1 className="text-2xl font-bold text-red-500">{error}</h1>
        <a href="/" className="text-indigo-600 bg-indigo-50 px-6 py-3 rounded-xl hover:bg-indigo-100 transition-all font-medium">Back Home</a>
      </div>
    );
  }

  if (!user) return null;

  const tabs = [
    { label: 'All', value: 'all' },
    { label: 'Frontend', value: 'frontend' },
    { label: 'Backend', value: 'backend' },
    { label: 'DevOps', value: 'devops' },
  ];

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 bg-white shadow-md z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <a href="/" className="text-3xl font-bold text-indigo-600">devHub</a>
            <div className="relative">
              <Search className="absolute top-3 left-4 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search developers and code"
                className="pl-12 pr-6 py-3 bg-gray-100 rounded-full focus:ring-2 focus:ring-indigo-400 outline-none w-64"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-3 hover:bg-gray-100 rounded-full transition-all">
              <Code className="h-6 w-6 text-gray-100" />
            </button>
            <button className="p-3 hover:bg-gray-100 rounded-full transition-all">
              <MessageSquare className="h-6 w-6 text-gray-700" />
            </button>
            <button className="p-3 hover:bg-gray-100 rounded-full transition-all">
              <Bell className="h-6 w-6 text-gray-700" />
            </button>
            <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-lg ml-2">
              {user.username?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Layout */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Left Sidebar */}
        <aside className="hidden lg:block w-72 space-y-6">
          <nav className="bg-white rounded-2xl p-4 shadow-lg space-y-1">
          {[
              { label: "Home", icon: Home, path: "/" },
              { label: "Network", icon: Users, path: "/" },
              { label: "Projects", icon: Code, path: "/" },
              { label: "Challenges", icon: Brain, path: "/quizzes" },
              { label: "Hackathons", icon: Calendar, path: "/" },
              { label: "Profile", icon: User, path: "/" },
            ].map((item, idx) => (
              <Link 
                key={idx} 
                to={item.path} 
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-100 transition-all text-gray-700"
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* News Feed */}
        <section className="flex-1 space-y-6">
          {/* Create Post */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                {user.username?.charAt(0)}
              </div>
              <input
                type="text"
                placeholder={`Share your code or ask a question, ${user.username}?`}
                className="flex-1 bg-gray-100 rounded-full py-3 px-6 outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div className="flex justify-around mt-6 pt-4 border-t text-gray-500">
              <button className="flex items-center gap-3 py-2 px-4 hover:bg-gray-100 rounded-xl transition-all hover:text-indigo-600">
                <Terminal className="h-5 w-5" /> 
                <span>Code Snippet</span>
              </button>
              <button className="flex items-center gap-3 py-2 px-4 hover:bg-gray-100 rounded-xl transition-all hover:text-indigo-600">
                <GitBranch className="h-5 w-5" /> 
                <span>Share Project</span>
              </button>
              <button className="flex items-center gap-3 py-2 px-4 hover:bg-gray-100 rounded-xl transition-all hover:text-indigo-600">
                <MessageCircle className="h-5 w-5" /> 
                <span>Ask Question</span>
              </button>
            </div>
          </div>

          {/* Stories */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold">Developer Stories</h2>
              <button className="text-indigo-600 flex items-center gap-2 py-2 px-4 rounded-lg hover:bg-indigo-50 transition-all">
                <PlusCircle className="h-4 w-4" />
                <span className="font-medium text-sm">Add Story</span>
              </button>
            </div>
            <div className="space-y-3">
              {stories.map((story, idx) => (
                <StoryCard key={idx} story={story} />
              ))}
            </div>
          </div>

          {/* Posts */}
          <div>
            <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>

        {/* Right Sidebar */}
        <aside className="hidden lg:block w-80 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold">Developers to Connect</h2>
              <button className="text-indigo-600 text-sm hover:bg-indigo-50 p-2 rounded-lg transition-all">
                See All
              </button>
            </div>
            <div className="space-y-4">
              {developerSuggestions.map((suggestion, idx) => (
                <DeveloperSuggestionCard key={idx} suggestion={suggestion} />
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
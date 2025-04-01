import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  BookOpen, Calendar, Clock, FileText, Home, 
  LayoutDashboard, Settings, User, Users, 
  ChevronRight, Award, Bell, Search
} from "lucide-react";

// Sample data (unchanged)
const inProgressCourses = [
  {
    id: "1",
    title: "Introduction to Web Development",
    instructor: "Sarah Johnson",
    progress: 65,
    lastAccessed: "Today",
    remainingTime: "3h 20m left",
    icon: BookOpen,
    bgColor: "bg-gradient-to-r from-indigo-500 to-purple-500",
  },
  {
    id: "2",
    title: "Data Science Fundamentals",
    instructor: "Michael Chen",
    progress: 42,
    lastAccessed: "Yesterday",
    remainingTime: "5h 45m left",
    icon: FileText,
    bgColor: "bg-gradient-to-r from-blue-500 to-teal-400",
  },
];

const completedCourses = [
  {
    id: "3",
    title: "UX/UI Design Principles",
    instructor: "Emma Rodriguez",
    progress: 100,
    lastAccessed: "2 weeks ago",
    remainingTime: "Completed",
    icon: BookOpen,
    bgColor: "bg-gradient-to-r from-green-500 to-emerald-400",
  },
  {
    id: "4",
    title: "JavaScript Basics",
    instructor: "David Kim",
    progress: 100,
    lastAccessed: "1 month ago",
    remainingTime: "Completed",
    icon: FileText,
    bgColor: "bg-gradient-to-r from-amber-500 to-orange-400",
  },
];

const bookmarkedCourses = [
  {
    id: "5",
    title: "Advanced React Patterns",
    instructor: "Jessica Patel",
    progress: 0,
    lastAccessed: "Not started",
    remainingTime: "12h total",
    icon: BookOpen,
    bgColor: "bg-gradient-to-r from-red-500 to-pink-500",
  },
  {
    id: "6",
    title: "Cloud Computing Essentials",
    instructor: "Robert Wilson",
    progress: 0,
    lastAccessed: "Not started",
    remainingTime: "8h total",
    icon: FileText,
    bgColor: "bg-gradient-to-r from-cyan-500 to-blue-400",
  },
];

const upcomingDeadlines = [
  {
    title: "Final Project Submission",
    course: "Introduction to Web Development",
    dueDate: "In 3 days",
    icon: FileText,
    urgency: "medium",
  },
  {
    title: "Quiz: Data Analysis",
    course: "Data Science Fundamentals",
    dueDate: "Tomorrow",
    icon: FileText,
    urgency: "high",
  },
  {
    title: "Peer Review",
    course: "Introduction to Web Development",
    dueDate: "In 5 days",
    icon: Users,
    urgency: "low",
  },
  {
    title: "Weekly Assignment",
    course: "Data Science Fundamentals",
    dueDate: "In 2 days",
    icon: FileText,
    urgency: "medium",
  },
];

// New data for learning stats
const learningStats = [
  { label: "Learning Streak", value: "7 days", icon: Award, color: "text-yellow-500"},
  { label: "Hours this week", value: "12.5", icon: Clock, color: "text-blue-500" },
  { label: "Courses", value: "4/6", icon: BookOpen, color: "text-purple-500" },
  { label: "Certificates", value: "2", icon: Award, color: "text-green-500" },
];

function CourseProgressCard({ course }) {
  const Icon = course.icon;
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
      <div className={`${course.bgColor} p-4 text-white`}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-bold">{course.title}</h3>
            <p className="text-sm text-white opacity-90">{course.instructor}</p>
          </div>
          <div className="rounded-full bg-white bg-opacity-20 p-2">
            <Icon className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="font-medium">Progress</div>
            <div className="font-bold">{course.progress}%</div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div 
              className={`h-3 rounded-full ${
                course.progress === 100 
                  ? "bg-green-500" 
                  : course.progress > 50 
                    ? "bg-blue-600" 
                    : "bg-violet-500"
              }`}
              style={{ width: `${course.progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Last: {course.lastAccessed}</span>
            </div>
            <div className="font-medium">{course.remainingTime}</div>
          </div>
          <div className="border-t my-2 border-gray-100"></div>
          <div className="flex justify-between">
            <a 
              href={`/courses/${course.id}`}
              className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Continue
            </a>
            <button 
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 font-medium flex items-center gap-1"
            >
              <span>Details</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabGroup({ tabs, activeTab, onChange }) {
  return (
    <div className="flex space-x-1 border-b border-gray-200 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-4 py-2 text-sm font-medium relative ${
            activeTab === tab.value
              ? "text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {tab.label}
          {activeTab === tab.value && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-lg"></span>
          )}
        </button>
      ))}
    </div>
  );
}

function StatCard({ stat }) {
  const Icon = stat.icon;
  
  return (
    <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
      <div className={`rounded-full p-3 ${stat.color} bg-opacity-10`}>
        <Icon className={`h-5 w-5 ${stat.color}`} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{stat.label}</p>
        <p className="text-lg font-bold">{stat.value}</p>
      </div>
    </div>
  );
}

function UrgencyBadge({ urgency }) {
  let color;
  switch(urgency) {
    case 'high':
      color = 'bg-red-100 text-red-600';
      break;
    case 'medium':
      color = 'bg-amber-100 text-amber-600';
      break;
    default:
      color = 'bg-blue-100 text-blue-600';
  }
  
  return (
    <span className={`${color} text-xs px-2 py-1 rounded-full`}>
      {urgency === 'high' ? 'Urgent' : urgency === 'medium' ? 'Soon' : 'Upcoming'}
    </span>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("in-progress");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/user/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load profile');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6"></div>
          <p className="text-lg font-medium text-gray-600">Loading your learning dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
          <div className="text-center mb-6">
            <div className="inline-flex rounded-full bg-red-100 p-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-800">Error Loading Dashboard</h2>
            <p className="mt-2 text-gray-600">{error}</p>
          </div>
          <div className="text-center">
            <a 
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const tabs = [
    { label: "In Progress", value: "in-progress" },
    { label: "Completed", value: "completed" },
    { label: "Bookmarked", value: "bookmarked" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex w-72 flex-col border-r bg-white shadow-lg">
        <div className="flex h-16 items-center border-b px-6">
          <a href="/" className="flex items-center gap-2 font-bold text-lg">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">LearnShare</span>
          </a>
        </div>
        
        {/* User Profile Quick View */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                {user.username ? user.username.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
            </div>
            <div>
              <h3 className="font-semibold">{user.username}</h3>
              <p className="text-xs text-gray-500">Premium Student</p>
            </div>
          </div>
        </div>
        
        <nav className="grid gap-1 px-3 py-4">
          <a
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg bg-blue-50 px-4 py-3 text-blue-600 font-medium"
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </a>
          <a
            href="/courses"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <BookOpen className="h-5 w-5" />
            My Courses
          </a>
          <a
            href="/calendar"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Calendar className="h-5 w-5" />
            Calendar
          </a>
          <a
            href="/resources"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <FileText className="h-5 w-5" />
            Resources
          </a>
          <a
            href="/profile"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <User className="h-5 w-5" />
            Profile
          </a>
          <a
            href="/settings"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Settings className="h-5 w-5" />
            Settings
          </a>
        </nav>
        
        {/* Pro Upgrade Banner */}
        <div className="mt-auto mx-4 mb-6">
          <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
            <h4 className="font-bold">Upgrade to Pro</h4>
            <p className="text-xs text-blue-100 mt-1 mb-3">Get unlimited access to all premium courses</p>
            <button className="bg-white text-blue-600 rounded-lg text-sm font-medium px-3 py-1.5 w-full">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white px-4 md:hidden shadow-sm">
          <a href="/" className="flex items-center gap-2 font-bold">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">LearnShare</span>
          </a>
          <div className="ml-auto flex items-center gap-3">
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <Bell className="h-5 w-5" />
            </button>
            <a 
              href="/"
              className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              <Home className="h-5 w-5" />
            </a>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col gap-8">
            {/* Top Bar with Search and Notifications */}
            <div className="hidden md:flex items-center justify-between">
              <div className="relative w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search for courses, resources..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
                  <Bell className="h-5 w-5" />
                </button>
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                </div>
              </div>
            </div>

            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user.username}!</h1>
                <p className="text-gray-600 mt-1">Ready to continue your learning journey?</p>
              </div>
              <a 
                href="/courses/browse"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-medium shadow-md hover:shadow-lg transition-all"
              >
                Explore New Courses
              </a>
            </div>
            
            {/* Learning Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {learningStats.map((stat, index) => (
                <StatCard key={index} stat={stat} />
              ))}
            </div>

            {/* Course Progress */}
            <div>
              <h2 className="text-xl font-bold mb-4">Your Course Progress</h2>
              <TabGroup
                tabs={tabs}
                activeTab={activeTab}
                onChange={setActiveTab}
              />
              
              {activeTab === "in-progress" && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {inProgressCourses.map((course) => (
                    <CourseProgressCard key={course.id} course={course} />
                  ))}
                  <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center p-8 hover:bg-gray-100 cursor-pointer transition-colors">
                    <div className="text-center">
                      <div className="rounded-full bg-blue-100 p-3 inline-flex mx-auto">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="mt-4 font-medium text-gray-900">Start a New Course</h3>
                      <p className="mt-1 text-sm text-gray-500">Browse our catalog to find your next learning adventure</p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === "completed" && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {completedCourses.map((course) => (
                    <CourseProgressCard key={course.id} course={course} />
                  ))}
                </div>
              )}
              
              {activeTab === "bookmarked" && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {bookmarkedCourses.map((course) => (
                    <CourseProgressCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Deadlines */}
            <div>
              <h2 className="text-xl font-bold mb-4">Upcoming Deadlines</h2>
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="divide-y">
                  {upcomingDeadlines.map((deadline, index) => {
                    const DeadlineIcon = deadline.icon;
                    return (
                      <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50">
                        <div className="flex items-start gap-4">
                          <div className={`rounded-full p-2 ${
                            deadline.urgency === 'high' 
                              ? 'bg-red-100 text-red-600' 
                              : deadline.urgency === 'medium'
                                ? 'bg-amber-100 text-amber-600'
                                : 'bg-blue-100 text-blue-600'
                          }`}>
                            <DeadlineIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{deadline.title}</h3>
                            <p className="text-sm text-gray-500">{deadline.course}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <UrgencyBadge urgency={deadline.urgency} />
                          <div className="font-medium">{deadline.dueDate}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <a href="/calendar" className="flex items-center justify-center gap-1 text-blue-600 font-medium hover:text-blue-800">
                    <span>View all deadlines</span>
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
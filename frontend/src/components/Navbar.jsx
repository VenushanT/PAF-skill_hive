import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Home, LayoutDashboard, ChevronDown } from 'lucide-react';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const token = localStorage.getItem('token');

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    setProfileDropdownOpen(false);
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-lg py-2' 
          : 'bg-white/90 backdrop-blur-md py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center hover:animate-pulse">
              <span className="text-white font-bold text-lg">^</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">SKILL HIVE</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {!token ? (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-blue-600 hover:scale-105 transform transition-all duration-200 px-3 py-2 rounded-lg font-medium"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-md hover:shadow-lg font-medium"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/" 
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors font-medium ${
                    location.pathname === '/' 
                      ? 'text-blue-600 bg-blue-50 after:absolute after:left-0 after:bottom-0 after:w-full after:h-0.5 after:bg-blue-600'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Link>
                <Link 
                  to="/dashboard" 
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors font-medium ${
                    location.pathname === '/dashboard' 
                      ? 'text-blue-600 bg-blue-50 after:absolute after:left-0 after:bottom-0 after:w-full after:h-0.5 after:bg-blue-600'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                
                {/* Profile Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 group"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white overflow-hidden">
                      <User className="h-4 w-4" />
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-lg shadow-xl border border-gray-100 transition-all duration-300">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">User Account</p>
                        <p className="text-xs text-gray-500 truncate">user@example.com</p>
                      </div>
                      <Link 
                        to="/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden shadow-lg animate-slideDown">
          <div className="px-2 pt-2 pb-4 space-y-1 bg-white">
            {!token ? (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-3 mt-1 text-base font-medium text-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">User Account</p>
                      <p className="text-sm text-gray-500">user@example.com</p>
                    </div>
                  </div>
                </div>
                <Link
                  to="/"
                  className={`flex items-center space-x-2 px-4 py-3 text-base font-medium rounded-lg ${
                    location.pathname === '/' 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                </Link>
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-2 px-4 py-3 text-base font-medium rounded-lg ${
                    location.pathname === '/dashboard' 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg"
                >
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

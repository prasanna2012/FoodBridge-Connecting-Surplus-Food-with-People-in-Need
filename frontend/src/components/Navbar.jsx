import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Utensils,
  Bell,
  PlusCircle,
  LayoutDashboard,
  LogOut,
  User,
  ShieldCheck,
  Menu,
  X,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (role === 'donor') return '/donor/dashboard';
    if (role === 'ngo') return '/ngo/dashboard';
    if (role === 'admin') return '/admin/dashboard';
    return '/';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-warm-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-brand-800 to-brand-600 bg-clip-text text-transparent">
                FoodBridge
              </span>
              <span className="hidden sm:block text-[10px] tracking-wider uppercase font-semibold text-warm-500 -mt-1">
                Zero Waste · Zero Hunger
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/donations"
              className="text-sm font-medium text-gray-700 hover:text-brand-600 transition"
            >
              Available Food
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium text-gray-700 hover:text-brand-600 transition"
            >
              About & Safety
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-gray-700 hover:text-brand-600 transition"
            >
              Contact Us
            </Link>

            {isAuthenticated && (
              <Link
                to={getDashboardPath()}
                className="text-sm font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1.5 transition"
              >
                <LayoutDashboard className="w-4 h-4" />
                {role === 'donor' && 'Donor Dashboard'}
                {role === 'ngo' && 'NGO Dashboard'}
                {role === 'admin' && 'Admin Portal'}
              </Link>
            )}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-3">
            {/* Quick Action: Donate button for Donors */}
            {isAuthenticated && role === 'donor' && (
              <Link
                to="/donations/add"
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium shadow-sm hover:bg-brand-700 transition"
              >
                <PlusCircle className="w-4 h-4" />
                Post Donation
              </Link>
            )}

            {/* Notification Bell */}
            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-warm-100 transition"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Popover */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-warm-200 overflow-hidden z-50">
                    <div className="p-3.5 bg-warm-50 border-b border-warm-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-900">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="text-xs bg-brand-100 text-brand-800 px-2 py-0.5 rounded-full font-medium">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-brand-600 hover:text-brand-800 font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-warm-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-500">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              if (!n.is_read) markAsRead(n.id);
                              if (n.related_donation_id) {
                                navigate(`/donations/${n.related_donation_id}`);
                                setShowNotifications(false);
                              }
                            }}
                            className={`p-3.5 cursor-pointer text-left hover:bg-warm-50 transition flex items-start gap-3 ${
                              !n.is_read ? 'bg-brand-50/40' : ''
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                !n.is_read ? 'bg-brand-600' : 'bg-transparent'
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-900 truncate">
                                {n.title}
                              </p>
                              <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                                {n.message}
                              </p>
                              <span className="text-[10px] text-gray-400 mt-1 block">
                                {new Date(n.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile / Auth Button */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-warm-100 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs border border-brand-200">
                    {user?.full_name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden sm:inline-block text-xs font-medium text-gray-800 max-w-[100px] truncate">
                    {user?.full_name}
                  </span>
                </button>

                {/* User Menu Popover */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-warm-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-warm-100">
                      <p className="text-xs font-semibold text-gray-900 truncate">
                        {user?.full_name}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-warm-100 text-warm-700">
                        {role} {user?.is_verified ? '✓ Verified' : ''}
                      </span>
                    </div>

                    <Link
                      to={getDashboardPath()}
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-warm-50 transition"
                    >
                      <LayoutDashboard className="w-4 h-4 text-gray-500" />
                      Dashboard
                    </Link>

                    {role === 'donor' && (
                      <Link
                        to="/donations/add"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-warm-50 transition"
                      >
                        <PlusCircle className="w-4 h-4 text-gray-500" />
                        Create Listing
                      </Link>
                    )}

                    <Link
                      to="/history"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-warm-50 transition"
                    >
                      <CheckCircle className="w-4 h-4 text-gray-500" />
                      Donation History
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-brand-600 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs sm:text-sm font-medium bg-brand-600 text-white rounded-xl shadow-sm hover:bg-brand-700 transition"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-warm-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/donations"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-warm-50"
          >
            Available Food
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-warm-50"
          >
            About & Safety
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-warm-50"
          >
            Contact Us
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-brand-700 bg-brand-50"
              >
                Go to Dashboard
              </Link>
              {role === 'donor' && (
                <Link
                  to="/donations/add"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-white bg-brand-600 text-center"
                >
                  + Post Donation
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 border border-warm-300 rounded-xl text-sm font-medium text-gray-700"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium"
              >
                Register Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;


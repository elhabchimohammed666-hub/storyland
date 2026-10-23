import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AvatarIcon from './AvatarIcon';
import { BookOpen, Sparkles, Users, BarChart3, LogOut, Compass, Library, Home } from './Icons';

export const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to={role === 'student' ? '/student' : role === 'teacher' ? '/teacher' : '/'} className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">
              StoryLand
            </span>
            <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase -mt-1">
              AI Story & Reading
            </span>
          </div>
        </Link>

        {/* Navigation Links for Authenticated Users */}
        {user && (
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
            {role === 'teacher' ? (
              <>
                <Link
                  to="/teacher"
                  className={`px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all ${
                    isActive('/teacher')
                      ? 'bg-white text-brand-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Home className="w-4 h-4" /> Overview
                </Link>
                <Link
                  to="/teacher/library"
                  className={`px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all ${
                    isActive('/teacher/library')
                      ? 'bg-white text-brand-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Library className="w-4 h-4" /> Story Library
                </Link>
                <Link
                  to="/teacher/generator"
                  className={`px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all ${
                    isActive('/teacher/generator')
                      ? 'bg-gradient-to-r from-indigo-500 to-brand-500 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-300" /> AI Generator
                </Link>
                <Link
                  to="/teacher/classes"
                  className={`px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all ${
                    isActive('/teacher/classes')
                      ? 'bg-white text-brand-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Users className="w-4 h-4" /> Classes & Students
                </Link>
                <Link
                  to="/teacher/progress"
                  className={`px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all ${
                    isActive('/teacher/progress')
                      ? 'bg-white text-brand-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" /> Reading Progress
                </Link>
              </>
            ) : (
              <Link
                to="/student"
                className={`px-4 py-1.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                  isActive('/student')
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Compass className="w-4 h-4 text-brand-500" /> My Stories & Reading
              </Link>
            )}
          </nav>
        )}

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-2xl">
                <AvatarIcon avatar={user.avatar || (role === 'teacher' ? 'owl' : 'fox')} size="sm" />
                <div className="text-left hidden sm:block">
                  <div className="text-sm font-black text-slate-800 leading-tight flex items-center gap-1.5">
                    {user.name}
                  </div>
                  <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.2 rounded-md bg-brand-100 text-brand-700">
                    {role === 'teacher' ? 'Teacher' : 'Student'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Log out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login/student"
                className="px-3.5 py-2 rounded-xl text-sm font-extrabold text-brand-600 bg-brand-50 hover:bg-brand-100 transition-colors"
              >
                Student Log In
              </Link>
              <Link
                to="/login/teacher"
                className="px-4 py-2 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-sm transition-all shadow-brand-500/20"
              >
                Teacher Portal
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

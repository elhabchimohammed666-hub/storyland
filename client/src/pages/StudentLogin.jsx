import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Smile, KeyRound, User, AlertCircle, ArrowLeft, BookOpen } from '../components/Icons';
import AvatarIcon from '../components/AvatarIcon';

const PRESET_STUDENTS = [
  { name: 'Adam', username: 'adam', avatar: 'bear' },
  { name: 'Sara', username: 'sara', avatar: 'fox' },
  { name: 'Lina', username: 'lina', avatar: 'rabbit' },
  { name: 'Youssef', username: 'youssef', avatar: 'lion' },
  { name: 'Noor', username: 'noor', avatar: 'cat' },
];

export const StudentLogin = () => {
  const [username, setUsername] = useState('adam');
  const [password, setPassword] = useState('student123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginStudent } = useAuth();
  const navigate = useNavigate();

  const handleSelectStudent = (stud) => {
    setUsername(stud.username);
    setPassword('student123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginStudent(username, password);
      navigate('/student');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your username and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border-2 border-amber-200/80 shadow-2xl p-8 relative">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center text-3xl mx-auto mb-3 shadow-sm border border-amber-200">
            🦁
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Login</h1>
          <p className="text-xs text-slate-500 font-bold mt-1">
            Welcome to StoryLand! Ask your teacher for your username.
          </p>
        </div>

        {/* Quick Student Selector Buttons */}
        <div className="mb-6">
          <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2 text-center">
            Or pick your reading avatar:
          </label>
          <div className="flex justify-center gap-2">
            {PRESET_STUDENTS.map((stud) => (
              <button
                key={stud.username}
                type="button"
                onClick={() => handleSelectStudent(stud)}
                className={`p-1.5 rounded-2xl flex flex-col items-center gap-1 transition-all ${
                  username === stud.username
                    ? 'ring-2 ring-amber-400 bg-amber-50 scale-105'
                    : 'hover:bg-slate-50 opacity-75 hover:opacity-100'
                }`}
              >
                <AvatarIcon avatar={stud.avatar} size="sm" />
                <span className="text-[10px] font-black text-slate-700">{stud.name}</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1">My Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-amber-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. adam"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-slate-200 text-base font-extrabold text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 mb-1">My Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-amber-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-slate-200 text-base font-extrabold text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-base shadow-lg shadow-amber-500/30 active:scale-98 transition-all mt-6 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <BookOpen className="w-5 h-5" />
            {loading ? 'Opening StoryLand...' : "Let's Read! 🚀"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs font-bold text-slate-400">
          Demo student password is: <span className="font-mono text-slate-600 font-extrabold">student123</span>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;

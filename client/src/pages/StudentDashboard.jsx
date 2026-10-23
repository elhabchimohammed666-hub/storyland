import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AvatarIcon from '../components/AvatarIcon';
import StoryCard from '../components/StoryCard';
import ProgressBar from '../components/ProgressBar';
import { Sparkles, Star, BookOpen, Trophy, Compass, CheckCircle2, Clock } from '../components/Icons';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [assignedStories, setAssignedStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        const res = await api.get('/progress/student/stories');
        if (res.data.success) {
          setAssignedStories(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  const completedStories = assignedStories.filter((s) => s.status === 'completed');
  const inProgressStories = assignedStories.filter((s) => s.status === 'in_progress');
  const notStartedStories = assignedStories.filter((s) => s.status === 'not_started');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Friendly Student Greeting Banner */}
      <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-kid-pink rounded-3xl p-6 sm:p-10 text-white shadow-xl mb-10 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white/15 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-5 z-10">
          <AvatarIcon avatar={user?.avatar || 'bear'} size="xl" className="shadow-lg border-4 border-white" />
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black mb-2 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-yellow-200" /> Welcome to Your Reading Realm
            </div>
            <h1 className="text-3xl sm:text-4xl font-black drop-shadow-sm">Hello, {user?.name}!</h1>
            <p className="text-white/90 text-sm font-bold mt-1">
              Class: <span className="underline decoration-white/40">{user?.classId?.name || 'Young Readers'}</span> • Keep up the great reading adventure!
            </p>
          </div>
        </div>

        {/* Badges / Motivation Pill */}
        <div className="z-10 flex items-center gap-3 bg-white/20 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/30 shadow-inner">
          <Trophy className="w-8 h-8 text-yellow-200 drop-shadow" />
          <div>
            <span className="block text-2xl font-black">{completedStories.length}</span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-white/90">
              Stories Finished
            </span>
          </div>
        </div>
      </div>

      {/* Reading Progress Quick Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">{inProgressStories.length}</span>
            <span className="block text-xs font-bold text-slate-500">Currently Reading</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">{completedStories.length}</span>
            <span className="block text-xs font-bold text-slate-500">Completed Adventures</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">{notStartedStories.length}</span>
            <span className="block text-xs font-bold text-slate-500">New Stories Waiting</span>
          </div>
        </div>
      </div>

      {/* Main Assigned Stories Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Compass className="w-6 h-6 text-brand-500" /> Assigned Storybooks
            </h2>
            <p className="text-xs text-slate-500 font-bold">Pick any story assigned by your teacher to read or continue</p>
          </div>
          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
            {assignedStories.length} Books
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-400 font-extrabold">Loading your reading library...</div>
        ) : assignedStories.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-black text-slate-800 text-lg mb-1">No books assigned yet</h3>
            <p className="text-xs text-slate-500 font-medium">
              Your teacher will assign new magical stories to your class soon. Check back shortly!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignedStories.map((story) => (
              <StoryCard
                key={story.storyId}
                story={story}
                role="student"
                progress={{
                  status: story.status,
                  progressPercent: story.progressPercent,
                  completedPages: story.completedPages,
                  lastOpenedPage: story.lastOpenedPage,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;

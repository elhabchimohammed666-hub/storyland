import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StoryCard from '../components/StoryCard';
import { Sparkles, Users, BookOpen, BarChart3, PlusCircle, ArrowRight, Library, CheckCircle2 } from '../components/Icons';

export const TeacherDashboard = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clsRes, storyRes] = await Promise.all([
          api.get('/classes'),
          api.get('/stories'),
        ]);

        if (clsRes.data.success) setClasses(clsRes.data.data);
        if (storyRes.data.success) setStories(storyRes.data.data);
      } catch (err) {
        console.error('Failed to load teacher dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalStudents = classes.reduce((acc, c) => acc + (c.studentCount || 0), 0);
  const publishedStories = stories.filter((s) => s.status === 'published');
  const draftStories = stories.filter((s) => s.status === 'draft');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-brand-600 rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold mb-3 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Teacher Control Center
            </div>
            <h1 className="text-3xl sm:text-4xl font-black">Welcome back, {user?.name}!</h1>
            <p className="text-indigo-100 text-sm mt-1 max-w-xl font-medium">
              Create AI-assisted stories in Arabic, French, and English, assign them to your classes, and track your
              students' reading journeys page by page.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/teacher/generator"
              className="py-3 px-5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-sm shadow-lg shadow-amber-400/20 flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-700" />
              Generate Story with AI
            </Link>
            <Link
              to="/teacher/classes"
              className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm backdrop-blur-sm flex items-center gap-2 transition-all"
            >
              <Users className="w-4 h-4" />
              Manage Classes
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">{classes.length}</span>
            <span className="block text-xs font-bold text-slate-500">Active Classes</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">{totalStudents}</span>
            <span className="block text-xs font-bold text-slate-500">Total Students</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">{publishedStories.length}</span>
            <span className="block text-xs font-bold text-slate-500">Published Stories</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Library className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">{draftStories.length}</span>
            <span className="block text-xs font-bold text-slate-500">Drafts to Review</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Recent Stories & Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Stories (2 cols) */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-black text-slate-900">Your Story Library</h2>
              <p className="text-xs text-slate-500 font-medium">Stories created and assigned to your classes</p>
            </div>
            <Link
              to="/teacher/library"
              className="text-xs font-extrabold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View All ({stories.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 font-bold">Loading stories...</div>
          ) : stories.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 mb-1">No stories yet</h3>
              <p className="text-xs text-slate-500 mb-4">Generate your first AI children's story in seconds!</p>
              <Link
                to="/teacher/generator"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                <Sparkles className="w-4 h-4 text-amber-300" /> Generate Now
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {stories.slice(0, 4).map((story) => (
                <StoryCard key={story._id} story={story} role="teacher" />
              ))}
            </div>
          )}
        </div>

        {/* Classes Overview (1 col) */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-black text-slate-900">My Classes</h2>
              <p className="text-xs text-slate-500 font-medium">Classrooms under your supervision</p>
            </div>
            <Link
              to="/teacher/classes"
              className="text-xs font-extrabold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {classes.map((cls) => (
              <div
                key={cls._id}
                className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-extrabold text-slate-900 text-base">{cls.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700">
                      Age {cls.targetAge || 8}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-4">
                    {cls.description || 'No description provided.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-500" /> {cls.studentCount || 0} Students
                  </span>
                  <Link
                    to={`/teacher/progress?classId=${cls._id}`}
                    className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-extrabold"
                  >
                    View Progress <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}

            <Link
              to="/teacher/classes"
              className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-400 text-slate-600 hover:text-indigo-600 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <PlusCircle className="w-4 h-4" /> Add a New Class
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;

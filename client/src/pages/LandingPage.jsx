import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, BookOpen, Users, Compass, Star, Heart, ShieldCheck, ArrowRight, CheckCircle2 } from '../components/Icons';

export const LandingPage = () => {
  const { loginTeacher, loginStudent } = useAuth();
  const navigate = useNavigate();

  const handleDemoTeacher = async () => {
    try {
      await loginTeacher('teacher@storyland.com', 'Teacher123!');
      navigate('/teacher');
    } catch (err) {
      alert('Error logging in demo teacher: ' + err.message);
    }
  };

  const handleDemoStudent = async (username) => {
    try {
      await loginStudent(username, 'student123');
      navigate('/student');
    } catch (err) {
      alert('Error logging in demo student: ' + err.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto pt-6 pb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-sm font-extrabold mb-6 shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>AI-Powered Storytelling & Reading Platform (MERN)</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
          Where Young Imaginations{' '}
          <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Come to Life
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 font-medium leading-relaxed mb-8">
          StoryLand empowers teachers to create safe, engaging, multilingual stories with AI and track student reading
          progress page-by-page in a colorful, child-friendly world.
        </p>

        {/* Quick Demo Login Pill Bar */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-5 shadow-lg max-w-2xl mx-auto mb-12">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-3">
            ⚡ Instant One-Click Demo Access
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button
              onClick={handleDemoTeacher}
              className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2"
            >
              👩‍🏫 Teacher (Ms. Clara)
            </button>
            <button
              onClick={() => handleDemoStudent('adam')}
              className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow-md shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              🐻 Adam (50% progress)
            </button>
            <button
              onClick={() => handleDemoStudent('sara')}
              className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              🦊 Sara (100% completed)
            </button>
            <button
              onClick={() => handleDemoStudent('youssef')}
              className="px-4 py-2 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-sm shadow-md shadow-sky-500/20 transition-all flex items-center gap-2"
            >
              🦁 Youssef (New reader)
            </button>
          </div>
        </div>
      </div>

      {/* Role Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full mb-16">
        {/* Student Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-amber-100 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
          <div>
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center text-3xl mb-6 shadow-sm border border-amber-200">
              🦊
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Student Space</h2>
            <p className="text-slate-600 text-sm font-medium mb-6">
              Enter your class username and password to open your assigned magical storybooks, read page-by-page, and track
              your reading stars!
            </p>

            <ul className="space-y-2 mb-8 text-xs font-bold text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Page-by-page playful reading interface
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Automatic resume from where you stopped
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Arabic, French, and English stories
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Audio read-aloud support
              </li>
            </ul>
          </div>

          <Link
            to="/login/student"
            className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-center flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all"
          >
            Enter Student Reading Room <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Teacher Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-indigo-100 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
          <div>
            <div className="w-16 h-16 rounded-3xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-3xl mb-6 shadow-sm border border-indigo-200">
              🦉
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Teacher Portal</h2>
            <p className="text-slate-600 text-sm font-medium mb-6">
              Generate custom stories with AI, review and adapt text, manage classes and student accounts, and monitor
              student reading completion in real time.
            </p>

            <ul className="space-y-2 mb-8 text-xs font-bold text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-500" /> Generate 5, 8, 10, 13, or 15 page stories
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-500" /> Draft review, edit & child safety checks
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-500" /> One-click AI translation (EN, FR, AR)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-500" /> Class reading progress dashboard & analytics
              </li>
            </ul>
          </div>

          <Link
            to="/login/teacher"
            className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-center flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
          >
            Sign In / Register as Teacher <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Feature Highlights Footer */}
      <div className="border-t border-slate-200 pt-8 pb-4 text-center text-xs font-bold text-slate-400">
        StoryLand MERN Stack Platform • MongoDB • Express.js • React • Node.js • Google Gemini AI
      </div>
    </div>
  );
};

export default LandingPage;

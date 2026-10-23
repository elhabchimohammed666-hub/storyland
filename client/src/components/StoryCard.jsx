import React from 'react';
import { Link } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import { BookOpen, Users, Globe, Sparkles, Languages, CheckCircle2, Clock, PlayCircle } from './Icons';

const LANGUAGE_LABELS = {
  en: { label: 'English', flag: '🇬🇧', dir: 'ltr' },
  fr: { label: 'Français', flag: '🇫🇷', dir: 'ltr' },
  ar: { label: 'العربية', flag: '🇸🇦', dir: 'rtl' },
};

const CATEGORY_COLORS = {
  Adventure: 'from-amber-400 to-orange-500 text-amber-900',
  Friendship: 'from-pink-400 to-rose-500 text-pink-900',
  Animals: 'from-emerald-400 to-teal-500 text-emerald-900',
  Nature: 'from-green-400 to-emerald-600 text-green-900',
  Kindness: 'from-purple-400 to-indigo-500 text-purple-900',
  Science: 'from-sky-400 to-blue-600 text-sky-900',
  Fantasy: 'from-violet-400 to-purple-600 text-violet-900',
  Other: 'from-slate-400 to-slate-600 text-slate-900',
};

export const StoryCard = ({
  story,
  role = 'teacher',
  progress = null,
  onAssign = null,
  onTranslate = null,
  onDelete = null,
}) => {
  const lang = LANGUAGE_LABELS[story.language] || LANGUAGE_LABELS.en;
  const isArabic = story.language === 'ar';
  const categoryGrad = CATEGORY_COLORS[story.category] || CATEGORY_COLORS.Adventure;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group hover:-translate-y-1">
      {/* Decorative Cover Banner */}
      <div className={`h-28 bg-gradient-to-tr ${categoryGrad} p-4 flex flex-col justify-between relative overflow-hidden`}>
        <div className="absolute -right-4 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex justify-between items-start z-10">
          {/* Status / Category Badges */}
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-white/90 shadow-sm text-slate-800 backdrop-blur-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            {story.category || 'Story'}
          </span>

          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-black/20 text-white backdrop-blur-sm">
              Age {story.targetAge}+
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/90 text-slate-700 shadow-sm">
              {lang.flag} {lang.label}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between z-10 text-white text-xs font-extrabold drop-shadow">
          <span className="flex items-center gap-1 bg-black/25 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
            <BookOpen className="w-3.5 h-3.5" /> {story.pageCount || (story.pages && story.pages.length)} Pages
          </span>
          {role === 'teacher' && (
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                story.status === 'published'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-amber-400 text-amber-950 shadow-sm'
              }`}
            >
              {story.status}
            </span>
          )}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3
            className={`font-black text-lg text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1 mb-1.5 ${
              isArabic ? 'font-arabic text-right' : ''
            }`}
            dir={isArabic ? 'rtl' : 'ltr'}
          >
            {story.title}
          </h3>
          <p className="text-xs text-slate-500 font-medium mb-4 line-clamp-2">
            Theme: <span className="font-semibold text-slate-700">{story.theme}</span>
          </p>

          {/* Student Reading Progress Info if present */}
          {progress && (
            <div className="mb-4 bg-slate-50 border border-slate-100 p-3 rounded-2xl">
              <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
                <span className="text-slate-600">
                  {progress.status === 'completed' ? (
                    <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                    </span>
                  ) : progress.status === 'in_progress' ? (
                    <span className="text-amber-600 font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Page {progress.lastOpenedPage} of {story.pageCount || story.totalPages}
                    </span>
                  ) : (
                    <span className="text-slate-500">Not started yet</span>
                  )}
                </span>
                <span className="font-extrabold text-slate-800">{progress.progressPercent}%</span>
              </div>
              <ProgressBar percent={progress.progressPercent} showLabel={false} size="sm" />
            </div>
          )}

          {/* Teacher metadata: assigned classes */}
          {role === 'teacher' && story.assignedClasses && (
            <div className="mb-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Assigned Classes:
              </span>
              <div className="flex flex-wrap gap-1">
                {story.assignedClasses.length > 0 ? (
                  story.assignedClasses.map((cls, idx) => (
                    <span
                      key={cls._id || idx}
                      className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-xs font-bold"
                    >
                      {cls.name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">Not assigned to any class yet</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {role === 'student' ? (
            <Link
              to={`/student/read/${story._id || story.storyId}`}
              className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-brand-500/20 active:scale-98 transition-all"
            >
              <PlayCircle className="w-4 h-4" />
              {progress?.status === 'completed'
                ? 'Read Again 🌟'
                : progress?.status === 'in_progress'
                ? `Resume (Page ${progress.lastOpenedPage}) 🚀`
                : 'Start Reading 📖'}
            </Link>
          ) : (
            <div className="w-full flex items-center justify-between gap-1.5">
              <Link
                to={`/teacher/story/${story._id}`}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold text-center transition-colors"
              >
                {story.status === 'draft' ? 'Review & Edit' : 'View Story'}
              </Link>

              {story.status === 'published' && onAssign && (
                <button
                  onClick={() => onAssign(story)}
                  className="py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-extrabold flex items-center gap-1 transition-colors"
                  title="Assign to Classes"
                >
                  <Users className="w-3.5 h-3.5" /> Assign
                </button>
              )}

              {onTranslate && (
                <button
                  onClick={() => onTranslate(story)}
                  className="py-2 px-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold flex items-center gap-1 transition-colors"
                  title="Translate Story with AI"
                >
                  <Languages className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryCard;

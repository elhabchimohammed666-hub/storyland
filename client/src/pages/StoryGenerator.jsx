import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Sparkles, BookOpen, Wand2, AlertCircle, CheckCircle2, ShieldCheck, Languages } from '../components/Icons';

const PRESET_THEMES = [
  { name: 'Friendship and Teamwork', icon: '🤝', category: 'Friendship' },
  { name: 'Enchanted Forest Quest', icon: '🌲', category: 'Adventure' },
  { name: 'Curious Robot in Nature', icon: '🤖', category: 'Science' },
  { name: 'The Little Lost Animal', icon: '🐾', category: 'Animals' },
  { name: 'Ocean Secrets & Coral', icon: '🌊', category: 'Nature' },
  { name: 'Acts of Kindness in the Village', icon: '❤️', category: 'Kindness' },
];

export const StoryGenerator = () => {
  const [theme, setTheme] = useState('Friendship and Teamwork');
  const [targetAge, setTargetAge] = useState(8);
  const [language, setLanguage] = useState('en');
  const [pageCount, setPageCount] = useState(10);
  const [category, setCategory] = useState('Friendship');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/stories/generate', {
        theme,
        targetAge: Number(targetAge),
        language,
        pageCount: Number(pageCount),
        category,
      });

      if (res.data.success) {
        // Navigate to story review/edit page
        navigate(`/teacher/story/${res.data.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> AI Story Crafter
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Generate an Original Children's Story</h1>
        <p className="text-sm text-slate-600 font-medium max-w-xl mx-auto mt-2">
          Choose a theme, target age, language, and exact page count. Every generated story is saved as a Draft for your
          review and safety check before publishing.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Generator Form */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-10 relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-4" />
            <h3 className="text-lg font-black text-slate-900">Crafting your story with AI...</h3>
            <p className="text-xs text-slate-500 font-medium max-w-md mt-1">
              Writing {pageCount} ordered pages in {language === 'fr' ? 'French' : language === 'ar' ? 'Arabic' : 'English'} for age {targetAge}, validating child-safety guidelines and narrative consistency.
            </p>
          </div>
        )}

        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Quick Preset Theme Pills */}
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
              Popular Inspiring Themes:
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_THEMES.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => {
                    setTheme(item.name);
                    setCategory(item.category);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    theme === item.name
                      ? 'bg-indigo-600 text-white shadow-sm scale-102'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{item.icon}</span> {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Input */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
              Story Theme or Topic
            </label>
            <input
              type="text"
              required
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g. Friendship, Space Journey, Forest Animals, Kindness..."
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 text-base font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Grid: Target Age & Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Target Age Group
              </label>
              <select
                value={targetAge}
                onChange={(e) => setTargetAge(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                {[5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((age) => (
                  <option key={age} value={age}>
                    {age} years old
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">
                AI adjusts vocabulary and sentence structure to fit this age.
              </span>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Story Language
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { code: 'en', label: 'English', flag: '🇬🇧' },
                  { code: 'fr', label: 'Français', flag: '🇫🇷' },
                  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
                ].map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLanguage(l.code)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-extrabold flex flex-col items-center justify-center gap-1 transition-all ${
                      language === l.code
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="text-lg">{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Page Count selection (Strict PDF: 5, 8, 10, 13, 15) */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
              Number of Pages (PDF Specification)
            </label>
            <div className="grid grid-cols-5 gap-2 sm:gap-4">
              {[5, 8, 10, 13, 15].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setPageCount(count)}
                  className={`py-3 px-2 rounded-2xl border-2 text-center transition-all ${
                    pageCount === count
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 font-black shadow-sm ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 font-bold'
                  }`}
                >
                  <span className="block text-lg font-black">{count}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Pages</span>
                </button>
              ))}
            </div>
            <span className="text-[11px] text-slate-400 mt-1.5 block">
              The AI generates exactly {pageCount} ordered, coherent pages with beginning, climax, and comforting ending.
            </span>
          </div>

          {/* Child Safety & Teacher Approval Notice */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 leading-relaxed">
              <span className="font-extrabold block">Child Safety & Review Assurance:</span>
              All stories undergo automatic content filtering and will remain as <strong>Draft</strong> until you review
              and publish them for your students.
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-brand-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-black text-base shadow-xl shadow-indigo-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Wand2 className="w-5 h-5 text-amber-300" />
            Generate Story ({pageCount} Pages)
          </button>
        </form>
      </div>
    </div>
  );
};

export default StoryGenerator;

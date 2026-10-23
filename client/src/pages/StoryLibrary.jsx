import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StoryCard from '../components/StoryCard';
import { Search, Filter, Sparkles, Plus, BookOpen, AlertCircle, Users, Languages, X } from '../components/Icons';

const CATEGORIES = ['All', 'Adventure', 'Friendship', 'Animals', 'Nature', 'Kindness', 'Science'];

export const StoryLibrary = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [error, setError] = useState('');

  // Assign Modal
  const [assignStoryTarget, setAssignStoryTarget] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);

  // Translate Modal
  const [translateStoryTarget, setTranslateStoryTarget] = useState(null);
  const [targetLang, setTargetLang] = useState('fr');
  const [translating, setTranslating] = useState(false);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (languageFilter) params.language = languageFilter;
      if (categoryFilter && categoryFilter !== 'All') params.category = categoryFilter;

      const res = await api.get('/stories', { params });
      if (res.data.success) {
        setStories(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      if (res.data.success) {
        setClasses(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStories();
    fetchClasses();
  }, [statusFilter, languageFilter, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStories();
  };

  const openAssignModal = (story) => {
    setAssignStoryTarget(story);
    setSelectedClasses(story.assignedClasses?.map((c) => c._id) || []);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (selectedClasses.length === 0) {
      alert('Please select at least one class.');
      return;
    }
    try {
      const res = await api.post(`/stories/${assignStoryTarget._id}/assign`, { classIds: selectedClasses });
      if (res.data.success) {
        setAssignStoryTarget(null);
        fetchStories();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Assignment failed');
    }
  };

  const openTranslateModal = (story) => {
    setTranslateStoryTarget(story);
    setTargetLang(story.language === 'en' ? 'fr' : 'en');
  };

  const handleTranslateSubmit = async () => {
    setTranslating(true);
    try {
      const res = await api.post(`/stories/${translateStoryTarget._id}/translate`, {
        targetLanguage: targetLang,
      });
      if (res.data.success) {
        setTranslateStoryTarget(null);
        fetchStories();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Translation failed');
    } finally {
      setTranslating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Story Library & Management</h1>
          <p className="text-sm text-slate-500 font-medium">
            Search, filter, edit, translate, and assign stories to your classes
          </p>
        </div>
        <Link
          to="/teacher/generator"
          className="py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all"
        >
          <Sparkles className="w-4 h-4 text-amber-300" /> Generate New Story
        </Link>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 mb-8 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stories by title or theme..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-black"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
          {/* Category Chips */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider mr-1">Category:</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  categoryFilter === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Language & Status Selectors */}
          <div className="flex items-center gap-2">
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Languages</option>
              <option value="en">🇬🇧 English</option>
              <option value="fr">🇫🇷 French</option>
              <option value="ar">🇸🇦 Arabic</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stories Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 font-bold">Loading stories...</div>
      ) : stories.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-extrabold text-slate-800 text-base mb-1">No stories found</h3>
          <p className="text-xs text-slate-500 mb-6">Try clearing your filters or generate a new story with AI.</p>
          <Link
            to="/teacher/generator"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-black shadow-md shadow-indigo-600/20"
          >
            <Sparkles className="w-4 h-4 text-amber-300" /> Generate First Story
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <StoryCard
              key={story._id}
              story={story}
              role="teacher"
              onAssign={openAssignModal}
              onTranslate={openTranslateModal}
            />
          ))}
        </div>
      )}

      {/* Assign Modal */}
      {assignStoryTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setAssignStoryTarget(null)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black text-slate-900 mb-1">Assign Story</h3>
            <p className="text-xs text-slate-500 mb-4 font-bold">"{assignStoryTarget.title}"</p>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {classes.map((cls) => {
                  const checked = selectedClasses.includes(cls._id);
                  return (
                    <label
                      key={cls._id}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        checked
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-600/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <span className="font-extrabold text-sm block">{cls.name}</span>
                        <span className="text-xs text-slate-500">
                          {cls.studentCount || 0} students • Age {cls.targetAge || 8}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedClasses([...selectedClasses, cls._id]);
                          } else {
                            setSelectedClasses(selectedClasses.filter((cid) => cid !== cls._id));
                          }
                        }}
                        className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                    </label>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setAssignStoryTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
                >
                  Save Assignments
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Translate Modal */}
      {translateStoryTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setTranslateStoryTarget(null)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black text-slate-900 mb-1">Translate Story with AI</h3>
            <p className="text-xs text-slate-500 mb-4 font-bold">"{translateStoryTarget.title}"</p>

            <div className="space-y-3 mb-6">
              {[
                { code: 'en', label: 'English', flag: '🇬🇧' },
                { code: 'fr', label: 'Français', flag: '🇫🇷' },
                { code: 'ar', label: 'العربية (Arabic)', flag: '🇸🇦' },
              ]
                .filter((l) => l.code !== translateStoryTarget.language)
                .map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setTargetLang(l.code)}
                    className={`w-full p-3.5 rounded-2xl border text-sm font-bold flex items-center justify-between transition-all ${
                      targetLang === l.code
                        ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-600/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-xl">{l.flag}</span>
                      <span>{l.label}</span>
                    </span>
                  </button>
                ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setTranslateStoryTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTranslateSubmit}
                disabled={translating}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20"
              >
                {translating ? 'Translating...' : 'Translate & Create Draft'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryLibrary;

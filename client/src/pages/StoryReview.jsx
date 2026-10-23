import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import {
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Save,
  Globe,
  Share2,
  Users,
  AlertCircle,
  FileText,
  Lock,
  Languages,
} from '../components/Icons';

export const StoryReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [story, setStory] = useState(null);
  const [title, setTitle] = useState('');
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Translation Modal
  const [showTranslateModal, setShowTranslateModal] = useState(false);
  const [targetLang, setTargetLang] = useState('fr');
  const [translating, setTranslating] = useState(false);

  // Assign Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);

  const fetchStory = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/stories/${id}`);
      if (res.data.success) {
        const s = res.data.data;
        setStory(s);
        setTitle(s.title);
        setPages(s.pages || []);
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
      console.error('Failed to load classes', err);
    }
  };

  useEffect(() => {
    fetchStory();
    fetchClasses();
  }, [id]);

  const handlePageContentChange = (index, value) => {
    const updated = [...pages];
    updated[index].content = value;
    setPages(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const res = await api.put(`/stories/${id}`, {
        title,
        pages,
      });

      if (res.data.success) {
        setStory(res.data.data);
        setMessage('Story changes saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await api.patch(`/stories/${id}/publish`);
      if (res.data.success) {
        setStory(res.data.data);
        setMessage('Story published! You can now assign it to your classes.');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTranslate = async () => {
    setTranslating(true);
    setError('');
    try {
      const res = await api.post(`/stories/${id}/translate`, { targetLanguage: targetLang });
      if (res.data.success) {
        setShowTranslateModal(false);
        navigate(`/teacher/story/${res.data.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setTranslating(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (selectedClasses.length === 0) {
      alert('Please select at least one class');
      return;
    }

    try {
      const res = await api.post(`/stories/${id}/assign`, { classIds: selectedClasses });
      if (res.data.success) {
        setShowAssignModal(false);
        fetchStory();
        setMessage(`Story successfully assigned to ${selectedClasses.length} class(es)!`);
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Assignment failed');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500 font-bold">Loading story review...</div>;
  }

  if (!story) {
    return <div className="p-12 text-center text-rose-500 font-bold">Story not found.</div>;
  }

  const isArabic = story.language === 'ar';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <Link
          to="/teacher/library"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Story Library
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {story.status === 'draft' ? (
            <button
              onClick={handlePublish}
              disabled={saving}
              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" /> Approve & Publish Story
            </button>
          ) : (
            <button
              onClick={() => {
                setSelectedClasses(story.assignedClasses?.map((c) => c._id) || []);
                setShowAssignModal(true);
              }}
              className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
            >
              <Users className="w-4 h-4" /> Assign to Classes
            </button>
          )}

          <button
            onClick={() => setShowTranslateModal(true)}
            className="py-2.5 px-3.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Languages className="w-4 h-4" /> Translate with AI
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Edits'}
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Story Metadata & Title Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                story.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              Status: {story.status}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
              {story.language === 'fr' ? '🇫🇷 French' : story.language === 'ar' ? '🇸🇦 Arabic' : '🇬🇧 English'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
              Age {story.targetAge}+
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
              {pages.length} Pages
            </span>
          </div>

          {story.hasActiveReaders && (
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              <Lock className="w-3.5 h-3.5" /> Students actively reading (Structure Locked)
            </div>
          )}
        </div>

        {/* Editable Title */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1">Story Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full px-4 py-3 rounded-2xl border-2 border-slate-200 text-xl font-black text-slate-900 focus:outline-none focus:border-indigo-500 ${
              isArabic ? 'font-arabic text-right' : ''
            }`}
            dir={isArabic ? 'rtl' : 'ltr'}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-xs font-bold text-slate-500">
          <span>Theme: <strong className="text-slate-700">{story.theme}</strong></span>
          <span>Category: <strong className="text-slate-700">{story.category}</strong></span>
          {story.assignedClasses?.length > 0 && (
            <span>
              Assigned to: <strong className="text-indigo-600">{story.assignedClasses.map((c) => c.name).join(', ')}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Pages Review & Editor List */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" /> Story Pages ({pages.length})
          </h2>
          <span className="text-xs font-bold text-slate-400">
            Click into any page text to adjust words for your pupils
          </span>
        </div>

        {pages.map((p, idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 hover:border-slate-300 transition-all"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-black">
                Page {p.pageNumber} of {pages.length}
              </span>
              {p.scenePrompt && (
                <span className="text-[11px] font-semibold text-slate-400 italic line-clamp-1 max-w-md">
                  Scene: {p.scenePrompt}
                </span>
              )}
            </div>

            <textarea
              rows={3}
              value={p.content}
              onChange={(e) => handlePageContentChange(idx, e.target.value)}
              className={`w-full p-4 rounded-2xl border border-slate-200 text-base leading-relaxed text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                isArabic ? 'font-arabic text-right text-lg leading-loose' : ''
              }`}
              dir={isArabic ? 'rtl' : 'ltr'}
            />
          </div>
        ))}
      </div>

      {/* Modal: Translate Story */}
      {showTranslateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-xl font-black text-slate-900 mb-2">Translate Story with AI</h3>
            <p className="text-xs text-slate-500 mb-5">
              Creates an age-appropriate adaptation in another language as a new Draft for your review.
            </p>

            <div className="space-y-3 mb-6">
              {[
                { code: 'en', label: 'English', flag: '🇬🇧' },
                { code: 'fr', label: 'Français', flag: '🇫🇷' },
                { code: 'ar', label: 'العربية (Arabic)', flag: '🇸🇦' },
              ]
                .filter((l) => l.code !== story.language)
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
                    {targetLang === l.code && <CheckCircle2 className="w-5 h-5 text-purple-600" />}
                  </button>
                ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowTranslateModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTranslate}
                disabled={translating}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 flex items-center gap-1.5"
              >
                {translating ? 'Translating...' : 'Translate & Create Draft'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Assign Story to Classes */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-xl font-black text-slate-900 mb-2">Assign Story to Classrooms</h3>
            <p className="text-xs text-slate-500 mb-4">
              Select which classes should have this story in their reading library:
            </p>

            <form onSubmit={handleAssign} className="space-y-4">
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
                  onClick={() => setShowAssignModal(false)}
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
    </div>
  );
};

export default StoryReview;

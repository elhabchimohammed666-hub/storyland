import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import api from '../services/api';
import ProgressBar from '../components/ProgressBar';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Volume2,
  VolumeX,
  Printer,
  Sparkles,
  Trophy,
  BookOpen,
  RotateCcw,
  AArrowUp,
  AArrowDown,
} from '../components/Icons';

export const ReadingView = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();

  const [story, setStory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [completedPages, setCompletedPages] = useState([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [status, setStatus] = useState('not_started');
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState('');

  // Audio / Speech Synthesis
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynthRef = useRef(null);

  // Font size control for accessibility
  const [fontSize, setFontSize] = useState('normal'); // 'normal' | 'large' | 'xlarge'

  // Completion celebratory banner
  const [showCelebration, setShowCelebration] = useState(false);

  // Fetch story and progress
  useEffect(() => {
    const fetchStoryAndProgress = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/progress/student/story/${storyId}`);
        if (res.data.success) {
          const { story: s, progress: p } = res.data.data;
          setStory(s);
          setCompletedPages(p.completedPages || []);
          setProgressPercent(p.progressPercent || 0);
          setStatus(p.status || 'not_started');

          // Automatic Resume: Set current page to lastOpenedPage!
          const resumePage = p.lastOpenedPage && p.lastOpenedPage <= s.pageCount ? p.lastOpenedPage : 1;
          setCurrentPage(resumePage);

          // Update backend about the opened page (does NOT mark complete!)
          await api.post(`/progress/student/story/${storyId}/open-page`, { pageNumber: resumePage });
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStoryAndProgress();

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [storyId]);

  // Handle page change (updates lastOpenedPage on backend)
  const handlePageChange = async (newPage) => {
    if (!story || newPage < 1 || newPage > story.pageCount) return;

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    setCurrentPage(newPage);

    // Save lastOpenedPage independently of completion
    try {
      await api.post(`/progress/student/story/${storyId}/open-page`, { pageNumber: newPage });
    } catch (err) {
      console.warn('Failed to save last opened page:', err);
    }
  };

  // Explicit mark page as completed
  const handleMarkCompleted = async () => {
    if (!story || marking) return;
    setMarking(true);

    try {
      const res = await api.post(`/progress/student/story/${storyId}/complete-page`, {
        pageNumber: currentPage,
      });

      if (res.data.success) {
        const d = res.data.data;
        setCompletedPages(d.completedPages);
        setProgressPercent(d.progressPercent);
        setStatus(d.status);

        // If story newly completed, trigger confetti!
        if (d.status === 'completed') {
          triggerCelebrationConfetti();
          setShowCelebration(true);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update page completion');
    } finally {
      setMarking(false);
    }
  };

  // Confetti trigger
  const triggerCelebrationConfetti = () => {
    try {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6'],
      });
    } catch (e) {
      console.log('Confetti not available', e);
    }
  };

  // Text to Speech
  const toggleSpeech = () => {
    if (!window.speechSynthesis || !story) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const currentText = story.pages[currentPage - 1]?.content;
    if (!currentText) return;

    const utterance = new SpeechSynthesisUtterance(currentText);

    // Set voice language
    if (story.language === 'fr') utterance.lang = 'fr-FR';
    else if (story.language === 'ar') utterance.lang = 'ar-SA';
    else utterance.lang = 'en-US';

    utterance.rate = 0.9; // Friendly gentle pace for young readers

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Print Story feature for offline reading
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-amber-300 border-t-amber-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-800">Opening Your Storybook...</h2>
          <p className="text-xs text-slate-500 font-bold mt-1">Getting your pages ready!</p>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center text-2xl mx-auto mb-4">
          ⚠️
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">Oops! Couldn't open story</h2>
        <p className="text-xs text-slate-500 font-bold mb-6">{error || 'Story not available.'}</p>
        <Link
          to="/student"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-600 text-white font-extrabold text-sm shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Books
        </Link>
      </div>
    );
  }

  const isArabic = story.language === 'ar';
  const pageData = story.pages[currentPage - 1];
  const isPageCompleted = completedPages.includes(currentPage);

  const fontSizeClasses = {
    normal: 'text-xl sm:text-2xl leading-relaxed sm:leading-loose',
    large: 'text-2xl sm:text-3xl leading-relaxed sm:leading-loose',
    xlarge: 'text-3xl sm:text-4xl leading-relaxed sm:leading-loose',
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col justify-between">
      {/* Top Controls Bar */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-sm p-3.5 mb-6 flex items-center justify-between gap-4">
        <Link
          to="/student"
          className="inline-flex items-center gap-1.5 text-xs font-black text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> My Bookshelf
        </Link>

        {/* Center Progress Bar */}
        <div className="flex-1 max-w-xs hidden sm:block">
          <ProgressBar percent={progressPercent} showLabel={true} size="sm" />
        </div>

        {/* Accessibility & Audio Controls */}
        <div className="flex items-center gap-2">
          {/* Read Aloud button */}
          <button
            onClick={toggleSpeech}
            className={`p-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
              isSpeaking
                ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300 animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title={isSpeaking ? 'Stop read aloud' : 'Read aloud with friendly voice'}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-600" />}
            <span className="hidden md:inline">{isSpeaking ? 'Stop' : 'Listen'}</span>
          </button>

          {/* Font Size Toggle */}
          <div className="flex items-center bg-slate-100 rounded-xl p-0.5">
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-1 rounded-lg text-xs font-extrabold ${
                fontSize === 'normal' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
              title="Normal text size"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-1 rounded-lg text-sm font-extrabold ${
                fontSize === 'large' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
              title="Larger text size"
            >
              A+
            </button>
          </div>

          {/* Print/Download Story */}
          <button
            onClick={handlePrint}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title="Print or Save PDF for offline reading"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Story Title & Header */}
      <div className="text-center mb-6">
        <h1
          className={`text-2xl sm:text-3xl font-black text-slate-900 tracking-tight ${
            isArabic ? 'font-arabic' : ''
          }`}
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          {story.title}
        </h1>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700">
            Page {currentPage} of {story.pageCount}
          </span>
          {isPageCompleted && (
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Read
            </span>
          )}
        </div>
      </div>

      {/* Storybook Main Page Card */}
      <div className="bg-amber-50/40 rounded-3xl border-4 border-amber-200/90 shadow-2xl p-6 sm:p-12 mb-6 relative overflow-hidden flex flex-col justify-between min-h-[380px]">
        {/* Decorative corner bookmarks */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-200/60 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-amber-200/60 to-transparent pointer-events-none" />

        {/* Scene illustration description if present */}
        {pageData?.scenePrompt && (
          <div className="mb-6 p-3 bg-white/70 backdrop-blur-sm rounded-2xl border border-amber-200/60 text-xs font-bold text-amber-800 flex items-center gap-2 max-w-lg mx-auto">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="italic">Scene: {pageData.scenePrompt}</span>
          </div>
        )}

        {/* The Page Text Content */}
        <div className="my-auto py-6">
          <p
            className={`font-semibold text-slate-800 ${fontSizeClasses[fontSize]} ${
              isArabic ? 'font-arabic text-right text-2xl sm:text-3xl leading-loose font-bold' : ''
            }`}
            dir={isArabic ? 'rtl' : 'ltr'}
          >
            {pageData?.content}
          </p>
        </div>

        {/* Explicit Mark as Read Toggle Button */}
        <div className="pt-6 border-t border-amber-200/70 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-bold text-slate-500">
            {isPageCompleted ? (
              <span className="text-emerald-600 font-black flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> You have read this page!
              </span>
            ) : (
              <span>Finished reading this page? Mark it complete below!</span>
            )}
          </div>

          <button
            onClick={handleMarkCompleted}
            disabled={marking}
            className={`py-3 px-6 rounded-2xl font-black text-sm flex items-center gap-2 transition-all shadow-md active:scale-95 ${
              isPageCompleted
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 ring-2 ring-emerald-300'
                : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            {isPageCompleted ? 'Page Completed ✓' : 'Mark Page as Completed ⭐'}
          </button>
        </div>
      </div>

      {/* Page Navigation Bottom Controls */}
      <div
        className={`flex items-center justify-between gap-4 ${isArabic ? 'flex-row-reverse' : ''}`}
      >
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="py-3 px-5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-extrabold text-sm shadow-sm hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-2 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Previous Page</span>
        </button>

        {/* Page Dots Indicator */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2">
          {story.pages.map((p) => {
            const isRead = completedPages.includes(p.pageNumber);
            const isCurrent = p.pageNumber === currentPage;
            return (
              <button
                key={p.pageNumber}
                onClick={() => handlePageChange(p.pageNumber)}
                className={`w-3.5 h-3.5 rounded-full transition-all ${
                  isCurrent
                    ? 'w-8 bg-indigo-600 ring-2 ring-indigo-400'
                    : isRead
                    ? 'bg-emerald-400'
                    : 'bg-slate-300 hover:bg-slate-400'
                }`}
                title={`Page ${p.pageNumber} (${isRead ? 'Completed' : 'Not completed'})`}
              />
            );
          })}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= story.pageCount}
          className="py-3 px-5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-extrabold text-sm shadow-sm hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-2 transition-all"
        >
          <span>Next Page</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Celebration Modal when Story is 100% Completed */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl relative border-4 border-amber-300 animate-bounce-slow">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-white flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg shadow-amber-400/40">
              🏆
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Congratulations! 🎉</h2>
            <p className="text-slate-600 text-sm font-bold mb-6">
              You completed all {story.pageCount} pages of <strong>"{story.title}"</strong>! You are a reading champion!
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowCelebration(false)}
                className="py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs"
              >
                Keep Exploring
              </button>
              <Link
                to="/student"
                className="py-3 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md shadow-amber-500/25"
              >
                Back to My Bookshelf 🌟
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Printable View (Hidden on screen, visible during window.print()) */}
      <div className="hidden print:block fixed inset-0 bg-white p-8 z-[9999] overflow-auto">
        <h1 className="text-3xl font-bold mb-2 text-center">{story.title}</h1>
        <p className="text-center text-sm text-slate-500 mb-8">
          StoryLand • Theme: {story.theme} • Target Age: {story.targetAge}+
        </p>
        <div className="space-y-6">
          {story.pages.map((p) => (
            <div key={p.pageNumber} className="border-b pb-4">
              <h3 className="font-bold text-sm text-slate-600 mb-1">Page {p.pageNumber}:</h3>
              <p className="text-base leading-relaxed">{p.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReadingView;

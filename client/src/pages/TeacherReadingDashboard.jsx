import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import AvatarIcon from '../components/AvatarIcon';
import ProgressBar from '../components/ProgressBar';
import { BarChart3, Users, BookOpen, CheckCircle2, Clock, HelpCircle, ArrowRight, AlertCircle } from '../components/Icons';

export const TeacherReadingDashboard = () => {
  const [searchParams] = useSearchParams();
  const initialClassId = searchParams.get('classId');

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(initialClassId || '');
  const [stories, setStories] = useState([]);
  const [selectedStoryId, setSelectedStoryId] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Fetch Teacher's Classes
  useEffect(() => {
    const fetchClassesAndStories = async () => {
      try {
        setLoading(true);
        const [clsRes, storyRes] = await Promise.all([
          api.get('/classes'),
          api.get('/stories?status=published'),
        ]);

        if (clsRes.data.success) {
          setClasses(clsRes.data.data);
          if (clsRes.data.data.length > 0) {
            const classToSelect = initialClassId && clsRes.data.data.some((c) => c._id === initialClassId)
              ? initialClassId
              : clsRes.data.data[0]._id;
            setSelectedClassId(classToSelect);
          }
        }

        if (storyRes.data.success) {
          setStories(storyRes.data.data);
          if (storyRes.data.data.length > 0) {
            setSelectedStoryId(storyRes.data.data[0]._id);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClassesAndStories();
  }, [initialClassId]);

  // 2. Fetch Progress for selected Class + Story
  useEffect(() => {
    if (!selectedClassId || !selectedStoryId) return;

    const fetchProgress = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/progress/teacher/class/${selectedClassId}/story/${selectedStoryId}`);
        if (res.data.success) {
          setDashboardData(res.data.data);
          setError('');
        }
      } catch (err) {
        setDashboardData(null);
        setError(err.response?.data?.message || 'No assignment found for this class and story.');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [selectedClassId, selectedStoryId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black mb-3">
          <BarChart3 className="w-3.5 h-3.5 text-indigo-600" /> Reading Activity & Completion Monitor
        </div>
        <h1 className="text-3xl font-black text-slate-900">Teacher Reading Dashboard</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Select a class and an assigned story to monitor each student's progress and completion status.
        </p>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">
              1. Select Classroom:
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 text-sm font-extrabold text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} ({cls.studentCount || 0} students • Age {cls.targetAge || 8})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">
              2. Select Assigned Story:
            </label>
            <select
              value={selectedStoryId}
              onChange={(e) => setSelectedStoryId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 text-sm font-extrabold text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              {stories.map((story) => (
                <option key={story._id} value={story._id}>
                  {story.title} ({story.pageCount} pages • {story.language.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
          <span>{error} Make sure you have assigned this story to the selected class in your Story Library.</span>
        </div>
      )}

      {dashboardData && (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Total Enrolled</span>
              <div className="text-3xl font-black text-slate-900 mt-2 flex items-baseline gap-1">
                {dashboardData.summary.totalStudents}
                <span className="text-xs font-bold text-slate-400">students</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-black text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Completed
              </span>
              <div className="text-3xl font-black text-emerald-600 mt-2">
                {dashboardData.summary.completedCount}
                <span className="text-xs font-bold text-slate-400 ml-1">
                  ({Math.round((dashboardData.summary.completedCount / (dashboardData.summary.totalStudents || 1)) * 100)}%)
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-black text-amber-600 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> In Progress
              </span>
              <div className="text-3xl font-black text-amber-600 mt-2">
                {dashboardData.summary.inProgressCount}
                <span className="text-xs font-bold text-slate-400 ml-1">
                  ({Math.round((dashboardData.summary.inProgressCount / (dashboardData.summary.totalStudents || 1)) * 100)}%)
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> Not Started
              </span>
              <div className="text-3xl font-black text-slate-700 mt-2">
                {dashboardData.summary.notStartedCount}
                <span className="text-xs font-bold text-slate-400 ml-1">
                  ({Math.round((dashboardData.summary.notStartedCount / (dashboardData.summary.totalStudents || 1)) * 100)}%)
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">Class Average</span>
              <div className="text-3xl font-black text-indigo-600 mt-2">
                {dashboardData.summary.averageProgress}%
              </div>
            </div>
          </div>

          {/* Detailed Students Reading Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-900">Student Reading Progress Table</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Actual reading records for <strong>{dashboardData.story.title}</strong> in <strong>{dashboardData.class.name}</strong>
                </p>
              </div>

              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                {dashboardData.story.totalPages} Total Pages
              </span>
            </div>

            {dashboardData.students.length === 0 ? (
              <div className="text-center py-10 text-slate-400 font-bold">No students found in this class.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase font-extrabold">
                      <th className="pb-3 pl-2">Student</th>
                      <th className="pb-3">Completed Pages</th>
                      <th className="pb-3">Progress</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right pr-2">Last Opened</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dashboardData.students.map((student) => (
                      <tr key={student.studentId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 pl-2 flex items-center gap-3">
                          <AvatarIcon avatar={student.avatar} size="sm" />
                          <div>
                            <span className="font-extrabold text-slate-800 block">{student.name}</span>
                            <span className="text-xs text-slate-400 font-mono">@{student.username}</span>
                          </div>
                        </td>

                        <td className="py-4 font-extrabold text-slate-800">
                          {student.progressFraction}
                        </td>

                        <td className="py-4 w-44">
                          <ProgressBar percent={student.progressPercent} showLabel={true} size="sm" />
                        </td>

                        <td className="py-4">
                          {student.status === 'completed' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 shadow-sm">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                            </span>
                          ) : student.status === 'in_progress' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 shadow-sm">
                              <Clock className="w-3.5 h-3.5" /> In Progress
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-600">
                              <HelpCircle className="w-3.5 h-3.5" /> Not Started
                            </span>
                          )}
                        </td>

                        <td className="py-4 text-right pr-2 text-xs font-bold text-slate-500">
                          {student.status === 'not_started' ? (
                            <span className="text-slate-400 italic">—</span>
                          ) : (
                            <span>Page {student.lastOpenedPage}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TeacherReadingDashboard;

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AvatarIcon from '../components/AvatarIcon';
import { Users, Plus, Trash2, Edit, UserPlus, X, Copy, Check, AlertCircle, BookOpen } from '../components/Icons';

const AVATAR_OPTIONS = ['fox', 'bear', 'rabbit', 'lion', 'owl', 'cat'];

export const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classDetails, setClassDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedText, setCopiedText] = useState('');

  // Modals
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  // Forms
  const [className, setClassName] = useState('');
  const [classDescription, setClassDescription] = useState('');
  const [targetAge, setTargetAge] = useState(8);

  const [studentName, setStudentName] = useState('');
  const [studentUsername, setStudentUsername] = useState('');
  const [studentPassword, setStudentPassword] = useState('student123');
  const [studentAvatar, setStudentAvatar] = useState('fox');

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/classes');
      if (res.data.success) {
        setClasses(res.data.data);
        if (res.data.data.length > 0 && !selectedClass) {
          fetchClassDetails(res.data.data[0]._id);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassDetails = async (id) => {
    try {
      const res = await api.get(`/classes/${id}`);
      if (res.data.success) {
        setSelectedClass(id);
        setClassDetails(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/classes', {
        name: className,
        description: classDescription,
        targetAge: Number(targetAge),
      });
      if (res.data.success) {
        setShowCreateClassModal(false);
        setClassName('');
        setClassDescription('');
        await fetchClasses();
        fetchClassDetails(res.data.data._id);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create class');
    }
  };

  const handleDeleteClass = async (id) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this class? This will also remove the students and their reading records for this class.'
      )
    ) {
      return;
    }

    try {
      const res = await api.delete(`/classes/${id}`);
      if (res.data.success) {
        setSelectedClass(null);
        setClassDetails(null);
        await fetchClasses();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete class');
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/classes/${selectedClass}/students`, {
        name: studentName,
        username: studentUsername,
        password: studentPassword,
        avatar: studentAvatar,
      });

      if (res.data.success) {
        setShowAddStudentModal(false);
        setStudentName('');
        setStudentUsername('');
        setStudentPassword('student123');
        fetchClassDetails(selectedClass);
        fetchClasses();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add student');
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to remove this student?')) return;
    try {
      const res = await api.delete(`/classes/${selectedClass}/students/${studentId}`);
      if (res.data.success) {
        fetchClassDetails(selectedClass);
        fetchClasses();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove student');
    }
  };

  const copyStudentList = () => {
    if (!classDetails || !classDetails.students) return;
    const text = classDetails.students
      .map((s) => `Name: ${s.name} | Username: ${s.username} | Password: student123`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedText('All credentials copied to clipboard!');
    setTimeout(() => setCopiedText(''), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Classrooms & Student Management</h1>
          <p className="text-sm text-slate-500 font-medium">
            Organize students into classes and generate reading credentials
          </p>
        </div>
        <button
          onClick={() => setShowCreateClassModal(true)}
          className="py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" /> Create New Class
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Classes List (Sidebar) */}
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-400">My Classes ({classes.length})</h2>
          {classes.map((cls) => (
            <div
              key={cls._id}
              onClick={() => fetchClassDetails(cls._id)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                selectedClass === cls._id
                  ? 'bg-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                  : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-black text-slate-900 text-base">{cls.name}</h3>
                  <span className="text-xs font-bold text-slate-500 block mt-0.5">
                    Target Age: <span className="text-slate-800">{cls.targetAge || 8} yrs</span>
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700">
                  {cls.studentCount || 0} students
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-2 line-clamp-1">{cls.description}</p>
            </div>
          ))}
        </div>

        {/* Selected Class Detail & Student Table (2 cols) */}
        <div className="lg:col-span-2">
          {classDetails ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
              {/* Class Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black text-slate-900">{classDetails.name}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-50 text-indigo-700">
                      Age {classDetails.targetAge || 8}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {classDetails.description || 'No description provided.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddStudentModal(true)}
                    className="py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Add Student
                  </button>
                  <button
                    onClick={() => handleDeleteClass(classDetails._id)}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
                    title="Delete Class"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Student Management Header */}
              <div className="flex justify-between items-center my-6">
                <div>
                  <h3 className="font-black text-slate-800 text-base">
                    Enrolled Students ({classDetails.students?.length || 0})
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">Students can log in with their username and password</p>
                </div>
                {classDetails.students?.length > 0 && (
                  <button
                    onClick={copyStudentList}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy Logins
                  </button>
                )}
              </div>

              {copiedText && (
                <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" /> {copiedText}
                </div>
              )}

              {/* Students Table */}
              {classDetails.students?.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-600">No students in this class yet.</p>
                  <p className="text-xs text-slate-400 mb-4">Add your students to allow them to access assigned stories.</p>
                  <button
                    onClick={() => setShowAddStudentModal(true)}
                    className="py-2 px-4 rounded-xl bg-indigo-600 text-white text-xs font-extrabold"
                  >
                    Add First Student
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase font-extrabold">
                        <th className="pb-3 pl-2">Student</th>
                        <th className="pb-3">Username</th>
                        <th className="pb-3">Default Password</th>
                        <th className="pb-3 text-right pr-2">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {classDetails.students.map((student) => (
                        <tr key={student._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 pl-2 flex items-center gap-3">
                            <AvatarIcon avatar={student.avatar} size="sm" />
                            <span className="font-extrabold text-slate-800">{student.name}</span>
                          </td>
                          <td className="py-3 font-mono text-xs font-bold text-indigo-700">
                            @{student.username}
                          </td>
                          <td className="py-3 font-mono text-xs text-slate-500">student123</td>
                          <td className="py-3 text-right pr-2">
                            <button
                              onClick={() => handleRemoveStudent(student._id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Remove Student"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 font-bold bg-white rounded-3xl border border-slate-200">
              Select a class on the left to view details and manage students.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Class */}
      {showCreateClassModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowCreateClassModal(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black text-slate-900 mb-4">Create New Class</h3>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Class Name</label>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g. Young Readers"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Age Group</label>
                <select
                  value={targetAge}
                  onChange={(e) => setTargetAge(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {[5, 6, 7, 8, 9, 10, 11, 12].map((age) => (
                    <option key={age} value={age}>
                      {age} years old
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description (optional)</label>
                <textarea
                  rows={3}
                  value={classDescription}
                  onChange={(e) => setClassDescription(e.target.value)}
                  placeholder="Brief description of this reading class..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateClassModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Student */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddStudentModal(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black text-slate-900 mb-1">Add Student</h3>
            <p className="text-xs text-slate-500 mb-4">Create account for {classDetails?.name}</p>

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => {
                    setStudentName(e.target.value);
                    if (!studentUsername) {
                      setStudentUsername(e.target.value.toLowerCase().replace(/\s+/g, ''));
                    }
                  }}
                  placeholder="e.g. Adam Evans"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Username (Login ID)</label>
                <input
                  type="text"
                  required
                  value={studentUsername}
                  onChange={(e) => setStudentUsername(e.target.value.toLowerCase().trim())}
                  placeholder="e.g. adam"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password</label>
                <input
                  type="text"
                  required
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Reading Avatar</label>
                <div className="flex gap-2">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setStudentAvatar(av)}
                      className={`p-1 rounded-2xl transition-all ${
                        studentAvatar === av ? 'ring-2 ring-indigo-500 scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <AvatarIcon avatar={av} size="sm" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManagement;

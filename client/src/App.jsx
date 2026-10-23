import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Pages
import LandingPage from './pages/LandingPage';
import TeacherLogin from './pages/TeacherLogin';
import StudentLogin from './pages/StudentLogin';
import TeacherDashboard from './pages/TeacherDashboard';
import ClassManagement from './pages/ClassManagement';
import StoryGenerator from './pages/StoryGenerator';
import StoryReview from './pages/StoryReview';
import StoryLibrary from './pages/StoryLibrary';
import TeacherReadingDashboard from './pages/TeacherReadingDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ReadingView from './pages/ReadingView';

// Protected Route Helpers
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to={role === 'teacher' ? '/teacher' : '/student'} replace />;
  }

  return children;
};

export const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login/teacher" element={<TeacherLogin />} />
              <Route path="/login/student" element={<StudentLogin />} />

              {/* Teacher Routes */}
              <Route
                path="/teacher"
                element={
                  <ProtectedRoute allowedRole="teacher">
                    <TeacherDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/classes"
                element={
                  <ProtectedRoute allowedRole="teacher">
                    <ClassManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/generator"
                element={
                  <ProtectedRoute allowedRole="teacher">
                    <StoryGenerator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/library"
                element={
                  <ProtectedRoute allowedRole="teacher">
                    <StoryLibrary />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/story/:id"
                element={
                  <ProtectedRoute allowedRole="teacher">
                    <StoryReview />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/progress"
                element={
                  <ProtectedRoute allowedRole="teacher">
                    <TeacherReadingDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Student Routes */}
              <Route
                path="/student"
                element={
                  <ProtectedRoute allowedRole="student">
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/read/:storyId"
                element={
                  <ProtectedRoute allowedRole="student">
                    <ReadingView />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;

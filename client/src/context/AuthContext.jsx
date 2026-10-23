import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('storyland_token');
      const storedUser = localStorage.getItem('storyland_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Verify with backend
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
            localStorage.setItem('storyland_user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          console.warn('[AuthContext] Session invalid or expired.');
          localStorage.removeItem('storyland_token');
          localStorage.removeItem('storyland_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const loginTeacher = async (email, password) => {
    const res = await api.post('/auth/teacher/login', { email, password });
    if (res.data.success) {
      const userData = res.data.data;
      localStorage.setItem('storyland_token', userData.token);
      localStorage.setItem('storyland_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const registerTeacher = async (name, email, password) => {
    const res = await api.post('/auth/teacher/register', { name, email, password });
    if (res.data.success) {
      const userData = res.data.data;
      localStorage.setItem('storyland_token', userData.token);
      localStorage.setItem('storyland_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const loginStudent = async (username, password) => {
    const res = await api.post('/auth/student/login', { username, password });
    if (res.data.success) {
      const userData = res.data.data;
      localStorage.setItem('storyland_token', userData.token);
      localStorage.setItem('storyland_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    }
    throw new Error(res.data.message || 'Student login failed');
  };

  const logout = () => {
    localStorage.removeItem('storyland_token');
    localStorage.removeItem('storyland_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role,
        loading,
        loginTeacher,
        registerTeacher,
        loginStudent,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

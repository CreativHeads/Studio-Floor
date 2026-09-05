import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('studioplus_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('studioplus_token') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && !user) {
      api.getProfile()
        .then(u => {
          setUser(u);
          localStorage.setItem('studioplus_user', JSON.stringify(u));
        })
        .catch(() => logout());
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.login(email, password);
      setToken(data.access);
      setUser(data.user);
      localStorage.setItem('studioplus_token', data.access);
      localStorage.setItem('studioplus_user', JSON.stringify(data.user));
      setLoading(false);
      return { success: true, user: data.user };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const newUser = await api.register(userData);
      // Auto login after registration
      const loginRes = await login(userData.email, userData.password);
      setLoading(false);
      return loginRes;
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const loginWithFirebaseToken = async (idToken, fullName) => {
    setLoading(true);
    try {
      const loginRes = await api.firebaseLogin(idToken, fullName);
      setToken(loginRes.access);
      setUser(loginRes.user);
      localStorage.setItem('studioplus_token', loginRes.access);
      localStorage.setItem('studioplus_user', JSON.stringify(loginRes.user));
      setLoading(false);
      return { success: true, user: loginRes.user };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message || 'Firebase authentication failed' };
    }
  };

  const logout = () => {
    const activeHoldId = localStorage.getItem('studio_hold_id');
    if (activeHoldId) {
      api.cancelHold(activeHoldId).catch(() => {});
      localStorage.removeItem('studio_hold_id');
      localStorage.removeItem('studio_hold_expires_at');
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('studioplus_token');
    localStorage.removeItem('studioplus_user');
  };

  const isAdmin = user && (user.role === 'ADMIN' || user.email === 'admin@studioplus.com');

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, loading, login, register, loginWithFirebaseToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

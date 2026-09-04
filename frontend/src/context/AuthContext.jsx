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

  const loginWithPhoneOtp = async (fullName, phoneNumber, firebaseUser = null, role = 'CREATOR', userEmail = null) => {
    setLoading(true);
    try {
      const generatedPassword = `OTP@${phoneNumber.replace(/[^0-9]/g, '')}#StudioFloor`;
      const nameParts = (fullName || 'Creator User').trim().split(' ');
      const firstName = nameParts[0] || 'Creator';
      const lastName = nameParts.slice(1).join(' ') || '';
      const email = userEmail || `${phoneNumber.replace(/[^0-9]/g, '')}@studiofloor.com`;

      let loginRes;
      try {
        loginRes = await api.login(email, generatedPassword);
      } catch (e) {
        // User does not exist, let's register them!
        const userData = {
          first_name: firstName,
          last_name: lastName,
          username: phoneNumber.replace(/[^0-9]/g, ''),
          email: email,
          phone_number: phoneNumber,
          password: generatedPassword,
          password_confirm: generatedPassword,
          role: role === 'CREATOR' ? 'CUSTOMER' : (role || 'CUSTOMER')
        };
        await api.register(userData);
        loginRes = await api.login(email, generatedPassword);
      }

      setToken(loginRes.access);
      setUser(loginRes.user);
      localStorage.setItem('studioplus_token', loginRes.access);
      localStorage.setItem('studioplus_user', JSON.stringify(loginRes.user));
      setLoading(false);
      return { success: true, user: loginRes.user };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message || 'OTP real authentication failed' };
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
    <AuthContext.Provider value={{ user, token, isAdmin, loading, login, register, loginWithPhoneOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

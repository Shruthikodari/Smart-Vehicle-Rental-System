import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Attempting login with email:', email);
      const response = await api.post('/auth/login/user', null, {
        params: { email, password }
      });
      console.log('Login response:', response);
      const { token, data: userData } = response.data;
      localStorage.setItem('token', token || 'dummy-token');
      localStorage.setItem('user', JSON.stringify(userData || { email }));
      setUser(userData || { email });
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      const message = error.response?.data?.message || error.message || 'Login failed';
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      console.log('=== REGISTER START ===');
      console.log('Input userData:', userData);
      
      const payload = {
        name: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
      };
      
      console.log('Payload to send:', payload);
      console.log('Posting to: /auth/register');
      
      const response = await api.post('/auth/register', payload);
      console.log('=== REGISTER SUCCESS ===');
      console.log('Response:', response);
      return { success: true, message: 'Registration successful' };
    } catch (error) {
      console.log('=== REGISTER ERROR ===');
      console.error('Full error object:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      console.error('Error data:', error.response?.data);
      console.error('Error message:', error.message);
      
      const message = error.response?.data?.message || 
                     error.response?.data?.error || 
                     error.message || 
                     `Registration failed (Status: ${error.response?.status || 'unknown'})`;
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
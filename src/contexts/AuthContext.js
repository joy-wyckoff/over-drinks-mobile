import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useQuery } from '@tanstack/react-query';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const API_BASE_URL = 'https://your-backend-url.com'; // Replace with your actual backend URL

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored auth token on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        setIsAuthenticated(true);
        // Fetch user data with token
        fetchUserData(token);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsLoading(false);
    }
  };

  const fetchUserData = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token is invalid, clear it
        await SecureStore.deleteItemAsync('authToken');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      await SecureStore.deleteItemAsync('authToken');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token) => {
    try {
      await SecureStore.setItemAsync('authToken', token);
      setIsAuthenticated(true);
      await fetchUserData(token);
    } catch (error) {
      console.error('Error storing auth token:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Error clearing auth token:', error);
    }
  };

  const value = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    refreshUser: () => fetchUserData(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

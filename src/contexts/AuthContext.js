import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);

  // Check for stored auth token on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if user wants to be remembered
      const rememberUser = await AsyncStorage.getItem('rememberUser');
      
      if (rememberUser === 'true') {
        const token = await SecureStore.getItemAsync('authToken');
        if (token) {
          // Extract user ID from token (format: auth-token-{userId}-{timestamp})
          const tokenParts = token.split('-');
          if (tokenParts.length >= 3) {
            const userId = tokenParts[2];
            
            // Load user account data
            const accountsData = await AsyncStorage.getItem('userAccounts');
            const accounts = accountsData ? JSON.parse(accountsData) : [];
            const userAccount = accounts.find(account => account.id === userId);
            
            if (userAccount) {
              // Load user's profile data if it exists
              let profileData = null;
              try {
                const profileKey = `profile_${userId}`;
                const profileString = await AsyncStorage.getItem(profileKey);
                if (profileString) {
                  profileData = JSON.parse(profileString);
                }
              } catch (profileError) {
                console.log('No profile data found for user');
              }
              
              // Combine account and profile data
              const userWithProfile = {
                ...userAccount,
                profile: profileData
              };
              
              setIsAuthenticated(true);
              setUser(userWithProfile);
              
              // Check if user needs to complete their profile
              const profileComplete = hasCompletedProfile(userWithProfile);
              setNeedsProfileCompletion(!profileComplete);
            } else {
              // User account not found, clear token and remember preference
              await SecureStore.deleteItemAsync('authToken');
              await AsyncStorage.removeItem('rememberUser');
              setIsAuthenticated(false);
              setUser(null);
            }
          } else {
            // Invalid token format, clear it and remember preference
            await SecureStore.deleteItemAsync('authToken');
            await AsyncStorage.removeItem('rememberUser');
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          // No token, clear remember preference
          await AsyncStorage.removeItem('rememberUser');
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        // User doesn't want to be remembered, clear any existing tokens
        await SecureStore.deleteItemAsync('authToken');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };


  const login = async (username, password, rememberMe = false) => {
    try {
      // Get stored accounts
      const accountsData = await AsyncStorage.getItem('userAccounts');
      const accounts = accountsData ? JSON.parse(accountsData) : [];
      
      // Find user by email
      const userAccount = accounts.find(account => 
        account.email && account.email.toLowerCase() === username.toLowerCase()
      );
      
      if (!userAccount) {
        throw new Error('Email not found');
      }
      
      if (userAccount.password !== password) {
        throw new Error('Incorrect password');
      }
      
      // Load user's profile data if it exists
      let profileData = null;
      try {
        const profileKey = `profile_${userAccount.id}`;
        const profileString = await AsyncStorage.getItem(profileKey);
        if (profileString) {
          profileData = JSON.parse(profileString);
        }
      } catch (profileError) {
        console.log('No profile data found for user');
      }
      
      // Create auth token
      const token = `auth-token-${userAccount.id}-${Date.now()}`;
      await SecureStore.setItemAsync('authToken', token);
      
      // Store remember me preference
      await AsyncStorage.setItem('rememberUser', rememberMe.toString());
      
      setIsAuthenticated(true);
      
      // Combine account and profile data
      const userWithProfile = {
        ...userAccount,
        profile: profileData
      };
      
      setUser(userWithProfile);
      
      // Check if user needs to complete their profile
      const profileComplete = hasCompletedProfile(userWithProfile);
      setNeedsProfileCompletion(!profileComplete);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Check if user has completed their profile
  const hasCompletedProfile = (user) => {
    if (!user || !user.profile) return false;
    
    const profile = user.profile;
    return !!(
      profile.profilePhotoUrl && 
      profile.bio && 
      profile.bio.trim().length > 0 &&
      profile.interests && 
      profile.interests.length === 5
    );
  };

  const createAccount = async (accountData) => {
    try {
      // Get existing accounts
      const accountsData = await AsyncStorage.getItem('userAccounts');
      const accounts = accountsData ? JSON.parse(accountsData) : [];
      
      // Check if email already exists
      const existingUser = accounts.find(account => 
        account.email && account.email.toLowerCase() === accountData.email.toLowerCase()
      );
      
      if (existingUser) {
        throw new Error('Email already taken');
      }
      
      // Add new account
      accounts.push(accountData);
      await AsyncStorage.setItem('userAccounts', JSON.stringify(accounts));
      
      return accountData;
    } catch (error) {
      console.error('Account creation error:', error);
      throw error;
    }
  };

  // Mark profile as completed
  const markProfileCompleted = (profileData = null) => {
    setNeedsProfileCompletion(false);
    
    // Update user object with new profile data if provided
    if (profileData && user) {
      const updatedUser = {
        ...user,
        profile: profileData
      };
      setUser(updatedUser);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
      // Clear remember me preference when user logs out
      await AsyncStorage.removeItem('rememberUser');
      setIsAuthenticated(false);
      setUser(null);
      setNeedsProfileCompletion(false);
    } catch (error) {
      console.error('Error clearing auth token:', error);
    }
  };

  const value = {
    isAuthenticated,
    user,
    isLoading,
    needsProfileCompletion,
    hasCompletedProfile,
    markProfileCompleted,
    login,
    createAccount,
    logout,
    refreshUser: () => fetchUserData(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

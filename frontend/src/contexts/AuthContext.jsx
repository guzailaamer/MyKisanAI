import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import toast from 'react-hot-toast';

// Import Firebase with error handling
let auth = null;
let signInWithGoogle = null;

try {
  const firebaseModule = await import('../utils/firebase');
  auth = firebaseModule.auth;
  signInWithGoogle = firebaseModule.signInWithGoogle;
  console.log('✅ Firebase loaded successfully');
} catch (error) {
  console.error('❌ Failed to load Firebase:', error);
  // Create mock functions for development
  auth = { currentUser: null };
  signInWithGoogle = () => Promise.reject(new Error('Firebase not configured'));
}

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
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    if (!auth || typeof auth.currentUser === 'undefined') {
      console.warn('Firebase Auth not available');
      setLoading(false);
      return;
    }

    setFirebaseReady(true);
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user?.displayName || 'No user');
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    if (!signInWithGoogle) {
      toast.error('Firebase not configured properly');
      throw new Error('Firebase not available');
    }

    try {
      setLoading(true);
      const result = await signInWithGoogle();
      toast.success(`Welcome ${result.user.displayName}!`);
      return result.user;
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Login cancelled');
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Popup blocked. Please allow popups for this site.');
      } else {
        toast.error('Login failed. Please try again.');
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!auth) {
      toast.error('Cannot logout - Firebase not available');
      return;
    }

    try {
      await signOut(auth);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
      throw error;
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    firebaseReady
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

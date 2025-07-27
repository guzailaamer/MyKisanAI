import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sprout, LogIn, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const { login, firebaseReady } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    if (!firebaseReady) {
      alert('Firebase is not configured. Check console for details.');
      return;
    }

    try {
      setLoading(true);
      await login();
      navigate('/home');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-earth-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sprout className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-earth-800 mb-2">Welcome to MyKisanAI</h1>
          <p className="text-earth-600">Sign in to access your farming assistant</p>
        </div>

        {/* Firebase Status */}
        {!firebaseReady && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800 font-medium">Firebase Configuration Issue</p>
              <p className="text-xs text-yellow-700 mt-1">
                Check browser console for details. You can still test the backend features.
              </p>
            </div>
          </div>
        )}

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading || !firebaseReady}
          className={`w-full border-2 border-earth-200 hover:border-primary-300 text-earth-700 py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-3 transition-all duration-200 mb-4 ${
            !firebaseReady ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        {/* Test Backend Button */}
        <button
          onClick={() => navigate('/home')}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-200 mb-4"
        >
          <LogIn className="w-4 h-4" />
          Skip Login & Test Backend
        </button>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-earth-500">
            By signing in, you agree to our terms of service and privacy policy
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;

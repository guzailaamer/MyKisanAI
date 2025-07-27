import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../utils/api';
import { Mic, Camera, Send, MapPin, Cloud, Upload, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const HomePage = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  const fileInputRef = useRef(null);

  const handleVoiceInput = async () => {
    try {
      if (!isRecording) {
        // Start recording
        setIsRecording(true);
        toast.success('Recording started...');
        
        // TODO: Implement actual voice recording
        setTimeout(() => {
          setIsRecording(false);
          toast.success('Recording stopped');
        }, 3000);
      } else {
        // Stop recording
        setIsRecording(false);
        toast.success('Processing audio...');
      }
    } catch (error) {
      console.error('Voice recording error:', error);
      toast.error('Voice recording failed');
      setIsRecording(false);
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    await handleDiagnosis(file);
  };

  const handleDiagnosis = async (imageFile, description = 'Analyze this crop image for diseases and issues') => {
    try {
      setIsLoading(true);
      toast.loading('Analyzing crop image...');

      // Use test endpoint first to avoid auth issues
      const result = await apiService.testDiagnoseCrop(imageFile, description);
      
      setResponse(JSON.stringify(result, null, 2));
      toast.dismiss();
      toast.success('Crop analysis complete!');
      
    } catch (error) {
      console.error('Diagnosis error:', error);
      toast.dismiss();
      
      if (error.response?.status === 422) {
        toast.error('Invalid image format or size. Please try a different image.');
      } else if (error.response?.status === 401) {
        toast.error('Authentication required. Please log in again.');
      } else {
        toast.error('Crop analysis failed. Please try again.');
      }
      
      setResponse(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!query.trim()) return;

    try {
      setIsLoading(true);
      toast.loading('Processing your query...');

      // Try market advice first
      if (query.toLowerCase().includes('price') || query.toLowerCase().includes('market')) {
        const result = await apiService.testMarketAdvice(query, 'Karnataka');
        setResponse(JSON.stringify(result, null, 2));
      } 
      // Try subsidy query
      else if (query.toLowerCase().includes('scheme') || query.toLowerCase().includes('subsidy')) {
        const result = await apiService.testSubsidyQuery(query);
        setResponse(JSON.stringify(result, null, 2));
      }
      // Default to market advice
      else {
        const result = await apiService.testMarketAdvice(query, 'Karnataka');
        setResponse(JSON.stringify(result, null, 2));
      }

      toast.dismiss();
      toast.success('Query processed!');
      setQuery('');
      
    } catch (error) {
      console.error('Query error:', error);
      toast.dismiss();
      toast.error('Query failed. Please try again.');
      setResponse(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-earth-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-earth-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-earth-800">
              Welcome, {user?.displayName?.split(' ')[0] || 'Farmer'}!
            </h1>
            <div className="flex items-center gap-4 text-sm text-earth-600 mt-1">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>Karnataka, India</span>
              </div>
              <div className="flex items-center gap-1">
                <Cloud className="w-4 h-4" />
                <span>28°C, Sunny</span>
              </div>
            </div>
          </div>
          <img
            src={user?.photoURL || 'https://via.placeholder.com/48'}
            alt="Profile"
            className="w-12 h-12 rounded-full border-2 border-primary-200"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Voice Input */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <button
            onClick={handleVoiceInput}
            disabled={isLoading}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
              isRecording 
                ? 'bg-red-500 shadow-lg scale-110' 
                : 'bg-primary-500 hover:bg-primary-600'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <Loader className="w-10 h-10 text-white animate-spin" />
            ) : (
              <Mic className="w-10 h-10 text-white" />
            )}
          </button>
          <p className="text-earth-600 mt-3">
            {isRecording ? 'Listening...' : 'Tap to speak'}
          </p>
        </motion.div>

        {/* Image Upload */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-earth-200 mb-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={handleImageUpload}
            disabled={isLoading}
            className={`w-full border-2 border-dashed border-earth-300 rounded-xl p-8 text-center hover:border-primary-400 hover:bg-primary-50 transition-all duration-200 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <Loader className="w-8 h-8 text-earth-400 mx-auto mb-2 animate-spin" />
            ) : (
              <Camera className="w-8 h-8 text-earth-400 mx-auto mb-2" />
            )}
            <p className="text-earth-600 font-medium">Upload or Take Photo</p>
            <p className="text-sm text-earth-500">Diagnose crop diseases instantly</p>
          </button>
        </div>

        {/* Text Input */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-earth-200 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about crops, prices, or schemes..."
              className="flex-1 border-0 focus:ring-0 text-earth-700 placeholder-earth-400"
              onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
              disabled={isLoading}
            />
            <button
              onClick={handleTextSubmit}
              disabled={isLoading || !query.trim()}
              className={`bg-primary-500 hover:bg-primary-600 text-white p-2 rounded-xl ${
                isLoading || !query.trim() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Response Display */}
        {response && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-earth-200">
            <h3 className="text-lg font-semibold text-earth-800 mb-3">Response:</h3>
            <pre className="whitespace-pre-wrap text-sm text-earth-600 max-h-96 overflow-y-auto">
              {response}
            </pre>
          </div>
        )}
      </div>

      {/* Bottom Navigation Placeholder */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-earth-200 p-4">
        <div className="flex justify-around">
          <button className="flex flex-col items-center gap-1 text-primary-600">
            <div className="w-6 h-6 bg-primary-100 rounded-lg"></div>
            <span className="text-xs">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-earth-400">
            <div className="w-6 h-6 bg-earth-100 rounded-lg"></div>
            <span className="text-xs">Tips</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-earth-400">
            <div className="w-6 h-6 bg-earth-100 rounded-lg"></div>
            <span className="text-xs">History</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-earth-400">
            <div className="w-6 h-6 bg-earth-100 rounded-lg"></div>
            <span className="text-xs">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Square } from 'lucide-react';
import { AudioRecorder } from '../../utils/audio';
import toast from 'react-hot-toast';

const MicButton = ({ onAudioRecorded, disabled = false, className = '' }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recorder] = useState(() => new AudioRecorder());

  const startRecording = async () => {
    try {
      await recorder.startRecording();
      setIsRecording(true);
      toast.success('Recording started');
    } catch (error) {
      toast.error('Failed to start recording: ' + error.message);
    }
  };

  const stopRecording = async () => {
    try {
      const audioBlob = await recorder.stopRecording();
      setIsRecording(false);
      
      if (audioBlob && onAudioRecorded) {
        onAudioRecorded(audioBlob);
      }
      toast.success('Recording stopped');
    } catch (error) {
      toast.error('Failed to stop recording');
    }
  };

  const cancelRecording = () => {
    recorder.cancelRecording();
    setIsRecording(false);
    toast.info('Recording cancelled');
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={`p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 recording-pulse'
            : 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
      >
        {isRecording ? (
          <Square className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </motion.button>
      
      {isRecording && (
        <motion.button
          type="button"
          onClick={cancelRecording}
          className="p-2 rounded-full bg-gray-500 hover:bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MicOff className="w-5 h-5" />
        </motion.button>
      )}
      
      {isRecording && (
        <motion.div 
          className="flex items-center text-red-600 text-sm font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
          Recording...
        </motion.div>
      )}
    </div>
  );
};

export default MicButton;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Globe, 
  Mic, 
  Download,
  Shield,
  HelpCircle,
  Moon,
  Sun,
  Smartphone,
  Volume2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout, isAnonymous } = useAuth();
  const [settings, setSettings] = useState({
    notifications: true,
    voiceEnabled: true,
    autoPlayAudio: true,
    language: 'en',
    theme: 'light',
    location: '',
    offlineMode: false
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success('Setting updated successfully');
  };

  const handleExportData = () => {
    // Mock data export
    const data = {
      user: user?.email || 'guest',
      exportDate: new Date().toISOString(),
      settings: settings,
      note: 'This is a demo export. In a real app, this would contain actual user data.'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mykisanai-data-export.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully');
  };

  const settingSections = [
    {
      title: 'Account',
      icon: <User className="w-5 h-5" />,
      items: [
        {
          label: 'Profile Information',
          description: 'Manage your account details and preferences',
          content: (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                )}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {isAnonymous ? 'Guest User' : user?.displayName || 'User'}
                  </h4>
                  <p className="text-gray-600">
                    {isAnonymous ? 'Anonymous Account' : user?.email}
                  </p>
                </div>
              </div>
              {isAnonymous && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    You're using a guest account. Sign in with Google to save your data permanently.
                  </p>
                </div>
              )}
            </div>
          )
        }
      ]
    },
    {
      title: 'Preferences',
      icon: <Bell className="w-5 h-5" />,
      items: [
        {
          label: 'Notifications',
          description: 'Manage your notification preferences',
          content: (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Push Notifications</p>
                  <p className="text-sm text-gray-600">Receive alerts for important updates</p>
                </div>
                <button
                  onClick={() => handleSettingChange('notifications', !settings.notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Auto-play Audio Responses</p>
                  <p className="text-sm text-gray-600">Automatically play voice responses</p>
                </div>
                <button
                  onClick={() => handleSettingChange('autoPlayAudio', !settings.autoPlayAudio)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.autoPlayAudio ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.autoPlayAudio ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )
        },
        {
          label: 'Language & Region',
          description: 'Set your preferred language and location',
          content: (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi (हिंदी)</option>
                  <option value="bn">Bengali (বাংলা)</option>
                  <option value="te">Telugu (తెలుగు)</option>
                  <option value="ta">Tamil (தமிழ்)</option>
                  <option value="mr">Marathi (मराठी)</option>
                </select>
              </div>
              
              <Input
                label="Default Location"
                placeholder="e.g., Mumbai, Maharashtra"
                value={settings.location}
                onChange={(e) => handleSettingChange('location', e.target.value)}
              />
            </div>
          )
        }
      ]
    },
    {
      title: 'Voice & Audio',
      icon: <Mic className="w-5 h-5" />,
      items: [
        {
          label: 'Voice Settings',
          description: 'Configure voice input and output preferences',
          content: (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Voice Input</p>
                  <p className="text-sm text-gray-600">Enable voice commands and recording</p>
                </div>
                <button
                  onClick={() => handleSettingChange('voiceEnabled', !settings.voiceEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.voiceEnabled ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.voiceEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Volume2 className="w-5 h-5 text-blue-600 mr-2" />
                  <p className="text-blue-800 text-sm">
                    Voice features require microphone access. Make sure to allow permissions when prompted.
                  </p>
                </div>
              </div>
            </div>
          )
        }
      ]
    },
    {
      title: 'Data & Privacy',
      icon: <Shield className="w-5 h-5" />,
      items: [
        {
          label: 'Data Management',
          description: 'Export, backup, or delete your data',
          content: (
            <div className="space-y-4">
              <Button
                variant="outline"
                onClick={handleExportData}
                className="flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export My Data
              </Button>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">Privacy Information</h5>
                <p className="text-sm text-gray-600">
                  Your conversations and data are stored securely. We use this information to improve our AI models and provide better recommendations. You can export or delete your data at any time.
                </p>
              </div>
            </div>
          )
        }
      ]
    },
    {
      title: 'Advanced',
      icon: <Smartphone className="w-5 h-5" />,
      items: [
        {
          label: 'App Settings',
          description: 'Advanced application preferences',
          content: (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Offline Mode</p>
                  <p className="text-sm text-gray-600">Enable basic features without internet</p>
                </div>
                <button
                  onClick={() => handleSettingChange('offlineMode', !settings.offlineMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.offlineMode ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.offlineMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-900 mb-2">Theme</p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleSettingChange('theme', 'light')}
                    className={`flex items-center px-3 py-2 rounded-lg border ${
                      settings.theme === 'light' 
                        ? 'border-primary-500 bg-primary-50 text-primary-700' 
                        : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    <Sun className="w-4 h-4 mr-2" />
                    Light
                  </button>
                  <button
                    onClick={() => handleSettingChange('theme', 'dark')}
                    className={`flex items-center px-3 py-2 rounded-lg border ${
                      settings.theme === 'dark' 
                        ? 'border-primary-500 bg-primary-50 text-primary-700' 
                        : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    <Moon className="w-4 h-4 mr-2" />
                    Dark
                  </button>
                </div>
              </div>
            </div>
          )
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-earth-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate('/home')}
              className="flex items-center text-primary-600 hover:text-primary-700 transition-colors duration-200 mr-6"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {settingSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              className="bg-white rounded-xl shadow-sm border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1, duration: 0.6 }}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  {section.icon}
                  <h2 className="ml-3 text-xl font-semibold text-gray-900">
                    {section.title}
                  </h2>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {item.label}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    </div>
                    {item.content}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Help & Support */}
          <motion.div
            className="bg-gradient-to-r from-primary-600 to-earth-600 rounded-2xl p-8 text-white text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <HelpCircle className="w-12 h-12 mx-auto mb-4 text-primary-100" />
            <h3 className="text-2xl font-bold mb-4">Need Help?</h3>
            <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
              If you have questions about using MyKisanAI or need technical support, 
              we're here to help you get the most out of your farming assistant.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/tips')}
                className="bg-white text-primary-600 hover:bg-gray-50"
              >
                View Help Center
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-primary-600"
              >
                Contact Support
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;

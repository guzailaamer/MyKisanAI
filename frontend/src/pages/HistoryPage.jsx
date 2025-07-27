import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MessageCircle, 
  Camera, 
  TrendingUp, 
  Calendar, 
  Search,
  Filter,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { apiService } from '../utils/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const HistoryPage = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Mock data for demonstration - replace with actual API call
  const mockHistory = [
    {
      id: '1',
      type: 'chat',
      title: 'Wheat crop disease diagnosis',
      preview: 'Asked about yellow spots on wheat leaves...',
      timestamp: new Date('2024-01-15T10:30:00'),
      responses: 3
    },
    {
      id: '2',
      type: 'diagnosis',
      title: 'Tomato plant analysis',
      preview: 'Uploaded image of tomato plants with brown spots',
      timestamp: new Date('2024-01-14T15:45:00'),
      result: 'Early blight detected'
    },
    {
      id: '3',
      type: 'market',
      title: 'Rice market prices',
      preview: 'Checked current rice prices in Maharashtra',
      timestamp: new Date('2024-01-13T09:20:00'),
      result: '₹1,850 per quintal'
    },
    {
      id: '4',
      type: 'chat',
      title: 'Monsoon preparation advice',
      preview: 'Asked about preparing fields for monsoon season...',
      timestamp: new Date('2024-01-12T16:10:00'),
      responses: 5
    },
    {
      id: '5',
      type: 'diagnosis',
      title: 'Cotton pest identification',
      preview: 'Uploaded image showing pest damage on cotton plants',
      timestamp: new Date('2024-01-11T11:30:00'),
      result: 'Bollworm infestation detected'
    }
  ];

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from your API
      // const data = await apiService.getConversations();
      
      // For now, using mock data
      setTimeout(() => {
        setConversations(mockHistory);
        setLoading(false);
      }, 1000);
    } catch (error) {
      toast.error('Failed to load history');
      setLoading(false);
    }
  };

  const filteredHistory = conversations.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.preview.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'chat':
        return <MessageCircle className="w-5 h-5 text-blue-600" />;
      case 'diagnosis':
        return <Camera className="w-5 h-5 text-green-600" />;
      case 'market':
        return <TrendingUp className="w-5 h-5 text-purple-600" />;
      default:
        return <MessageCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'chat':
        return 'AI Chat';
      case 'diagnosis':
        return 'Crop Diagnosis';
      case 'market':
        return 'Market Analysis';
      default:
        return 'Unknown';
    }
  };

  const handleDeleteItem = (id) => {
    setConversations(prev => prev.filter(item => item.id !== id));
    toast.success('Item deleted successfully');
  };

  const handleViewItem = (item) => {
    // Navigate back to home and set the appropriate tab
    navigate('/home', { state: { activeTab: item.type === 'chat' ? 'chat' : item.type } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-earth-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your history...</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-900">My History</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search your history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Types</option>
                <option value="chat">AI Chat</option>
                <option value="diagnosis">Crop Diagnosis</option>
                <option value="market">Market Analysis</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <motion.div
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || filterType !== 'all' ? 'No results found' : 'No history yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Start using MyKisanAI to see your conversation history here'
              }
            </p>
            <Button onClick={() => navigate('/home')}>
              Get Started
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item, index) => (
              <motion.div
                key={item.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      {getTypeIcon(item.type)}
                      <span className="ml-2 text-sm font-medium text-gray-600">
                        {getTypeLabel(item.type)}
                      </span>
                      <div className="flex items-center ml-4 text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {format(item.timestamp, 'MMM dd, yyyy • h:mm a')}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-3">
                      {item.preview}
                    </p>

                    {item.result && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                        <p className="text-sm font-medium text-green-900">Result:</p>
                        <p className="text-sm text-green-800">{item.result}</p>
                      </div>
                    )}

                    {item.responses && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        {item.responses} messages in conversation
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewItem(item)}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        <motion.div
          className="bg-gradient-to-r from-primary-600 to-earth-600 rounded-2xl p-8 text-white text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h3 className="text-2xl font-bold mb-4">Your MyKisanAI Journey</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold">{conversations.length}</div>
              <div className="text-primary-100">Total Interactions</div>
            </div>
            <div>
              <div className="text-3xl font-bold">
                {conversations.filter(c => c.type === 'diagnosis').length}
              </div>
              <div className="text-primary-100">Crop Diagnoses</div>
            </div>
            <div>
              <div className="text-3xl font-bold">
                {conversations.filter(c => c.type === 'chat').length}
              </div>
              <div className="text-primary-100">AI Conversations</div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default HistoryPage;

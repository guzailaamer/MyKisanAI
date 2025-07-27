import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lightbulb, Droplets, Bug, Sprout, Sun, Clock } from 'lucide-react';
import Button from '../components/ui/Button';

const TipsPage = () => {
  const navigate = useNavigate();

  const tips = [
    {
      icon: <Droplets className="w-8 h-8 text-blue-600" />,
      category: "Water Management",
      title: "Smart Irrigation Techniques",
      content: "Use drip irrigation to save up to 50% water. Water early morning or late evening to minimize evaporation. Check soil moisture before watering.",
      time: "2 min read"
    },
    {
      icon: <Bug className="w-8 h-8 text-red-600" />,
      category: "Pest Control",
      title: "Natural Pest Prevention",
      content: "Plant marigolds and neem trees around crops. Use neem oil spray for organic pest control. Encourage beneficial insects like ladybugs.",
      time: "3 min read"
    },
    {
      icon: <Sprout className="w-8 h-8 text-green-600" />,
      category: "Soil Health",
      title: "Improve Soil Fertility",
      content: "Rotate crops annually to maintain soil nutrients. Add compost and organic matter. Test soil pH regularly and adjust as needed.",
      time: "4 min read"
    },
    {
      icon: <Sun className="w-8 h-8 text-yellow-600" />,
      category: "Weather Planning",
      title: "Seasonal Crop Planning",
      content: "Choose climate-appropriate crops. Monitor weather forecasts for planting and harvesting. Use weather-resistant varieties during monsoons.",
      time: "3 min read"
    },
    {
      icon: <Lightbulb className="w-8 h-8 text-purple-600" />,
      category: "Technology",
      title: "Modern Farming Tools",
      content: "Use mobile apps for crop monitoring. Invest in soil sensors for precise farming. Consider drone technology for large farms.",
      time: "5 min read"
    },
    {
      icon: <Clock className="w-8 h-8 text-orange-600" />,
      category: "Timing",
      title: "Optimal Harvest Time",
      content: "Harvest crops at the right maturity stage. Early morning is best for harvesting most vegetables. Store harvested crops properly to maintain quality.",
      time: "3 min read"
    }
  ];

  const seasonalTips = [
    {
      season: "Kharif (Monsoon)",
      period: "June - October",
      tips: [
        "Plant rice, cotton, sugarcane, and pulses",
        "Ensure proper drainage to prevent waterlogging",
        "Monitor for fungal diseases due to high humidity"
      ]
    },
    {
      season: "Rabi (Winter)",
      period: "November - April",
      tips: [
        "Sow wheat, barley, peas, and mustard",
        "Provide adequate irrigation as rainfall is low",
        "Protect crops from frost damage"
      ]
    },
    {
      season: "Zaid (Summer)",
      period: "April - June",
      tips: [
        "Grow watermelon, cucumber, and fodder crops",
        "Use mulching to conserve soil moisture",
        "Provide shade protection during extreme heat"
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
            <h1 className="text-2xl font-bold text-gray-900">Farming Tips & Guides</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="text-6xl mb-4">🌾</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Expert Farming Tips
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover proven techniques, seasonal advice, and modern practices to improve your farming efficiency and crop yields.
            </p>
          </div>
        </motion.div>

        {/* General Tips Grid */}
        <section className="mb-12">
          <motion.h3
            className="text-2xl font-bold text-gray-900 mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            Essential Farming Tips
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tips.map((tip, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center mb-4">
                  {tip.icon}
                  <div className="ml-3">
                    <span className="text-xs font-medium text-primary-600 uppercase tracking-wide">
                      {tip.category}
                    </span>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      {tip.time}
                    </div>
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  {tip.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {tip.content}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Seasonal Tips */}
        <section className="mb-12">
          <motion.h3
            className="text-2xl font-bold text-gray-900 mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Seasonal Farming Guide
          </motion.h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {seasonalTips.map((season, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
              >
                <div className="text-center mb-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {season.season}
                  </h4>
                  <span className="inline-block bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full">
                    {season.period}
                  </span>
                </div>

                <ul className="space-y-3">
                  {season.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <motion.section
          className="bg-gradient-to-r from-primary-600 to-earth-600 rounded-2xl p-8 text-white text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h3 className="text-2xl font-bold mb-4">Need Personalized Advice?</h3>
          <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
            Get customized farming recommendations based on your specific crops, location, and conditions using our AI assistant.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/home')}
              className="bg-white text-primary-600 hover:bg-gray-50"
            >
              <Lightbulb className="w-5 h-5 mr-2" />
              Ask AI Assistant
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/history')}
              className="border-white text-white hover:bg-white hover:text-primary-600"
            >
              View My History
            </Button>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default TipsPage;

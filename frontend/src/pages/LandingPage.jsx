import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sprout, MessageCircle, TrendingUp, Shield, ArrowRight, Play } from 'lucide-react';
import Button from '../components/ui/Button';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Sprout className="w-8 h-8" />,
      title: "Crop Diagnosis",
      description: "AI-powered analysis of crop diseases and pest issues using image recognition"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Market Advisory",
      description: "Real-time market prices and selling recommendations for better profits"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Government Schemes",
      description: "Find and access agricultural subsidies and government support programs"
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Voice Assistant",
      description: "Chat or speak in your local language for personalized farming advice"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-earth-50 to-brown-50">
      {/* Hero Section */}
      <motion.section 
        className="relative overflow-hidden px-4 pt-16 pb-20 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
                <span className="text-primary-600">MyKisan</span>
                <span className="text-earth-600">AI</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Your intelligent farming companion powered by AI. Get expert advice, diagnose crops, 
                and maximize your harvest with cutting-edge technology.
              </p>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <Button
                size="xl"
                onClick={() => navigate('/login')}
                className="group"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="xl"
                onClick={() => {
                  // Scroll to demo section
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group"
              >
                <Play className="w-5 h-5 mr-2" />
                Learn More
              </Button>
            </motion.div>

            {/* Hero Image/Demo */}
            <motion.div
              className="relative max-w-4xl mx-auto"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
            >
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                <div className="bg-gradient-to-r from-primary-100 to-earth-100 rounded-xl p-6 text-center">
                  <div className="text-6xl mb-4">🌾</div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                    Smart Farming Made Simple
                  </h3>
                  <p className="text-gray-600">
                    Upload a photo, ask a question, or record your voice - get instant expert advice
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Powerful Features for Modern Farmers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Leverage AI technology to make informed decisions, increase yields, 
              and grow your farming business sustainably.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="text-primary-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-600 to-earth-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Farming?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of farmers who are already using MyKisanAI to increase 
              their productivity and profits.
            </p>
            <Button
              variant="secondary"
              size="xl"
              onClick={() => navigate('/login')}
              className="group bg-white text-primary-600 hover:bg-gray-50"
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">
              <span className="text-primary-400">MyKisan</span>
              <span className="text-earth-400">AI</span>
            </h3>
            <p className="text-gray-400 mb-6">
              Empowering farmers with AI-driven agricultural intelligence
            </p>
            <div className="border-t border-gray-800 pt-6">
              <p className="text-sm text-gray-500">
                © 2024 MyKisanAI. All rights reserved. Made with ❤️ for farmers.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

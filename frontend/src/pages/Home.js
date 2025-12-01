import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../utils/api';
import ConfirmModal from '../components/ConfirmModal';

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm your Wellness Companion. I'm here to help you track your nutrition and fitness goals.",
      isUser: false
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [showLogout, setShowLogout] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">
            <img src="/logo3.png" alt="Wellness Companion" className="w-25 h-14" />
          </h1>
          <h1 className="text-2xl font-bold text-gray-800">Wellness Companion</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/profile')}
              className="text-gray-700 hover:text-indigo-600 font-medium mr-4"
            >
              Profile
            </button>
            <button
              onClick={() => setShowLogout(true)}
              className="bg-white text-red-500 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-xl transition duration-200 font-medium shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">

        <ConfirmModal
          isOpen={showLogout}
          title="Confirm log out"
          message="You’re about to log out. Continue?"
          cancelText="Cancel"
          confirmText="Log out"
          onCancel={() => setShowLogout(false)}
          onConfirm={() => { setShowLogout(false); logout(); }}
        />

        {/* Welcome Message */}
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.fullName}!
          </h2>
        </div>

        {/* Chat Interface Area */}
        <div className="bg-white rounded-lg shadow-lg mb-6 h-[calc(100vh-280px)] min-h-[600px]">
          <div className="h-full flex flex-col">

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`rounded-lg p-4 max-w-md ${msg.isUser
                    ? 'bg-indigo-600 text-white ml-auto'
                    : 'bg-gray-100 text-gray-700'
                    }`}
                >
                  <p>{msg.text}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!message.trim() || loading) return;

                  const userMessage = message.trim();

                  // Add user's message
                  setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
                  setMessage('');
                  setLoading(true);

                  try {
                    const response = await chatAPI.sendMessage({ message: userMessage });

                    // Add AI response
                    setMessages(prev => [
                      ...prev,
                      { text: response.data.aiResponse, isUser: false }
                    ]);
                  } catch (error) {
                    setMessages(prev => [
                      ...prev,
                      {
                        text: 'Sorry, I encountered an error. Please try again.',
                        isUser: false
                      }
                    ]);
                  } finally {
                    setLoading(false);
                  }
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Type your wellness question here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !message.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 
                    rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </form>
            </div>

          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div
            onClick={() => navigate('/nutrition')}
            className="bg-white rounded-lg shadow-lg p-8 cursor-pointer 
            hover:shadow-xl transition duration-200 transform hover:scale-105"
          >
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 
                        5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 
                        3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Nutrition</h3>
              <p className="text-gray-600">Track your meals and monitor your daily caloric intake</p>
            </div>
          </div>

          <div
            onClick={() => navigate('/fitness')}
            className="bg-white rounded-lg shadow-lg p-8 cursor-pointer 
            hover:shadow-xl transition duration-200 transform hover:scale-105"
          >
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Fitness</h3>
              <p className="text-gray-600">Log your workouts and track your fitness progress</p>
            </div>
          </div>

          <div
            onClick={() => navigate('/mental-health')}
            className="bg-white rounded-lg shadow-lg p-8 cursor-pointer 
            hover:shadow-xl transition duration-200 transform hover:scale-105"
          >
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Mental Health</h3>
              <p className="text-gray-600">Chat with your AI companion for mental wellness support</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;

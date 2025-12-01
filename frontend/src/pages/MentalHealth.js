import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../utils/api';
import ConfirmModal from '../components/ConfirmModal';

const MentalHealth = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        {
            text: "Hello! I'm here to listen and support you. How are you feeling today?",
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/home")}
                            className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            Back to Home
                        </button>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Mental Health</h1>
                    <button
                        onClick={() => setShowLogout(true)}
                        className="bg-white text-red-500 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-xl transition duration-200 font-medium shadow-sm"
                    >
                        Logout
                    </button>
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
                                    placeholder="Share your thoughts..."
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

            </div>
        </div>
    );
};

export default MentalHealth;

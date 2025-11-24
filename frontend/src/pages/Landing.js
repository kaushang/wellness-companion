import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-6xl max-h-screen mx-auto ">
        {/* Logo and Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Personal Wellness Companion
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Track your nutrition and fitness journey with ease. <br /> Build healthy habits one day at a time.
          </p>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center mb-12">
            <button
              onClick={() => navigate('/login')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 shadow-lg"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="bg-white hover:bg-gray-50 text-indigo-600 font-semibold py-3 px-8 rounded-lg transition duration-200 shadow-lg border-2 border-indigo-600"
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {/* Nutrition Card */}
          <div className="bg-white border-2 border-indigo-200 rounded-lg shadow-lg p-8 hover:shadow-xl transition duration-200">
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Nutrition</h3>
              <p className="text-gray-600 leading-relaxed">
                Helps users keep track of what they eat throughout the day by allowing them to log their meals with food name and calories. Shows the daily meal list and total calorie intake, helping users stay aware of their eating habits.
              </p>
            </div>
          </div>

          {/* Fitness Card */}
          <div className="bg-white border-2 border-indigo-200 rounded-lg shadow-lg p-8 hover:shadow-xl transition duration-200">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Fitness</h3>
              <p className="text-gray-600 leading-relaxed">
                Users log their workouts with exercise type and duration or count. It displays recent workouts and weekly workout frequency to encourage consistency.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;


import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Select from '../components/Select';

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    age: '',
    gender: '',
    currentBodyWeight: '',
    height: '',
    fitnessFrequencyPerWeek: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [heightType, setHeightType] = useState('cm');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (formData.password !== confirmPassword) {
        setLoading(false);
        setError('Passwords do not match.');
        return;
      }

      let heightCm = 0;
      if (heightType === 'cm') {
        heightCm = Number(formData.height) || 0;
      } else {
        const ft = Number(heightFeet) || 0;
        const inch = Number(heightInches) || 0;
        heightCm = (ft * 12 + inch) * 2.54;
      }

      let weightKg = 0;
      if (weightUnit === 'kg') {
        weightKg = Number(formData.currentBodyWeight) || 0;
      } else {
        weightKg = (Number(formData.currentBodyWeight) || 0) * 0.45359237;
      }

      const response = await authAPI.signup({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        age: Number(formData.age),
        gender: formData.gender,
        currentBodyWeight: Number(weightKg.toFixed(2)),
        height: Number(heightCm.toFixed(1)),
        fitnessFrequencyPerWeek: formData.fitnessFrequencyPerWeek
      });

      login(response.data.user, response.data.token);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-3xl w-full bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Sign Up</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Age</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <Select
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                placeholder="Select gender"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Select
                label="Weight Unit"
                name="weightUnit"
                value={weightUnit}
                onChange={(e) => setWeightUnit(e.target.value)}
                required
                placeholder="Select unit"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="lb">Pounds (lb)</option>
              </Select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Current Body Weight ({weightUnit})</label>
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9.]*"
                name="currentBodyWeight"
                value={formData.currentBodyWeight}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Select
                label="Height Input Type"
                name="heightType"
                value={heightType}
                onChange={(e) => setHeightType(e.target.value)}
                required
                placeholder="Choose input format"
              >
                <option value="cm">Centimeters (cm)</option>
                <option value="ftin">Feet + Inches</option>
              </Select>
            </div>
            {heightType === 'cm' ? (
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Height (cm)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9.]*"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Feet</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., 5"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Inches</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={heightInches}
                    onChange={(e) => setHeightInches(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., 8"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <Select
              label="Fitness Frequency per Week"
              name="fitnessFrequencyPerWeek"
              value={formData.fitnessFrequencyPerWeek}
              onChange={handleChange}
              required
              placeholder="Select frequency"
            >
              <option value="0-1">0-1 times</option>
              <option value="2-3">2-3 times</option>
              <option value="4-5">4-5 times</option>
              <option value="6+">6+ times</option>
            </Select>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;


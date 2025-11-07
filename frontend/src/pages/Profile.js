import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../utils/api';
import ConfirmModal from '../components/ConfirmModal';
import Select from '../components/Select';

const Profile = () => {
  const navigate = useNavigate();
  const { logout, user: contextUser } = useAuth();
  const [showLogout, setShowLogout] = useState(false);
  const [formData, setFormData] = useState({
    age: '',
    currentBodyWeight: '',
    height: '',
    fitnessFrequencyPerWeek: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [heightType, setHeightType] = useState('cm'); // 'cm' | 'ftin'
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg'); // 'kg' | 'lb'

  useEffect(() => {
    fetchProfile();
  }, [contextUser]);

  const fetchProfile = async () => {
    try {
      const response = await profileAPI.getProfile();
      const user = response.data.user;
      setFormData({
        age: user.age || '',
        currentBodyWeight: user.currentBodyWeight || '',
        height: user.height || '',
        fitnessFrequencyPerWeek: user.fitnessFrequencyPerWeek || ''
      });
      if (user.height) {
        const totalInches = Number(user.height) / 2.54;
        const feet = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches - feet * 12);
        setHeightFeet(feet ? String(feet) : '');
        setHeightInches(inches ? String(inches) : '');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      // If profile fetch fails, try to use context user
      if (contextUser) {
        setFormData({
          age: contextUser.age || '',
          currentBodyWeight: contextUser.currentBodyWeight || '',
          height: contextUser.height || '',
          fitnessFrequencyPerWeek: contextUser.fitnessFrequencyPerWeek || ''
        });
        if (contextUser.height) {
          const totalInches = Number(contextUser.height) / 2.54;
          const feet = Math.floor(totalInches / 12);
          const inches = Math.round(totalInches - feet * 12);
          setHeightFeet(feet ? String(feet) : '');
          setHeightInches(inches ? String(inches) : '');
        }
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let heightCm = 0;
      if (heightType === 'cm') {
        heightCm = Number(formData.height) || 0;
      } else {
        const ft = Number(heightFeet) || 0;
        const inch = Number(heightInches) || 0;
        const totalInches = ft * 12 + inch;
        heightCm = totalInches * 2.54;
      }

      let weightKg = 0;
      if (weightUnit === 'kg') {
        weightKg = Number(formData.currentBodyWeight) || 0;
      } else {
        weightKg = (Number(formData.currentBodyWeight) || 0) * 0.45359237;
      }

      const updateData = {
        age: Number(formData.age),
        currentBodyWeight: Number(weightKg.toFixed(2)),
        height: Number(heightCm.toFixed(1)),
        fitnessFrequencyPerWeek: formData.fitnessFrequencyPerWeek
      };

      const response = await profileAPI.updateProfile(updateData);
      setSuccess('Profile updated successfully!');
      // Update form data with response
      if (response.data.user) {
        const u = response.data.user;
        setFormData({
          age: u.age || '',
          currentBodyWeight: u.currentBodyWeight || '',
          height: u.height || '',
          fitnessFrequencyPerWeek: u.fitnessFrequencyPerWeek || ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/home')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg transition duration-200"
            >
              ← Back
            </button>
          </div>
            <h1 className="text-2xl font-bold text-gray-800">Profile & Settings</h1>
          <button
            onClick={() => setShowLogout(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <ConfirmModal
          isOpen={showLogout}
          title="Confirm log out"
          message="You’re about to log out. Continue?"
          cancelText="Cancel"
          confirmText="Log out"
          onCancel={() => setShowLogout(false)}
          onConfirm={() => { setShowLogout(false); logout(); }}
        />
        {/* Profile Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Account Information</h2>
          <div className="space-y-2">
            <p><span className="font-semibold">Name:</span> {contextUser?.fullName}</p>
            <p><span className="font-semibold">Email:</span> {contextUser?.email}</p>
            <p><span className="font-semibold">Gender:</span> {contextUser?.gender}</p>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Update Profile</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="grid md:grid-cols-2 gap-4">
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
              <div>
                <Select
                  label="Weight Unit"
                  name="weightUnit"
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value)}
                  placeholder="Select unit"
                  required
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="lb">Pounds (lb)</option>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
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
              <div>
                <Select 
                  label="Height Input Type"
                  name="heightType"
                  value={heightType}
                  onChange={(e) => setHeightType(e.target.value)}
                  placeholder="Choose input format"
                  required
                >
                  <option value="cm">Centimeters (cm)</option>
                  <option value="ftin">Feet + Inches</option>
                </Select>
              </div>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;


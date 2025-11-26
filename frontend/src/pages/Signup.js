import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Select from '../components/Select';
import UnitSelect from '../components/UnitSelect';

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

      const submitData = new FormData();
      submitData.append('fullName', formData.fullName);
      submitData.append('email', formData.email);
      submitData.append('password', formData.password);
      submitData.append('age', formData.age);
      submitData.append('gender', formData.gender);
      submitData.append('currentBodyWeight', Number(weightKg.toFixed(2)));
      submitData.append('height', Number(heightCm.toFixed(1)));
      submitData.append('fitnessFrequencyPerWeek', formData.fitnessFrequencyPerWeek);
      submitData.append('weightUnit', weightUnit);
      submitData.append('heightUnit', heightType);

      submitData.append('weightUnit', weightUnit);
      submitData.append('heightUnit', heightType);

      const response = await authAPI.signup(submitData);

      login(response.data.user, response.data.token);
      navigate('/home');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Create Account
        </h2>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 shadow-sm">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Body Weight</label>
                <div className="relative rounded-xl shadow-sm border border-gray-200 focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all duration-200">
                  <input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9.]*"
                    name="currentBodyWeight"
                    value={formData.currentBodyWeight}
                    onChange={handleChange}
                    required
                    className="block w-full pl-4 pr-24 py-3 border-0 rounded-xl focus:ring-0 focus:outline-none bg-transparent"
                    placeholder="0.00"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <label htmlFor="weightUnit" className="sr-only">Unit</label>
                    <UnitSelect
                      id="weightUnit"
                      name="weightUnit"
                      value={weightUnit}
                      onChange={(e) => setWeightUnit(e.target.value)}
                      className="h-full py-0 pl-4 w-24 border-l border-gray-200 bg-white text-gray-700 font-medium rounded-r-xl focus:ring-0 focus:outline-none sm:text-sm cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <option value="kg">KG</option>
                      <option value="lb">LB</option>
                    </UnitSelect>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md"
                    placeholder="25"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    placeholder="Select"
                    className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Weight Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md"
                  placeholder="john@example.com"
                />
              </div>

              {/* Height Section */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                {heightType === 'cm' ? (
                  <div className="relative rounded-xl shadow-sm border border-gray-200 focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all duration-200">
                    <input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9.]*"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      required
                      className="block w-full pl-4 pr-24 py-3 border-0 rounded-xl focus:ring-0 focus:outline-none bg-transparent"
                      placeholder="0.0"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center">
                      <label htmlFor="heightUnit" className="sr-only">Unit</label>
                      <UnitSelect
                        id="heightUnit"
                        name="heightUnit"
                        value={heightType}
                        onChange={(e) => setHeightType(e.target.value)}
                        className="h-full py-0 pl-4 w-24 border-l border-gray-200 bg-white text-gray-700 font-medium rounded-r-xl focus:ring-0 focus:outline-none sm:text-sm cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <option value="cm">CM</option>
                        <option value="ftin">FT/IN</option>
                      </UnitSelect>
                    </div>
                  </div>
                ) : (
                  <div className="flex rounded-xl shadow-sm border border-gray-200 focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all duration-200 bg-white">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={heightFeet}
                        onChange={(e) => setHeightFeet(e.target.value)}
                        className="block w-full px-4 py-3 border-0 rounded-l-xl focus:ring-0 focus:outline-none bg-transparent"
                        placeholder="Feet"
                      />
                    </div>
                    <div className="relative flex-1 border-l border-gray-200">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={heightInches}
                        onChange={(e) => setHeightInches(e.target.value)}
                        className="block w-full px-4 py-3 border-0 focus:ring-0 focus:outline-none bg-transparent"
                        placeholder="Inches"
                      />
                    </div>
                    <div className="relative border-l border-gray-200">
                      <UnitSelect
                        value={heightType}
                        onChange={(e) => setHeightType(e.target.value)}
                        className="h-full py-0 pl-4 w-24 bg-transparent text-gray-700 font-medium rounded-r-xl focus:ring-0 focus:outline-none sm:text-sm cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <option value="cm">CM</option>
                        <option value="ftin">FT/IN</option>
                      </UnitSelect>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fitness Frequency</label>
                <Select
                  name="fitnessFrequencyPerWeek"
                  value={formData.fitnessFrequencyPerWeek}
                  onChange={handleChange}
                  required
                  placeholder="Workouts per week"
                  className="py-6"
                >
                  <option value="0-1">0-1 times</option>
                  <option value="2-3">2-3 times</option>
                  <option value="4-5">4-5 times</option>
                  <option value="6+">6+ times</option>
                </Select>
              </div>
            </div>
          </div>



          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transform transition-all duration-200 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>

          <p className="text-center text-gray-600 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline">
              Log In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;

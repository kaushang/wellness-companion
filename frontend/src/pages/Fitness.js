import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fitnessAPI } from '../utils/api';
import ConfirmModal from '../components/ConfirmModal';

const Fitness = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showLogout, setShowLogout] = useState(false);
  const [formData, setFormData] = useState({
    workoutType: '',
    duration: '',
    sets: '',
    reps: ''
  });
  const [workouts, setWorkouts] = useState([]);
  const [daysExercisedCount, setDaysExercisedCount] = useState(0);
  const [todayWorkouts, setTodayWorkouts] = useState([]);
  const [last7DaysGroups, setLast7DaysGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingWorkout, setEditingWorkout] = useState(null);

  useEffect(() => {
    fetchWeekWorkouts();
  }, []);

  const fetchWeekWorkouts = async () => {
    try {
      const response = await fitnessAPI.getWeekWorkouts();
      const list = response.data.workouts || [];
      setWorkouts(list);
      buildDerived(list);
    } catch (err) {
      console.error('Error fetching workouts:', err);
    }
  };

  const buildDerived = (list) => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const todays = list.filter(w => {
      const d = new Date(w.timestamp);
      return d >= startOfToday && d <= endOfToday;
    });
    setTodayWorkouts(todays);

    const byDate = {};
    list.forEach(w => {
      const d = new Date(w.timestamp);
      const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
      if (!byDate[key]) byDate[key] = { date: new Date(d.getFullYear(), d.getMonth(), d.getDate()), workouts: [] };
      byDate[key].workouts.push(w);
    });
    const groups = Object.values(byDate).sort((a, b) => b.date - a.date);
    setLast7DaysGroups(groups);
    setDaysExercisedCount(groups.length);
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
    setLoading(true);

    try {
      const workoutData = {
        workoutType: formData.workoutType,
      };

      if (formData.duration) {
        workoutData.duration = Number(formData.duration);
      }
      if (formData.sets) {
        workoutData.sets = Number(formData.sets);
      }
      if (formData.reps) {
        workoutData.reps = Number(formData.reps);
      }

      if (editingWorkout) {
        await fitnessAPI.updateWorkout(editingWorkout._id, workoutData);
        setEditingWorkout(null);
      } else {
        await fitnessAPI.logWorkout(workoutData);
      }

      setFormData({ workoutType: '', duration: '', sets: '', reps: '' });
      fetchWeekWorkouts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (workout) => {
    setEditingWorkout(workout);
    setFormData({
      workoutType: workout.workoutType,
      duration: workout.duration || '',
      sets: workout.sets || '',
      reps: workout.reps || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingWorkout(null);
    setFormData({ workoutType: '', duration: '', sets: '', reps: '' });
  };

  const handleDelete = async (workoutId) => {
    setWorkouts(prev => {
      const updated = prev.filter(w => w._id !== workoutId);
      buildDerived(updated);
      return updated;
    });
    try {
      await fitnessAPI.deleteWorkout(workoutId);
    } catch (e) {
      fetchWeekWorkouts();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ' at ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
          <h1 className="text-2xl font-bold text-gray-800">Fitness</h1>
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
        {/* Weekly Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">This Week's Summary</h2>
          <div className="text-center">
            <p className="text-gray-600 mb-2">Days Exercised This Week</p>
            <p className="text-5xl font-bold text-blue-600">{daysExercisedCount}</p>
            <p className="text-gray-600 mt-4">
              {daysExercisedCount === 0
                ? "Let's get started! Log your first workout."
                : daysExercisedCount === 1
                  ? "Great start! Keep up the momentum."
                  : `You exercised on ${daysExercisedCount} days this week.`}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Log Workout Form */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-12 md:mb-0">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editingWorkout ? 'Edit Workout' : 'Log a Workout'}
            </h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Exercise</label>
                <input
                  type="text"
                  name="workoutType"
                  value={formData.workoutType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Pushups, Running, Cycling"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., 30"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Sets</label>
                  <input
                    type="number"
                    name="sets"
                    value={formData.sets}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., 3"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Reps</label>
                  <input
                    type="number"
                    name="reps"
                    value={formData.reps}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., 12"
                  />
                </div>
              </div>


              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 mb-36 rounded-lg transition duration-200 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingWorkout ? 'Update Workout' : 'Log Workout'}
                </button>
                {editingWorkout && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Today's Workout */}
          <div className="bg-white rounded-lg shadow-lg p-6 ">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Today's Workout</h2>
            {todayWorkouts.length === 0 ? (
              <p className="text-gray-600 text-center py-8 h-full">No workouts logged today.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto scroll-panel pr-1">
                {todayWorkouts.map((workout) => (
                  <div key={workout._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{workout.workoutType}</h3>
                        <p className="text-sm text-gray-500">{formatTime(workout.timestamp)}</p>
                        <div className="flex gap-4 mt-2 text-sm">
                          {workout.duration && (
                            <span className="text-blue-600">Duration: {workout.duration} min</span>
                          )}
                          {workout.sets && (
                            <span className="text-green-600">Sets: {workout.sets}</span>
                          )}
                          {workout.reps && (
                            <span className="text-indigo-600">Reps: {workout.reps}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <button
                          onClick={() => handleEdit(workout)}
                          className="text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(workout._id)}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Last 7 Days Workouts */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Last 7 Days Workouts</h2>
          {last7DaysGroups.length === 0 ? (
            <p className="text-gray-600">No workouts logged in the last 7 days.</p>
          ) : (
            <div className="space-y-4">
              {last7DaysGroups.map(group => (
                <div key={group.date.toISOString()} className="border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-800 mb-2">
                    {group.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="space-y-2">
                    {group.workouts.map(w => (
                      <div key={w._id} className="flex justify-between text-sm text-gray-700">
                        <div className="flex-1">
                          {w.workoutType}
                          {w.duration ? ` • ${w.duration} min` : ''}
                          {w.sets ? ` • ${w.sets} sets` : ''}
                          {w.reps ? ` • ${w.reps} reps` : ''}
                        </div>
                        <div className="text-gray-500">{new Date(w.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Fitness;

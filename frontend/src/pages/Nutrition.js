import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { nutritionAPI } from '../utils/api';
import PieChart from '../components/PieChart';
import ConfirmModal from '../components/ConfirmModal';

const Nutrition = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showLogout, setShowLogout] = useState(false);
  const [formData, setFormData] = useState({
    foodItemName: '',
    calories: '',
    quantity: '',
    protein: '',
    carbohydrates: '',
    fats: ''
  });
  const [meals, setMeals] = useState([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [totalCarbs, setTotalCarbs] = useState(0);
  const [totalFats, setTotalFats] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [editingMeal, setEditingMeal] = useState(null);
  const [last7Days, setLast7Days] = useState([]);

  useEffect(() => {
    fetchTodayMeals();
    fetchLast7Days();
  }, []);

  useEffect(() => {
    generateSuggestion();
  }, [totalCalories, meals]);

  const fetchTodayMeals = async () => {
    try {
      const response = await nutritionAPI.getTodayMeals();
      setMeals(response.data.meals);
      setTotalCalories(response.data.totalCalories || 0);
      setTotalProtein(response.data.totalProtein || 0);
      setTotalCarbs(response.data.totalCarbs || 0);
      setTotalFats(response.data.totalFats || 0);
    } catch (err) {
      console.error('Error fetching meals:', err);
    }
  };

  const fetchLast7Days = async () => {
    try {
      const response = await nutritionAPI.getAllMeals();
      const allMeals = response.data.meals || [];
      const now = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 6);
      const byDay = {};
      allMeals.forEach(m => {
        const d = new Date(m.timestamp);
        if (d >= new Date(sevenDaysAgo.setHours(0,0,0,0))) {
          const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
          if (!byDay[key]) {
            byDay[key] = { date: new Date(d.getFullYear(), d.getMonth(), d.getDate()), calories: 0, protein: 0, carbohydrates: 0, fats: 0 };
          }
          byDay[key].calories += m.calories || 0;
          byDay[key].protein += m.protein || 0;
          byDay[key].carbohydrates += m.carbohydrates || 0;
          byDay[key].fats += m.fats || 0;
        }
      });
      const list = Object.values(byDay).sort((a, b) => b.date - a.date);
      setLast7Days(list);
    } catch (e) {
      // ignore summary fetch errors
    }
  };

  const generateSuggestion = () => {
    const avgDailyCalories = 2000; // Average daily caloric needs
    const proteinFoods = meals.filter(meal => 
      meal.foodItemName.toLowerCase().includes('chicken') ||
      meal.foodItemName.toLowerCase().includes('fish') ||
      meal.foodItemName.toLowerCase().includes('egg') ||
      meal.foodItemName.toLowerCase().includes('protein') ||
      meal.foodItemName.toLowerCase().includes('meat')
    );

    if (totalCalories < avgDailyCalories * 0.7) {
      setSuggestion("You're slightly low on calories today. Consider adding a healthy snack!");
    } else if (totalCalories > avgDailyCalories * 1.3) {
      setSuggestion("You've consumed quite a bit today. Consider lighter options for your next meal.");
    } else {
      setSuggestion("You're on track with your calorie intake!");
    }

    if (proteinFoods.length < 2 && meals.length >= 2) {
      setSuggestion(prev => prev + " Try to include more protein in your meals.");
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
    setLoading(true);

    try {
      if (editingMeal) {
        await nutritionAPI.updateMeal(editingMeal._id, {
          foodItemName: formData.foodItemName,
          calories: Number(formData.calories),
          quantity: formData.quantity ? Number(formData.quantity) : undefined,
          protein: formData.protein ? Number(formData.protein) : 0,
          carbohydrates: formData.carbohydrates ? Number(formData.carbohydrates) : 0,
          fats: formData.fats ? Number(formData.fats) : 0
        });
        setEditingMeal(null);
      } else {
        await nutritionAPI.logMeal({
          foodItemName: formData.foodItemName,
          calories: Number(formData.calories),
          quantity: formData.quantity ? Number(formData.quantity) : undefined,
          protein: formData.protein ? Number(formData.protein) : 0,
          carbohydrates: formData.carbohydrates ? Number(formData.carbohydrates) : 0,
          fats: formData.fats ? Number(formData.fats) : 0
        });
      }
      
      setFormData({ 
        foodItemName: '', 
        calories: '', 
        quantity: '',
        protein: '',
        carbohydrates: '',
        fats: ''
      });
      fetchTodayMeals();
      fetchLast7Days();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log meal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (meal) => {
    setEditingMeal(meal);
    setFormData({
      foodItemName: meal.foodItemName,
      calories: meal.calories,
      quantity: meal.quantity || '',
      protein: meal.protein || '',
      carbohydrates: meal.carbohydrates || '',
      fats: meal.fats || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingMeal(null);
    setFormData({ 
      foodItemName: '', 
      calories: '', 
      quantity: '',
      protein: '',
      carbohydrates: '',
      fats: ''
    });
  };

  const recalcTotalsFromMeals = (list) => {
    const totals = list.reduce((acc, m) => {
      acc.calories += m.calories || 0;
      acc.protein += m.protein || 0;
      acc.carbs += m.carbohydrates || 0;
      acc.fats += m.fats || 0;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
    setTotalCalories(totals.calories);
    setTotalProtein(totals.protein);
    setTotalCarbs(totals.carbs);
    setTotalFats(totals.fats);
  };

  const handleDelete = async (mealId) => {
    // Optimistic UI update
    setMeals(prev => {
      const updated = prev.filter(m => m._id !== mealId);
      recalcTotalsFromMeals(updated);
      return updated;
    });
    try {
      await nutritionAPI.deleteMeal(mealId);
      // Refresh summaries in background
      fetchLast7Days();
    } catch (err) {
      // On error, refetch to restore accurate state
      fetchTodayMeals();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
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
            <h1 className="text-2xl font-bold text-gray-800">Nutrition</h1>
          <button
            onClick={() => setShowLogout(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200"
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
        {/* Today's Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Today's Summary</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600">Total Calories</p>
                  <p className="text-3xl font-bold text-indigo-600">{totalCalories}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-600">Meals Logged</p>
                  <p className="text-3xl font-bold text-green-600">{meals.length}</p>
                </div>
              </div>

              {suggestion && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded ">
                  <p className="text-blue-800">{suggestion}</p>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Macros Distribution</h3>
              <PieChart protein={totalProtein} carbs={totalCarbs} fats={totalFats} />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Log Meal Form */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 md:mb-0">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {editingMeal ? 'Edit Meal' : 'Log a Meal'}
          </h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Food Item Name</label>
              <input
                type="text"
                name="foodItemName"
                value={formData.foodItemName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Grilled Chicken Breast"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Approx Calories</label>
                <input
                  type="number"
                  name="calories"
                  value={formData.calories}
                  onChange={handleChange}
                  required
                  min="0"
                  step="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., 250"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., 100 (grams)"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Protein (g)</label>
                <input
                  type="number"
                  name="protein"
                  value={formData.protein}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Carbohydrates (g)</label>
                <input
                  type="number"
                  name="carbohydrates"
                  value={formData.carbohydrates}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Fats (g)</label>
                <input
                  type="number"
                  name="fats"
                  value={formData.fats}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingMeal ? 'Update Meal' : 'Log Meal'}
              </button>
              {editingMeal && (
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

          {/* Today's Meals List */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Today's Meals</h2>
            {meals.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No meals logged today. Start logging your meals!</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto scroll-panel pr-1">
                {meals.map((meal) => (
                  <div key={meal._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{meal.foodItemName}</h3>
                        <p className="text-sm text-gray-500">{formatTime(meal.timestamp)}</p>
                        <div className="mt-2 flex gap-4 text-sm">
                          <span className="font-bold text-indigo-600">{meal.calories} cal</span>
                          {meal.quantity && (
                            <span className="text-gray-600">Quantity: {meal.quantity}g</span>
                          )}
                          {(meal.protein || meal.carbohydrates || meal.fats) && (
                            <span className="text-gray-600">
                              P: {meal.protein || 0}g | C: {meal.carbohydrates || 0}g | F: {meal.fats || 0}g
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <button
                          onClick={() => handleEdit(meal)}
                          className="text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(meal._id)}
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

        {/* Previous 7 Days Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Previous 7 Days Summary</h2>
          {last7Days.length === 0 ? (
            <p className="text-gray-600">No data available.</p>
          ) : (
            <div className="space-y-3">
              {last7Days.map((d) => (
                <div key={d.date.toISOString()} className="flex justify-between items-center border border-gray-200 rounded-lg p-4">
                  <div className="font-medium text-gray-800">
                    {d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="text-sm text-gray-700 flex gap-4">
                    <span className="font-semibold text-indigo-600">{d.calories} cal</span>
                    <span>P: {Math.round(d.protein)}g</span>
                    <span>C: {Math.round(d.carbohydrates)}g</span>
                    <span>F: {Math.round(d.fats)}g</span>
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

export default Nutrition;

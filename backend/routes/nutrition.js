const express = require('express');
const Nutrition = require('../models/Nutrition');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Log a meal
router.post('/log', authMiddleware, async (req, res) => {
  try {
    const { foodItemName, calories, quantity, protein, carbohydrates, fats } = req.body;

    if (!foodItemName || calories === undefined) {
      return res.status(400).json({ message: 'Food item name and calories are required' });
    }

    const nutrition = new Nutrition({
      userId: req.user._id,
      foodItemName,
      calories: Number(calories),
      quantity: quantity ? Number(quantity) : undefined,
      protein: protein ? Number(protein) : 0,
      carbohydrates: carbohydrates ? Number(carbohydrates) : 0,
      fats: fats ? Number(fats) : 0,
      timestamp: new Date()
    });

    await nutrition.save();
    res.status(201).json({ message: 'Meal logged successfully', nutrition });
  } catch (error) {
    console.error('Log meal error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a meal
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { foodItemName, calories, quantity, protein, carbohydrates, fats } = req.body;

    const nutrition = await Nutrition.findOne({ _id: req.params.id, userId: req.user._id });
    if (!nutrition) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    if (foodItemName) nutrition.foodItemName = foodItemName;
    if (calories !== undefined) nutrition.calories = Number(calories);
    if (quantity !== undefined) nutrition.quantity = quantity ? Number(quantity) : undefined;
    if (protein !== undefined) nutrition.protein = Number(protein);
    if (carbohydrates !== undefined) nutrition.carbohydrates = Number(carbohydrates);
    if (fats !== undefined) nutrition.fats = Number(fats);

    await nutrition.save();
    res.json({ message: 'Meal updated successfully', nutrition });
  } catch (error) {
    console.error('Update meal error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get meals for today
router.get('/today', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const meals = await Nutrition.find({
      userId: req.user._id,
      timestamp: {
        $gte: today,
        $lt: tomorrow
      }
    }).sort({ timestamp: -1 });

    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = meals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
    const totalCarbs = meals.reduce((sum, meal) => sum + (meal.carbohydrates || 0), 0);
    const totalFats = meals.reduce((sum, meal) => sum + (meal.fats || 0), 0);

    res.json({ meals, totalCalories, totalProtein, totalCarbs, totalFats });
  } catch (error) {
    console.error('Get meals error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all meals
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const meals = await Nutrition.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(100);

    res.json({ meals });
  } catch (error) {
    console.error('Get all meals error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a meal
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Nutrition.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!deleted) {
      return res.status(404).json({ message: 'Meal not found' });
    }
    res.json({ message: 'Meal deleted successfully' });
  } catch (error) {
    console.error('Delete meal error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;


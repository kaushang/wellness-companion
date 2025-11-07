const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get user profile
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { age, currentBodyWeight, height, fitnessFrequencyPerWeek } = req.body;

    const updateFields = {};
    if (age !== undefined) updateFields.age = age;
    if (currentBodyWeight !== undefined) updateFields.currentBodyWeight = currentBodyWeight;
    if (height !== undefined) updateFields.height = height;
    if (fitnessFrequencyPerWeek !== undefined) updateFields.fitnessFrequencyPerWeek = fitnessFrequencyPerWeek;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;


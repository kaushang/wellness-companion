const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { fullName, email, password, age, gender, currentBodyWeight, height, fitnessFrequencyPerWeek } = req.body;

    // Validation
    if (!fullName || !email || !password || !age || !gender || !currentBodyWeight || !height || !fitnessFrequencyPerWeek) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = new User({
      fullName,
      email,
      password,
      age,
      gender,
      currentBodyWeight,
      height,
      fitnessFrequencyPerWeek
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        age: user.age,
        gender: user.gender,
        currentBodyWeight: user.currentBodyWeight,
        height: user.height,
        fitnessFrequencyPerWeek: user.fitnessFrequencyPerWeek
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        age: user.age,
        gender: user.gender,
        currentBodyWeight: user.currentBodyWeight,
        height: user.height,
        fitnessFrequencyPerWeek: user.fitnessFrequencyPerWeek
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;


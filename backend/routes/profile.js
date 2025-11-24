const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

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
router.put('/', authMiddleware, upload.single('profilePhoto'), async (req, res) => {
  try {
    const { age, currentBodyWeight, height, fitnessFrequencyPerWeek, weightUnit, heightUnit } = req.body;

    const updateFields = {};
    if (age !== undefined) updateFields.age = age;
    if (currentBodyWeight !== undefined) updateFields.currentBodyWeight = currentBodyWeight;
    if (height !== undefined) updateFields.height = height;
    if (fitnessFrequencyPerWeek !== undefined) updateFields.fitnessFrequencyPerWeek = fitnessFrequencyPerWeek;
    if (weightUnit !== undefined) updateFields.weightUnit = weightUnit;
    if (heightUnit !== undefined) updateFields.heightUnit = heightUnit;
    if (req.file) updateFields.profilePhoto = req.file.path.replace(/\\/g, '/');

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

// Delete profile photo
router.delete('/photo', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.profilePhoto) {
      const filePath = path.join(__dirname, '..', user.profilePhoto);
      // Check if file exists before deleting
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      user.profilePhoto = '';
      await user.save();
    }

    res.json({ message: 'Profile photo removed successfully', user });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user account
router.delete('/', authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;


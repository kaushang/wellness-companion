const express = require('express');
const Fitness = require('../models/Fitness');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Log a workout
router.post('/log', authMiddleware, async (req, res) => {
  try {
    const { workoutType, duration, sets, reps } = req.body;

    if (!workoutType) {
      return res.status(400).json({ message: 'Workout type is required' });
    }

    const fitness = new Fitness({
      userId: req.user._id,
      workoutType,
      duration: duration ? Number(duration) : undefined,
      sets: sets ? Number(sets) : undefined,
      reps: reps ? Number(reps) : undefined,
      timestamp: new Date()
    });

    await fitness.save();
    res.status(201).json({ message: 'Workout logged successfully', fitness });
  } catch (error) {
    console.error('Log workout error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a workout
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { workoutType, duration, sets, reps } = req.body;

    const fitness = await Fitness.findOne({ _id: req.params.id, userId: req.user._id });
    if (!fitness) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    if (workoutType) fitness.workoutType = workoutType;
    if (duration !== undefined) fitness.duration = duration ? Number(duration) : undefined;
    if (sets !== undefined) fitness.sets = sets ? Number(sets) : undefined;
    if (reps !== undefined) fitness.reps = reps ? Number(reps) : undefined;

    await fitness.save();
    res.json({ message: 'Workout updated successfully', fitness });
  } catch (error) {
    console.error('Update workout error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get workouts for this week
router.get('/week', authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const workouts = await Fitness.find({
      userId: req.user._id,
      timestamp: { $gte: startOfWeek }
    }).sort({ timestamp: -1 });

    const workoutCount = workouts.length;

    res.json({ workouts, workoutCount });
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all workouts
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const workouts = await Fitness.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(100);

    res.json({ workouts });
  } catch (error) {
    console.error('Get all workouts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a workout
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Fitness.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!deleted) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;


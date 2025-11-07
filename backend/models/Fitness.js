const mongoose = require('mongoose');

const fitnessSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workoutType: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number,
    required: false,
    min: 0
  },
  sets: {
    type: Number,
    required: false,
    min: 0
  },
  reps: {
    type: Number,
    required: false,
    min: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Fitness', fitnessSchema);


const mongoose = require('mongoose');

const nutritionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  foodItemName: {
    type: String,
    required: true,
    trim: true
  },
  calories: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: false,
    min: 0
  },
  protein: {
    type: Number,
    default: 0,
    min: 0
  },
  carbohydrates: {
    type: Number,
    default: 0,
    min: 0
  },
  fats: {
    type: Number,
    default: 0,
    min: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Nutrition', nutritionSchema);


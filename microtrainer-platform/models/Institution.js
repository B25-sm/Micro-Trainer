// =======================================================
// 🏢 INSTITUTION MODEL
// MongoDB schema for institutions
// =======================================================

const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
  institution_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  api_key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  plan: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free'
  },
  active: {
    type: Boolean,
    default: true
  },
  usage: {
    total_students: { type: Number, default: 0 },
    total_interviews: { type: Number, default: 0 },
    last_sync: { type: Date }
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Institution', institutionSchema);

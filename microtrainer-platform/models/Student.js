// =======================================================
// 📚 STUDENT MODEL
// MongoDB schema for student profiles
// =======================================================

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  student_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  institution_id: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  total_interviews: {
    type: Number,
    default: 0
  },
  average_score: {
    type: Number,
    default: 0
  },
  strengths: [{
    type: String
  }],
  weak_topics: [{
    type: String
  }],
  cheating_incidents: {
    type: Number,
    default: 0
  },
  performance_trend: {
    type: String,
    enum: ['improving', 'stable', 'declining', 'new'],
    default: 'new'
  },
  last_interview_date: {
    type: Date
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

// Compound index for institution queries
studentSchema.index({ institution_id: 1, average_score: -1 });

module.exports = mongoose.model('Student', studentSchema);

// =======================================================
// 📝 INTERVIEW MODEL
// MongoDB schema for interview summaries
// =======================================================

const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  interview_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  student_id: {
    type: String,
    required: true,
    index: true
  },
  institution_id: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  subject: {
    type: String,
    required: true
  },
  scores: {
    technical: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    problem_solving: { type: Number, default: 0 },
    overall: { type: Number, default: 0 }
  },
  anti_cheat: {
    warnings: { type: Number, default: 0 },
    suspicion_score: { type: Number, default: 0 },
    cheating_risk: { 
      type: String, 
      enum: ['low', 'medium', 'high'],
      default: 'low'
    },
    flagged: { type: Boolean, default: false }
  },
  strengths: [{
    type: String
  }],
  weak_topics: [{
    type: String
  }],
  progress: {
    compared_to_previous: { type: String, default: 'N/A' },
    consistency_score: { type: Number, default: 0 },
    interview_count: { type: Number, default: 1 }
  },
  duration_minutes: {
    type: Number,
    default: 0
  },
  questions_answered: {
    type: Number,
    default: 0
  },
  completion_rate: {
    type: Number,
    default: 100
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

// Compound indexes for common queries
interviewSchema.index({ student_id: 1, date: -1 });
interviewSchema.index({ institution_id: 1, date: -1 });
interviewSchema.index({ date: -1 });

module.exports = mongoose.model('Interview', interviewSchema);

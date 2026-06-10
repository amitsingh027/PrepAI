const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const interviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['behavioral', 'technical', 'system-design', 'coding'],
    required: true
  },
  topic: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  messages: [messageSchema],
  feedback: {
    score: { type: Number, min: 0, max: 100 },
    strengths: [String],
    improvements: [String],
    summary: String
  },
  duration: { type: Number, default: 0 }, // in seconds
  status: { type: String, enum: ['active', 'completed', 'abandoned'], default: 'active' },
  code: { type: String, default: '' },
  language: { type: String, default: 'javascript' },
  createdAt: { type: Date, default: Date.now },
  completedAt: Date
});

module.exports = mongoose.model('Interview', interviewSchema);

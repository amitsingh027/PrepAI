const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['behavioral', 'technical', 'system-design', 'coding'], required: true },
  topic: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  tags: [String],
  sampleAnswer: { type: String },
  hints: [String],
  starterCode: { type: String },
  testCases: [{
    input: String,
    expectedOutput: String
  }],
  companies: [String],
  timesAttempted: { type: Number, default: 0 }
});

module.exports = mongoose.model('Question', questionSchema);

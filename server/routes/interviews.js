const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Interview = require('../models/Interview');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash'
});

const SYSTEM_PROMPTS = {
  behavioral: `You are a senior software engineer conducting a behavioral interview at a top tech company (Google/Meta/Amazon level).
Ask thoughtful follow-up questions using the STAR method (Situation, Task, Action, Result).
Be professional but encouraging. After each answer, ask one focused follow-up or transition naturally to the next question.
Give brief, constructive feedback inline. Keep responses concise (2-4 sentences max per turn).`,

  technical: `You are a technical interviewer at a FAANG company conducting a technical interview.
Ask questions about algorithms, data structures, system concepts, and coding patterns.
Guide the candidate with hints if they're stuck. Evaluate their thought process, not just the final answer.
Keep responses focused and under 150 words.`,

  'system-design': `You are a staff engineer conducting a system design interview.
Ask the candidate to design large-scale distributed systems. Probe for scalability, reliability, and trade-offs.
Follow up on their design decisions. Be thorough but fair. Keep responses under 200 words.`,

  coding: `You are a coding interviewer. The candidate will share their code with you.
Review their solution, point out bugs, suggest optimizations, and discuss time/space complexity.
Be encouraging but rigorous. Keep feedback under 150 words.`
};

// Create new interview session
router.post('/', protect, async (req, res) => {
  try {
    const { type, topic, difficulty, question } = req.body;

    const systemPrompt =
      SYSTEM_PROMPTS[type] || SYSTEM_PROMPTS.behavioral;

    const result = await model.generateContent(
      `System Instructions:
${systemPrompt}

Start a ${difficulty} ${type} interview.

Topic: ${topic}

Question Hint:
${question || 'Choose an appropriate question'}

Open with a warm greeting and your first interview question.`
    );

    const aiMessage = result.response.text();

    const interview = await Interview.create({
      user: req.user._id,
      type,
      topic,
      difficulty,
      messages: [
        {
          role: 'assistant',
          content: aiMessage
        }
      ]
    });

    res.status(201).json({ interview });
  } catch (err) {
    console.error('Interview Creation Error:', err);
    res.status(500).json({
      message: err.message
    });
  }
});

// Send message during interview
router.post('/:id/message', protect, async (req, res) => {
  try {
    const { content, code } = req.body;

    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!interview) {
      return res.status(404).json({
        message: 'Interview not found'
      });
    }

    if (interview.status !== 'active') {
      return res.status(400).json({
        message: 'Interview is not active'
      });
    }

    const userMessage = code
      ? `${content}\n\nMy Code:\n\`\`\`\n${code}\n\`\`\``
      : content;

    interview.messages.push({
      role: 'user',
      content: userMessage
    });

    const conversation = interview.messages
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');

    const result = await model.generateContent(
      `${SYSTEM_PROMPTS[interview.type]}

Conversation History:

${conversation}

Continue the interview naturally with either:
1. A follow-up question
2. Brief feedback
3. The next interview question`
    );

    const aiReply = result.response.text();

    interview.messages.push({
      role: 'assistant',
      content: aiReply
    });

    if (code) {
      interview.code = code;
    }

    await interview.save();

    res.json({
      message: aiReply,
      interview
    });
  } catch (err) {
    console.error('Message Error:', err);
    res.status(500).json({
      message: err.message
    });
  }
});

// Complete interview
router.post('/:id/complete', protect, async (req, res) => {
  try {
    const { duration } = req.body;

    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!interview) {
      return res.status(404).json({
        message: 'Interview not found'
      });
    }

    const conversationText = interview.messages
      .map(
        m =>
          `${m.role.toUpperCase()}: ${m.content}`
      )
      .join('\n\n');

    const result = await model.generateContent(
      `Analyze this ${interview.type} interview and return ONLY valid JSON.

{
  "score": 0,
  "strengths": [],
  "improvements": [],
  "summary": ""
}

Interview Transcript:

${conversationText}`
    );

    let feedback;

    try {
      const raw = result.response
        .text()
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      feedback = JSON.parse(raw);
    } catch (parseError) {
      feedback = {
        score: 70,
        strengths: ['Good participation'],
        improvements: ['Keep practicing'],
        summary:
          'Interview completed successfully.'
      };
    }

    interview.feedback = feedback;
    interview.status = 'completed';
    interview.duration = duration || 0;
    interview.completedAt = new Date();

    await interview.save();

    const xpEarned =
      Math.floor((feedback.score || 50) / 10) * 10;

    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        totalSessions: 1,
        xp: xpEarned
      }
    });

    res.json({
      interview,
      xpEarned
    });
  } catch (err) {
    console.error('Completion Error:', err);
    res.status(500).json({
      message: err.message
    });
  }
});

// Get all interviews
router.get('/', protect, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      status
    } = req.query;

    const filter = {
      user: req.user._id
    };

    if (type) filter.type = type;
    if (status) filter.status = status;

    const interviews = await Interview.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-messages');

    const total =
      await Interview.countDocuments(filter);

    res.json({
      interviews,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

// Get single interview
router.get('/:id', protect, async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!interview) {
      return res.status(404).json({
        message: 'Not found'
      });
    }

    res.json({ interview });
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

// Abandon interview
router.patch('/:id/abandon', protect, async (req, res) => {
  try {
    const interview =
      await Interview.findOneAndUpdate(
        {
          _id: req.params.id,
          user: req.user._id
        },
        {
          status: 'abandoned'
        },
        {
          new: true
        }
      );

    res.json({ interview });
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

module.exports = router;
const express = require('express');
const Interview = require('../models/Interview');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const [total, completed, byType, avgScoreResult, recent] = await Promise.all([
      Interview.countDocuments({ user: userId }),
      Interview.countDocuments({ user: userId, status: 'completed' }),
      Interview.aggregate([
        { $match: { user: userId, status: 'completed' } },
        { $group: { _id: '$type', count: { $sum: 1 }, avgScore: { $avg: '$feedback.score' } } }
      ]),
      Interview.aggregate([
        { $match: { user: userId, status: 'completed' } },
        { $group: { _id: null, avg: { $avg: '$feedback.score' } } }
      ]),
      Interview.find({ user: userId, status: 'completed' })
        .sort({ completedAt: -1 }).limit(5)
        .select('type topic difficulty feedback.score completedAt duration')
    ]);

    const last30Days = await Interview.aggregate([
      { $match: { user: userId, status: 'completed', completedAt: { $gte: new Date(Date.now() - 30 * 86400000) } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          count: { $sum: 1 },
          avgScore: { $avg: '$feedback.score' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      total,
      completed,
      avgScore: avgScoreResult[0]?.avg ? Math.round(avgScoreResult[0].avg) : 0,
      byType,
      recent,
      last30Days,
      user: req.user
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

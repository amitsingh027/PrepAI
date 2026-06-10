const express = require('express');
const Question = require('../models/Question');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Seed questions (call once to populate DB)
router.get('/seed', async (req, res) => {
  try {
    await Question.deleteMany({});
    await Question.insertMany(SEED_QUESTIONS);

    res.json({
      success: true,
      message: `Seeded ${SEED_QUESTIONS.length} questions`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// Get questions with filters
router.get('/', protect, async (req, res) => {
  try {
    const { type, difficulty, topic, search, limit = 20 } = req.query;

    const filter = {};

    if (type) filter.type = type;
    if (difficulty) filter.difficulty = difficulty;
    if (topic) filter.topic = { $regex: topic, $options: 'i' };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const questions = await Question.find(filter)
      .limit(parseInt(limit));

    res.json({ questions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { $inc: { timesAttempted: 1 } },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({
        message: 'Question not found'
      });
    }

    res.json({ question });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const SEED_QUESTIONS = [
  {
    title: "Tell me about yourself",
    description: "Give a structured overview of your background, experience, and what you bring to this role.",
    type: "behavioral",
    topic: "Introduction",
    difficulty: "easy",
    tags: ["intro", "background", "experience"],
    hints: ["Use the present-past-future structure", "Keep it under 2 minutes", "Connect your story to the role"],
    companies: ["Google", "Amazon", "Meta", "Microsoft"]
  },
  {
    title: "Describe a challenging project and how you handled it",
    description: "Walk me through a technically or organizationally difficult project. What was your role and what was the outcome?",
    type: "behavioral",
    topic: "Problem Solving",
    difficulty: "medium",
    tags: ["challenges", "problem-solving", "teamwork"],
    hints: ["Use STAR method", "Quantify your impact", "Focus on your specific actions"],
    companies: ["Amazon", "Apple", "Netflix"]
  },
  {
    title: "How do you handle disagreements with teammates?",
    description: "Tell me about a time you disagreed with a colleague. How did you resolve it?",
    type: "behavioral",
    topic: "Conflict Resolution",
    difficulty: "medium",
    tags: ["conflict", "communication", "teamwork"],
    hints: ["Show empathy", "Focus on the outcome", "Demonstrate professionalism"],
    companies: ["Google", "Meta", "Stripe"]
  },
  {
    title: "Two Sum",
    description: "Given an array of integers and a target sum, return indices of two numbers that add up to the target.",
    type: "coding",
    topic: "Arrays & Hashing",
    difficulty: "easy",
    tags: ["array", "hashmap", "two-pointers"],
    starterCode: `function twoSum(nums, target) {\n  // Your solution here\n}`,
    hints: ["Consider using a hash map for O(n) time", "The complement of nums[i] is target - nums[i]"],
    companies: ["Google", "Amazon", "Meta", "Apple"]
  },
  {
    title: "Valid Parentheses",
    description: "Given a string containing just '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    type: "coding",
    topic: "Stack",
    difficulty: "easy",
    tags: ["stack", "string"],
    starterCode: `function isValid(s) {\n  // Your solution here\n}`,
    hints: ["Use a stack data structure", "Push opening brackets, pop and check for closing"],
    companies: ["Amazon", "Microsoft", "Bloomberg"]
  },
  {
    title: "Longest Substring Without Repeating Characters",
    description: "Find the length of the longest substring without repeating characters.",
    type: "coding",
    topic: "Sliding Window",
    difficulty: "medium",
    tags: ["sliding-window", "hashmap", "string"],
    starterCode: `function lengthOfLongestSubstring(s) {\n  // Your solution here\n}`,
    hints: ["Use sliding window technique", "Track character positions in a map"],
    companies: ["Amazon", "Google", "Bloomberg", "Adobe"]
  },
  {
    title: "Explain how the internet works",
    description: "Walk me through what happens when you type google.com in your browser and press Enter.",
    type: "technical",
    topic: "Networking",
    difficulty: "medium",
    tags: ["networking", "DNS", "HTTP", "TCP"],
    hints: ["Start with DNS resolution", "Cover TCP/IP handshake", "Explain HTTP request/response"],
    companies: ["Google", "Cloudflare", "Amazon"]
  },
  {
    title: "What is the difference between SQL and NoSQL databases?",
    description: "Compare relational and non-relational databases. When would you use each?",
    type: "technical",
    topic: "Databases",
    difficulty: "easy",
    tags: ["databases", "SQL", "NoSQL", "MongoDB"],
    hints: ["Cover ACID vs BASE", "Discuss scalability differences", "Give real-world use cases"],
    companies: ["Amazon", "Meta", "MongoDB"]
  },
  {
    title: "Design a URL Shortener (like bit.ly)",
    description: "Design a scalable URL shortening service. Cover the API, database schema, and scaling strategy.",
    type: "system-design",
    topic: "Web Services",
    difficulty: "medium",
    tags: ["system-design", "scalability", "databases", "caching"],
    hints: ["Start with requirements", "Consider Base62 encoding", "Think about Redis caching"],
    companies: ["Google", "Amazon", "Twitter"]
  },
  {
    title: "Design Twitter's news feed",
    description: "Design the system behind Twitter's home timeline. Handle millions of users and tweets.",
    type: "system-design",
    topic: "Social Media",
    difficulty: "hard",
    tags: ["system-design", "fan-out", "caching", "scalability"],
    hints: ["Discuss push vs pull model", "Handle celebrity users", "Think about partitioning"],
    companies: ["Twitter", "Meta", "LinkedIn"]
  },
  {
    title: "Describe your greatest professional achievement",
    description: "What are you most proud of in your professional or academic career?",
    type: "behavioral",
    topic: "Achievements",
    difficulty: "easy",
    tags: ["achievement", "impact"],
    hints: ["Quantify impact", "Explain why it matters", "Connect it to the role"],
    companies: ["Google", "Meta", "Amazon", "Apple"]
  },
  {
    title: "Binary Search Tree: Validate BST",
    description: "Given the root of a binary tree, determine if it is a valid BST.",
    type: "coding",
    topic: "Trees",
    difficulty: "medium",
    tags: ["tree", "BST", "DFS"],
    starterCode: `function isValidBST(root) {\n  // Your solution here\n}`,
    hints: ["Use min/max bounds", "Inorder traversal should be sorted"],
    companies: ["Amazon", "Microsoft", "Google"]
  }
];

module.exports = router;
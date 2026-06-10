# 🧠 PrepAI — AI-Powered Interview Preparation Platform

A full-stack SaaS application that helps software engineers prepare for technical interviews using AI coaching. Built with React, Node.js, MongoDB, and Anthropic's Claude AI.

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![Node](https://img.shields.io/badge/Node.js-18-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green) ![AI](https://img.shields.io/badge/Claude-AI-purple)

## ✨ Features

- **🤖 AI Mock Interviewer** — Practice with Claude AI that adapts to your responses, asks follow-ups, and evaluates using STAR method
- **💻 In-Browser Code Editor** — Monaco Editor (VS Code engine) with multi-language support
- **📚 Question Bank** — 100+ curated behavioral, technical, system design, and coding questions
- **📊 Progress Dashboard** — Score trends, session history, and performance analytics with Recharts
- **🔐 JWT Authentication** — Secure register/login with bcrypt password hashing
- **🏆 XP & Streak System** — Gamified daily streaks and XP rewards
- **📱 Responsive Design** — Works on mobile, tablet, and desktop

## 🏗️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, React Router v6, Recharts, Monaco Editor |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| AI | Anthropic Claude API (claude-sonnet-4) |
| Auth | JWT + bcryptjs |
| Styling | Custom CSS with CSS variables |
| Deployment | Render (full-stack) |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Anthropic API key

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/interview-prep.git
cd interview-prep
npm run install-all
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/interview-prep
JWT_SECRET=your_32_char_secret_here
ANTHROPIC_API_KEY=sk-ant-...
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### 3. Seed the Question Bank

```bash
# Start the server first, then in another terminal:
curl -X POST http://localhost:5000/api/questions/seed
```

### 4. Run Development Servers

```bash
npm run dev
# Opens React on :3000 and Express on :5000
```

## 📁 Project Structure

```
interview-prep/
├── server/
│   ├── index.js              # Express app entry
│   ├── models/
│   │   ├── User.js           # User schema
│   │   ├── Interview.js      # Interview session schema
│   │   └── Question.js       # Question bank schema
│   ├── routes/
│   │   ├── auth.js           # Register, login, profile
│   │   ├── interviews.js     # AI interview sessions
│   │   ├── questions.js      # Question bank + seeding
│   │   └── progress.js       # Analytics & stats
│   └── middleware/
│       └── auth.js           # JWT middleware
├── client/
│   └── src/
│       ├── App.js            # Routes & auth guards
│       ├── context/
│       │   └── AuthContext.js
│       ├── pages/
│       │   ├── Landing.js    # Marketing homepage
│       │   ├── Dashboard.js  # Start interviews
│       │   ├── Interview.js  # AI chat + code editor
│       │   ├── Questions.js  # Browse question bank
│       │   ├── History.js    # Session history table
│       │   └── Progress.js   # Analytics charts
│       └── components/
│           └── Layout.js     # Sidebar navigation
├── render.yaml               # Render deployment config
└── package.json
```

## 🌐 Deploy to Render

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/interview-prep.git
git push -u origin main
```

### Step 2: Create Render Web Service
1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repo
3. Set these settings:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### Step 3: Add Environment Variables in Render Dashboard
```
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret_key
ANTHROPIC_API_KEY=your_anthropic_key
CLIENT_URL=https://your-app.onrender.com
```

### Step 4: Set REACT_APP_API_URL
In Render, add a build-time env var:
```
REACT_APP_API_URL=/api
```

### Step 5: Seed Questions
After deploy, visit: `https://your-app.onrender.com/api/questions/seed` (POST request via curl or Postman)

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Interviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/interviews` | Start new AI interview |
| POST | `/api/interviews/:id/message` | Send message to AI |
| POST | `/api/interviews/:id/complete` | End interview + get feedback |
| GET | `/api/interviews` | List user's interviews |

### Questions & Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/questions` | Browse question bank |
| GET | `/api/progress/stats` | Get analytics data |

## 📸 Pages

- **Landing** — Marketing homepage with features and CTA
- **Dashboard** — Choose interview type, see recent sessions and stats
- **Interview** — AI chat interface with optional Monaco code editor, timer, real-time AI feedback
- **Questions** — Filterable question bank with hints and starter code
- **History** — Full session history table with scores
- **Progress** — Charts for score trends, sessions by type, performance breakdown

## 🎓 Resume Highlights

This project demonstrates:
- Full-stack development (React + Node.js + MongoDB)
- AI/LLM API integration (Anthropic Claude)
- RESTful API design with authentication and authorization
- Real-time UI with Monaco Editor integration
- Data visualization with Recharts
- Production deployment on cloud platforms
- JWT auth, rate limiting, and security best practices

## 📝 License

MIT — free to use for your portfolio.

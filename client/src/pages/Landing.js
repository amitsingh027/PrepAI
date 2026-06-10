import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Zap, Target, TrendingUp, Code, MessageSquare, Star, ArrowRight, CheckCircle } from 'lucide-react';
import './Landing.css';

const features = [
  { icon: Brain, title: 'AI Mock Interviewer', desc: 'Practice with a realistic AI interviewer that adapts to your responses and gives instant feedback.' },
  { icon: Code, title: 'In-Browser Code Editor', desc: 'Write, run and share code with syntax highlighting powered by Monaco Editor (VS Code engine).' },
  { icon: Target, title: '100+ Curated Questions', desc: 'Behavioral, technical, system design, and coding questions from top tech companies.' },
  { icon: TrendingUp, title: 'Progress Tracking', desc: 'Track your scores over time, see weak areas, and measure improvement with detailed analytics.' },
  { icon: MessageSquare, title: 'Instant Feedback', desc: 'Get a detailed score breakdown with strengths and areas for improvement after each session.' },
  { icon: Zap, title: 'Streak & XP System', desc: 'Stay motivated with daily streaks and XP rewards that gamify your interview prep journey.' },
];

const stats = [
  { value: '100+', label: 'Practice Questions' },
  { value: '4', label: 'Interview Types' },
  { value: 'AI', label: 'Powered Feedback' },
  { value: '∞', label: 'Practice Sessions' },
];

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="nav-brand"><Brain size={22} color="#6c63ff" /><span>PrepAI</span></div>
        <div className="nav-actions">
          <button className="btn btn-ghost" onClick={() => navigate('/login')}>Sign in</button>
          <button className="btn btn-primary" onClick={() => navigate('/register')}>Get started free</button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-badge"><Star size={14} /><span>AI-powered interview prep</span></div>
        <h1>Ace your <span className="gradient-text">tech interview</span><br />with AI coaching</h1>
        <p>Practice behavioral, technical, system design, and coding interviews with an AI that thinks like a FAANG interviewer. Get detailed feedback, track progress, and land the job.</p>
        <div className="hero-actions">
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
            Start practicing free <ArrowRight size={16} />
          </button>
          <button className="btn btn-ghost btn-lg" onClick={() => navigate('/login')}>Sign in →</button>
        </div>
        <div className="hero-checks">
          {['No credit card required', 'Unlimited practice sessions', 'Real AI feedback'].map(t => (
            <span key={t}><CheckCircle size={14} color="#00e5a0" />{t}</span>
          ))}
        </div>
      </section>

      <section className="stats-bar">
        {stats.map(s => (
          <div key={s.label} className="stat-item">
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      <section className="features-section">
        <h2>Everything you need to <span className="gradient-text">get hired</span></h2>
        <div className="features-grid">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="feature-card">
              <div className="feature-icon"><Icon size={22} /></div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to land your dream job?</h2>
        <p>Join thousands of engineers who use PrepAI to prepare for their tech interviews.</p>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
          Start for free <ArrowRight size={16} />
        </button>
      </section>

      <footer className="landing-footer">
        <div className="nav-brand"><Brain size={18} color="#6c63ff" /><span>PrepAI</span></div>
        <p>Built with React, Node.js, MongoDB & Claude AI</p>
      </footer>
    </div>
  );
}

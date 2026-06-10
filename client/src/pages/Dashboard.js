import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Zap, Flame, Target, MessageSquare, Code, Layers, Brain, ArrowRight, Trophy } from 'lucide-react';
import './Dashboard.css';

const INTERVIEW_TYPES = [
  { type: 'behavioral', icon: MessageSquare, label: 'Behavioral', color: '#a78bfa', topics: ['Leadership', 'Teamwork', 'Conflict', 'Achievements', 'Failures'] },
  { type: 'technical', icon: Brain, label: 'Technical', color: '#38bdf8', topics: ['Networking', 'OS', 'Databases', 'OOP', 'Web'] },
  { type: 'system-design', icon: Layers, label: 'System Design', color: '#fb923c', topics: ['URL Shortener', 'Twitter', 'Netflix', 'Uber', 'WhatsApp'] },
  { type: 'coding', icon: Code, label: 'Coding', color: '#00e5a0', topics: ['Arrays', 'Trees', 'DP', 'Graphs', 'Strings'] },
];

const DIFFICULTIES = ['easy', 'medium', 'hard'];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ topic: '', difficulty: 'medium', question: '' });
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    api.get('/progress/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  const startInterview = async () => {
    if (!form.topic) return toast.error('Please select a topic');
    setStarting(true);
    try {
      const { data } = await api.post('/interviews', { type: modal.type, ...form });
      navigate(`/interview/${data.interview._id}`);
    } catch (err) {
      toast.error('Failed to start interview');
      setStarting(false);
    }
  };

  return (
    <div className="dashboard fade-in">
      <div className="dash-header">
        <div>
          <h1>Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p>Ready to practice? Choose an interview type to get started.</p>
        </div>
        <div className="dash-badges">
          <div className="dash-badge"><Flame size={16} color="#fb923c" /><span>{user?.streak || 0} day streak</span></div>
          <div className="dash-badge"><Zap size={16} color="#ffd166" /><span>{user?.xp || 0} XP</span></div>
        </div>
      </div>

      {stats && (
        <div className="grid-4 stats-row">
          {[
            { label: 'Total Sessions', value: stats.total, icon: Target },
            { label: 'Completed', value: stats.completed, icon: Trophy },
            { label: 'Avg Score', value: stats.avgScore ? `${stats.avgScore}%` : '—', icon: Zap },
            { label: 'Day Streak', value: user?.streak || 0, icon: Flame },
          ].map(({ label, value, icon: Icon }) => (
            <div className="card stat-card" key={label}>
              <Icon size={18} color="var(--accent)" />
              <div className="stat-num">{value}</div>
              <div className="stat-lbl">{label}</div>
            </div>
          ))}
        </div>
      )}

      <h2 className="section-title">Start a Practice Session</h2>
      <div className="grid-2 type-grid">
        {INTERVIEW_TYPES.map(({ type, icon: Icon, label, color, topics }) => (
          <div key={type} className="type-card card" onClick={() => { setModal({ type, label, topics }); setForm({ topic: topics[0], difficulty: 'medium', question: '' }); }}>
            <div className="type-icon" style={{ background: color + '22', color }}><Icon size={24} /></div>
            <div>
              <h3>{label} Interview</h3>
              <p>Practice {label.toLowerCase()} questions with AI feedback</p>
              <div className="type-topics">{topics.slice(0, 3).map(t => <span key={t}>{t}</span>)}</div>
            </div>
            <ArrowRight size={18} className="type-arrow" />
          </div>
        ))}
      </div>

      {stats?.recent?.length > 0 && (
        <>
          <h2 className="section-title">Recent Sessions</h2>
          <div className="recent-list">
            {stats.recent.map(s => (
              <div key={s._id} className="recent-item card" onClick={() => navigate(`/interview/${s._id}`)}>
                <div className={`badge badge-${s.type}`}>{s.type}</div>
                <span className="recent-topic">{s.topic}</span>
                <span className={`badge badge-${s.difficulty}`}>{s.difficulty}</span>
                <span className="recent-score" style={{ color: getScoreColor(s.feedback?.score) }}>
                  {s.feedback?.score != null ? `${s.feedback.score}%` : '—'}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal card fade-in" onClick={e => e.stopPropagation()}>
            <h2>Start {modal.label} Interview</h2>
            <div className="form-group" style={{ marginTop: 20 }}>
              <label>Topic</label>
              <select className="input" value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}>
                {modal.topics.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Difficulty</label>
              <div className="diff-row">
                {DIFFICULTIES.map(d => (
                  <button key={d} className={`diff-btn ${form.difficulty === d ? 'active-' + d : ''}`}
                    onClick={() => setForm(f => ({ ...f, difficulty: d }))}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Custom question hint <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
              <input className="input" placeholder="e.g. Tell me about a time you led a project..."
                value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={startInterview} disabled={starting}>
                {starting ? <span className="spinner" /> : <>Start Interview <ArrowRight size={16} /></>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
function getScoreColor(s) {
  if (!s) return 'var(--text-muted)';
  if (s >= 80) return 'var(--green)';
  if (s >= 60) return 'var(--yellow)';
  return 'var(--red)';
}

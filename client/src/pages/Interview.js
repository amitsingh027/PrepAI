import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Send, Code, MessageSquare, CheckCircle, X, Clock, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import './Interview.css';

export default function Interview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [code, setCode] = useState('// Write your solution here\n');
  const [language, setLanguage] = useState('javascript');
  const [completing, setCompleting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const messagesEndRef = useRef(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    api.get(`/interviews/${id}`).then(r => {
      setInterview(r.data.interview);
      if (r.data.interview.type === 'coding') setShowCode(true);
      if (r.data.interview.code) setCode(r.data.interview.code);
      if (r.data.interview.status !== 'active') {
        setFeedback(r.data.interview.feedback);
        setShowFeedback(true);
      }
    }).catch(() => navigate('/dashboard'));
  }, [id, navigate]);

  useEffect(() => {
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startTime.current) / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [interview?.messages]);

  const sendMessage = async () => {
    if (!input.trim() && !showCode) return;
    const content = input.trim() || '(See my code above)';
    setInput('');
    setSending(true);
    try {
      const { data } = await api.post(`/interviews/${id}/message`, {
        content,
        code: showCode ? code : undefined
      });
      setInterview(data.interview);
    } catch { toast.error('Failed to send message'); }
    finally { setSending(false); }
  };

  const completeInterview = async () => {
    setCompleting(true);
    try {
      const { data } = await api.post(`/interviews/${id}/complete`, { duration: elapsed });
      setFeedback(data.interview.feedback);
      setShowFeedback(true);
      setInterview(data.interview);
      toast.success(`Interview complete! You earned ${data.xpEarned} XP 🎉`);
    } catch { toast.error('Failed to complete interview'); }
    finally { setCompleting(false); }
  };

  const formatTime = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  if (!interview) return (
    <div className="interview-loading"><div className="spinner" style={{ width: 40, height: 40 }} /></div>
  );

  return (
    <div className="interview-page">
      <header className="interview-header">
        <div className="interview-meta">
          <Brain size={20} color="#6c63ff" />
          <span className="badge badge-{interview.type}">{interview.type}</span>
          <span className="interview-topic">{interview.topic}</span>
          <span className={`badge badge-${interview.difficulty}`}>{interview.difficulty}</span>
        </div>
        <div className="interview-controls">
          <div className="timer"><Clock size={14} />{formatTime(elapsed)}</div>
          {interview.type === 'coding' && (
            <button className="btn btn-ghost btn-sm" onClick={() => setShowCode(v => !v)}>
              <Code size={14} />{showCode ? 'Hide Code' : 'Show Code'}
            </button>
          )}
          {interview.status === 'active' && (
            <button className="btn btn-primary btn-sm" onClick={completeInterview} disabled={completing}>
              {completing ? <span className="spinner" /> : <><CheckCircle size={14} />Finish</>}
            </button>
          )}
          <button className="btn btn-ghost btn-sm icon-only" onClick={() => navigate('/dashboard')}><X size={16} /></button>
        </div>
      </header>

      <div className="interview-body">
        <div className={`chat-panel ${showCode ? 'split' : 'full'}`}>
          <div className="messages">
            {interview.messages.map((m, i) => (
              <div key={i} className={`message ${m.role} fade-in`}>
                <div className="msg-avatar">{m.role === 'assistant' ? <Brain size={14} /> : '👤'}</div>
                <div className="msg-bubble">
                  <pre className="msg-text">{m.content}</pre>
                </div>
              </div>
            ))}
            {sending && (
              <div className="message assistant fade-in">
                <div className="msg-avatar"><Brain size={14} /></div>
                <div className="msg-bubble typing"><span /><span /><span /></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {interview.status === 'active' && (
            <div className="chat-input-area">
              <textarea
                className="chat-input"
                placeholder="Type your answer..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                rows={3}
              />
              <button className="send-btn" onClick={sendMessage} disabled={sending || (!input.trim())}>
                <Send size={16} />
              </button>
            </div>
          )}
        </div>

        {showCode && (
          <div className="code-panel">
            <div className="code-header">
              <MessageSquare size={14} />
              <span>Code Editor</span>
              <select value={language} onChange={e => setLanguage(e.target.value)}
                style={{ marginLeft: 'auto', background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px', fontSize: 12 }}>
                {['javascript', 'python', 'java', 'cpp', 'typescript'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={v => setCode(v || '')}
              theme="vs-dark"
              options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, wordWrap: 'on', fontFamily: 'JetBrains Mono, monospace' }}
            />
          </div>
        )}
      </div>

      {showFeedback && feedback && (
        <div className="modal-overlay" onClick={() => setShowFeedback(false)}>
          <div className="feedback-modal card fade-in" onClick={e => e.stopPropagation()}>
            <div className="feedback-header">
              <h2>Interview Feedback</h2>
              <button className="btn btn-ghost btn-sm icon-only" onClick={() => setShowFeedback(false)}><X size={16} /></button>
            </div>
            <div className="score-ring">
              <svg viewBox="0 0 120 120" className="score-svg">
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border)" strokeWidth="8" />
                <circle cx="60" cy="60" r="50" fill="none"
                  stroke={feedback.score >= 80 ? 'var(--green)' : feedback.score >= 60 ? 'var(--yellow)' : 'var(--red)'}
                  strokeWidth="8" strokeDasharray={`${(feedback.score / 100) * 314} 314`}
                  strokeLinecap="round" transform="rotate(-90 60 60)" />
              </svg>
              <div className="score-num">{feedback.score}</div>
              <div className="score-label">/ 100</div>
            </div>
            <p className="feedback-summary">{feedback.summary}</p>
            <div className="feedback-sections">
              <div className="feedback-col strengths">
                <h4>✅ Strengths</h4>
                <ul>{feedback.strengths?.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>
              <div className="feedback-col improvements">
                <h4>💡 Improvements</h4>
                <ul>{feedback.improvements?.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
              onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
          </div>
        </div>
      )}
    </div>
  );
}

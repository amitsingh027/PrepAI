import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Search, Filter, Play, BookOpen } from 'lucide-react';
import './Questions.css';

const TYPES = ['all', 'behavioral', 'technical', 'system-design', 'coding'];
const DIFFS = ['all', 'easy', 'medium', 'hard'];

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [diff, setDiff] = useState('all');
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const params = {};
    if (type !== 'all') params.type = type;
    if (diff !== 'all') params.difficulty = diff;
    if (search) params.search = search;
    api.get('/questions', { params }).then(r => setQuestions(r.data.questions)).finally(() => setLoading(false));
  }, [type, diff, search]);

  const startFromQuestion = async (q) => {
    try {
      const { data } = await api.post('/interviews', {
        type: q.type, topic: q.topic, difficulty: q.difficulty, question: q.title
      });
      navigate(`/interview/${data.interview._id}`);
    } catch { }
  };

  return (
    <div className="questions-page fade-in">
      <div className="qpage-header">
        <div>
          <h1>Question Bank</h1>
          <p>{questions.length} questions available</p>
        </div>
      </div>

      <div className="q-filters">
        <div className="search-box">
          <Search size={16} />
          <input className="input" placeholder="Search questions..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-row">
          <Filter size={14} color="var(--text-muted)" />
          {TYPES.map(t => (
            <button key={t} className={`filter-btn ${type === t ? 'active' : ''}`}
              onClick={() => setType(t)}>{t === 'all' ? 'All Types' : t}</button>
          ))}
        </div>
        <div className="filter-row">
          {DIFFS.map(d => (
            <button key={d} className={`filter-btn ${diff === d ? 'active diff-' + d : ''}`}
              onClick={() => setDiff(d)}>{d === 'all' ? 'All Levels' : d}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="q-loading"><div className="spinner" style={{ width: 32, height: 32 }} /></div>
      ) : (
        <div className="q-list">
          {questions.length === 0 && <div className="q-empty"><BookOpen size={32} /><p>No questions found</p></div>}
          {questions.map(q => (
            <div key={q._id} className="q-card card" onClick={() => setSelected(q === selected ? null : q)}>
              <div className="q-card-header">
                <div className="q-badges">
                  <span className={`badge badge-${q.type}`}>{q.type}</span>
                  <span className={`badge badge-${q.difficulty}`}>{q.difficulty}</span>
                </div>
                <h3 className="q-title">{q.title}</h3>
                <div className="q-meta">
                  <span className="q-topic">{q.topic}</span>
                  {q.companies?.length > 0 && <span className="q-companies">{q.companies.slice(0, 3).join(' · ')}</span>}
                </div>
              </div>
              {selected?._id === q._id && (
                <div className="q-expand fade-in">
                  <p className="q-desc">{q.description}</p>
                  {q.hints?.length > 0 && (
                    <div className="q-hints">
                      <h4>💡 Hints</h4>
                      <ul>{q.hints.map((h, i) => <li key={i}>{h}</li>)}</ul>
                    </div>
                  )}
                  {q.starterCode && (
                    <pre className="q-code">{q.starterCode}</pre>
                  )}
                  <button className="btn btn-primary" onClick={e => { e.stopPropagation(); startFromQuestion(q); }}>
                    <Play size={14} /> Practice This Question
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

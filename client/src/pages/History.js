import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Clock, ChevronRight, BarChart2 } from 'lucide-react';
import './History.css';

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const PER_PAGE = 10;

  useEffect(() => {
    api.get('/interviews', { params: { page, limit: PER_PAGE } })
      .then(r => { setSessions(r.data.interviews); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  }, [page]);

  const fmtDate = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const fmtDur = s => s > 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;
  const scoreColor = s => !s ? 'var(--text-muted)' : s >= 80 ? 'var(--green)' : s >= 60 ? 'var(--yellow)' : 'var(--red)';

  return (
    <div className="history-page fade-in">
      <div className="page-header">
        <h1>Interview History</h1>
        <p>{total} sessions total</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : sessions.length === 0 ? (
        <div className="empty-state card">
          <BarChart2 size={40} color="var(--text-muted)" />
          <h3>No sessions yet</h3>
          <p>Start your first interview from the dashboard!</p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
        </div>
      ) : (
        <>
          <div className="history-table card" style={{ padding: 0, overflow: 'hidden' }}>
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Topic</th>
                  <th>Difficulty</th>
                  <th>Score</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s._id} onClick={() => navigate(`/interview/${s._id}`)} className="hist-row">
                    <td><span className={`badge badge-${s.type}`}>{s.type}</span></td>
                    <td className="topic-cell">{s.topic}</td>
                    <td><span className={`badge badge-${s.difficulty}`}>{s.difficulty}</span></td>
                    <td style={{ color: scoreColor(s.feedback?.score), fontWeight: 700 }}>
                      {s.feedback?.score != null ? `${s.feedback.score}%` : '—'}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      <Clock size={12} style={{ marginRight: 4 }} />{s.duration ? fmtDur(s.duration) : '—'}
                    </td>
                    <td><span className={`status-badge status-${s.status}`}>{s.status}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{fmtDate(s.createdAt)}</td>
                    <td><ChevronRight size={16} color="var(--text-muted)" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {total > PER_PAGE && (
            <div className="pagination">
              <button className="btn btn-ghost" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Previous</button>
              <span>{page} / {Math.ceil(total / PER_PAGE)}</span>
              <button className="btn btn-ghost" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / PER_PAGE)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

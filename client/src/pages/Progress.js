import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import api from '../utils/api';
import { TrendingUp, Target, Zap, Award } from 'lucide-react';
import './Progress.css';

const TYPE_COLORS = { behavioral: '#a78bfa', technical: '#38bdf8', 'system-design': '#fb923c', coding: '#00e5a0' };

export default function Progress() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/progress/stats').then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>;
  if (!stats) return null;

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="progress-page fade-in">
      <div className="page-header">
        <h1>Your Progress</h1>
        <p>Track your improvement over time</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { icon: Target, label: 'Sessions Done', value: stats.completed, color: 'var(--accent)' },
          { icon: TrendingUp, label: 'Avg Score', value: `${stats.avgScore}%`, color: 'var(--green)' },
          { icon: Zap, label: 'Total XP', value: stats.user?.xp || 0, color: 'var(--yellow)' },
          { icon: Award, label: 'Completion Rate', value: `${completionRate}%`, color: 'var(--red)' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div className="card" key={label} style={{ textAlign: 'center' }}>
            <Icon size={20} color={color} />
            <div style={{ fontSize: 28, fontWeight: 800, margin: '8px 0 4px', color }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <h3 className="chart-title">Score Trend (Last 30 Days)</h3>
          {stats.last30Days?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats.last30Days}>
                <XAxis dataKey="_id" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }} />
                <Line type="monotone" dataKey="avgScore" stroke="var(--accent)" strokeWidth={2} dot={{ fill: 'var(--accent)', r: 3 }} name="Avg Score" />
              </LineChart>
            </ResponsiveContainer>
          ) : <div className="no-data">No data yet — complete some sessions!</div>}
        </div>

        <div className="card">
          <h3 className="chart-title">Sessions by Type</h3>
          {stats.byType?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.byType}>
                <XAxis dataKey="_id" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Sessions">
                  {stats.byType.map(entry => <Cell key={entry._id} fill={TYPE_COLORS[entry._id] || 'var(--accent)'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="no-data">No data yet.</div>}
        </div>
      </div>

      <div className="card">
        <h3 className="chart-title">Performance by Type</h3>
        {stats.byType?.length > 0 ? (
          <div className="perf-list">
            {stats.byType.map(t => (
              <div key={t._id} className="perf-item">
                <div className="perf-label">
                  <span className={`badge badge-${t._id}`}>{t._id}</span>
                  <span>{t.count} sessions</span>
                </div>
                <div className="perf-bar-wrap">
                  <div className="perf-bar" style={{ width: `${Math.round(t.avgScore || 0)}%`, background: TYPE_COLORS[t._id] }} />
                </div>
                <span className="perf-score">{Math.round(t.avgScore || 0)}%</span>
              </div>
            ))}
          </div>
        ) : <div className="no-data">Complete some interviews to see your performance breakdown.</div>}
      </div>
    </div>
  );
}

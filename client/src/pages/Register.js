import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Brain, User, Mail, Lock } from 'lucide-react';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to PrepAI 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card fade-in">
        <div className="auth-logo"><Brain size={28} color="#6c63ff" /><span>PrepAI</span></div>
        <h1>Create account</h1>
        <p className="auth-sub">Start your free interview prep journey</p>
        <form onSubmit={submit}>
          {[
            { key: 'name', label: 'Full Name', icon: User, type: 'text', placeholder: 'John Doe' },
            { key: 'email', label: 'Email', icon: Mail, type: 'email', placeholder: 'you@example.com' },
            { key: 'password', label: 'Password', icon: Lock, type: 'password', placeholder: '••••••••' },
          ].map(({ key, label, icon: Icon, type, placeholder }) => (
            <div className="form-group" key={key}>
              <label>{label}</label>
              <div className="input-icon">
                <Icon size={16} />
                <input className="input" type={type} placeholder={placeholder}
                  value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} required />
              </div>
            </div>
          ))}
          <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Create account'}
          </button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}

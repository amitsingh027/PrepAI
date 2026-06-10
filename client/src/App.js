import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Questions from './pages/Questions';
import Interview from './pages/Interview';
import History from './pages/History';
import Progress from './pages/Progress';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
      <Route path="/questions" element={<PrivateRoute><Layout><Questions /></Layout></PrivateRoute>} />
      <Route path="/interview/:id" element={<PrivateRoute><Interview /></PrivateRoute>} />
      <Route path="/history" element={<PrivateRoute><Layout><History /></Layout></PrivateRoute>} />
      <Route path="/progress" element={<PrivateRoute><Layout><Progress /></Layout></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#111127', color: '#e8e8f0', border: '1px solid #2a2a4a' },
            success: { iconTheme: { primary: '#00e5a0', secondary: '#111127' } },
            error: { iconTheme: { primary: '#ff5566', secondary: '#111127' } }
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

// src/pages/Login.jsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AuthLogoIcon, MailIcon, LockIcon, EyeIcon, EyeOffIcon } from '../components/Icons';
import { FlashAlerts } from '../components/FlashAlerts';

export const Login = ({ onNavigateRegister }) => {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  };

  const handleDemoLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    login(demoEmail, demoPassword);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-flash">
        <FlashAlerts />
      </div>

      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ display: 'inline-flex', padding: '14px', background: 'var(--primary-light)', borderRadius: '16px', marginBottom: '8px' }}>
            <AuthLogoIcon size={34} color="var(--primary)" />
          </div>
          <h1>AttendEase</h1>
          <p>Employee Attendance Management</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" id="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <MailIcon className="input-icon" />
              <input
                type="email"
                id="email"
                placeholder="you@company.com"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <LockIcon className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="toggle-pw"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg">
            Sign In
          </button>
        </form>

        <p className="auth-link">
          Don't have an account?{' '}
          <a
            href="#register"
            onClick={(e) => {
              e.preventDefault();
              onNavigateRegister();
            }}
          >
            Register here
          </a>
        </p>

        {/* Quick Demo Credentials */}
        <div className="demo-creds">
          <p><strong>Quick Demo Sign In</strong></p>
          <div className="demo-buttons">
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              style={{ flex: 1 }}
              onClick={() => handleDemoLogin('admin@company.com', 'admin123')}
            >
              👑 Login Admin
            </button>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              style={{ flex: 1 }}
              onClick={() => handleDemoLogin('alice@company.com', 'employee123')}
            >
              👤 Login Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

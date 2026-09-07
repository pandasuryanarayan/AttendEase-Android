// src/pages/Register.jsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  AuthLogoIcon,
  UserIcon,
  MailIcon,
  LockIcon,
  BuildingIcon,
  BriefcaseIcon,
  EyeIcon,
  EyeOffIcon,
} from '../components/Icons';
import { FlashAlerts } from '../components/FlashAlerts';

export const Register = ({ onNavigateLogin }) => {
  const { register, addFlash } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    department: 'Engineering',
    position: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
      addFlash('All required fields must be filled.', 'danger');
      return;
    }

    if (formData.password.length < 6) {
      addFlash('Password must be at least 6 characters.', 'danger');
      return;
    }

    const success = register(formData);
    if (success) {
      onNavigateLogin();
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-flash">
        <FlashAlerts />
      </div>

      <div className="auth-card auth-card-wide">
        <div className="auth-logo">
          <div style={{ display: 'inline-flex', padding: '14px', background: 'var(--primary-light)', borderRadius: '16px', marginBottom: '8px' }}>
            <AuthLogoIcon size={34} color="var(--primary)" />
          </div>
          <h1>Create Account</h1>
          <p>Join AttendEase Employee System</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">
                First Name <span className="req">*</span>
              </label>
              <div className="input-wrapper">
                <UserIcon className="input-icon" />
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  placeholder="Alice"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="last_name">
                Last Name <span className="req">*</span>
              </label>
              <div className="input-wrapper">
                <UserIcon className="input-icon" />
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  placeholder="Johnson"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email Address <span className="req">*</span>
            </label>
            <div className="input-wrapper">
              <MailIcon className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@company.com"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password <span className="req">*</span>
            </label>
            <div className="input-wrapper">
              <LockIcon className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="Min. 6 characters"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
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

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="department">Department</label>
              <div className="input-wrapper">
                <BuildingIcon className="input-icon" />
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                >
                  <option value="">Select department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="Sales">Sales</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="position">Position</label>
              <div className="input-wrapper">
                <BriefcaseIcon className="input-icon" />
                <input
                  type="text"
                  id="position"
                  name="position"
                  placeholder="e.g. Developer"
                  value={formData.position}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            style={{ marginTop: '12px' }}
          >
            Create Employee Account
          </button>
        </form>

        <p className="auth-link">
          Already registered?{' '}
          <a
            href="#login"
            onClick={(e) => {
              e.preventDefault();
              onNavigateLogin();
            }}
          >
            Sign in here
          </a>
        </p>
      </div>
    </div>
  );
};

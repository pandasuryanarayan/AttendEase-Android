// src/components/Sidebar.jsx
import React from 'react';
import { useApp } from '../context/AppContext';
import {
  BrandLogoIcon,
  DashboardIcon,
  UsersIcon,
  AttendanceIcon,
  LeaveIcon,
  ReportIcon,
  PayrollIcon,
  InvoicesIcon,
  SettingsIcon,
  LogoutIcon,
} from './Icons';

export const Sidebar = ({ activePage, setActivePage }) => {
  const { currentUser, logout, sidebarOpen, setSidebarOpen } = useApp();

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin';
  const initialLetter = (currentUser.first_name?.[0] || currentUser.email?.[0] || 'U').toUpperCase();
  const roleDisplay = currentUser.role
    ? `${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)} Account`
    : '';

  const handleNavClick = (pageId) => {
    setActivePage(pageId);
    setSidebarOpen(false);
  };

  return (
    <>
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} id="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo-icon">
            <BrandLogoIcon size={22} />
          </div>
          <div>
            <div className="brand-name">AttendEase</div>
            <div className="brand-tag">PRO DASHBOARD</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main Menu</div>
          {isAdmin ? (
            <>
              <button
                type="button"
                className={`nav-item ${activePage === 'admin-dashboard' ? 'active' : ''}`}
                onClick={() => handleNavClick('admin-dashboard')}
              >
                <DashboardIcon size={20} />
                Overview
              </button>
              <div className="nav-section-label">Management</div>
              <button
                type="button"
                className={`nav-item ${activePage === 'employees' ? 'active' : ''}`}
                onClick={() => handleNavClick('employees')}
              >
                <UsersIcon size={20} />
                Employees
              </button>
              <button
                type="button"
                className={`nav-item ${activePage === 'attendance' ? 'active' : ''}`}
                onClick={() => handleNavClick('attendance')}
              >
                <AttendanceIcon size={20} />
                Attendance Logs
              </button>
              <button
                type="button"
                className={`nav-item ${activePage === 'leaves' ? 'active' : ''}`}
                onClick={() => handleNavClick('leaves')}
              >
                <LeaveIcon size={20} />
                Leave Requests
              </button>
              <button
                type="button"
                className={`nav-item ${activePage === 'reports' ? 'active' : ''}`}
                onClick={() => handleNavClick('reports')}
              >
                <ReportIcon size={20} />
                Analytics & Reports
              </button>

              <div className="nav-section-label">Payroll & Finance</div>
              <button
                type="button"
                className={`nav-item ${activePage === 'payroll' ? 'active' : ''}`}
                onClick={() => handleNavClick('payroll')}
              >
                <PayrollIcon size={20} />
                Run Monthly Payroll
              </button>
              <button
                type="button"
                className={`nav-item ${activePage === 'invoices' || activePage === 'invoice-view' ? 'active' : ''}`}
                onClick={() => handleNavClick('invoices')}
              >
                <InvoicesIcon size={20} />
                Payroll Invoices & Register
              </button>
              <button
                type="button"
                className={`nav-item ${activePage === 'payroll-settings' ? 'active' : ''}`}
                onClick={() => handleNavClick('payroll-settings')}
              >
                <SettingsIcon size={20} />
                Payroll Rules & Policy
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={`nav-item ${activePage === 'employee-dashboard' ? 'active' : ''}`}
                onClick={() => handleNavClick('employee-dashboard')}
              >
                <DashboardIcon size={20} />
                My Dashboard
              </button>
              <button
                type="button"
                className={`nav-item ${activePage === 'attendance' ? 'active' : ''}`}
                onClick={() => handleNavClick('attendance')}
              >
                <AttendanceIcon size={20} />
                My Attendance History
              </button>
              <button
                type="button"
                className={`nav-item ${activePage === 'leaves' ? 'active' : ''}`}
                onClick={() => handleNavClick('leaves')}
              >
                <LeaveIcon size={20} />
                My Leave Requests
              </button>
              <button
                type="button"
                className={`nav-item ${activePage === 'my-invoices' || activePage === 'invoice-view' ? 'active' : ''}`}
                onClick={() => handleNavClick('my-invoices')}
              >
                <InvoicesIcon size={20} />
                My Payslips
              </button>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">{initialLetter}</div>
            <div>
              <div className="user-name">
                {currentUser.first_name} {currentUser.last_name}
              </div>
              <div className="user-role">{roleDisplay}</div>
            </div>
          </div>
          <button type="button" onClick={logout} className="logout-btn">
            <LogoutIcon size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      <div
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        id="overlay"
        onClick={() => setSidebarOpen(false)}
      ></div>
    </>
  );
};

// src/pages/AdminDashboard.jsx
import React from 'react';
import { useApp } from '../context/AppContext';
import { formatDateStr } from '../data/initialData';
import {
  UsersManageIcon,
  PresentTodayIcon,
  AbsentTodayIcon,
  LeaveIcon,
  AlertWarningIcon,
  PlusIcon,
  AttendanceIcon,
  ReportIcon,
} from '../components/Icons';

export const AdminDashboard = ({ onNavigate, onOpenAddEmployee }) => {
  const { users, attendance, leaves } = useApp();

  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = formatDateStr(now);

  const activeEmployees = users.filter((u) => u.role === 'employee' && u.is_active);
  const totalEmployeesCount = activeEmployees.length;

  const todayRecords = attendance.filter((a) => a.date === todayStr);
  const presentTodayCount = todayRecords.filter(
    (a) => a.status === 'present' || a.status === 'late'
  ).length;

  const onLeaveTodayCount = leaves.filter((l) => {
    if (l.status !== 'approved') return false;
    return l.start_date <= todayStr && l.end_date >= todayStr;
  }).length;

  const absentTodayCount = Math.max(0, totalEmployeesCount - presentTodayCount - onLeaveTodayCount);
  const pendingLeavesCount = leaves.filter((l) => l.status === 'pending').length;

  // Chart data calculation for last 7 calendar days (filtering out weekends)
  const chartDays = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      chartDays.push({
        dateObj: d,
        dateStr: formatDateStr(d),
        label: d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
      });
    }
  }

  const chartData = chartDays.map((cd) => {
    const dayAtt = attendance.filter((a) => a.date === cd.dateStr);
    const present = dayAtt.filter((a) => a.status === 'present' || a.status === 'late').length;
    const absent = Math.max(0, totalEmployeesCount - present);
    return {
      label: cd.label,
      present,
      absent,
    };
  });

  const maxVal = Math.max(totalEmployeesCount, 1);

  // Today's check-ins with user info
  const recentCheckins = todayRecords
    .map((att) => {
      const emp = users.find((u) => u.id === att.user_id);
      return { att, emp };
    })
    .filter((item) => item.emp)
    .sort((a, b) => new Date(b.att.check_in) - new Date(a.att.check_in));

  const formatTime = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'present':
        return 'badge-success';
      case 'late':
        return 'badge-warning';
      case 'absent':
        return 'badge-danger';
      case 'leave':
        return 'badge-info';
      default:
        return 'badge-secondary';
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Admin Overview</h2>
          <p className="subtitle" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span>{now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <strong style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 700 }}>
              {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </strong>
          </p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn btn-primary" onClick={onOpenAddEmployee}>
            <PlusIcon size={16} />
            Add Employee
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid stats-grid-4">
        <div className="stat-card stat-blue">
          <div className="stat-icon">
            <UsersManageIcon size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalEmployeesCount}</span>
            <span className="stat-label">Total Employees</span>
          </div>
        </div>

        <div className="stat-card stat-green">
          <div className="stat-icon">
            <PresentTodayIcon size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{presentTodayCount}</span>
            <span className="stat-label">Present Today</span>
          </div>
        </div>

        <div className="stat-card stat-red">
          <div className="stat-icon">
            <AbsentTodayIcon size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{absentTodayCount}</span>
            <span className="stat-label">Absent Today</span>
          </div>
        </div>

        <div className="stat-card stat-yellow">
          <div className="stat-icon">
            <LeaveIcon size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{onLeaveTodayCount}</span>
            <span className="stat-label">On Leave</span>
          </div>
        </div>
      </div>

      {/* Pending Leave Warning Alert */}
      {pendingLeavesCount > 0 && (
        <div className="alert" style={{ marginTop: '20px' }}>
          <AlertWarningIcon size={18} />
          <span>
            You have <strong>{pendingLeavesCount}</strong> pending leave request
            {pendingLeavesCount !== 1 ? 's' : ''}.
          </span>
          <span className="alert-link" onClick={() => onNavigate('leaves')}>
            Review now →
          </span>
        </div>
      )}

      {/* Bar Chart & Today's Checkins */}
      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <h3>Last 7 Working Days</h3>
          </div>
          <div className="card-body">
            <div className="bar-chart">
              {chartData.map((item, idx) => {
                const ph = Math.round((item.present / maxVal) * 120);
                const ah = Math.round((item.absent / maxVal) * 120);
                return (
                  <div key={idx} className="bar-group">
                    <div className="bar-wrap">
                      <div
                        className="bar bar-green"
                        style={{ height: `${ph}px` }}
                        title={`${item.present} Present`}
                      ></div>
                      <div
                        className="bar bar-red"
                        style={{ height: `${ah}px` }}
                        title={`${item.absent} Absent`}
                      ></div>
                    </div>
                    <div className="bar-label">{item.label}</div>
                  </div>
                );
              })}
            </div>
            <div className="chart-legend">
              <span>
                <i className="dot dot-green"></i>Present
              </span>
              <span>
                <i className="dot dot-red"></i>Absent
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Today's Check-ins</h3>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onNavigate('attendance')}
            >
              View all →
            </button>
          </div>
          <div className="card-body p-0">
            {recentCheckins.length > 0 ? (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>In</th>
                      <th>Out</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCheckins.map(({ att, emp }) => (
                      <tr key={att.id}>
                        <td>
                          <div className="emp-cell">
                            <div className="avatar-sm">{emp.first_name[0]}</div>
                            <div>
                              <div className="fw-600">
                                {emp.first_name} {emp.last_name}
                              </div>
                              <div className="text-muted text-sm">{emp.department || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td>{formatTime(att.check_in)}</td>
                        <td>{formatTime(att.check_out)}</td>
                        <td>
                          <span className={`badge ${getStatusBadge(att.status)}`}>
                            {att.status.charAt(0).toUpperCase() + att.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <UsersManageIcon size={40} />
                <p>No check-ins recorded today.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Access Section */}
      <h3 className="section-title">Quick Access</h3>
      <div className="quick-nav-grid">
        <div className="quick-nav-card" onClick={() => onNavigate('employees')}>
          <UsersManageIcon size={24} />
          <span>Manage Employees</span>
        </div>
        <div className="quick-nav-card" onClick={() => onNavigate('attendance')}>
          <AttendanceIcon size={24} />
          <span>Attendance Records</span>
        </div>
        <div className="quick-nav-card" onClick={() => onNavigate('leaves')}>
          <LeaveIcon size={24} />
          <span>Leave Requests</span>
        </div>
        <div className="quick-nav-card" onClick={() => onNavigate('reports')}>
          <ReportIcon size={24} />
          <span>Generate Reports</span>
        </div>
      </div>
    </div>
  );
};

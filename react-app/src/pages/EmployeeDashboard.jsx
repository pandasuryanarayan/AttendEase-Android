// src/pages/EmployeeDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatDateStr } from '../data/initialData';
import {
  CheckInIcon,
  CheckOutIcon,
  DayCompleteIcon,
  CalendarBadgeIcon,
  PresentTodayIcon,
  AbsentTodayIcon,
  ClockLateIcon,
  WorkHoursIcon,
  ReportIcon,
  LeaveIcon,
  AttendanceIcon,
} from '../components/Icons';

export const EmployeeDashboard = ({ onNavigate }) => {
  const { currentUser, attendance, leaves, checkIn, checkOut } = useApp();

  // Live real-time clock state
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!currentUser) return null;

  const todayStr = formatDateStr(new Date());
  const currentHour = time.getHours();

  let greeting = 'Good Morning';
  if (currentHour >= 12 && currentHour < 17) greeting = 'Good Afternoon';
  else if (currentHour >= 17) greeting = 'Good Evening';

  // Today's attendance record
  const todayAttendance = attendance.find(
    (a) => a.user_id === currentUser.id && a.date === todayStr
  );

  // Monthly summary metrics
  const currentMonth = time.getMonth();
  const currentYear = time.getFullYear();

  const userRecords = attendance.filter((a) => {
    if (a.user_id !== currentUser.id) return false;
    const recDate = new Date(a.date);
    return recDate.getMonth() === currentMonth && recDate.getFullYear() === currentYear;
  });

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  let workingDays = 0;
  for (let d = new Date(firstDayOfMonth); d <= time; d.setDate(d.getDate() + 1)) {
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      workingDays++;
    }
  }

  const presentDays = userRecords.filter((r) => r.status === 'present' || r.status === 'late').length;
  const lateDays = userRecords.filter((r) => r.status === 'late').length;
  const totalHours = userRecords.reduce((sum, r) => sum + (r.hours_worked || 0), 0);
  const absentDays = Math.max(0, workingDays - presentDays);

  const pendingLeavesCount = leaves.filter(
    (l) => l.user_id === currentUser.id && l.status === 'pending'
  ).length;

  const formatTimeStr = (isoString) => {
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
          <h2>
            {greeting}, {currentUser.first_name}! 👋
          </h2>
          <p className="subtitle" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span>
              {time.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span style={{ opacity: 0.4 }}>•</span>
            <strong style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 700 }}>
              {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </strong>
          </p>
        </div>
      </div>

      {/* Hero Check-In / Check-Out Card */}
      <div className="checkin-card">
        <div className="checkin-status">
          {todayAttendance ? (
            todayAttendance.check_out ? (
              <>
                <div className="status-dot dot-done"></div>
                <div>
                  <h3>Shift Completed</h3>
                  <p>Worked {todayAttendance.hours_worked} hours today</p>
                </div>
              </>
            ) : (
              <>
                <div className="status-dot dot-in"></div>
                <div>
                  <h3>Currently Checked In</h3>
                  <p>Checked in at {formatTimeStr(todayAttendance.check_in)}</p>
                </div>
              </>
            )
          ) : (
            <>
              <div className="status-dot dot-out"></div>
              <div>
                <h3>Ready to Start</h3>
                <p>
                  Live Time:{' '}
                  <span id="live-dashboard-clock">
                    {time.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </p>
              </div>
            </>
          )}
        </div>

        <div className="checkin-actions">
          {!todayAttendance ? (
            <button
              type="button"
              className="btn btn-success btn-lg"
              onClick={checkIn}
            >
              <CheckInIcon size={20} />
              Check In Now
            </button>
          ) : !todayAttendance.check_out ? (
            <button
              type="button"
              className="btn btn-danger btn-lg"
              onClick={checkOut}
            >
              <CheckOutIcon size={20} />
              Check Out Now
            </button>
          ) : (
            <button type="button" className="btn btn-secondary btn-lg" disabled>
              <DayCompleteIcon size={20} />
              Day Complete
            </button>
          )}
        </div>

        <div className="checkin-times">
          <div className="time-item">
            <span className="time-label">Check In</span>
            <span className="time-value">
              {todayAttendance ? formatTimeStr(todayAttendance.check_in) : '—'}
            </span>
          </div>
          <div className="time-item">
            <span className="time-label">Check Out</span>
            <span className="time-value">
              {todayAttendance?.check_out ? formatTimeStr(todayAttendance.check_out) : '—'}
            </span>
          </div>
          <div className="time-item">
            <span className="time-label">Status</span>
            <span className="time-value">
              {todayAttendance ? (
                <span className={`badge ${getStatusBadge(todayAttendance.status)}`}>
                  {todayAttendance.status.charAt(0).toUpperCase() +
                    todayAttendance.status.slice(1)}
                </span>
              ) : (
                '—'
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Monthly Summary KPI Grid */}
      <h3 className="section-title">This Month's Summary</h3>
      <div className="stats-grid">
        <div className="stat-card stat-blue">
          <div className="stat-icon">
            <CalendarBadgeIcon size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{workingDays}</span>
            <span className="stat-label">Working Days</span>
          </div>
        </div>

        <div className="stat-card stat-green">
          <div className="stat-icon">
            <PresentTodayIcon size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{presentDays}</span>
            <span className="stat-label">Days Present</span>
          </div>
        </div>

        <div className="stat-card stat-red">
          <div className="stat-icon">
            <AbsentTodayIcon size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{absentDays}</span>
            <span className="stat-label">Days Absent</span>
          </div>
        </div>

        <div className="stat-card stat-yellow">
          <div className="stat-icon">
            <ClockLateIcon size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{lateDays}</span>
            <span className="stat-label">Late Arrivals</span>
          </div>
        </div>

        <div className="stat-card stat-purple">
          <div className="stat-icon">
            <WorkHoursIcon size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalHours.toFixed(1)}h</span>
            <span className="stat-label">Total Work Hours</span>
          </div>
        </div>

        <div className="stat-card stat-indigo">
          <div className="stat-icon">
            <ReportIcon size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-value">
              {workingDays > 0 ? Math.round((presentDays / workingDays) * 100) : 0}%
            </span>
            <span className="stat-label">Attendance Rate</span>
          </div>
        </div>
      </div>

      {/* Quick Actions & Profile Summary */}
      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="card-body">
            <div className="quick-actions">
              <button
                type="button"
                className="action-btn"
                onClick={() => onNavigate('leaves')}
              >
                <LeaveIcon size={20} />
                <span>
                  Request Leave
                  {pendingLeavesCount > 0 && (
                    <span className="badge-count" style={{ marginLeft: '8px' }}>
                      {pendingLeavesCount}
                    </span>
                  )}
                </span>
              </button>

              <button
                type="button"
                className="action-btn"
                onClick={() => onNavigate('attendance')}
              >
                <AttendanceIcon size={20} />
                <span>Full History</span>
              </button>
            </div>

            <div className="profile-summary">
              <h4>My Profile Summary</h4>
              <div className="profile-row">
                <span>Department</span>
                <span>{currentUser.department || '—'}</span>
              </div>
              <div className="profile-row">
                <span>Position</span>
                <span>{currentUser.position || '—'}</span>
              </div>
              <div className="profile-row">
                <span>Employee ID</span>
                <span>EMP-{String(currentUser.id).padStart(4, '0')}</span>
              </div>
              <div className="profile-row">
                <span>Joined</span>
                <span>
                  {currentUser.hire_date
                    ? new Date(currentUser.hire_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// src/pages/Reports.jsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  PrinterIcon,
  UsersManageIcon,
  ReportIcon,
  ClockLateIcon,
  AbsentTodayIcon,
} from '../components/Icons';

export const Reports = () => {
  const { users, attendance, leaves } = useApp();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [appliedMonth, setAppliedMonth] = useState(now.getMonth() + 1);
  const [appliedYear, setAppliedYear] = useState(now.getFullYear());

  const handleGenerate = () => {
    setAppliedMonth(selectedMonth);
    setAppliedYear(selectedYear);
  };

  const employees = users.filter((u) => u.role === 'employee' && u.is_active);

  // Month date range calculations
  const firstDay = new Date(appliedYear, appliedMonth - 1, 1);
  const lastDay = new Date(appliedYear, appliedMonth, 0);

  // Working days in month
  let workingDays = 0;
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      workingDays++;
    }
  }

  const firstDayStr = firstDay.toISOString().split('T')[0];
  const lastDayStr = lastDay.toISOString().split('T')[0];

  // Employee breakdown calculation
  const reportData = employees.map((emp) => {
    const empRecords = attendance.filter((a) => {
      if (a.user_id !== emp.id) return false;
      return a.date >= firstDayStr && a.date <= lastDayStr;
    });

    const present = empRecords.filter((r) => r.status === 'present' || r.status === 'late').length;
    const late = empRecords.filter((r) => r.status === 'late').length;
    const totalHours = empRecords.reduce((sum, r) => sum + (r.hours_worked || 0), 0);

    const approvedLeaves = leaves.filter((l) => {
      if (l.user_id !== emp.id || l.status !== 'approved') return false;
      return l.start_date <= lastDayStr && l.end_date >= firstDayStr;
    }).length;

    const absent = Math.max(0, workingDays - present - approvedLeaves);
    const attendanceRate = workingDays > 0 ? Math.round((present / workingDays) * 100 * 10) / 10 : 0;

    return {
      employee: emp,
      present,
      absent,
      late,
      leaves: approvedLeaves,
      totalHours: Math.round(totalHours * 100) / 100,
      attendanceRate,
    };
  });

  reportData.sort((a, b) => b.attendanceRate - a.attendanceRate);

  const totalPresentSum = reportData.reduce((sum, r) => sum + r.present, 0);
  const totalAbsentSum = reportData.reduce((sum, r) => sum + r.absent, 0);
  const totalHoursSum = reportData.reduce((sum, r) => sum + r.totalHours, 0);
  const avgAttendanceRate =
    reportData.length > 0
      ? Math.round(
          (reportData.reduce((sum, r) => sum + r.attendanceRate, 0) / reportData.length) * 10
        ) / 10
      : 0;

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Monthly Attendance Report</h2>
          <p className="subtitle">
            {monthNames[appliedMonth - 1]} {appliedYear} — {workingDays} working days
          </p>
        </div>

        <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
          <PrinterIcon size={16} />
          Print Report
        </button>
      </div>

      {/* Month & Year Selection Bar */}
      <div className="filter-bar">
        <div className="filter-form">
          <div className="filter-group">
            <select
              className="form-input"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {monthNames.map((name, index) => (
                <option key={index + 1} value={index + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <input
              type="number"
              className="form-input"
              style={{ width: '100px' }}
              value={selectedYear}
              min={2020}
              max={2030}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            />
          </div>

          <button type="button" className="btn btn-primary" onClick={handleGenerate}>
            Generate
          </button>
        </div>
      </div>

      {reportData.length > 0 ? (
        <>
          {/* Summary Cards */}
          <div className="stats-grid stats-grid-4" style={{ marginBottom: '24px' }}>
            <div className="stat-card stat-blue">
              <div className="stat-icon">
                <UsersManageIcon size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{reportData.length}</span>
                <span className="stat-label">Employees</span>
              </div>
            </div>

            <div className="stat-card stat-green">
              <div className="stat-icon">
                <ReportIcon size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{avgAttendanceRate}%</span>
                <span className="stat-label">Avg. Attendance</span>
              </div>
            </div>

            <div className="stat-card stat-purple">
              <div className="stat-icon">
                <ClockLateIcon size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{Math.round(totalHoursSum)}h</span>
                <span className="stat-label">Total Hours</span>
              </div>
            </div>

            <div className="stat-card stat-red">
              <div className="stat-icon">
                <AbsentTodayIcon size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{totalAbsentSum}</span>
                <span className="stat-label">Total Absences</span>
              </div>
            </div>
          </div>

          {/* Detailed Employee Breakdown Table */}
          <div className="card">
            <div className="card-header">
              <h3>
                Employee Breakdown — {monthNames[appliedMonth - 1]} {appliedYear}
              </h3>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th className="text-center">Present</th>
                      <th className="text-center">Absent</th>
                      <th className="text-center">Late</th>
                      <th className="text-center">Leaves</th>
                      <th>Total Hours</th>
                      <th>Attendance %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((row) => {
                      const emp = row.employee;
                      const fillClass =
                        row.attendanceRate >= 90
                          ? 'fill-green'
                          : row.attendanceRate >= 75
                          ? 'fill-yellow'
                          : 'fill-red';
                      return (
                        <tr key={emp.id}>
                          <td>
                            <div className="emp-cell">
                              <div className="avatar-sm">{emp.first_name[0]}</div>
                              <div>
                                <div className="fw-600">
                                  {emp.first_name} {emp.last_name}
                                </div>
                                <div className="text-muted text-sm">{emp.position || ''}</div>
                              </div>
                            </div>
                          </td>
                          <td>{emp.department || '—'}</td>
                          <td className="text-center">{row.present}</td>
                          <td className="text-center">
                            <span className={row.absent > 3 ? 'text-danger fw-600' : ''}>
                              {row.absent}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className={row.late > 2 ? 'text-warning fw-600' : ''}>
                              {row.late}
                            </span>
                          </td>
                          <td className="text-center">{row.leaves}</td>
                          <td>{row.totalHours}h</td>
                          <td>
                            <div className="progress-cell">
                              <div className="progress-bar-wrap">
                                <div
                                  className={`progress-fill ${fillClass}`}
                                  style={{ width: `${Math.min(100, row.attendanceRate)}%` }}
                                ></div>
                              </div>
                              <span className="progress-label">{row.attendanceRate}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="table-footer">
                      <td colSpan="2">
                        <strong>Totals</strong>
                      </td>
                      <td className="text-center">
                        <strong>{totalPresentSum}</strong>
                      </td>
                      <td className="text-center">
                        <strong>{totalAbsentSum}</strong>
                      </td>
                      <td className="text-center"></td>
                      <td className="text-center"></td>
                      <td>
                        <strong>{Math.round(totalHoursSum * 10) / 10}h</strong>
                      </td>
                      <td>
                        <strong>{avgAttendanceRate}%</strong>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state large card">
          <ReportIcon size={64} />
          <h3>No data available</h3>
          <p>No employees or attendance records found for this period.</p>
        </div>
      )}
    </div>
  );
};

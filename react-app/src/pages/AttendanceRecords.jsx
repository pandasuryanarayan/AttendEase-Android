// src/pages/AttendanceRecords.jsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { AttendanceIcon } from '../components/Icons';

export const AttendanceRecords = () => {
  const { currentUser, users, attendance, editAttendanceRecord } = useApp();

  const isAdmin = currentUser?.role === 'admin';

  // Filters state
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Applied filters state
  const [appliedEmpId, setAppliedEmpId] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');
  const [appliedStatusFilter, setAppliedStatusFilter] = useState('');
  const [appliedMonth, setAppliedMonth] = useState(new Date().getMonth() + 1);
  const [appliedYear, setAppliedYear] = useState(new Date().getFullYear());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 15;

  // Edit Modal State
  const [editingRecord, setEditingRecord] = useState(null);
  const [modalCheckIn, setModalCheckIn] = useState('');
  const [modalCheckOut, setModalCheckOut] = useState('');
  const [modalStatus, setModalStatus] = useState('present');

  const employees = users.filter((u) => u.role === 'employee');

  const handleApplyFilters = (e) => {
    e?.preventDefault();
    setAppliedEmpId(selectedEmpId);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setAppliedStatusFilter(statusFilter);
    setAppliedMonth(selectedMonth);
    setAppliedYear(selectedYear);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    const defaultMonth = new Date().getMonth() + 1;
    const defaultYear = new Date().getFullYear();

    setSelectedEmpId('');
    setStartDate('');
    setEndDate('');
    setStatusFilter('');
    setSelectedMonth(defaultMonth);
    setSelectedYear(defaultYear);

    setAppliedEmpId('');
    setAppliedStartDate('');
    setAppliedEndDate('');
    setAppliedStatusFilter('');
    setAppliedMonth(defaultMonth);
    setAppliedYear(defaultYear);
    setCurrentPage(1);
  };

  // Filter logic
  let filteredRecords = [...attendance];

  if (!isAdmin) {
    filteredRecords = filteredRecords.filter((a) => a.user_id === currentUser.id);

    // Apply month/year filter for non-admin
    if (appliedMonth && appliedYear) {
      filteredRecords = filteredRecords.filter((a) => {
        const d = new Date(a.date);
        return d.getMonth() + 1 === Number(appliedMonth) && d.getFullYear() === Number(appliedYear);
      });
    }
  } else {
    // Admin filters
    if (appliedEmpId) {
      filteredRecords = filteredRecords.filter((a) => a.user_id === Number(appliedEmpId));
    }
    if (appliedStatusFilter) {
      filteredRecords = filteredRecords.filter((a) => a.status === appliedStatusFilter);
    }
  }

  if (appliedStartDate) {
    filteredRecords = filteredRecords.filter((a) => a.date >= appliedStartDate);
  }
  if (appliedEndDate) {
    filteredRecords = filteredRecords.filter((a) => a.date <= appliedEndDate);
  }

  // Sort descending by date
  filteredRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Pagination calculations
  const totalPages = Math.ceil(filteredRecords.length / perPage) || 1;
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * perPage, currentPage * perPage);

  const formatTime = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatIsoForPicker = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localIso = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
    return localIso;
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

  const handleOpenEdit = (rec) => {
    setEditingRecord(rec);
    setModalCheckIn(formatIsoForPicker(rec.check_in));
    setModalCheckOut(formatIsoForPicker(rec.check_out));
    setModalStatus(rec.status);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingRecord) return;
    editAttendanceRecord(editingRecord.id, {
      check_in: modalCheckIn ? new Date(modalCheckIn).toISOString() : null,
      check_out: modalCheckOut ? new Date(modalCheckOut).toISOString() : null,
      status: modalStatus,
    });
    setEditingRecord(null);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>{isAdmin ? 'All Attendance Records' : 'My Attendance History'}</h2>
          <p className="subtitle">
            {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="filter-bar">
        <form onSubmit={handleApplyFilters} className="filter-form flex-wrap">
          {isAdmin ? (
            <div className="filter-group">
              <select
                className="form-input"
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
              >
                <option value="">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div className="filter-group">
                <select
                  className="form-input"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {[
                    'Jan',
                    'Feb',
                    'Mar',
                    'Apr',
                    'May',
                    'Jun',
                    'Jul',
                    'Aug',
                    'Sep',
                    'Oct',
                    'Nov',
                    'Dec',
                  ].map((m, i) => (
                    <option key={i + 1} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <input
                  type="number"
                  className="form-input"
                  style={{ width: '90px' }}
                  value={selectedYear}
                  min={2020}
                  max={2030}
                  onChange={(e) => setSelectedYear(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="filter-group">
            <input
              type="date"
              className="form-input"
              value={startDate}
              placeholder="From Date"
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <input
              type="date"
              className="form-input"
              value={endDate}
              placeholder="To Date"
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {isAdmin && (
            <div className="filter-group">
              <select
                className="form-input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="absent">Absent</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-secondary">
            Apply
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleClearFilters}
          >
            Clear
          </button>
        </form>
      </div>

      {/* Attendance Table */}
      <div className="card">
        <div className="card-body p-0">
          {paginatedRecords.length > 0 ? (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    {isAdmin && <th>Employee</th>}
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Hours</th>
                    <th>Status</th>
                    {isAdmin && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.map((att) => {
                    const emp = users.find((u) => u.id === att.user_id);

                    return (
                      <tr key={att.id}>
                        {isAdmin && (
                          <td>
                            <div className="emp-cell">
                              <div className="avatar-sm">{emp ? emp.first_name[0] : 'U'}</div>
                              <div>
                                <div className="fw-600">
                                  {emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown'}
                                </div>
                                <div className="text-muted text-sm">{emp?.department || ''}</div>
                              </div>
                            </div>
                          </td>
                        )}
                        <td>
                          {new Date(att.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td>{formatTime(att.check_in)}</td>
                        <td>{formatTime(att.check_out)}</td>
                        <td>{att.hours_worked ? att.hours_worked.toFixed(2) : '—'}</td>
                        <td>
                          <span className={`badge ${getStatusBadge(att.status)}`}>
                            {att.status.charAt(0).toUpperCase() + att.status.slice(1)}
                          </span>
                        </td>
                        {isAdmin && (
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-ghost"
                              onClick={() => handleOpenEdit(att)}
                            >
                              Edit
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state large">
              <AttendanceIcon size={56} />
              <h3>No records found</h3>
              <p>Try adjusting your filter criteria.</p>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                type="button"
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                ← Prev
              </button>
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                className="page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Record Modal (Admin) */}
      {isAdmin && (
        <Modal
          isOpen={!!editingRecord}
          onClose={() => setEditingRecord(null)}
          title="Edit Attendance Record"
        >
          <form onSubmit={handleSaveEdit}>
            <div className="modal-body">
              {editingRecord && (
                <div style={{ marginBottom: '16px' }}>
                  <p className="fw-600" style={{ fontSize: '15px' }}>
                    Employee:{' '}
                    {users.find((u) => u.id === editingRecord.user_id)?.first_name}{' '}
                    {users.find((u) => u.id === editingRecord.user_id)?.last_name}
                  </p>
                  <p className="text-muted text-sm">
                    Date:{' '}
                    {new Date(editingRecord.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}

              <div className="form-group">
                <label>Check In Time</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={modalCheckIn}
                  onChange={(e) => setModalCheckIn(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Check Out Time</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={modalCheckOut}
                  onChange={(e) => setModalCheckOut(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  className="form-input"
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                >
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="absent">Absent</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setEditingRecord(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// src/pages/LeaveRequests.jsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { PlusIcon, LeaveIcon } from '../components/Icons';
import { formatDateStr } from '../data/initialData';

export const LeaveRequests = () => {
  const { currentUser, users, leaves, requestLeave, reviewLeave, cancelLeave } = useApp();

  const isAdmin = currentUser?.role === 'admin';

  // Admin filter tab state ('pending', 'approved', 'rejected', '')
  const [adminStatusTab, setAdminStatusTab] = useState('pending');

  // New Leave Modal (Employee)
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newLeaveData, setNewLeaveData] = useState({
    leave_type: 'vacation',
    start_date: formatDateStr(new Date()),
    end_date: formatDateStr(new Date()),
    reason: '',
  });

  // Review Modal (Admin)
  const [reviewingLeave, setReviewingLeave] = useState(null);
  const [adminNote, setAdminNote] = useState('');

  const todayStr = formatDateStr(new Date());

  // Filter leaves
  let filteredLeaves = [...leaves];
  if (!isAdmin) {
    filteredLeaves = filteredLeaves.filter((l) => l.user_id === currentUser.id);
  } else if (adminStatusTab) {
    filteredLeaves = filteredLeaves.filter((l) => l.status === adminStatusTab);
  }

  filteredLeaves.sort((a, b) => new Date(b.created_at || b.start_date) - new Date(a.created_at || a.start_date));

  const handleNewLeaveSubmit = (e) => {
    e.preventDefault();
    const success = requestLeave(newLeaveData);
    if (success) {
      setIsNewModalOpen(false);
      setNewLeaveData({
        leave_type: 'vacation',
        start_date: todayStr,
        end_date: todayStr,
        reason: '',
      });
    }
  };

  const handleReviewAction = (action) => {
    if (!reviewingLeave) return;
    reviewLeave(reviewingLeave.id, action, adminNote);
    setReviewingLeave(null);
    setAdminNote('');
  };

  const handleCancelLeave = (leave) => {
    if (leave.status !== 'pending') return;
    if (window.confirm(`Are you sure you want to cancel this ${leave.leave_type} leave request?`)) {
      cancelLeave(leave.id);
    }
  };

  const getLeaveTypeBadgeClass = (type) => {
    switch (type) {
      case 'vacation':
        return 'leave-vacation';
      case 'sick':
        return 'leave-sick';
      case 'personal':
        return 'leave-personal';
      default:
        return 'leave-other';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'badge-success';
      case 'rejected':
        return 'badge-danger';
      case 'pending':
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>{isAdmin ? 'Leave Management' : 'My Leave Requests'}</h2>
          <p className="subtitle">
            {isAdmin ? 'Manage all employee leave requests' : 'Track and submit your leave requests'}
          </p>
        </div>

        {!isAdmin && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsNewModalOpen(true)}
          >
            <PlusIcon size={16} />
            New Request
          </button>
        )}
      </div>

      {/* Admin Tab Filters */}
      {isAdmin && (
        <div className="tab-bar">
          <button
            type="button"
            className={`tab ${adminStatusTab === 'pending' ? 'active' : ''}`}
            onClick={() => setAdminStatusTab('pending')}
          >
            ⏳ Pending
          </button>
          <button
            type="button"
            className={`tab ${adminStatusTab === 'approved' ? 'active' : ''}`}
            onClick={() => setAdminStatusTab('approved')}
          >
            ✅ Approved
          </button>
          <button
            type="button"
            className={`tab ${adminStatusTab === 'rejected' ? 'active' : ''}`}
            onClick={() => setAdminStatusTab('rejected')}
          >
            ❌ Rejected
          </button>
          <button
            type="button"
            className={`tab ${adminStatusTab === '' ? 'active' : ''}`}
            onClick={() => setAdminStatusTab('')}
          >
            All Requests
          </button>
        </div>
      )}

      {/* Leave Table */}
      <div className="card">
        <div className="card-body p-0">
          {filteredLeaves.length > 0 ? (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    {isAdmin && <th>Employee</th>}
                    <th>Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions / Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaves.map((leave) => {
                    const emp = users.find((u) => u.id === leave.user_id);

                    return (
                      <tr key={leave.id}>
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
                          <span className={`leave-type ${getLeaveTypeBadgeClass(leave.leave_type)}`}>
                            {leave.leave_type.charAt(0).toUpperCase() + leave.leave_type.slice(1)}
                          </span>
                        </td>
                        <td>
                          {new Date(leave.start_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td>
                          {new Date(leave.end_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td>{leave.days_requested}</td>
                        <td className="text-truncate" title={leave.reason}>
                          {leave.reason || '—'}
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(leave.status)}`}>
                            {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          {isAdmin && leave.status === 'pending' ? (
                            <button
                              type="button"
                              className="btn btn-sm btn-success"
                              onClick={() => {
                                setReviewingLeave(leave);
                                setAdminNote('');
                              }}
                            >
                              Review
                            </button>
                          ) : !isAdmin && leave.status === 'pending' ? (
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => handleCancelLeave(leave)}
                              title="Cancel this pending leave request"
                            >
                              Cancel Request
                            </button>
                          ) : leave.admin_note ? (
                            <span className="text-muted text-sm" title={leave.admin_note}>
                              Note: {leave.admin_note}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state large">
              <LeaveIcon size={56} />
              <h3>No leave requests found</h3>
              <p>
                {isAdmin
                  ? 'No leave requests match the selected tab filter.'
                  : 'You have not submitted any leave requests yet.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Employee New Leave Modal */}
      {!isAdmin && (
        <Modal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          title="Request Leave"
        >
          <form onSubmit={handleNewLeaveSubmit}>
            <div className="modal-body">
              <div className="form-group">
                <label>
                  Leave Type <span className="req">*</span>
                </label>
                <select
                  value={newLeaveData.leave_type}
                  onChange={(e) => setNewLeaveData({ ...newLeaveData, leave_type: e.target.value })}
                  required
                >
                  <option value="vacation">🏖 Vacation</option>
                  <option value="sick">🤒 Sick Leave</option>
                  <option value="personal">👤 Personal</option>
                  <option value="other">📋 Other</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Start Date <span className="req">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={newLeaveData.start_date}
                    onChange={(e) =>
                      setNewLeaveData({ ...newLeaveData, start_date: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    End Date <span className="req">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={newLeaveData.start_date || todayStr}
                    value={newLeaveData.end_date}
                    onChange={(e) =>
                      setNewLeaveData({ ...newLeaveData, end_date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Reason</label>
                <textarea
                  rows="3"
                  placeholder="Optional reason for request…"
                  value={newLeaveData.reason}
                  onChange={(e) => setNewLeaveData({ ...newLeaveData, reason: e.target.value })}
                ></textarea>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setIsNewModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Submit Request
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Admin Review Modal */}
      {isAdmin && (
        <Modal
          isOpen={!!reviewingLeave}
          onClose={() => setReviewingLeave(null)}
          title="Review Leave Request"
        >
          <div className="modal-body">
            {reviewingLeave && (
              <div style={{ marginBottom: '16px' }}>
                <p className="fw-600" style={{ fontSize: '15px' }}>
                  Employee:{' '}
                  {users.find((u) => u.id === reviewingLeave.user_id)?.first_name}{' '}
                  {users.find((u) => u.id === reviewingLeave.user_id)?.last_name}
                </p>
                <p className="text-muted text-sm" style={{ marginTop: '4px' }}>
                  {reviewingLeave.leave_type.toUpperCase()} from {reviewingLeave.start_date} to{' '}
                  {reviewingLeave.end_date} ({reviewingLeave.days_requested} days)
                </p>
                {reviewingLeave.reason && (
                  <p style={{ marginTop: '8px', fontSize: '13.5px' }}>
                    <strong>Reason:</strong> {reviewingLeave.reason}
                  </p>
                )}
              </div>
            )}

            <div className="form-group">
              <label>Admin Note (Optional)</label>
              <textarea
                rows="3"
                placeholder="Add note for employee…"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              ></textarea>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setReviewingLeave(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => handleReviewAction('reject')}
            >
              Reject
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={() => handleReviewAction('approve')}
            >
              Approve
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// src/pages/PayrollInvoices.jsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/payrollEngine';

export const PayrollInvoices = ({ onNavigate, setSelectedInvoiceId }) => {
  const { invoices, users, markInvoiceAsPaid, deleteMonthlyInvoicesBatch, runMonthlyPayroll } = useApp();

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState('all');

  // Mark Paid Modal state
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
  const [targetInvoiceId, setTargetInvoiceId] = useState(null);
  const [paidMode, setPaidMode] = useState('NEFT / Direct Bank Transfer');
  const [paidRef, setPaidRef] = useState('');
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0]);

  // Delete Batch Modal & Captcha state
  const [showDeleteBatchModal, setShowDeleteBatchModal] = useState(false);
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  let filteredInvoices = invoices.filter(
    (inv) => Number(inv.month) === Number(selectedMonth) && Number(inv.year) === Number(selectedYear)
  );
  if (statusFilter !== 'all') {
    filteredInvoices = filteredInvoices.filter((inv) => inv.status === statusFilter);
  }

  const totalPayout = filteredInvoices.reduce((acc, i) => acc + (Number(i.net_pay) || 0), 0);
  const totalTax = filteredInvoices.reduce((acc, i) => acc + (Number(i.tds_tax) || 0), 0);
  const totalOT = filteredInvoices.reduce((acc, i) => acc + (Number(i.overtime_pay) || 0), 0);
  const paidCount = filteredInvoices.filter((i) => i.status === 'paid').length;

  // Handlers
  const handleOpenMarkPaid = (invId) => {
    setTargetInvoiceId(invId);
    setPaidMode('NEFT / Direct Bank Transfer');
    setPaidRef('TXN' + Math.floor(10000000 + Math.random() * 90000000));
    setPaidDate(new Date().toISOString().split('T')[0]);
    setShowMarkPaidModal(true);
  };

  const handleMarkPaidSubmit = (e) => {
    e.preventDefault();
    if (!targetInvoiceId || !paidRef.trim()) return;
    markInvoiceAsPaid(targetInvoiceId, paidMode, paidRef.trim(), paidDate);
    setShowMarkPaidModal(false);
  };

  const handleOpenDeleteBatch = () => {
    const code = String(Math.floor(1000 + Math.random() * 9000));
    setCaptchaCode(code);
    setCaptchaInput('');
    setCaptchaError(false);
    setShowDeleteBatchModal(true);
  };

  const handleDeleteBatchSubmit = (e) => {
    e.preventDefault();
    if (captchaInput.trim() !== captchaCode) {
      setCaptchaError(true);
      return;
    }
    deleteMonthlyInvoicesBatch(Number(selectedMonth), Number(selectedYear));
    setShowDeleteBatchModal(false);
  };

  const handleViewPayslip = (invId) => {
    setSelectedInvoiceId(invId);
    onNavigate('invoice-view');
  };

  const handleDownloadPDF = (invId) => {
    setSelectedInvoiceId(invId);
    onNavigate('invoice-view-download');
  };

  const handleRunPayrollFromEmpty = () => {
    runMonthlyPayroll(Number(selectedMonth), Number(selectedYear));
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>📄 Payroll Invoices & Employee Salary Register</h2>
          <p className="subtitle">
            Comprehensive tabular register for {months[selectedMonth - 1]} {selectedYear} with individual payslip PDF downloads
          </p>
        </div>
        <div className="header-actions">
          {filteredInvoices.length > 0 && (
            <button
              type="button"
              className="btn-animated-danger"
              onClick={handleOpenDeleteBatch}
              title="Permanently delete all invoices for this month"
            >
              <svg
                className="trash-icon-svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path className="trash-lid" d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <path className="trash-can" d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0v11m4-11v11m4-11v11" />
              </svg>
              <span>Delete {months[selectedMonth - 1]} {selectedYear} Batch</span>
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onNavigate('payroll')}
          >
            ⚡ Run Monthly Payroll
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onNavigate('payroll-settings')}
          >
            ⚙️ Rules Policy
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <form className="filter-form" onSubmit={(e) => e.preventDefault()}>
          <div className="filter-group">
            <label>Month</label>
            <select
              className="form-input"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {months.map((m, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Year</label>
            <input
              type="number"
              className="form-input"
              value={selectedYear}
              min="2020"
              max="2030"
              style={{ width: '100px' }}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            />
          </div>
          <div className="filter-group">
            <label>Status Filter</label>
            <select
              className="form-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setSelectedMonth(new Date().getMonth() + 1);
              setSelectedYear(new Date().getFullYear());
              setStatusFilter('all');
            }}
          >
            Reset
          </button>
        </form>
      </div>

      {/* Summary KPI Grid */}
      <div className="stats-grid stats-grid-4" style={{ marginBottom: '24px' }}>
        <div className="stat-card stat-blue">
          <div className="stat-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 3h12M6 8h12M6 13h5a4 4 0 0 0 0-8M6 13l8 8" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{formatINR(totalPayout)}</span>
            <span className="stat-label">Total Net Payout</span>
          </div>
        </div>

        <div className="stat-card stat-green">
          <div className="stat-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{paidCount} / {filteredInvoices.length}</span>
            <span className="stat-label">Settled / Paid Invoices</span>
          </div>
        </div>

        <div className="stat-card stat-purple">
          <div className="stat-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{formatINR(totalOT)}</span>
            <span className="stat-label">Overtime Paid</span>
          </div>
        </div>

        <div className="stat-card stat-red">
          <div className="stat-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{formatINR(totalTax)}</span>
            <span className="stat-label">TDS Tax Withheld</span>
          </div>
        </div>
      </div>

      {/* Invoices Data Register Table */}
      <div className="card">
        <div className="card-header">
          <h3>Employee Salary Invoices Register — {months[selectedMonth - 1]} {selectedYear}</h3>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table" style={{ fontSize: '13px' }}>
              <thead>
                <tr>
                  <th>Invoice Ref</th>
                  <th>Employee & Dept</th>
                  <th>Base CTC Scale</th>
                  <th>Attendance (Days)</th>
                  <th>Hours & OT</th>
                  <th>Basic & HRA</th>
                  <th>Allowances</th>
                  <th>Gross Earnings</th>
                  <th>Deductions</th>
                  <th>Net Pay (INR)</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="12" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No payroll invoices generated for {months[selectedMonth - 1]} {selectedYear} yet.<br />
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ marginTop: '12px' }}
                        onClick={handleRunPayrollFromEmpty}
                      >
                        ⚡ Run Monthly Payroll for {months[selectedMonth - 1]} {selectedYear}
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const emp = users.find((u) => u.id === inv.user_id) || {
                      first_name: 'Employee',
                      last_name: `#${inv.user_id}`,
                      department: 'Staff',
                      position: ''
                    };
                    const isPaid = inv.status === 'paid';
                    const allowancesTotal =
                      (inv.special_allowance || 0) +
                      (inv.conveyance_allowance || 0) +
                      (inv.medical_allowance || 0);

                    return (
                      <tr key={inv.id}>
                        <td>
                          <span
                            onClick={() => handleViewPayslip(inv.id)}
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 800,
                              color: 'var(--primary)',
                              cursor: 'pointer'
                            }}
                          >
                            {inv.invoice_number}
                          </span>
                        </td>
                        <td>
                          <div className="emp-cell">
                            <div className="avatar-sm">{(emp.first_name?.[0] || 'E').toUpperCase()}</div>
                            <div>
                              <div className="fw-600">
                                {emp.first_name} {emp.last_name}
                              </div>
                              <div className="text-muted text-sm">
                                {emp.department || '—'} • EMP-{String(emp.id).padStart(4, '0')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700 }}>
                            {formatINR(inv.base_salary || inv.effective_base_salary || 50000)}
                          </div>
                          {inv.applied_salary_reason && (
                            <div style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 700 }}>
                              {inv.applied_salary_reason.split('(')[0]}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="fw-600">{inv.present_days}</span> /{' '}
                          <span className="text-muted">{inv.working_days}d</span>
                          {inv.absent_days > 0 && (
                            <div className="text-danger text-sm font-semibold">
                              {inv.absent_days} LOP
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="fw-600">{inv.total_hours}h</span>
                          {inv.overtime_hours > 0 ? (
                            <div className="text-success text-sm font-semibold">
                              +{inv.overtime_hours}h OT
                            </div>
                          ) : (
                            <div className="text-muted text-sm">0h OT</div>
                          )}
                        </td>
                        <td>
                          <div><strong>Basic:</strong> {formatINR(inv.basic_pay)}</div>
                          <div className="text-muted text-sm">HRA: {formatINR(inv.hra)}</div>
                        </td>
                        <td>{formatINR(allowancesTotal)}</td>
                        <td className="fw-600">{formatINR(inv.gross_earnings)}</td>
                        <td className="text-danger fw-600">-{formatINR(inv.total_deductions)}</td>
                        <td>
                          <strong style={{ color: '#059669', fontSize: '15px' }}>
                            {formatINR(inv.net_pay)}
                          </strong>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              isPaid
                                ? 'badge-success badge-no-dot'
                                : inv.status === 'approved'
                                ? 'badge-info'
                                : 'badge-warning'
                            }`}
                          >
                            {isPaid ? '✓ PAID' : inv.status ? inv.status.toUpperCase() : 'PENDING'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="actions-cell-group">
                            <button
                              type="button"
                              className="btn-download-pdf"
                              onClick={() => handleDownloadPDF(inv.id)}
                              title="Download Official Payslip PDF"
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                              <span>Download PDF</span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-secondary"
                              onClick={() => handleViewPayslip(inv.id)}
                              title="View Payslip"
                            >
                              👁️ View
                            </button>
                            <div className="action-slot-pay">
                              {!isPaid ? (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-primary"
                                  onClick={() => handleOpenMarkPaid(inv.id)}
                                  title="Mark Paid"
                                >
                                  💵 Pay
                                </button>
                              ) : (
                                <span
                                  className="badge badge-success badge-no-dot"
                                  style={{ fontSize: '11px', padding: '4px 8px', fontWeight: 800 }}
                                >
                                  ✓ Paid
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {filteredInvoices.length > 0 && (
                <tfoot>
                  <tr className="table-footer">
                    <td colSpan="7">
                      <strong>Monthly Total Summary ({filteredInvoices.length} Invoices)</strong>
                    </td>
                    <td>
                      <strong>
                        {formatINR(filteredInvoices.reduce((a, b) => a + (b.gross_earnings || 0), 0))}
                      </strong>
                    </td>
                    <td className="text-danger">
                      <strong>
                        -{formatINR(filteredInvoices.reduce((a, b) => a + (b.total_deductions || 0), 0))}
                      </strong>
                    </td>
                    <td style={{ color: '#059669' }}>
                      <strong>{formatINR(totalPayout)}</strong>
                    </td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>

      {/* Record Salary Disbursement Modal */}
      {showMarkPaidModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '500px' }}>
            <div className="modal-header" style={{ background: 'var(--surface-secondary)' }}>
              <div className="modal-header-icon-title">
                <div className="modal-header-icon success">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>Record Salary Disbursement</h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
                    Confirm payment details & disburse salary
                  </div>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowMarkPaidModal(false)}>×</button>
            </div>

            <form onSubmit={handleMarkPaidSubmit} style={{ padding: '24px' }}>
              <div className="modal-info-banner">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <div>
                  Confirming direct salary disbursement. This will record payment mode details and mark the employee invoice as <strong>PAID & SETTLED</strong>.
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontWeight: 700, fontSize: '12.5px' }}>Payment Transfer Mode <span className="req">*</span></label>
                <select
                  className="form-input"
                  value={paidMode}
                  onChange={(e) => setPaidMode(e.target.value)}
                  style={{ fontWeight: 600 }}
                  required
                >
                  <option value="NEFT / Direct Bank Transfer">🏦 NEFT / Direct Bank Transfer</option>
                  <option value="RTGS">⚡ RTGS (High Value Transfer)</option>
                  <option value="IMPS / Instant Transfer">🚀 IMPS / Instant Transfer</option>
                  <option value="UPI Direct Pay">📱 UPI Direct Pay</option>
                  <option value="Corporate Cheque">📝 Corporate Cheque</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontWeight: 700, fontSize: '12.5px' }}>Transaction Reference ID / Cheque # <span className="req">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. TXN9872134598"
                  value={paidRef}
                  onChange={(e) => setPaidRef(e.target.value)}
                  style={{ fontFamily: 'monospace', fontWeight: 700 }}
                  required
                />
                <span className="form-hint">Unique reference code from bank portal or cheque register</span>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 700, fontSize: '12.5px' }}>Disbursement Payment Date <span className="req">*</span></label>
                <input
                  type="date"
                  className="form-input"
                  value={paidDate}
                  onChange={(e) => setPaidDate(e.target.value)}
                  style={{ fontWeight: 600 }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowMarkPaidModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 800, padding: '10px 20px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Confirm & Mark as Paid</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permanent Batch Delete Confirmation Modal with Captcha */}
      {showDeleteBatchModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '500px' }}>
            <div className="modal-header" style={{ background: '#fff1f2', borderBottom: '1px solid #fecaca' }}>
              <div className="modal-header-icon-title">
                <div className="modal-header-icon danger">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#be123c' }}>Permanent Batch Deletion</h3>
                  <div style={{ fontSize: '12px', color: '#9f1239', fontWeight: 600 }}>High-risk administrative deletion action</div>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowDeleteBatchModal(false)}>×</button>
            </div>

            <form onSubmit={handleDeleteBatchSubmit} style={{ padding: '24px' }}>
              <div className="modal-info-banner danger-banner">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <div>
                  You are about to permanently purge all generated invoices for <strong style={{ color: '#be123c' }}>{months[selectedMonth - 1]} {selectedYear}</strong>. All invoice records, payment reference codes, and payslip data for this month will be deleted.
                </div>
              </div>

              <div className="form-group" style={{ textAlign: 'center', marginBottom: '16px' }}>
                <label style={{ fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                  🔒 Security Verification Captcha
                </label>
                <div className="captcha-display-box">
                  <span className="captcha-code-text">{captchaCode}</span>
                </div>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type the 4-digit code shown above"
                  value={captchaInput}
                  onChange={(e) => {
                    setCaptchaInput(e.target.value);
                    setCaptchaError(false);
                  }}
                  style={{ textAlign: 'center', fontWeight: 800, fontSize: '17px', letterSpacing: '6px', maxWidth: '280px', margin: '0 auto' }}
                  required
                />
                {captchaError && (
                  <div style={{ color: '#dc2626', fontSize: '12px', fontWeight: 700, marginTop: '8px' }}>
                    ❌ Incorrect Captcha code! Please type the exact 4-digit code shown above.
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteBatchModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-animated-danger" style={{ fontWeight: 800, padding: '10px 20px' }}>
                  <svg className="trash-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path className="trash-lid" d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <path className="trash-can" d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0v11m4-11v11m4-11v11" />
                  </svg>
                  <span>Confirm Permanent Delete</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

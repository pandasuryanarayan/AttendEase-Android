// src/pages/MyInvoices.jsx
import React from 'react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/payrollEngine';

export const MyInvoices = ({ onNavigate, setSelectedInvoiceId }) => {
  const { currentUser, invoices } = useApp();

  const userInvoices = invoices
    .filter((i) => Number(i.user_id) === Number(currentUser?.id))
    .sort((a, b) => b.year * 100 + b.month - (a.year * 100 + a.month));

  const ytdGross = userInvoices.reduce((a, b) => a + (b.gross_earnings || 0), 0);
  const ytdNet = userInvoices.reduce((a, b) => a + (b.net_pay || 0), 0);
  const ytdTax = userInvoices.reduce((a, b) => a + (b.tds_tax || 0), 0);
  const ytdOT = userInvoices.reduce((a, b) => a + (b.overtime_hours || 0), 0);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleViewPayslip = (invId) => {
    setSelectedInvoiceId(invId);
    onNavigate('invoice-view');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>My Payslips & Tax Invoices</h2>
          <p className="subtitle">View and download your monthly compensation breakdowns in INR (₹)</p>
        </div>
      </div>

      {/* Summary KPI Cards with Vector SVG Icons */}
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
            <span className="stat-value">{formatINR(ytdNet)}</span>
            <span className="stat-label">Total Net Received</span>
          </div>
        </div>

        <div className="stat-card stat-green">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{formatINR(ytdGross)}</span>
            <span className="stat-label">Total Gross Earnings</span>
          </div>
        </div>

        <div className="stat-card stat-purple">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{ytdOT}h</span>
            <span className="stat-label">Total Overtime Hours</span>
          </div>
        </div>

        <div className="stat-card stat-red">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{formatINR(ytdTax)}</span>
            <span className="stat-label">TDS Tax Paid</span>
          </div>
        </div>
      </div>

      {/* Payslip History Card */}
      <div className="card">
        <div className="card-header">
          <h3>My Compensation History</h3>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Payslip #</th>
                  <th>Month / Period</th>
                  <th>Present / Working</th>
                  <th>Logged Hours & OT</th>
                  <th>Gross Pay</th>
                  <th>Deductions</th>
                  <th>Net Salary (INR)</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {userInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No payslips generated for your account yet.
                    </td>
                  </tr>
                ) : (
                  userInvoices.map((inv) => {
                    const isPaid = inv.status === 'paid';
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
                        <td className="fw-600">
                          {months[inv.month - 1]} {inv.year}
                        </td>
                        <td>
                          {inv.present_days} / {inv.working_days} days
                        </td>
                        <td>
                          {inv.total_hours}h
                          {inv.overtime_hours > 0 && (
                            <div style={{ color: '#059669', fontSize: '12px', fontWeight: 600 }}>
                              +{inv.overtime_hours}h OT
                            </div>
                          )}
                        </td>
                        <td className="fw-600">{formatINR(inv.gross_earnings)}</td>
                        <td className="text-danger fw-600">-{formatINR(inv.total_deductions)}</td>
                        <td>
                          <strong style={{ color: '#059669', fontSize: '15px' }}>{formatINR(inv.net_pay)}</strong>
                        </td>
                        <td>
                          <span className={`badge ${isPaid ? 'badge-success badge-no-dot' : 'badge-info'}`}>
                            {isPaid ? '✓ PAID' : inv.status ? inv.status.toUpperCase() : 'APPROVED'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleViewPayslip(inv.id)}
                          >
                            📄 View & PDF
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

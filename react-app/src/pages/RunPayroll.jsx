// src/pages/RunPayroll.jsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/payrollEngine';

export const RunPayroll = ({ onNavigate }) => {
  const { users, payrollRules, runMonthlyPayroll, invoices } = useApp();

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const empUsers = users.filter((u) => u.role === 'employee' && u.is_active !== false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const existingInvoices = invoices.filter(
    (i) => Number(i.month) === Number(selectedMonth) && Number(i.year) === Number(selectedYear)
  );

  const handleRunSubmit = (e) => {
    e.preventDefault();
    runMonthlyPayroll(Number(selectedMonth), Number(selectedYear));
    onNavigate('invoices');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>⚡ Run Monthly Payroll Engine</h2>
          <p className="subtitle">
            Execute monthly payday run for all staff using active policy rules & attendance logs
          </p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onNavigate('invoices')}
          >
            📄 View Invoices Register
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onNavigate('payroll-settings')}
          >
            ⚙️ Edit Rules Policy
          </button>
        </div>
      </div>

      {/* Active Engine Status Bar */}
      <div className="rule-status-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <span
            className={`badge ${payrollRules.rule_status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}
            style={{ fontSize: '12.5px', padding: '6px 12px', fontWeight: 800 }}
          >
            STATUS: {payrollRules.rule_status || 'ACTIVE'}
          </span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>
            Active Rules Effective: <strong style={{ color: 'var(--text)' }}>{payrollRules.effective_from || '01-Aug-2026'}</strong>
          </span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>
            Engine Version: <strong style={{ color: 'var(--text)' }}>v{payrollRules.version || '2.4.0'}</strong>
          </span>
        </div>
      </div>

      <div className="settings-grid-2">
        {/* Left: Execution Controls Card */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '6px', color: 'var(--text)' }}>
            📅 Select Pay Period & Trigger Monthly Payroll Run
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Select target month & year below to execute the payroll engine for all active employees.
          </div>

          <form id="payroll-run-form" onSubmit={handleRunSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-row">
              <div className="form-group">
                <label style={{ fontWeight: 700 }}>Target Month</label>
                <select
                  id="run-payroll-month"
                  className="form-input"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  required
                >
                  {months.map((m, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label style={{ fontWeight: 700 }}>Target Year</label>
                <input
                  type="number"
                  id="run-payroll-year"
                  className="form-input"
                  value={selectedYear}
                  min="2020"
                  max="2030"
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div style={{ padding: '16px', background: 'var(--surface-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
              <div style={{ fontWeight: 700, marginBotto: '6px', color: 'var(--primary)' }}>
                ⚡ Operational Run Check:
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <li>Active Employees to Process: <strong>{empUsers.length} Employees</strong></li>
                <li>Calculates basic pay, HRA, allowances, dual overtime (8h/40h) & LOP absent days</li>
                <li>Applies statutory PF, TDS income tax & Professional Tax slabs</li>
                <li>Generates official printable Tax Invoices & Individual Payslip PDFs</li>
              </ul>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{
                width: '100%',
                padding: '14px 24px',
                fontSize: '15px',
                fontWeight: 800,
                justifyContent: 'center',
                marginTop: '8px'
              }}
            >
              ⚡ Run Monthly Payroll & Generate Invoices
            </button>
          </form>
        </div>

        {/* Right: Operational Status Card */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '6px', color: 'var(--text)' }}>
            📊 Current Period Status: {months[selectedMonth - 1]} {selectedYear}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Status of invoices generated for the selected month
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <div style={{ padding: '14px', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Generated Invoices Count:</span>
              <span className={`badge ${existingInvoices.length > 0 ? 'badge-success' : 'badge-warning'}`}>
                {existingInvoices.length} Invoices
              </span>
            </div>
            <div style={{ padding: '14px', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Total Gross Pay:</span>
              <strong>{formatINR(existingInvoices.reduce((a, b) => a + (b.gross_earnings || 0), 0))}</strong>
            </div>
            <div style={{ padding: '14px', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Total Net Payout:</span>
              <strong style={{ color: '#059669', fontSize: '16px' }}>
                {formatINR(existingInvoices.reduce((a, b) => a + (b.net_pay || 0), 0))}
              </strong>
            </div>
          </div>

          {existingInvoices.length > 0 && (
            <button
              type="button"
              className="btn btn-primary btn-animated-next"
              onClick={() => onNavigate('invoices')}
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '12px 20px',
                fontWeight: 800,
                fontSize: '14px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <span>Go to Invoices Register & Download Payslips</span>
              <svg
                className="arrow-icon-svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

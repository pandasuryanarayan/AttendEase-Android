// src/pages/InvoiceView.jsx
import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatINR, numberToWordsINR } from '../utils/payrollEngine';

export const InvoiceView = ({ selectedInvoiceId, autoPrint, onNavigate }) => {
  const {
    invoices,
    users,
    currentUser,
    salaries,
    payrollRules,
    markInvoiceAsPaid,
    updateInvoiceCustomItems
  } = useApp();

  const isAdmin = currentUser?.role === 'admin';

  // Find invoice by ID or string number or fallback
  const inv =
    invoices.find(
      (i) =>
        String(i.id) === String(selectedInvoiceId) ||
        String(i.invoice_number) === String(selectedInvoiceId)
    ) || (selectedInvoiceId ? null : invoices[0]);

  const emp = users.find((u) => u.id === inv?.user_id) || {
    id: inv?.user_id || 2,
    first_name: 'Employee',
    last_name: `#${inv?.user_id || 2}`,
    department: 'Engineering',
    position: 'Developer',
    email: 'emp@company.com'
  };

  const sal =
    salaries.find((s) => s.user_id === inv?.user_id) || {
      bank_name: 'HDFC Bank Ltd.',
      bank_account_no: '••••••••4892',
      bank_ifsc: 'HDFC0001001',
      pan_no: 'ABCDE1234F'
    };

  const company = payrollRules.company || {
    company_name: 'AttendEase Technologies Pvt. Ltd.',
    address: 'Cyber City, Sector 24, DLF Phase 3, Gurugram, HR 122002',
    gstin: '07AABCA1234F1Z8',
    email: 'contact@attendease.com',
    signatory_title: 'Finance & Payroll Department',
    disclaimer:
      'This is a computer-generated tax invoice and salary certificate. No physical signature is required under IT rules.'
  };

  // Modals
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
  const [paidMode, setPaidMode] = useState('NEFT / Direct Bank Transfer');
  const [paidRef, setPaidRef] = useState('');
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0]);

  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [itemType, setItemType] = useState('earning'); // 'earning' | 'deduction'
  const [itemName, setItemName] = useState('');
  const [itemAmount, setItemAmount] = useState('');

  // Auto print trigger
  useEffect(() => {
    if (autoPrint && inv) {
      const timer = setTimeout(() => {
        window.print();
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [autoPrint, inv]);

  if (!inv) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
        <h3>Invoice Not Found</h3>
        <p className="text-muted">The requested payroll invoice could not be located.</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onNavigate(isAdmin ? 'payroll' : 'my-invoices')}
          style={{ marginTop: '16px' }}
        >
          Return to {isAdmin ? 'Payroll' : 'My Payslips'}
        </button>
      </div>
    );
  }

  const isPaid = inv.status === 'paid';
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const lastDayOfMonth = new Date(inv.year, inv.month, 0).getDate();
  const periodStr = `${months[inv.month - 1]} 01, ${inv.year} – ${months[inv.month - 1]} ${lastDayOfMonth}, ${inv.year}`;

  const customEarnings = (inv.custom_line_items || []).filter((item) => item.type === 'earning');
  const customDeductions = (inv.custom_line_items || []).filter((item) => item.type === 'deduction');

  const handleOpenMarkPaid = () => {
    setPaidMode('NEFT / Direct Bank Transfer');
    setPaidRef('TXN' + Math.floor(10000000 + Math.random() * 90000000));
    setPaidDate(new Date().toISOString().split('T')[0]);
    setShowMarkPaidModal(true);
  };

  const handleMarkPaidSubmit = (e) => {
    e.preventDefault();
    if (!paidRef.trim()) return;
    markInvoiceAsPaid(inv.id, paidMode, paidRef.trim(), paidDate);
    setShowMarkPaidModal(false);
  };

  const handleAddItemSubmit = (e) => {
    e.preventDefault();
    if (!itemName.trim() || !itemAmount) return;
    const newItems = [
      ...(inv.custom_line_items || []),
      {
        name: itemName.trim(),
        amount: Number(itemAmount),
        type: itemType
      }
    ];
    updateInvoiceCustomItems(inv.id, newItems);
    setItemName('');
    setItemAmount('');
    setShowAddItemModal(false);
  };

  return (
    <div>
      {/* Top Action Toolbar (Hidden in Print) */}
      <div className="invoice-toolbar">
        <div>
          <button
            type="button"
            className="btn btn-secondary btn-animated-back"
            onClick={() => onNavigate(isAdmin ? 'payroll' : 'my-invoices')}
            style={{ padding: '9px 18px', fontWeight: 700 }}
          >
            <svg
              className="arrow-icon-svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Back to {isAdmin ? 'Payment Processing' : 'My Payslips'}</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {isAdmin && (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAddItemModal(true)}
              >
                ➕ Add Line Item
              </button>
              {!isPaid && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleOpenMarkPaid}
                >
                  💵 Record Payment
                </button>
              )}
            </>
          )}

          <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            <span>Print / Download PDF</span>
          </button>
        </div>
      </div>

      {/* The Invoice / Payslip Document Card */}
      <div className="invoice-card" id="printable-invoice">
        {/* Header */}
        <div className="invoice-top">
          <div>
            <div className="invoice-company-brand">
              <div
                style={{
                  display: 'inline-flex',
                  padding: '10px',
                  background: 'var(--primary-light)',
                  borderRadius: '12px'
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="3" />
                  <path d="M8 2v4M16 2v4M3 10h18" strokeLinecap="round" />
                  <circle cx="9" cy="15" r="1.5" fill="var(--primary)" />
                  <circle cx="15" cy="15" r="1.5" fill="var(--primary)" />
                </svg>
              </div>
              <div className="invoice-company-info">
                <h4>{company.company_name}</h4>
                <p>
                  {company.address}
                  <br />
                  GSTIN: {company.gstin} • {company.email}
                </p>
              </div>
            </div>
          </div>
          <div className="invoice-title-block">
            <div className="invoice-badge-title">Official Tax Invoice & Salary Payslip</div>
            <div className="invoice-num">{inv.invoice_number}</div>
            <div>
              <span className={`invoice-status-tag badge ${isPaid ? 'badge-success' : 'badge-info'}`}>
                {isPaid ? 'PAID & DISBURSED' : (inv.status || 'APPROVED').toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Employee & Bank Profile Grid */}
        <div className="invoice-meta-grid">
          <div className="meta-box">
            <h5>Employee Information</h5>
            <div className="meta-box-content">
              <span className="meta-label">Employee Name:</span>
              <span className="meta-val">{emp.first_name} {emp.last_name}</span>
              <span className="meta-label">Employee ID:</span>
              <span className="meta-val">EMP-{String(emp.id).padStart(4, '0')}</span>
              <span className="meta-label">Department:</span>
              <span className="meta-val">{emp.department || '—'}</span>
              <span className="meta-label">Designation:</span>
              <span className="meta-val">{emp.position || 'Employee'}</span>
              <span className="meta-label">Base CTC Scale:</span>
              <span className="meta-val">
                {formatINR(inv.base_salary || sal.base_salary || 50000)}{' '}
                {inv.applied_salary_reason ? (
                  <span className="badge badge-info" style={{ fontSize: '10px', marginLeft: '4px' }}>
                    {inv.applied_salary_reason}
                  </span>
                ) : null}
              </span>
              <span className="meta-label">PAN Number:</span>
              <span className="meta-val">{sal.pan_no || 'ABCDE1234F'}</span>
            </div>
          </div>
          <div className="meta-box">
            <h5>Disbursement & Bank Info</h5>
            <div className="meta-box-content">
              <span className="meta-label">Pay Period:</span>
              <span className="meta-val">{periodStr}</span>
              <span className="meta-label">Bank Name:</span>
              <span className="meta-val">{sal.bank_name || 'HDFC Bank Ltd.'}</span>
              <span className="meta-label">Account No:</span>
              <span className="meta-val">{sal.bank_account_no || '••••••••4892'}</span>
              <span className="meta-label">IFSC Code:</span>
              <span className="meta-val">{sal.bank_ifsc || 'HDFC0001001'}</span>
              <span className="meta-label">Payment Mode:</span>
              <span className="meta-val">{inv.payment_mode || 'NEFT / Direct Transfer'}</span>
            </div>
          </div>
        </div>

        {/* Attendance & Hours Summary Pill Bar */}
        <div className="attendance-pill-bar">
          <div className="att-pill-item">
            <div className="att-pill-val">{inv.working_days}</div>
            <div className="att-pill-lbl">Working Days</div>
          </div>
          <div className="att-pill-item">
            <div className="att-pill-val" style={{ color: '#059669' }}>{inv.present_days}</div>
            <div className="att-pill-lbl">Days Present</div>
          </div>
          <div className="att-pill-item">
            <div className="att-pill-val" style={{ color: '#2563eb' }}>{inv.paid_leaves || 0}</div>
            <div className="att-pill-lbl">Paid Leaves</div>
          </div>
          <div className="att-pill-item">
            <div className="att-pill-val" style={{ color: '#e11d48' }}>{inv.absent_days}</div>
            <div className="att-pill-lbl">Loss of Pay (LOP)</div>
          </div>
          <div className="att-pill-item">
            <div className="att-pill-val">{inv.total_hours}h</div>
            <div className="att-pill-lbl">Total Logged</div>
          </div>
          <div className="att-pill-item">
            <div className="att-pill-val" style={{ color: '#7c3aed' }}>{inv.overtime_hours}h</div>
            <div className="att-pill-lbl">Overtime (8h/40h)</div>
          </div>
        </div>

        {/* Side-by-Side Earnings vs Deductions Table */}
        <div className="invoice-tables-split">
          {/* Left: Earnings */}
          <div className="subtable-card">
            <div className="subtable-header header-earnings">
              <span>Earnings Component</span>
              <span>Amount (INR)</span>
            </div>
            <table className="invoice-data-table">
              <tbody>
                <tr>
                  <td>Basic Salary</td>
                  <td className="val-col">{formatINR(inv.basic_pay)}</td>
                </tr>
                <tr>
                  <td>House Rent Allowance (HRA)</td>
                  <td className="val-col">{formatINR(inv.hra)}</td>
                </tr>
                <tr>
                  <td>Special / Flexi Allowance</td>
                  <td className="val-col">{formatINR(inv.special_allowance)}</td>
                </tr>
                {inv.conveyance_allowance > 0 && (
                  <tr>
                    <td>Conveyance Allowance</td>
                    <td className="val-col">{formatINR(inv.conveyance_allowance)}</td>
                  </tr>
                )}
                {inv.medical_allowance > 0 && (
                  <tr>
                    <td>Medical Allowance</td>
                    <td className="val-col">{formatINR(inv.medical_allowance)}</td>
                  </tr>
                )}
                <tr>
                  <td>
                    Overtime Pay
                    <span className="text-muted text-sm font-semibold" style={{ display: 'block' }}>
                      {inv.overtime_hours} hrs @ {formatINR((inv.standard_hourly_rate || 200) * (inv.ot_multiplier || 1.5))}/hr ({inv.ot_multiplier || 1.5}x)
                    </span>
                  </td>
                  <td className="val-col">{formatINR(inv.overtime_pay)}</td>
                </tr>
                {(inv.type_custom_earnings || []).map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.name}</td>
                    <td className="val-col">{formatINR(item.amount)}</td>
                  </tr>
                ))}
                {customEarnings.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.name}</td>
                    <td className="val-col">{formatINR(item.amount)}</td>
                  </tr>
                ))}
                {inv.bonus > 0 && (
                  <tr>
                    <td>Performance Bonus</td>
                    <td className="val-col">{formatINR(inv.bonus)}</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="subtable-total-row">
                  <td>Total Gross Earnings (A)</td>
                  <td className="val-col" style={{ color: '#065f46' }}>{formatINR(inv.gross_earnings)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Right: Deductions */}
          <div className="subtable-card">
            <div className="subtable-header header-deductions">
              <span>Deductions & Taxes</span>
              <span>Amount (INR)</span>
            </div>
            <table className="invoice-data-table">
              <tbody>
                <tr>
                  <td>
                    Loss of Pay (LOP)
                    {inv.absent_days > 0 && (
                      <span className="text-muted text-sm" style={{ display: 'block' }}>
                        {inv.absent_days} unexcused absent days
                      </span>
                    )}
                  </td>
                  <td className="val-col">{formatINR(inv.lop_deduction)}</td>
                </tr>
                <tr>
                  <td>
                    Late Arrival Deductions
                    {inv.late_days > 2 && (
                      <span className="text-muted text-sm" style={{ display: 'block' }}>
                        {inv.late_days} late arrivals
                      </span>
                    )}
                  </td>
                  <td className="val-col">{formatINR(inv.late_deduction)}</td>
                </tr>
                <tr>
                  <td>Provident Fund (PF / EPF)</td>
                  <td className="val-col">{formatINR(inv.pf_deduction)}</td>
                </tr>
                <tr>
                  <td>Income Tax Withholding (TDS)</td>
                  <td className="val-col">{formatINR(inv.tds_tax)}</td>
                </tr>
                <tr>
                  <td>Group Corporate Health Insurance</td>
                  <td className="val-col">{formatINR(inv.insurance || 500)}</td>
                </tr>
                {inv.professional_tax > 0 && (
                  <tr>
                    <td>Professional Tax (PT)</td>
                    <td className="val-col">{formatINR(inv.professional_tax)}</td>
                  </tr>
                )}
                {(inv.type_custom_deductions || []).map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.name}</td>
                    <td className="val-col">{formatINR(item.amount)}</td>
                  </tr>
                ))}
                {customDeductions.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.name}</td>
                    <td className="val-col">{formatINR(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="subtable-total-row">
                  <td>Total Deductions (B)</td>
                  <td className="val-col" style={{ color: '#9f1239' }}>-{formatINR(inv.total_deductions)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Net Salary Payable Banner */}
        <div className="net-pay-banner">
          <div className="net-pay-left">
            <h4>Net Salary Payable (Gross - Deductions)</h4>
            <div className="net-pay-words">
              Amount in words: <strong>{numberToWordsINR(inv.net_pay)}</strong>
            </div>
          </div>
          <div className="net-pay-amount">{formatINR(inv.net_pay)}</div>
        </div>

        {/* Footer Settlement & Signatory */}
        <div className="invoice-footer-grid">
          <div className="payment-info-box">
            <strong>Disbursement Status:</strong>{' '}
            {isPaid ? `Settled on ${inv.paid_at || new Date().toISOString().split('T')[0]}` : 'Approved for payout processing'}
            <br />
            <strong>Transaction Ref / UTR:</strong> {inv.transaction_ref || 'PENDING DISBURSEMENT'}
            <br />
            <span style={{ fontSize: '11.5px', color: '#64748b' }}>{company.disclaimer}</span>
          </div>
          <div className="signatory-box">
            <div className="seal-tag">✓ VERIFIED & APPROVED</div>
            <div className="signatory-title">{company.signatory_title}</div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{company.company_name}</div>
          </div>
        </div>
      </div>

      {/* Add Custom Line Item Modal (Admin Only) */}
      {showAddItemModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>Add Custom Line Item</h3>
              <button className="modal-close" onClick={() => setShowAddItemModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddItemSubmit} style={{ padding: '24px' }}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontWeight: 700 }}>Item Type</label>
                <select
                  className="form-input"
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value)}
                  required
                >
                  <option value="earning">Earning / Allowance / Bonus (+)</option>
                  <option value="deduction">Deduction / Recovery (-)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontWeight: 700 }}>Description / Item Name <span className="req">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Special Project Incentive or Laptop EMI"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 700 }}>Amount (INR ₹) <span className="req">*</span></label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 5000"
                  value={itemAmount}
                  onChange={(e) => setItemAmount(e.target.value)}
                  min="1"
                  step="100"
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddItemModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Item & Recalculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Salary Disbursement Modal */}
      {showMarkPaidModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '500px' }}>
            <div className="modal-header" style={{ background: 'var(--surface-secondary)' }}>
              <div className="modal-header-icon-title">
                <div className="modal-header-icon success">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
                  Confirm & Mark as Paid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

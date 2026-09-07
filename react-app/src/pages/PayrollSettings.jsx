// src/pages/PayrollSettings.jsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculatePayroll, formatINR } from '../utils/payrollEngine';

export const PayrollSettings = ({ onNavigate }) => {
  const {
    payrollRules,
    savePayrollRules,
    salaries,
    saveSalaries,
    users,
    attendance,
    leaves,
    runMonthlyPayroll,
    setFlashMessage
  } = useApp();

  const [rules, setRules] = useState(JSON.parse(JSON.stringify(payrollRules)));
  const [salList, setSalList] = useState(JSON.parse(JSON.stringify(salaries)));
  const [activeTab, setActiveTab] = useState('structure');

  const empUsers = users.filter((u) => u.role === 'employee' && u.is_active !== false);

  // Selected Category Profile
  const [selectedTypeId, setSelectedTypeId] = useState(rules.employee_types?.[0]?.id || 'full_time_senior');
  const selectedType = rules.employee_types?.find((t) => t.id === selectedTypeId) || rules.employee_types?.[0] || {};

  // Simulation Employee
  const [selectedSimUserId, setSelectedSimUserId] = useState(empUsers[0]?.id || 2);
  const simUser = users.find((u) => u.id === Number(selectedSimUserId)) || empUsers[0];
  const simPayroll = simUser
    ? calculatePayroll(simUser.id, new Date().getMonth() + 1, new Date().getFullYear(), rules, users, attendance, leaves, salList)
    : null;

  // Modals state
  const [showNewCatModal, setShowNewCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatBase, setNewCatBase] = useState(50000);

  const [showNewDeptModal, setShowNewDeptModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');
  const [newDeptBase, setNewDeptBase] = useState(60000);

  // General Save
  const handleSaveAll = (msg = 'Payroll rules saved and activated successfully!') => {
    savePayrollRules(rules);
    saveSalaries(salList);
    if (setFlashMessage) setFlashMessage({ type: 'success', message: msg });
  };

  const handleApplyAndProcess = () => {
    handleSaveAll('Active payroll rules updated!');
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    runMonthlyPayroll(currentMonth, currentYear);
    onNavigate('invoices');
  };

  // Salary mapping edits
  const handleSalaryFieldChange = (userId, field, value) => {
    setSalList((prev) =>
      prev.map((s) => (s.user_id === userId ? { ...s, [field]: value } : s))
    );
  };

  // Department rules edits
  const handleDeptFieldChange = (deptId, field, value) => {
    setRules((prev) => ({
      ...prev,
      department_rules: (prev.department_rules || []).map((d) =>
        d.id === deptId ? { ...d, [field]: value } : d
      )
    }));
  };

  // Category profile edits
  const handleCategoryFieldChange = (field, value) => {
    setRules((prev) => ({
      ...prev,
      employee_types: (prev.employee_types || []).map((t) =>
        t.id === selectedTypeId ? { ...t, [field]: value } : t
      )
    }));
  };

  // Delete Category
  const handleDeleteCategory = (catId) => {
    if (rules.employee_types.length <= 1) {
      alert('Cannot delete the last category profile.');
      return;
    }
    const updated = rules.employee_types.filter((t) => t.id !== catId);
    setRules((prev) => ({ ...prev, employee_types: updated }));
    setSelectedTypeId(updated[0]?.id);
  };

  // Create Category Form
  const handleCreateCategorySubmit = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const newId = newCatName.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now().toString().slice(-4);
    const newType = {
      id: newId,
      name: newCatName.trim(),
      description: newCatDesc.trim() || 'Custom employee profile',
      base_salary: Number(newCatBase) || 50000,
      basic_percentage: 50,
      hra_percentage: 40,
      special_allowance: 0,
      conveyance_allowance: 0,
      medical_allowance: 0
    };
    const updated = [...rules.employee_types, newType];
    setRules((prev) => ({ ...prev, employee_types: updated }));
    setSelectedTypeId(newId);
    setNewCatName('');
    setNewCatDesc('');
    setNewCatBase(50000);
    setShowNewCatModal(false);
  };

  // Create Department Scale Form
  const handleCreateDeptSubmit = (e) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    const newId = 'dept_' + newDeptName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newDept = {
      id: newId,
      department: newDeptName.trim(),
      description: newDeptDesc.trim() || 'Department scale',
      min_base_salary: Number(newDeptBase) || 60000
    };
    const updated = [...(rules.department_rules || []), newDept];
    setRules((prev) => ({ ...prev, department_rules: updated }));
    setNewDeptName('');
    setNewDeptDesc('');
    setNewDeptBase(60000);
    setShowNewDeptModal(false);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>Payroll Policy & Rules Console</h2>
          <p className="subtitle">
            Structured rule configuration engine defining salary components, statutory taxes, priority overrides & test simulations
          </p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn btn-secondary btn-animated-back"
            onClick={() => onNavigate('payroll')}
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
            <span>Back to Payment Processing</span>
          </button>

          <button type="button" className="btn btn-primary" onClick={handleApplyAndProcess}>
            ⚡ Apply Active Rules & Process Payroll
          </button>
        </div>
      </div>

      {/* Rule Engine Status & Version Header */}
      <div className="rule-status-header">
        <div style={{ display: 'flex', alignContent: 'center', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <span
            className={`badge ${rules.rule_status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}
            style={{ fontSize: '12.5px', padding: '6px 12px', fontWeight: 800 }}
          >
            STATUS: {rules.rule_status || 'ACTIVE'}
          </span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>
            Effective Date: <strong style={{ color: 'var(--text)' }}>{rules.effective_from || '01-Aug-2026'}</strong>
          </span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>
            Engine Version: <strong style={{ color: 'var(--text)' }}>v{rules.version || '2.4.0'}</strong>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-sm btn-secondary" onClick={() => setActiveTab('simulation')}>
            🧪 Test Payroll Simulation
          </button>
          <button type="button" className="btn btn-sm btn-success" onClick={() => handleSaveAll('Rules activated & saved!')}>
            🚀 Save & Activate Rules
          </button>
        </div>
      </div>

      {/* 7 Tab Navigation */}
      <div className="settings-tab-nav">
        <button
          className={`settings-tab-btn ${activeTab === 'structure' ? 'active' : ''}`}
          onClick={() => setActiveTab('structure')}
        >
          💵 1. Salary & Earnings Structure
        </button>
        <button
          className={`settings-tab-btn ${activeTab === 'deductions' ? 'active' : ''}`}
          onClick={() => setActiveTab('deductions')}
        >
          🛡️ 2. Deductions & Statutory Taxes
        </button>
        <button
          className={`settings-tab-btn ${activeTab === 'attendance_ot' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance_ot')}
        >
          ⏱️ 3. Attendance, LOP & Overtime
        </button>
        <button
          className={`settings-tab-btn ${activeTab === 'overrides' ? 'active' : ''}`}
          onClick={() => setActiveTab('overrides')}
        >
          🔀 4. Priority Cascade & Overrides
        </button>
        <button
          className={`settings-tab-btn ${activeTab === 'types' ? 'active' : ''}`}
          onClick={() => setActiveTab('types')}
        >
          👔 5. Category Profiles
        </button>
        <button
          className={`settings-tab-btn ${activeTab === 'simulation' ? 'active' : ''}`}
          onClick={() => setActiveTab('simulation')}
        >
          🧪 6. Test Simulation & Preview
        </button>
        <button
          className={`settings-tab-btn ${activeTab === 'branding' ? 'active' : ''}`}
          onClick={() => setActiveTab('branding')}
        >
          🏢 7. Payslip Branding & Entity
        </button>
      </div>

      {/* SECTION 1: Salary & Earnings Structure */}
      {activeTab === 'structure' && (
        <form
          id="salary-structure-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveAll('Salary structure & earnings rules saved!');
          }}
        >
          <div className="settings-grid-2">
            <div className="rule-group-card">
              <div className="rule-group-title">
                <span>📋 Foundation Components & Calculation Types</span>
              </div>
              <div className="rule-group-subtitle">
                Configure basic percentage of Gross, HRA calculation base, and allowance components
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Basic Salary Component (% of Base CTC)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={rules.salary_structure?.basic_percentage || 50}
                    min="10"
                    max="100"
                    step="1"
                    onChange={(e) =>
                      setRules({
                        ...rules,
                        salary_structure: {
                          ...rules.salary_structure,
                          basic_percentage: Number(e.target.value)
                        }
                      })
                    }
                    required
                  />
                  <span className="form-hint">Calculation Type: Percentage of Base CTC (Default: 50%)</span>
                </div>
                <div className="form-group">
                  <label>HRA Component (% of Basic Salary)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={rules.salary_structure?.hra_percentage || 40}
                    min="0"
                    max="100"
                    step="1"
                    onChange={(e) =>
                      setRules({
                        ...rules,
                        salary_structure: {
                          ...rules.salary_structure,
                          hra_percentage: Number(e.target.value)
                        }
                      })
                    }
                    required
                  />
                  <span className="form-hint">Calculation Type: Percentage of Basic Salary (Default: 40%)</span>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Conveyance Allowance (₹ / month)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={rules.salary_structure?.conveyance_allowance || 2000}
                    min="0"
                    step="100"
                    onChange={(e) =>
                      setRules({
                        ...rules,
                        salary_structure: {
                          ...rules.salary_structure,
                          conveyance_allowance: Number(e.target.value)
                        }
                      })
                    }
                  />
                  <span className="form-hint">Calculation Type: Fixed Amount</span>
                </div>
                <div className="form-group">
                  <label>Medical Allowance (₹ / month)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={rules.salary_structure?.medical_allowance || 1500}
                    min="0"
                    step="100"
                    onChange={(e) =>
                      setRules({
                        ...rules,
                        salary_structure: {
                          ...rules.salary_structure,
                          medical_allowance: Number(e.target.value)
                        }
                      })
                    }
                  />
                  <span className="form-hint">Calculation Type: Fixed Amount</span>
                </div>
              </div>

              <div className="formula-callout">
                <span>ℹ️</span>
                <span>
                  Salary Component Formula:{' '}
                  <strong className="formula-callout-code">
                    Gross = Basic (50%) + HRA (40% of Basic) + Special + Conveyance + Medical + OT
                  </strong>
                </span>
              </div>
            </div>

            <div className="rule-group-card">
              <div className="rule-group-title">
                <span>💵 Active Earnings Components Registry</span>
              </div>
              <div className="rule-group-subtitle">
                List of earnings components defined in the active payroll engine
              </div>

              <div className="table-responsive">
                <table className="table" style={{ fontSize: '13px' }}>
                  <thead>
                    <tr>
                      <th>Earnings Component</th>
                      <th>Calculation Type</th>
                      <th>Value / Basis</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Basic Salary</strong></td>
                      <td><span className="badge badge-info">% of Base CTC</span></td>
                      <td>{rules.salary_structure?.basic_percentage || 50}% of Base CTC</td>
                      <td><span className="badge badge-success">Active</span></td>
                    </tr>
                    <tr>
                      <td><strong>House Rent Allowance (HRA)</strong></td>
                      <td><span className="badge badge-info">% of Basic Salary</span></td>
                      <td>{rules.salary_structure?.hra_percentage || 40}% of Basic</td>
                      <td><span className="badge badge-success">Active</span></td>
                    </tr>
                    <tr>
                      <td><strong>Special Allowance</strong></td>
                      <td><span className="badge badge-secondary">Balancing / Residual</span></td>
                      <td>Calculated balancing pay</td>
                      <td><span className="badge badge-success">Active</span></td>
                    </tr>
                    <tr>
                      <td><strong>Conveyance & Medical</strong></td>
                      <td><span className="badge badge-warning">Fixed Monthly Amount</span></td>
                      <td>₹{rules.salary_structure?.conveyance_allowance || 2000} / ₹{rules.salary_structure?.medical_allowance || 1500}</td>
                      <td><span className="badge badge-success">Active</span></td>
                    </tr>
                    <tr>
                      <td><strong>Overtime Pay</strong></td>
                      <td><span className="badge badge-primary">Formula / Hourly Multiplier</span></td>
                      <td>(Basic / Hours) × OT Multiplier</td>
                      <td><span className="badge badge-success">Active</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginTop: '20px' }}>
            <button type="submit" className="btn btn-primary">
              💾 Save Salary Structure & Earnings Rules
            </button>
          </div>
        </form>
      )}

      {/* SECTION 2: Deductions & Statutory Taxes */}
      {activeTab === 'deductions' && (
        <form
          id="deductions-rules-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveAll('Deductions & statutory tax rules saved!');
          }}
        >
          <div className="settings-grid-2">
            <div className="rule-group-card">
              <div className="rule-group-title">
                <span>🛡️ Statutory Deductions (PF, TDS & Insurance)</span>
              </div>
              <div className="rule-group-subtitle">
                Configure Provident Fund retirement percentage, TDS tax withholding and health insurance
              </div>

              <div className="form-group">
                <label className="checkbox-toggle-card">
                  <input
                    type="checkbox"
                    checked={rules.deductions_config?.pf_enabled !== false}
                    onChange={(e) =>
                      setRules({
                        ...rules,
                        deductions_config: {
                          ...rules.deductions_config,
                          pf_enabled: e.target.checked
                        }
                      })
                    }
                  />
                  <span>Enable Provident Fund (PF) Deduction</span>
                </label>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>PF Rate (% of Basic Salary)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={rules.deductions_config?.pf_rate || 6.0}
                    min="0"
                    max="25"
                    step="0.5"
                    onChange={(e) =>
                      setRules({
                        ...rules,
                        deductions_config: {
                          ...rules.deductions_config,
                          pf_rate: Number(e.target.value)
                        }
                      })
                    }
                  />
                  <span className="form-hint">Calculation Type: Percentage of Basic Salary (Standard: 6% / 12%)</span>
                </div>
                <div className="form-group">
                  <label>PF Calculation Base</label>
                  <input type="text" className="form-input" value="Basic Salary Only" disabled />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '8px' }}>
                <label className="checkbox-toggle-card">
                  <input
                    type="checkbox"
                    checked={rules.deductions_config?.tds_enabled !== false}
                    onChange={(e) =>
                      setRules({
                        ...rules,
                        deductions_config: {
                          ...rules.deductions_config,
                          tds_enabled: e.target.checked
                        }
                      })
                    }
                  />
                  <span>Enable Income Tax Withholding (TDS)</span>
                </label>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Default TDS Rate (% of Gross)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={rules.deductions_config?.tds_rate || 10.0}
                    min="0"
                    max="40"
                    step="1"
                    onChange={(e) =>
                      setRules({
                        ...rules,
                        deductions_config: {
                          ...rules.deductions_config,
                          tds_rate: Number(e.target.value)
                        }
                      })
                    }
                  />
                  <span className="form-hint">Calculation Type: Percentage of Total Gross Earnings</span>
                </div>
                <div className="form-group">
                  <label>Group Health Insurance (₹ / month)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={rules.deductions_config?.health_insurance || 500}
                    min="0"
                    step="100"
                    onChange={(e) =>
                      setRules({
                        ...rules,
                        deductions_config: {
                          ...rules.deductions_config,
                          health_insurance: Number(e.target.value)
                        }
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="rule-group-card">
              <div className="rule-group-title">
                <span>🏛️ Professional Tax (PT) Slab Rules</span>
              </div>
              <div className="rule-group-subtitle">
                Configure statutory Professional Tax slab brackets or flat monthly amount
              </div>

              <div className="form-group">
                <label>Professional Tax Calculation Mode</label>
                <select
                  className="form-input"
                  value={rules.deductions_config?.pt_mode || 'slab'}
                  onChange={(e) =>
                    setRules({
                      ...rules,
                      deductions_config: {
                        ...rules.deductions_config,
                        pt_mode: e.target.value
                      }
                    })
                  }
                >
                  <option value="slab">Slab-Based Tax Brackets (Standard Statutory)</option>
                  <option value="flat">Flat Rate (e.g. ₹200 / month)</option>
                </select>
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={{ fontWeight: 700, fontSize: '13px' }}>
                  Professional Tax Slab Table (Gross Salary Range vs Tax Amount):
                </label>
                <div className="table-responsive" style={{ marginTop: '8px' }}>
                  <table className="table" style={{ fontSize: '12.5px' }}>
                    <thead>
                      <tr>
                        <th>Monthly Gross Salary Range (₹)</th>
                        <th>Tax Amount (₹ / month)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>₹0 – ₹7,500</td>
                        <td><strong>₹0</strong> (Exempt)</td>
                      </tr>
                      <tr>
                        <td>₹7,501 – ₹10,000</td>
                        <td><strong>₹175</strong> / month</td>
                      </tr>
                      <tr>
                        <td>₹10,001 and above</td>
                        <td><strong>₹200</strong> / month</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginTop: '20px' }}>
            <button type="submit" className="btn btn-primary">
              💾 Save Deductions & Statutory Tax Rules
            </button>
          </div>
        </form>
      )}

      {/* SECTION 3: Attendance, LOP & Overtime Policy */}
      {activeTab === 'attendance_ot' && (
        <form
          id="attendance-ot-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveAll('Attendance, LOP & overtime policies saved!');
          }}
        >
          <div className="settings-grid-2">
            <div className="rule-group-card">
              <div className="rule-group-title">
                <span>📅 Attendance Basis & Loss of Pay (LOP) Rules</span>
              </div>
              <div className="rule-group-subtitle">
                Configure monthly working days basis, LOP deduction formula & late arrival grace
              </div>

              <div className="form-group">
                <label>Monthly Salary Calculation Basis</label>
                <select
                  className="form-input"
                  value={rules.attendance_lop_config?.basis || 'working_days'}
                  onChange={(e) =>
                    setRules({
                      ...rules,
                      attendance_lop_config: {
                        ...rules.attendance_lop_config,
                        basis: e.target.value
                      }
                    })
                  }
                >
                  <option value="working_days">Monthly Salary / Working Days (Exclude Weekends)</option>
                  <option value="calendar_days">Monthly Salary / Calendar Days (Standard 30 Days)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Fixed Working Days (If Fixed Mode Active)</label>
                <input
                  type="number"
                  className="form-input"
                  value={rules.attendance_lop_config?.fixed_working_days || 22}
                  min="15"
                  max="31"
                  step="1"
                  onChange={(e) =>
                    setRules({
                      ...rules,
                      attendance_lop_config: {
                        ...rules.attendance_lop_config,
                        fixed_working_days: Number(e.target.value)
                      }
                    })
                  }
                />
              </div>

              <div className="formula-callout">
                <span>ℹ️</span>
                <span>
                  LOP Formula:{' '}
                  <strong className="formula-callout-code">
                    LOP = (Monthly Base Salary ÷ Working Days) × Unpaid Absent Days
                  </strong>
                </span>
              </div>

              <div className="form-group" style={{ marginTop: '16px' }}>
                <label>Monthly Grace Late Arrivals Count Allowed</label>
                <input
                  type="number"
                  className="form-input"
                  value={
                    rules.attendance_lop_config?.late_grace_count !== undefined
                      ? rules.attendance_lop_config.late_grace_count
                      : 2
                  }
                  min="0"
                  max="10"
                  step="1"
                  onChange={(e) =>
                    setRules({
                      ...rules,
                      attendance_lop_config: {
                        ...rules.attendance_lop_config,
                        late_grace_count: Number(e.target.value)
                      }
                    })
                  }
                />
                <span className="form-hint">Check-ins beyond grace count trigger late penalty deduction</span>
              </div>

              <div className="form-group">
                <label>Late Arrival Penalty Rule</label>
                <select
                  className="form-input"
                  value={rules.attendance_lop_config?.late_penalty_type || 'half_day'}
                  onChange={(e) =>
                    setRules({
                      ...rules,
                      attendance_lop_config: {
                        ...rules.attendance_lop_config,
                        late_penalty_type: e.target.value
                      }
                    })
                  }
                >
                  <option value="half_day">Half Day Base Deduction (0.5 Days Salary)</option>
                  <option value="quarter_day">Quarter Day Base Deduction (0.25 Days Salary)</option>
                  <option value="flat">Flat Penalty Amount (e.g. ₹500)</option>
                  <option value="none">Warning Only (No Salary Deduction)</option>
                </select>
              </div>
            </div>

            <div className="rule-group-card">
              <div className="rule-group-title">
                <span>⏱️ Overtime (OT) Engine Multipliers</span>
              </div>
              <div className="rule-group-subtitle">
                Configure daily/weekly overtime thresholds, hourly rate basis and multipliers
              </div>

              <div className="form-group">
                <label className="checkbox-toggle-card">
                  <input
                    type="checkbox"
                    checked={rules.overtime_config?.enabled !== false}
                    onChange={(e) =>
                      setRules({
                        ...rules,
                        overtime_config: {
                          ...rules.overtime_config,
                          enabled: e.target.checked
                        }
                      })
                    }
                  />
                  <span>Overtime Engine Enabled</span>
                </label>
              </div>

              <div className="settings-grid-3">
                <div className="form-group">
                  <label>Daily OT Threshold</label>
                  <input
                    type="number"
                    className="form-input"
                    value={rules.overtime_config?.daily_threshold || 8.0}
                    min="4"
                    max="12"
                    step="0.5"
                    onChange={(e) =>
                      setRules({
                        ...rules,
                        overtime_config: {
                          ...rules.overtime_config,
                          daily_threshold: Number(e.target.value)
                        }
                      })
                    }
                  />
                  <span className="form-hint">&gt; 8.0 hours / day</span>
                </div>
                <div className="form-group">
                  <label>Weekly OT Threshold</label>
                  <input
                    type="number"
                    className="form-input"
                    value={rules.overtime_config?.weekly_threshold || 40.0}
                    min="20"
                    max="60"
                    step="1"
                    onChange={(e) =>
                      setRules({
                        ...rules,
                        overtime_config: {
                          ...rules.overtime_config,
                          weekly_threshold: Number(e.target.value)
                        }
                      })
                    }
                  />
                  <span className="form-hint">&gt; 40 hours / week</span>
                </div>
                <div className="form-group">
                  <label>Standard Multiplier</label>
                  <select
                    className="form-input"
                    value={String(rules.overtime_config?.standard_multiplier || 1.5)}
                    onChange={(e) =>
                      setRules({
                        ...rules,
                        overtime_config: {
                          ...rules.overtime_config,
                          standard_multiplier: Number(e.target.value)
                        }
                      })
                    }
                  >
                    <option value="1.0">1.0x (Standard Wage)</option>
                    <option value="1.25">1.25x (125% Rate)</option>
                    <option value="1.5">1.5x (Time-and-a-half)</option>
                    <option value="2.0">2.0x (Double Time)</option>
                  </select>
                </div>
              </div>

              <div className="formula-callout" style={{ background: '#f3e8ff', borderColor: '#e9d5ff', color: '#6b21a8' }}>
                <span>ℹ️</span>
                <span>
                  OT Rate Formula:{' '}
                  <strong className="formula-callout-code" style={{ background: '#fae8ff', color: '#581c87' }}>
                    Hourly Rate = Basic ÷ (Working Days × 8) | OT Pay = Hours × Rate × Multiplier
                  </strong>
                </span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginTop: '20px' }}>
            <button type="submit" className="btn btn-primary">
              💾 Save Attendance, LOP & Overtime Policy
            </button>
          </div>
        </form>
      )}

      {/* SECTION 4: Priority Cascade & Overrides */}
      {activeTab === 'overrides' && (
        <div>
          <div className="priority-cascade-card">
            <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text)' }}>
              🔀 Rule Scope Priority Cascade (First Matching Rule Wins)
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
              When evaluating payroll rules for an employee, the system follows this strict priority hierarchy:
            </div>

            <div className="priority-step-list">
              <div className="priority-step-item">
                <span className="priority-badge-num">1</span>
                <div>
                  <strong>Employee-Specific Rule Override</strong> (Highest Priority — Custom Employee Contract overrides all)
                </div>
              </div>
              <div className="priority-step-item">
                <span className="priority-badge-num">2</span>
                <div>
                  <strong>Position / Designation Exception</strong> (Second Priority — Role specific exceptions e.g. System Administrator)
                </div>
              </div>
              <div className="priority-step-item">
                <span className="priority-badge-num">3</span>
                <div>
                  <strong>Department Base Baseline</strong> (Third Priority — Department baseline scale e.g. Engineering ₹95,000)
                </div>
              </div>
              <div className="priority-step-item">
                <span className="priority-badge-num" style={{ background: '#64748b' }}>4</span>
                <div>
                  <strong>Company Default Rules</strong> (Default Fallback — Universal organization defaults)
                </div>
              </div>
            </div>
          </div>

          {/* Department Baselines Engine Table */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3>🏢 Department Base Salary Benchmarks & Higher-Scale Rules</h3>
                <p className="text-muted text-sm">
                  Higher Salary Engine: max(Individual Base, Category Benchmark, Department Baseline)
                </p>
              </div>
              <button type="button" className="btn btn-sm btn-secondary" onClick={() => setShowNewDeptModal(true)}>
                ➕ Add Department Scale
              </button>
            </div>
            <div className="card-body p-0">
              <form
                id="department-rules-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveAll('Department salary baselines saved!');
                }}
              >
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Department</th>
                        <th>Description & Scope</th>
                        <th>Minimum Department Base CTC (₹ / month)</th>
                        <th>Active Staff</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(rules.department_rules || []).map((dept) => {
                        const staffCount = empUsers.filter(
                          (u) => (u.department || '').toLowerCase() === dept.department.toLowerCase()
                        ).length;

                        return (
                          <tr key={dept.id}>
                            <td>
                              <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '14.5px' }}>
                                {dept.department}
                              </div>
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-input"
                                value={dept.description || ''}
                                placeholder="e.g. Software Engineering & Architecture"
                                onChange={(e) => handleDeptFieldChange(dept.id, 'description', e.target.value)}
                                style={{ maxWidth: '340px' }}
                              />
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>₹</span>
                                <input
                                  type="number"
                                  className="form-input"
                                  value={dept.min_base_salary || 50000}
                                  min="1000"
                                  step="500"
                                  onChange={(e) => handleDeptFieldChange(dept.id, 'min_base_salary', Number(e.target.value))}
                                  style={{ width: '140px', fontWeight: 700 }}
                                  required
                                />
                              </div>
                            </td>
                            <td>
                              <span className="badge badge-info">{staffCount} Employees</span>
                            </td>
                            <td>
                              <span className="badge badge-success">Active Engine</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: '20px', textAlign: 'right', borderTop: '1px solid var(--border)', background: 'var(--surface-secondary)' }}>
                  <button type="submit" className="btn btn-primary">
                    💾 Save Department Salary Baselines
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: Employee Category Profiles & Mapping */}
      {activeTab === 'types' && (
        <div>
          {/* Category Chips Bar */}
          <div className="type-selector-bar">
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '6px' }}>
              Select Category Profile:
            </span>
            {rules.employee_types.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`type-chip ${t.id === selectedType.id ? 'active' : ''}`}
                onClick={() => setSelectedTypeId(t.id)}
              >
                {t.name}
              </button>
            ))}
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              style={{ marginLeft: 'auto' }}
              onClick={() => setShowNewCatModal(true)}
            >
              ➕ New Category
            </button>
          </div>

          {/* Category Profile Form */}
          <form
            id="employee-type-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveAll(`Rules for "${selectedType.name}" saved!`);
            }}
          >
            <div className="settings-grid-2">
              <div className="rule-group-card">
                <div className="rule-group-title">
                  <span>📋 Category Profile Definition</span>
                  <span className="badge badge-info">{selectedType.id}</span>
                </div>
                <div className="rule-group-subtitle">
                  Define title, description and benchmark salary for this employee group
                </div>
                <div className="form-group">
                  <label>Category Display Name <span className="req">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={selectedType.name || ''}
                    onChange={(e) => handleCategoryFieldChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description & Scope</label>
                  <input
                    type="text"
                    className="form-input"
                    value={selectedType.description || ''}
                    placeholder="e.g. Senior Developers, Department Leads"
                    onChange={(e) => handleCategoryFieldChange('description', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Benchmark Base CTC (INR ₹) <span className="req">*</span></label>
                  <input
                    type="number"
                    className="form-input"
                    value={selectedType.base_salary || 50000}
                    min="1000"
                    step="500"
                    onChange={(e) => handleCategoryFieldChange('base_salary', Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="rule-group-card">
                <div className="rule-group-title">
                  <span>💵 Component Splits for {selectedType.name}</span>
                </div>
                <div className="rule-group-subtitle">Configure percentage splits and fixed monthly allowances</div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Basic Salary (% of Base)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={selectedType.basic_percentage !== undefined ? selectedType.basic_percentage : 50}
                      min="10"
                      max="100"
                      step="1"
                      onChange={(e) => handleCategoryFieldChange('basic_percentage', Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>HRA (% of Basic)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={selectedType.hra_percentage !== undefined ? selectedType.hra_percentage : 40}
                      min="0"
                      max="100"
                      step="1"
                      onChange={(e) => handleCategoryFieldChange('hra_percentage', Number(e.target.value))}
                      required
                    />
                  </div>
                </div>
                <div className="settings-grid-3">
                  <div className="form-group">
                    <label>Special Allowance (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={selectedType.special_allowance || 0}
                      min="0"
                      step="500"
                      onChange={(e) => handleCategoryFieldChange('special_allowance', Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Conveyance (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={selectedType.conveyance_allowance || 0}
                      min="0"
                      step="500"
                      onChange={(e) => handleCategoryFieldChange('conveyance_allowance', Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Medical Allowance (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={selectedType.medical_allowance || 0}
                      min="0"
                      step="500"
                      onChange={(e) => handleCategoryFieldChange('medical_allowance', Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px',
                marginTop: '24px',
                padding: '20px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                marginBottom: '24px'
              }}
            >
              <div>
                <span style={{ fontWeight: 700, color: 'var(--text)' }}>Updating Rules for:</span>{' '}
                <strong>{selectedType.name}</strong>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {rules.employee_types.length > 1 && (
                  <button type="button" className="btn btn-danger" onClick={() => handleDeleteCategory(selectedType.id)}>
                    🗑️ Delete Category
                  </button>
                )}
                <button type="submit" className="btn btn-primary">
                  💾 Save "{selectedType.name}" Rules
                </button>
              </div>
            </div>
          </form>

          {/* Employee Category Assignments & Salary Mapping Table */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3>👥 Assign Employees to Category Profiles & Individual Base CTC</h3>
                <p className="text-muted text-sm">
                  Select which Category Profile each employee belongs to, configure individual base contract salaries, bank details, and PAN numbers.
                </p>
              </div>
            </div>
            <div className="card-body p-0">
              <form
                id="employee-mapping-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveAll('All employee category mappings saved!');
                }}
              >
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Employee & Department</th>
                        <th>Assigned Category Profile</th>
                        <th>Individual Base CTC (₹)</th>
                        <th>Dept Baseline (₹)</th>
                        <th>Effective Base Pay (Higher Engine)</th>
                        <th>Bank Name</th>
                        <th>Account No</th>
                        <th>IFSC Code</th>
                        <th>PAN Card #</th>
                      </tr>
                    </thead>
                    <tbody>
                      {empUsers.map((emp) => {
                        const deptRules = rules.department_rules || [];
                        const deptRule = deptRules.find((d) => d.department.toLowerCase() === (emp.department || '').toLowerCase());
                        const deptBase = deptRule ? Number(deptRule.min_base_salary) || 0 : 0;

                        const sal = salList.find((s) => s.user_id === emp.id) || {
                          user_id: emp.id,
                          employee_type_id: 'full_time_senior',
                          base_salary: 75000,
                          bank_name: 'HDFC Bank Ltd.',
                          bank_account_no: '••••••••4892',
                          bank_ifsc: 'HDFC0001001',
                          pan_no: 'ABCDE1234F'
                        };

                        const empType = (rules.employee_types || []).find((t) => t.id === sal.employee_type_id) || rules.employee_types[0];
                        const indBase = Number(sal.base_salary) || 0;
                        const catBase = Number(empType?.base_salary) || 0;
                        const effectiveBase = Math.max(indBase, catBase, deptBase) || 50000;
                        const isDeptHigher = effectiveBase === deptBase && deptBase > indBase;

                        return (
                          <tr key={emp.id}>
                            <td>
                              <div className="emp-cell">
                                <div className="avatar-sm">{(emp.first_name?.[0] || 'E').toUpperCase()}</div>
                                <div>
                                  <div className="fw-600">
                                    {emp.first_name} {emp.last_name}
                                  </div>
                                  <div className="text-muted text-sm">
                                    <span className="badge badge-info" style={{ fontSize: '10.5px', padding: '2px 6px' }}>
                                      {emp.department || 'General'}
                                    </span>{' '}
                                    {emp.position || 'Staff'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <select
                                className="form-input"
                                value={sal.employee_type_id || 'full_time_senior'}
                                onChange={(e) => handleSalaryFieldChange(emp.id, 'employee_type_id', e.target.value)}
                                style={{ minWidth: '170px' }}
                              >
                                {rules.employee_types.map((t) => (
                                  <option key={t.id} value={t.id}>
                                    {t.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-input"
                                value={sal.base_salary || 50000}
                                min="1000"
                                step="500"
                                onChange={(e) => handleSalaryFieldChange(emp.id, 'base_salary', Number(e.target.value))}
                                style={{ width: '120px' }}
                              />
                            </td>
                            <td>
                              <span style={{ fontWeight: 600, color: 'var(--text)' }}>{formatINR(deptBase)}</span>
                            </td>
                            <td>
                              <div style={{ fontWeight: 800, color: '#059669', fontSize: '14.5px' }}>
                                {formatINR(effectiveBase)}
                              </div>
                              {isDeptHigher ? (
                                <div
                                  style={{
                                    fontSize: '10.5px',
                                    fontWeight: 700,
                                    color: '#4338ca',
                                    background: '#eef2ff',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    marginTop: '2px',
                                    display: 'inline-block'
                                  }}
                                >
                                  ⚡ Elevated by {emp.department} Baseline
                                </div>
                              ) : (
                                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                  Individual Contract Base
                                </div>
                              )}
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-input"
                                value={sal.bank_name || 'HDFC Bank Ltd.'}
                                onChange={(e) => handleSalaryFieldChange(emp.id, 'bank_name', e.target.value)}
                                style={{ width: '130px' }}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-input"
                                value={sal.bank_account_no || '••••••••4892'}
                                onChange={(e) => handleSalaryFieldChange(emp.id, 'bank_account_no', e.target.value)}
                                style={{ width: '120px' }}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-input"
                                value={sal.bank_ifsc || 'HDFC0001001'}
                                onChange={(e) => handleSalaryFieldChange(emp.id, 'bank_ifsc', e.target.value)}
                                style={{ width: '110px' }}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-input"
                                value={sal.pan_no || 'ABCDE1234F'}
                                onChange={(e) => handleSalaryFieldChange(emp.id, 'pan_no', e.target.value)}
                                style={{ width: '110px' }}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: '20px', textAlign: 'right', borderTop: '1px solid var(--border)', background: 'var(--surface-secondary)' }}>
                  <button type="submit" className="btn btn-primary">
                    💾 Save All Employee Category Mappings
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: Test Simulation & Preview */}
      {activeTab === 'simulation' && (
        <div className="settings-grid-2">
          <div>
            <div className="rule-group-card">
              <div className="rule-group-title">
                <span>📋 Active Payroll Rule Engine Summary</span>
                <span className="badge badge-success">{rules.rule_status || 'ACTIVE'}</span>
              </div>
              <div className="rule-group-subtitle">
                Overview of configured formulas applied during payment processing
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                <div style={{ padding: '10px 14px', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid #6366f1' }}>
                  <strong>Basic Salary:</strong> {rules.salary_structure?.basic_percentage || 50}% of Effective Base CTC
                </div>
                <div style={{ padding: '10px 14px', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid #6366f1' }}>
                  <strong>HRA Component:</strong> {rules.salary_structure?.hra_percentage || 40}% of Basic Salary
                </div>
                <div style={{ padding: '10px 14px', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid #059669' }}>
                  <strong>Provident Fund (PF):</strong> {rules.deductions_config?.pf_enabled !== false ? `${rules.deductions_config?.pf_rate || 6}% of Basic Salary` : 'Disabled'}
                </div>
                <div style={{ padding: '10px 14px', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid #059669' }}>
                  <strong>Professional Tax (PT):</strong> {rules.deductions_config?.pt_mode === 'slab' ? 'Slab-Based (₹0 / ₹175 / ₹200)' : `Flat ₹${rules.deductions_config?.pt_flat_amount || 200}`}
                </div>
                <div style={{ padding: '10px 14px', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid #dc2626' }}>
                  <strong>Loss of Pay (LOP):</strong> Monthly Salary ÷ {rules.attendance_lop_config?.basis === 'calendar_days' ? 'Calendar Days' : 'Working Days'} × Unpaid Days
                </div>
                <div style={{ padding: '10px 14px', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid #7c3aed' }}>
                  <strong>Overtime (OT):</strong> Hourly Rate × {rules.overtime_config?.standard_multiplier || 1.5}x (&gt;8h daily / &gt;40h weekly)
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="rule-group-card">
              <div className="rule-group-title">
                <span>🧪 Interactive "Test Payroll" Dry-Run Simulator</span>
              </div>
              <div className="rule-group-subtitle">
                Select an employee to preview payroll calculations before activating rules
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontWeight: 700 }}>Select Sample Employee for Test Simulation:</label>
                <select
                  className="form-input"
                  value={selectedSimUserId}
                  onChange={(e) => setSelectedSimUserId(Number(e.target.value))}
                >
                  {empUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.first_name} {u.last_name} ({u.department || 'Staff'}) — {u.position || ''}
                    </option>
                  ))}
                </select>
              </div>

              {simPayroll && (
                <>
                  <div className="simulation-banner">
                    <span>⚠️</span>
                    <span>SIMULATION MODE — DRAFT CALCULATED PAYROLL (Not a Saved Payment)</span>
                  </div>

                  <div className="card" style={{ border: '1px solid var(--border-dark)', background: 'var(--surface)' }}>
                    <div className="card-header" style={{ padding: '12px 16px', background: 'var(--surface-secondary)' }}>
                      <div style={{ fontWeight: 700 }}>
                        Simulated Payslip: {simPayroll.user?.first_name} {simPayroll.user?.last_name}
                      </div>
                      <div className="text-sm text-muted">
                        {simPayroll.user?.department} Department • {simPayroll.applied_salary_reason}
                      </div>
                    </div>
                    <div className="card-body" style={{ padding: '16px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span>Base CTC Scale:</span>
                        <strong>{formatINR(simPayroll.effective_base_salary)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span>Basic Salary (50%):</span>
                        <strong>{formatINR(simPayroll.basic_pay)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span>House Rent Allowance (HRA):</span>
                        <strong>{formatINR(simPayroll.hra)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span>Allowances & Overtime:</span>
                        <strong>
                          {formatINR(
                            (simPayroll.special_allowance || 0) +
                              (simPayroll.conveyance_allowance || 0) +
                              (simPayroll.medical_allowance || 0) +
                              (simPayroll.overtime_pay || 0)
                          )}
                        </strong>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          paddingTop: '6px',
                          borderTop: '1px solid var(--border)',
                          fontWeight: 700,
                          color: '#059669'
                        }}
                      >
                        <span>Total Gross Earnings:</span>
                        <span>{formatINR(simPayroll.gross_earnings)}</span>
                      </div>

                      <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1.5px dashed var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span>Provident Fund (PF):</span>
                          <span className="text-danger">-{formatINR(simPayroll.pf_deduction)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span>Professional Tax (PT):</span>
                          <span className="text-danger">-{formatINR(simPayroll.professional_tax)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span>Income Tax (TDS):</span>
                          <span className="text-danger">-{formatINR(simPayroll.tds_tax)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span>LOP & Late Penalties:</span>
                          <span className="text-danger">
                            -{formatINR((simPayroll.lop_deduction || 0) + (simPayroll.late_deduction || 0))}
                          </span>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            paddingTop: '6px',
                            borderTop: '1px solid var(--border)',
                            fontWeight: 800,
                            fontSize: '15px',
                            color: 'var(--primary)'
                          }}
                        >
                          <span>Calculated Net Pay:</span>
                          <span>{formatINR(simPayroll.net_pay)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 7: Payslip Branding & Entity */}
      {activeTab === 'branding' && (
        <form
          id="company-branding-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveAll('Company branding & payslip certificate info saved!');
          }}
        >
          <div className="rule-group-card" style={{ maxWidth: '750px', margin: '0 auto' }}>
            <div className="rule-group-title">
              <span>🏢 Legal Entity & Payslip Certificate Info</span>
            </div>
            <div className="rule-group-subtitle">
              This information appears on all generated Tax Invoices & Salary Payslips
            </div>

            <div className="form-group">
              <label>Company Legal Name <span className="req">*</span></label>
              <input
                type="text"
                className="form-input"
                value={rules.company?.company_name || 'AttendEase Technologies Pvt. Ltd.'}
                onChange={(e) =>
                  setRules({
                    ...rules,
                    company: { ...rules.company, company_name: e.target.value }
                  })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Registered Corporate Address <span className="req">*</span></label>
              <input
                type="text"
                className="form-input"
                value={rules.company?.address || 'Cyber City, Sector 24, DLF Phase 3, Gurugram, HR 122002'}
                onChange={(e) =>
                  setRules({
                    ...rules,
                    company: { ...rules.company, address: e.target.value }
                  })
                }
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>GSTIN / Tax ID Number <span className="req">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={rules.company?.gstin || '07AABCA1234F1Z8'}
                  onChange={(e) =>
                    setRules({
                      ...rules,
                      company: { ...rules.company, gstin: e.target.value }
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Payroll Contact Email <span className="req">*</span></label>
                <input
                  type="email"
                  className="form-input"
                  value={rules.company?.email || 'contact@attendease.com'}
                  onChange={(e) =>
                    setRules({
                      ...rules,
                      company: { ...rules.company, email: e.target.value }
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Authorized Signatory Title</label>
              <input
                type="text"
                className="form-input"
                value={rules.company?.signatory_title || 'Finance & Payroll Department'}
                onChange={(e) =>
                  setRules({
                    ...rules,
                    company: { ...rules.company, signatory_title: e.target.value }
                  })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Payslip Certificate Disclaimer Note</label>
              <textarea
                className="form-input"
                rows="3"
                value={
                  rules.company?.disclaimer ||
                  'This is a computer-generated tax invoice and salary certificate. No physical signature is required under IT rules.'
                }
                onChange={(e) =>
                  setRules({
                    ...rules,
                    company: { ...rules.company, disclaimer: e.target.value }
                  })
                }
                required
              ></textarea>
            </div>

            <div style={{ textAlign: 'right', marginTop: '20px' }}>
              <button type="submit" className="btn btn-primary">
                💾 Save Payslip Branding & Notes
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Modal for New Employee Category */}
      {showNewCatModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>Create New Employee Category</h3>
              <button className="modal-close" onClick={() => setShowNewCatModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateCategorySubmit} style={{ padding: '24px' }}>
              <div className="form-group">
                <label>Category Name <span className="req">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Sales Specialist, Part-Time Consultant"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Commission + Base Staff"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Benchmark Base Monthly Salary (₹) <span className="req">*</span></label>
                <input
                  type="number"
                  className="form-input"
                  value={newCatBase}
                  min="1000"
                  step="500"
                  onChange={(e) => setNewCatBase(Number(e.target.value))}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewCatModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for New Department Scale */}
      {showNewDeptModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>Add Department Base Salary Benchmark</h3>
              <button className="modal-close" onClick={() => setShowNewDeptModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateDeptSubmit} style={{ padding: '24px' }}>
              <div className="form-group">
                <label>Department Name <span className="req">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Artificial Intelligence & Labs"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description & Scope</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Core AI Researchers and Engineers"
                  value={newDeptDesc}
                  onChange={(e) => setNewDeptDesc(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Minimum Department Base CTC (₹) <span className="req">*</span></label>
                <input
                  type="number"
                  className="form-input"
                  value={newDeptBase}
                  min="1000"
                  step="500"
                  onChange={(e) => setNewDeptBase(Number(e.target.value))}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewDeptModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Department Scale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

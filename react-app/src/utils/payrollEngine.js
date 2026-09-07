// src/utils/payrollEngine.js
// Complete Payroll & Compensation Engine for AttendEase React App (Matching html-app)

export function formatINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function generateId() {
  return Date.now() + Math.floor(Math.random() * 10000);
}

export function numberToWordsINR(num) {
  if (!num || isNaN(num) || num <= 0) return 'Zero Rupees Only';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n) {
    if (n < 20) return a[n];
    const digit = n % 10;
    return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '');
  }

  let str = '';
  const whole = Math.floor(num);
  const paise = Math.round((num - whole) * 100);

  const crore = Math.floor(whole / 10000000);
  let rem = whole % 10000000;
  const lakh = Math.floor(rem / 100000);
  rem = rem % 100000;
  const thousand = Math.floor(rem / 1000);
  rem = rem % 1000;
  const hundred = Math.floor(rem / 100);
  const tens = rem % 100;

  if (crore) str += inWords(crore) + ' Crore ';
  if (lakh) str += inWords(lakh) + ' Lakh ';
  if (thousand) str += inWords(thousand) + ' Thousand ';
  if (hundred) str += inWords(hundred) + ' Hundred ';
  if (tens) str += (str ? 'and ' : '') + inWords(tens) + ' ';

  str = str.trim() || 'Zero';
  str += ' Rupees';
  if (paise > 0) {
    str += ' and ' + inWords(paise) + ' Paise';
  }
  return str + ' Only';
}

export function getDefaultPayrollRules() {
  return {
    rule_status: 'ACTIVE',
    version: '2.4.0',
    effective_from: '2026-08-01',
    company: {
      company_name: 'AttendEase Technologies Pvt. Ltd.',
      address: 'Cyber City, Sector 24, DLF Phase 3, Gurugram, HR 122002',
      gstin: '07AABCA1234F1Z8',
      email: 'contact@attendease.com',
      signatory_title: 'Finance & Payroll Department',
      disclaimer: 'This is a computer-generated tax invoice and salary certificate. No physical signature is required under IT rules.'
    },
    global_rules: {
      currency: 'INR',
      currency_symbol: '₹',
      working_days_mode: 'auto',
      fixed_working_days: 22,
      daily_overtime_threshold: 8.0,
      weekly_overtime_threshold: 40.0,
      overtime_multiplier: 1.5,
      overtime_enabled: true,
      late_grace_count: 2,
      late_penalty_type: 'half_day',
      late_flat_penalty: 500,
      pf_rate: 6.0,
      default_tds_rate: 10.0,
      health_insurance: 500,
      professional_tax: 200
    },
    salary_structure: {
      basic_percentage: 50,
      hra_percentage: 40,
      da_enabled: false,
      da_percentage: 10,
      conveyance_allowance: 2000,
      medical_allowance: 1500,
      special_allowance_mode: 'residual'
    },
    deductions_config: {
      pf_enabled: true,
      pf_rate: 6.0,
      pf_based_on: 'Basic Salary',
      tds_enabled: true,
      tds_rate: 10.0,
      pt_enabled: true,
      pt_mode: 'slab',
      pt_flat_amount: 200,
      pt_slabs: [
        { min: 0, max: 7500, tax: 0 },
        { min: 7501, max: 10000, tax: 175 },
        { min: 10001, max: 9999999, tax: 200 }
      ],
      health_insurance: 500
    },
    attendance_lop_config: {
      basis: 'working_days',
      fixed_working_days: 22,
      late_grace_count: 2,
      late_penalty_type: 'half_day',
      late_flat_penalty: 500
    },
    overtime_config: {
      enabled: true,
      daily_threshold: 8.0,
      weekly_threshold: 40.0,
      standard_multiplier: 1.5,
      weekend_multiplier: 2.0,
      holiday_multiplier: 2.0
    },
    department_rules: [
      { id: 'management', department: 'Management', min_base_salary: 150000, description: 'Executive Leadership, Admin & Directors' },
      { id: 'engineering', department: 'Engineering', min_base_salary: 95000, description: 'Software Engineering, Architecture & DevOps' },
      { id: 'finance', department: 'Finance', min_base_salary: 75000, description: 'Financial Planning, Accounting & Audit' },
      { id: 'sales', department: 'Sales', min_base_salary: 70000, description: 'Direct Sales, Accounts & Business Development' },
      { id: 'marketing', department: 'Marketing', min_base_salary: 65000, description: 'Brand Marketing, Growth & Communications' },
      { id: 'hr', department: 'HR', min_base_salary: 60000, description: 'Talent Acquisition, People Operations & Relations' },
      { id: 'operations', department: 'Operations', min_base_salary: 55000, description: 'Support, Logistics & Workplace Operations' }
    ],
    overrides: [
      { id: 'ov_eng_hra', scope: 'department', target: 'Engineering', rule_type: 'hra_percentage', value: 45, note: 'Engineering High HRA Tier' },
      { id: 'ov_mgr_hra', scope: 'position', target: 'System Administrator', rule_type: 'hra_percentage', value: 50, note: 'Admin/Manager HRA Tier' }
    ],
    employee_types: [
      {
        id: 'full_time_senior',
        name: 'Full-Time Senior Professional',
        base_salary: 95000,
        description: 'Senior Software Engineers, Leads & Architects',
        custom_allowance: 5000,
        custom_allowance_label: 'Senior Tech Allowance',
        custom_deduction: 0,
        custom_deduction_label: ''
      },
      {
        id: 'full_time_junior',
        name: 'Full-Time Junior Associate',
        base_salary: 45000,
        description: 'Junior Developers, Support Staff & Analysts',
        custom_allowance: 2000,
        custom_allowance_label: 'Learning Allowance',
        custom_deduction: 0,
        custom_deduction_label: ''
      },
      {
        id: 'management_exec',
        name: 'Executive Management',
        base_salary: 150000,
        description: 'Directors, VPs & Department Heads',
        custom_allowance: 10000,
        custom_allowance_label: 'Executive Retention Bonus',
        custom_deduction: 0,
        custom_deduction_label: ''
      },
      {
        id: 'intern',
        name: 'Stipend Intern',
        base_salary: 20000,
        description: 'Trainees & Graduate Interns',
        custom_allowance: 1000,
        custom_allowance_label: 'Book & Internet Allowance',
        custom_deduction: 0,
        custom_deduction_label: ''
      },
      {
        id: 'contractor',
        name: 'Contract Staff (Retainer)',
        base_salary: 60000,
        description: 'Independent Consultants & Retainers',
        custom_allowance: 0,
        custom_allowance_label: '',
        custom_deduction: 500,
        custom_deduction_label: 'Admin Overhead'
      }
    ]
  };
}

export function getDefaultSalaries() {
  return [
    { user_id: 1, employee_type_id: 'management_exec', base_salary: 150000, bank_name: 'HDFC Bank Ltd.', bank_account_no: '••••••••4891', bank_ifsc: 'HDFC0001001', pan_no: 'ABCDE1001F' },
    { user_id: 2, employee_type_id: 'full_time_senior', base_salary: 95000, bank_name: 'State Bank of India', bank_account_no: '••••••••4892', bank_ifsc: 'SBIN0002002', pan_no: 'ABCDE1002G' },
    { user_id: 3, employee_type_id: 'full_time_junior', base_salary: 45000, bank_name: 'ICICI Bank Ltd.', bank_account_no: '••••••••4893', bank_ifsc: 'ICIC0003003', pan_no: 'ABCDE1003H' },
    { user_id: 4, employee_type_id: 'full_time_senior', base_salary: 75000, bank_name: 'Axis Bank Ltd.', bank_account_no: '••••••••4894', bank_ifsc: 'UTIB0004004', pan_no: 'ABCDE1004J' },
    { user_id: 5, employee_type_id: 'full_time_junior', base_salary: 55000, bank_name: 'Kotak Mahindra Bank', bank_account_no: '••••••••4895', bank_ifsc: 'KKBK0005005', pan_no: 'ABCDE1005K' },
    { user_id: 6, employee_type_id: 'full_time_senior', base_salary: 65000, bank_name: 'HDFC Bank Ltd.', bank_account_no: '••••••••4896', bank_ifsc: 'HDFC0001006', pan_no: 'ABCDE1006L' }
  ];
}

export function calculatePayroll(userId, month, year, rules, users, attendance, leaves, salaries) {
  const emp = users.find(u => u.id === Number(userId));
  if (!emp) return null;

  const currentRules = rules || getDefaultPayrollRules();
  const currentSalaries = salaries || getDefaultSalaries();

  let salRecord = currentSalaries.find(s => s.user_id === emp.id);
  if (!salRecord) {
    salRecord = {
      user_id: emp.id,
      employee_type_id: 'full_time_senior',
      base_salary: 65000,
      bank_name: 'HDFC Bank Ltd.',
      bank_account_no: '••••••••8899',
      bank_ifsc: 'HDFC0001001',
      pan_no: 'ABCDE9999Z'
    };
  }

  const empType = currentRules.employee_types.find(t => t.id === salRecord.employee_type_id) || currentRules.employee_types[0];

  // ─── 4-Tier Priority Cascade & Higher Engine Formula ───
  let appliedHraPercent = currentRules.salary_structure.hra_percentage || 40;
  let appliedReason = 'Standard Company Baseline';

  // Level 3: Department Minimum Salary Floor
  const deptRule = currentRules.department_rules.find(d => d.department.toLowerCase() === (emp.department || '').toLowerCase());
  const deptMinSalary = deptRule ? deptRule.min_base_salary : 0;
  const categoryBaseSalary = empType ? empType.base_salary : 0;
  const individualBaseSalary = salRecord.base_salary || 0;

  // Higher Salary Engine: Effective Base CTC = max(Individual, Category, Department Min)
  const effectiveBaseSalary = Math.max(individualBaseSalary, categoryBaseSalary, deptMinSalary);

  if (effectiveBaseSalary > individualBaseSalary) {
    if (effectiveBaseSalary === deptMinSalary) {
      appliedReason = `Elevated to Department Baseline Minimum (₹${deptMinSalary.toLocaleString('en-IN')})`;
    } else {
      appliedReason = `Elevated to Category Profile Standard (₹${categoryBaseSalary.toLocaleString('en-IN')})`;
    }
  }

  // Evaluate Priority Overrides
  if (currentRules.overrides && currentRules.overrides.length > 0) {
    const posOverride = currentRules.overrides.find(o => o.scope === 'position' && o.target.toLowerCase() === (emp.position || '').toLowerCase());
    if (posOverride && posOverride.rule_type === 'hra_percentage') {
      appliedHraPercent = Number(posOverride.value);
      appliedReason += ` | Position Override (${emp.position} HRA ${appliedHraPercent}%)`;
    } else {
      const deptOverride = currentRules.overrides.find(o => o.scope === 'department' && o.target.toLowerCase() === (emp.department || '').toLowerCase());
      if (deptOverride && deptOverride.rule_type === 'hra_percentage') {
        appliedHraPercent = Number(deptOverride.value);
        appliedReason += ` | Dept Override (${emp.department} HRA ${appliedHraPercent}%)`;
      }
    }
  }

  // Attendance metrics
  const monthPadded = String(month).padStart(2, '0');
  const monthPrefix = `${year}-${monthPadded}`;

  const userAtt = attendance.filter(a => a.user_id === emp.id && a.date && a.date.startsWith(monthPrefix));
  const workingDays = currentRules.attendance_lop_config.fixed_working_days || 22;

  const presentDays = userAtt.filter(a => a.status === 'present' || a.status === 'late').length;
  const lateDays = userAtt.filter(a => a.status === 'late').length;

  const userLeaves = leaves.filter(l => l.user_id === emp.id && l.status === 'approved');
  let paidLeaves = 0;
  userLeaves.forEach(l => {
    if (l.start_date && l.start_date.startsWith(monthPrefix)) {
      paidLeaves += l.days_requested || 1;
    }
  });

  const loggedDaysCount = presentDays + paidLeaves;
  const absentDays = Math.max(0, workingDays - loggedDaysCount);

  let totalHours = 0;
  let overtimeHours = 0;

  userAtt.forEach(a => {
    const hrs = Number(a.hours_worked) || 8.0;
    totalHours += hrs;
    if (hrs > currentRules.overtime_config.daily_threshold) {
      overtimeHours += (hrs - currentRules.overtime_config.daily_threshold);
    }
  });

  // Calculate earnings components
  const basicPercentage = (currentRules.salary_structure.basic_percentage || 50) / 100;
  const basicPay = Math.round(effectiveBaseSalary * basicPercentage);
  const hraPay = Math.round(basicPay * (appliedHraPercent / 100));
  const conveyance = currentRules.salary_structure.conveyance_allowance || 2000;
  const medical = currentRules.salary_structure.medical_allowance || 1500;

  let specialAllowance = effectiveBaseSalary - (basicPay + hraPay + conveyance + medical);
  if (specialAllowance < 0) specialAllowance = 0;

  // Hourly Rate & Overtime Pay (1.5x)
  const standardHourlyRate = effectiveBaseSalary / (workingDays * 8);
  const overtimePay = Math.round(overtimeHours * standardHourlyRate * (currentRules.overtime_config.standard_multiplier || 1.5));

  // Category custom earnings / bonus
  let bonus = 0;
  const typeCustomEarnings = [];
  if (empType && empType.custom_allowance > 0) {
    typeCustomEarnings.push({
      label: empType.custom_allowance_label || 'Category Allowance',
      amount: empType.custom_allowance
    });
    bonus += empType.custom_allowance;
  }

  const grossEarnings = basicPay + hraPay + specialAllowance + conveyance + medical + overtimePay + bonus;

  // Calculate deductions
  const dailyRate = effectiveBaseSalary / workingDays;
  const lopDeduction = Math.round(absentDays * dailyRate);

  // Late Penalty (2 free grace passes)
  let latePenaltyDays = Math.max(0, lateDays - (currentRules.attendance_lop_config.late_grace_count || 2));
  let lateDeduction = 0;
  if (latePenaltyDays > 0) {
    if (currentRules.attendance_lop_config.late_penalty_type === 'half_day') {
      lateDeduction = Math.round(latePenaltyDays * 0.5 * dailyRate);
    } else {
      lateDeduction = latePenaltyDays * (currentRules.attendance_lop_config.late_flat_penalty || 500);
    }
  }

  // Statutory PF & TDS
  let pfDeduction = 0;
  if (currentRules.deductions_config.pf_enabled) {
    pfDeduction = Math.round(basicPay * ((currentRules.deductions_config.pf_rate || 6) / 100));
  }

  let tdsTax = 0;
  if (currentRules.deductions_config.tds_enabled) {
    tdsTax = Math.round(grossEarnings * ((currentRules.deductions_config.tds_rate || 10) / 100));
  }

  // Professional Tax Slab
  let professionalTax = 0;
  if (currentRules.deductions_config.pt_enabled) {
    if (currentRules.deductions_config.pt_mode === 'slab' && currentRules.deductions_config.pt_slabs) {
      const slab = currentRules.deductions_config.pt_slabs.find(s => grossEarnings >= s.min && grossEarnings <= s.max);
      professionalTax = slab ? slab.tax : 200;
    } else {
      professionalTax = currentRules.deductions_config.pt_flat_amount || 200;
    }
  }

  const insurance = currentRules.deductions_config.health_insurance || 500;

  // Category custom deductions
  const typeCustomDeductions = [];
  if (empType && empType.custom_deduction > 0) {
    typeCustomDeductions.push({
      label: empType.custom_deduction_label || 'Category Deduction',
      amount: empType.custom_deduction
    });
  }

  const extraDeductionsTotal = typeCustomDeductions.reduce((a, b) => a + b.amount, 0);

  const totalDeductions = lopDeduction + lateDeduction + pfDeduction + tdsTax + professionalTax + insurance + extraDeductionsTotal;
  const netPay = Math.max(0, grossEarnings - totalDeductions);

  return {
    user: emp,
    user_id: emp.id,
    month,
    year,
    working_days: workingDays,
    present_days: presentDays,
    late_days: lateDays,
    paid_leaves: paidLeaves,
    absent_days: absentDays,
    total_hours: totalHours,
    overtime_hours: overtimeHours,
    standard_hourly_rate: Math.round(standardHourlyRate),
    ot_multiplier: currentRules.overtime_config.standard_multiplier || 1.5,
    base_salary: individualBaseSalary,
    effective_base_salary: effectiveBaseSalary,
    dept_base_salary: deptMinSalary,
    applied_salary_reason: appliedReason,
    applied_hra_percent: appliedHraPercent,
    department: emp.department || 'General',
    basic_pay: basicPay,
    hra: hraPay,
    special_allowance: specialAllowance,
    conveyance_allowance: conveyance,
    medical_allowance: medical,
    overtime_pay: overtimePay,
    type_custom_earnings: typeCustomEarnings,
    bonus,
    gross_earnings: grossEarnings,
    lop_deduction: lopDeduction,
    late_deduction: lateDeduction,
    pf_deduction: pfDeduction,
    tds_tax: tdsTax,
    insurance,
    professional_tax: professionalTax,
    type_custom_deductions: typeCustomDeductions,
    total_deductions: totalDeductions,
    net_pay: netPay,
    bank_name: salRecord.bank_name || 'HDFC Bank Ltd.',
    bank_account_no: salRecord.bank_account_no || '••••••••4891',
    bank_ifsc: salRecord.bank_ifsc || 'HDFC0001001',
    pan_no: salRecord.pan_no || 'ABCDE1001F'
  };
}

export function generateMonthlyInvoicesList(month, year, users, attendance, leaves, salaries, rules, existingInvoices = []) {
  const empUsers = users.filter(u => u.role === 'employee' && u.is_active !== false);
  const updatedInvoices = [...existingInvoices];

  empUsers.forEach(emp => {
    const payroll = calculatePayroll(emp.id, month, year, rules, users, attendance, leaves, salaries);
    if (!payroll) return;

    const monthPadded = String(month).padStart(2, '0');
    const invNum = `INV-${year}-${monthPadded}-000${emp.id}`;

    const existingIdx = updatedInvoices.findIndex(i => String(i.user_id) === String(emp.id) && i.month === month && i.year === year);

    const invoiceRecord = {
      id: generateId(),
      invoice_number: invNum,
      user_id: emp.id,
      month,
      year,
      status: 'approved',
      working_days: payroll.working_days,
      present_days: payroll.present_days,
      late_days: payroll.late_days,
      paid_leaves: payroll.paid_leaves,
      absent_days: payroll.absent_days,
      total_hours: payroll.total_hours,
      overtime_hours: payroll.overtime_hours,
      standard_hourly_rate: payroll.standard_hourly_rate,
      ot_multiplier: payroll.ot_multiplier,
      base_salary: payroll.base_salary,
      effective_base_salary: payroll.effective_base_salary,
      dept_base_salary: payroll.dept_base_salary,
      applied_salary_reason: payroll.applied_salary_reason,
      department: payroll.department,
      basic_pay: payroll.basic_pay,
      hra: payroll.hra,
      special_allowance: payroll.special_allowance,
      conveyance_allowance: payroll.conveyance_allowance,
      medical_allowance: payroll.medical_allowance,
      overtime_pay: payroll.overtime_pay,
      type_custom_earnings: payroll.type_custom_earnings || [],
      bonus: payroll.bonus,
      gross_earnings: payroll.gross_earnings,
      lop_deduction: payroll.lop_deduction,
      late_deduction: payroll.late_deduction,
      pf_deduction: payroll.pf_deduction,
      tds_tax: payroll.tds_tax,
      insurance: payroll.insurance,
      professional_tax: payroll.professional_tax,
      type_custom_deductions: payroll.type_custom_deductions || [],
      total_deductions: payroll.total_deductions,
      net_pay: payroll.net_pay,
      custom_line_items: [],
      payment_mode: 'NEFT / Direct Transfer',
      transaction_ref: '',
      paid_at: null,
      created_at: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      const prev = updatedInvoices[existingIdx];
      invoiceRecord.id = prev.id;
      invoiceRecord.status = prev.status;
      invoiceRecord.payment_mode = prev.payment_mode || 'NEFT / Direct Transfer';
      invoiceRecord.transaction_ref = prev.transaction_ref || '';
      invoiceRecord.paid_at = prev.paid_at || null;
      invoiceRecord.custom_line_items = prev.custom_line_items || [];
      updatedInvoices[existingIdx] = invoiceRecord;
    } else {
      updatedInvoices.push(invoiceRecord);
    }
  });

  return updatedInvoices;
}

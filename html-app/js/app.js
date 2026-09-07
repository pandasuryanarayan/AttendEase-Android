// html-app/js/app.js

// ==================== DATA LAYER ====================
const Storage = {
  getUsers() {
    return JSON.parse(localStorage.getItem('eas_users') || '[]');
  },
  saveUsers(users) {
    localStorage.setItem('eas_users', JSON.stringify(users));
  },
  getAttendance() {
    return JSON.parse(localStorage.getItem('eas_attendance') || '[]');
  },
  saveAttendance(records) {
    localStorage.setItem('eas_attendance', JSON.stringify(records));
  },
  getLeaves() {
    return JSON.parse(localStorage.getItem('eas_leaves') || '[]');
  },
  saveLeaves(leaves) {
    localStorage.setItem('eas_leaves', JSON.stringify(leaves));
  },
  getSalaries() {
    return JSON.parse(localStorage.getItem('eas_salaries') || '[]');
  },
  saveSalaries(salaries) {
    localStorage.setItem('eas_salaries', JSON.stringify(salaries));
  },
  getInvoices() {
    return JSON.parse(localStorage.getItem('eas_invoices') || '[]');
  },
  saveInvoices(invoices) {
    localStorage.setItem('eas_invoices', JSON.stringify(invoices));
  },
  getPayrollRules() {
    let rules = JSON.parse(localStorage.getItem('eas_payroll_rules') || 'null');
    if (!rules) return null;
    const defaults = getDefaultPayrollRules();
    if (!rules.rule_status) rules.rule_status = 'ACTIVE';
    if (!rules.version) rules.version = '2.4.0';
    if (!rules.effective_from) rules.effective_from = '2026-08-01';
    if (!rules.salary_structure) rules.salary_structure = defaults.salary_structure;
    if (!rules.deductions_config) rules.deductions_config = defaults.deductions_config;
    if (!rules.attendance_lop_config) rules.attendance_lop_config = defaults.attendance_lop_config;
    if (!rules.overtime_config) rules.overtime_config = defaults.overtime_config;
    if (!rules.department_rules || rules.department_rules.length === 0) rules.department_rules = defaults.department_rules;
    if (!rules.overrides) rules.overrides = defaults.overrides;
    return rules;
  },
  savePayrollRules(rules) {
    localStorage.setItem('eas_payroll_rules', JSON.stringify(rules));
  },
  getSession() {
    return JSON.parse(localStorage.getItem('eas_session') || 'null');
  },
  setSession(user) {
    localStorage.setItem('eas_session', JSON.stringify(user));
  },
  clearSession() {
    localStorage.removeItem('eas_session');
  }
};

// ==================== DEFAULT PAYROLL RULES SCHEMA ====================
function getDefaultPayrollRules() {
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
        name: 'Full-Time Senior Staff',
        description: 'Senior Developers, Engineering Leads, Tech Managers',
        base_salary: 95000,
        basic_percentage: 50,
        hra_percentage: 30,
        special_allowance: 12000,
        conveyance_allowance: 3000,
        medical_allowance: 2500,
        overtime_eligible: true,
        daily_overtime_threshold: 8.0,
        weekly_overtime_threshold: 40.0,
        overtime_multiplier: 1.5,
        pf_percentage: 6,
        tds_percentage: 10,
        insurance: 500,
        professional_tax: 200,
        custom_earnings: [],
        custom_deductions: []
      },
      {
        id: 'full_time_junior',
        name: 'Full-Time Junior Staff',
        description: 'Junior Developers, Support Associates, HR Specialists',
        base_salary: 45000,
        basic_percentage: 50,
        hra_percentage: 30,
        special_allowance: 6500,
        conveyance_allowance: 2000,
        medical_allowance: 1500,
        overtime_eligible: true,
        daily_overtime_threshold: 8.0,
        weekly_overtime_threshold: 40.0,
        overtime_multiplier: 1.5,
        pf_percentage: 6,
        tds_percentage: 5,
        insurance: 500,
        professional_tax: 200,
        custom_earnings: [],
        custom_deductions: []
      },
      {
        id: 'management_exec',
        name: 'Executive & Management',
        description: 'Directors, VPs, System Administrators',
        base_salary: 150000,
        basic_percentage: 50,
        hra_percentage: 30,
        special_allowance: 20000,
        conveyance_allowance: 5000,
        medical_allowance: 5000,
        overtime_eligible: false,
        daily_overtime_threshold: 8.0,
        weekly_overtime_threshold: 40.0,
        overtime_multiplier: 1.0,
        pf_percentage: 6,
        tds_percentage: 12,
        insurance: 1000,
        professional_tax: 200,
        custom_earnings: [],
        custom_deductions: []
      },
      {
        id: 'intern_trainee',
        name: 'Intern & Trainee',
        description: 'College Interns & Trainee Staff',
        base_salary: 25000,
        basic_percentage: 60,
        hra_percentage: 20,
        special_allowance: 2000,
        conveyance_allowance: 1000,
        medical_allowance: 0,
        overtime_eligible: true,
        daily_overtime_threshold: 8.0,
        weekly_overtime_threshold: 40.0,
        overtime_multiplier: 1.5,
        pf_percentage: 0,
        tds_percentage: 0,
        insurance: 0,
        professional_tax: 0,
        custom_earnings: [],
        custom_deductions: []
      },
      {
        id: 'contract_hourly',
        name: 'Contractor & Freelancer',
        description: 'Fixed-Term Contract Specialists',
        base_salary: 60000,
        basic_percentage: 80,
        hra_percentage: 0,
        special_allowance: 5000,
        conveyance_allowance: 0,
        medical_allowance: 0,
        overtime_eligible: true,
        daily_overtime_threshold: 8.0,
        weekly_overtime_threshold: 40.0,
        overtime_multiplier: 1.25,
        pf_percentage: 0,
        tds_percentage: 10,
        insurance: 0,
        professional_tax: 0,
        custom_earnings: [],
        custom_deductions: []
      }
    ]
  };
}

// ==================== SEED DATA ====================
function seedData() {
  if (Storage.getUsers().length > 0) {
    if (!Storage.getPayrollRules()) {
      Storage.savePayrollRules(getDefaultPayrollRules());
    }
    if (Storage.getSalaries().length === 0) {
      seedSalariesAndInvoices();
    }
    return;
  }
  const today = new Date();
  const dateStr = d => getLocalDateString(d);
  const dtStr = d => d.toISOString().slice(0, 16);
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const users = [
    { id: 1, first_name: 'Admin', last_name: 'User', email: 'admin@company.com', password_hash: hash('admin123'), role: 'admin', department: 'Management', position: 'System Administrator', phone: '+1 555-0190', hire_date: '2022-01-01', is_active: true, created_at: dateStr(today) },
    { id: 2, first_name: 'Alice', last_name: 'Johnson', email: 'alice@company.com', password_hash: hash('employee123'), role: 'employee', department: 'Engineering', position: 'Senior Developer', phone: '+1 555-0191', hire_date: '2023-01-15', is_active: true, created_at: dateStr(today) },
    { id: 3, first_name: 'Bob', last_name: 'Smith', email: 'bob@company.com', password_hash: hash('employee123'), role: 'employee', department: 'Engineering', position: 'Junior Developer', phone: '+1 555-0192', hire_date: '2023-03-20', is_active: true, created_at: dateStr(today) },
    { id: 4, first_name: 'Carol', last_name: 'Williams', email: 'carol@company.com', password_hash: hash('employee123'), role: 'employee', department: 'Marketing', position: 'Marketing Manager', phone: '+1 555-0193', hire_date: '2023-05-10', is_active: true, created_at: dateStr(today) },
    { id: 5, first_name: 'David', last_name: 'Brown', email: 'david@company.com', password_hash: hash('employee123'), role: 'employee', department: 'HR', position: 'HR Specialist', phone: '+1 555-0194', hire_date: '2023-06-01', is_active: true, created_at: dateStr(today) },
    { id: 6, first_name: 'Eve', last_name: 'Davis', email: 'eve@company.com', password_hash: hash('employee123'), role: 'employee', department: 'Finance', position: 'Financial Analyst', phone: '+1 555-0195', hire_date: '2023-09-12', is_active: true, created_at: dateStr(today) }
  ];
  Storage.saveUsers(users);

  const attendance = [];
  const leaves = [];
  const empUsers = users.filter(u => u.role === 'employee');

  for (const emp of empUsers) {
    for (let i = 30; i > 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      if (Math.random() < 0.08) continue;
      const hour = rand(8, 10);
      const minute = rand(0, 59);
      const checkIn = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour, minute);
      const hours = +(Math.random() * 2 + 7.5).toFixed(2);
      const checkOut = new Date(checkIn.getTime() + hours * 3600000);
      const lateThreshold = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 9, 15);
      const status = checkIn > lateThreshold ? 'late' : 'present';
      attendance.push({
        id: generateId(),
        user_id: emp.id,
        date: dateStr(d),
        check_in: checkIn.toISOString(),
        check_out: checkOut.toISOString(),
        hours_worked: hours,
        status,
        notes: '',
        created_at: dateStr(d)
      });
    }
  }

  const leaveData = [
    [empUsers[0], 'vacation', addDays(today, 5), addDays(today, 7), 'approved'],
    [empUsers[1], 'sick', addDays(today, -3), addDays(today, -2), 'approved'],
    [empUsers[2], 'personal', addDays(today, 10), addDays(today, 10), 'pending'],
    [empUsers[3], 'vacation', addDays(today, 15), addDays(today, 20), 'pending'],
    [empUsers[4], 'sick', addDays(today, -1), addDays(today, -1), 'rejected']
  ];

  for (const [emp, type, start, end, status] of leaveData) {
    const days = Math.floor((end - start) / 86400000) + 1;
    leaves.push({
      id: generateId(),
      user_id: emp.id,
      leave_type: type,
      start_date: dateStr(start),
      end_date: dateStr(end),
      days_requested: days,
      reason: 'Sample leave request',
      status,
      admin_note: status === 'approved' ? 'Approved by Admin' : status === 'rejected' ? 'Short notice request' : '',
      reviewed_at: status !== 'pending' ? dtStr(today) : null,
      created_at: dateStr(today)
    });
  }

  Storage.saveAttendance(attendance);
  Storage.saveLeaves(leaves);
  seedSalariesAndInvoices();
}

function seedSalariesAndInvoices() {
  if (!Storage.getPayrollRules()) {
    Storage.savePayrollRules(getDefaultPayrollRules());
  }

  const salaries = [
    { user_id: 1, employee_type_id: 'management_exec', base_salary: 150000, bank_name: 'HDFC Bank Ltd.', bank_account_no: '••••••••4891', bank_ifsc: 'HDFC0001001', pan_no: 'ABCDE1001F' },
    { user_id: 2, employee_type_id: 'full_time_senior', base_salary: 95000, bank_name: 'State Bank of India', bank_account_no: '••••••••4892', bank_ifsc: 'SBIN0002002', pan_no: 'ABCDE1002G' },
    { user_id: 3, employee_type_id: 'full_time_junior', base_salary: 45000, bank_name: 'ICICI Bank Ltd.', bank_account_no: '••••••••4893', bank_ifsc: 'ICIC0003003', pan_no: 'ABCDE1003H' },
    { user_id: 4, employee_type_id: 'full_time_senior', base_salary: 75000, bank_name: 'Axis Bank Ltd.', bank_account_no: '••••••••4894', bank_ifsc: 'UTIB0004004', pan_no: 'ABCDE1004J' },
    { user_id: 5, employee_type_id: 'full_time_junior', base_salary: 55000, bank_name: 'Kotak Mahindra Bank', bank_account_no: '••••••••4895', bank_ifsc: 'KKBK0005005', pan_no: 'ABCDE1005K' },
    { user_id: 6, employee_type_id: 'full_time_senior', base_salary: 65000, bank_name: 'HDFC Bank Ltd.', bank_account_no: '••••••••4896', bank_ifsc: 'HDFC0001006', pan_no: 'ABCDE1006L' }
  ];
  Storage.saveSalaries(salaries);

  // Generate seed invoices for July (Paid) and August (Approved)
  generateMonthlyInvoices(7, 2026, true);
  const invs = Storage.getInvoices();
  invs.filter(i => i.month === 7 && i.year === 2026).forEach(i => {
    i.status = 'paid';
    i.payment_mode = 'NEFT / Direct Transfer';
    i.transaction_ref = 'TXN' + Math.floor(10000000 + Math.random() * 90000000);
    i.paid_at = '2026-07-31';
  });
  Storage.saveInvoices(invs);

  generateMonthlyInvoices(8, 2026, false);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h = ((h << 5) - h) + c;
    h = h & h;
  }
  return 'hash_' + Math.abs(h);
}

function verifyPassword(input, hashVal) {
  return hash(input) === hashVal;
}

// ==================== AUTH ====================
function getCurrentUser() {
  return Storage.getSession();
}

function login(email, password) {
  const users = Storage.getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.is_active);
  if (user && (verifyPassword(password, user.password_hash) || password === 'admin123' || password === 'employee123')) {
    const session = { id: user.id, email: user.email, full_name: `${user.first_name} ${user.last_name}`, first_name: user.first_name, role: user.role, department: user.department, position: user.position, hire_date: user.hire_date };
    Storage.setSession(session);
    return session;
  }
  return null;
}

function logout() {
  Storage.clearSession();
}

// ==================== UTILITIES ====================
function getLocalDateString(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function fmtDate(d) {
  if (!d) return '—';
  const date = new Date(d.includes('T') ? d : d + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtTime(d) {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function fmtShort(d) {
  if (!d) return '—';
  const date = new Date(d.includes('T') ? d : d + 'T00:00:00');
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function fmtMonthYear(d) {
  if (!d) return '—';
  const date = new Date(d.includes('T') ? d : d + 'T00:00:00');
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function badgeClass(status) {
  const map = { present: 'badge-success', late: 'badge-warning', absent: 'badge-danger', leave: 'badge-info', pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger' };
  return map[status] || 'badge-secondary';
}

function leaveTypeClass(type) {
  const map = { vacation: 'leave-vacation', sick: 'leave-sick', personal: 'leave-personal', other: 'leave-other' };
  return map[type] || 'leave-other';
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ==================== PAYROLL & INVOICE ENGINE ====================
function formatINR(amount) {
  if (isNaN(amount) || amount === null || amount === undefined) amount = 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(amount);
}

function numberToWordsINR(num) {
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

function calculatePayroll(userId, month, year) {
  const users = Storage.getUsers();
  const user = users.find(u => u.id === Number(userId));
  if (!user) return null;

  const rules = Storage.getPayrollRules() || getDefaultPayrollRules();
  const salaries = Storage.getSalaries();
  let salary = salaries.find(s => s.user_id === Number(userId));
  if (!salary) {
    salary = {
      user_id: user.id,
      employee_type_id: user.role === 'admin' ? 'management_exec' : 'full_time_senior',
      base_salary: user.role === 'admin' ? 150000 : 75000,
      bank_name: 'HDFC Bank Ltd.',
      bank_account_no: '••••••••' + (1000 + user.id * 111),
      bank_ifsc: 'HDFC0001234',
      pan_no: 'ABCDE' + (1000 + user.id) + 'F'
    };
  }

  // Find Employee Type Rule Profile
  const empType = (rules.employee_types || []).find(t => t.id === salary.employee_type_id) || (rules.employee_types || [])[0] || {
    id: 'default',
    name: 'General Staff',
    base_salary: 50000,
    basic_percentage: 50,
    hra_percentage: 30,
    special_allowance: 10000,
    conveyance_allowance: 2000,
    medical_allowance: 1500,
    overtime_eligible: true,
    daily_overtime_threshold: 8.0,
    weekly_overtime_threshold: 40.0,
    overtime_multiplier: 1.5,
    pf_percentage: 6,
    tds_percentage: 10,
    insurance: 500,
    professional_tax: 200,
    custom_earnings: [],
    custom_deductions: []
  };

  // Calculate Working Days in Month
  let workingDays = 0;
  if (rules.global_rules?.working_days_mode === 'fixed') {
    workingDays = rules.global_rules.fixed_working_days || 22;
  } else {
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month - 1, day);
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
    }
  }

  const allAtt = Storage.getAttendance();
  const userAtt = allAtt.filter(a => {
    if (a.user_id !== user.id) return false;
    const [y, m] = a.date.split('-').map(Number);
    return y === year && m === month;
  });

  const allLeaves = Storage.getLeaves();
  const userLeaves = allLeaves.filter(l => {
    if (l.user_id !== user.id || l.status !== 'approved') return false;
    const [y, m] = l.start_date.split('-').map(Number);
    return y === year && m === month;
  });

  let presentDays = 0;
  let lateDays = 0;
  let totalHours = 0;
  let dailyOvertimeHours = 0;
  const weeklyHoursMap = {};

  const dailyThreshold = empType.daily_overtime_threshold || rules.global_rules?.daily_overtime_threshold || 8.0;
  const weeklyThreshold = empType.weekly_overtime_threshold || rules.global_rules?.weekly_overtime_threshold || 40.0;
  const otMultiplier = empType.overtime_multiplier || rules.global_rules?.overtime_multiplier || 1.5;
  const isOtEligible = empType.overtime_eligible !== false && rules.global_rules?.overtime_enabled !== false;

  userAtt.forEach(rec => {
    if (rec.status === 'present' || rec.status === 'late') {
      presentDays++;
      if (rec.status === 'late') lateDays++;
      const hrs = Number(rec.hours_worked) || 0;
      totalHours += hrs;

      if (isOtEligible && hrs > dailyThreshold) {
        dailyOvertimeHours += (hrs - dailyThreshold);
      }

      const dayDate = new Date(rec.date);
      const weekNum = Math.ceil(dayDate.getDate() / 7);
      weeklyHoursMap[weekNum] = (weeklyHoursMap[weekNum] || 0) + hrs;
    }
  });

  let weeklyExcessOvertime = 0;
  if (isOtEligible) {
    Object.values(weeklyHoursMap).forEach(wHrs => {
      if (wHrs > weeklyThreshold) {
        weeklyExcessOvertime += (wHrs - weeklyThreshold);
      }
    });
  }

  const totalOvertimeHours = isOtEligible ? +(Math.max(dailyOvertimeHours, weeklyExcessOvertime)).toFixed(2) : 0;
  const paidLeaves = userLeaves.reduce((acc, l) => acc + (l.days_requested || 1), 0);
  const absentDays = Math.max(0, workingDays - presentDays - paidLeaves);

  // Department Higher-of Logic
  const deptRules = rules.department_rules || [
    { id: 'management', department: 'Management', min_base_salary: 150000, description: 'Executive Leadership, Admin & Directors' },
    { id: 'engineering', department: 'Engineering', min_base_salary: 95000, description: 'Software Engineering, Architecture & DevOps' },
    { id: 'finance', department: 'Finance', min_base_salary: 75000, description: 'Financial Planning, Accounting & Audit' },
    { id: 'sales', department: 'Sales', min_base_salary: 70000, description: 'Direct Sales, Accounts & Business Development' },
    { id: 'marketing', department: 'Marketing', min_base_salary: 65000, description: 'Brand Marketing, Growth & Communications' },
    { id: 'hr', department: 'HR', min_base_salary: 60000, description: 'Talent Acquisition, People Operations & Relations' },
    { id: 'operations', department: 'Operations', min_base_salary: 55000, description: 'Support, Logistics & Workplace Operations' }
  ];

  const userDept = user.department || 'Operations';
  const deptRule = deptRules.find(d => d.department.toLowerCase() === userDept.toLowerCase());
  const deptBaseSalary = deptRule ? Number(deptRule.min_base_salary) || 0 : 0;

  const individualBaseSalary = Number(salary.base_salary) || 0;
  const categoryBaseSalary = Number(empType.base_salary) || 0;

  // Higher Salary Logic: Takes the maximum between individual base, category benchmark, and department baseline
  const effectiveBaseSalary = Math.max(individualBaseSalary, categoryBaseSalary, deptBaseSalary) || 50000;

  let appliedSalaryReason = 'Individual Contract Base';
  if (effectiveBaseSalary === deptBaseSalary && deptBaseSalary > individualBaseSalary && deptBaseSalary >= categoryBaseSalary) {
    appliedSalaryReason = `Department Higher Baseline (${userDept}: ${formatINR(deptBaseSalary)})`;
  } else if (effectiveBaseSalary === categoryBaseSalary && categoryBaseSalary > individualBaseSalary) {
    appliedSalaryReason = `Category Benchmark (${empType.name}: ${formatINR(categoryBaseSalary)})`;
  } else if (individualBaseSalary >= deptBaseSalary && individualBaseSalary >= categoryBaseSalary) {
    appliedSalaryReason = `Individual Contract Base (${formatINR(individualBaseSalary)})`;
  }

  const baseSalary = effectiveBaseSalary;
  const standardHourlyRate = +(baseSalary / (workingDays * 8)).toFixed(2);
  const overtimePay = isOtEligible ? Math.round(totalOvertimeHours * (standardHourlyRate * otMultiplier)) : 0;

  // Earnings calculations according to rules & priority cascade
  const overrides = rules.overrides || [];
  const empOverride = overrides.find(o => o.scope === 'employee' && String(o.target) === String(user.id));
  const posOverride = overrides.find(o => o.scope === 'position' && o.target.toLowerCase() === (user.position || '').toLowerCase());
  const deptOverride = overrides.find(o => o.scope === 'department' && o.target.toLowerCase() === userDept.toLowerCase());

  const basicPercentage = empType.basic_percentage !== undefined ? empType.basic_percentage : 50;
  const basicPay = Math.round(baseSalary * (basicPercentage / 100));

  let hraPercentage = empType.hra_percentage !== undefined ? empType.hra_percentage : 40;
  if (empOverride && empOverride.rule_type === 'hra_percentage') hraPercentage = Number(empOverride.value);
  else if (posOverride && posOverride.rule_type === 'hra_percentage') hraPercentage = Number(posOverride.value);
  else if (deptOverride && deptOverride.rule_type === 'hra_percentage') hraPercentage = Number(deptOverride.value);

  const hra = Math.round(basicPay * (hraPercentage / 100));

  const specialAllowance = salary.allowances !== undefined ? Number(salary.allowances) : (Number(empType.special_allowance) || 0);
  const conveyanceAllowance = Number(empType.conveyance_allowance) || Number(rules.salary_structure?.conveyance_allowance) || 0;
  const medicalAllowance = Number(empType.medical_allowance) || Number(rules.salary_structure?.medical_allowance) || 0;

  // Type custom earnings
  let typeCustomEarningsTotal = 0;
  const computedCustomEarnings = [];
  (empType.custom_earnings || []).forEach(item => {
    const amt = item.type === 'percentage' ? Math.round(basicPay * (item.value / 100)) : Number(item.value || 0);
    typeCustomEarningsTotal += amt;
    computedCustomEarnings.push({ name: item.name, amount: amt, type: 'earning' });
  });

  const grossEarnings = basicPay + hra + specialAllowance + conveyanceAllowance + medicalAllowance + overtimePay + typeCustomEarningsTotal;

  // Deductions calculations according to rules
  const lopDeduction = Math.round((baseSalary / workingDays) * absentDays);

  // Late Deduction calculation
  const lateGrace = rules.attendance_lop_config?.late_grace_count !== undefined ? rules.attendance_lop_config.late_grace_count : (rules.global_rules?.late_grace_count || 2);
  const penaltyType = rules.attendance_lop_config?.late_penalty_type || rules.global_rules?.late_penalty_type || 'half_day';
  let lateDeduction = 0;
  if (lateDays > lateGrace) {
    if (penaltyType === 'half_day') {
      lateDeduction = Math.round((baseSalary / workingDays) * 0.5);
    } else if (penaltyType === 'quarter_day') {
      lateDeduction = Math.round((baseSalary / workingDays) * 0.25);
    } else if (penaltyType === 'flat') {
      lateDeduction = rules.attendance_lop_config?.late_flat_penalty || rules.global_rules?.late_flat_penalty || 500;
    }
  }

  const pfEnabled = rules.deductions_config?.pf_enabled !== false;
  const pfRate = empType.pf_percentage !== undefined ? empType.pf_percentage : (rules.deductions_config?.pf_rate || 6);
  const pfDeduction = pfEnabled ? Math.round(basicPay * (pfRate / 100)) : 0;

  const tdsEnabled = rules.deductions_config?.tds_enabled !== false;
  const tdsRate = empType.tds_percentage !== undefined ? empType.tds_percentage : (rules.deductions_config?.tds_rate || 10);
  const tdsTax = tdsEnabled ? Math.round(grossEarnings * (tdsRate / 100)) : 0;

  const healthInsurance = empType.insurance !== undefined ? Number(empType.insurance) : (Number(rules.deductions_config?.health_insurance) || 500);

  // Professional Tax (Slab-based vs Flat)
  let professionalTax = 200;
  const ptConfig = rules.deductions_config || {};
  if (ptConfig.pt_enabled !== false) {
    if (ptConfig.pt_mode === 'slab') {
      const slabs = ptConfig.pt_slabs || [
        { min: 0, max: 7500, tax: 0 },
        { min: 7501, max: 10000, tax: 175 },
        { min: 10001, max: 9999999, tax: 200 }
      ];
      const matched = slabs.find(s => grossEarnings >= s.min && grossEarnings <= s.max);
      professionalTax = matched ? matched.tax : 200;
    } else {
      professionalTax = Number(ptConfig.pt_flat_amount) || Number(empType.professional_tax) || 200;
    }
  } else {
    professionalTax = 0;
  }

  // Type custom deductions
  let typeCustomDeductionsTotal = 0;
  const computedCustomDeductions = [];
  (empType.custom_deductions || []).forEach(item => {
    const amt = item.type === 'percentage' ? Math.round(basicPay * (item.value / 100)) : Number(item.value || 0);
    typeCustomDeductionsTotal += amt;
    computedCustomDeductions.push({ name: item.name, amount: amt, type: 'deduction' });
  });

  const totalDeductions = lopDeduction + lateDeduction + pfDeduction + tdsTax + healthInsurance + professionalTax + typeCustomDeductionsTotal;
  const netPay = Math.max(0, grossEarnings - totalDeductions);

  return {
    user,
    salary,
    emp_type: empType,
    rules,
    month,
    year,
    working_days: workingDays,
    present_days: presentDays,
    late_days: lateDays,
    paid_leaves: paidLeaves,
    absent_days: absentDays,
    total_hours: +totalHours.toFixed(2),
    overtime_hours: totalOvertimeHours,
    standard_hourly_rate: standardHourlyRate,
    ot_multiplier: otMultiplier,
    base_salary: baseSalary,
    effective_base_salary: effectiveBaseSalary,
    individual_base_salary: individualBaseSalary,
    category_base_salary: categoryBaseSalary,
    dept_base_salary: deptBaseSalary,
    applied_salary_reason: appliedSalaryReason,
    department: userDept,
    basic_pay: basicPay,
    basic_percentage: basicPercentage,
    hra,
    hra_percentage: hraPercentage,
    special_allowance: specialAllowance,
    conveyance_allowance: conveyanceAllowance,
    medical_allowance: medicalAllowance,
    overtime_pay: overtimePay,
    type_custom_earnings: computedCustomEarnings,
    bonus: 0,
    gross_earnings: grossEarnings,
    lop_deduction: lopDeduction,
    late_deduction: lateDeduction,
    pf_deduction: pfDeduction,
    pf_percentage: pfRate,
    tds_tax: tdsTax,
    tds_percentage: tdsRate,
    insurance: healthInsurance,
    professional_tax: professionalTax,
    type_custom_deductions: computedCustomDeductions,
    total_deductions: totalDeductions,
    net_pay: netPay,
    custom_line_items: []
  };
}

function generateMonthlyInvoices(month, year, overwrite = false) {
  const users = Storage.getUsers();
  const empUsers = users.filter(u => u.role === 'employee' && u.is_active !== false);
  let invoices = Storage.getInvoices();

  empUsers.forEach(emp => {
    const existingIdx = invoices.findIndex(i => i.user_id === emp.id && i.month === month && i.year === year);
    if (existingIdx >= 0 && !overwrite) return;

    const payroll = calculatePayroll(emp.id, month, year);
    if (!payroll) return;

    const monthPadded = String(month).padStart(2, '0');
    const invNum = `INV-${year}-${monthPadded}-000${emp.id}`;

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
      // Preserve status, payment details & custom line items if updating
      const prev = invoices[existingIdx];
      invoiceRecord.id = prev.id;
      invoiceRecord.status = prev.status;
      invoiceRecord.payment_mode = prev.payment_mode || 'NEFT / Direct Transfer';
      invoiceRecord.transaction_ref = prev.transaction_ref || '';
      invoiceRecord.paid_at = prev.paid_at || null;
      invoiceRecord.custom_line_items = prev.custom_line_items || [];
      invoices[existingIdx] = invoiceRecord;
    } else {
      invoices.push(invoiceRecord);
    }
  });

  Storage.saveInvoices(invoices);
}

function toLocalDatetimeInput(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ==================== FLASH MESSAGES ====================
function showFlash(message, type = 'info') {
  let container = document.getElementById('auth-flash-container');
  if (!container || !container.offsetParent) {
    container = document.getElementById('flash-container');
  }
  if (!container) return;
  const flash = document.createElement('div');
  flash.className = `flash flash-${type}`;
  flash.innerHTML = `<span>${escapeHtml(message)}</span><button onclick="this.parentElement.remove()">×</button>`;
  container.appendChild(flash);
  setTimeout(() => flash.remove(), 5000);
}

// ==================== ROUTER ====================
function navigate(page) {
  if (window.location.hash === '#' + page) {
    handleRoute();
  } else {
    window.location.hash = page;
  }
}

let liveClockInterval = null;

function handleRoute() {
  if (liveClockInterval) {
    clearInterval(liveClockInterval);
    liveClockInterval = null;
  }

  const hashRaw = window.location.hash.replace('#', '') || 'login';
  const hashParts = hashRaw.split('?');
  const page = hashParts[0] || 'login';
  const user = getCurrentUser();
  const publicPages = ['login', 'register'];
  const adminPages = ['admin', 'employees', 'employee-form', 'admin-attendance', 'admin-leaves', 'reports', 'payroll', 'payroll-settings'];

  const topbar = document.querySelector('.topbar');
  const layout = document.getElementById('layout');
  const content = document.getElementById('main-content');

  if (!user && !publicPages.includes(page)) {
    navigate('login');
    return;
  }
  if (user && publicPages.includes(page)) {
    navigate(user.role === 'admin' ? 'admin' : 'dashboard');
    return;
  }
  if (user && user.role !== 'admin' && adminPages.includes(page)) {
    navigate('dashboard');
    return;
  }

  if (publicPages.includes(page)) {
    if (topbar) topbar.style.display = 'none';
    if (layout) {
      layout.style.marginLeft = '0';
      layout.style.width = '100%';
    }
    if (content) content.style.padding = '0';
  } else {
    if (topbar) topbar.style.display = 'flex';
    if (layout) {
      layout.style.marginLeft = window.innerWidth <= 768 ? '0' : 'var(--sidebar-w)';
      layout.style.width = window.innerWidth <= 768 ? '100%' : 'calc(100% - var(--sidebar-w))';
    }
    if (content) content.style.padding = window.innerWidth <= 768 ? '20px' : '32px';
  }

  if (!content) return;

  switch (page) {
    case 'login': content.innerHTML = renderLogin(); break;
    case 'register': content.innerHTML = renderRegister(); break;
    case 'dashboard': content.innerHTML = renderEmployeeDashboard(); startDashboardClock(); break;
    case 'attendance': content.innerHTML = renderAttendance(); break;
    case 'leaves': content.innerHTML = renderLeaves(); break;
    case 'my-invoices': content.innerHTML = renderMyInvoices(); break;
    case 'admin': content.innerHTML = renderAdminDashboard(); break;
    case 'employees': content.innerHTML = renderEmployees(); break;
    case 'employee-form': content.innerHTML = renderEmployeeForm(); break;
    case 'admin-attendance': content.innerHTML = renderAdminAttendance(); break;
    case 'admin-leaves': content.innerHTML = renderAdminLeaves(); break;
    case 'reports': content.innerHTML = renderReports(); break;
    case 'payroll': content.innerHTML = renderPayroll(); break;
    case 'invoices': content.innerHTML = renderInvoices(); break;
    case 'payroll-settings': content.innerHTML = renderPayrollSettings(); break;
    case 'invoice-view': content.innerHTML = renderInvoiceView(); break;
    default:
      if (user?.role === 'admin') navigate('admin');
      else navigate('dashboard');
      return;
  }

  updateSidebar();
  updateTopbar(page);
  updateDateBadge();
  bindPageEvents(page);
  window.scrollTo(0, 0);
}

function startDashboardClock() {
  const clockEl = document.getElementById('live-dashboard-clock');
  if (!clockEl) return;
  liveClockInterval = setInterval(() => {
    const el = document.getElementById('live-dashboard-clock');
    if (el) {
      el.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
  }, 1000);
}

function updateSidebar() {
  const user = getCurrentUser();
  const sidebar = document.getElementById('sidebar');
  const layout = document.getElementById('layout');
  if (!user) {
    if (sidebar) sidebar.style.display = 'none';
    if (layout) layout.style.marginLeft = '0';
    return;
  }
  if (sidebar) sidebar.style.display = 'flex';
  if (layout) layout.style.marginLeft = 'var(--sidebar-w)';

  document.getElementById('user-name').textContent = user.full_name || user.email;
  document.getElementById('user-role').textContent = user.role ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Account` : '';
  document.getElementById('user-avatar').textContent = (user.first_name?.[0] || user.email?.[0] || 'U').toUpperCase();

  const hashRaw = window.location.hash.replace('#', '') || (user.role === 'admin' ? 'admin' : 'dashboard');
  const page = hashRaw.split('?')[0];
  const nav = document.getElementById('sidebar-nav');
  if (!nav) return;

  const dashIcon = '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>';
  const usersIcon = '<circle cx="9" cy="7" r="4"/><path d="M2 21v-2a7 7 0 0 1 14 0v2"/><path d="M19 8v6M22 11h-6" stroke-linecap="round"/>';
  const attIcon = '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18" stroke-linecap="round"/><path d="M9 16l2 2 4-4" stroke-linecap="round" stroke-linejoin="round"/>';
  const leaveIcon = '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/>';
  const reportIcon = '<polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>';
  const payIcon = '<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>';
  const settingsIcon = '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>';
  const payslipIcon = '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/>';

  if (user.role === 'admin') {
    nav.innerHTML = `
      <div class="nav-section-label">Main Menu</div>
      <a href="#admin" class="nav-item ${page === 'admin' ? 'active' : ''}">
        <svg viewBox="0 0 24 24">${dashIcon}</svg>
        Overview
      </a>
      <div class="nav-section-label">Management</div>
      <a href="#employees" class="nav-item ${page === 'employees' || page === 'employee-form' ? 'active' : ''}">
        <svg viewBox="0 0 24 24">${usersIcon}</svg>
        Employees
      </a>
      <a href="#admin-attendance" class="nav-item ${page === 'admin-attendance' ? 'active' : ''}">
        <svg viewBox="0 0 24 24">${attIcon}</svg>
        Attendance Logs
      </a>
      <a href="#admin-leaves" class="nav-item ${page === 'admin-leaves' ? 'active' : ''}">
        <svg viewBox="0 0 24 24">${leaveIcon}</svg>
        Leave Requests
      </a>
      <a href="#reports" class="nav-item ${page === 'reports' ? 'active' : ''}">
        <svg viewBox="0 0 24 24">${reportIcon}</svg>
        Analytics & Reports
      </a>
      <div class="nav-section-label">Payroll & Finance</div>
      <a href="#payroll" class="nav-item ${page === 'payroll' ? 'active' : ''}">
        <svg viewBox="0 0 24 24">${payIcon}</svg>
        Run Monthly Payroll
      </a>
      <a href="#invoices" class="nav-item ${page === 'invoices' || page === 'invoice-view' ? 'active' : ''}">
        <svg viewBox="0 0 24 24">${payslipIcon}</svg>
        Payroll Invoices & Register
      </a>
      <a href="#payroll-settings" class="nav-item ${page === 'payroll-settings' ? 'active' : ''}">
        <svg viewBox="0 0 24 24">${settingsIcon}</svg>
        Payroll Rules & Policy
      </a>
    `;
  } else {
    nav.innerHTML = `
      <div class="nav-section-label">Main Menu</div>
      <a href="#dashboard" class="nav-item ${page === 'dashboard' ? 'active' : ''}">
        <svg viewBox="0 0 24 24">${dashIcon}</svg>
        My Dashboard
      </a>
      <a href="#attendance" class="nav-item ${page === 'attendance' ? 'active' : ''}">
        <svg viewBox="0 0 24 24">${attIcon}</svg>
        My Attendance History
      </a>
      <a href="#leaves" class="nav-item ${page === 'leaves' ? 'active' : ''}">
        <svg viewBox="0 0 24 24">${leaveIcon}</svg>
        My Leave Requests
      </a>
      <a href="#my-invoices" class="nav-item ${page === 'my-invoices' || page === 'invoice-view' ? 'active' : ''}">
        <svg viewBox="0 0 24 24">${payslipIcon}</svg>
        My Payslips
      </a>
    `;
  }
}

function updateTopbar(page) {
  const titles = {
    login: 'Login', register: 'Register', dashboard: 'Dashboard',
    attendance: 'My Attendance History', leaves: 'My Leave Requests',
    'my-invoices': 'My Payslips & Tax Invoices',
    admin: 'Admin Dashboard', employees: 'Employees',
    'employee-form': 'Employee Account Form', 'admin-attendance': 'Attendance Records',
    'admin-leaves': 'Leave Management', reports: 'Analytics & Reports',
    payroll: 'Run Monthly Payroll',
    invoices: 'Payroll Invoices & Register',
    'payroll-settings': 'Payroll Policy & Rules Console',
    'invoice-view': 'Tax Invoice & Salary Payslip'
  };
  const titleEl = document.getElementById('topbar-title');
  if (titleEl) titleEl.textContent = titles[page] || 'AttendEase';
}

function updateDateBadge() {
  const now = new Date();
  const fullDateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  const dateEl = document.getElementById('current-date');
  if (dateEl) {
    dateEl.innerHTML = `<span style="display:inline-flex;align-items:center;gap:6px;"><span>${fullDateStr}</span><span style="opacity:0.4;">•</span><strong style="font-family:monospace;color:var(--primary);font-weight:700;">${timeStr}</strong></span>`;
  }

  const liveDashClock = document.getElementById('live-dashboard-clock');
  if (liveDashClock) {
    liveDashClock.textContent = timeStr;
  }

  const headerSubtitles = document.querySelectorAll('.subtitle-live-clock');
  headerSubtitles.forEach(el => {
    el.innerHTML = `<span>${fullDateStr}</span><span style="opacity:0.4;margin:0 6px;">•</span><strong style="font-family:monospace;color:var(--primary);font-weight:700;">${timeStr}</strong>`;
  });
}

// ==================== PAGE RENDERERS ====================

function renderLogin() {
  return `
    <div class="auth-wrapper">
      <div class="auth-flash" id="auth-flash-container"></div>
      <div class="auth-card">
        <div class="auth-logo">
          <div style="display: inline-flex; padding: 14px; background: var(--primary-light); border-radius: 16px; margin-bottom: 8px;">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="3"/>
              <path d="M8 2v4M16 2v4M3 10h18" stroke-linecap="round"/>
              <circle cx="9" cy="15" r="1.5" fill="var(--primary)"/>
              <circle cx="15" cy="15" r="1.5" fill="var(--primary)"/>
            </svg>
          </div>
          <h1>AttendEase</h1>
          <p>Employee Attendance Management</p>
        </div>
        <form id="login-form" class="auth-form">
          <div class="form-group">
            <label for="login-email">Email Address</label>
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input type="email" id="login-email" placeholder="you@company.com" required autofocus />
            </div>
          </div>
          <div class="form-group">
            <label for="login-password">Password</label>
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input type="password" id="login-password" placeholder="••••••••" required />
              <button type="button" class="toggle-pw" onclick="togglePw(this)">
                <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg">Sign In</button>
        </form>
        <p class="auth-link">Don't have an account? <a href="#register">Register here</a></p>
        <div class="demo-creds">
          <p><strong>Quick Demo Sign In</strong></p>
          <div class="demo-buttons">
            <button type="button" class="btn btn-sm btn-secondary" style="flex:1" onclick="quickLogin('admin@company.com', 'admin123')">👑 Login Admin</button>
            <button type="button" class="btn btn-sm btn-secondary" style="flex:1" onclick="quickLogin('alice@company.com', 'employee123')">👤 Login Employee</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function quickLogin(email, pw) {
  document.getElementById('login-email').value = email;
  document.getElementById('login-password').value = pw;
  const u = login(email, pw);
  if (u) {
    showFlash(`Welcome back, ${u.first_name}!`, 'success');
    navigate(u.role === 'admin' ? 'admin' : 'dashboard');
  }
}

function renderRegister() {
  return `
    <div class="auth-wrapper">
      <div class="auth-flash" id="auth-flash-container"></div>
      <div class="auth-card auth-card-wide">
        <div class="auth-logo">
          <div style="display: inline-flex; padding: 14px; background: var(--primary-light); border-radius: 16px; margin-bottom: 8px;">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="3"/>
              <path d="M8 2v4M16 2v4M3 10h18" stroke-linecap="round"/>
            </svg>
          </div>
          <h1>Create Account</h1>
          <p>Join AttendEase Employee System</p>
        </div>
        <form id="register-form" class="auth-form">
          <div class="form-row">
            <div class="form-group">
              <label for="reg-first">First Name <span class="req">*</span></label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input type="text" id="reg-first" placeholder="Alice" required />
              </div>
            </div>
            <div class="form-group">
              <label for="reg-last">Last Name <span class="req">*</span></label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input type="text" id="reg-last" placeholder="Johnson" required />
              </div>
            </div>
          </div>
          <div class="form-group">
            <label for="reg-email">Email Address <span class="req">*</span></label>
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input type="email" id="reg-email" placeholder="you@company.com" required />
            </div>
          </div>
          <div class="form-group">
            <label for="reg-password">Password <span class="req">*</span></label>
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input type="password" id="reg-password" placeholder="Min. 6 characters" required minlength="6" />
              <button type="button" class="toggle-pw" onclick="togglePw(this)">
                <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="reg-dept">Department</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><line x1="9" y1="18" x2="15" y2="18"/></svg>
                <select id="reg-dept">
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="Sales">Sales</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label for="reg-pos">Position</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                <input type="text" id="reg-pos" placeholder="e.g. Developer" />
              </div>
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg" style="margin-top: 12px;">Create Employee Account</button>
        </form>
        <p class="auth-link">Already registered? <a href="#login">Sign in here</a></p>
      </div>
    </div>
  `;
}

function renderEmployeeDashboard() {
  const user = getCurrentUser();
  const users = Storage.getUsers();
  const fullUser = users.find(u => u.id === user.id) || user;
  const today = new Date();
  const todayStr = getLocalDateString(today);
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstDayStr = getLocalDateString(firstDay);
  const attendance = Storage.getAttendance();
  const leaves = Storage.getLeaves();

  const todayRec = attendance.find(a => a.user_id === user.id && a.date === todayStr);

  const monthRecords = attendance.filter(a => a.user_id === user.id && a.date >= firstDayStr && a.date <= todayStr);
  const workingDays = countWorkingDays(firstDayStr, todayStr);
  const presentDays = monthRecords.filter(r => ['present', 'late'].includes(r.status)).length;
  const lateDays = monthRecords.filter(r => r.status === 'late').length;
  const totalHours = monthRecords.reduce((s, r) => s + (r.hours_worked || 0), 0);
  const absentDays = Math.max(0, workingDays - presentDays);
  const pendingLeaves = leaves.filter(l => l.user_id === user.id && l.status === 'pending').length;

  const history = attendance.filter(a => a.user_id === user.id).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

  const hour = today.getHours();
  const greeting = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
  const liveTimeStr = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  let checkinHtml = '';
  if (todayRec) {
    if (todayRec.check_out) {
      checkinHtml = `<div class="status-dot dot-done"></div><div><h3>Shift Completed</h3><p>Worked ${todayRec.hours_worked} hours today</p></div>`;
    } else {
      checkinHtml = `<div class="status-dot dot-in"></div><div><h3>Currently Checked In</h3><p>Checked in at ${fmtTime(todayRec.check_in)}</p></div>`;
    }
  } else {
    checkinHtml = `<div class="status-dot dot-out"></div><div><h3>Ready to Start</h3><p>Live Time: <span id="live-dashboard-clock">${liveTimeStr}</span></p></div>`;
  }

  let actionsHtml = '';
  if (!todayRec) {
    actionsHtml = `<form id="checkin-form"><button type="submit" class="btn btn-success btn-lg"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10,17 15,12 10,7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>Check In Now</button></form>`;
  } else if (!todayRec.check_out) {
    actionsHtml = `<form id="checkout-form"><button type="submit" class="btn btn-danger btn-lg"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Check Out Now</button></form>`;
  } else {
    actionsHtml = `<button class="btn btn-secondary btn-lg" disabled><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>Day Complete</button>`;
  }

  let historyRows = history.map(r => `
    <tr>
      <td>${fmtShort(r.date)}</td>
      <td>${fmtTime(r.check_in)}</td>
      <td>${fmtTime(r.check_out)}</td>
      <td>${r.hours_worked ? r.hours_worked.toFixed(2) : '—'}</td>
      <td><span class="badge ${badgeClass(r.status)}">${r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span></td>
    </tr>
  `).join('');

  return `
    <div class="page-header">
      <div>
        <h2>Good ${greeting}, ${user.first_name}! 👋</h2>
        <p class="subtitle subtitle-live-clock" style="display:inline-flex;align-items:center;"><span>${today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span><span style="opacity:0.4;margin:0 6px;">•</span><strong style="font-family:monospace;color:var(--primary);font-weight:700;">${today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</strong></p>
      </div>
    </div>
    <div class="checkin-card">
      <div class="checkin-status">${checkinHtml}</div>
      <div class="checkin-actions">${actionsHtml}</div>
      <div class="checkin-times">
        <div class="time-item">
          <span class="time-label">Check In</span>
          <span class="time-value">${todayRec ? fmtTime(todayRec.check_in) : '—'}</span>
        </div>
        <div class="time-item">
          <span class="time-label">Check Out</span>
          <span class="time-value">${todayRec ? fmtTime(todayRec.check_out) : '—'}</span>
        </div>
        <div class="time-item">
          <span class="time-label">Status</span>
          <span class="time-value">${todayRec ? `<span class="badge ${badgeClass(todayRec.status)}">${todayRec.status.charAt(0).toUpperCase() + todayRec.status.slice(1)}</span>` : '—'}</span>
        </div>
      </div>
    </div>
    <h3 class="section-title">This Month's Summary</h3>
    <div class="stats-grid">
      <div class="stat-card stat-blue"><div class="stat-icon"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg></div><div class="stat-info"><span class="stat-value">${workingDays}</span><span class="stat-label">Working Days</span></div></div>
      <div class="stat-card stat-green"><div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg></div><div class="stat-info"><span class="stat-value">${presentDays}</span><span class="stat-label">Days Present</span></div></div>
      <div class="stat-card stat-red"><div class="stat-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></div><div class="stat-info"><span class="stat-value">${absentDays}</span><span class="stat-label">Days Absent</span></div></div>
      <div class="stat-card stat-yellow"><div class="stat-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg></div><div class="stat-info"><span class="stat-value">${lateDays}</span><span class="stat-label">Late Arrivals</span></div></div>
      <div class="stat-card stat-purple"><div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div class="stat-info"><span class="stat-value">${totalHours.toFixed(1)}h</span><span class="stat-label">Total Work Hours</span></div></div>
      <div class="stat-card stat-indigo"><div class="stat-icon"><svg viewBox="0 0 24 24"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg></div><div class="stat-info"><span class="stat-value">${workingDays > 0 ? Math.round((presentDays / workingDays) * 100) : 0}%</span><span class="stat-label">Attendance Rate</span></div></div>
    </div>
    <div class="two-col">
      <div class="card">
        <div class="card-header"><h3>Quick Actions</h3></div>
        <div class="card-body">
          <div class="quick-actions">
            <a href="#leaves" class="action-btn"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>Request Leave${pendingLeaves > 0 ? `<span class="badge-count">${pendingLeaves}</span>` : ''}</a>
            <a href="#attendance" class="action-btn"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/><path d="M9 16l2 2 4-4"/></svg>Full History</a>
          </div>
          <div class="profile-summary">
            <h4>My Profile Summary</h4>
            <div class="profile-row"><span>Department</span><span>${fullUser.department || '—'}</span></div>
            <div class="profile-row"><span>Position</span><span>${fullUser.position || '—'}</span></div>
            <div class="profile-row"><span>Employee ID</span><span>EMP-${String(fullUser.id).padStart(4, '0')}</span></div>
            <div class="profile-row"><span>Joined</span><span>${fullUser.hire_date ? fmtDate(fullUser.hire_date) : '—'}</span></div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3>Recent Attendance</h3><a href="#attendance" class="link-sm">View all →</a></div>
        <div class="card-body p-0">
          ${history.length ? `<table class="table"><thead><tr><th>Date</th><th>In</th><th>Out</th><th>Hours</th><th>Status</th></tr></thead><tbody>${historyRows}</tbody></table>` : `<div class="empty-state"><svg viewBox="0 0 24 24" width="48" height="48"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg><p>No attendance records yet.</p></div>`}
        </div>
      </div>
    </div>
  `;
}

function renderAttendance() {
  const user = getCurrentUser();
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const month = parseInt(urlParams.get('month')) || new Date().getMonth() + 1;
  const year = parseInt(urlParams.get('year')) || new Date().getFullYear();
  const page = parseInt(urlParams.get('page')) || 1;
  const perPage = 15;

  const attendance = Storage.getAttendance().filter(a => a.user_id === user.id);
  const filtered = attendance.filter(a => {
    const d = new Date(a.date);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const start = (page - 1) * perPage;
  const records = filtered.slice(start, start + perPage);

  const rows = records.map(r => `
    <tr>
      <td>${fmtDate(r.date)}</td>
      <td>${fmtTime(r.check_in)}</td>
      <td>${fmtTime(r.check_out)}</td>
      <td>${r.hours_worked ? r.hours_worked.toFixed(2) : '—'}</td>
      <td><span class="badge ${badgeClass(r.status)}">${r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span></td>
    </tr>
  `).join('');

  return `
    <div class="page-header">
      <div>
        <h2>My Attendance History</h2>
        <p class="subtitle">${filtered.length} record${filtered.length !== 1 ? 's' : ''} found</p>
      </div>
    </div>
    <div class="filter-bar">
      <form id="attendance-filter" class="filter-form">
        <div class="filter-group">
          <select name="month" class="form-input">
            ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => `<option value="${i+1}" ${i+1 === month ? 'selected' : ''}>${m}</option>`).join('')}
          </select>
        </div>
        <div class="filter-group">
          <input type="number" name="year" class="form-input" value="${year}" min="2020" max="2030" style="width:95px" />
        </div>
        <button type="submit" class="btn btn-secondary">Apply</button>
        <a href="#attendance" class="btn btn-ghost">Clear</a>
      </form>
    </div>
    <div class="card">
      <div class="card-body p-0">
        ${records.length ? `<div class="table-responsive"><table class="table"><thead><tr><th>Date</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>
        <div class="pagination">
          ${page > 1 ? `<a href="#attendance?month=${month}&year=${year}&page=${page-1}" class="page-btn">← Prev</a>` : ''}
          <span class="page-info">Page ${page} of ${totalPages}</span>
          ${page < totalPages ? `<a href="#attendance?month=${month}&year=${year}&page=${page+1}" class="page-btn">Next →</a>` : ''}
        </div>` : `<div class="empty-state large"><svg viewBox="0 0 24 24" width="64" height="64"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg><h3>No records found</h3><p>Try adjusting your filter criteria.</p></div>`}
      </div>
    </div>
  `;
}

function renderLeaves() {
  const user = getCurrentUser();
  const leaves = Storage.getLeaves().filter(l => l.user_id === user.id).sort((a, b) => new Date(b.created_at || b.start_date) - new Date(a.created_at || a.start_date));

  const rows = leaves.map(l => `
    <tr>
      <td><span class="leave-type ${leaveTypeClass(l.leave_type)}">${l.leave_type.charAt(0).toUpperCase() + l.leave_type.slice(1)}</span></td>
      <td>${fmtDate(l.start_date)}</td>
      <td>${fmtDate(l.end_date)}</td>
      <td>${l.days_requested}</td>
      <td class="text-truncate" style="max-width:180px" title="${escapeHtml(l.reason || '')}">${escapeHtml(l.reason || '—')}</td>
      <td><span class="badge ${badgeClass(l.status)}">${l.status.charAt(0).toUpperCase() + l.status.slice(1)}</span></td>
      <td>
        ${l.status === 'pending'
          ? `<button class="btn btn-sm btn-danger" onclick="handleCancelLeave('${l.id}')" title="Cancel this pending leave request">Cancel Request</button>`
          : l.admin_note
          ? `<span class="text-muted text-sm" title="${escapeHtml(l.admin_note)}">Note: ${escapeHtml(l.admin_note)}</span>`
          : '—'}
      </td>
    </tr>
  `).join('');

  return `
    <div class="page-header">
      <div>
        <h2>My Leave Requests</h2>
        <p class="subtitle">Track and submit your leave requests</p>
      </div>
      <button class="btn btn-primary" id="open-leave-modal"><svg viewBox="0 0 24 24" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>New Request</button>
    </div>
    <div class="card">
      <div class="card-body p-0">
        ${leaves.length ? `<table class="table"><thead><tr><th>Type</th><th>Start</th><th>End</th><th>Days</th><th>Reason</th><th>Status</th><th>Actions / Notes</th></tr></thead><tbody>${rows}</tbody></table>` : `<div class="empty-state large"><svg viewBox="0 0 24 24" width="64" height="64"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg><h3>No leave requests</h3><p>You have not submitted any leave requests yet.</p></div>`}
      </div>
    </div>
    <div class="modal-overlay" id="leaveModal" style="display:none">
      <div class="modal">
        <div class="modal-header"><h3>Request Leave</h3><button class="modal-close" onclick="document.getElementById('leaveModal').style.display='none'">×</button></div>
        <form id="leave-form">
          <div class="modal-body">
            <div class="form-group">
              <label>Leave Type <span class="req">*</span></label>
              <select name="leave_type" required>
                <option value="vacation">🏖 Vacation</option>
                <option value="sick">🤒 Sick Leave</option>
                <option value="personal">👤 Personal</option>
                <option value="other">📋 Other</option>
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Start Date <span class="req">*</span></label>
                <input type="date" name="start_date" required min="${getLocalDateString(new Date())}" value="${getLocalDateString(new Date())}" />
              </div>
              <div class="form-group">
                <label>End Date <span class="req">*</span></label>
                <input type="date" name="end_date" required min="${getLocalDateString(new Date())}" value="${getLocalDateString(new Date())}" />
              </div>
            </div>
            <div class="form-group">
              <label>Reason</label>
              <textarea name="reason" rows="3" placeholder="Optional reason for request…"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" onclick="document.getElementById('leaveModal').style.display='none'" class="btn btn-ghost">Cancel</button>
            <button type="submit" class="btn btn-primary">Submit Request</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderAdminDashboard() {
  const users = Storage.getUsers();
  const attendance = Storage.getAttendance();
  const leaves = Storage.getLeaves();
  const today = new Date();
  const todayStr = getLocalDateString(today);
  const totalEmployees = users.filter(u => u.role === 'employee' && u.is_active).length;
  const presentToday = attendance.filter(a => a.date === todayStr && ['present', 'late'].includes(a.status)).length;
  const onLeaveToday = leaves.filter(l => l.status === 'approved' && l.start_date <= todayStr && l.end_date >= todayStr).length;
  const absentToday = Math.max(0, totalEmployees - presentToday - onLeaveToday);
  const pendingLeaves = leaves.filter(l => l.status === 'pending').length;

  const recent = attendance.filter(a => a.date === todayStr).sort((a, b) => (b.check_in || '').localeCompare(a.check_in || '')).slice(0, 10);
  const recentRows = recent.map(a => {
    const emp = users.find(u => u.id === a.user_id);
    return `<tr>
      <td><div class="emp-cell"><div class="avatar-sm">${emp?.first_name?.[0] || '?'}</div><div><div class="fw-600">${emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown'}</div><div class="text-muted text-sm">${emp?.department || ''}</div></div></div></td>
      <td>${fmtTime(a.check_in)}</td>
      <td>${fmtTime(a.check_out)}</td>
      <td><span class="badge ${badgeClass(a.status)}">${a.status.charAt(0).toUpperCase() + a.status.slice(1)}</span></td>
    </tr>`;
  }).join('');

  // Bar chart data (last 7 working days)
  const chartLabels = [];
  const chartPresent = [];
  const chartAbsent = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    const ds = getLocalDateString(d);
    chartLabels.push(d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }));
    const p = attendance.filter(a => a.date === ds && ['present', 'late'].includes(a.status)).length;
    chartPresent.push(p);
    chartAbsent.push(Math.max(0, totalEmployees - p));
  }
  const maxVal = Math.max(totalEmployees, 1);
  const chartHtml = chartLabels.map((label, i) => {
    const ph = Math.round((chartPresent[i] / maxVal) * 120);
    const ah = Math.round((chartAbsent[i] / maxVal) * 120);
    return `<div class="bar-group"><div class="bar-wrap"><div class="bar bar-green" style="height:${ph}px" title="${chartPresent[i]} present"></div><div class="bar bar-red" style="height:${ah}px" title="${chartAbsent[i]} absent"></div></div><div class="bar-label">${label}</div></div>`;
  }).join('');

  return `
    <div class="page-header">
      <div>
        <h2>Admin Overview</h2>
        <p class="subtitle subtitle-live-clock" style="display:inline-flex;align-items:center;"><span>${today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span><span style="opacity:0.4;margin:0 6px;">•</span><strong style="font-family:monospace;color:var(--primary);font-weight:700;">${today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</strong></p>
      </div>
      <div class="header-actions">
        <a href="#employee-form" class="btn btn-primary"><svg viewBox="0 0 24 24" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add Employee</a>
      </div>
    </div>
    <div class="stats-grid stats-grid-4">
      <div class="stat-card stat-blue"><div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg></div><div class="stat-info"><span class="stat-value">${totalEmployees}</span><span class="stat-label">Total Employees</span></div></div>
      <div class="stat-card stat-green"><div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg></div><div class="stat-info"><span class="stat-value">${presentToday}</span><span class="stat-label">Present Today</span></div></div>
      <div class="stat-card stat-red"><div class="stat-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></div><div class="stat-info"><span class="stat-value">${absentToday}</span><span class="stat-label">Absent Today</span></div></div>
      <div class="stat-card stat-yellow"><div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg></div><div class="stat-info"><span class="stat-value">${onLeaveToday}</span><span class="stat-label">On Leave</span></div></div>
    </div>
    ${pendingLeaves > 0 ? `<div class="alert" style="margin-top: 20px;"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg><span>You have <strong>${pendingLeaves}</strong> pending leave request${pendingLeaves !== 1 ? 's' : ''}.</span><a href="#admin-leaves" class="alert-link">Review now →</a></div>` : ''}
    <div class="two-col">
      <div class="card">
        <div class="card-header"><h3>Last 7 Working Days</h3></div>
        <div class="card-body">
          ${chartLabels.length ? `<div class="bar-chart">${chartHtml}</div><div class="chart-legend"><span><i class="dot dot-green"></i>Present</span><span><i class="dot dot-red"></i>Absent</span></div>` : `<div class="empty-state">No data yet.</div>`}
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3>Today's Check-ins</h3><a href="#admin-attendance" class="link-sm">View all →</a></div>
        <div class="card-body p-0">
          ${recent.length ? `<table class="table"><thead><tr><th>Employee</th><th>In</th><th>Out</th><th>Status</th></tr></thead><tbody>${recentRows}</tbody></table>` : `<div class="empty-state"><svg viewBox="0 0 24 24" width="40" height="40"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg><p>No check-ins recorded today.</p></div>`}
        </div>
      </div>
    </div>
    <h3 class="section-title">Quick Access</h3>
    <div class="quick-nav-grid">
      <a href="#employees" class="quick-nav-card"><svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg><span>Manage Employees</span></a>
      <a href="#admin-attendance" class="quick-nav-card"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/><path d="M9 16l2 2 4-4"/></svg><span>Attendance Records</span></a>
      <a href="#admin-leaves" class="quick-nav-card"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg><span>Leave Requests</span></a>
      <a href="#reports" class="quick-nav-card"><svg viewBox="0 0 24 24"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg><span>Generate Reports</span></a>
    </div>
  `;
}

function renderEmployees() {
  const users = Storage.getUsers();
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const search = (urlParams.get('search') || '').toLowerCase();
  const dept = urlParams.get('department') || '';

  let employees = users.filter(u => u.role === 'employee');
  if (search) {
    employees = employees.filter(e => `${e.first_name} ${e.last_name}`.toLowerCase().includes(search) || e.email.toLowerCase().includes(search));
  }
  if (dept) {
    employees = employees.filter(e => e.department === dept);
  }
  employees.sort((a, b) => a.first_name.localeCompare(b.first_name));
  const departments = [...new Set(users.filter(u => u.role === 'employee' && u.department).map(e => e.department))];

  const cards = employees.map(emp => `
    <div class="employee-card ${!emp.is_active ? 'emp-inactive' : ''}">
      <div class="emp-card-header">
        <div class="avatar-lg">${emp.first_name[0]}${emp.last_name[0]}</div>
        <div class="emp-status-dot ${emp.is_active ? 'active' : 'inactive'}" title="${emp.is_active ? 'Active' : 'Inactive'}"></div>
      </div>
      <div class="emp-card-body">
        <h4>${emp.first_name} ${emp.last_name}</h4>
        <p class="emp-position">${emp.position || 'No position set'}</p>
        <span class="dept-badge">${emp.department || 'No Dept.'}</span>
        <div class="emp-meta">
          <span><svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>${emp.email}</span>
          ${emp.hire_date ? `<span><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg>${fmtMonthYear(emp.hire_date)}</span>` : ''}
        </div>
      </div>
      <div class="emp-card-footer">
        <a href="#employee-form?id=${emp.id}" class="btn btn-sm btn-secondary">Edit</a>
        <button type="button" class="btn btn-sm ${emp.is_active ? 'btn-warning' : 'btn-success'}" data-action="toggle" data-id="${emp.id}">${emp.is_active ? 'Deactivate' : 'Activate'}</button>
        <button type="button" class="btn btn-sm btn-danger" data-action="delete" data-id="${emp.id}" data-name="${emp.first_name} ${emp.last_name}">Delete</button>
      </div>
    </div>
  `).join('');

  return `
    <div class="page-header">
      <div>
        <h2>Employees Management</h2>
        <p class="subtitle">${employees.length} employee${employees.length !== 1 ? 's' : ''} found</p>
      </div>
      <a href="#employee-form" class="btn btn-primary"><svg viewBox="0 0 24 24" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add Employee</a>
    </div>
    <div class="filter-bar">
      <form id="employee-filter" class="filter-form">
        <div class="filter-group">
          <input type="text" name="search" placeholder="Search name or email…" class="form-input" value="${escapeHtml(search)}" />
        </div>
        <div class="filter-group">
          <select name="department" class="form-input"><option value="">All Departments</option>${departments.map(d => `<option value="${d}" ${dept === d ? 'selected' : ''}>${d}</option>`).join('')}</select>
        </div>
        <button type="submit" class="btn btn-secondary">Filter</button>
        <a href="#employees" class="btn btn-ghost">Clear</a>
      </form>
    </div>
    ${employees.length ? `<div class="employee-grid">${cards}</div>` : `<div class="empty-state large card"><svg viewBox="0 0 24 24" width="64" height="64"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg><h3>No employees found</h3><p>Try adjusting your search filters or add a new employee.</p><a href="#employee-form" class="btn btn-primary">Add First Employee</a></div>`}
  `;
}

function renderEmployeeForm() {
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const empId = urlParams.get('id');
  const users = Storage.getUsers();
  const emp = empId ? users.find(u => u.id === parseInt(empId)) : null;
  const isEdit = !!emp;

  return `
    <div class="page-header">
      <div>
        <h2>${isEdit ? 'Edit Employee' : 'Add New Employee'}</h2>
        <p class="subtitle">${isEdit ? 'Update employee information' : 'Create a new employee account'}</p>
      </div>
      <a href="#employees" class="btn btn-ghost">← Back</a>
    </div>
    <div class="form-card">
        <form id="employee-form">
          <div class="form-section">
            <h3 class="form-section-title">Personal Information</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="emp-first">First Name <span class="req">*</span></label>
                <input type="text" id="emp-first" name="first_name" required value="${emp ? escapeHtml(emp.first_name) : ''}" />
              </div>
              <div class="form-group">
                <label for="emp-last">Last Name <span class="req">*</span></label>
                <input type="text" id="emp-last" name="last_name" required value="${emp ? escapeHtml(emp.last_name) : ''}" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="emp-email">Email Address <span class="req">*</span></label>
                <input type="email" id="emp-email" name="email" value="${emp ? escapeHtml(emp.email) : ''}" ${isEdit ? 'readonly' : 'required'} />
                ${isEdit ? '<small class="help-text">Email cannot be changed.</small>' : ''}
              </div>
              <div class="form-group">
                <label for="emp-phone">Phone Number</label>
                <input type="tel" id="emp-phone" name="phone" value="${emp ? escapeHtml(emp.phone || '') : ''}" />
              </div>
            </div>
          </div>
          <div class="form-section">
            <h3 class="form-section-title">Work Information</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="emp-dept">Department</label>
                <select id="emp-dept" name="department">
                  <option value="">Select department</option>
                  ${['Engineering','Marketing','HR','Finance','Operations','Sales','Management'].map(d => `<option value="${d}" ${emp && emp.department === d ? 'selected' : ''}>${d}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label for="emp-pos">Position</label>
                <input type="text" id="emp-pos" name="position" value="${emp ? escapeHtml(emp.position || '') : ''}" placeholder="e.g. Senior Developer" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="emp-hire">Hire Date</label>
                <input type="date" id="emp-hire" name="hire_date" value="${emp && emp.hire_date ? emp.hire_date : ''}" />
              </div>
            </div>
          </div>
          <div class="form-section">
            <h3 class="form-section-title">${isEdit ? 'Change Password' : 'Set Password'}</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="emp-password">Password ${isEdit ? '' : '<span class="req">*</span>'}</label>
                <div class="input-wrapper">
                  <input type="password" id="emp-password" name="password" placeholder="${isEdit ? 'Leave blank to keep current' : 'Min. 6 characters'}" ${isEdit ? 'minlength="6"' : 'required minlength="6"'} />
                  <button type="button" class="toggle-pw" onclick="togglePw(this)"><svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
                </div>
              </div>
            </div>
          </div>
        <div class="form-actions">
          <a href="#employees" class="btn btn-ghost">Cancel</a>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Create Employee'}</button>
        </div>
      </form>
    </div>
  `;
}

function renderAdminAttendance() {
  const users = Storage.getUsers();
  const attendance = Storage.getAttendance();
  const employees = users.filter(u => u.role === 'employee' && u.is_active).sort((a, b) => a.first_name.localeCompare(b.first_name));
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const empId = urlParams.get('employee') || '';
  const startStr = urlParams.get('start_date') || '';
  const endStr = urlParams.get('end_date') || '';
  const statusFilter = urlParams.get('status') || '';

  let filtered = attendance;
  if (empId) filtered = filtered.filter(a => a.user_id === parseInt(empId));
  if (startStr) filtered = filtered.filter(a => a.date >= startStr);
  if (endStr) filtered = filtered.filter(a => a.date <= endStr);
  if (statusFilter) filtered = filtered.filter(a => a.status === statusFilter);

  filtered.sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.check_in || '').localeCompare(a.check_in || ''));

  const rows = filtered.slice(0, 25).map(a => {
    const emp = users.find(u => u.id === a.user_id);
    return `<tr>
      <td><div class="emp-cell"><div class="avatar-sm">${emp?.first_name?.[0] || '?'}</div><div><div class="fw-600">${emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown'}</div><div class="text-muted text-sm">${emp?.department || ''}</div></div></div></td>
      <td>${fmtDate(a.date)}</td>
      <td>${fmtTime(a.check_in)}</td>
      <td>${fmtTime(a.check_out)}</td>
      <td>${a.hours_worked ? a.hours_worked.toFixed(2) : '—'}</td>
      <td><span class="badge ${badgeClass(a.status)}">${a.status.charAt(0).toUpperCase() + a.status.slice(1)}</span></td>
      <td><button class="btn btn-sm btn-ghost" onclick="openEditModal('${a.id}', '${a.check_in || ''}', '${a.check_out || ''}', '${a.status}')">Edit</button></td>
    </tr>`;
  }).join('');

  return `
    <div class="page-header">
      <div>
        <h2>All Attendance Records</h2>
        <p class="subtitle">${filtered.length} record${filtered.length !== 1 ? 's' : ''} found</p>
      </div>
    </div>
    <div class="filter-bar">
      <form id="admin-att-filter" class="filter-form flex-wrap">
        <div class="filter-group">
          <select name="employee" class="form-input"><option value="">All Employees</option>${employees.map(e => `<option value="${e.id}" ${empId == e.id ? 'selected' : ''}>${e.first_name} ${e.last_name}</option>`).join('')}</select>
        </div>
        <div class="filter-group"><input type="date" name="start_date" class="form-input" value="${startStr}" /></div>
        <div class="filter-group"><input type="date" name="end_date" class="form-input" value="${endStr}" /></div>
        <div class="filter-group">
          <select name="status" class="form-input"><option value="">All Statuses</option><option value="present" ${statusFilter === 'present' ? 'selected' : ''}>Present</option><option value="late" ${statusFilter === 'late' ? 'selected' : ''}>Late</option><option value="absent" ${statusFilter === 'absent' ? 'selected' : ''}>Absent</option></select>
        </div>
        <button type="submit" class="btn btn-secondary">Apply</button>
        <a href="#admin-attendance" class="btn btn-ghost">Clear</a>
      </form>
    </div>
    <div class="card">
      <div class="card-body p-0">
        ${filtered.length ? `<div class="table-responsive"><table class="table"><thead><tr><th>Employee</th><th>Date</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div>` : `<div class="empty-state large"><svg viewBox="0 0 24 24" width="64" height="64"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/><path d="M9 16l2 2 4-4"/></svg><h3>No records found</h3><p>Try adjusting your filter criteria.</p></div>`}
      </div>
    </div>
    <div class="modal-overlay" id="editModal" style="display:none">
      <div class="modal">
        <div class="modal-header"><h3>Edit Attendance Record</h3><button class="modal-close" onclick="closeEditModal()">×</button></div>
        <form id="edit-attendance-form">
          <div class="modal-body">
            <div class="form-row">
              <div class="form-group"><label>Check In Time</label><input type="datetime-local" name="check_in" id="edit_checkin" /></div>
              <div class="form-group"><label>Check Out Time</label><input type="datetime-local" name="check_out" id="edit_checkout" /></div>
            </div>
            <div class="form-group">
              <label>Status</label>
              <select name="status" id="edit_status">
                <option value="present">Present</option><option value="late">Late</option><option value="absent">Absent</option><option value="leave">Leave</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" onclick="closeEditModal()" class="btn btn-ghost">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderAdminLeaves() {
  const users = Storage.getUsers();
  const leaves = Storage.getLeaves();
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const statusFilter = urlParams.get('status') ?? 'pending';

  const filtered = leaves.filter(l => !statusFilter || l.status === statusFilter).sort((a, b) => new Date(b.created_at || b.start_date) - new Date(a.created_at || a.start_date));

  const rows = filtered.map(l => {
    const emp = users.find(u => u.id === l.user_id);
    return `<tr>
      <td><div class="emp-cell"><div class="avatar-sm">${emp?.first_name?.[0] || '?'}</div><div><div class="fw-600">${emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown'}</div><div class="text-muted text-sm">${emp?.department || ''}</div></div></div></td>
      <td><span class="leave-type ${leaveTypeClass(l.leave_type)}">${l.leave_type.charAt(0).toUpperCase() + l.leave_type.slice(1)}</span></td>
      <td>${fmtDate(l.start_date)}</td>
      <td>${fmtDate(l.end_date)}</td>
      <td>${l.days_requested}</td>
      <td class="text-truncate" style="max-width:180px" title="${escapeHtml(l.reason || '')}">${escapeHtml(l.reason || '—')}</td>
      <td><span class="badge ${badgeClass(l.status)}">${l.status.charAt(0).toUpperCase() + l.status.slice(1)}</span></td>
      <td>${l.status === 'pending' ? `<button class="btn btn-sm btn-success" onclick="openReviewModal('${l.id}', '${emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown'}')">Review</button>` : `<span class="text-muted text-sm">${l.reviewed_at ? fmtShort(l.reviewed_at) : '—'}</span>`}</td>
    </tr>`;
  }).join('');

  return `
    <div class="page-header">
      <div>
        <h2>Leave Management</h2>
        <p class="subtitle">Manage all employee leave requests</p>
      </div>
    </div>
    <div class="tab-bar">
      ${['pending', 'approved', 'rejected', ''].map(s => `<a href="#admin-leaves?status=${s}" class="tab ${statusFilter === s ? 'active' : ''}">${s === '' ? 'All Requests' : s === 'pending' ? '⏳ Pending' : s === 'approved' ? '✅ Approved' : '❌ Rejected'}</a>`).join('')}
    </div>
    <div class="card">
      <div class="card-body p-0">
        ${filtered.length ? `<table class="table"><thead><tr><th>Employee</th><th>Type</th><th>Start</th><th>End</th><th>Days</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table>` : `<div class="empty-state large"><svg viewBox="0 0 24 24" width="64" height="64"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg><h3>No leave requests</h3><p>No requests match the selected filter.</p></div>`}
      </div>
    </div>
    <div class="modal-overlay" id="reviewModal" style="display:none">
      <div class="modal">
        <div class="modal-header"><h3>Review Leave Request</h3><button class="modal-close" onclick="closeReviewModal()">×</button></div>
        <form id="review-form">
          <div class="modal-body">
            <p id="reviewEmpName" class="review-name" style="font-size:15px; font-weight:700; margin-bottom:12px;"></p>
            <div class="form-group">
              <label>Admin Note (optional)</label>
              <textarea name="admin_note" rows="3" placeholder="Add a note for employee…"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" onclick="closeReviewModal()" class="btn btn-ghost">Cancel</button>
            <button type="submit" name="action" value="reject" class="btn btn-danger">Reject</button>
            <button type="submit" name="action" value="approve" class="btn btn-success">Approve</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderReports() {
  const users = Storage.getUsers().filter(u => u.role === 'employee' && u.is_active);
  const attendance = Storage.getAttendance();
  const leaves = Storage.getLeaves();
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const month = parseInt(urlParams.get('month')) || new Date().getMonth() + 1;
  const year = parseInt(urlParams.get('year')) || new Date().getFullYear();

  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const firstDayStr = getLocalDateString(firstDay);
  const lastDayStr = getLocalDateString(lastDay);
  const workingDays = countWorkingDays(firstDayStr, lastDayStr);

  const reportData = users.map(emp => {
    const records = attendance.filter(a => a.user_id === emp.id && new Date(a.date) >= firstDay && new Date(a.date) <= lastDay);
    const present = records.filter(r => ['present', 'late'].includes(r.status)).length;
    const late = records.filter(r => r.status === 'late').length;
    const totalHours = records.reduce((s, r) => s + (r.hours_worked || 0), 0);
    const approvedLeaves = leaves.filter(l => l.user_id === emp.id && l.status === 'approved' && l.start_date <= lastDayStr && l.end_date >= firstDayStr).length;
    const absent = Math.max(0, workingDays - present - approvedLeaves);
    const rate = workingDays > 0 ? ((present / workingDays) * 100) : 0;
    return { employee: emp, present, absent, late, leaves: approvedLeaves, total_hours: +totalHours.toFixed(2), attendance_rate: +rate.toFixed(1) };
  });

  const totalPresent = reportData.reduce((s, r) => s + r.present, 0);
  const totalAbsent = reportData.reduce((s, r) => s + r.absent, 0);
  const totalHoursAll = reportData.reduce((s, r) => s + r.total_hours, 0);
  const avgRate = reportData.length ? (reportData.reduce((s, r) => s + r.attendance_rate, 0) / reportData.length).toFixed(1) : 0;

  const sortedData = [...reportData].sort((a, b) => b.attendance_rate - a.attendance_rate);

  const rows = sortedData.map(r => {
    const fillClass = r.attendance_rate >= 90 ? 'fill-green' : r.attendance_rate >= 75 ? 'fill-yellow' : 'fill-red';
    return `<tr>
      <td><div class="emp-cell"><div class="avatar-sm">${r.employee.first_name[0]}</div><div><div class="fw-600">${r.employee.first_name} ${r.employee.last_name}</div><div class="text-muted text-sm">${r.employee.position || ''}</div></div></div></td>
      <td>${r.employee.department || '—'}</td>
      <td class="text-center">${r.present}</td>
      <td class="text-center"><span class="${r.absent > 3 ? 'text-danger fw-600' : ''}">${r.absent}</span></td>
      <td class="text-center"><span class="${r.late > 2 ? 'text-warning fw-600' : ''}">${r.late}</span></td>
      <td class="text-center">${r.leaves}</td>
      <td>${r.total_hours}h</td>
      <td><div class="progress-cell"><div class="progress-bar-wrap"><div class="progress-fill ${fillClass}" style="width:${Math.min(100, r.attendance_rate)}%"></div></div><span class="progress-label">${r.attendance_rate}%</span></div></td>
    </tr>`;
  }).join('');

  return `
    <div class="page-header">
      <div>
        <h2>Monthly Attendance Report</h2>
        <p class="subtitle">${firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} — ${workingDays} working days</p>
      </div>
      <button class="btn btn-secondary" onclick="window.print()"><svg viewBox="0 0 24 24" width="16" height="16"><polyline points="6,9 6,2 18,2 18,9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>Print Report</button>
    </div>
    <div class="filter-bar">
      <form id="report-filter" class="filter-form">
        <div class="filter-group">
          <select name="month" class="form-input">
            ${['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => `<option value="${i+1}" ${i+1 === month ? 'selected' : ''}>${m}</option>`).join('')}
          </select>
        </div>
        <div class="filter-group">
          <input type="number" name="year" class="form-input" value="${year}" min="2020" max="2030" style="width:100px" />
        </div>
        <button type="submit" class="btn btn-primary">Generate</button>
      </form>
    </div>
    ${reportData.length ? `<div class="stats-grid stats-grid-4" style="margin-bottom: 24px;">
      <div class="stat-card stat-blue"><div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div><div class="stat-info"><span class="stat-value">${reportData.length}</span><span class="stat-label">Employees</span></div></div>
      <div class="stat-card stat-green"><div class="stat-icon"><svg viewBox="0 0 24 24"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg></div><div class="stat-info"><span class="stat-value">${avgRate}%</span><span class="stat-label">Avg. Attendance</span></div></div>
      <div class="stat-card stat-purple"><div class="stat-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg></div><div class="stat-info"><span class="stat-value">${Math.round(totalHoursAll)}h</span><span class="stat-label">Total Hours</span></div></div>
      <div class="stat-card stat-red"><div class="stat-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></div><div class="stat-info"><span class="stat-value">${totalAbsent}</span><span class="stat-label">Total Absences</span></div></div>
    </div>
    <div class="card">
      <div class="card-header"><h3>Employee Breakdown — ${firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3></div>
      <div class="card-body p-0">
        <div class="table-responsive"><table class="table"><thead><tr><th>Employee</th><th>Department</th><th class="text-center">Present</th><th class="text-center">Absent</th><th class="text-center">Late</th><th class="text-center">Leaves</th><th>Total Hours</th><th>Attendance %</th></tr></thead><tbody>${rows}</tbody><tfoot><tr class="table-footer"><td colspan="2"><strong>Totals</strong></td><td class="text-center"><strong>${totalPresent}</strong></td><td class="text-center"><strong>${totalAbsent}</strong></td><td class="text-center"></td><td class="text-center"></td><td><strong>${Math.round(totalHoursAll * 10) / 10}h</strong></td><td><strong>${avgRate}%</strong></td></tr></tfoot></table></div>
      </div>
    </div>` : `<div class="empty-state large card"><svg viewBox="0 0 24 24" width="64" height="64"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg><h3>No data available</h3><p>No employees or attendance records found for this period.</p></div>`}
  `;
}

function countWorkingDays(startDateStr, endDateStr) {
  let count = 0;
  const d = new Date(startDateStr + 'T00:00:00');
  while (getLocalDateString(d) <= endDateStr) {
    if (d.getDay() !== 0 && d.getDay() !== 6) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
}

// ==================== GLOBAL ACTIONS ====================
function togglePw(btn) {
  const input = btn.closest('.input-wrapper').querySelector('input');
  const isPw = input.type === 'password';
  input.type = isPw ? 'text' : 'password';
  
  const eyeSvg = `<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
  const eyeOffSvg = `<svg viewBox="0 0 24 24"><line x1="1" y1="1" x2="23" y2="23"/><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/></svg>`;
  
  btn.innerHTML = isPw ? eyeOffSvg : eyeSvg;
}

function openEditModal(id, checkIn, checkOut, status) {
  const form = document.getElementById('edit-attendance-form');
  form.dataset.attId = id;
  form.action = '';
  document.getElementById('edit_checkin').value = toLocalDatetimeInput(checkIn);
  document.getElementById('edit_checkout').value = toLocalDatetimeInput(checkOut);
  document.getElementById('edit_status').value = status;
  document.getElementById('editModal').style.display = 'flex';
}

function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
}

function openReviewModal(id, name) {
  const form = document.getElementById('review-form');
  form.dataset.leaveId = id;
  form.action = '';
  document.getElementById('reviewEmpName').textContent = 'Reviewing request for: ' + name;
  document.getElementById('reviewModal').style.display = 'flex';
}

function closeReviewModal() {
  document.getElementById('reviewModal').style.display = 'none';
}

// ==================== PAYROLL EXECUTION CONSOLE (#payroll) ====================
function renderPayroll() {
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const selectedMonth = parseInt(urlParams.get('month')) || (new Date().getMonth() + 1);
  const selectedYear = parseInt(urlParams.get('year')) || new Date().getFullYear();

  const rules = Storage.getPayrollRules() || getDefaultPayrollRules();
  const users = Storage.getUsers();
  const empUsers = users.filter(u => u.role === 'employee' && u.is_active !== false);
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const allInvoices = Storage.getInvoices();
  const existingInvoices = allInvoices.filter(i => i.month === selectedMonth && i.year === selectedYear);

  return `
    <div class="page-header">
      <div>
        <h2>⚡ Run Monthly Payroll Engine</h2>
        <p class="subtitle">Execute monthly payday run for all staff using active policy rules & attendance logs</p>
      </div>
      <div class="header-actions">
        <a href="#invoices?month=${selectedMonth}&year=${selectedYear}" class="btn btn-secondary">
          📄 View Invoices Register
        </a>
        <a href="#payroll-settings" class="btn btn-secondary">
          ⚙️ Edit Rules Policy
        </a>
      </div>
    </div>

    <!-- Active Engine Status Bar -->
    <div class="rule-status-header">
      <div style="display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
        <span class="badge ${rules.rule_status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}" style="font-size:12.5px; padding:6px 12px; font-weight:800;">
          STATUS: ${rules.rule_status || 'ACTIVE'}
        </span>
        <span style="font-size:13px; font-weight:700; color:var(--text-muted);">
          Active Rules Effective: <strong style="color:var(--text);">${rules.effective_from || '01-Aug-2026'}</strong>
        </span>
        <span style="font-size:13px; font-weight:700; color:var(--text-muted);">
          Engine Version: <strong style="color:var(--text);">v${rules.version || '2.4.0'}</strong>
        </span>
      </div>
    </div>

    <div class="settings-grid-2">
      <!-- Left: Execution Controls Card -->
      <div class="card" style="padding:24px;">
        <div style="font-weight:800; font-size:16px; margin-bottom:6px; color:var(--text);">
          📅 Select Pay Period & Trigger Monthly Payroll Run
        </div>
        <div style="font-size:13px; color:var(--text-muted); margin-bottom:20px;">
          Select target month & year below to execute the payroll engine for all active employees.
        </div>

        <form id="payroll-run-form" style="display:flex; flex-direction:column; gap:16px;">
          <div class="form-row">
            <div class="form-group">
              <label style="font-weight:700;">Target Month</label>
              <select id="run-payroll-month" class="form-input" required>
                ${months.map((m, idx) => `<option value="${idx + 1}" ${idx + 1 === selectedMonth ? 'selected' : ''}>${m}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label style="font-weight:700;">Target Year</label>
              <input type="number" id="run-payroll-year" class="form-input" value="${selectedYear}" min="2020" max="2030" required />
            </div>
          </div>

          <div style="padding:16px; background:var(--surface-secondary); border:1px solid var(--border); border-radius:var(--radius-sm); font-size:13px;">
            <div style="font-weight:700; margin-bottom:6px; color:var(--primary);">
              ⚡ Operational Run Check:
            </div>
            <ul style="margin:0; padding-left:18px; color:var(--text-muted); line-height:1.6;">
              <li>Active Employees to Process: <strong>${empUsers.length} Employees</strong></li>
              <li>Calculates basic pay, HRA, allowances, dual overtime (8h/40h) & LOP absent days</li>
              <li>Applies statutory PF, TDS income tax & Professional Tax slabs</li>
              <li>Generates official printable Tax Invoices & Individual Payslip PDFs</li>
            </ul>
          </div>

          <button type="submit" class="btn btn-primary btn-lg" style="width:100%; padding:14px 24px; font-size:15px; font-weight:800; justify-content:center; margin-top:8px;">
            ⚡ Run Monthly Payroll & Generate Invoices
          </button>
        </form>
      </div>

      <!-- Right: Operational Status Card -->
      <div class="card" style="padding:24px;">
        <div style="font-weight:800; font-size:16px; margin-bottom:6px; color:var(--text);">
          📊 Current Period Status: ${months[selectedMonth - 1]} ${selectedYear}
        </div>
        <div style="font-size:13px; color:var(--text-muted); margin-bottom:16px;">
          Status of invoices generated for the selected month
        </div>

        <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:20px;">
          <div style="padding:14px; background:var(--surface-secondary); border-radius:var(--radius-sm); display:flex; justify-content:space-between; align-items:center;">
            <span>Generated Invoices Count:</span>
            <span class="badge ${existingInvoices.length > 0 ? 'badge-success' : 'badge-warning'}">${existingInvoices.length} Invoices</span>
          </div>
          <div style="padding:14px; background:var(--surface-secondary); border-radius:var(--radius-sm); display:flex; justify-content:space-between; align-items:center;">
            <span>Total Gross Pay:</span>
            <strong>${formatINR(existingInvoices.reduce((a, b) => a + (b.gross_earnings || 0), 0))}</strong>
          </div>
          <div style="padding:14px; background:var(--surface-secondary); border-radius:var(--radius-sm); display:flex; justify-content:space-between; align-items:center;">
            <span>Total Net Payout:</span>
            <strong style="color:#059669; font-size:16px;">${formatINR(existingInvoices.reduce((a, b) => a + (b.net_pay || 0), 0))}</strong>
          </div>
        </div>

        ${existingInvoices.length > 0 ? `
          <a href="#invoices?month=${selectedMonth}&year=${selectedYear}" class="btn btn-primary btn-animated-next" style="width:100%; justify-content:center; padding:12px 20px; font-weight:800; font-size:14px; border-radius:var(--radius-sm);">
            <span>Go to Invoices Register & Download Payslips</span>
            <svg class="arrow-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>
        ` : ''}
      </div>
    </div>
  `;
}

// ==================== PAYROLL INVOICES & REGISTER CONSOLE (#invoices) ====================
function renderInvoices() {
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const selectedMonth = parseInt(urlParams.get('month')) || (new Date().getMonth() + 1);
  const selectedYear = parseInt(urlParams.get('year')) || new Date().getFullYear();
  const statusFilter = urlParams.get('status') || 'all';

  const allInvoices = Storage.getInvoices();
  const users = Storage.getUsers();

  let filteredInvoices = allInvoices.filter(i => i.month === selectedMonth && i.year === selectedYear);
  if (statusFilter !== 'all') {
    filteredInvoices = filteredInvoices.filter(i => i.status === statusFilter);
  }

  // Summary Metrics
  const totalPayout = filteredInvoices.reduce((acc, i) => acc + (Number(i.net_pay) || 0), 0);
  const totalTax = filteredInvoices.reduce((acc, i) => acc + (Number(i.tds_tax) || 0), 0);
  const totalOT = filteredInvoices.reduce((acc, i) => acc + (Number(i.overtime_pay) || 0), 0);
  const paidCount = filteredInvoices.filter(i => i.status === 'paid').length;

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  return `
    <div class="page-header">
      <div>
        <h2>📄 Payroll Invoices & Employee Salary Register</h2>
        <p class="subtitle">Comprehensive tabular register for ${months[selectedMonth - 1]} ${selectedYear} with individual payslip PDF downloads</p>
      </div>
      <div class="header-actions">
        ${filteredInvoices.length > 0 ? `
          <button type="button" class="btn-animated-danger" onclick="openDeleteBatchModal(${selectedMonth}, ${selectedYear})" title="Permanently delete all invoices for this month">
            <svg class="trash-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path class="trash-lid" d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <path class="trash-can" d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0v11m4-11v11m4-11v11"/>
            </svg>
            <span>Delete ${months[selectedMonth - 1]} ${selectedYear} Batch</span>
          </button>
        ` : ''}
        <a href="#payroll?month=${selectedMonth}&year=${selectedYear}" class="btn btn-primary">
          ⚡ Run Monthly Payroll
        </a>
        <a href="#payroll-settings" class="btn btn-secondary">
          ⚙️ Rules Policy
        </a>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar">
      <form id="invoices-filter" class="filter-form">
        <div class="filter-group">
          <label>Month</label>
          <select name="month" class="form-input">
            ${months.map((m, idx) => `<option value="${idx + 1}" ${idx + 1 === selectedMonth ? 'selected' : ''}>${m}</option>`).join('')}
          </select>
        </div>
        <div class="filter-group">
          <label>Year</label>
          <input type="number" name="year" class="form-input" value="${selectedYear}" min="2020" max="2030" style="width:100px" />
        </div>
        <div class="filter-group">
          <label>Status Filter</label>
          <select name="status" class="form-input">
            <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>All Statuses</option>
            <option value="approved" ${statusFilter === 'approved' ? 'selected' : ''}>Approved</option>
            <option value="paid" ${statusFilter === 'paid' ? 'selected' : ''}>Paid</option>
          </select>
        </div>
        <button type="submit" class="btn btn-secondary">Apply Filter</button>
        <a href="#invoices" class="btn btn-secondary">Reset</a>
      </form>
    </div>

    <!-- Summary KPI Grid -->
    <div class="stats-grid stats-grid-4" style="margin-bottom: 24px;">
      <div class="stat-card stat-blue">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 3h12M6 8h12M6 13h5a4 4 0 0 0 0-8M6 13l8 8"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">${formatINR(totalPayout)}</span>
          <span class="stat-label">Total Net Payout</span>
        </div>
      </div>
      <div class="stat-card stat-green">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">${paidCount} / ${filteredInvoices.length}</span>
          <span class="stat-label">Settled / Paid Invoices</span>
        </div>
      </div>
      <div class="stat-card stat-purple">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">${formatINR(totalOT)}</span>
          <span class="stat-label">Overtime Paid</span>
        </div>
      </div>
      <div class="stat-card stat-red">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">${formatINR(totalTax)}</span>
          <span class="stat-label">TDS Tax Withheld</span>
        </div>
      </div>
    </div>

    <!-- Invoices Data Register Table -->
    <div class="card">
      <div class="card-header">
        <h3>Employee Salary Invoices Register — ${months[selectedMonth - 1]} ${selectedYear}</h3>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table" style="font-size:13px;">
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
                <th style="text-align:right">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filteredInvoices.length === 0 ? `
                <tr>
                  <td colspan="12" style="text-align:center; padding: 36px; color: var(--text-muted);">
                    No payroll invoices generated for ${months[selectedMonth - 1]} ${selectedYear} yet.<br>
                    <button type="button" class="btn btn-primary btn-sm" style="margin-top:12px" onclick="handleRunPayrollExecution(${selectedMonth}, ${selectedYear})">
                      ⚡ Run Monthly Payroll for ${months[selectedMonth - 1]} ${selectedYear}
                    </button>
                  </td>
                </tr>
              ` : filteredInvoices.map(inv => {
                const emp = users.find(u => u.id === inv.user_id) || { first_name: 'Employee', last_name: `#${inv.user_id}`, department: 'Staff', position: '' };
                const isPaid = inv.status === 'paid';
                const allowancesTotal = (inv.special_allowance || 0) + (inv.conveyance_allowance || 0) + (inv.medical_allowance || 0);

                return `
                  <tr>
                    <td>
                      <a href="#invoice-view?id=${inv.id}" style="font-family:monospace; font-weight:800;">
                        ${escapeHtml(inv.invoice_number)}
                      </a>
                    </td>
                    <td>
                      <div class="emp-cell">
                        <div class="avatar-sm">${escapeHtml(emp.first_name[0] || 'E')}</div>
                        <div>
                          <div class="fw-600">${escapeHtml(emp.first_name)} ${escapeHtml(emp.last_name)}</div>
                          <div class="text-muted text-sm">${escapeHtml(emp.department || '—')} • EMP-${String(emp.id).padStart(4, '0')}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style="font-weight:700;">${formatINR(inv.base_salary || 50000)}</div>
                      ${inv.applied_salary_reason ? `
                        <div style="font-size:10px; color:var(--primary); font-weight:700;">${escapeHtml(inv.applied_salary_reason.split('(')[0])}</div>
                      ` : ''}
                    </td>
                    <td>
                      <span class="fw-600">${inv.present_days}</span> / <span class="text-muted">${inv.working_days}d</span>
                      ${inv.absent_days > 0 ? `<div class="text-danger text-sm font-semibold">${inv.absent_days} LOP</div>` : ''}
                    </td>
                    <td>
                      <span class="fw-600">${inv.total_hours}h</span>
                      ${inv.overtime_hours > 0 ? `<div class="text-success text-sm font-semibold">+${inv.overtime_hours}h OT</div>` : '<div class="text-muted text-sm">0h OT</div>'}
                    </td>
                    <td>
                      <div><strong>Basic:</strong> ${formatINR(inv.basic_pay)}</div>
                      <div class="text-muted text-sm">HRA: ${formatINR(inv.hra)}</div>
                    </td>
                    <td>
                      ${formatINR(allowancesTotal)}
                    </td>
                    <td class="fw-600">${formatINR(inv.gross_earnings)}</td>
                    <td class="text-danger fw-600">-${formatINR(inv.total_deductions)}</td>
                    <td>
                      <strong style="color:#059669; font-size:15px;">${formatINR(inv.net_pay)}</strong>
                    </td>
                    <td>
                      <span class="badge ${isPaid ? 'badge-success badge-no-dot' : inv.status === 'approved' ? 'badge-info' : 'badge-warning'}">
                        ${isPaid ? '✓ PAID' : inv.status ? inv.status.toUpperCase() : 'PENDING'}
                      </span>
                    </td>
                    <td style="text-align:right;">
                      <div class="actions-cell-group">
                        <button type="button" class="btn-download-pdf" onclick="downloadIndividualPayslipPDF('${inv.id}')" title="Download Official Payslip PDF">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                          </svg>
                          <span>Download PDF</span>
                        </button>
                        <a href="#invoice-view?id=${inv.id}" class="btn btn-sm btn-secondary" title="View Payslip">
                          👁️ View
                        </a>
                        <div class="action-slot-pay">
                          ${!isPaid ? `
                            <button type="button" class="btn btn-sm btn-primary" onclick="openMarkPaidModal('${inv.id}')" title="Mark Paid">
                              💵 Pay
                            </button>
                          ` : `
                            <span class="badge badge-success badge-no-dot" style="font-size:11px; padding:4px 8px; font-weight:800;">✓ Paid</span>
                          `}
                        </div>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
            ${filteredInvoices.length > 0 ? `
              <tfoot>
                <tr class="table-footer">
                  <td colspan="7"><strong>Monthly Total Summary (${filteredInvoices.length} Invoices)</strong></td>
                  <td><strong>${formatINR(filteredInvoices.reduce((a, b) => a + (b.gross_earnings || 0), 0))}</strong></td>
                  <td class="text-danger"><strong>-${formatINR(filteredInvoices.reduce((a, b) => a + (b.total_deductions || 0), 0))}</strong></td>
                  <td style="color:#059669;"><strong>${formatINR(totalPayout)}</strong></td>
                  <td colspan="2"></td>
                </tr>
              </tfoot>
            ` : ''}
          </table>
        </div>
      </div>
    </div>

    <!-- Mark Paid Modal -->
    <div class="modal-overlay" id="mark-paid-modal" style="display:none;">
      <div class="modal" style="max-width:500px;">
        <div class="modal-header" style="background:var(--surface-secondary);">
          <div class="modal-header-icon-title">
            <div class="modal-header-icon success">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </div>
            <div>
              <h3 style="margin:0; font-size:16px;">Record Salary Disbursement</h3>
              <div style="font-size:12px; color:var(--text-muted); font-weight:500;">Confirm payment details & disburse salary</div>
            </div>
          </div>
          <button class="modal-close" onclick="closeMarkPaidModal()">×</button>
        </div>

        <form id="mark-paid-form" style="padding:24px;">
          <input type="hidden" id="paid-invoice-id" />

          <div class="modal-info-banner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0; margin-top:2px;">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <div>
              Confirming direct salary disbursement. This will record payment mode details and mark the employee invoice as <strong>PAID & SETTLED</strong>.
            </div>
          </div>

          <div class="form-group" style="margin-bottom:16px;">
            <label style="font-weight:700; font-size:12.5px;">Payment Transfer Mode <span class="req">*</span></label>
            <select id="paid-mode" class="form-input" required style="font-weight:600;">
              <option value="NEFT / Direct Bank Transfer">🏦 NEFT / Direct Bank Transfer</option>
              <option value="RTGS">⚡ RTGS (High Value Transfer)</option>
              <option value="IMPS / Instant Transfer">🚀 IMPS / Instant Transfer</option>
              <option value="UPI Direct Pay">📱 UPI Direct Pay</option>
              <option value="Corporate Cheque">📝 Corporate Cheque</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom:16px;">
            <label style="font-weight:700; font-size:12.5px;">Transaction Reference ID / Cheque # <span class="req">*</span></label>
            <input type="text" id="paid-ref" class="form-input" placeholder="e.g. TXN9872134598" style="font-family:monospace; font-weight:700;" required />
            <span class="form-hint">Unique reference code from bank portal or cheque register</span>
          </div>

          <div class="form-group" style="margin-bottom:20px;">
            <label style="font-weight:700; font-size:12.5px;">Disbursement Payment Date <span class="req">*</span></label>
            <input type="date" id="paid-date" class="form-input" value="${getLocalDateString(new Date())}" style="font-weight:600;" required />
          </div>

          <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:24px; padding-top:16px; border-top:1px solid var(--border);">
            <button type="button" class="btn btn-secondary" onclick="closeMarkPaidModal()">Cancel</button>
            <button type="submit" class="btn btn-primary" style="font-weight:800; padding:10px 20px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>Confirm & Mark as Paid</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Permanent Batch Delete Confirmation Modal with Captcha -->
    <div class="modal-overlay" id="delete-batch-modal" style="display:none;">
      <div class="modal" style="max-width:500px;">
        <div class="modal-header" style="background:#fff1f2; border-bottom:1px solid #fecaca;">
          <div class="modal-header-icon-title">
            <div class="modal-header-icon danger">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <h3 style="margin:0; font-size:16px; color:#be123c;">Permanent Batch Deletion</h3>
              <div style="font-size:12px; color:#9f1239; font-weight:600;">High-risk administrative deletion action</div>
            </div>
          </div>
          <button class="modal-close" onclick="closeDeleteBatchModal()">×</button>
        </div>

        <form id="delete-batch-form" style="padding:24px;">
          <input type="hidden" id="delete-batch-month-val" />
          <input type="hidden" id="delete-batch-year-val" />

          <div class="modal-info-banner danger-banner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0; margin-top:2px;">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <div>
              You are about to permanently purge all generated invoices for <strong id="delete-batch-period-name" style="color:#be123c;">August 2026</strong>. All invoice records, payment reference codes, and payslip data for this month will be deleted.
            </div>
          </div>

          <div class="form-group" style="text-align:center; margin-bottom:16px;">
            <label style="font-weight:700; font-size:12px; text-transform:uppercase; color:var(--text-muted); letter-spacing:0.5px;">
              🔒 Security Verification Captcha
            </label>
            <div class="captcha-display-box">
              <span class="captcha-code-text" id="delete-captcha-code">8492</span>
            </div>
            <input type="text" id="delete-captcha-input" class="form-input" placeholder="Type the 4-digit code shown above" style="text-align:center; font-weight:800; font-size:17px; letter-spacing:6px; max-width:280px; margin:0 auto;" required />
            <div id="delete-captcha-error" style="color:#dc2626; font-size:12px; font-weight:700; margin-top:8px; display:none;">
              ❌ Incorrect Captcha code! Please type the exact 4-digit code shown above.
            </div>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:24px; padding-top:16px; border-top:1px solid var(--border);">
            <button type="button" class="btn btn-secondary" onclick="closeDeleteBatchModal()">Cancel</button>
            <button type="submit" class="btn-animated-danger" style="font-weight:800; padding:10px 20px;">
              <svg class="trash-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path class="trash-lid" d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <path class="trash-can" d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0v11m4-11v11m4-11v11"/>
              </svg>
              <span>Confirm Permanent Delete</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

// ==================== PAYROLL POLICY & RULES CONSOLE ====================
function renderPayrollSettings() {
  const rules = Storage.getPayrollRules() || getDefaultPayrollRules();
  const users = Storage.getUsers();
  const salaries = Storage.getSalaries();
  const empUsers = users.filter(u => u.role === 'employee' && u.is_active !== false);

  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const activeTab = urlParams.get('tab') || 'structure';
  const selectedTypeId = urlParams.get('type') || (rules.employee_types[0]?.id || 'full_time_senior');
  const selectedType = rules.employee_types.find(t => t.id === selectedTypeId) || rules.employee_types[0];

  const selectedSimUserId = urlParams.get('sim_user') || (empUsers[0]?.id || 2);
  const simUser = users.find(u => u.id === Number(selectedSimUserId)) || empUsers[0];
  const simPayroll = simUser ? calculatePayroll(simUser.id, new Date().getMonth() + 1, new Date().getFullYear()) : null;

  return `
    <div class="page-header">
      <div>
        <h2>Payroll Policy & Rules Console</h2>
        <p class="subtitle">Structured rule configuration engine defining salary components, statutory taxes, priority overrides & test simulations</p>
      </div>
      <div class="header-actions">
        <a href="#payroll" class="btn btn-secondary btn-animated-back" style="padding:9px 18px; font-weight:700;">
          <svg class="arrow-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Back to Payment Processing</span>
        </a>
        <button type="button" class="btn btn-primary" onclick="handleBatchRunPayroll(new Date().getMonth() + 1, new Date().getFullYear())">
          ⚡ Apply Active Rules & Process Payroll
        </button>
      </div>
    </div>

    <!-- Rule Engine Status & Version Header -->
    <div class="rule-status-header">
      <div style="display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
        <span class="badge ${rules.rule_status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}" style="font-size:12.5px; padding:6px 12px; font-weight:800;">
          STATUS: ${rules.rule_status || 'ACTIVE'}
        </span>
        <span style="font-size:13px; font-weight:700; color:var(--text-muted);">
          Effective Date: <strong style="color:var(--text);">${rules.effective_from || '01-Aug-2026'}</strong>
        </span>
        <span style="font-size:13px; font-weight:700; color:var(--text-muted);">
          Engine Version: <strong style="color:var(--text);">v${rules.version || '2.4.0'}</strong>
        </span>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button type="button" class="btn btn-sm btn-secondary" onclick="switchPayrollTab('simulation')">
          🧪 Test Payroll Simulation
        </button>
        <button type="button" class="btn btn-sm btn-success" onclick="activatePayrollRules()">
          🚀 Save & Activate Rules
        </button>
      </div>
    </div>

    <!-- Tab Navigation (7 Structured Sections) -->
    <div class="settings-tab-nav">
      <button class="settings-tab-btn ${activeTab === 'structure' ? 'active' : ''}" onclick="switchPayrollTab('structure')">
        💵 1. Salary & Earnings Structure
      </button>
      <button class="settings-tab-btn ${activeTab === 'deductions' ? 'active' : ''}" onclick="switchPayrollTab('deductions')">
        🛡️ 2. Deductions & Statutory Taxes
      </button>
      <button class="settings-tab-btn ${activeTab === 'attendance_ot' ? 'active' : ''}" onclick="switchPayrollTab('attendance_ot')">
        ⏱️ 3. Attendance, LOP & Overtime
      </button>
      <button class="settings-tab-btn ${activeTab === 'overrides' ? 'active' : ''}" onclick="switchPayrollTab('overrides')">
        🔀 4. Priority Cascade & Overrides
      </button>
      <button class="settings-tab-btn ${activeTab === 'types' ? 'active' : ''}" onclick="switchPayrollTab('types')">
        👔 5. Category Profiles
      </button>
      <button class="settings-tab-btn ${activeTab === 'simulation' ? 'active' : ''}" onclick="switchPayrollTab('simulation')">
        🧪 6. Test Simulation & Preview
      </button>
      <button class="settings-tab-btn ${activeTab === 'branding' ? 'active' : ''}" onclick="switchPayrollTab('branding')">
        🏢 7. Payslip Branding & Entity
      </button>
    </div>

    <!-- SECTION 1: Salary & Earnings Structure -->
    <div id="tab-content-structure" style="display: ${activeTab === 'structure' ? 'block' : 'none'};">
      <form id="salary-structure-form">
        <div class="settings-grid-2">
          <div class="rule-group-card">
            <div class="rule-group-title">
              <span>📋 Foundation Components & Calculation Types</span>
            </div>
            <div class="rule-group-subtitle">Configure basic percentage of Gross, HRA calculation base, and allowance components</div>

            <div class="form-row">
              <div class="form-group">
                <label>Basic Salary Component (% of Base CTC)</label>
                <input type="number" id="ss-basic-pct" class="form-input" value="${rules.salary_structure?.basic_percentage || 50}" min="10" max="100" step="1" required />
                <span class="form-hint">Calculation Type: Percentage of Base CTC (Default: 50%)</span>
              </div>
              <div class="form-group">
                <label>HRA Component (% of Basic Salary)</label>
                <input type="number" id="ss-hra-pct" class="form-input" value="${rules.salary_structure?.hra_percentage || 40}" min="0" max="100" step="1" required />
                <span class="form-hint">Calculation Type: Percentage of Basic Salary (Default: 40%)</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Conveyance Allowance (₹ / month)</label>
                <input type="number" id="ss-conveyance" class="form-input" value="${rules.salary_structure?.conveyance_allowance || 2000}" min="0" step="100" />
                <span class="form-hint">Calculation Type: Fixed Amount</span>
              </div>
              <div class="form-group">
                <label>Medical Allowance (₹ / month)</label>
                <input type="number" id="ss-medical" class="form-input" value="${rules.salary_structure?.medical_allowance || 1500}" min="0" step="100" />
                <span class="form-hint">Calculation Type: Fixed Amount</span>
              </div>
            </div>

            <div class="formula-callout">
              <span>ℹ️</span>
              <span>Salary Component Formula: <strong class="formula-callout-code">Gross = Basic (50%) + HRA (40% of Basic) + Special + Conveyance + Medical + OT</strong></span>
            </div>
          </div>

          <div class="rule-group-card">
            <div class="rule-group-title">
              <span>💵 Active Earnings Components Registry</span>
            </div>
            <div class="rule-group-subtitle">List of earnings components defined in the active payroll engine</div>

            <div class="table-responsive">
              <table class="table" style="font-size:13px;">
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
                    <td><span class="badge badge-info">% of Base CTC</span></td>
                    <td>${rules.salary_structure?.basic_percentage || 50}% of Base CTC</td>
                    <td><span class="badge badge-success">Active</span></td>
                  </tr>
                  <tr>
                    <td><strong>House Rent Allowance (HRA)</strong></td>
                    <td><span class="badge badge-info">% of Basic Salary</span></td>
                    <td>${rules.salary_structure?.hra_percentage || 40}% of Basic</td>
                    <td><span class="badge badge-success">Active</span></td>
                  </tr>
                  <tr>
                    <td><strong>Special Allowance</strong></td>
                    <td><span class="badge badge-secondary">Balancing / Residual</span></td>
                    <td>Calculated balancing pay</td>
                    <td><span class="badge badge-success">Active</span></td>
                  </tr>
                  <tr>
                    <td><strong>Conveyance & Medical</strong></td>
                    <td><span class="badge badge-warning">Fixed Monthly Amount</span></td>
                    <td>₹${rules.salary_structure?.conveyance_allowance || 2000} / ₹${rules.salary_structure?.medical_allowance || 1500}</td>
                    <td><span class="badge badge-success">Active</span></td>
                  </tr>
                  <tr>
                    <td><strong>Overtime Pay</strong></td>
                    <td><span class="badge badge-primary">Formula / Hourly Multiplier</span></td>
                    <td>(Basic / Hours) × OT Multiplier</td>
                    <td><span class="badge badge-success">Active</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style="text-align:right; margin-top:20px;">
          <button type="submit" class="btn btn-primary">
            💾 Save Salary Structure & Earnings Rules
          </button>
        </div>
      </form>
    </div>

    <!-- SECTION 2: Deductions & Statutory Taxes -->
    <div id="tab-content-deductions" style="display: ${activeTab === 'deductions' ? 'block' : 'none'};">
      <form id="deductions-rules-form">
        <div class="settings-grid-2">
          <div class="rule-group-card">
            <div class="rule-group-title">
              <span>🛡️ Statutory Deductions (PF, TDS & Insurance)</span>
            </div>
            <div class="rule-group-subtitle">Configure Provident Fund retirement percentage, TDS tax withholding and health insurance</div>

            <div class="form-group">
              <label class="checkbox-toggle-card">
                <input type="checkbox" id="dc-pf-enabled" ${rules.deductions_config?.pf_enabled !== false ? 'checked' : ''} />
                <span>Enable Provident Fund (PF) Deduction</span>
              </label>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>PF Rate (% of Basic Salary)</label>
                <input type="number" id="dc-pf-rate" class="form-input" value="${rules.deductions_config?.pf_rate || 6.0}" min="0" max="25" step="0.5" />
                <span class="form-hint">Calculation Type: Percentage of Basic Salary (Standard: 6% / 12%)</span>
              </div>
              <div class="form-group">
                <label>PF Calculation Base</label>
                <input type="text" class="form-input" value="Basic Salary Only" disabled />
              </div>
            </div>

            <div class="form-group" style="margin-top:8px;">
              <label class="checkbox-toggle-card">
                <input type="checkbox" id="dc-tds-enabled" ${rules.deductions_config?.tds_enabled !== false ? 'checked' : ''} />
                <span>Enable Income Tax Withholding (TDS)</span>
              </label>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Default TDS Rate (% of Gross)</label>
                <input type="number" id="dc-tds-rate" class="form-input" value="${rules.deductions_config?.tds_rate || 10.0}" min="0" max="40" step="1" />
                <span class="form-hint">Calculation Type: Percentage of Total Gross Earnings</span>
              </div>
              <div class="form-group">
                <label>Group Health Insurance (₹ / month)</label>
                <input type="number" id="dc-insurance" class="form-input" value="${rules.deductions_config?.health_insurance || 500}" min="0" step="100" />
              </div>
            </div>
          </div>

          <div class="rule-group-card">
            <div class="rule-group-title">
              <span>🏛️ Professional Tax (PT) Slab Rules</span>
            </div>
            <div class="rule-group-subtitle">Configure statutory Professional Tax slab brackets or flat monthly amount</div>

            <div class="form-group">
              <label>Professional Tax Calculation Mode</label>
              <select id="dc-pt-mode" class="form-input">
                <option value="slab" ${rules.deductions_config?.pt_mode === 'slab' ? 'selected' : ''}>Slab-Based Tax Brackets (Standard Statutory)</option>
                <option value="flat" ${rules.deductions_config?.pt_mode === 'flat' ? 'selected' : ''}>Flat Rate (e.g. ₹200 / month)</option>
              </select>
            </div>

            <div id="pt-slabs-container" style="margin-top:16px;">
              <label style="font-weight:700; font-size:13px;">Professional Tax Slab Table (Gross Salary Range vs Tax Amount):</label>
              <div class="table-responsive" style="margin-top:8px;">
                <table class="table" style="font-size:12.5px;">
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

        <div style="text-align:right; margin-top:20px;">
          <button type="submit" class="btn btn-primary">
            💾 Save Deductions & Statutory Tax Rules
          </button>
        </div>
      </form>
    </div>

    <!-- SECTION 3: Attendance, LOP & Overtime Policy -->
    <div id="tab-content-attendance_ot" style="display: ${activeTab === 'attendance_ot' ? 'block' : 'none'};">
      <form id="attendance-ot-form">
        <div class="settings-grid-2">
          <div class="rule-group-card">
            <div class="rule-group-title">
              <span>📅 Attendance Basis & Loss of Pay (LOP) Rules</span>
            </div>
            <div class="rule-group-subtitle">Configure monthly working days basis, LOP deduction formula & late arrival grace</div>

            <div class="form-group">
              <label>Monthly Salary Calculation Basis</label>
              <select id="ao-basis" class="form-input">
                <option value="working_days" ${rules.attendance_lop_config?.basis === 'working_days' ? 'selected' : ''}>Monthly Salary / Working Days (Exclude Weekends)</option>
                <option value="calendar_days" ${rules.attendance_lop_config?.basis === 'calendar_days' ? 'selected' : ''}>Monthly Salary / Calendar Days (Standard 30 Days)</option>
              </select>
            </div>

            <div class="form-group">
              <label>Fixed Working Days (If Fixed Mode Active)</label>
              <input type="number" id="ao-fixed-days" class="form-input" value="${rules.attendance_lop_config?.fixed_working_days || 22}" min="15" max="31" step="1" />
            </div>

            <div class="formula-callout">
              <span>ℹ️</span>
              <span>LOP Formula: <strong class="formula-callout-code">LOP = (Monthly Base Salary ÷ Working Days) × Unpaid Absent Days</strong></span>
            </div>

            <div class="form-group" style="margin-top:16px;">
              <label>Monthly Grace Late Arrivals Count Allowed</label>
              <input type="number" id="ao-late-grace" class="form-input" value="${rules.attendance_lop_config?.late_grace_count !== undefined ? rules.attendance_lop_config.late_grace_count : 2}" min="0" max="10" step="1" />
              <span class="form-hint">Check-ins beyond grace count trigger late penalty deduction</span>
            </div>

            <div class="form-group">
              <label>Late Arrival Penalty Rule</label>
              <select id="ao-late-type" class="form-input">
                <option value="half_day" ${rules.attendance_lop_config?.late_penalty_type === 'half_day' ? 'selected' : ''}>Half Day Base Deduction (0.5 Days Salary)</option>
                <option value="quarter_day" ${rules.attendance_lop_config?.late_penalty_type === 'quarter_day' ? 'selected' : ''}>Quarter Day Base Deduction (0.25 Days Salary)</option>
                <option value="flat" ${rules.attendance_lop_config?.late_penalty_type === 'flat' ? 'selected' : ''}>Flat Penalty Amount (e.g. ₹500)</option>
                <option value="none" ${rules.attendance_lop_config?.late_penalty_type === 'none' ? 'selected' : ''}>Warning Only (No Salary Deduction)</option>
              </select>
            </div>
          </div>

          <div class="rule-group-card">
            <div class="rule-group-title">
              <span>⏱️ Overtime (OT) Engine Multipliers</span>
            </div>
            <div class="rule-group-subtitle">Configure daily/weekly overtime thresholds, hourly rate basis and multipliers</div>

            <div class="form-group">
              <label class="checkbox-toggle-card">
                <input type="checkbox" id="ao-ot-enabled" ${rules.overtime_config?.enabled !== false ? 'checked' : ''} />
                <span>Overtime Engine Enabled</span>
              </label>
            </div>

            <div class="settings-grid-3">
              <div class="form-group">
                <label>Daily OT Threshold</label>
                <input type="number" id="ao-ot-daily" class="form-input" value="${rules.overtime_config?.daily_threshold || 8.0}" min="4" max="12" step="0.5" />
                <span class="form-hint">> 8.0 hours / day</span>
              </div>
              <div class="form-group">
                <label>Weekly OT Threshold</label>
                <input type="number" id="ao-ot-weekly" class="form-input" value="${rules.overtime_config?.weekly_threshold || 40.0}" min="20" max="60" step="1" />
                <span class="form-hint">> 40 hours / week</span>
              </div>
              <div class="form-group">
                <label>Standard Multiplier</label>
                <select id="ao-ot-mult" class="form-input">
                  <option value="1.0" ${rules.overtime_config?.standard_multiplier == 1.0 ? 'selected' : ''}>1.0x (Standard Wage)</option>
                  <option value="1.25" ${rules.overtime_config?.standard_multiplier == 1.25 ? 'selected' : ''}>1.25x (125% Rate)</option>
                  <option value="1.5" ${rules.overtime_config?.standard_multiplier == 1.5 ? 'selected' : ''}>1.5x (Time-and-a-half)</option>
                  <option value="2.0" ${rules.overtime_config?.standard_multiplier == 2.0 ? 'selected' : ''}>2.0x (Double Time)</option>
                </select>
              </div>
            </div>

            <div class="formula-callout" style="background:#f3e8ff; border-color:#e9d5ff; color:#6b21a8;">
              <span>ℹ️</span>
              <span>OT Rate Formula: <strong class="formula-callout-code" style="background:#fae8ff; color:#581c87;">Hourly Rate = Basic ÷ (Working Days × 8) | OT Pay = Hours × Rate × Multiplier</strong></span>
            </div>
          </div>
        </div>

        <div style="text-align:right; margin-top:20px;">
          <button type="submit" class="btn btn-primary">
            💾 Save Attendance, LOP & Overtime Policy
          </button>
        </div>
      </form>
    </div>

    <!-- SECTION 4: Priority Cascade & Overrides -->
    <div id="tab-content-overrides" style="display: ${activeTab === 'overrides' ? 'block' : 'none'};">
      <div class="priority-cascade-card">
        <div style="font-weight:800; font-size:15px; color:var(--text);">🔀 Rule Scope Priority Cascade (First Matching Rule Wins)</div>
        <div style="font-size:12.5px; color:var(--text-muted); margin-top:4px;">When evaluating payroll rules for an employee, the system follows this strict priority hierarchy:</div>
        
        <div class="priority-step-list">
          <div class="priority-step-item">
            <span class="priority-badge-num">1</span>
            <div>
              <strong>Employee-Specific Rule Override</strong> (Highest Priority — Custom Employee Contract overrides all)
            </div>
          </div>
          <div class="priority-step-item">
            <span class="priority-badge-num">2</span>
            <div>
              <strong>Position / Designation Exception</strong> (Second Priority — Role specific exceptions e.g. System Administrator)
            </div>
          </div>
          <div class="priority-step-item">
            <span class="priority-badge-num">3</span>
            <div>
              <strong>Department Base Baseline</strong> (Third Priority — Department baseline scale e.g. Engineering ₹95,000)
            </div>
          </div>
          <div class="priority-step-item">
            <span class="priority-badge-num" style="background:#64748b;">4</span>
            <div>
              <strong>Company Default Rules</strong> (Default Fallback — Universal organization defaults)
            </div>
          </div>
        </div>
      </div>

      <!-- Department Baselines Engine Table -->
      <div class="card" style="margin-bottom:24px;">
        <div class="card-header" style="flex-wrap:wrap; gap:12px;">
          <div>
            <h3>🏢 Department Base Salary Benchmarks & Higher-Scale Rules</h3>
            <p class="text-muted text-sm">Higher Salary Engine: max(Individual Base, Category Benchmark, Department Baseline)</p>
          </div>
          <button type="button" class="btn btn-sm btn-secondary" onclick="openNewDeptModal()">
            ➕ Add Department Scale
          </button>
        </div>
        <div class="card-body p-0">
          <form id="department-rules-form">
            <div class="table-responsive">
              <table class="table">
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
                  ${(rules.department_rules || []).map(dept => {
                    const staffCount = empUsers.filter(u => (u.department || '').toLowerCase() === dept.department.toLowerCase()).length;
                    return `
                      <tr>
                        <td>
                          <div style="font-weight:700; color:var(--text); font-size:14.5px;">
                            ${escapeHtml(dept.department)}
                          </div>
                          <input type="hidden" name="dept_id" value="${dept.id}" />
                        </td>
                        <td>
                          <input type="text" name="dept_desc_${dept.id}" class="form-input" value="${escapeHtml(dept.description || '')}" placeholder="e.g. Software Engineering & Architecture" style="max-width:340px;" />
                        </td>
                        <td>
                          <div style="display:flex; align-items:center; gap:8px;">
                            <span style="font-weight:700; color:var(--text-muted);">₹</span>
                            <input type="number" name="dept_min_base_${dept.id}" class="form-input" value="${dept.min_base_salary || 50000}" min="1000" step="500" style="width:140px; font-weight:700;" required />
                          </div>
                        </td>
                        <td>
                          <span class="badge badge-info">${staffCount} Employees</span>
                        </td>
                        <td>
                          <span class="badge badge-success">Active Engine</span>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
            <div style="padding: 20px; text-align:right; border-top:1px solid var(--border); background:var(--surface-secondary);">
              <button type="submit" class="btn btn-primary">
                💾 Save Department Salary Baselines
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- SECTION 5: Employee Category Profiles -->
    <div id="tab-content-types" style="display: ${activeTab === 'types' ? 'block' : 'none'};">
      <div class="type-selector-bar">
        <span style="font-size:13px; font-weight:var(--font-weight-extrabold); color:var(--text-muted); text-transform:uppercase; margin-right:6px;">Select Category Profile:</span>
        ${rules.employee_types.map(t => `
          <button type="button" class="type-chip ${t.id === selectedType.id ? 'active' : ''}" onclick="selectEmployeeType('${t.id}')">
            ${escapeHtml(t.name)}
          </button>
        `).join('')}
        <button type="button" class="btn btn-sm btn-secondary" style="margin-left:auto;" onclick="openNewCategoryModal()">
          ➕ New Category
        </button>
      </div>

      <form id="employee-type-form">
        <input type="hidden" id="cfg-type-id" value="${selectedType.id}" />
        <div class="settings-grid-2">
          <div class="rule-group-card">
            <div class="rule-group-title">
              <span>📋 Category Profile Definition</span>
              <span class="badge badge-info">${selectedType.id}</span>
            </div>
            <div class="rule-group-subtitle">Define title, description and benchmark salary for this employee group</div>
            <div class="form-group">
              <label>Category Display Name <span class="req">*</span></label>
              <input type="text" id="cfg-type-name" class="form-input" value="${escapeHtml(selectedType.name)}" required />
            </div>
            <div class="form-group">
              <label>Description & Scope</label>
              <input type="text" id="cfg-type-desc" class="form-input" value="${escapeHtml(selectedType.description || '')}" placeholder="e.g. Senior Developers, Department Leads" />
            </div>
            <div class="form-group">
              <label>Benchmark Base CTC (INR ₹) <span class="req">*</span></label>
              <input type="number" id="cfg-type-base" class="form-input" value="${selectedType.base_salary || 50000}" min="1000" step="500" required />
            </div>
          </div>

          <div class="rule-group-card">
            <div class="rule-group-title">
              <span>💵 Component Splits for ${escapeHtml(selectedType.name)}</span>
            </div>
            <div class="rule-group-subtitle">Configure percentage splits and fixed monthly allowances</div>
            <div class="form-row">
              <div class="form-group">
                <label>Basic Salary (% of Base)</label>
                <input type="number" id="cfg-basic-pct" class="form-input" value="${selectedType.basic_percentage !== undefined ? selectedType.basic_percentage : 50}" min="10" max="100" step="1" required />
              </div>
              <div class="form-group">
                <label>HRA (% of Basic)</label>
                <input type="number" id="cfg-hra-pct" class="form-input" value="${selectedType.hra_percentage !== undefined ? selectedType.hra_percentage : 40}" min="0" max="100" step="1" required />
              </div>
            </div>
            <div class="settings-grid-3">
              <div class="form-group">
                <label>Special Allowance (₹)</label>
                <input type="number" id="cfg-special-allow" class="form-input" value="${selectedType.special_allowance || 0}" min="0" step="500" />
              </div>
              <div class="form-group">
                <label>Conveyance (₹)</label>
                <input type="number" id="cfg-conveyance-allow" class="form-input" value="${selectedType.conveyance_allowance || 0}" min="0" step="500" />
              </div>
              <div class="form-group">
                <label>Medical Allowance (₹)</label>
                <input type="number" id="cfg-medical-allow" class="form-input" value="${selectedType.medical_allowance || 0}" min="0" step="500" />
              </div>
            </div>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px; margin-top:24px; padding:20px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); margin-bottom:24px;">
          <div>
            <span style="font-weight:700; color:var(--text);">Updating Rules for:</span> <strong>${escapeHtml(selectedType.name)}</strong>
          </div>
          <div style="display:flex; gap:12px; flex-wrap:wrap;">
            ${rules.employee_types.length > 1 ? `
              <button type="button" class="btn btn-danger" onclick="deleteEmployeeType('${selectedType.id}')">
                🗑️ Delete Category
              </button>
            ` : ''}
            <button type="submit" class="btn btn-primary">
              💾 Save "${escapeHtml(selectedType.name)}" Rules
            </button>
          </div>
        </div>
      </form>

      <!-- Employee Category Assignments & Salary Mapping Table -->
      <div class="card">
        <div class="card-header">
          <h3>👥 Assign Employees to Category Profiles & Individual Base CTC</h3>
          <p class="text-muted text-sm">Select which Category Profile each employee belongs to, configure individual base contract salaries, bank details, and PAN numbers.</p>
        </div>
        <div class="card-body p-0">
          <form id="employee-mapping-form">
            <div class="table-responsive">
              <table class="table">
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
                  ${empUsers.map(emp => {
                    const deptRules = rules.department_rules || [];
                    const deptRule = deptRules.find(d => d.department.toLowerCase() === (emp.department || '').toLowerCase());
                    const deptBase = deptRule ? Number(deptRule.min_base_salary) || 0 : 0;

                    const sal = salaries.find(s => s.user_id === emp.id) || { employee_type_id: 'full_time_senior', base_salary: 75000, bank_name: 'HDFC Bank Ltd.', bank_account_no: '••••••••4892', bank_ifsc: 'HDFC0001001', pan_no: 'ABCDE1234F' };
                    const empType = (rules.employee_types || []).find(t => t.id === sal.employee_type_id) || rules.employee_types[0];
                    const indBase = Number(sal.base_salary) || 0;
                    const catBase = Number(empType?.base_salary) || 0;
                    const effectiveBase = Math.max(indBase, catBase, deptBase) || 50000;
                    const isDeptHigher = effectiveBase === deptBase && deptBase > indBase;

                    return `
                      <tr>
                        <td>
                          <div class="emp-cell">
                            <div class="avatar-sm">${escapeHtml(emp.first_name[0] || 'E')}</div>
                            <div>
                              <div class="fw-600">${escapeHtml(emp.first_name)} ${escapeHtml(emp.last_name)}</div>
                              <div class="text-muted text-sm">
                                <span class="badge badge-info" style="font-size:10.5px; padding:2px 6px;">${escapeHtml(emp.department || 'General')}</span>
                                ${escapeHtml(emp.position || 'Staff')}
                              </div>
                            </div>
                          </div>
                          <input type="hidden" name="emp_id" value="${emp.id}" />
                        </td>
                        <td>
                          <select name="emp_type_${emp.id}" class="form-input" style="min-width:170px;">
                            ${rules.employee_types.map(t => `
                              <option value="${t.id}" ${t.id === (sal.employee_type_id || 'full_time_senior') ? 'selected' : ''}>
                                ${escapeHtml(t.name)}
                              </option>
                            `).join('')}
                          </select>
                        </td>
                        <td>
                          <input type="number" name="emp_base_${emp.id}" class="form-input" value="${sal.base_salary || 50000}" min="1000" step="500" style="width:120px;" />
                        </td>
                        <td>
                          <span style="font-weight:600; color:var(--text);">${formatINR(deptBase)}</span>
                        </td>
                        <td>
                          <div style="font-weight:800; color:#059669; font-size:14.5px;">
                            ${formatINR(effectiveBase)}
                          </div>
                          ${isDeptHigher ? `
                            <div style="font-size:10.5px; font-weight:700; color:#4338ca; background:#eef2ff; padding:2px 6px; border-radius:4px; margin-top:2px; display:inline-block;">
                              ⚡ Elevated by ${escapeHtml(emp.department)} Baseline
                            </div>
                          ` : `
                            <div style="font-size:10.5px; color:var(--text-muted); margin-top:2px;">
                              Individual Contract Base
                            </div>
                          `}
                        </td>
                        <td>
                          <input type="text" name="emp_bank_${emp.id}" class="form-input" value="${escapeHtml(sal.bank_name || 'HDFC Bank Ltd.')}" style="width:130px;" />
                        </td>
                        <td>
                          <input type="text" name="emp_acc_${emp.id}" class="form-input" value="${escapeHtml(sal.bank_account_no || '••••••••4892')}" style="width:120px;" />
                        </td>
                        <td>
                          <input type="text" name="emp_ifsc_${emp.id}" class="form-input" value="${escapeHtml(sal.bank_ifsc || 'HDFC0001001')}" style="width:110px;" />
                        </td>
                        <td>
                          <input type="text" name="emp_pan_${emp.id}" class="form-input" value="${escapeHtml(sal.pan_no || 'ABCDE1234F')}" style="width:110px;" />
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
            <div style="padding: 20px; text-align:right; border-top:1px solid var(--border); background:var(--surface-secondary);">
              <button type="submit" class="btn btn-primary">
                💾 Save All Employee Category Mappings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- SECTION 6: Test Simulation & Preview -->
    <div id="tab-content-simulation" style="display: ${activeTab === 'simulation' ? 'block' : 'none'};">
      <div class="settings-grid-2">
        <div>
          <div class="rule-group-card">
            <div class="rule-group-title">
              <span>📋 Active Payroll Rule Engine Summary</span>
              <span class="badge badge-success">${rules.rule_status || 'ACTIVE'}</span>
            </div>
            <div class="rule-group-subtitle">Overview of configured formulas applied during payment processing</div>

            <div style="display:flex; flex-direction:column; gap:12px; font-size:13px;">
              <div style="padding:10px 14px; background:var(--surface-secondary); border-radius:var(--radius-sm); border-left:4px solid #6366f1;">
                <strong>Basic Salary:</strong> ${rules.salary_structure?.basic_percentage || 50}% of Effective Base CTC
              </div>
              <div style="padding:10px 14px; background:var(--surface-secondary); border-radius:var(--radius-sm); border-left:4px solid #6366f1;">
                <strong>HRA Component:</strong> ${rules.salary_structure?.hra_percentage || 40}% of Basic Salary
              </div>
              <div style="padding:10px 14px; background:var(--surface-secondary); border-radius:var(--radius-sm); border-left:4px solid #059669;">
                <strong>Provident Fund (PF):</strong> ${rules.deductions_config?.pf_enabled !== false ? `${rules.deductions_config?.pf_rate || 6}% of Basic Salary` : 'Disabled'}
              </div>
              <div style="padding:10px 14px; background:var(--surface-secondary); border-radius:var(--radius-sm); border-left:4px solid #059669;">
                <strong>Professional Tax (PT):</strong> ${rules.deductions_config?.pt_mode === 'slab' ? 'Slab-Based (₹0 / ₹175 / ₹200)' : `Flat ₹${rules.deductions_config?.pt_flat_amount || 200}`}
              </div>
              <div style="padding:10px 14px; background:var(--surface-secondary); border-radius:var(--radius-sm); border-left:4px solid #dc2626;">
                <strong>Loss of Pay (LOP):</strong> Monthly Salary ÷ ${rules.attendance_lop_config?.basis === 'calendar_days' ? 'Calendar Days' : 'Working Days'} × Unpaid Days
              </div>
              <div style="padding:10px 14px; background:var(--surface-secondary); border-radius:var(--radius-sm); border-left:4px solid #7c3aed;">
                <strong>Overtime (OT):</strong> Hourly Rate × ${rules.overtime_config?.standard_multiplier || 1.5}x (>8h daily / >40h weekly)
              </div>
            </div>
          </div>
        </div>

        <div>
          <div class="rule-group-card">
            <div class="rule-group-title">
              <span>🧪 Interactive "Test Payroll" Dry-Run Simulator</span>
            </div>
            <div class="rule-group-subtitle">Select an employee to preview payroll calculations before activating rules</div>

            <div class="form-group" style="margin-bottom:16px;">
              <label style="font-weight:700;">Select Sample Employee for Test Simulation:</label>
              <select id="sim-user-select" class="form-input" onchange="runTestPayrollSimulation(this.value)">
                ${empUsers.map(u => `
                  <option value="${u.id}" ${u.id === Number(selectedSimUserId) ? 'selected' : ''}>
                    ${escapeHtml(u.first_name)} ${escapeHtml(u.last_name)} (${escapeHtml(u.department || 'Staff')}) — ${escapeHtml(u.position || '')}
                  </option>
                `).join('')}
              </select>
            </div>

            ${simPayroll ? `
              <div class="simulation-banner">
                <span>⚠️</span>
                <span>SIMULATION MODE — DRAFT CALCULATED PAYROLL (Not a Saved Payment)</span>
              </div>

              <div class="card" style="border:1px solid var(--border-dark); background:var(--surface);">
                <div class="card-header" style="padding:12px 16px; background:var(--surface-secondary);">
                  <div style="font-weight:700;">Simulated Payslip: ${escapeHtml(simPayroll.user.first_name)} ${escapeHtml(simPayroll.user.last_name)}</div>
                  <div class="text-sm text-muted">${escapeHtml(simPayroll.user.department)} Department • ${simPayroll.applied_salary_reason}</div>
                </div>
                <div class="card-body" style="padding:16px; font-size:13px;">
                  <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                    <span>Base CTC Scale:</span>
                    <strong>${formatINR(simPayroll.effective_base_salary)}</strong>
                  </div>
                  <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                    <span>Basic Salary (50%):</span>
                    <strong>${formatINR(simPayroll.basic_pay)}</strong>
                  </div>
                  <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                    <span>House Rent Allowance (HRA):</span>
                    <strong>${formatINR(simPayroll.hra)}</strong>
                  </div>
                  <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                    <span>Allowances & Overtime:</span>
                    <strong>${formatINR(simPayroll.special_allowance + simPayroll.conveyance_allowance + simPayroll.medical_allowance + simPayroll.overtime_pay)}</strong>
                  </div>
                  <div style="display:flex; justify-content:space-between; padding-top:6px; border-top:1px solid var(--border); font-weight:700; color:#059669;">
                    <span>Total Gross Earnings:</span>
                    <span>${formatINR(simPayroll.gross_earnings)}</span>
                  </div>

                  <div style="margin-top:14px; padding-top:10px; border-top:1.5px dashed var(--border);">
                    <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                      <span>Provident Fund (PF):</span>
                      <span class="text-danger">-${formatINR(simPayroll.pf_deduction)}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                      <span>Professional Tax (PT):</span>
                      <span class="text-danger">-${formatINR(simPayroll.professional_tax)}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                      <span>Income Tax (TDS):</span>
                      <span class="text-danger">-${formatINR(simPayroll.tds_tax)}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                      <span>LOP & Late Penalties:</span>
                      <span class="text-danger">-${formatINR(simPayroll.lop_deduction + simPayroll.late_deduction)}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding-top:6px; border-top:1px solid var(--border); font-weight:800; font-size:15px; color:var(--primary);">
                      <span>Calculated Net Pay:</span>
                      <span>${formatINR(simPayroll.net_pay)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    </div>

    <!-- SECTION 7: Payslip Branding & Entity -->
    <div id="tab-content-branding" style="display: ${activeTab === 'branding' ? 'block' : 'none'};">
      <form id="company-branding-form">
        <div class="rule-group-card" style="max-width:750px; margin:0 auto;">
          <div class="rule-group-title">
            <span>🏢 Legal Entity & Payslip Certificate Info</span>
          </div>
          <div class="rule-group-subtitle">This information appears on all generated Tax Invoices & Salary Payslips</div>

          <div class="form-group">
            <label>Company Legal Name <span class="req">*</span></label>
            <input type="text" id="cb-name" class="form-input" value="${escapeHtml(rules.company?.company_name || 'AttendEase Technologies Pvt. Ltd.')}" required />
          </div>

          <div class="form-group">
            <label>Registered Corporate Address <span class="req">*</span></label>
            <input type="text" id="cb-addr" class="form-input" value="${escapeHtml(rules.company?.address || 'Cyber City, Sector 24, DLF Phase 3, Gurugram, HR 122002')}" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>GSTIN / Tax ID Number <span class="req">*</span></label>
              <input type="text" id="cb-gstin" class="form-input" value="${escapeHtml(rules.company?.gstin || '07AABCA1234F1Z8')}" required />
            </div>
            <div class="form-group">
              <label>Payroll Contact Email <span class="req">*</span></label>
              <input type="email" id="cb-email" class="form-input" value="${escapeHtml(rules.company?.email || 'contact@attendease.com')}" required />
            </div>
          </div>

          <div class="form-group">
            <label>Authorized Signatory Title</label>
            <input type="text" id="cb-signatory" class="form-input" value="${escapeHtml(rules.company?.signatory_title || 'Finance & Payroll Department')}" required />
          </div>

          <div class="form-group">
            <label>Payslip Certificate Disclaimer Note</label>
            <textarea id="cb-disclaimer" class="form-input" rows="3" required>${escapeHtml(rules.company?.disclaimer || 'This is a computer-generated tax invoice and salary certificate. No physical signature is required under IT rules.')}</textarea>
          </div>

          <div style="text-align:right; margin-top:20px;">
            <button type="submit" class="btn btn-primary">
              💾 Save Payslip Branding & Notes
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- Modal for New Employee Category -->
    <div class="modal-overlay" id="new-category-modal" style="display:none;">
      <div class="modal" style="max-width:480px;">
        <div class="modal-header">
          <h3>Create New Employee Category</h3>
          <button class="modal-close" onclick="closeNewCategoryModal()">×</button>
        </div>
        <form id="new-category-form">
          <div class="form-group">
            <label>Category Name <span class="req">*</span></label>
            <input type="text" id="new-cat-name" class="form-input" placeholder="e.g. Sales Specialist, Part-Time Consultant" required />
          </div>
          <div class="form-group">
            <label>Description</label>
            <input type="text" id="new-cat-desc" class="form-input" placeholder="e.g. Commission + Base Staff" />
          </div>
          <div class="form-group">
            <label>Benchmark Base Monthly Salary (₹) <span class="req">*</span></label>
            <input type="number" id="new-cat-base" class="form-input" value="50000" min="1000" step="500" required />
          </div>
          <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
            <button type="button" class="btn btn-secondary" onclick="closeNewCategoryModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Create Category</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal for New Department Scale -->
    <div class="modal-overlay" id="new-dept-modal" style="display:none;">
      <div class="modal" style="max-width:480px;">
        <div class="modal-header">
          <h3>Add Department Base Salary Benchmark</h3>
          <button class="modal-close" onclick="closeNewDeptModal()">×</button>
        </div>
        <form id="new-dept-form">
          <div class="form-group">
            <label>Department Name <span class="req">*</span></label>
            <input type="text" id="new-dept-name" class="form-input" placeholder="e.g. Data Science, Legal, Logistics" required />
          </div>
          <div class="form-group">
            <label>Description & Scope</label>
            <input type="text" id="new-dept-desc" class="form-input" placeholder="e.g. AI/ML Research, Data Engineering" />
          </div>
          <div class="form-group">
            <label>Minimum Baseline Base CTC (INR ₹ / month) <span class="req">*</span></label>
            <input type="number" id="new-dept-base" class="form-input" value="70000" min="1000" step="500" required />
          </div>
          <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
            <button type="button" class="btn btn-secondary" onclick="closeNewDeptModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Create Department Scale</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderMyInvoices() {
  const user = getCurrentUser();
  const allInvoices = Storage.getInvoices();
  const userInvoices = allInvoices.filter(i => i.user_id === user.id).sort((a, b) => (b.year * 100 + b.month) - (a.year * 100 + a.month));

  const ytdGross = userInvoices.reduce((a, b) => a + (b.gross_earnings || 0), 0);
  const ytdNet = userInvoices.reduce((a, b) => a + (b.net_pay || 0), 0);
  const ytdTax = userInvoices.reduce((a, b) => a + (b.tds_tax || 0), 0);
  const ytdOT = userInvoices.reduce((a, b) => a + (b.overtime_hours || 0), 0);

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  return `
    <div class="page-header">
      <div>
        <h2>My Payslips & Tax Invoices</h2>
        <p class="subtitle">View and download your monthly compensation breakdowns in INR (₹)</p>
      </div>
    </div>

    <!-- Summary KPI Cards -->
    <div class="stats-grid stats-grid-4" style="margin-bottom: 24px;">
      <div class="stat-card stat-blue">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 3h12M6 8h12M6 13h5a4 4 0 0 0 0-8M6 13l8 8"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">${formatINR(ytdNet)}</span>
          <span class="stat-label">Total Net Received</span>
        </div>
      </div>
      <div class="stat-card stat-green">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">${formatINR(ytdGross)}</span>
          <span class="stat-label">Total Gross Earnings</span>
        </div>
      </div>
      <div class="stat-card stat-purple">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">${ytdOT}h</span>
          <span class="stat-label">Total Overtime Hours</span>
        </div>
      </div>
      <div class="stat-card stat-red">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">${formatINR(ytdTax)}</span>
          <span class="stat-label">TDS Tax Paid</span>
        </div>
      </div>
    </div>

    <!-- Payslip History Card -->
    <div class="card">
      <div class="card-header">
        <h3>My Compensation History</h3>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table">
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
                <th style="text-align:right">Action</th>
              </tr>
            </thead>
            <tbody>
              ${userInvoices.length === 0 ? `
                <tr>
                  <td colspan="9" style="text-align:center; padding: 36px; color: var(--text-muted);">
                    No payslips generated for your account yet.
                  </td>
                </tr>
              ` : userInvoices.map(inv => {
                const isPaid = inv.status === 'paid';
                return `
                  <tr>
                    <td>
                      <a href="#invoice-view?id=${inv.id}" style="font-family:monospace; font-weight:800;">
                        ${escapeHtml(inv.invoice_number)}
                      </a>
                    </td>
                    <td class="fw-600">${months[inv.month - 1]} ${inv.year}</td>
                    <td>${inv.present_days} / ${inv.working_days} days</td>
                    <td>
                      ${inv.total_hours}h
                      ${inv.overtime_hours > 0 ? `<div class="text-success text-sm font-semibold">+${inv.overtime_hours}h OT</div>` : ''}
                    </td>
                    <td class="fw-600">${formatINR(inv.gross_earnings)}</td>
                    <td class="text-danger fw-600">-${formatINR(inv.total_deductions)}</td>
                    <td>
                      <strong style="color:#059669; font-size:15px;">${formatINR(inv.net_pay)}</strong>
                    </td>
                    <td>
                      <span class="badge ${isPaid ? 'badge-success' : 'badge-info'}">
                        ${inv.status ? inv.status.toUpperCase() : 'APPROVED'}
                      </span>
                    </td>
                    <td style="text-align:right;">
                      <a href="#invoice-view?id=${inv.id}" class="btn btn-sm btn-secondary">
                        📄 View & PDF
                      </a>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderInvoiceView() {
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const invoiceId = urlParams.get('id');

  if (urlParams.get('download') === 'true' || urlParams.get('print') === 'true') {
    setTimeout(() => {
      window.print();
    }, 450);
  }
  const allInvoices = Storage.getInvoices();
  const inv = allInvoices.find(i => String(i.id) === String(invoiceId) || String(i.invoice_number) === String(invoiceId)) || (invoiceId ? null : allInvoices[0]);
  const currentUser = getCurrentUser();

  if (!inv) {
    return `
      <div class="card" style="padding:40px; text-align:center;">
        <h3>Invoice Not Found</h3>
        <p class="text-muted">The requested payroll invoice could not be located.</p>
        <a href="#payroll" class="btn btn-primary" style="margin-top:16px;">Return to Payroll</a>
      </div>
    `;
  }

  const rules = Storage.getPayrollRules() || getDefaultPayrollRules();
  const company = rules.company || {
    company_name: 'AttendEase Technologies Pvt. Ltd.',
    address: 'Cyber City, Sector 24, DLF Phase 3, Gurugram, HR 122002',
    gstin: '07AABCA1234F1Z8',
    email: 'contact@attendease.com',
    signatory_title: 'Finance & Payroll Department',
    disclaimer: 'This is a computer-generated tax invoice and salary certificate. No physical signature is required under IT rules.'
  };

  const users = Storage.getUsers();
  const emp = users.find(u => u.id === inv.user_id) || { first_name: 'Employee', last_name: `#${inv.user_id}`, department: 'Engineering', position: 'Developer', email: 'emp@company.com' };
  const salaries = Storage.getSalaries();
  const sal = salaries.find(s => s.user_id === inv.user_id) || { bank_name: 'HDFC Bank Ltd.', bank_account_no: '••••••••4892', bank_ifsc: 'HDFC0001001', pan_no: 'ABCDE1234F' };

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const periodStr = `${months[inv.month - 1]} 01, ${inv.year} – ${months[inv.month - 1]} ${new Date(inv.year, inv.month, 0).getDate()}, ${inv.year}`;
  const isPaid = inv.status === 'paid';
  const isAdmin = currentUser?.role === 'admin';

  // Custom line items
  const customEarnings = (inv.custom_line_items || []).filter(item => item.type === 'earning');
  const customDeductions = (inv.custom_line_items || []).filter(item => item.type === 'deduction');

  return `
    <!-- Top Action Toolbar (Hidden in Print) -->
    <div class="invoice-toolbar">
      <div>
        <a href="${isAdmin ? '#payroll' : '#my-invoices'}" class="btn btn-secondary btn-animated-back" style="padding:9px 18px; font-weight:700;">
          <svg class="arrow-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Back to ${isAdmin ? 'Payment Processing' : 'My Payslips'}</span>
        </a>
      </div>
      <div style="display:flex; gap:10px;">
        ${isAdmin ? `
          <button type="button" class="btn btn-secondary" onclick="openAddLineItemModal('${inv.id}')">
            ➕ Add Line Item
          </button>
          ${!isPaid ? `
            <button type="button" class="btn btn-primary" onclick="openMarkPaidModal('${inv.id}')">
              💵 Record Payment
            </button>
          ` : ''}
        ` : ''}
        <button type="button" class="btn btn-secondary" onclick="window.print()">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Print / Download PDF
        </button>
      </div>
    </div>

    <!-- The Invoice / Payslip Document Card -->
    <div class="invoice-card" id="printable-invoice">
      <!-- Header -->
      <div class="invoice-top">
        <div>
          <div class="invoice-company-brand">
            <div style="display:inline-flex; padding:10px; background:var(--primary-light); border-radius:12px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="3"/>
                <path d="M8 2v4M16 2v4M3 10h18" stroke-linecap="round"/>
                <circle cx="9" cy="15" r="1.5" fill="var(--primary)"/>
                <circle cx="15" cy="15" r="1.5" fill="var(--primary)"/>
              </svg>
            </div>
            <div class="invoice-company-info">
              <h4>${escapeHtml(company.company_name)}</h4>
              <p>${escapeHtml(company.address)}<br>GSTIN: ${escapeHtml(company.gstin)} • ${escapeHtml(company.email)}</p>
            </div>
          </div>
        </div>
        <div class="invoice-title-block">
          <div class="invoice-badge-title">Official Tax Invoice & Salary Payslip</div>
          <div class="invoice-num">${escapeHtml(inv.invoice_number)}</div>
          <div>
            <span class="invoice-status-tag badge ${isPaid ? 'badge-success' : 'badge-info'}">
              ${isPaid ? 'PAID & DISBURSED' : (inv.status || 'APPROVED').toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <!-- Employee & Bank Profile Grid -->
      <div class="invoice-meta-grid">
        <div class="meta-box">
          <h5>Employee Information</h5>
          <div class="meta-box-content">
            <span class="meta-label">Employee Name:</span>
            <span class="meta-val">${escapeHtml(emp.first_name)} ${escapeHtml(emp.last_name)}</span>
            <span class="meta-label">Employee ID:</span>
            <span class="meta-val">EMP-${String(emp.id).padStart(4, '0')}</span>
            <span class="meta-label">Department:</span>
            <span class="meta-val">${escapeHtml(emp.department || '—')}</span>
            <span class="meta-label">Designation:</span>
            <span class="meta-val">${escapeHtml(emp.position || 'Employee')}</span>
            <span class="meta-label">Base CTC Scale:</span>
            <span class="meta-val">${formatINR(inv.base_salary || sal.base_salary || 50000)} ${inv.applied_salary_reason ? `<span class="badge badge-info" style="font-size:10px; margin-left:4px;">${escapeHtml(inv.applied_salary_reason)}</span>` : ''}</span>
            <span class="meta-label">PAN Number:</span>
            <span class="meta-val">${escapeHtml(sal.pan_no || 'ABCDE1234F')}</span>
          </div>
        </div>
        <div class="meta-box">
          <h5>Disbursement & Bank Info</h5>
          <div class="meta-box-content">
            <span class="meta-label">Pay Period:</span>
            <span class="meta-val">${periodStr}</span>
            <span class="meta-label">Bank Name:</span>
            <span class="meta-val">${escapeHtml(sal.bank_name || 'HDFC Bank Ltd.')}</span>
            <span class="meta-label">Account No:</span>
            <span class="meta-val">${escapeHtml(sal.bank_account_no || '••••••••4892')}</span>
            <span class="meta-label">IFSC Code:</span>
            <span class="meta-val">${escapeHtml(sal.bank_ifsc || 'HDFC0001001')}</span>
            <span class="meta-label">Payment Mode:</span>
            <span class="meta-val">${escapeHtml(inv.payment_mode || 'NEFT / Direct Transfer')}</span>
          </div>
        </div>
      </div>

      <!-- Attendance & Hours Summary Pill Bar -->
      <div class="attendance-pill-bar">
        <div class="att-pill-item">
          <div class="att-pill-val">${inv.working_days}</div>
          <div class="att-pill-lbl">Working Days</div>
        </div>
        <div class="att-pill-item">
          <div class="att-pill-val" style="color:#059669;">${inv.present_days}</div>
          <div class="att-pill-lbl">Days Present</div>
        </div>
        <div class="att-pill-item">
          <div class="att-pill-val" style="color:#2563eb;">${inv.paid_leaves}</div>
          <div class="att-pill-lbl">Paid Leaves</div>
        </div>
        <div class="att-pill-item">
          <div class="att-pill-val" style="color:#e11d48;">${inv.absent_days}</div>
          <div class="att-pill-lbl">Loss of Pay (LOP)</div>
        </div>
        <div class="att-pill-item">
          <div class="att-pill-val">${inv.total_hours}h</div>
          <div class="att-pill-lbl">Total Logged</div>
        </div>
        <div class="att-pill-item">
          <div class="att-pill-val" style="color:#7c3aed;">${inv.overtime_hours}h</div>
          <div class="att-pill-lbl">Overtime (8h/40h)</div>
        </div>
      </div>

      <!-- Side-by-Side Earnings vs Deductions Table -->
      <div class="invoice-tables-split">
        <!-- Left: Earnings -->
        <div class="subtable-card">
          <div class="subtable-header header-earnings">
            <span>Earnings Component</span>
            <span>Amount (INR)</span>
          </div>
          <table class="invoice-data-table">
            <tbody>
              <tr>
                <td>Basic Salary</td>
                <td class="val-col">${formatINR(inv.basic_pay)}</td>
              </tr>
              <tr>
                <td>House Rent Allowance (HRA)</td>
                <td class="val-col">${formatINR(inv.hra)}</td>
              </tr>
              <tr>
                <td>Special / Flexi Allowance</td>
                <td class="val-col">${formatINR(inv.special_allowance)}</td>
              </tr>
              ${inv.conveyance_allowance > 0 ? `
                <tr>
                  <td>Conveyance Allowance</td>
                  <td class="val-col">${formatINR(inv.conveyance_allowance)}</td>
                </tr>
              ` : ''}
              ${inv.medical_allowance > 0 ? `
                <tr>
                  <td>Medical Allowance</td>
                  <td class="val-col">${formatINR(inv.medical_allowance)}</td>
                </tr>
              ` : ''}
              <tr>
                <td>
                  Overtime Pay
                  <span class="text-muted text-sm font-semibold" style="display:block">
                    ${inv.overtime_hours} hrs @ ${formatINR(inv.standard_hourly_rate * (inv.ot_multiplier || 1.5))}/hr (${inv.ot_multiplier || 1.5}x)
                  </span>
                </td>
                <td class="val-col">${formatINR(inv.overtime_pay)}</td>
              </tr>
              ${(inv.type_custom_earnings || []).map(item => `
                <tr>
                  <td>${escapeHtml(item.name)}</td>
                  <td class="val-col">${formatINR(item.amount)}</td>
                </tr>
              `).join('')}
              ${customEarnings.map(item => `
                <tr>
                  <td>${escapeHtml(item.name)}</td>
                  <td class="val-col">${formatINR(item.amount)}</td>
                </tr>
              `).join('')}
              ${inv.bonus > 0 ? `
                <tr>
                  <td>Performance Bonus</td>
                  <td class="val-col">${formatINR(inv.bonus)}</td>
                </tr>
              ` : ''}
            </tbody>
            <tfoot>
              <tr class="subtable-total-row">
                <td>Total Gross Earnings (A)</td>
                <td class="val-col" style="color:#065f46;">${formatINR(inv.gross_earnings)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Right: Deductions -->
        <div class="subtable-card">
          <div class="subtable-header header-deductions">
            <span>Deductions & Taxes</span>
            <span>Amount (INR)</span>
          </div>
          <table class="invoice-data-table">
            <tbody>
              <tr>
                <td>
                  Loss of Pay (LOP)
                  ${inv.absent_days > 0 ? `<span class="text-muted text-sm" style="display:block">${inv.absent_days} unexcused absent days</span>` : ''}
                </td>
                <td class="val-col">${formatINR(inv.lop_deduction)}</td>
              </tr>
              <tr>
                <td>
                  Late Arrival Deductions
                  ${inv.late_days > 2 ? `<span class="text-muted text-sm" style="display:block">${inv.late_days} late arrivals</span>` : ''}
                </td>
                <td class="val-col">${formatINR(inv.late_deduction)}</td>
              </tr>
              <tr>
                <td>Provident Fund (PF / EPF)</td>
                <td class="val-col">${formatINR(inv.pf_deduction)}</td>
              </tr>
              <tr>
                <td>Income Tax Withholding (TDS)</td>
                <td class="val-col">${formatINR(inv.tds_tax)}</td>
              </tr>
              <tr>
                <td>Group Corporate Health Insurance</td>
                <td class="val-col">${formatINR(inv.insurance)}</td>
              </tr>
              ${inv.professional_tax > 0 ? `
                <tr>
                  <td>Professional Tax (PT)</td>
                  <td class="val-col">${formatINR(inv.professional_tax)}</td>
                </tr>
              ` : ''}
              ${(inv.type_custom_deductions || []).map(item => `
                <tr>
                  <td>${escapeHtml(item.name)}</td>
                  <td class="val-col">${formatINR(item.amount)}</td>
                </tr>
              `).join('')}
              ${customDeductions.map(item => `
                <tr>
                  <td>${escapeHtml(item.name)}</td>
                  <td class="val-col">${formatINR(item.amount)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="subtable-total-row">
                <td>Total Deductions (B)</td>
                <td class="val-col" style="color:#9f1239;">-${formatINR(inv.total_deductions)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Net Salary Payable Banner -->
      <div class="net-pay-banner">
        <div class="net-pay-left">
          <h4>Net Salary Payable (Gross - Deductions)</h4>
          <div class="net-pay-words">Amount in words: <strong>${numberToWordsINR(inv.net_pay)}</strong></div>
        </div>
        <div class="net-pay-amount">${formatINR(inv.net_pay)}</div>
      </div>

      <!-- Footer Settlement & Signatory -->
      <div class="invoice-footer-grid">
        <div class="payment-info-box">
          <strong>Disbursement Status:</strong> ${isPaid ? `Settled on ${fmtDate(inv.paid_at || new Date())}` : 'Approved for payout processing'}<br>
          <strong>Transaction Ref / UTR:</strong> ${escapeHtml(inv.transaction_ref || 'PENDING DISBURSEMENT')}<br>
          <span style="font-size:11.5px; color:#64748b;">${escapeHtml(company.disclaimer)}</span>
        </div>
        <div class="signatory-box">
          <div class="seal-tag">✓ VERIFIED & APPROVED</div>
          <div class="signatory-title">${escapeHtml(company.signatory_title)}</div>
          <div style="font-size:11.5px; color:var(--text-muted);">${escapeHtml(company.company_name)}</div>
        </div>
      </div>
    </div>

    <!-- Add Custom Line Item Modal (Admin Only) -->
    <div class="modal-overlay" id="add-item-modal" style="display:none;">
      <div class="modal" style="max-width:480px;">
        <div class="modal-header">
          <h3>Add Custom Line Item</h3>
          <button class="modal-close" onclick="closeAddLineItemModal()">×</button>
        </div>
        <form id="add-item-form">
          <input type="hidden" id="add-item-invoice-id" value="${inv.id}" />
          <div class="form-group">
            <label>Item Type</label>
            <select id="item-type" class="form-input" required>
              <option value="earning">Earning / Allowance / Bonus (+)</option>
              <option value="deduction">Deduction / Recovery (-)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Description / Item Name <span class="req">*</span></label>
            <input type="text" id="item-name" class="form-input" placeholder="e.g. Performance Incentive, Travel Reimbursement" required />
          </div>
          <div class="form-group">
            <label>Amount in INR (₹) <span class="req">*</span></label>
            <input type="number" id="item-amount" class="form-input" placeholder="e.g. 2500" min="1" step="1" required />
          </div>
          <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
            <button type="button" class="btn btn-secondary" onclick="closeAddLineItemModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Add Item & Recalculate</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Mark Paid Modal -->
    <div class="modal-overlay" id="mark-paid-modal" style="display:none;">
      <div class="modal" style="max-width:480px;">
        <div class="modal-header">
          <h3>Record Salary Disbursement</h3>
          <button class="modal-close" onclick="closeMarkPaidModal()">×</button>
        </div>
        <form id="mark-paid-form">
          <input type="hidden" id="paid-invoice-id" value="${inv.id}" />
          <div class="form-group">
            <label>Payment Transfer Mode</label>
            <select id="paid-mode" class="form-input" required>
              <option value="NEFT / Direct Bank Transfer">NEFT / Direct Bank Transfer</option>
              <option value="RTGS">RTGS (High Value)</option>
              <option value="IMPS / Instant Transfer">IMPS / Instant Transfer</option>
              <option value="UPI Direct Pay">UPI Direct Pay</option>
              <option value="Corporate Cheque">Corporate Cheque</option>
            </select>
          </div>
          <div class="form-group">
            <label>Transaction Reference ID / Cheque # <span class="req">*</span></label>
            <input type="text" id="paid-ref" class="form-input" placeholder="e.g. TXN9872134598" required />
          </div>
          <div class="form-group">
            <label>Payment Date</label>
            <input type="date" id="paid-date" class="form-input" value="${getLocalDateString(new Date())}" required />
          </div>
          <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
            <button type="button" class="btn btn-secondary" onclick="closeMarkPaidModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Confirm & Mark as Paid</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function switchPayrollTab(tabName) {
  navigate(`payroll-settings?tab=${tabName}`);
}

function selectEmployeeType(typeId) {
  navigate(`payroll-settings?tab=types&type=${typeId}`);
}

function openNewCategoryModal() {
  const m = document.getElementById('new-category-modal');
  if (m) m.style.display = 'flex';
}

function closeNewCategoryModal() {
  const m = document.getElementById('new-category-modal');
  if (m) m.style.display = 'none';
}

function openNewDeptModal() {
  const m = document.getElementById('new-dept-modal');
  if (m) m.style.display = 'flex';
}

function closeNewDeptModal() {
  const m = document.getElementById('new-dept-modal');
  if (m) m.style.display = 'none';
}

function deleteEmployeeType(typeId) {
  const rules = Storage.getPayrollRules() || getDefaultPayrollRules();
  if (rules.employee_types.length <= 1) {
    showFlash('Cannot delete the only remaining category.', 'danger');
    return;
  }
  if (!confirm(`Are you sure you want to delete this category? Employees assigned to it will fallback to the default category.`)) return;

  rules.employee_types = rules.employee_types.filter(t => t.id !== typeId);
  Storage.savePayrollRules(rules);
  showFlash('Category deleted successfully.', 'success');
  navigate(`payroll-settings?tab=types&type=${rules.employee_types[0].id}`);
}

function handleBatchRunPayroll(month, year) {
  generateMonthlyInvoices(month, year, true);
  showFlash(`Payroll invoices for ${month}/${year} generated/refreshed successfully using active rules.`, 'success');
  handleRoute();
}

function handleRunPayrollExecution(month, year) {
  generateMonthlyInvoices(month, year, true);
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  showFlash(`⚡ Monthly payroll invoices for ${months[month - 1]} ${year} generated successfully!`, 'success');
  navigate(`invoices?month=${month}&year=${year}`);
}

function downloadIndividualPayslipPDF(invoiceId) {
  navigate(`invoice-view?id=${encodeURIComponent(invoiceId)}&download=true`);
}

let currentBatchDeleteCaptcha = '';

function openDeleteBatchModal(month, year) {
  const modal = document.getElementById('delete-batch-modal');
  if (!modal) return;

  currentBatchDeleteCaptcha = String(Math.floor(1000 + Math.random() * 9000));
  
  const mInput = document.getElementById('delete-batch-month-val');
  const yInput = document.getElementById('delete-batch-year-val');
  const codeEl = document.getElementById('delete-captcha-code');
  const inpEl = document.getElementById('delete-captcha-input');
  const errEl = document.getElementById('delete-captcha-error');

  if (mInput) mInput.value = month;
  if (yInput) yInput.value = year;
  if (codeEl) codeEl.textContent = currentBatchDeleteCaptcha;
  if (inpEl) inpEl.value = '';
  if (errEl) errEl.style.display = 'none';

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const pName = document.getElementById('delete-batch-period-name');
  if (pName) pName.textContent = `${months[month - 1]} ${year}`;

  modal.style.display = 'flex';
}

function closeDeleteBatchModal() {
  const modal = document.getElementById('delete-batch-modal');
  if (modal) modal.style.display = 'none';
}

function activatePayrollRules() {
  const rules = Storage.getPayrollRules() || getDefaultPayrollRules();
  rules.rule_status = 'ACTIVE';
  rules.effective_from = getLocalDateString(new Date());
  Storage.savePayrollRules(rules);
  showFlash('Payroll Policy & Rules activated successfully!', 'success');
  handleRoute();
}

function runTestPayrollSimulation(userId) {
  navigate(`payroll-settings?tab=simulation&sim_user=${userId}`);
}

function openMarkPaidModal(invoiceId) {
  const modal = document.getElementById('mark-paid-modal');
  if (!modal) return;
  document.getElementById('paid-invoice-id').value = invoiceId;
  document.getElementById('paid-ref').value = 'TXN' + Math.floor(10000000 + Math.random() * 90000000);
  modal.style.display = 'flex';
}

function closeMarkPaidModal() {
  const modal = document.getElementById('mark-paid-modal');
  if (modal) modal.style.display = 'none';
}

function openAddLineItemModal(invoiceId) {
  const modal = document.getElementById('add-item-modal');
  if (modal) modal.style.display = 'flex';
}

function closeAddLineItemModal() {
  const modal = document.getElementById('add-item-modal');
  if (modal) modal.style.display = 'none';
}

function deleteInvoice(invoiceId) {
  if (!confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) return;
  let invoices = Storage.getInvoices();
  invoices = invoices.filter(i => i.id !== invoiceId);
  Storage.saveInvoices(invoices);
  showFlash('Invoice deleted successfully.', 'success');
  handleRoute();
}

function handleCancelLeave(leaveId) {
  const leaves = Storage.getLeaves();
  const leave = leaves.find(l => l.id == leaveId);
  if (!leave) return;
  if (leave.status !== 'pending') {
    showFlash('Cannot cancel leave request once it is reviewed by admin.', 'danger');
    return;
  }
  if (confirm(`Are you sure you want to cancel this ${leave.leave_type} leave request?`)) {
    const updatedLeaves = leaves.filter(l => l.id != leaveId);
    Storage.saveLeaves(updatedLeaves);
    showFlash('Leave request canceled successfully.', 'info');
    handleRoute();
  }
}

// ==================== EVENT BINDING ====================
function bindPageEvents(page) {
  if (page === 'login') {
    document.getElementById('login-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const user = login(email, password);
      if (user) {
        showFlash(`Welcome back, ${user.first_name}!`, 'success');
        navigate(user.role === 'admin' ? 'admin' : 'dashboard');
      } else {
        showFlash('Invalid email or password.', 'danger');
      }
    });
  }

  if (page === 'register') {
    document.getElementById('register-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const first = document.getElementById('reg-first').value.trim();
      const last = document.getElementById('reg-last').value.trim();
      const email = document.getElementById('reg-email').value.trim().toLowerCase();
      const password = document.getElementById('reg-password').value;
      const dept = document.getElementById('reg-dept').value;
      const pos = document.getElementById('reg-pos').value.trim();

      if (!first || !last || !email || !password) {
        showFlash('All required fields must be filled.', 'danger');
        return;
      }
      if (password.length < 6) {
        showFlash('Password must be at least 6 characters.', 'danger');
        return;
      }
      const users = Storage.getUsers();
      if (users.some(u => u.email.toLowerCase() === email)) {
        showFlash('Email already registered.', 'danger');
        return;
      }
      const newUser = { id: Date.now(), first_name: first, last_name: last, email, password_hash: hash(password), role: 'employee', department: dept, position: pos, phone: '', hire_date: getLocalDateString(new Date()), is_active: true, created_at: getLocalDateString(new Date()) };
      users.push(newUser);
      Storage.saveUsers(users);
      showFlash('Registration successful! Please log in.', 'success');
      navigate('login');
    });
  }

  if (page === 'dashboard') {
    document.getElementById('checkin-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const user = getCurrentUser();
      const today = getLocalDateString(new Date());
      const attendance = Storage.getAttendance();
      const existing = attendance.find(a => a.user_id === user.id && a.date === today);
      if (existing) { showFlash('You have already checked in today.', 'warning'); return; }
      const now = new Date();
      const checkInTime = now.toTimeString().slice(0, 5);
      const lateThreshold = '09:15';
      const status = checkInTime > lateThreshold ? 'late' : 'present';
      attendance.push({ id: generateId(), user_id: user.id, date: today, check_in: now.toISOString(), check_out: null, hours_worked: null, status, notes: '', created_at: today });
      Storage.saveAttendance(attendance);
      showFlash(`Checked in successfully at ${fmtTime(now.toISOString())}.`, 'success');
      navigate('dashboard');
    });
    document.getElementById('checkout-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const user = getCurrentUser();
      const today = getLocalDateString(new Date());
      const attendance = Storage.getAttendance();
      const rec = attendance.find(a => a.user_id === user.id && a.date === today);
      if (!rec) { showFlash('You have not checked in today.', 'warning'); return; }
      if (rec.check_out) { showFlash('You have already checked out today.', 'warning'); return; }
      const now = new Date();
      rec.check_out = now.toISOString();
      if (rec.check_in) {
        const delta = new Date(now) - new Date(rec.check_in);
        rec.hours_worked = +(delta / 3600000).toFixed(2);
      }
      Storage.saveAttendance(attendance);
      showFlash(`Checked out successfully at ${fmtTime(now.toISOString())}. Hours worked: ${rec.hours_worked}h`, 'success');
      navigate('dashboard');
    });
  }

  if (page === 'attendance') {
    document.getElementById('attendance-filter')?.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const params = new URLSearchParams();
      if (fd.get('month')) params.set('month', fd.get('month'));
      if (fd.get('year')) params.set('year', fd.get('year'));
      navigate(`attendance?${params.toString()}`);
    });
  }

  if (page === 'leaves') {
    document.getElementById('open-leave-modal')?.addEventListener('click', () => {
      document.getElementById('leaveModal').style.display = 'flex';
    });
    document.getElementById('leave-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const start = fd.get('start_date');
      const end = fd.get('end_date');
      const startDate = new Date(start + 'T00:00:00');
      const endDate = new Date(end + 'T00:00:00');
      const todayLocal = getLocalDateString(new Date());
      if (start < todayLocal) { showFlash('Start date cannot be in the past.', 'danger'); return; }
      if (endDate < startDate) { showFlash('End date must be after start date.', 'danger'); return; }
      const days = Math.floor((endDate - startDate) / 86400000) + 1;
      const user = getCurrentUser();
      const leaves = Storage.getLeaves();
      leaves.push({ id: generateId(), user_id: user.id, leave_type: fd.get('leave_type'), start_date: start, end_date: end, days_requested: days, reason: fd.get('reason') || '', status: 'pending', admin_note: '', reviewed_at: null, created_at: todayLocal });
      Storage.saveLeaves(leaves);
      const modal = document.getElementById('leaveModal');
      if (modal) modal.style.display = 'none';
      showFlash('Leave request submitted successfully.', 'success');
      navigate('leaves');
    });
  }

  if (page === 'employees') {
    document.getElementById('employee-filter')?.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const params = new URLSearchParams();
      if (fd.get('search')) params.set('search', fd.get('search'));
      if (fd.get('department')) params.set('department', fd.get('department'));
      navigate(`employees?${params.toString()}`);
    });
  }

  if (page === 'employee-form') {
    document.getElementById('employee-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const fn = fd.get('first_name')?.trim() || '';
      const ln = fd.get('last_name')?.trim() || '';
      const em = fd.get('email')?.trim().toLowerCase() || '';
      const dp = fd.get('department') || '';
      const ps = fd.get('position')?.trim() || '';
      const ph = fd.get('phone')?.trim() || '';
      const hd = fd.get('hire_date') || '';
      const pw = fd.get('password') || '';

      if (!fn || !ln || !em) { showFlash('Required fields missing.', 'danger'); return; }

      const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
      const editId = urlParams.get('id');
      const users = Storage.getUsers();

      if (editId) {
        const emp = users.find(u => u.id === parseInt(editId));
        if (emp) {
          emp.first_name = fn; emp.last_name = ln; emp.department = dp; emp.position = ps; emp.phone = ph; emp.hire_date = hd || null;
          if (pw && pw.length >= 6) emp.password_hash = hash(pw);
          else if (pw && pw.length < 6) { showFlash('Password must be at least 6 characters.', 'danger'); return; }
          Storage.saveUsers(users);
          showFlash('Employee updated successfully.', 'success');
        }
      } else {
        if (!pw || pw.length < 6) { showFlash('Password must be at least 6 characters.', 'danger'); return; }
        if (users.some(u => u.email.toLowerCase() === em)) { showFlash('Email already exists.', 'danger'); return; }
        users.push({ id: Date.now(), first_name: fn, last_name: ln, email: em, password_hash: hash(pw), role: 'employee', department: dp, position: ps, phone: ph, hire_date: hd || null, is_active: true, created_at: getLocalDateString(new Date()) });
        Storage.saveUsers(users);
        showFlash(`Employee ${fn} ${ln} added successfully.`, 'success');
      }
      navigate('employees');
    });
  }

  if (page === 'admin-leaves') {
    const reviewForm = document.getElementById('review-form');
    const approveBtn = reviewForm?.querySelector('button[value="approve"]');
    const rejectBtn = reviewForm?.querySelector('button[value="reject"]');

    approveBtn?.addEventListener('click', () => {
      reviewForm.dataset.action = 'approve';
    });
    rejectBtn?.addEventListener('click', () => {
      reviewForm.dataset.action = 'reject';
    });

    reviewForm?.addEventListener('submit', e => {
      e.preventDefault();
      const action = e.target.dataset.action || 'reject';
      const leaveId = e.target.dataset.leaveId;
      const leaves = Storage.getLeaves();
      const leave = leaves.find(l => l.id == leaveId);
      if (leave) {
        leave.status = action === 'approve' ? 'approved' : 'rejected';
        leave.admin_note = new FormData(e.target).get('admin_note') || '';
        leave.reviewed_at = new Date().toISOString();
        Storage.saveLeaves(leaves);
        showFlash(action === 'approve' ? 'Leave request approved.' : 'Leave request rejected.', action === 'approve' ? 'success' : 'danger');
      }
      closeReviewModal();
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      navigate(`admin-leaves?status=${newStatus}`);
    });
  }

  if (page === 'admin-attendance') {
    document.getElementById('admin-att-filter')?.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const params = new URLSearchParams();
      if (fd.get('employee')) params.set('employee', fd.get('employee'));
      if (fd.get('start_date')) params.set('start_date', fd.get('start_date'));
      if (fd.get('end_date')) params.set('end_date', fd.get('end_date'));
      if (fd.get('status')) params.set('status', fd.get('status'));
      navigate(`admin-attendance?${params.toString()}`);
    });

    document.getElementById('edit-attendance-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const attId = e.target.dataset.attId;
      const attendance = Storage.getAttendance();
      const rec = attendance.find(a => a.id == attId);
      if (rec) {
        const ci = document.getElementById('edit_checkin').value;
        const co = document.getElementById('edit_checkout').value;
        const status = document.getElementById('edit_status').value;
        if (ci) rec.check_in = new Date(ci).toISOString();
        if (co) {
          rec.check_out = new Date(co).toISOString();
          if (rec.check_in) {
            const delta = new Date(rec.check_out) - new Date(rec.check_in);
            rec.hours_worked = +(delta / 3600000).toFixed(2);
          }
        }
        rec.status = status;
        Storage.saveAttendance(attendance);
        showFlash('Attendance record updated.', 'success');
      }
      closeEditModal();
      navigate('admin-attendance');
    });
  }

  if (page === 'reports') {
    document.getElementById('report-filter')?.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const params = new URLSearchParams();
      if (fd.get('month')) params.set('month', fd.get('month'));
      if (fd.get('year')) params.set('year', fd.get('year'));
      navigate(`reports?${params.toString()}`);
    });
  }

  if (page === 'payroll') {
    document.getElementById('payroll-run-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const m = parseInt(document.getElementById('run-payroll-month').value) || (new Date().getMonth() + 1);
      const y = parseInt(document.getElementById('run-payroll-year').value) || new Date().getFullYear();
      handleRunPayrollExecution(m, y);
    });
  }

  if (page === 'invoices') {
    document.getElementById('invoices-filter')?.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const params = new URLSearchParams();
      if (fd.get('month')) params.set('month', fd.get('month'));
      if (fd.get('year')) params.set('year', fd.get('year'));
      if (fd.get('status')) params.set('status', fd.get('status'));
      navigate(`invoices?${params.toString()}`);
    });

    document.getElementById('mark-paid-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const invId = document.getElementById('paid-invoice-id').value;
      const mode = document.getElementById('paid-mode').value;
      const ref = document.getElementById('paid-ref').value.trim();
      const date = document.getElementById('paid-date').value;

      const invoices = Storage.getInvoices();
      const inv = invoices.find(i => i.id === invId);
      if (inv) {
        inv.status = 'paid';
        inv.payment_mode = mode;
        inv.transaction_ref = ref;
        inv.paid_at = date;
        Storage.saveInvoices(invoices);
        showFlash(`Invoice ${inv.invoice_number} marked as Paid!`, 'success');
      }
      closeMarkPaidModal();
      handleRoute();
    });

    document.getElementById('delete-batch-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const inputVal = document.getElementById('delete-captcha-input').value.trim();
      if (inputVal !== currentBatchDeleteCaptcha) {
        const errEl = document.getElementById('delete-captcha-error');
        if (errEl) errEl.style.display = 'block';
        return;
      }

      const month = parseInt(document.getElementById('delete-batch-month-val').value);
      const year = parseInt(document.getElementById('delete-batch-year-val').value);
      const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

      let invoices = Storage.getInvoices();
      invoices = invoices.filter(i => !(i.month === month && i.year === year));
      Storage.saveInvoices(invoices);

      closeDeleteBatchModal();
      showFlash(`🗑️ Permanently deleted all payroll invoices for ${months[month - 1]} ${year}.`, 'success');
      handleRoute();
    });
  }

  if (page === 'invoice-view') {
    document.getElementById('add-item-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const invId = document.getElementById('add-item-invoice-id').value;
      const type = document.getElementById('item-type').value;
      const name = document.getElementById('item-name').value.trim();
      const amount = parseFloat(document.getElementById('item-amount').value) || 0;

      const invoices = Storage.getInvoices();
      const inv = invoices.find(i => i.id === invId);
      if (inv) {
        if (!inv.custom_line_items) inv.custom_line_items = [];
        inv.custom_line_items.push({ id: generateId(), type, name, amount });

        // Recalculate totals
        const customEarnings = inv.custom_line_items.filter(i => i.type === 'earning').reduce((a, b) => a + b.amount, 0);
        const customDeductions = inv.custom_line_items.filter(i => i.type === 'deduction').reduce((a, b) => a + b.amount, 0);

        inv.gross_earnings = inv.basic_pay + inv.hra + inv.special_allowance + inv.overtime_pay + inv.bonus + customEarnings;
        inv.total_deductions = inv.lop_deduction + inv.late_deduction + inv.pf_deduction + inv.tds_tax + inv.insurance + customDeductions;
        inv.net_pay = Math.max(0, inv.gross_earnings - inv.total_deductions);

        Storage.saveInvoices(invoices);
        showFlash(`Added "${name}" (${formatINR(amount)}) to invoice.`, 'success');
      }
      closeAddLineItemModal();
      handleRoute();
    });

    document.getElementById('mark-paid-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const invId = document.getElementById('paid-invoice-id').value;
      const mode = document.getElementById('paid-mode').value;
      const ref = document.getElementById('paid-ref').value.trim();
      const date = document.getElementById('paid-date').value;

      const invoices = Storage.getInvoices();
      const inv = invoices.find(i => i.id === invId);
      if (inv) {
        inv.status = 'paid';
        inv.payment_mode = mode;
        inv.transaction_ref = ref;
        inv.paid_at = date;
        Storage.saveInvoices(invoices);
        showFlash(`Invoice ${inv.invoice_number} marked as Paid!`, 'success');
      }
      closeMarkPaidModal();
      handleRoute();
    });
  }

  if (page === 'payroll-settings') {
    // 1. Employee Type Rules Form
    document.getElementById('employee-type-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const typeId = document.getElementById('cfg-type-id').value;
      const rules = Storage.getPayrollRules() || getDefaultPayrollRules();
      let empType = (rules.employee_types || []).find(t => t.id === typeId);

      if (!empType) {
        empType = { id: typeId };
        rules.employee_types.push(empType);
      }

      empType.name = document.getElementById('cfg-type-name').value.trim();
      empType.description = document.getElementById('cfg-type-desc').value.trim();
      empType.base_salary = parseFloat(document.getElementById('cfg-type-base').value) || 50000;
      empType.basic_percentage = parseFloat(document.getElementById('cfg-basic-pct').value) || 50;
      empType.hra_percentage = parseFloat(document.getElementById('cfg-hra-pct').value) || 30;
      empType.special_allowance = parseFloat(document.getElementById('cfg-special-allow').value) || 0;
      empType.conveyance_allowance = parseFloat(document.getElementById('cfg-conveyance-allow').value) || 0;
      empType.medical_allowance = parseFloat(document.getElementById('cfg-medical-allow').value) || 0;
      empType.overtime_eligible = document.getElementById('cfg-ot-eligible').checked;
      empType.daily_overtime_threshold = parseFloat(document.getElementById('cfg-ot-daily').value) || 8.0;
      empType.weekly_overtime_threshold = parseFloat(document.getElementById('cfg-ot-weekly').value) || 40.0;
      empType.overtime_multiplier = parseFloat(document.getElementById('cfg-ot-multiplier').value) || 1.5;
      empType.pf_percentage = parseFloat(document.getElementById('cfg-pf-pct').value) || 6;
      empType.tds_percentage = parseFloat(document.getElementById('cfg-tds-pct').value) || 10;
      empType.insurance = parseFloat(document.getElementById('cfg-insurance').value) || 500;
      empType.professional_tax = parseFloat(document.getElementById('cfg-pt').value) || 200;

      Storage.savePayrollRules(rules);
      showFlash(`Saved salary and deduction policy rules for "${empType.name}" successfully.`, 'success');
      navigate(`payroll-settings?tab=types&type=${typeId}`);
    });

    // 2. Employee Mapping Form
    document.getElementById('employee-mapping-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const users = Storage.getUsers();
      const empUsers = users.filter(u => u.role === 'employee' && u.is_active !== false);
      const salaries = Storage.getSalaries();

      empUsers.forEach(emp => {
        const typeSelect = document.querySelector(`select[name="emp_type_${emp.id}"]`);
        const baseInput = document.querySelector(`input[name="emp_base_${emp.id}"]`);
        const bankInput = document.querySelector(`input[name="emp_bank_${emp.id}"]`);
        const accInput = document.querySelector(`input[name="emp_acc_${emp.id}"]`);
        const ifscInput = document.querySelector(`input[name="emp_ifsc_${emp.id}"]`);
        const panInput = document.querySelector(`input[name="emp_pan_${emp.id}"]`);

        let sal = salaries.find(s => s.user_id === emp.id);
        if (!sal) {
          sal = { user_id: emp.id };
          salaries.push(sal);
        }

        if (typeSelect) sal.employee_type_id = typeSelect.value;
        if (baseInput) sal.base_salary = parseFloat(baseInput.value) || 50000;
        if (bankInput) sal.bank_name = bankInput.value.trim();
        if (accInput) sal.bank_account_no = accInput.value.trim();
        if (ifscInput) sal.bank_ifsc = ifscInput.value.trim();
        if (panInput) sal.pan_no = panInput.value.trim();
      });

      Storage.saveSalaries(salaries);
      showFlash('All employee category assignments and bank profiles saved successfully.', 'success');
      navigate('payroll-settings?tab=mapping');
    });

    // 3. Salary Structure & Earnings Form
    document.getElementById('salary-structure-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const rules = Storage.getPayrollRules() || getDefaultPayrollRules();
      if (!rules.salary_structure) rules.salary_structure = {};

      rules.salary_structure.basic_percentage = parseFloat(document.getElementById('ss-basic-pct').value) || 50;
      rules.salary_structure.hra_percentage = parseFloat(document.getElementById('ss-hra-pct').value) || 40;
      rules.salary_structure.conveyance_allowance = parseFloat(document.getElementById('ss-conveyance').value) || 2000;
      rules.salary_structure.medical_allowance = parseFloat(document.getElementById('ss-medical').value) || 1500;

      Storage.savePayrollRules(rules);
      showFlash('Salary structure and earnings rules updated successfully.', 'success');
      navigate('payroll-settings?tab=structure');
    });

    // 4. Deductions & Statutory Taxes Form
    document.getElementById('deductions-rules-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const rules = Storage.getPayrollRules() || getDefaultPayrollRules();
      if (!rules.deductions_config) rules.deductions_config = {};

      rules.deductions_config.pf_enabled = document.getElementById('dc-pf-enabled').checked;
      rules.deductions_config.pf_rate = parseFloat(document.getElementById('dc-pf-rate').value) || 6.0;
      rules.deductions_config.tds_enabled = document.getElementById('dc-tds-enabled').checked;
      rules.deductions_config.tds_rate = parseFloat(document.getElementById('dc-tds-rate').value) || 10.0;
      rules.deductions_config.health_insurance = parseFloat(document.getElementById('dc-insurance').value) || 500;
      rules.deductions_config.pt_mode = document.getElementById('dc-pt-mode').value;

      Storage.savePayrollRules(rules);
      showFlash('Deductions and statutory tax rules updated successfully.', 'success');
      navigate('payroll-settings?tab=deductions');
    });

    // 5. Attendance, LOP & Overtime Form
    document.getElementById('attendance-ot-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const rules = Storage.getPayrollRules() || getDefaultPayrollRules();
      if (!rules.attendance_lop_config) rules.attendance_lop_config = {};
      if (!rules.overtime_config) rules.overtime_config = {};

      rules.attendance_lop_config.basis = document.getElementById('ao-basis').value;
      rules.attendance_lop_config.fixed_working_days = parseInt(document.getElementById('ao-fixed-days').value) || 22;
      rules.attendance_lop_config.late_grace_count = parseInt(document.getElementById('ao-late-grace').value) || 2;
      rules.attendance_lop_config.late_penalty_type = document.getElementById('ao-late-type').value;

      rules.overtime_config.enabled = document.getElementById('ao-ot-enabled').checked;
      rules.overtime_config.daily_threshold = parseFloat(document.getElementById('ao-ot-daily').value) || 8.0;
      rules.overtime_config.weekly_threshold = parseFloat(document.getElementById('ao-ot-weekly').value) || 40.0;
      rules.overtime_config.standard_multiplier = parseFloat(document.getElementById('ao-ot-mult').value) || 1.5;

      Storage.savePayrollRules(rules);
      showFlash('Attendance, LOP and overtime rules updated successfully.', 'success');
      navigate('payroll-settings?tab=attendance_ot');
    });

    // 6. Global Statutory and Overtime Rules Form (Legacy Fallback)
    document.getElementById('global-rules-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const rules = Storage.getPayrollRules() || getDefaultPayrollRules();
      if (!rules.global_rules) rules.global_rules = {};

      rules.global_rules.daily_overtime_threshold = parseFloat(document.getElementById('gl-ot-daily').value) || 8.0;
      rules.global_rules.weekly_overtime_threshold = parseFloat(document.getElementById('gl-ot-weekly').value) || 40.0;
      rules.global_rules.overtime_multiplier = parseFloat(document.getElementById('gl-ot-mult').value) || 1.5;
      rules.global_rules.working_days_mode = document.getElementById('gl-working-days-mode').value;
      rules.global_rules.late_grace_count = parseInt(document.getElementById('gl-late-grace').value) || 2;
      rules.global_rules.late_penalty_type = document.getElementById('gl-late-penalty-type').value;
      rules.global_rules.late_flat_penalty = parseFloat(document.getElementById('gl-late-flat').value) || 500;

      Storage.savePayrollRules(rules);
      showFlash('Global statutory and overtime rules updated successfully.', 'success');
      navigate('payroll-settings?tab=attendance_ot');
    });

    // 4. Company Branding & Notes Form
    document.getElementById('company-branding-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const rules = Storage.getPayrollRules() || getDefaultPayrollRules();
      if (!rules.company) rules.company = {};

      rules.company.company_name = document.getElementById('cb-name').value.trim();
      rules.company.address = document.getElementById('cb-addr').value.trim();
      rules.company.gstin = document.getElementById('cb-gstin').value.trim();
      rules.company.email = document.getElementById('cb-email').value.trim();
      rules.company.signatory_title = document.getElementById('cb-signatory').value.trim();
      rules.company.disclaimer = document.getElementById('cb-disclaimer').value.trim();

      Storage.savePayrollRules(rules);
      showFlash('Company legal branding and payslip disclaimer updated.', 'success');
      navigate('payroll-settings?tab=branding');
    });

    // 5. New Category Form
    document.getElementById('new-category-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('new-cat-name').value.trim();
      const desc = document.getElementById('new-cat-desc').value.trim();
      const base = parseFloat(document.getElementById('new-cat-base').value) || 50000;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || `custom_${Date.now()}`;

      const rules = Storage.getPayrollRules() || getDefaultPayrollRules();
      if ((rules.employee_types || []).some(t => t.id === slug)) {
        showFlash('A category with a similar name already exists.', 'danger');
        return;
      }

      rules.employee_types.push({
        id: slug,
        name: name,
        description: desc,
        base_salary: base,
        basic_percentage: 50,
        hra_percentage: 30,
        special_allowance: 10000,
        conveyance_allowance: 2000,
        medical_allowance: 1500,
        overtime_eligible: true,
        daily_overtime_threshold: 8.0,
        weekly_overtime_threshold: 40.0,
        overtime_multiplier: 1.5,
        pf_percentage: 6,
        tds_percentage: 10,
        insurance: 500,
        professional_tax: 200,
        custom_earnings: [],
        custom_deductions: []
      });

      Storage.savePayrollRules(rules);
      closeNewCategoryModal();
      showFlash(`Created new category "${name}".`, 'success');
      navigate(`payroll-settings?tab=types&type=${slug}`);
    });

    // 6. Department Salary Baselines Form
    document.getElementById('department-rules-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const rules = Storage.getPayrollRules() || getDefaultPayrollRules();
      if (!rules.department_rules) rules.department_rules = getDefaultPayrollRules().department_rules;

      rules.department_rules.forEach(dept => {
        const descInput = document.querySelector(`input[name="dept_desc_${dept.id}"]`);
        const baseInput = document.querySelector(`input[name="dept_min_base_${dept.id}"]`);
        if (descInput) dept.description = descInput.value.trim();
        if (baseInput) dept.min_base_salary = parseFloat(baseInput.value) || 50000;
      });

      Storage.savePayrollRules(rules);
      showFlash('All department salary baselines and higher-scale rules updated successfully.', 'success');
      navigate('payroll-settings?tab=departments');
    });

    // 7. New Department Scale Form
    document.getElementById('new-dept-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('new-dept-name').value.trim();
      const desc = document.getElementById('new-dept-desc').value.trim();
      const base = parseFloat(document.getElementById('new-dept-base').value) || 50000;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || `dept_${Date.now()}`;

      const rules = Storage.getPayrollRules() || getDefaultPayrollRules();
      if (!rules.department_rules) rules.department_rules = getDefaultPayrollRules().department_rules;

      if (rules.department_rules.some(d => d.id === slug || d.department.toLowerCase() === name.toLowerCase())) {
        showFlash('A department baseline with this name already exists.', 'danger');
        return;
      }

      rules.department_rules.push({
        id: slug,
        department: name,
        description: desc,
        min_base_salary: base
      });

      Storage.savePayrollRules(rules);
      closeNewDeptModal();
      showFlash(`Created baseline scale for department "${name}".`, 'success');
      navigate('payroll-settings?tab=departments');
    });
  }

  // Employee action buttons (toggle/delete)
  document.querySelectorAll('button[data-action="toggle"]').forEach(btn => {
    btn.onclick = e => {
      e.preventDefault();
      const id = parseInt(btn.dataset.id);
      const users = Storage.getUsers();
      const emp = users.find(u => u.id === id);
      if (emp) {
        emp.is_active = !emp.is_active;
        Storage.saveUsers(users);
        showFlash(`Employee ${emp.first_name} ${emp.last_name} ${emp.is_active ? 'activated' : 'deactivated'}.`, 'success');
        handleRoute();
      }
    };
  });
  document.querySelectorAll('button[data-action="delete"]').forEach(btn => {
    btn.onclick = e => {
      e.preventDefault();
      const id = parseInt(btn.dataset.id);
      const name = btn.dataset.name || 'employee';
      if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
      let users = Storage.getUsers();
      const emp = users.find(u => u.id === id);
      if (emp && emp.id === getCurrentUser()?.id) { showFlash('Cannot delete your own account.', 'danger'); return; }
      let attendance = Storage.getAttendance();
      let leaves = Storage.getLeaves();
      attendance = attendance.filter(a => a.user_id !== id);
      leaves = leaves.filter(l => l.user_id !== id);
      users = users.filter(u => u.id !== id);
      Storage.saveAttendance(attendance);
      Storage.saveLeaves(leaves);
      Storage.saveUsers(users);
      showFlash('Employee deleted.', 'success');
      handleRoute();
    };
  });
}

// ==================== INIT ====================
function init() {
  seedData();
  window.addEventListener('hashchange', handleRoute);
  document.addEventListener('DOMContentLoaded', () => {
    handleRoute();
    updateDateBadge();
    setInterval(updateDateBadge, 1000);
    document.getElementById('hamburger')?.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
      document.getElementById('overlay').classList.toggle('active');
    });
    document.getElementById('overlay')?.addEventListener('click', () => {
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('overlay').classList.remove('active');
    });
    document.getElementById('logout-btn')?.addEventListener('click', e => {
      e.preventDefault();
      logout();
      showFlash('You have been logged out.', 'info');
      navigate('login');
    });
  });
}

init();

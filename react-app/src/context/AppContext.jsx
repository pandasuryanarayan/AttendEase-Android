// src/context/AppContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialUsers, generateInitialAttendance, generateInitialLeaves, formatDateStr } from '../data/initialData';
import { getDefaultPayrollRules, getDefaultSalaries, generateMonthlyInvoicesList, calculatePayroll } from '../utils/payrollEngine';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // ─── LocalStorage Persistence Setup ─────────────────────────────────────
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('attendease_users');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [attendance, setAttendance] = useState(() => {
    const saved = localStorage.getItem('attendease_attendance');
    return saved ? JSON.parse(saved) : generateInitialAttendance();
  });

  const [leaves, setLeaves] = useState(() => {
    const saved = localStorage.getItem('attendease_leaves');
    return saved ? JSON.parse(saved) : generateInitialLeaves();
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('attendease_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [payrollRules, setPayrollRules] = useState(() => {
    const saved = localStorage.getItem('eas_payroll_rules');
    return saved ? JSON.parse(saved) : getDefaultPayrollRules();
  });

  const [salaries, setSalaries] = useState(() => {
    const saved = localStorage.getItem('eas_salaries');
    return saved ? JSON.parse(saved) : getDefaultSalaries();
  });

  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem('eas_invoices');
    if (saved) return JSON.parse(saved);
    // Default seed invoices for July (Paid) and August (Approved)
    const initSalaries = getDefaultSalaries();
    const initRules = getDefaultPayrollRules();
    const initUsers = initialUsers;
    const initAtt = generateInitialAttendance();
    const initLvs = generateInitialLeaves();

    let seeded = generateMonthlyInvoicesList(7, 2026, initUsers, initAtt, initLvs, initSalaries, initRules, []);
    seeded.forEach(i => {
      i.status = 'paid';
      i.payment_mode = 'NEFT / Direct Bank Transfer';
      i.transaction_ref = 'TXN' + Math.floor(10000000 + Math.random() * 90000000);
      i.paid_at = '2026-07-31';
    });
    seeded = generateMonthlyInvoicesList(8, 2026, initUsers, initAtt, initLvs, initSalaries, initRules, seeded);
    return seeded;
  });

  const [flashes, setFlashes] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('attendease_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('attendease_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('attendease_leaves', JSON.stringify(leaves));
  }, [leaves]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('attendease_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('attendease_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('eas_payroll_rules', JSON.stringify(payrollRules));
  }, [payrollRules]);

  useEffect(() => {
    localStorage.setItem('eas_salaries', JSON.stringify(salaries));
  }, [salaries]);

  useEffect(() => {
    localStorage.setItem('eas_invoices', JSON.stringify(invoices));
  }, [invoices]);

  // ─── Flash Notifications ────────────────────────────────────────────────
  const addFlash = (message, category = 'info') => {
    const id = Date.now() + Math.random();
    setFlashes((prev) => [...prev, { id, message, category }]);
    setTimeout(() => {
      removeFlash(id);
    }, 5000);
  };

  const removeFlash = (id) => {
    setFlashes((prev) => prev.filter((f) => f.id !== id));
  };

  // ─── Authentication ────────────────────────────────────────────────────
  const login = (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail && u.is_active);

    if (user && user.password === password) {
      setCurrentUser(user);
      addFlash(`Welcome back, ${user.first_name}!`, 'success');
      return true;
    }
    addFlash('Invalid email or password.', 'danger');
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    addFlash('You have been logged out.', 'info');
  };

  const register = (data) => {
    const cleanEmail = data.email.trim().toLowerCase();
    if (users.find((u) => u.email.toLowerCase() === cleanEmail)) {
      addFlash('Email already registered.', 'danger');
      return false;
    }

    const newUser = {
      id: Date.now(),
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      email: cleanEmail,
      password: data.password,
      role: 'employee',
      department: data.department || '',
      position: data.position || '',
      phone: '',
      hire_date: formatDateStr(new Date()),
      is_active: true,
    };

    setUsers((prev) => [...prev, newUser]);
    addFlash('Registration successful! Please log in.', 'success');
    return true;
  };

  // ─── Check In / Check Out ──────────────────────────────────────────────
  const checkIn = () => {
    if (!currentUser) return;
    const todayStr = formatDateStr(new Date());
    const existing = attendance.find((a) => a.user_id === currentUser.id && a.date === todayStr);

    if (existing) {
      addFlash('You have already checked in today.', 'warning');
      return;
    }

    const now = new Date();
    const lateThreshold = new Date();
    lateThreshold.setHours(9, 15, 0, 0);

    const status = now > lateThreshold ? 'late' : 'present';

    const newRecord = {
      id: Date.now(),
      user_id: currentUser.id,
      date: todayStr,
      check_in: now.toISOString(),
      check_out: null,
      hours_worked: null,
      status: status,
      notes: '',
    };

    setAttendance((prev) => [newRecord, ...prev]);
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    addFlash(`Checked in successfully at ${timeStr}.`, 'success');
  };

  const checkOut = () => {
    if (!currentUser) return;
    const todayStr = formatDateStr(new Date());
    const existing = attendance.find((a) => a.user_id === currentUser.id && a.date === todayStr);

    if (!existing) {
      addFlash('You have not checked in today.', 'warning');
      return;
    }

    if (existing.check_out) {
      addFlash('You have already checked out today.', 'warning');
      return;
    }

    const now = new Date();
    const checkInTime = new Date(existing.check_in);
    const diffMs = now - checkInTime;
    const hoursWorked = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

    setAttendance((prev) =>
      prev.map((rec) =>
        rec.id === existing.id
          ? {
              ...rec,
              check_out: now.toISOString(),
              hours_worked: hoursWorked,
            }
          : rec
      )
    );

    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    addFlash(`Checked out successfully at ${timeStr}. Hours worked: ${hoursWorked.toFixed(2)}h`, 'success');
  };

  // ─── Leave Requests ───────────────────────────────────────────────────
  const requestLeave = (data) => {
    if (!currentUser) return false;

    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const newLeave = {
      id: Date.now(),
      user_id: currentUser.id,
      leave_type: data.leave_type,
      start_date: data.start_date,
      end_date: data.end_date,
      days_requested: diffDays,
      reason: data.reason || '',
      status: 'pending',
      admin_note: '',
      reviewed_at: null,
      created_at: formatDateStr(new Date()),
    };

    setLeaves((prev) => [newLeave, ...prev]);
    addFlash('Leave request submitted successfully.', 'success');
    return true;
  };

  const reviewLeave = (leaveId, action, adminNote = '') => {
    setLeaves((prev) =>
      prev.map((l) =>
        l.id === leaveId
          ? {
              ...l,
              status: action === 'approve' ? 'approved' : 'rejected',
              admin_note: adminNote,
              reviewed_at: new Date().toISOString(),
            }
          : l
      )
    );
    addFlash(`Leave request ${action === 'approve' ? 'approved' : 'rejected'}.`, action === 'approve' ? 'success' : 'info');
  };

  const cancelLeave = (leaveId) => {
    const target = leaves.find((l) => l.id === leaveId);
    if (!target) return false;
    if (target.status !== 'pending') {
      addFlash('Cannot cancel leave request once it is reviewed by admin.', 'warning');
      return false;
    }
    setLeaves((prev) => prev.filter((l) => l.id !== leaveId));
    addFlash('Leave request canceled successfully.', 'info');
    return true;
  };

  // ─── Employee Management (Admin) ──────────────────────────────────────
  const addEmployee = (data) => {
    const cleanEmail = data.email.trim().toLowerCase();
    if (users.find((u) => u.email.toLowerCase() === cleanEmail)) {
      addFlash('Email already exists.', 'danger');
      return false;
    }

    const newEmp = {
      id: Date.now(),
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      email: cleanEmail,
      password: data.password,
      role: 'employee',
      department: data.department || '',
      position: data.position || '',
      phone: data.phone || '',
      hire_date: data.hire_date || formatDateStr(new Date()),
      is_active: true,
    };

    setUsers((prev) => [...prev, newEmp]);
    addFlash(`Employee ${newEmp.first_name} ${newEmp.last_name} added successfully.`, 'success');
    return true;
  };

  const editEmployee = (empId, data) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === empId) {
          return {
            ...u,
            first_name: data.first_name.trim(),
            last_name: data.last_name.trim(),
            department: data.department || '',
            position: data.position || '',
            phone: data.phone || '',
            hire_date: data.hire_date || u.hire_date,
            password: data.password ? data.password : u.password,
          };
        }
        return u;
      })
    );
    addFlash('Employee updated successfully.', 'success');
    return true;
  };

  const toggleEmployeeStatus = (empId) => {
    let newStatus = true;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === empId) {
          newStatus = !u.is_active;
          return { ...u, is_active: newStatus };
        }
        return u;
      })
    );
    addFlash(`Employee status ${newStatus ? 'activated' : 'deactivated'}.`, 'success');
  };

  const deleteEmployee = (empId) => {
    if (currentUser && currentUser.id === empId) {
      addFlash('Cannot delete your own account.', 'danger');
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== empId));
    setAttendance((prev) => prev.filter((a) => a.user_id !== empId));
    setLeaves((prev) => prev.filter((l) => l.user_id !== empId));
    addFlash('Employee deleted.', 'success');
  };

  // ─── Attendance Management (Admin Edit) ──────────────────────────────
  const editAttendanceRecord = (attId, data) => {
    setAttendance((prev) =>
      prev.map((a) => {
        if (a.id === attId) {
          let hours = a.hours_worked;
          if (data.check_in && data.check_out) {
            const inDt = new Date(data.check_in);
            const outDt = new Date(data.check_out);
            if (outDt > inDt) {
              hours = Math.round(((outDt - inDt) / (1000 * 60 * 60)) * 100) / 100;
            }
          }
          return {
            ...a,
            check_in: data.check_in ? new Date(data.check_in).toISOString() : a.check_in,
            check_out: data.check_out ? new Date(data.check_out).toISOString() : a.check_out,
            status: data.status,
            hours_worked: hours,
          };
        }
        return a;
      })
    );
    addFlash('Attendance record updated.', 'success');
  };

  // ─── Payroll Engine Operations ────────────────────────────────────────
  const savePayrollRules = (newRules) => {
    setPayrollRules(newRules);
    addFlash('Payroll policy rules saved successfully.', 'success');
  };

  const saveSalaries = (newSalaries) => {
    setSalaries(newSalaries);
    addFlash('Employee salary mapping updated.', 'success');
  };

  const runMonthlyPayroll = (month, year) => {
    const updated = generateMonthlyInvoicesList(month, year, users, attendance, leaves, salaries, payrollRules, invoices);
    setInvoices(updated);
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    addFlash(`⚡ Monthly payroll invoices for ${months[month - 1]} ${year} generated successfully!`, 'success');
  };

  const markInvoiceAsPaid = (invoiceId, mode, ref, date) => {
    setInvoices((prev) =>
      prev.map((i) => {
        if (String(i.id) === String(invoiceId)) {
          return {
            ...i,
            status: 'paid',
            payment_mode: mode,
            transaction_ref: ref,
            paid_at: date,
          };
        }
        return i;
      })
    );
    addFlash('Invoice marked as Paid & Settled successfully!', 'success');
  };

  const deleteMonthlyInvoicesBatch = (month, year) => {
    setInvoices((prev) => prev.filter((i) => !(i.month === month && i.year === year)));
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    addFlash(`🗑️ Permanently deleted all payroll invoices for ${months[month - 1]} ${year}.`, 'success');
  };

  const updateInvoiceCustomItems = (invoiceId, items) => {
    setInvoices((prev) =>
      prev.map((i) => {
        if (String(i.id) === String(invoiceId)) {
          const customTotal = items.reduce((a, b) => a + (b.amount || 0), 0);
          const newGross = i.gross_earnings + customTotal;
          const newNet = Math.max(0, newGross - i.total_deductions);
          return {
            ...i,
            custom_line_items: items,
            gross_earnings: newGross,
            net_pay: newNet,
          };
        }
        return i;
      })
    );
    addFlash('Invoice line items updated.', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        users,
        attendance,
        leaves,
        currentUser,
        payrollRules,
        salaries,
        invoices,
        flashes,
        sidebarOpen,
        setSidebarOpen,
        login,
        logout,
        register,
        addFlash,
        removeFlash,
        checkIn,
        checkOut,
        requestLeave,
        reviewLeave,
        cancelLeave,
        addEmployee,
        editEmployee,
        toggleEmployeeStatus,
        deleteEmployee,
        editAttendanceRecord,
        savePayrollRules,
        saveSalaries,
        runMonthlyPayroll,
        markInvoiceAsPaid,
        deleteMonthlyInvoicesBatch,
        updateInvoiceCustomItems,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

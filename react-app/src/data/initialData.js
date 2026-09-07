// src/data/initialData.js

export const initialUsers = [
  {
    id: 1,
    first_name: 'Admin',
    last_name: 'User',
    email: 'admin@company.com',
    password: 'admin123',
    role: 'admin',
    department: 'Management',
    position: 'System Administrator',
    phone: '+1 555-0190',
    hire_date: '2022-01-01',
    is_active: true,
  },
  {
    id: 2,
    first_name: 'Alice',
    last_name: 'Johnson',
    email: 'alice@company.com',
    password: 'employee123',
    role: 'employee',
    department: 'Engineering',
    position: 'Senior Developer',
    phone: '+1 555-0191',
    hire_date: '2023-01-15',
    is_active: true,
  },
  {
    id: 3,
    first_name: 'Bob',
    last_name: 'Smith',
    email: 'bob@company.com',
    password: 'employee123',
    role: 'employee',
    department: 'Engineering',
    position: 'Junior Developer',
    phone: '+1 555-0192',
    hire_date: '2023-03-20',
    is_active: true,
  },
  {
    id: 4,
    first_name: 'Carol',
    last_name: 'Williams',
    email: 'carol@company.com',
    password: 'employee123',
    role: 'employee',
    department: 'Marketing',
    position: 'Marketing Manager',
    phone: '+1 555-0193',
    hire_date: '2023-05-10',
    is_active: true,
  },
  {
    id: 5,
    first_name: 'David',
    last_name: 'Brown',
    email: 'david@company.com',
    password: 'employee123',
    role: 'employee',
    department: 'HR',
    position: 'HR Specialist',
    phone: '+1 555-0194',
    hire_date: '2023-06-01',
    is_active: true,
  },
  {
    id: 6,
    first_name: 'Eve',
    last_name: 'Davis',
    email: 'eve@company.com',
    password: 'employee123',
    role: 'employee',
    department: 'Finance',
    position: 'Financial Analyst',
    phone: '+1 555-0195',
    hire_date: '2023-09-12',
    is_active: true,
  },
];

// Helper to format date YYYY-MM-DD
export function formatDateStr(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Generate realistic attendance records for last 30 days
export function generateInitialAttendance() {
  const records = [];
  let idCounter = 1;
  const today = new Date();
  const employees = initialUsers.filter((u) => u.role === 'employee');

  for (let i = 30; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

    const dateStr = formatDateStr(d);

    employees.forEach((emp) => {
      // Deterministic randomness based on emp.id and date offset
      const pseudoRand = (emp.id * 17 + i * 13) % 100 / 100;
      if (pseudoRand < 0.08) return; // Skip (absent without record or leave)

      const isLate = pseudoRand > 0.75;
      const startHour = isLate ? 9 : 8;
      const startMinute = isLate ? Math.floor(20 + pseudoRand * 20) : Math.floor(pseudoRand * 45);
      const hoursWorked = Math.round((7.5 + pseudoRand * 1.5) * 100) / 100;

      const checkInDate = new Date(d);
      checkInDate.setHours(startHour, startMinute, 0);

      const checkOutDate = new Date(checkInDate);
      checkOutDate.setMinutes(checkInDate.getMinutes() + Math.round(hoursWorked * 60));

      const status = isLate ? 'late' : 'present';

      // For today, leave check_out open for some users unless i > 0
      const isToday = i === 0;
      let checkOutIso = checkOutDate.toISOString();
      let hrs = hoursWorked;
      if (isToday) {
        if (emp.id === 2) {
          // Alice checked in today, no checkout yet
          checkOutIso = null;
          hrs = null;
        } else if (emp.id === 3) {
          // Bob not checked in today yet
          return;
        }
      }

      records.push({
        id: idCounter++,
        user_id: emp.id,
        date: dateStr,
        check_in: checkInDate.toISOString(),
        check_out: checkOutIso,
        hours_worked: hrs,
        status: status,
        notes: '',
      });
    });
  }

  return records;
}

export function generateInitialLeaves() {
  const today = new Date();

  const addDays = (num) => {
    const d = new Date(today);
    d.setDate(today.getDate() + num);
    return formatDateStr(d);
  };

  return [
    {
      id: 1,
      user_id: 2, // Alice
      leave_type: 'vacation',
      start_date: addDays(5),
      end_date: addDays(7),
      days_requested: 3,
      reason: 'Annual family vacation',
      status: 'approved',
      admin_note: 'Approved. Enjoy your vacation!',
      reviewed_at: new Date().toISOString(),
      created_at: addDays(-2),
    },
    {
      id: 2,
      user_id: 3, // Bob
      leave_type: 'sick',
      start_date: addDays(-3),
      end_date: addDays(-2),
      days_requested: 2,
      reason: 'Fever and flu',
      status: 'approved',
      admin_note: 'Get well soon.',
      reviewed_at: addDays(-3),
      created_at: addDays(-4),
    },
    {
      id: 3,
      user_id: 4, // Carol
      leave_type: 'personal',
      start_date: addDays(10),
      end_date: addDays(10),
      days_requested: 1,
      reason: 'Personal errands and bank work',
      status: 'pending',
      admin_note: '',
      reviewed_at: null,
      created_at: addDays(-1),
    },
    {
      id: 4,
      user_id: 5, // David
      leave_type: 'vacation',
      start_date: addDays(15),
      end_date: addDays(20),
      days_requested: 6,
      reason: 'Trip to Europe',
      status: 'pending',
      admin_note: '',
      reviewed_at: null,
      created_at: addDays(-1),
    },
    {
      id: 5,
      user_id: 6, // Eve
      leave_type: 'sick',
      start_date: addDays(-1),
      end_date: addDays(-1),
      days_requested: 1,
      reason: 'Dental appointment',
      status: 'rejected',
      admin_note: 'Short notice, please reschedule if non-emergency.',
      reviewed_at: addDays(-1),
      created_at: addDays(-2),
    },
  ];
}

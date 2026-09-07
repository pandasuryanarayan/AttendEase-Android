# AttendEase — Flask Employee Attendance & Payroll System

A modern, full-featured **Flask & SQLite** web application for employee attendance tracking, leave management, monthly analytics reports, and a complete **Payroll Calculation Engine & Salary Payment System**.

---

## 🚀 Features

### 👤 Employee Features
- **Dashboard Overview**: View live attendance statistics, check-in status, and recent activity log.
- **One-Click Check-In & Check-Out**: Quick timestamp logging with automatic status determination (*Present* vs. *Late*) and working hours calculation.
- **Attendance History**: View personal monthly attendance records filtered by month and year.
- **Leave Requests**: Submit time-off requests (*Vacation*, *Sick Leave*, *Personal*, *Other*) and monitor approval status.
- **My Payslips & Tax Invoices**: Personal monthly payslips portal (`/my-payslips`) displaying YTD gross earnings, net salary received, overtime hours, TDS tax paid, and printable invoice documents.

### 🛡️ Admin Features
- **Admin Dashboard**: Live KPI overview showing today's present, late, absent, and on-leave metrics.
- **Employee Management**: Create, edit, activate/deactivate, and delete employee accounts with standardized 3-column action card layout.
- **Attendance Management**: View all employee attendance records with multi-criteria filtering (*Employee*, *Date Range*, *Status*, *Month/Year*) and edit check-in/out timestamps.
- **Leave Request Review**: Process pending employee leave requests with optional reviewer notes.
- **Analytics & Reports**: Monthly breakdown reports with employee attendance rates, summary KPI cards, printable reports (`window.print()`), and a table summary total footer.
- **Run Monthly Payroll Engine**: Batch payroll execution console (`/admin/payroll`) with operational checks, active engine status indicators, and month/year selection.
- **Payroll Invoices & Register**: 12-column employee salary register table (`/admin/invoices`) with month/year/status filters, 4 KPI summary cards (*Total Net Payout*, *Settled/Paid*, *Overtime Paid*, *TDS Tax Withheld*), tfoot totals row, **Mark Paid Modal** (with auto-prefilled `TXN...` reference IDs), and **Delete Batch Modal** (with a randomized 4-digit security captcha verification challenge).
- **Payroll Policy & Rules Console (7 Tabs)**:
  1. `💵 1. Salary & Earnings Structure`: Basic %, HRA %, Conveyance, Medical, and Special Allowance residual formula callout.
  2. `🛡️ 2. Deductions & Statutory Taxes`: PF %, TDS withholding %, Group Health Insurance, and Professional Tax (PT) slab rules.
  3. `⏱️ 3. Attendance, LOP & Overtime`: LOP formula, late arrival grace count, late penalties, and dual threshold Overtime engine (>8h/day, >40h/week, 1.5x multiplier).
  4. `🔀 4. Priority Cascade & Overrides`: 4-tier priority cascade (Employee > Position > Department Baseline > Universal Defaults) and department minimum base scales.
  5. `👔 5. Category Profiles`: Category chips, component splits, and employee category & salary mapping table.
  6. `🧪 6. Test Simulation & Preview`: Interactive dry-run simulator for testing draft payroll calculations before activation.
  7. `🏢 7. Payslip Branding & Entity`: Legal entity name, corporate address, GSTIN, contact email, signatory title, and certificate disclaimer.
- **Printable Tax Invoice View**: Official A4 printable tax invoice & salary certificate (`/invoice/<id>`) with company branding, employee meta grid, 6-metric attendance pill bar, side-by-side earnings vs deductions breakdown, number-to-words banner (Lakhs/Crores system), signatory seal, and custom line item modal.

---

## 🛠️ Technology Stack

- **Backend Framework**: [Flask](https://flask.palletsprojects.com/) (Python 3)
- **Database & ORM**: SQLite via [Flask-SQLAlchemy](https://flask-sqlalchemy.palletsprojects.com/)
- **Payroll Engine**: Python calculation module (`payroll_engine.py`) implementing `calculate_payroll()`, `format_inr()`, and `number_to_words_inr()`.
- **Security & Session**: Werkzeug Security (`generate_password_hash`, `check_password_hash`) & Flask Session
- **Frontend & Styling**: Jinja2 HTML Templates & Vanilla CSS Design System with `Plus Jakarta Sans` typography, HSL color tokens, and responsive layout.

---

## 📁 Directory Structure

```text
flask-app/
├── app.py                   # Application entry point, routes & business logic
├── models.py                # Database schemas (User, Attendance, LeaveRequest, Salary, PayrollRules, PayrollInvoice)
├── payroll_engine.py        # Python payroll calculation engine & INR formatting utilities
├── Payment.md               # Payroll architecture & payment engine documentation
├── instance/
│   └── attendance.db        # SQLite database (auto-created on first run)
├── static/
│   └── css/
│       └── style.css        # Core CSS design system and components
├── templates/
│   ├── base.html            # Main layout with sidebar & topbar navigation
│   ├── login.html           # Authentication page
│   ├── register.html        # New employee registration
│   ├── admin_dashboard.html # Admin analytics overview
│   ├── employee_dashboard.html # Employee portal & check-in widget
│   ├── employees.html       # Employee management cards
│   ├── employee_form.html  # Create/Edit employee form
│   ├── attendance.html     # Attendance records & filtering
│   ├── leaves.html         # Leave requests & review modal
│   ├── reports.html        # Monthly breakdown & printable reports
│   ├── payroll.html        # Run monthly payroll execution page
│   ├── invoices.html       # Payroll invoices & 12-column salary register
│   ├── payroll_settings.html # 7-tab payroll rules & policy configuration console
│   ├── my_payslips.html    # Employee personal payslip history portal
│   └── invoice_view.html   # Printable A4 tax invoice & salary payslip document
└── README.md
```

---

## 📦 Setup & Installation

### 1. Prerequisites
- **Python 3.8+** installed on your system.

### 2. Quick Setup

```bash
# Navigate to project directory
cd flask-app

# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install required dependencies
pip install flask flask-sqlalchemy werkzeug

# Run the application
python3 app.py
```

Open your browser and navigate to: **`http://localhost:5000`**

> 💡 **Note**: The SQLite database (`attendance.db`) and seed demo data (Admin user, demo employees, check-ins, leave requests, salaries, and invoices) are automatically initialized on the first run.

---

## 🔑 Default Login Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@company.com` | `admin123` |
| **Employee** | `alice@company.com` | `employee123` |
| **Employee** | `bob@company.com` | `employee123` |
| **Employee** | `carol@company.com` | `employee123` |

---

## 🗺️ Application Endpoints

| Route | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/` | GET | Public | Redirects to dashboard if logged in, else login page |
| `/login` | GET, POST | Public | User login authentication |
| `/register` | GET, POST | Public | Employee registration |
| `/logout` | GET | Authenticated | Clears user session |
| `/admin` | GET | Admin | Admin overview dashboard |
| `/dashboard` | GET | Employee | Employee portal & check-in widget |
| `/checkin` | POST | Employee | Log check-in timestamp |
| `/checkout` | POST | Employee | Log check-out timestamp & calculate total hours |
| `/admin/employees` | GET | Admin | View employee directory |
| `/admin/employees/add` | GET, POST | Admin | Add new employee account |
| `/admin/employees/<id>/edit` | GET, POST | Admin | Edit employee profile details |
| `/admin/employees/<id>/toggle` | POST | Admin | Activate / Deactivate employee account |
| `/admin/employees/<id>/delete` | POST | Admin | Delete employee account |
| `/attendance/history` | GET | Employee | Personal attendance history |
| `/admin/attendance` | GET | Admin | View & filter all employee attendance logs |
| `/admin/attendance/<id>/edit` | POST | Admin | Edit check-in/out times & status for a record |
| `/leave/request` | GET, POST | Employee | Submit & view personal leave requests |
| `/admin/leaves` | GET | Admin | Review pending leave requests |
| `/admin/leaves/<id>/action` | POST | Admin | Approve or reject a leave request with notes |
| `/admin/reports` | GET | Admin | Monthly attendance breakdown report & print view |
| `/admin/payroll` | GET | Admin | Run Monthly Payroll execution page |
| `/admin/payroll/run` | POST | Admin | Execute batch monthly payroll engine |
| `/admin/invoices` | GET | Admin | Payroll Invoices & 12-column salary register |
| `/admin/invoices/<id>/mark-paid` | POST | Admin | Record salary disbursement with payment mode & TXN ref |
| `/admin/invoices/delete-batch` | POST | Admin | Permanent batch deletion with 4-digit captcha |
| `/admin/invoices/<id>/add-line-item` | POST | Admin | Add custom earning or deduction line item to invoice |
| `/admin/payroll-settings` | GET, POST | Admin | 7-tab payroll rules & policy configuration console |
| `/my-payslips` | GET | Employee | Personal monthly payslips history portal |
| `/invoice/<id>` | GET | All | Official A4 Tax Invoice & Salary Payslip view |
| `/invoice/<id>/print` | GET | All | Print/download PDF trigger view (`window.print()`) |